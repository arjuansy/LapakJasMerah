import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding data...');

  // Create Users
  const user1 = await prisma.user.upsert({
    where: { email: 'john@student.ac.id' },
    update: {},
    create: {
      name: 'John_Teknik21',
      email: 'john@student.ac.id',
      password: 'password123', // In real app, this should be hashed
      university: 'Universitas Brawijaya',
      location: 'Malang',
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
      location: 'Depok',
    },
  });

  // Create Products
  const product1 = await prisma.product.create({
    data: {
      name: 'Buku Kalkulus Edisi 9',
      description: 'Buku kalkulus karangan Purcell, masih mulus jarang dipakai.',
      price: 85000,
      category: 'Buku & Modul',
      location: 'Malang',
      rating: 4.8,
      sold: 2,
      image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=400&fit=crop',
      images: ['https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=400&fit=crop'],
      sellerId: user1.id,
      condition: 'Bekas',
    },
  });

  const product2 = await prisma.product.create({
    data: {
      name: 'Laptop ASUS ROG Bekas',
      description: 'Laptop gaming mantap buat nugas juga. Minus lecet pemakaian.',
      price: 12000000,
      category: 'Elektronik',
      location: 'Depok',
      rating: 4.5,
      sold: 1,
      image: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=400&h=400&fit=crop',
      images: ['https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=400&h=400&fit=crop'],
      sellerId: user2.id,
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
