import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const enums = await prisma.$queryRaw`
  SELECT t.typname, e.enumlabel
  FROM pg_type t
  JOIN pg_enum e ON t.oid = e.enumtypid
  WHERE t.typname IN (
    'EnrollmentStatus',
    'EnrollmentStatus_old',
    'StudentStatus',
    'StudentStatus_old',
    'EnrollmentMode',
    'EnrollmentMode_old'
  )
  ORDER BY t.typname, e.enumsortorder
`;

const enrollmentCols = await prisma.$queryRaw`
  SELECT column_name, udt_name
  FROM information_schema.columns
  WHERE table_name = 'Enrollment'
    AND column_name IN ('status', 'mode')
`;

const statusCounts = await prisma.$queryRaw`
  SELECT status::text AS status, COUNT(*)::int AS count
  FROM "Enrollment"
  GROUP BY status::text
  ORDER BY status::text
`;

console.log(JSON.stringify({ enums, enrollmentCols, statusCounts }, null, 2));

await prisma.$disconnect();
