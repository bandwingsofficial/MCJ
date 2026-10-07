#!/bin/sh
set -eu

if [ -z "${DATABASE_URL:-}" ]; then
  echo "Error: DATABASE_URL is required at runtime." >&2
  exit 1
fi

# These two migrations failed in production and PostgreSQL rolled the
# transaction back. Mark only those failed rows rolled back so migrate
# deploy can apply the corrected SQL. Any other failed migration stops
# startup. After these rows are cleared, startup is only migrate deploy.
echo "Checking for failed Prisma migrations..."
set +e
resolve_names=$(node <<'EOF'
const { PrismaClient } = require("@prisma/client");

const recoverable = new Set([
  "20261003120000_student_cancelled_replace_dropped",
  "20261003120000_student_enrollment_workflow_status",
]);

function dump(value) {
  return JSON.stringify(value, (_key, item) =>
    typeof item === "bigint" ? item.toString() : item,
  );
}

async function main() {
  const prisma = new PrismaClient();
  try {
    const failed = await prisma.$queryRawUnsafe(
      `SELECT migration_name, started_at, LEFT(COALESCE(logs, ''), 800) AS logs
       FROM "_prisma_migrations"
       WHERE finished_at IS NULL AND rolled_back_at IS NULL
       ORDER BY started_at`,
    );
    if (failed.length === 0) {
      console.error("RECOVERY skip: no failed migrations");
      return;
    }

    console.error("FAILED_MIGRATIONS", dump(failed));
    const unknown = failed.filter((row) => !recoverable.has(row.migration_name));
    if (unknown.length > 0) {
      console.error("REFUSING to auto-resolve an unknown failed migration");
      process.exit(1);
    }

    for (const row of failed) {
      console.log(row.migration_name);
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
EOF
)
status=$?
set -e

if [ "$status" -ne 0 ]; then
  echo "Migration history check failed. Application will not start." >&2
  exit "$status"
fi

if [ -n "$resolve_names" ]; then
  old_ifs=$IFS
  IFS='
'
  for migration_name in $resolve_names; do
    [ -n "$migration_name" ] || continue
    echo "Marking ${migration_name} rolled back so the corrected SQL can be applied."
    ./node_modules/.bin/prisma migrate resolve --rolled-back "$migration_name" --schema=./prisma/schema.prisma
  done
  IFS=$old_ifs
fi

echo "Applying Prisma migrations (migrate deploy)..."
if ! ./node_modules/.bin/prisma migrate deploy --schema=./prisma/schema.prisma; then
  echo "prisma migrate deploy failed. Application will not start." >&2
  exit 1
fi

echo "Starting NestJS API..."
exec node dist/main.js
