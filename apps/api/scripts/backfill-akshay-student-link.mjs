import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const app = await prisma.jobApplication.findFirst({
    where: { applicationNumber: 'APP-2026-000001' },
    include: { Student: true },
  });

  if (!app) {
    console.log('Application not found');
    return;
  }

  const student = await prisma.student.findFirst({
    where: {
      email: { equals: app.applicantEmail, mode: 'insensitive' },
    },
  });

  if (!student) {
    console.log('No student for email', app.applicantEmail);
    return;
  }

  if (app.studentId === student.id) {
    console.log('Already linked', student.studentCode);
    return;
  }

  await prisma.jobApplication.update({
    where: { id: app.id },
    data: { studentId: student.id },
  });

  console.log('Linked', app.applicationNumber, 'to', student.studentCode);
}

main().finally(() => prisma.$disconnect());
