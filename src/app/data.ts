import {
  BookOpen,
  Laptop,
  Shirt,
  Coffee,
  Wrench,
  Bike,
  Home,
  Grid3X3,
  MessageCircle,
  ShoppingBag,
  Tag,
  Heart,
  Package,
  Shield,
  Zap,
} from "lucide-react";

export const categories = [
  { icon: BookOpen, label: "Buku & Modul", color: "#3B82F6" },
  { icon: Laptop, label: "Elektronik", color: "#8B5CF6" },
  { icon: Shirt, label: "Fashion", color: "#EC4899" },
  { icon: Coffee, label: "Makanan", color: "#F97316" },
  { icon: Wrench, label: "Jasa", color: "#10B981" },
  { icon: Bike, label: "Kendaraan", color: "#06B6D4" },
  { icon: Home, label: "Kost & Kontrakan", color: "#F59E0B" },
  { icon: Grid3X3, label: "Lainnya", color: "#6B7280" },
];

export const banners = [
  {
    id: 1,
    title: "Semester Baru,\nSemangat Baru!",
    sub: "Temukan buku & alat kuliah terlengkap",
    badge: "Promo Semester",
    bg: "from-[#c41230] to-[#8b0d22]",
    img: "https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=400&h=200&fit=crop&auto=format",
  },
  {
    id: 2,
    title: "Flash Sale\nElektronik!",
    sub: "Laptop, earphone, & gadget murah",
    badge: "Diskon 40%",
    bg: "from-[#1a1a2e] to-[#16213e]",
    img: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=200&fit=crop&auto=format",
  },
  {
    id: 3,
    title: "Jual Barang\nBekas Kuliah",
    sub: "Pasang iklan gratis, cepat laku!",
    badge: "Gratis Iklan",
    bg: "from-[#f59e0b] to-[#d97706]",
    img: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=200&fit=crop&auto=format",
  },
];

export const flashSaleProducts = [
  {
    id: 1,
    name: "Laptop Asus VivoBook 14",
    price: 4500000,
    originalPrice: 6200000,
    rating: 4.8,
    sold: 23,
    image: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=300&h=300&fit=crop&auto=format",
    seller: "Rizki_FT2022",
    location: "GKB 1",
    discount: 27,
  },
  {
    id: 2,
    name: "Kalkulator Casio FX-991",
    price: 180000,
    originalPrice: 250000,
    rating: 4.9,
    sold: 87,
    image: "https://images.unsplash.com/photo-1574607383077-39ca78e7dd51?w=300&h=300&fit=crop&auto=format",
    seller: "TokoBukuUMM",
    location: "Kampus 2",
    discount: 28,
  },
  {
    id: 3,
    name: "Earphone Bluetooth TWS",
    price: 95000,
    originalPrice: 150000,
    rating: 4.5,
    sold: 156,
    image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=300&h=300&fit=crop&auto=format",
    seller: "GadgetMurahID",
    location: "Dau",
    discount: 37,
  },
  {
    id: 4,
    name: "Buku Metode Penelitian",
    price: 45000,
    originalPrice: 80000,
    rating: 4.7,
    sold: 42,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&auto=format",
    seller: "BukuBekas_Malang",
    location: "Sengkaling",
    discount: 44,
  },
];

