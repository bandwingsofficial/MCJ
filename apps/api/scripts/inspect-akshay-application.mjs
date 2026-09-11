import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const apps = await prisma.jobApplication.findMany({
    where: {
      OR: [
        { applicantEmail: { contains: 'akshay', mode: 'insensitive' } },
        { applicantName: { contains: 'Akshay', mode: 'insensitive' } },
      ],
    },
    include: { Student: true, job: true },
    orderBy: { createdAt: 'desc' },
  });

  console.log('Applications:', apps.map((a) => ({
    id: a.id,
    applicationNumber: a.applicationNumber,
    applicantName: a.applicantName,
    applicantEmail: a.applicantEmail,
    studentId: a.studentId,
    studentCode: a.Student?.studentCode,
    studentEmail: a.Student?.email,
    status: a.status,
    jobId: a.jobId,
    jobTitle: a.job.title,
  })));

  const students = await prisma.student.findMany({
    where: {
      OR: [
        { email: { contains: 'akshay', mode: 'insensitive' } },
        { firstName: { contains: 'Akshay', mode: 'insensitive' } },
      ],
    },
    select: {
      id: true,
      studentCode: true,
      email: true,
      firstName: true,
      lastName: true,
    },
  });

  console.log('Students:', students);
}

main().finally(() => prisma.$disconnect());
