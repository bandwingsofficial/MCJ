import { PrismaClient } from '@prisma/client';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const prisma = new PrismaClient();

async function main() {
  const { StudentMapper } = require('../dist/modules/student/infrastructure/mappers/student.mapper.js');

  const record = await prisma.student.findFirst({
    where: { studentCode: 'MCJ-STU-001' },
  });

  try {
    const student = StudentMapper.toDomain(record);
    console.log('Mapped OK:', student.studentCode.getValue());
  } catch (error) {
    console.error('Map failed:', error);
  }
}

main().finally(() => prisma.$disconnect());
