import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const studentStatus = await prisma.$queryRawUnsafe(`
    SELECT enumlabel FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'StudentStatus'
    ORDER BY enumsortorder
  `);

  const jobStatusEnum = await prisma.$queryRawUnsafe(`
    SELECT enumlabel FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'StudentJobStatus'
    ORDER BY enumsortorder
  `);

  const students = await prisma.$queryRawUnsafe(`
    SELECT id, "studentCode", email, status::text, "jobStatus"::text
    FROM "Student"
    ORDER BY "studentCode"
  `);

  const jobApplications = await prisma.$queryRawUnsafe(`
    SELECT ja.id, ja."applicationNumber", ja."studentId", s."studentCode", s.email, s.status::text, s."jobStatus"::text
    FROM "JobApplication" ja
    LEFT JOIN "Student" s ON s.id = ja."studentId"
    WHERE ja."studentId" IS NOT NULL
  `);

  const failedMigrations = await prisma.$queryRawUnsafe(`
    SELECT migration_name, finished_at, logs
    FROM "_prisma_migrations"
    WHERE finished_at IS NULL
  `);

  console.log('StudentStatus enum:', studentStatus.map((r) => r.enumlabel));
  console.log('StudentJobStatus enum:', jobStatusEnum.map((r) => r.enumlabel));
  console.log('Students:', students);
  console.log('JobApplications:', jobApplications);
  console.log('Failed migrations:', failedMigrations);
}

main().finally(() => prisma.$disconnect());
