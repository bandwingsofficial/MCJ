-- Seed default institute batch timings if the table is empty-friendly (upsert by name).
-- Uses gen_random_uuid(); safe to re-run only when names are absent.

INSERT INTO "BatchTemplate" (
  "id",
  "name",
  "mode",
  "daysOfWeek",
  "startTime",
  "endTime",
  "hasFixedTime",
  "isActive",
  "displayOrder",
  "createdAt",
  "updatedAt"
)
SELECT
  gen_random_uuid()::text,
  v.name,
  v.mode::"CourseMode",
  v.days::"DayOfWeek"[],
  v.start_time,
  v.end_time,
  v.has_fixed,
  true,
  v.ord,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM (
  VALUES
    (
      'Morning Batch',
      'OFFLINE',
      ARRAY['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY']::text[],
      '07:00',
      '09:00',
      true,
      1
    ),
    (
      'Regular Batch 1',
      'OFFLINE',
      ARRAY['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY']::text[],
      '09:00',
      '11:30',
      true,
      2
    ),
    (
      'Regular Batch 2',
      'OFFLINE',
      ARRAY['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY']::text[],
      '11:30',
      '14:00',
      true,
      3
    ),
    (
      'Afternoon Batch',
      'OFFLINE',
      ARRAY['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY']::text[],
      '14:30',
      '17:30',
      true,
      4
    ),
    (
      'Online Batch',
      'ONLINE',
      ARRAY['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY']::text[],
      '19:00',
      '21:00',
      true,
      5
    ),
    (
      'Pre-Recorded',
      'RECORDED',
      ARRAY[]::text[],
      NULL,
      NULL,
      false,
      6
    )
) AS v(name, mode, days, start_time, end_time, has_fixed, ord)
WHERE NOT EXISTS (
  SELECT 1 FROM "BatchTemplate" t WHERE t."name" = v.name
);
