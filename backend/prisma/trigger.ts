import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createTrigger() {
  try {
    // 1. Create the function that inserts a row into public.users
    await prisma.$executeRawUnsafe(`
      CREATE OR REPLACE FUNCTION public.handle_new_user()
      RETURNS trigger AS $$
      BEGIN
        INSERT INTO public.users (id, email, name, role)
        VALUES (
          new.id,
          new.email,
          COALESCE(new.raw_user_meta_data->>'name', 'Mahasiswa UMM'),
          'BUYER'
        );
        RETURN new;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `);

    // 2. Drop the existing trigger on auth.users if any
    await prisma.$executeRawUnsafe(`
      DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
    `);

    // 3. Create the trigger on auth.users
    await prisma.$executeRawUnsafe(`
      CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
    `);

    console.log('Trigger berhasil dibuat!');
  } catch (error) {
    console.error('Gagal membuat trigger:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTrigger();
