import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Enabling Supabase Realtime for table: messages...');
  try {
    await prisma.$executeRawUnsafe(`
      BEGIN;
      -- Drop the table from publication if it exists to avoid errors
      ALTER PUBLICATION supabase_realtime DROP TABLE messages;
      COMMIT;
    `).catch(() => console.log('Table not in publication yet.'));

    await prisma.$executeRawUnsafe(`
      ALTER PUBLICATION supabase_realtime ADD TABLE messages;
    `);

    console.log('✅ Successfully enabled realtime for messages table.');
  } catch (error) {
    console.error('❌ Failed to enable realtime:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
