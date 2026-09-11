import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const rows = await prisma.$queryRawUnsafe(`
    SELECT migration_name, finished_at IS NOT NULL AS applied, started_at
    FROM "_prisma_migrations"
    WHERE started_at >= (
      SELECT started_at FROM "_prisma_migrations"
      WHERE migration_name = '20260824120000_enrollment_approval_flow'
    )
    ORDER BY started_at
  `);
  console.log(JSON.stringify(rows, null, 2));
}

main().finally(() => prisma.$disconnect());
