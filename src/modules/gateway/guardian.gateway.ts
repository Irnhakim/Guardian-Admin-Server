import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { OnEvent } from '@nestjs/event-emitter';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/guardian',
})
export class GuardianGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(GuardianGateway.name);
  // Map parentId → Set of socket IDs
  private parentSockets = new Map<string, Set<string>>();
  // Map deviceId → socket ID
  private deviceSockets = new Map<string, string>();

  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService
  ) {}

  async handleConnection(client: Socket) {
    try {
      const deviceIdQuery = client.handshake.query?.deviceId as string;
      const roleQuery = client.handshake.query?.role as string;

      // Handle Device connection
      if (roleQuery === 'DEVICE' && deviceIdQuery) {
        client.data.role = 'DEVICE';
        client.data.deviceId = deviceIdQuery;
        
        this.deviceSockets.set(deviceIdQuery, client.id);
        client.join(`device:${deviceIdQuery}`);
        
        // Update device status to ONLINE in DB immediately
        await this.updateDeviceStatus(deviceIdQuery, 'ONLINE');
        
        this.logger.log(`Device connected: ${client.id} (Device ID: ${deviceIdQuery})`);
        return;
      }

      // Handle Parent/Dashboard connection
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.split(' ')[1];

      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });

      client.data.userId = payload.sub;
      client.data.role = payload.role;

      // Add to parent room
      if (payload.role === 'PARENT' || payload.role === 'ADMIN') {
        if (!this.parentSockets.has(payload.sub)) {
          this.parentSockets.set(payload.sub, new Set());
        }
        this.parentSockets.get(payload.sub)!.add(client.id);
        client.join(`parent:${payload.sub}`);
      }

      this.logger.log(`Client connected: ${client.id} (${payload.role})`);
    } catch {
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    if (client.data?.role === 'DEVICE' && client.data?.deviceId) {
      const deviceId = client.data.deviceId;
      this.deviceSockets.delete(deviceId);
      
      // Update device status to OFFLINE in DB immediately since the socket dropped
      await this.updateDeviceStatus(deviceId, 'OFFLINE');
      this.logger.log(`Device disconnected: ${client.id} (Device ID: ${deviceId})`);
      return;
    }

    const userId = client.data?.userId;
    if (userId && this.parentSockets.has(userId)) {
      this.parentSockets.get(userId)!.delete(client.id);
    }
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  private async updateDeviceStatus(deviceId: string, status: 'ONLINE' | 'OFFLINE') {
    try {
      const device = await this.prisma.device.update({
        where: { deviceId },
        data: { status, lastSeen: new Date() },
      });
      // Notify parent via socket
      this.server.to(`parent:${device.parentId}`).emit('device:status', {
        deviceId: device.id,
        status: status,
      });
    } catch (e) {
      // Ignore if device not found
    }
  }

  @SubscribeMessage('subscribe:device')
  handleSubscribeDevice(
    @MessageBody() data: { deviceId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`device:${data.deviceId}`);
    return { event: 'subscribed', deviceId: data.deviceId };
  }

  @SubscribeMessage('ping_device')
  handlePingDevice(
    @MessageBody() data: { deviceId: string },
    @ConnectedSocket() client: Socket,
  ) {
    // Parent emits this, server forwards "force_sync" to the device
    this.server.to(`device:${data.deviceId}`).emit('force_sync');
    return { event: 'pinged', deviceId: data.deviceId };
  }

  // ── Event Listeners (emitted from services) ──────────────────────────

  @OnEvent('battery.updated')
  handleBatteryUpdate(payload: { deviceId: string; parentId: string; data: any }) {
    this.server.to(`parent:${payload.parentId}`).emit('battery:update', {
      deviceId: payload.deviceId,
      battery: payload.data,
    });
    this.server.to(`device:${payload.deviceId}`).emit('battery:update', {
      battery: payload.data,
    });
  }

  @OnEvent('location.updated')
  handleLocationUpdate(payload: { deviceId: string; parentId: string; data: any }) {
    this.server.to(`parent:${payload.parentId}`).emit('location:update', {
      deviceId: payload.deviceId,
      location: payload.data,
    });
  }

  @OnEvent('notification.received')
  handleNotificationReceived(payload: { deviceId: string; parentId: string; data: any }) {
    this.server.to(`parent:${payload.parentId}`).emit('notification:received', {
      deviceId: payload.deviceId,
      notification: payload.data,
    });
  }

  @OnEvent('apps.synced')
  handleAppsSync(payload: { deviceId: string; parentId: string; count: number }) {
    this.server.to(`parent:${payload.parentId}`).emit('apps:synced', {
      deviceId: payload.deviceId,
      count: payload.count,
    });
  }

  @OnEvent('usage.synced')
  handleUsageSync(payload: { deviceId: string; parentId: string }) {
    this.server.to(`parent:${payload.parentId}`).emit('usage:synced', {
      deviceId: payload.deviceId,
    });
  }

  @OnEvent('device.status')
  handleDeviceStatus(payload: { deviceId: string; parentId: string; status: string }) {
    this.server.to(`parent:${payload.parentId}`).emit('device:status', {
      deviceId: payload.deviceId,
      status: payload.status,
    });
  }

  @OnEvent('alert.low_battery')
  handleLowBattery(payload: { deviceId: string; parentId: string; level: number }) {
    this.server.to(`parent:${payload.parentId}`).emit('alert', {
      type: 'LOW_BATTERY',
      deviceId: payload.deviceId,
      message: `Battery is at ${payload.level}%`,
    });
  }

  @OnEvent('device.deleted')
  handleDeviceDeleted(payload: { deviceId: string }) {
    this.server.to(`device:${payload.deviceId}`).emit('device:deleted');
  }

  // Utility to push to a parent's sockets directly
  emitToParent(parentId: string, event: string, data: any) {
    this.server.to(`parent:${parentId}`).emit(event, data);
  }
}
