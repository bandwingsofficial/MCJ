-- Run against mcj_production BEFORE any `prisma migrate resolve`.
-- Copy results into deployment notes.

-- 1) Failed migration record
SELECT
    migration_name,
    started_at,
    finished_at,
    rolled_back_at,
    logs
FROM "_prisma_migrations"
WHERE migration_name = '20260916160000_lesson_quiz_attempts';

-- 2) Course quiz migration (prerequisite for lesson_quiz_attempts)
SELECT migration_name, finished_at, rolled_back_at
FROM "_prisma_migrations"
WHERE migration_name IN (
    '20260916150000_course_learn_items',
    '20260916155000_course_quiz',
    '20260916160000_lesson_quiz_attempts'
)
ORDER BY migration_name;

-- 3) Object presence
SELECT to_regclass('public."CourseQuiz"') AS course_quiz;
SELECT to_regclass('public."CourseQuizQuestion"') AS course_quiz_question;
SELECT to_regclass('public."CourseQuizOption"') AS course_quiz_option;
SELECT to_regclass('public."LessonQuizAttempt"') AS lesson_quiz_attempt;

-- 4) FK from failed migration
SELECT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'LessonQuizAttempt_quizId_fkey'
) AS lesson_quiz_attempt_quiz_fk;

-- 5) Quiz enums
SELECT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'QuizStatus'
) AS quiz_status_enum;
SELECT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'QuizQuestionType'
) AS quiz_question_type_enum;

-- 6) Last successfully applied migrations
SELECT migration_name, finished_at
FROM "_prisma_migrations"
WHERE finished_at IS NOT NULL
ORDER BY finished_at DESC
LIMIT 15;

-- 7) Any other failed migrations
SELECT migration_name, started_at, logs
FROM "_prisma_migrations"
WHERE finished_at IS NULL AND rolled_back_at IS NULL;
