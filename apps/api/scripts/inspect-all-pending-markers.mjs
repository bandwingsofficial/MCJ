import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
      SELECT finished_at, rolled_back_at, logs
      FROM "_prisma_migrations"
      WHERE migration_name = $1
      ORDER BY started_at DESC
      LIMIT 1
    `,
    name,
  );
  return rows[0] ?? null;
}

const checks = {
  '20260824160000_batch_category': () => columnExists('Batch', 'categoryId'),
  '20260824163000_course_faq': () => tableExists('CourseFaq'),
  '20260824170000_lesson_parent_hierarchy': () =>
    columnExists('CourseLesson', 'parentLessonId'),
  '20260826110000_batch_course_optional_trainer': () =>
    columnExists('BatchCourse', 'trainerId'),
  '20260827160000_job_source_and_onboarding': () => columnExists('Job', 'source'),
  '20260828093000_branch_ops_roles': () => tableExists('Attendance'),
  '20260828153000_branch_user_history_set_null': () => true,
  '20260828190000_one_current_enrollment_per_student': () =>
    indexExists('Enrollment_studentId_isCurrent_key'),
  '20260829100000_enrollment_current_unique_partial': () =>
    indexExists('Enrollment_one_current_per_student_idx'),
  '20260829120000_batch_course_session': () => tableExists('BatchCourseSession'),
  '20260829140000_attendance_batch_course_session': () =>
    columnExists('Attendance', 'batchCourseSessionId'),
  '20260831120000_assessment_batch_course_session': () =>
    columnExists('AcademicAssessment', 'batchCourseSessionId'),
  '20260904120000_move_pricing_course_to_batch': () =>
    columnExists('Batch', 'price') && !columnExists('Course', 'price'),
  '20260904160000_backfill_batch_course_id': () => true,
  '20260904180000_batch_duration_fields': () =>
    columnExists('Batch', 'durationWeeks'),
  '20260904190000_batch_status_expired': () => enumHasValue('BatchStatus', 'EXPIRED'),
  '20260907140000_enrollment_batch_timing_id': () =>
    columnExists('Enrollment', 'batchTimingId'),
  '20260907150000_batch_template_capacity': () =>
    columnExists('BatchTemplate', 'capacity'),
  '20260909120000_batch_mode_calendar_exceptions': () =>
    tableExists('BatchModeCalendarException'),
  '20260911133000_student_job_status': () => columnExists('Student', 'jobStatus'),
};

async function main() {
  for (const name of Object.keys(checks)) {
    const state = await isMigrationApplied(name);
    const verified = await checks[name]();
    console.log(
      JSON.stringify({
        name,
        verified,
        applied: Boolean(state?.finished_at),
        failed: Boolean(state && !state.finished_at && !state.rolled_back_at),
      }),
    );
  }
}

main().finally(() => prisma.$disconnect());