export const recentProducts = [
  {
    id: 5,
    name: "Jaket Almamater UMM",
    price: 185000,
    rating: 4.9,
    sold: 312,
    image: "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=300&h=300&fit=crop&auto=format",
    seller: "UMMOfficialStore",
    location: "Kampus 1",
    isNew: true,
  },
  {
    id: 6,
    name: "Kos Putri Full Furnished",
    price: 650000,
    rating: 4.6,
    sold: 8,
    image: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=300&h=300&fit=crop&auto=format",
    seller: "KostDinoyo",
    location: "Dinoyo",
    isNew: true,
  },
  {
    id: 7,
    name: "Jasa Desain Poster & PPT",
    price: 35000,
    rating: 4.8,
    sold: 94,
    image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=300&h=300&fit=crop&auto=format",
    seller: "DesainCreative22",
    location: "Online",
    isNew: false,
  },
  {
    id: 8,
    name: "Motor Honda Beat 2020",
    price: 11500000,
    rating: 4.7,
    sold: 2,
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop&auto=format",
    seller: "Farhan_Teknik",
    location: "Lowokwaru",
    isNew: false,
  },
  {
    id: 9,
    name: "Nasi Kotak Menu Lengkap",
    price: 15000,
    rating: 4.9,
    sold: 208,
    image: "https://images.unsplash.com/photo-1547592180-85f173990554?w=300&h=300&fit=crop&auto=format",
    seller: "MakanEnak_UMM",
    location: "Kantin Barat",
    isNew: true,
  },
  {
    id: 10,
    name: "Powerbank 20000mAh",
    price: 220000,
    rating: 4.6,
    sold: 67,
    image: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=300&h=300&fit=crop&auto=format",
    seller: "ElektroMurahMlg",
    location: "Sukun",
    isNew: false,
  },
];

// ── CHAT DATA ──
export const chatContacts = [];

export type Message = {
  id: number;
  text: string;
  fromMe: boolean;
  time: string;
  status: "sent" | "delivered" | "read";
  productCard?: boolean;
  image?: string;
};

export interface Product {
  id: string | number;
  name: string;
  price: number;
  category?: string;
  condition?: string;
  location: string;
  seller: string;
  seller_id?: string;
  sellerAvatar?: string;
  image: string;
  rating: number;
  sold: number;
  description?: string;
  stock?: number;
  originalPrice?: number;
  discount?: number;
  isNew?: boolean;
}

