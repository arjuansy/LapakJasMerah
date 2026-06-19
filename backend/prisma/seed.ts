import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding data...');

  // Create Categories
  const catBuku = await prisma.category.upsert({
    where: { slug: 'buku' },
    update: {},
    create: { name: 'Buku & Modul', slug: 'buku' }
  });
  
  const catElektronik = await prisma.category.upsert({
    where: { slug: 'elektronik' },
    update: {},
    create: { name: 'Elektronik', slug: 'elektronik' }
  });

  // Create Users
  const user1 = await prisma.user.upsert({
    where: { email: 'john@student.ac.id' },
    update: {},
    create: {
      name: 'John_Teknik21',
      email: 'john@student.ac.id',
      password: 'password123',
      university: 'Universitas Brawijaya',
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'sarah@student.ac.id' },
    update: {},
    create: {
      name: 'Sarah_FEB22',
      email: 'sarah@student.ac.id',
      password: 'password123',
      university: 'Universitas Indonesia',
    },
  });

  // Create Products
  await prisma.product.create({
    data: {
      name: 'Buku Kalkulus Edisi 9',
      description: 'Buku kalkulus karangan Purcell, masih mulus jarang dipakai.',
      price: 85000,
      category_id: catBuku.id,
      location: 'Malang',
      stock: 1,
      image_url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=400&fit=crop',
      seller_id: user1.id,
      condition: 'Bekas',
    },
  });

  await prisma.product.create({
    data: {
      name: 'Laptop ASUS ROG Bekas',
      description: 'Laptop gaming mantap buat nugas juga. Minus lecet pemakaian.',
      price: 12000000,
      category_id: catElektronik.id,
      location: 'Depok',
      stock: 1,
      image_url: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=400&h=400&fit=crop',
      seller_id: user2.id,
      condition: 'Bekas',
    },
  });

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
