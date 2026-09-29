// prisma/seeds/admin.seed.ts

import * as bcrypt from 'bcrypt';
import { generateSecret } from 'otplib';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedAdmin(): Promise<void> {
  const oldEmail = 'admin@mcj.com';
  const email = 'mcjtrainingacademy@gmail.com';
  const password = 'Mcjacademy@2026#';

  // Delete ONLY the old admin account
  const deletedAdmin = await prisma.user.deleteMany({
    where: {
      email: oldEmail,
    },
  });

  if (deletedAdmin.count > 0) {
    console.log('🗑️ Old admin deleted:', oldEmail);
  } else {
    console.log('ℹ️ Old admin not found:', oldEmail);
  }

  // Check whether the new admin already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email },
  });

  if (existingAdmin) {
    console.log('⚠️ New admin already exists:', email);
    return;
  }

  // Generate a fresh MFA secret
  const mfaSecret = generateSecret();

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.create({
    data: {
      name: 'Super Admin',
      email,
      passwordHash,
      role: 'ADMIN',
      status: 'ACTIVE',
      mfaEnabled: true,
      mfaSecret,
      tokenVersion: 0,
    },
  });

  console.log('✅ New admin created successfully');
  console.log('📧 Email:', email);
  console.log('🔑 Password:', password);
  console.log('🔐 MFA Secret:', mfaSecret);
}

void seedAdmin()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });