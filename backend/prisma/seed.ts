import { PrismaClient, RequestStatus, ProductStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding data...');

  // 1. Create Categories
  const categoriesData = [
    { name: 'Buku & Modul', slug: 'buku' },
    { name: 'Elektronik', slug: 'elektronik' },
    { name: 'Fashion', slug: 'fashion' },
    { name: 'Makanan', slug: 'makanan' },
    { name: 'Jasa', slug: 'jasa' },
    { name: 'Kendaraan', slug: 'kendaraan' },
    { name: 'Kost', slug: 'kost' },
    { name: 'Alat Tulis', slug: 'alat-tulis' },
    { name: 'Olahraga', slug: 'olahraga' },
    { name: 'Lainnya', slug: 'lainnya' },
  ];

  const categories = [];
  for (const cat of categoriesData) {
    const createdCat = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
    categories.push(createdCat);
  }

  // 2. Create Users
  const user1 = await prisma.user.upsert({
    where: { email: 'john@student.ac.id' },
    update: {},
    create: {
      name: 'John_Teknik21',
      email: 'john@student.ac.id',
      password: 'password123',
      university: 'Universitas Brawijaya',
      avatar_url: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=400&h=400&fit=crop',
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
      avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
    },
  });

  const user3 = await prisma.user.upsert({
    where: { email: 'budi@umm.ac.id' },
    update: {},
    create: {
      name: 'Budi_TIF',
      email: 'budi@umm.ac.id',
      password: 'password123',
      university: 'Universitas Muhammadiyah Malang',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    },
  });

  // 3. Create Products (10 dummy products)
  const productsData = [
    {
      name: 'Buku Kalkulus Edisi 9',
      description: 'Buku kalkulus karangan Purcell, masih mulus jarang dipakai.',
      price: 85000,
      category_id: categories.find((c) => c.slug === 'buku')?.id || 1,
      location: 'Malang',
      stock: 1,
      image_url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=400&fit=crop',
      seller_id: user1.id,
      condition: 'Bekas',
    },
    {
      name: 'Laptop ASUS ROG Bekas',
      description: 'Laptop gaming mantap buat nugas juga. Minus lecet pemakaian.',
      price: 12000000,
      category_id: categories.find((c) => c.slug === 'elektronik')?.id || 2,
      location: 'Depok',
      stock: 1,
      image_url: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=400&h=400&fit=crop',
      seller_id: user2.id,
      condition: 'Bekas',
    },
    {
      name: 'Jas Almamater UMM Size L',
      description: 'Jas almamater ukuran L, kondisi 95% bagus.',
      price: 150000,
      category_id: categories.find((c) => c.slug === 'fashion')?.id || 3,
      location: 'Malang',
      stock: 1,
      image_url: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=400&fit=crop',
      seller_id: user3.id,
      condition: 'Bekas',
    },
    {
      name: 'Nasi Kotak Ayam Penyet',
      description: 'Pre-order Nasi Kotak Ayam Penyet untuk acara kampus.',
      price: 15000,
      category_id: categories.find((c) => c.slug === 'makanan')?.id || 4,
      location: 'Malang',
      stock: 50,
      image_url: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400&h=400&fit=crop',
      seller_id: user1.id,
      condition: 'Baru',
    },
    {
      name: 'Jasa Desain Poster',
      description: 'Menerima jasa desain poster kegiatan kampus, hasil cepat 1 hari jadi.',
      price: 50000,
      category_id: categories.find((c) => c.slug === 'jasa')?.id || 5,
      location: 'Online',
      stock: 999,
      image_url: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=400&fit=crop',
      seller_id: user2.id,
      condition: 'Baru',
    },
    {
      name: 'Helm Bogo Hitam Doff',
      description: 'Helm Bogo SNI, kaca datar, ukuran All Size.',
      price: 120000,
      category_id: categories.find((c) => c.slug === 'kendaraan')?.id || 6,
      location: 'Jakarta',
      stock: 2,
      image_url: 'https://images.unsplash.com/photo-1557161186-53bfcffecab4?w=400&h=400&fit=crop',
      seller_id: user3.id,
      condition: 'Baru',
    },
    {
      name: 'Over Kontrak Kos Putra',
      description: 'Sisa 6 bulan, fasilitas kamar mandi dalam, WiFi, dan dapur umum.',
      price: 3000000,
      category_id: categories.find((c) => c.slug === 'kost')?.id || 7,
      location: 'Malang',
      stock: 1,
      image_url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=400&fit=crop',
      seller_id: user1.id,
      condition: 'Bekas',
    },
    {
      name: 'Kalkulator Casio Scientific',
      description: 'Cocok untuk anak teknik. Baterai baru diganti.',
      price: 180000,
      category_id: categories.find((c) => c.slug === 'elektronik')?.id || 2,
      location: 'Bandung',
      stock: 1,
      image_url: 'https://images.unsplash.com/photo-1611124403332-90ab31e6e4f3?w=400&h=400&fit=crop',
      seller_id: user2.id,
      condition: 'Bekas',
    },
    {
      name: 'Sepatu Futsal Specs Size 42',
      description: 'Baru 3 kali pakai, masih keset, tidak ada robek.',
      price: 250000,
      category_id: categories.find((c) => c.slug === 'olahraga')?.id || 9,
      location: 'Malang',
      stock: 1,
      image_url: 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=400&h=400&fit=crop',
      seller_id: user3.id,
      condition: 'Bekas',
    },
    {
      name: 'Paket Pulpen Joyko 1 Lusin',
      description: 'Tinta hitam, nyaman dipakai untuk mencatat.',
      price: 25000,
      category_id: categories.find((c) => c.slug === 'alat-tulis')?.id || 8,
      location: 'Malang',
      stock: 10,
      image_url: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=400&h=400&fit=crop',
      seller_id: user1.id,
      condition: 'Baru',
    },
  ];

  await prisma.product.deleteMany({});
  const createdProducts = [];
  for (const prod of productsData) {
    const created = await prisma.product.create({ data: prod });
    createdProducts.push(created);
  }

  // 4. Create Dummy Chats & Messages
  await prisma.chat.deleteMany({});
  await prisma.message.deleteMany({});
  
  // Chat between Sarah (buyer) and John (seller) for Buku Kalkulus
  const chat1 = await prisma.chat.create({
    data: {
      buyer_id: user2.id,
      seller_id: user1.id,
      product_id: createdProducts[0].id,
      messages: {
        create: [
          { sender_id: user2.id, content: 'Halo kak, bukunya masih ada?' },
          { sender_id: user1.id, content: 'Masih kak, silakan diorder.' },
          { sender_id: user2.id, content: 'Bisa nego 70rb gak kak?' },
        ],
      },
    },
  });

  // Chat between Budi (buyer) and Sarah (seller) for Laptop
  const chat2 = await prisma.chat.create({
    data: {
      buyer_id: user3.id,
      seller_id: user2.id,
      product_id: createdProducts[1].id,
      messages: {
        create: [
          { sender_id: user3.id, content: 'Laptopnya masih mulus kan kak?' },
          { sender_id: user2.id, content: 'Iya masih bagus, baterai awet 3 jam.' },
        ],
      },
    },
  });

  // 5. Create Dummy Requests
  await prisma.request.deleteMany({});
  
  const requestsData = [
    {
      user_id: user1.id,
      title: 'Cari Kos Putra Dekat Kampus 3',
      description: 'Sedang mencari kosan putra budget max 600rb/bulan, kamar mandi luar gapapa asalkan WiFi lancar.',
      budget: 600000,
      status: RequestStatus.OPEN,
    },
    {
      user_id: user2.id,
      title: 'Beli Buku Metodologi Penelitian',
      description: 'Kalau ada yang jual buku Metpen karangan Sugiyono edisi terbaru, tolong kabari ya. Bekas tidak apa-apa.',
      budget: 50000,
      status: RequestStatus.OPEN,
    },
    {
      user_id: user3.id,
      title: 'Cari Joki Ketik Makalah',
      description: 'Butuh joki ketik ulang makalah tulisan tangan ke Word, sekitar 15 halaman.',
      budget: 75000,
      status: RequestStatus.FULFILLED,
    },
    {
      user_id: user1.id,
      title: 'Beli Keyboard Mechanical Bekas',
      description: 'Nyari keyboard mech switch merah atau coklat, budget 200 ribuan.',
      budget: 250000,
      status: RequestStatus.OPEN,
    },
    {
      user_id: user2.id,
      title: 'Kalkulator Scientific Casio',
      description: 'Lagi butuh cepat untuk ujian besok. Kalau ada COD area Suhat ya.',
      budget: 100000,
      status: RequestStatus.CLOSED,
    },
  ];

  for (const req of requestsData) {
    await prisma.request.create({ data: req });
  }

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
