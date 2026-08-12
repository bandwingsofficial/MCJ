// prisma/seeds/admin.seed.ts

import * as bcrypt from 'bcrypt';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedAdmin(): Promise<void> {
  const email = 'admin@mcj.com';

  const existingAdmin =
    await prisma.user.findUnique({
      where: { email },
    });

  if (existingAdmin) {
    console.log(
      '⚠️ Admin already exists',
    );

    return;
  }

  const passwordHash =
    await bcrypt.hash(
      'Admin123@',
      12,
    );

  await prisma.user.create({
    data: {
      name: 'Super Admin',

      email,

      passwordHash,

      role: 'ADMIN',

      status: 'ACTIVE',

      mfaEnabled: true,

      // 🔥 add this secret manually
      // to Google Authenticator
      mfaSecret:
        'JBSWY3DPEHPK3PXP',

      tokenVersion: 0,
    },
  });

  console.log(
    '✅ Admin seeded successfully',
  );

  console.log(
    '📧 Email:',
    email,
  );

  console.log(
    '🔑 Password:',
    'Admin123@',
  );

  console.log(
    '🔐 MFA Secret:',
    'JBSWY3DPEHPK3PXP',
  );
}

void seedAdmin()
  .catch((error) => {
    console.error(error);

    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });