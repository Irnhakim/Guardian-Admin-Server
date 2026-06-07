import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config();

// Prisma 6: DATABASE_URL read from env automatically
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Guardian database...');

  const hashedPassword = await bcrypt.hash('guardian123', 12);

  const user = await prisma.user.upsert({
    where: { email: 'admin@guardian.local' },
    update: {},
    create: {
      email: 'admin@guardian.local',
      password: hashedPassword,
      name: 'Admin',
      role: 'PARENT',
    },
  });

  console.log('✅ Seeded user:', {
    email: user.email,
    name: user.name,
    role: user.role,
  });

  console.log('\n📋 Login credentials:');
  console.log('   Email    : admin@guardian.local');
  console.log('   Password : guardian123');
  console.log('\n⚠️  Change the password after first login!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
