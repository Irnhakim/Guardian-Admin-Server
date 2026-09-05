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
  // Map deviceId → socket ID
  private deviceSockets = new Map<string, string>();

  constructor(private prisma: PrismaService) {}

  async handleConnection(client: Socket) {
    const deviceIdQuery = client.handshake.query?.deviceId as string;
    const roleQuery = client.handshake.query?.role as string;

    if (roleQuery === 'DEVICE' && deviceIdQuery) {
      client.data.role = 'DEVICE';
      client.data.deviceId = deviceIdQuery;
      this.deviceSockets.set(deviceIdQuery, client.id);
      client.join(`device:${deviceIdQuery}`);
      await this.updateDeviceStatus(deviceIdQuery, 'ONLINE');
      this.logger.log(`Device connected: ${client.id} (Device ID: ${deviceIdQuery})`);
      return;
    }

    // Dashboard/parent — no auth required
    client.data.role = 'PARENT';
    client.join('dashboard');
    this.logger.log(`Dashboard connected: ${client.id}`);
  }

  async handleDisconnect(client: Socket) {
    if (client.data?.role === 'DEVICE' && client.data?.deviceId) {
      const deviceId = client.data.deviceId;
      this.deviceSockets.delete(deviceId);
      await this.updateDeviceStatus(deviceId, 'OFFLINE');
      this.logger.log(`Device disconnected: ${client.id} (Device ID: ${deviceId})`);
      return;
    }
    this.logger.log(`Dashboard disconnected: ${client.id}`);
  }

  private async updateDeviceStatus(deviceId: string, status: 'ONLINE' | 'OFFLINE') {
    try {
      const device = await this.prisma.device.update({
        where: { deviceId },
        data: { status, lastSeen: new Date() },
      });
      this.server.to('dashboard').emit('device:status', {
        deviceId: device.id,
        status,
      });
    } catch {
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
    @MessageBody() data: { deviceId: string; target?: 'all' | 'battery' | 'location' | 'apps' | 'usage' | 'permissions' },
  ) {
    const target = data.target || 'all';
    this.logger.log(`Force sync requested for device ${data.deviceId} (target: ${target})`);
    this.server.to(`device:${data.deviceId}`).emit('force_sync', { target });
    return { event: 'pinged', deviceId: data.deviceId, target };
  }

  @SubscribeMessage('send_device_message')
  handleSendDeviceMessage(
    @MessageBody() data: { deviceId: string; type: 'MESSAGE' | 'BLOCK'; message: string; password?: string },
  ) {
    this.server.to(`device:${data.deviceId}`).emit('device:message', {
      type: data.type,
      message: data.message,
      password: data.password,
    });
    return { event: 'message_sent', deviceId: data.deviceId };
  }

  @SubscribeMessage('hide_app')
  handleHideApp(@MessageBody() data: { deviceId: string }) {
    this.server.to(`device:${data.deviceId}`).emit('app:hide');
    return { event: 'app_hidden', deviceId: data.deviceId };
  }

  @SubscribeMessage('show_app')
  handleShowApp(@MessageBody() data: { deviceId: string }) {
    this.server.to(`device:${data.deviceId}`).emit('app:show');
    return { event: 'app_shown', deviceId: data.deviceId };
  }

  @SubscribeMessage('set_protection')
  handleSetProtection(@MessageBody() data: { deviceId: string; enabled: boolean }) {
    this.logger.log(`Setting anti-uninstall protection for device ${data.deviceId} -> ${data.enabled}`);
    this.server.to(`device:${data.deviceId}`).emit('protection:set', {
      enabled: data.enabled,
    });
    this.server.to('dashboard').emit('protection:changed', {
      deviceId: data.deviceId,
      enabled: data.enabled,
    });
    return { event: 'protection_updated', deviceId: data.deviceId, enabled: data.enabled };
  }

  // ── Event Listeners ──────────────────────────────────────────

  @OnEvent('battery.updated')
  handleBatteryUpdate(payload: { deviceId: string; data: any }) {
    this.server.to('dashboard').emit('battery:update', {
      deviceId: payload.deviceId,
      battery: payload.data,
    });
    this.server.to(`device:${payload.deviceId}`).emit('battery:update', {
      battery: payload.data,
    });
  }

  @OnEvent('location.updated')
  handleLocationUpdate(payload: { deviceId: string; data: any }) {
    this.server.to('dashboard').emit('location:update', {
      deviceId: payload.deviceId,
      location: payload.data,
    });
  }

  @OnEvent('notification.received')
  handleNotificationReceived(payload: { deviceId: string; data: any }) {
    this.server.to('dashboard').emit('notification:received', {
      deviceId: payload.deviceId,
      notification: payload.data,
    });
  }

  @OnEvent('apps.synced')
  handleAppsSync(payload: { deviceId: string; count: number }) {
    this.server.to('dashboard').emit('apps:synced', {
      deviceId: payload.deviceId,
      count: payload.count,
    });
  }

  @OnEvent('usage.synced')
  handleUsageSync(payload: { deviceId: string }) {
    this.server.to('dashboard').emit('usage:synced', {
      deviceId: payload.deviceId,
    });
  }

  @OnEvent('device.status')
  handleDeviceStatus(payload: { deviceId: string; status: string }) {
    this.server.to('dashboard').emit('device:status', {
      deviceId: payload.deviceId,
      status: payload.status,
    });
  }

  @OnEvent('alert.low_battery')
  handleLowBattery(payload: { deviceId: string; level: number }) {
    this.server.to('dashboard').emit('alert', {
      type: 'LOW_BATTERY',
      deviceId: payload.deviceId,
      message: `Battery is at ${payload.level}%`,
    });
  }

  @OnEvent('device.deleted')
  handleDeviceDeleted(payload: { deviceId: string }) {
    this.server.to(`device:${payload.deviceId}`).emit('device:deleted');
  }

  @OnEvent('device.permissions')
  handleDevicePermissions(payload: { deviceId: string; permissions: any }) {
    this.server.to('dashboard').emit('device:permissions', {
      deviceId: payload.deviceId,
      permissions: payload.permissions,
    });
  }

  @OnEvent('approval.requested')
  handleApprovalRequested(payload: { deviceId: string; data: any }) {
    this.server.to('dashboard').emit('approval:requested', {
      deviceId: payload.deviceId,
      data: payload.data,
    });
  }

  @OnEvent('approval.resolved')
  handleApprovalResolved(payload: {
    deviceId: string;
    deviceHardwareId: string;
    packageName: string;
    appName: string;
    status: string;
  }) {
    this.server.to(`device:${payload.deviceHardwareId}`).emit('approval:resolved', {
      packageName: payload.packageName,
      appName: payload.appName,
      status: payload.status,
    });
  }
}
