import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const rows = await prisma.$queryRawUnsafe(`
    SELECT migration_name, started_at, finished_at, rolled_back_at, LEFT(logs, 120) AS logs_preview
    FROM "_prisma_migrations"
    WHERE migration_name IN (
      '20260824140000_course_mode_recorded_qualifications',
      '20260824160000_batch_category',
      '20260829140000_attendance_batch_course_session',
      '20260911133000_student_job_status'
    )
    ORDER BY migration_name, started_at
  `);
  console.log(rows);
}

main().finally(() => prisma.$disconnect());
