import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const jobCols = await prisma.$queryRawUnsafe(`
    SELECT column_name FROM information_schema.columns
    WHERE table_name = 'Job' AND column_name IN ('jobNumber')
  `);
  const appCols = await prisma.$queryRawUnsafe(`
    SELECT column_name FROM information_schema.columns
    WHERE table_name = 'JobApplication'
      AND column_name IN ('applicationNumber', 'applicantName')
  `);
  const batchCourseId = await prisma.$queryRawUnsafe(`
    SELECT is_nullable FROM information_schema.columns
    WHERE table_name = 'Batch' AND column_name = 'courseId'
  `);
  console.log({ jobCols, appCols, batchCourseId });
}

main().finally(() => prisma.$disconnect());
