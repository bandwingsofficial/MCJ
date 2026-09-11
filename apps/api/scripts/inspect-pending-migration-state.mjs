import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const tables = await prisma.$queryRawUnsafe(`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name IN (
        'BatchCourse', 'BatchTiming', 'BatchTemplate',
        'JobApplication', 'Student'
      )
    ORDER BY table_name
  `);
  console.log('TABLES:', tables);

  const pending = [
    '20260824143000_batch_courses',
    '20260824160000_batch_category',
    '20260827120000_job_and_application_numbers',
    '20260911133000_student_job_status',
  ];

  for (const name of pending) {
    const row = await prisma.$queryRawUnsafe(
      `SELECT 1 FROM "_prisma_migrations" WHERE migration_name = $1 AND finished_at IS NOT NULL`,
      name,
    );
    console.log(name, row.length ? 'APPLIED' : 'MISSING');
  }
}

main().finally(() => prisma.$disconnect());
