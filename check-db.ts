import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const devices = await prisma.device.findMany();
  console.log('Devices:', devices.map(d => ({ id: d.id, name: d.deviceName, deviceId: d.deviceId })));

  const locations = await prisma.location.findMany();
  console.log('Locations:', locations.length);

  const batteries = await prisma.batteryLog.findMany();
  console.log('Batteries:', batteries.length);

  const apps = await prisma.installedApp.findMany();
  console.log('Apps:', apps.length);

  const usage = await prisma.appUsage.findMany();
  console.log('Usage:', usage.length);
}

main().finally(() => prisma.$disconnect());
