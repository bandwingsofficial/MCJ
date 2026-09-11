import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const app = await prisma.jobApplication.findFirst({
    where: { applicationNumber: 'APP-2026-000001' },
  });

  const student = await prisma.student.findFirst({
    where: {
      email: { equals: app.applicantEmail, mode: 'insensitive' },
    },
  });

  console.log({
    applicationNumber: app.applicationNumber,
    applicantEmail: app.applicantEmail,
    studentId: app.studentId,
    resolvedStudentCode: student?.studentCode,
  });
}

main().finally(() => prisma.$disconnect());
