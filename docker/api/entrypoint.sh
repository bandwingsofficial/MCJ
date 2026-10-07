#!/bin/sh
set -eu

if [ -z "${DATABASE_URL:-}" ]; then
  echo "Error: DATABASE_URL is required at runtime." >&2
  exit 1
fi

FAILED_MIGRATION="20261003120000_student_cancelled_replace_dropped"

echo "Checking migration ${FAILED_MIGRATION}..."
set +e
node <<'EOF'
const { PrismaClient } = require("@prisma/client");

const name = "20261003120000_student_cancelled_replace_dropped";

function dump(value) {
  return JSON.stringify(value, (_key, item) =>
    typeof item === "bigint" ? item.toString() : item,
  );
}

async function main() {
  const prisma = new PrismaClient();
  try {
    const rows = await prisma.$queryRawUnsafe(
      `SELECT started_at, finished_at, rolled_back_at, LEFT(COALESCE(logs, ''), 400) AS logs
       FROM "_prisma_migrations"
       WHERE migration_name = $1
       ORDER BY started_at DESC`,
      name,
    );
    console.log("MIGRATION_ROWS", dump(rows));

    const labels = await prisma.$queryRawUnsafe(
      `SELECT e.enumlabel
       FROM pg_enum e
       JOIN pg_type t ON e.enumtypid = t.oid
       WHERE t.typname = 'StudentStatus'
       ORDER BY e.enumsortorder`,
    );
    console.log(
      "STUDENT_STATUS",
      labels.map((row) => row.enumlabel).join(","),
    );

    const counts = await prisma.$queryRawUnsafe(
      `SELECT status::text AS status, COUNT(*)::int AS n
       FROM "Student"
       WHERE status::text IN ('DROPPED', 'CANCELLED')
       GROUP BY status
       ORDER BY status`,
    );
    console.log("STUDENT_COUNTS", dump(counts));

    const open = rows.find((row) => row.finished_at == null && row.rolled_back_at == null);
    if (!open) {
      console.log("RECOVERY skip: migration is not in a failed state");
      return 0;
    }

    console.log(
      "RECOVERY: failed migration did not finish. PostgreSQL rolled the 55P04 transaction back. Marking it rolled back so the corrected SQL can be applied.",
    );
    return 10;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .then((code) => process.exit(code))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
EOF
status=$?
set -e

if [ "$status" -eq 10 ]; then
  ./node_modules/.bin/prisma migrate resolve --rolled-back "$FAILED_MIGRATION" --schema=./prisma/schema.prisma
elif [ "$status" -ne 0 ]; then
  echo "Migration history check failed." >&2
  exit "$status"
fi

echo "Applying Prisma migrations (migrate deploy)..."
./node_modules/.bin/prisma migrate deploy --schema=./prisma/schema.prisma

echo "Starting NestJS API..."
exec node dist/main.js
