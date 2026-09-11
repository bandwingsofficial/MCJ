import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const apps = await prisma.jobApplication.findMany({
    where: { isDeleted: false },
    include: { Student: true, job: true },
    orderBy: { createdAt: 'desc' },
  });

  console.log(
    apps.map((a) => ({
      applicationNumber: a.applicationNumber,
      applicantName: a.applicantName,
      status: a.status,
      studentId: a.studentId,
      studentCode: a.Student?.studentCode,
      applicantEmail: a.applicantEmail,
    })),
  );
}

main().finally(() => prisma.$disconnect());
