import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function columnExists(table, column) {
  const rows = await prisma.$queryRawUnsafe(
    `SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name=$1 AND column_name=$2 LIMIT 1`,
    table,
    column,
  );
  return rows.length > 0;
}

async function indexExists(indexName) {
  const rows = await prisma.$queryRawUnsafe(
    `SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname=$1 LIMIT 1`,
    indexName,
  );
  return rows.length > 0;
}

async function constraintExists(name) {
  const rows = await prisma.$queryRawUnsafe(
    `SELECT 1 FROM pg_constraint WHERE conname=$1 LIMIT 1`,
    name,
  );
  return rows.length > 0;
}

async function main() {
  console.log({
    batchCourseId: await columnExists('Attendance', 'batchCourseId'),
    uniqueIndex: await indexExists('Attendance_studentId_batchCourseId_date_key'),
    fk: await constraintExists('Attendance_batchCourseId_fkey'),
    assessmentBatchCourseId: await columnExists('AcademicAssessment', 'batchCourseId'),
    assessmentGroupId: await columnExists('AcademicAssessment', 'assessmentGroupId'),
    batchOriginalPrice: await columnExists('Batch', 'originalPrice'),
    courseOriginalPrice: await columnExists('Course', 'originalPrice'),
    batchDurationValue: await columnExists('Batch', 'durationValue'),
    jobStatus: await columnExists('Student', 'jobStatus'),
  });
}

main().finally(() => prisma.$disconnect());
