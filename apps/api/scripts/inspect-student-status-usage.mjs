import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const cols = await prisma.$queryRawUnsafe(`
    SELECT table_name, column_name, udt_name
    FROM information_schema.columns
    WHERE udt_name = 'StudentStatus'
    ORDER BY table_name, column_name
  `);
  console.log('StudentStatus columns:', cols);
}

main().finally(() => prisma.$disconnect());
