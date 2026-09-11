import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const migrations = await prisma.$queryRawUnsafe(`
    SELECT migration_name, finished_at, rolled_back_at, logs
    FROM "_prisma_migrations"
    WHERE migration_name LIKE '%20260824140000%'
       OR migration_name LIKE '%20260911%'
    ORDER BY started_at
  `);
  console.log('MIGRATIONS:', JSON.stringify(migrations, null, 2));

  const cols = await prisma.$queryRawUnsafe(`
    SELECT column_name, udt_name
    FROM information_schema.columns
    WHERE table_name = 'Student'
      AND column_name IN ('status', 'jobStatus')
  `);
  console.log('STUDENT COLS:', cols);

  const studentStatus = await prisma.$queryRawUnsafe(`
    SELECT enumlabel
    FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'StudentStatus'
    ORDER BY enumsortorder
  `);
  console.log('StudentStatus ENUM:', studentStatus);

  const jobStatusType = await prisma.$queryRawUnsafe(`
    SELECT typname FROM pg_type WHERE typname = 'StudentJobStatus'
  `);
  console.log('StudentJobStatus TYPE:', jobStatusType);

  const counts = await prisma.$queryRawUnsafe(`
    SELECT status::text AS status, COUNT(*)::int AS count
    FROM "Student"
    GROUP BY status
  `);
  console.log('STUDENT STATUS COUNTS:', counts);

  const courseMode = await prisma.$queryRawUnsafe(`
    SELECT enumlabel
    FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'CourseMode'
    ORDER BY enumsortorder
  `);
  console.log('CourseMode ENUM:', courseMode);

  const courseQual = await prisma.$queryRawUnsafe(`
    SELECT typname FROM pg_type WHERE typname = 'CourseQualification'
  `);
  console.log('CourseQualification TYPE:', courseQual);

  const courseCols = await prisma.$queryRawUnsafe(`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_name = 'Course'
      AND column_name IN ('mode', 'minimumQualifications')
  `);
  console.log('Course COLS:', courseCols);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
