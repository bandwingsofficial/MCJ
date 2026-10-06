import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const rows = await prisma.$queryRaw`
  SELECT q.id, q."moduleId", q."lessonId", q.title,
         l."moduleId" AS expected_module_id
  FROM "CourseQuiz" q
  JOIN "CourseLesson" l ON l.id = q."lessonId"
`;

const invalid = rows.filter((r) => r.moduleId !== r.expected_module_id);

console.log("CourseQuiz count:", rows.length);
console.log("Rows:", JSON.stringify(rows, null, 2));

if (invalid.length > 0) {
  console.error("INVALID moduleId mapping:", invalid);
  process.exit(1);
}

const orphans = await prisma.$queryRaw`
  SELECT id, "lessonId", title FROM "CourseQuiz" WHERE "moduleId" IS NULL
`;

if (orphans.length > 0) {
  console.error("Orphan quizzes without moduleId:", orphans);
  process.exit(1);
}

console.log("OK: all CourseQuiz rows have valid moduleId");

await prisma.$disconnect();
