import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const categories = [
    { name: "Buku & Modul", slug: "buku-modul" },
    { name: "Elektronik", slug: "elektronik" },
    { name: "Fashion", slug: "fashion" },
    { name: "Makanan & Minuman", slug: "makanan-minuman" },
    { name: "Jasa", slug: "jasa" },
    { name: "Kendaraan", slug: "kendaraan" },
    { name: "Kost & Kontrakan", slug: "kost-kontrakan" },
    { name: "Alat Tulis", slug: "alat-tulis" },
    { name: "Olahraga", slug: "olahraga" },
    { name: "Kosmetik", slug: "kosmetik" },
    { name: "Lainnya", slug: "lainnya" },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }

  console.log('Kategori berhasil ditambahkan!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
