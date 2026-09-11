import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function resolveApplicationEmail(item) {
  const email =
    item.applicantEmail?.trim() ||
    item.user?.email?.trim() ||
    item.student?.email?.trim() ||
    null;
  return email ? email : null;
}

async function main() {
  const record = await prisma.jobApplication.findFirst({
    where: { applicationNumber: 'APP-2026-000001' },
    include: { job: true, Student: true },
  });

  const item = {
    id: record.id,
    jobId: record.jobId,
    studentId: record.studentId,
    applicantEmail: record.applicantEmail,
    applicantName: record.applicantName,
    student: record.Student
      ? { studentCode: record.Student.studentCode, email: record.Student.email }
      : null,
    user: record.Student
      ? null
      : {
          email: record.applicantEmail ?? '',
          name: record.applicantName ?? '',
        },
  };

  console.log('Before enrich:', item);

  if (!item.student?.studentCode) {
    const email = resolveApplicationEmail(item);
    console.log('Resolved email:', email);
    const student = await prisma.student.findFirst({
      where: { email: { equals: email, mode: 'insensitive' } },
    });
    console.log('Found student:', student?.studentCode);
  }
}

main().finally(() => prisma.$disconnect());
