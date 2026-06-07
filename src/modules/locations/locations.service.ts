import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { LocationDto } from './dto/location.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class LocationsService {
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  async log(deviceId: string, dto: LocationDto) {
    const device = await this.prisma.device.findUnique({ where: { deviceId } });
    if (!device) throw new NotFoundException('Device not found');

    let location = await this.prisma.location.findFirst({
      where: { deviceId: device.id },
    });

    if (location) {
      location = await this.prisma.location.update({
        where: { id: location.id },
        data: {
          latitude: dto.latitude,
          longitude: dto.longitude,
          accuracy: dto.accuracy,
          altitude: dto.altitude,
          speed: dto.speed,
          bearing: dto.bearing,
          provider: dto.provider,
          timestamp: new Date(),
        },
      });
    } else {
      location = await this.prisma.location.create({
        data: {
          deviceId: device.id,
          latitude: dto.latitude,
          longitude: dto.longitude,
          accuracy: dto.accuracy,
          altitude: dto.altitude,
          speed: dto.speed,
          bearing: dto.bearing,
          provider: dto.provider,
        },
      });
    }

    // Emit for real-time WebSocket updates
    this.eventEmitter.emit('location.updated', {
      deviceId: device.id,
      parentId: device.parentId,
      data: location,
    });

    // Check geofences
    this.eventEmitter.emit('geofence.check', {
      deviceId: device.id,
      parentId: device.parentId,
      latitude: dto.latitude,
      longitude: dto.longitude,
    });

    return location;
  }

  async getLatest(deviceId: string) {
    return this.prisma.location.findFirst({
      where: { device: { deviceId } },
      orderBy: { timestamp: 'desc' },
    });
  }

  async getHistory(deviceId: string, limit = 100, from?: Date, to?: Date) {
    return this.prisma.location.findMany({
      where: {
        device: { deviceId },
        ...(from || to
          ? {
              timestamp: {
                ...(from ? { gte: from } : {}),
                ...(to ? { lte: to } : {}),
              },
            }
          : {}),
      },
      orderBy: { timestamp: 'desc' },
      take: limit,
    });
  }
}
