import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const batchModes = await prisma.$queryRawUnsafe(`
    SELECT mode::text, COUNT(*)::int AS count
    FROM "Batch"
    GROUP BY mode
  `);
  console.log('BATCH MODES:', batchModes);

  const lastMigrations = await prisma.$queryRawUnsafe(`
    SELECT migration_name, finished_at
    FROM "_prisma_migrations"
    ORDER BY started_at DESC
    LIMIT 8
  `);
  console.log('LAST MIGRATIONS:', lastMigrations);

  const jobApps = await prisma.$queryRawUnsafe(`
    SELECT ja.id, ja."studentId", s."studentCode", s.status::text, s.email
    FROM "JobApplication" ja
    LEFT JOIN "Student" s ON s.id = ja."studentId"
    LIMIT 10
  `);
  console.log('JOB APPLICATIONS:', jobApps);

  const jobAppliedStudents = await prisma.$queryRawUnsafe(`
    SELECT id, "studentCode", email, status::text
    FROM "Student"
    WHERE status::text = 'JOB_APPLIED'
  `);
  console.log('JOB_APPLIED STUDENTS:', jobAppliedStudents);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
