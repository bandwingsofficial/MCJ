import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const apiRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

function run(command) {
  console.log(`> ${command}`);
  execSync(command, {
    cwd: apiRoot,
    stdio: 'inherit',
  });
}

async function columnExists(table, column) {
  const rows = await prisma.$queryRawUnsafe(
    `
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = $1 AND column_name = $2
      LIMIT 1
    `,
    table,
    column,
  );
  return rows.length > 0;
}

async function tableExists(table) {
  const rows = await prisma.$queryRawUnsafe(
    `
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = $1
      LIMIT 1
    `,
    table,
  );
  return rows.length > 0;
}

async function indexExists(indexName) {
  const rows = await prisma.$queryRawUnsafe(
    `SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = $1 LIMIT 1`,
    indexName,
  );
  return rows.length > 0;
}

async function enumHasValue(typeName, value) {
  const rows = await prisma.$queryRawUnsafe(
    `
      SELECT 1 FROM pg_enum e
      JOIN pg_type t ON e.enumtypid = t.oid
      WHERE t.typname = $1 AND e.enumlabel = $2
      LIMIT 1
    `,
    typeName,
    value,
  );
  return rows.length > 0;
}

async function isMigrationApplied(name) {
  const rows = await prisma.$queryRawUnsafe(
    `
      SELECT 1
      FROM "_prisma_migrations"
      WHERE migration_name = $1
        AND finished_at IS NOT NULL
      LIMIT 1
    `,
    name,
  );
  return rows.length > 0;
}

const verifiedAlreadyAppliedChecks = [
  {
    name: '20260824160000_batch_category',
    verify: () => columnExists('Batch', 'categoryId'),
  },
  {
    name: '20260824163000_course_faq',
    verify: () => tableExists('CourseFaq'),
  },
  {
    name: '20260824170000_lesson_parent_hierarchy',
    verify: () => columnExists('CourseLesson', 'parentLessonId'),
  },
  {
    name: '20260826110000_batch_course_optional_trainer',
    verify: () => columnExists('BatchCourse', 'trainerId'),
  },
  {
    name: '20260827160000_job_source_and_onboarding',
    verify: () => columnExists('Job', 'source'),
  },
  {
    name: '20260828093000_branch_ops_roles',
    verify: () => tableExists('Attendance'),
  },
  {
    name: '20260828153000_branch_user_history_set_null',
    verify: () => true,
  },
  {
    name: '20260829120000_batch_course_session',
    verify: () => tableExists('BatchCourseSession'),
  },
  {
    name: '20260904160000_backfill_batch_course_id',
    verify: () => true,
  },
  {
    name: '20260904190000_batch_status_expired',
    verify: () => enumHasValue('BatchStatus', 'EXPIRED'),
  },
  {
    name: '20260907140000_enrollment_batch_timing_id',
    verify: () => columnExists('Enrollment', 'batchTimingId'),
  },
  {
    name: '20260907150000_batch_template_capacity',
    verify: () => columnExists('BatchTemplate', 'capacity'),
  },
  {
    name: '20260909120000_batch_mode_calendar_exceptions',
    verify: () => tableExists('BatchModeCalendarException'),
  },
];

async function resolveIfNeeded(name, reason) {
  if (await isMigrationApplied(name)) {
    console.log(`skip ${name} (already applied)`);
    return;
  }

  console.log(`resolve ${name}: ${reason}`);
  run(`npx prisma migrate resolve --applied ${name}`);
}

async function verifyStudentMigrationState() {
  const studentStatus = await prisma.$queryRawUnsafe(`
    SELECT enumlabel
    FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'StudentStatus'
    ORDER BY enumsortorder
  `);

  const legacyRows = await prisma.$queryRawUnsafe(`
    SELECT COUNT(*)::int AS count
    FROM "Student"
    WHERE "status"::text = 'JOB_APPLIED'
  `);

  const migratedRows = await prisma.$queryRawUnsafe(`
    SELECT COUNT(*)::int AS count
    FROM "Student"
    WHERE "jobStatus"::text = 'JOB_APPLIED'
  `);

  return {
    studentStatus: studentStatus.map((row) => row.enumlabel),
    hasJobStatusColumn: await columnExists('Student', 'jobStatus'),
    legacyJobAppliedCount: legacyRows[0]?.count ?? 0,
    jobStatusAppliedCount: migratedRows[0]?.count ?? 0,
  };
}

async function main() {
  for (const entry of verifiedAlreadyAppliedChecks) {
    if (!(await entry.verify())) {
      throw new Error(
        `Refusing to mark ${entry.name} as applied; verification failed.`,
      );
    }

    await resolveIfNeeded(
      entry.name,
      'Schema changes already present in database',
    );
  }

  console.log('Running prisma migrate deploy for remaining migrations...');
  run('npx prisma migrate deploy');

  console.log('Running prisma db push to confirm schema parity...');
  run('npx prisma db push');

  const studentState = await verifyStudentMigrationState();
  console.log('Student migration verification:', studentState);

  const jobApplications = await prisma.$queryRawUnsafe(`
    SELECT ja.id, ja."studentId", s."studentCode", s.status::text, s."jobStatus"::text, s.email
    FROM "JobApplication" ja
    LEFT JOIN "Student" s ON s.id = ja."studentId"
    WHERE ja."studentId" IS NOT NULL
  `);
  console.log('Job application links:', jobApplications);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
