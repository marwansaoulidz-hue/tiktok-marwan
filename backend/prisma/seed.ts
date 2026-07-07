import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@localhost';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  const adminUsername = process.env.ADMIN_USERNAME || 'admin';

  const existingAdmin = await prisma.user.findFirst({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const passwordHash = await argon2.hash(adminPassword);
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        username: adminUsername,
        passwordHash,
        role: 'ADMIN',
        isActive: true,
        profile: {
          create: {
            displayName: 'Admin',
          },
        },
      },
    });
    console.log('Admin user created:', admin.username);
  } else {
    console.log('Admin user already exists');
  }

  // Initialize storage stats
  const existingStats = await prisma.storageStats.findUnique({
    where: { id: 'global' },
  });

  if (!existingStats) {
    await prisma.storageStats.create({
      data: {
        id: 'global',
        videoBytes: BigInt(0),
      },
    });
    console.log('Storage stats initialized');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });