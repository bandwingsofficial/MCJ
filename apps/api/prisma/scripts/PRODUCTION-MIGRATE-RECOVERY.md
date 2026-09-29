# Production migration recovery (P3009 on `20260916160000_lesson_quiz_attempts`)

## Root cause

`20260916160000_lesson_quiz_attempts` references `"CourseQuiz"("id")`. Production deployed **before** `20260916155000_course_quiz` existed in the image, so the FK step failed. Prisma records the migration as **failed** (P3009 blocks further deploys).

Fix in repo: `20260916155000_course_quiz` creates quiz tables/enums **before** `20260916160000`.

## Step 1 — Audit (required)

Run `prisma/scripts/production-migration-audit.sql` on `mcj_production`. Do not run `resolve` until you have results.

### Interpretation

| Audit result | Meaning | Next step |
|--------------|---------|-----------|
| `LessonQuizAttempt` is NULL, no `LessonQuizAttempt_quizId_fkey`, failed row with no `finished_at` | **Case A** — transaction rolled back, nothing committed | Step 2a |
| `LessonQuizAttempt` exists and/or FK exists | **Case B** — partial apply | Stop; compare `\d "LessonQuizAttempt"` to migration SQL |
| `CourseQuiz` exists but `16155000` not in `_prisma_migrations` | Manual/partial deploy | Step 2b (special) |

## Step 2a — Case A (typical)

From `apps/api` with production `DATABASE_URL`:

```bash
pnpm exec prisma migrate resolve --rolled-back 20260916160000_lesson_quiz_attempts
pnpm exec prisma migrate deploy
```

Expected deploy order:

1. `20260916155000_course_quiz` (if not yet applied)
2. `20260916160000_lesson_quiz_attempts`
3. Remaining pending migrations through `20260928153000_remove_referral_expiry_at`

## Step 2b — CourseQuiz already exists, migration not recorded

Only if audit proves `CourseQuiz` / enums match `20260916155000_course_quiz/migration.sql`:

```bash
pnpm exec prisma migrate resolve --applied 20260916155000_course_quiz
pnpm exec prisma migrate resolve --rolled-back 20260916160000_lesson_quiz_attempts
pnpm exec prisma migrate deploy
```

Do **not** use `--applied` on `16160000` unless `LessonQuizAttempt` fully matches its migration.

## Enrollment ADVANCED (shadow / later deploys)

`20260925150000` adds enum values only; `20260925150500` adds columns and partial indexes using `ADVANCED`. This avoids PostgreSQL “unsafe use of new enum value” in shadow replay.

If production already applied the **old monolithic** `20260925150000` (single file with enums + indexes), do not change that migration file on that environment; mark `20260925150500` as applied if indexes/columns already exist. Fresh environments use the split files from commit `9bad726` and later.

## Coolify

Redeploy after the audit + resolve steps above. Do not disable the healthcheck; `migrate deploy` must succeed.
