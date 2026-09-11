import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const record = await prisma.student.findFirst({
    where: { studentCode: 'MCJ-STU-001' },
  });

  console.log('Student record:', {
    id: record.id,
    email: record.email,
    phone: record.phone,
    qualification: record.qualification,
    studentCode: record.studentCode,
  });
}

main().finally(() => prisma.$disconnect());