export const extraProducts: Product[] = [
  { id: 11, name: "Buku Statistika Terapan", price: 55000, rating: 4.6, sold: 31, image: "https://images.unsplash.com/photo-1509266272358-7701da638078?w=300&h=300&fit=crop&auto=format", seller: "BukuBekas_Malang", location: "Sengkaling" },
  { id: 12, name: "Modul Praktikum Kimia UMM", price: 30000, rating: 4.8, sold: 67, image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&h=300&fit=crop&auto=format", seller: "TokoBukuUMM", location: "Kampus 2" },
  { id: 13, name: "Laptop Lenovo IdeaPad 3", price: 5800000, originalPrice: 7500000, discount: 23, rating: 4.7, sold: 14, image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=300&h=300&fit=crop&auto=format", seller: "GadgetMurahID", location: "Lowokwaru" },
  { id: 14, name: "Mouse Wireless Logitech", price: 145000, rating: 4.8, sold: 89, image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=300&h=300&fit=crop&auto=format", seller: "ElektroMurahMlg", location: "Sukun", isNew: true },
  { id: 15, name: "Kaos Polos Oversize Putih", price: 75000, rating: 4.5, sold: 203, image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop&auto=format", seller: "FashionMurah_Mlg", location: "Dinoyo" },
  { id: 16, name: "Celana Jogger Abu Panjang", price: 95000, rating: 4.6, sold: 118, image: "https://images.unsplash.com/photo-1594938298603-c8148c4b4081?w=300&h=300&fit=crop&auto=format", seller: "FashionMurah_Mlg", location: "Dinoyo", isNew: true },
  { id: 17, name: "Es Kopi Susu Kekinian", price: 12000, rating: 4.9, sold: 445, image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=300&h=300&fit=crop&auto=format", seller: "KopiBarkah_UMM", location: "Kantin Timur" },
  { id: 18, name: "Roti Bakar Nutella Keju", price: 15000, rating: 4.8, sold: 189, image: "https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=300&h=300&fit=crop&auto=format", seller: "MakanEnak_UMM", location: "Kantin Barat" },
  { id: 19, name: "Jasa Pengetikan & Editing", price: 20000, rating: 4.7, sold: 76, image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=300&h=300&fit=crop&auto=format", seller: "JasaKetik_Pro", location: "Online" },
  { id: 20, name: "Jasa Les Privat Matematika", price: 80000, rating: 4.9, sold: 34, image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=300&h=300&fit=crop&auto=format", seller: "TutorUMM_Official", location: "Kampus 1", isNew: true },
  { id: 21, name: "Motor Yamaha Mio 2019", price: 13500000, rating: 4.6, sold: 3, image: "https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?w=300&h=300&fit=crop&auto=format", seller: "Budi_FEB21", location: "Dau" },
  { id: 22, name: "Sepeda Lipat Polygon 7 Speed", price: 2200000, originalPrice: 3000000, discount: 27, rating: 4.8, sold: 5, image: "https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?w=300&h=300&fit=crop&auto=format", seller: "SepedaMurah_Mlg", location: "Sengkaling" },
  { id: 23, name: "Kost Putra Dekat Kampus 2", price: 550000, rating: 4.5, sold: 6, image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=300&h=300&fit=crop&auto=format", seller: "KostSengkaling", location: "Sengkaling" },
  { id: 24, name: "Kontrakan 2 Kamar Strategis", price: 900000, rating: 4.7, sold: 4, image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=300&h=300&fit=crop&auto=format", seller: "PropertiMalang", location: "Lowokwaru", isNew: true },
];

export const allProducts: Product[] = [
  ...flashSaleProducts,
  ...recentProducts,
  ...extraProducts,
];

export const sellerAvatars: Record<string, string> = {
  "Rizki_FT2022":      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&auto=format",
  "TokoBukuUMM":       "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&auto=format",
  "GadgetMurahID":     "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=80&h=80&fit=crop&auto=format",
  "BukuBekas_Malang":  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&auto=format",
  "UMMOfficialStore":  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&auto=format",
  "KostDinoyo":        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&auto=format",
  "DesainCreative22":  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop&auto=format",
  "Farhan_Teknik":     "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=80&h=80&fit=crop&auto=format",
  "MakanEnak_UMM":     "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=80&h=80&fit=crop&auto=format",
  "ElektroMurahMlg":   "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=80&h=80&fit=crop&auto=format",
};

export const productDescriptions: Record<number, string> = {
  1: "Laptop Asus VivoBook 14 kondisi mulus, baru pakai 6 bulan. Upgrade RAM dari 8GB ke 16GB. Layar 14\" FHD IPS anti-glare, baterai tahan 8 jam. Cocok untuk mahasiswa teknik & desain. Lengkap dengan charger original, dus, dan nota pembelian. Siap COD di area kampus UMM.",
  2: "Kalkulator Casio FX-991EX CLASSWIZ original, segel masih ada. Cocok untuk mata kuliah Matematika, Statistik, Fisika, dan Teknik. Fungsi lengkap termasuk spreadsheet & mode vektor. Beli di toko resmi, ada nota & garansi toko 1 tahun.",
  3: "Earphone Bluetooth TWS kondisi 90% mulus. Baterai case masih kuat 6 jam total. Suara bass mantap, cocok buat dengerin musik & meeting online. Sudah ganti eartips baru. Jual karena beli yang baru.",
  4: "Buku Metode Penelitian edisi terbaru, kondisi 85% masih layak. Highlight pensil di beberapa halaman. Cocok untuk mahasiswa semester 5 ke atas yang sedang menyusun skripsi. Harga terjangkau, bisa nego.",
  5: "Jaket almamater UMM original dari BEM Universitas. Ukuran L, kondisi baru belum dipakai. Beli kebanyakan, jadi dijual. Material tebal & berkualitas, warna merah UMM yang khas. Bisa COD di kampus 1.",
  6: "Kost putri full furnished, strategis 5 menit jalan kaki ke kampus 3. Fasilitas: kasur spring bed, lemari, meja belajar, AC, WiFi 50Mbps, kamar mandi dalam, dapur bersama. Harga sudah termasuk air & listrik. Tersisa 2 kamar.",
  7: "Jasa desain profesional untuk poster, banner, PPT seminar, laporan, dll. Proses cepat 1-2 hari kerja. Revisi 2x gratis. Format output: PDF, PNG, PPTX. Harga per desain, bisa paket hemat untuk pesanan lebih dari 3.",
  8: "Motor Honda Beat 2020 kondisi prima, mesin halus, ban baru. Pajak hidup sampai 2026. Kilometer masih 18.000. Warna biru putih, surat-surat lengkap. Jual karena sudah punya motor baru. Harga bisa nego untuk pembeli serius.",
  9: "Nasi kotak menu harian lengkap: nasi putih, lauk pilihan (ayam/ikan/tempe), sayur, kerupuk, sambal. Tersedia setiap hari, min. order 1 kotak. Bisa pesan via chat untuk menu custom & pesanan dalam jumlah banyak (acara/rapat).",
  10: "Powerbank Baseus 20.000mAh fast charging, kondisi 95%. Masih normal kapasitasnya. Port: 2x USB-A + 1 USB-C. Indikator LED 4 titik. Beli 3 bulan lalu, jarang dipakai. Cocok untuk mahasiswa yang sering ke kampus.",
  11: "Buku Statistika Terapan edisi 5, kondisi 80%. Cocok untuk mahasiswa ekonomi, psikologi, dan teknik industri. Beberapa halaman ada stabilo, tidak mengganggu isi. Harga nego untuk mahasiswa UMM.",
  12: "Modul praktikum kimia dasar resmi UMM semester genap. Kondisi baru, belum dipakai. Beli kebanyakan waktu semester lalu. Lengkap semua halaman.",
  13: "Laptop Lenovo IdeaPad 3 Core i5 Gen 11, RAM 8GB, SSD 256GB. Kondisi mulus pemakaian 8 bulan. Layar 15.6\" FHD, baterai tahan 7 jam. Lengkap dus & charger ori.",
  14: "Mouse wireless Logitech M170, receiver USB nano. Kondisi baru dalam dus. Beli bonus dari pembelian laptop, tidak terpakai. Baterai AA sudah terpasang.",
  15: "Kaos polos oversize bahan cotton combed 30s. Putih bersih, belum pernah dipakai. Ukuran L cocok untuk XL. Beli salah ukuran.",
  16: "Celana jogger abu misty, bahan fleece hangat. Ukuran M, kondisi baru tanpa tag. Cocok untuk olahraga maupun santai kampus.",
  17: "Es kopi susu brown sugar oat milk, dibuat fresh tiap hari. Tersedia ukuran medium & large. Order sebelum jam 10 pagi untuk pickup siang.",
  18: "Roti bakar tebal isi nutella + keju mozarella leleh. Dibuat fresh order. Min. 2 pcs per order. Bisa request topping lain: coklat, strawberry, atau selai kacang.",
  19: "Jasa pengetikan laporan, skripsi, makalah, dan tugas kuliah. Rate per halaman A4 font Times New Roman 12pt. Hasil rapi dan bebas typo. Deadline ekspres tersedia.",
  20: "Les privat matematika SMA/kuliah oleh mahasiswa UMM semester 7 jurusan Matematika. Bisa online via Zoom atau offline di kampus. Jadwal fleksibel mengikuti kebutuhan.",
  21: "Motor Yamaha Mio Soul GT 2019, pajak hidup 2026, mesin halus. KM 21.000, ban baru depan belakang. Warna merah putih, surat lengkap STNK + BPKB.",
  22: "Sepeda lipat Polygon Urbano 3 7-speed, kondisi 90%. Lipatan kokoh, rem disk depan belakang. Cocok untuk mobilitas di sekitar kampus. Sudah ganti ban continental.",
  23: "Kost putra 5 menit jalan ke kampus 2 UMM. Fasilitas: tempat tidur, lemari, meja belajar, WiFi, kamar mandi luar bersama bersih. Harga termasuk listrik, tidak termasuk air.",
  24: "Kontrakan 2 kamar tidur di kawasan tenang Lowokwaru. Dapur, ruang tamu, dan kamar mandi dalam. Parkir luas, dekat warung & minimarket. Harga per bulan nego jangka panjang.",
};

export type RequestItem = {
  id: string;
  title: string;
  description: string;
  category: string;
  budget: number;
  budgetMax?: number;
  poster: string;
  posterId?: string;
  posterAvatar: string;
  location: string;
  postedAt: string;
  urgency: "normal" | "segera" | "mendesak";
  offers: number;
  categoryColor: string;
};

export const requestBoard: RequestItem[] = [];

export function formatPrice(price: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export const notifData: any[] = [];
