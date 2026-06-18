import { useState, useEffect } from "react";
import {
  Search,
  Bell,
  ShoppingBag,
  Home,
  Grid3X3,
  PlusCircle,
  MessageCircle,
  User,
  MapPin,
  Star,
  ChevronRight,
  Heart,
  Tag,
  Zap,
  BookOpen,
  Laptop,
  Shirt,
  Coffee,
  Wrench,
  Bike,
  ChevronLeft,
  Shield,
  TrendingUp,
  Package,
  ArrowLeft,
  Send,
  Phone,
  MoreVertical,
  CheckCheck,
  Image as ImageIcon,
  Smile,
  Camera,
  X,
  ChevronDown,
  Info,
  CheckCircle2,
  AlertCircle,
  Banknote,
  FileText,
  ToggleLeft,
  ToggleRight,
  Settings,
  LogOut,
  BadgeCheck,
  Wallet,
  ClipboardList,
  Eye,
  Edit3,
  HelpCircle,
  Bell as BellIcon,
  Lock,
  ChevronUp,
  ExternalLink,
  Share2,
  Flag,
  Clock,
  Truck,
  RefreshCw,
  ShoppingCart,
  MessageSquare,
} from "lucide-react";
import {
  categories,
  banners,
  recentProducts,
  chatContacts,
  initialMessages,
  extraProducts,
  allProducts,
  sellerAvatars,
  productDescriptions,
  formatPrice,
  requestBoard,
} from "./data";
import type { Message, Product, RequestItem } from "./data";
import { AppContext } from "./context";
import type { PurchaseOrder, SalesOrder, ProfileSubPage, Screen } from "./context";
import logo from "../assets/logo.png";
import ChatPage from "./pages/ChatPage";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import SellPage from "./pages/SellPage";
import ProfilePage from "./pages/ProfilePage";
import SearchResultsPage from "./pages/SearchResultsPage";
import OrderTrackingPage from "./pages/OrderTrackingPage";
import AdminDashboard from "./pages/AdminDashboard";


export default function App() {
  // 1. Buat satu fungsi utama untuk membaca URL dan mengatur state
  const resolvePathToState = (path: string) => {
    let newScreen: Screen = "landing";
    let newTab = "home";
    let newSubPage: ProfileSubPage = null;

    // Cek Screen Auth & Admin
    if (path.includes("login.html") || path.endsWith("/login")) {
      newScreen = "login";
    } else if (path.includes("register.html") || path.endsWith("/register")) {
      newScreen = "register";
    } else if (path.includes("/admin/")) {
      newScreen = "admin";
    } 
    // Cek Screen App Utama
    else if (
      path.includes("marketplace.html") || 
      path.startsWith("/profile") ||
      ["/marketplace", "/categories", "/sell", "/chat", "/about"].includes(path)
    ) {
      newScreen = "app";
      
      // Tentukan Tab yang Aktif
      if (path.includes("/categories")) newTab = "categories";
      else if (path.includes("/sell")) newTab = "sell";
      else if (path.includes("/chat")) newTab = "chat";
      else if (path.includes("profile.html") || path.startsWith("/profile") || path === "/about") newTab = "profile";

      // Tentukan Sub-page Profil jika ada
      if (path.includes("/penjualan")) newSubPage = "penjualan";
      else if (path.includes("/pembelian")) newSubPage = "pembelian";
      else if (path.includes("/editbarang")) newSubPage = "editbarang";
      else if (path.includes("/edit")) newSubPage = "editprofil";
      else if (path.includes("/keamanan")) newSubPage = "keamanan";
      else if (path.includes("/notifikasi")) newSubPage = "notifikasi";
      else if (path.includes("/bantuan")) newSubPage = "bantuan";
      else if (path.includes("/kebijakan")) newSubPage = "kebijakan";
      else if (path === "/about") newSubPage = "tentang";
    }

    // Set semua state secara bersamaan agar selalu sinkron
    setScreen(newScreen);
    setActiveTab(newTab);
    setProfileSubPage(newSubPage);
  };

  // 2. Gunakan fungsi tersebut untuk inisialisasi awal (hapus callback () => {...} di useState)
  const [screen, setScreen] = useState<Screen>("landing");
  const [activeTab, setActiveTab] = useState("home");
  const [profileSubPage, setProfileSubPage] = useState<ProfileSubPage>(null);
  const [activeBanner, setActiveBanner] = useState(0);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [searchFocused, setSearchFocused] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Jalankan sekali saat komponen pertama kali dimuat
  useEffect(() => {
    resolvePathToState(window.location.pathname);
  }, []);

  // 3. Gunakan fungsi yang sama persis di dalam event popstate
  useEffect(() => {
    const handlePopState = () => resolvePathToState(window.location.pathname);
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Wrapped path state setters (needed for menu button handlers)
  const setScreenAndPath = (s: Screen) => {
    setScreen(s);
    let path = "/";
    if (s === "login") path = "/login";
    else if (s === "register") path = "/register";
    else if (s === "admin") path = "/admin/dashboard";
    else if (s === "app") {
      if (activeTab === "home") path = "/marketplace";
      else path = `/${activeTab}`;
    }
    if (window.location.pathname !== path) {
      window.history.pushState(null, "", path);
    }
  };

  const setActiveTabAndPath = (t: string) => {
    setActiveTab(t);
    let path = t === "home" ? "/marketplace" : `/${t}`;
    if (t === "profile") {
      if (profileSubPage) {
        path = profileSubPage === "tentang" ? "/about" : `/profile/${profileSubPage}`;
      } else {
        path = "/profile";
      }
    }
    if (window.location.pathname !== path) {
      window.history.pushState(null, "", path);
    }
  };

  const setProfileSubPageAndPath = (sub: ProfileSubPage) => {
    setProfileSubPage(sub);
    let path = "/profile";
    if (sub) {
      path = sub === "tentang" ? "/about" : `/profile/${sub}`;
    }
    if (window.location.pathname !== path) {
      window.history.pushState(null, "", path);
    }
  };
  const [editingItem, setEditingItem] = useState<{ id: number; name: string; price: number; image: string; status: string } | null>(null);
  const [showNotif, setShowNotif] = useState(false);
  const [showWishlist, setShowWishlist] = useState(false);
  const [readNotifs, setReadNotifs] = useState<number[]>([]);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState("Semua");
  const [viewStoreSeller, setViewStoreSeller] = useState<string | null>(null);
  const [showSalesStats, setShowSalesStats] = useState(false);
  const [showReportModal, setShowReportModal] = useState<{ type: "penjual" | "pembeli"; name: string } | null>(null);
  const [showSuggestionBox, setShowSuggestionBox] = useState(false);
  const [showRequestBoard, setShowRequestBoard] = useState(false);
  const [showPostRequestModal, setShowPostRequestModal] = useState(false);
  const [requests, setRequests] = useState<RequestItem[]>(requestBoard);
  const [activeChatId, setActiveChatId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Record<number, Message[]>>(initialMessages);
  const [inputText, setInputText] = useState("");
  const [chatSearch, setChatSearch] = useState("");
  const totalUnread = chatContacts.reduce((sum, c) => sum + c.unread, 0);
  const [globalSearch, setGlobalSearch] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [trackingOrder, setTrackingOrder] = useState<{
    id: string; product: string; image: string; seller: string;
    price: number; qty: number; payment: string; location: string;
    status: "dikonfirmasi" | "diproses" | "menuju_lokasi" | "selesai" | "dibatalkan";
  } | null>(null);

  const [purchaseData, setPurchaseData] = useState<PurchaseOrder[]>([
    { id: "ORD-101", product: "Powerbank 20000mAh", price: 220000, seller: "ElektroMurahMlg", sellerAvatar: "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=60&h=60&fit=crop&auto=format", date: "17 Jun 2026", status: "diproses", image: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=120&h=120&fit=crop&auto=format", qty: 1 },
    { id: "ORD-102", product: "Nasi Kotak Menu Lengkap", price: 75000, seller: "MakanEnak_UMM", sellerAvatar: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=60&h=60&fit=crop&auto=format", date: "15 Jun 2026", status: "selesai", image: "https://images.unsplash.com/photo-1547592180-85f173990554?w=120&h=120&fit=crop&auto=format", qty: 5 },
    { id: "ORD-103", product: "Jasa Desain Poster", price: 35000, seller: "DesainCreative22", sellerAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60&h=60&fit=crop&auto=format", date: "10 Jun 2026", status: "selesai", image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=120&h=120&fit=crop&auto=format", qty: 1 },
    { id: "ORD-104", product: "Kalkulator Casio FX-991", price: 180000, seller: "TokoBukuUMM", sellerAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop&auto=format", date: "3 Jun 2026", status: "dibatalkan", image: "https://images.unsplash.com/photo-1574607383077-39ca78e7dd51?w=120&h=120&fit=crop&auto=format", qty: 1 },
  ]);

  const [salesData, setSalesData] = useState<SalesOrder[]>([
    { id: "TRX-001", product: "Laptop Asus VivoBook 14", price: 4500000, buyer: "Dinda_Psikologi", buyerAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60&h=60&fit=crop&auto=format", date: "17 Jun 2026", status: "diproses", image: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=120&h=120&fit=crop&auto=format", qty: 1 },
    { id: "TRX-002", product: "Kalkulator Casio FX-991", price: 180000, buyer: "Arief_Teknik22", buyerAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=60&h=60&fit=crop&auto=format", date: "15 Jun 2026", status: "selesai", image: "https://images.unsplash.com/photo-1574607383077-39ca78e7dd51?w=120&h=120&fit=crop&auto=format", qty: 2 },
    { id: "TRX-003", product: "Buku Metode Penelitian", price: 45000, buyer: "Siti_FKIP23", buyerAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop&auto=format", date: "12 Jun 2026", status: "selesai", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&auto=format", qty: 1 },
    { id: "TRX-004", product: "Earphone Bluetooth TWS", price: 95000, buyer: "Budi_FEB21", buyerAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop&auto=format", date: "10 Jun 2026", status: "dibatalkan", image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=120&h=120&fit=crop&auto=format", qty: 1 },
    { id: "TRX-005", product: "Jaket Almamater UMM", price: 185000, buyer: "Hana_Hukum22", buyerAvatar: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=60&h=60&fit=crop&auto=format", date: "8 Jun 2026", status: "diproses", image: "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=120&h=120&fit=crop&auto=format", qty: 1 },
  ]);

  const [profileAvatar, setProfileAvatar] = useState<string>("https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=160&h=160&fit=crop&auto=format");
  const [profileBanner, setProfileBanner] = useState<string>("https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80");

  function toggleWishlist(id: number) {
    setWishlist((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  function triggerToast(message: string) {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  }

  function handleShareProduct(product: Product) {
    const shareText = `Lapak Jas Merah - Temukan "${product.name}" seharga Rp ${formatPrice(product.price)} di Kampus UMM!`;
    const shareUrl = `${window.location.origin}/product/${product.id}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Lapak Jas Merah',
        text: shareText,
        url: shareUrl,
      }).catch(() => {
        navigator.clipboard.writeText(`${shareText}\nLink: ${shareUrl}`);
        triggerToast("✓ Link produk disalin ke clipboard!");
      });
    } else {
      navigator.clipboard.writeText(`${shareText}\nLink: ${shareUrl}`);
      triggerToast("✓ Link produk disalin ke clipboard!");
    }
  }

  // ── PRODUCT DETAIL PAGE ──
  function ProductDetailPage({ product }: { product: Product }) {
    const [activeImg, setActiveImg] = useState(0);
    const [qty, setQty] = useState(1);
    const [showOrder, setShowOrder] = useState(false);
    const [ordered, setOrdered] = useState(false);
    const [showPaymentPicker, setShowPaymentPicker] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState("qris");
    const [showQrisCode, setShowQrisCode] = useState(false);

    const sellerAvatar = sellerAvatars[product.seller] ?? "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop&auto=format";
    const desc = productDescriptions[product.id] ?? "Produk berkualitas dengan harga terjangkau. Silakan hubungi penjual untuk informasi lebih lanjut.";

    // Extra images simulated from same base
    const imgs = [
      product.image,
      product.image.replace("w=300&h=300", "w=300&h=300").replace("auto=format", "auto=format&sat=-20"),
      product.image.replace("w=300&h=300", "w=300&h=300").replace("auto=format", "auto=format&bri=10"),
    ];

    const related = allProducts.filter((p) => p.id !== product.id).slice(0, 4);

    // on ordered → launch tracking then dismiss
    const paymentLabels: Record<string, string> = {
      ummpay: "UMM Pay", qris: "QRIS", bca: "Transfer BCA", bri: "Transfer BRI",
      mandiri: "Transfer Mandiri", bni: "Transfer BNI", gopay: "GoPay", ovo: "OVO",
      dana: "DANA", cod: "COD (Bayar di Tempat)",
    };

    function launchTracking() {
      const orderIdNum = Date.now().toString().slice(-6);
      const orderId = `ORD-${orderIdNum}`;
      const newOrderData = {
        id: orderId,
        product: product.name,
        image: product.image,
        seller: product.seller,
        price: product.price,
        qty,
        payment: paymentLabels[selectedPayment] ?? selectedPayment,
        location: product.location,
        status: "dikonfirmasi" as const,
      };

      setTrackingOrder(newOrderData);

      // Add to purchaseData (acting as buyer)
      const newPurchase: PurchaseOrder = {
        ...newOrderData,
        sellerAvatar: sellerAvatar,
        date: "Hari ini",
      };
      setPurchaseData((prev) => [newPurchase, ...prev]);

      // Add to salesData (acting as seller)
      const newSale: SalesOrder = {
        id: `TRX-${orderIdNum}`,
        product: product.name,
        price: product.price,
        buyer: "Ahmad Rizky", // Current user
        buyerAvatar: profileAvatar,
        date: "Hari ini",
        status: "dikonfirmasi" as const,
        image: product.image,
        qty,
      };
      setSalesData((prev) => [newSale, ...prev]);

      setOrdered(false);
      setSelectedProduct(null);
    }

    if (showQrisCode) {
      return (
        <div className="fixed inset-0 z-[60] bg-background flex flex-col text-foreground" style={{ maxWidth: 430, margin: "0 auto" }}>
          {/* Header */}
          <div className="bg-primary px-4 pt-10 pb-4 flex items-center gap-3 shadow-md shrink-0">
            <button onClick={() => { setShowQrisCode(false); setShowOrder(true); }} className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
              <ArrowLeft size={18} className="text-white" />
            </button>
            <div className="flex-1">
              <h1 className="text-white font-black text-lg">Pembayaran QRIS</h1>
              <p className="text-white/60 text-[11px]">Scan kode QR untuk membayar</p>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-5 py-6 flex flex-col items-center justify-between">
            <div className="w-full flex flex-col items-center">
              {/* Merchant Details */}
              <p className="text-muted-foreground text-xs font-bold uppercase tracking-wider mb-1">Merchant</p>
              <h2 className="text-foreground font-black text-xl mb-4">Lapak Jas Merah UMM</h2>

              {/* Amount Box */}
              <div className="bg-secondary border border-primary/10 rounded-2xl px-6 py-4 text-center w-full mb-6 shadow-inner">
                <p className="text-muted-foreground text-xs mb-1">Total Tagihan</p>
                <p className="text-primary font-black text-2xl">{formatPrice(product.price * qty)}</p>
              </div>

              {/* QRIS Container */}
              <div className="bg-white rounded-3xl p-5 border border-border shadow-lg flex flex-col items-center w-[260px]">
                {/* QRIS Logo */}
                <div className="flex items-center justify-center gap-1.5 mb-4">
                  <span className="font-black text-xs text-blue-900 leading-none">QR</span>
                  <span className="font-black text-xs text-teal-500 leading-none">IS</span>
                  <span className="text-[8px] bg-red-500 text-white font-extrabold px-1 py-0.5 rounded leading-none">GPN</span>
                </div>
                
                {/* QR Image */}
                <div className="w-[180px] h-[180px] bg-muted flex items-center justify-center rounded-xl overflow-hidden border border-border/50 p-2">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=QRIS_LJM_${product.id}_${Date.now()}`}
                    alt="QR Code QRIS"
                    className="w-full h-full object-contain"
                  />
                </div>
                
                <p className="text-muted-foreground text-[10px] font-semibold mt-4 text-center">NMID: ID102026182710</p>
                <p className="text-muted-foreground text-[9px] text-center">Cetak Mandiri &amp; Bayar Bebas Admin</p>
              </div>

              {/* Timer info */}
              <div className="mt-6 flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-4 py-2.5 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                <span>Batas pembayaran: 04:59</span>
              </div>
            </div>

            {/* Submit Button */}
            <div className="w-full mt-6">
              <button
                onClick={() => { setShowQrisCode(false); setOrdered(true); }}
                className="w-full bg-primary text-white font-black py-4 rounded-2xl text-base shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                Saya Sudah Bayar ✓
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (ordered) {
      return (
        <div className="fixed inset-0 z-[60] bg-background flex flex-col items-center justify-center px-8" style={{ maxWidth: 430, margin: "0 auto" }}>
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 size={48} className="text-green-500" />
          </div>
          <h2 className="text-foreground font-black text-2xl text-center mb-2">Pesanan Dikonfirmasi!</h2>
          <p className="text-muted-foreground text-sm text-center mb-1">
            <span className="font-bold text-foreground">{qty}× {product.name}</span>
          </p>
          <p className="text-primary font-black text-xl mb-6">{formatPrice(product.price * qty)}</p>

          <div className="w-full bg-card rounded-2xl border border-border p-4 mb-6 space-y-3 text-sm">
            {[
              ["Penjual", product.seller],
              ["Lokasi COD", product.location],
              ["Metode Bayar", paymentLabels[selectedPayment] ?? selectedPayment],
              ["Status", "Dikonfirmasi ✓"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between">
                <span className="text-muted-foreground">{k}</span>
                <span className="font-semibold text-foreground">{v}</span>
              </div>
            ))}
          </div>

          <button
            onClick={launchTracking}
            className="w-full bg-primary text-white font-black py-4 rounded-2xl text-base mb-3 flex items-center justify-center gap-2"
          >
            <MapPin size={18} /> Lacak Pesanan
          </button>
          <button
            onClick={() => { setOrdered(false); setSelectedProduct(null); }}
            className="w-full bg-secondary text-primary font-bold py-3.5 rounded-2xl text-sm border border-primary/20"
          >
            Kembali ke Beranda
          </button>
        </div>
      );
    }

    return (
      <div className="fixed inset-0 z-[60] bg-background overflow-y-auto" style={{ maxWidth: 430, margin: "0 auto" }}>

        {/* ── IMAGE SECTION ── */}
        <div className="relative bg-muted" style={{ height: 320 }}>
          <img
            src={imgs[activeImg]}
            alt={product.name}
            className="w-full h-full object-cover"
          />

          {/* Top bar */}
          <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 pt-10 pb-4"
            style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.45), transparent)" }}>
            <button
              onClick={() => setSelectedProduct(null)}
              className="w-9 h-9 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center"
            >
              <ArrowLeft size={18} className="text-white" />
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleShareProduct(product)}
                className="w-9 h-9 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center cursor-pointer active:scale-95 transition-transform"
              >
                <Share2 size={16} className="text-white" />
              </button>
              <button
                onClick={() => toggleWishlist(product.id)}
                className="w-9 h-9 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center"
              >
                <Heart
                  size={16}
                  className={wishlist.includes(product.id) ? "text-primary fill-primary" : "text-white"}
                />
              </button>
            </div>
          </div>

          {/* Discount badge */}
          {product.discount && (
            <div className="absolute top-14 left-4 bg-primary text-white text-xs font-black px-2.5 py-1 rounded-lg">
              -{product.discount}%
            </div>
          )}

          {/* Image dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
            {imgs.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveImg(i)}
                className="rounded-full transition-all"
                style={{
                  width: i === activeImg ? 20 : 7,
                  height: 7,
                  background: i === activeImg ? "#c41230" : "rgba(255,255,255,0.6)",
                }}
              />
            ))}
          </div>
        </div>

        {/* Thumbnail strip */}
        <div className="flex gap-2 px-4 pt-3 pb-1">
          {imgs.map((src, i) => (
            <button
              key={i}
              onClick={() => setActiveImg(i)}
              className="shrink-0 rounded-xl overflow-hidden border-2 transition-all"
              style={{ borderColor: i === activeImg ? "#c41230" : "transparent", width: 52, height: 52 }}
            >
              <img src={src} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>

        {/* ── PRODUCT INFO ── */}
        <div className="px-4 pt-3 pb-2">
          {/* Name & price */}
          <h1 className="text-foreground font-black text-xl leading-snug mb-2">{product.name}</h1>

          <div className="flex items-end gap-3 mb-3">
            <span className="text-primary font-black text-2xl">{formatPrice(product.price)}</span>
            {product.originalPrice && (
              <span className="text-muted-foreground text-sm line-through pb-0.5">{formatPrice(product.originalPrice)}</span>
            )}
            {product.isNew && (
              <span className="bg-green-100 text-green-700 text-[10px] font-black px-2 py-0.5 rounded-full pb-0.5">BARU</span>
            )}
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-1">
              <Star size={13} className="text-accent fill-accent" />
              <span className="text-sm font-bold text-foreground">{product.rating}</span>
            </div>
            <div className="w-px h-4 bg-border" />
            <span className="text-sm text-muted-foreground">{product.sold} terjual</span>
            <div className="w-px h-4 bg-border" />
            <div className="flex items-center gap-1">
              <MapPin size={12} className="text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{product.location}</span>
            </div>
          </div>

          {/* Nego badge */}
          {product.id % 2 === 0 && (
            <div className="inline-flex items-center gap-1.5 bg-accent/10 border border-accent/30 px-3 py-1.5 rounded-full mb-4">
              <Tag size={11} className="text-accent" />
              <span className="text-xs font-bold text-foreground">Harga Bisa Nego</span>
            </div>
          )}

          {/* Laporkan penjual */}
          <button
            onClick={() => setShowReportModal({ type: "penjual", name: product.seller })}
            className="flex items-center gap-1.5 text-muted-foreground text-xs font-semibold mt-1"
          >
            <Flag size={12} /> Laporkan Penjual
          </button>
        </div>

        {/* Divider */}
        <div className="h-2 bg-muted" />

        {/* ── SELLER INFO ── */}
        <div className="px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img src={sellerAvatar} alt={product.seller} className="w-12 h-12 rounded-full object-cover border-2 border-border" />
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-white" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-foreground text-sm">{product.seller}</p>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-0.5">
                  {[1,2,3,4,5].map((s) => <Star key={s} size={9} className="text-accent fill-accent" />)}
                </div>
                <span className="text-[10px] text-muted-foreground">4.9 · 48 ulasan</span>
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <BadgeCheck size={11} className="text-blue-500" />
                <span className="text-[10px] text-muted-foreground">Mahasiswa Terverifikasi · Online sekarang</span>
              </div>
            </div>
            <button
              onClick={() => setViewStoreSeller(product.seller)}
              className="bg-secondary text-primary text-xs font-bold px-3 py-2 rounded-xl border border-primary/20"
            >
              Lihat Toko
            </button>
          </div>

          {/* Response stats */}
          <div className="flex gap-3 mt-3">
            {[
              { icon: Clock, label: "Respon", value: "< 1 jam" },
              { icon: CheckCheck, label: "Akurasi", value: "98%" },
              { icon: Package, label: "Dikirim", value: "24 item" },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex-1 bg-muted rounded-xl p-2.5 text-center">
                <Icon size={14} className="text-muted-foreground mx-auto mb-1" />
                <p className="text-foreground font-bold text-xs">{value}</p>
                <p className="text-muted-foreground text-[10px]">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="h-2 bg-muted" />

        {/* ── DESKRIPSI ── */}
        <div className="px-4 py-4">
          <h3 className="text-foreground font-bold text-sm mb-2">Deskripsi Produk</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
        </div>

        <div className="h-2 bg-muted" />

        {/* ── KEAMANAN TRANSAKSI ── */}
        <div className="px-4 py-4">
          <h3 className="text-foreground font-bold text-sm mb-3">Keamanan Transaksi</h3>
          <div className="space-y-2.5">
            {[
              { icon: Shield, label: "Pembayaran dijamin aman", sub: "Uang ditahan hingga barang diterima", color: "#10B981" },
              { icon: RefreshCw, label: "Proteksi pembeli", sub: "Kembalikan barang jika tidak sesuai", color: "#3B82F6" },
              { icon: BadgeCheck, label: "Penjual terverifikasi", sub: "NIM dan identitas sudah dicek UMM", color: "#8B5CF6" },
            ].map(({ icon: Icon, label, sub, color }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: color + "18" }}>
                  <Icon size={16} style={{ color }} />
                </div>
                <div>
                  <p className="text-foreground font-semibold text-xs">{label}</p>
                  <p className="text-muted-foreground text-[10px]">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="h-2 bg-muted" />

        {/* ── ULASAN PEMBELI ── */}
        {(() => {
          const productReviews = [
            { id: 1, user: "Dinda_Psikologi", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&h=40&fit=crop&auto=format", rating: 5, comment: "Barang sesuai deskripsi, kondisi mulus! Penjual sangat responsif dan ramah. COD di kampus 1, lancar.", date: "15 Jun 2026" },
            { id: 2, user: "Fajar_FEB21",     avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&auto=format", rating: 5, comment: "Recommended! Harga nego-able, barang oke. Penjual jujur dan amanah.", date: "10 Jun 2026" },
            { id: 3, user: "Sari_Manajemen",  avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&auto=format", rating: 4, comment: "Barang sesuai foto. Respon cepat. Lumayan untuk harga segini.", date: "3 Jun 2026" },
          ];
          const avg = (productReviews.reduce((s, r) => s + r.rating, 0) / productReviews.length).toFixed(1);
          return (
            <div className="px-4 py-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-foreground font-bold text-sm">Ulasan Pembeli</h3>
                <button
                  onClick={() => setViewStoreSeller(product.seller)}
                  className="text-primary text-xs font-semibold flex items-center gap-0.5"
                >
                  Semua <ChevronRight size={12} />
                </button>
              </div>

              {/* Rating summary */}
              <div className="bg-secondary rounded-2xl p-4 flex items-center gap-4 mb-4">
                <div className="text-center shrink-0">
                  <p className="text-foreground font-black text-4xl leading-none">{avg}</p>
                  <div className="flex justify-center gap-0.5 mt-1 mb-1">
                    {[1,2,3,4,5].map((s) => <Star key={s} size={10} className="text-accent fill-accent" />)}
                  </div>
                  <p className="text-muted-foreground text-[10px]">{productReviews.length} ulasan</p>
                </div>
                <div className="flex-1 space-y-1.5">
                  {[5,4,3].map((star) => {
                    const count = productReviews.filter((r) => r.rating === star).length;
                    return (
                      <div key={star} className="flex items-center gap-2">
                        <span className="text-[10px] text-muted-foreground w-3">{star}</span>
                        <Star size={9} className="text-accent fill-accent shrink-0" />
                        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${(count / productReviews.length) * 100}%` }} />
                        </div>
                        <span className="text-[10px] text-muted-foreground w-3">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Review cards */}
              <div className="space-y-3">
                {productReviews.map((r) => (
                  <div key={r.id} className="bg-card rounded-2xl border border-border p-4">
                    <div className="flex items-center gap-3 mb-2.5">
                      <img src={r.avatar} alt={r.user} className="w-8 h-8 rounded-full object-cover shrink-0" />
                      <div className="flex-1">
                        <p className="text-foreground font-bold text-xs">{r.user}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          {[1,2,3,4,5].map((s) => (
                            <Star key={s} size={9} className={s <= r.rating ? "text-accent fill-accent" : "text-muted/40"} />
                          ))}
                          <span className="text-muted-foreground text-[10px] ml-1">{r.date}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed">"{r.comment}"</p>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        <div className="h-2 bg-muted" />

        {/* ── PRODUK LAINNYA ── */}
        <div className="px-4 py-4 pb-36">
          <h3 className="text-foreground font-bold text-sm mb-3">Produk Lainnya</h3>
          <div className="grid grid-cols-2 gap-3">
            {related.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedProduct(p)}
                className="bg-card rounded-2xl border border-border overflow-hidden text-left shadow-sm active:scale-95 transition-transform"
              >
                <img src={p.image} alt={p.name} className="w-full h-28 object-cover bg-muted" />
                <div className="p-2.5">
                  <p className="text-foreground font-semibold text-xs truncate">{p.name}</p>
                  <p className="text-primary font-black text-sm mt-0.5">{formatPrice(p.price)}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Star size={9} className="text-accent fill-accent" />
                    <span className="text-[10px] text-muted-foreground">{p.rating}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ── BOTTOM ACTION BAR ── */}
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full bg-card border-t border-border px-4 py-3 z-10 shadow-2xl" style={{ maxWidth: 430 }}>
          {/* Qty selector */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-muted-foreground">Jumlah:</span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="w-8 h-8 rounded-full border-2 border-border flex items-center justify-center text-foreground font-bold text-lg"
              >
                −
              </button>
              <span className="text-foreground font-black text-base w-6 text-center">{qty}</span>
              <button
                onClick={() => setQty((q) => q + 1)}
                className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-lg"
              >
                +
              </button>
            </div>
            <span className="text-primary font-black text-sm">{formatPrice(product.price * qty)}</span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => { setActiveTab("chat"); setSelectedProduct(null); }}
              className="flex-1 bg-secondary border border-primary/20 text-primary font-bold py-3.5 rounded-2xl text-sm flex items-center justify-center gap-2"
            >
              <MessageSquare size={15} />
              Chat
            </button>
            <button
              onClick={() => setShowOrder(true)}
              className="flex-[2] bg-primary text-white font-black py-3.5 rounded-2xl text-sm flex items-center justify-center gap-2 shadow-lg"
            >
              <ShoppingCart size={15} />
              Beli Sekarang
            </button>
          </div>
        </div>

        {/* ── ORDER CONFIRMATION SHEET ── */}
        {showOrder && (() => {
          const paymentMethods = [
            { id: "qris",    label: "QRIS",            sub: "Scan QR semua e-wallet", icon: Zap,     color: "#8B5CF6", logo: null },
            { id: "cod",     label: "COD (Bayar di Tempat)", sub: "Bayar saat COD di lokasi", icon: MapPin, color: "#10B981", logo: null },
          ];
          const selected = paymentMethods.find((m) => m.id === selectedPayment)!;

          return (
            <>
              {/* Payment Picker Sheet */}
              {showPaymentPicker && (
                <div className="fixed inset-0 z-30 flex flex-col justify-end" style={{ maxWidth: 430, margin: "0 auto" }}>
                  <div className="absolute inset-0 bg-black/50" onClick={() => setShowPaymentPicker(false)} />
                  <div className="relative bg-card rounded-t-3xl shadow-2xl pb-8 max-h-[80vh] flex flex-col">
                    <div className="p-5 border-b border-border shrink-0">
                      <div className="w-10 h-1 bg-border rounded-full mx-auto mb-4" />
                      <h3 className="text-foreground font-black text-lg">Pilih Metode Pembayaran</h3>
                    </div>
                    <div className="overflow-y-auto flex-1">
                      {/* Groups */}
                      {[
                        { group: "Dompet Digital / QR Code", ids: ["qris"] },
                        { group: "Lainnya", ids: ["cod"] },
                      ].map(({ group, ids }) => (
                        <div key={group}>
                          <p className="px-5 pt-4 pb-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest">{group}</p>
                          {ids.map((id) => {
                            const m = paymentMethods.find((x) => x.id === id)!;
                            const isActive = selectedPayment === id;
                            return (
                              <button
                                key={id}
                                onClick={() => { setSelectedPayment(id); setShowPaymentPicker(false); }}
                                className="w-full flex items-center gap-3 px-5 py-3.5 border-b border-border last:border-0 transition-colors hover:bg-muted/50 active:bg-muted"
                                style={{ background: isActive ? m.color + "08" : "transparent" }}
                              >
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: m.color + "15" }}>
                                  <m.icon size={18} style={{ color: m.color }} />
                                </div>
                                <div className="flex-1 text-left">
                                  <p className="text-foreground font-bold text-sm">{m.label}</p>
                                  <p className="text-muted-foreground text-[11px]">{m.sub}</p>
                                </div>
                                <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0"
                                  style={{ borderColor: isActive ? m.color : "#d1d5db" }}>
                                  {isActive && <div className="w-2.5 h-2.5 rounded-full" style={{ background: m.color }} />}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Confirmation sheet */}
              <div className="fixed inset-0 z-20 flex flex-col justify-end" style={{ maxWidth: 430, margin: "0 auto" }}>
                <div className="absolute inset-0 bg-black/40" onClick={() => setShowOrder(false)} />
                <div className="relative bg-card rounded-t-3xl shadow-2xl p-5 pb-8">
                  <div className="w-10 h-1 bg-border rounded-full mx-auto mb-5" />
                  <h3 className="text-foreground font-black text-lg mb-4">Konfirmasi Pembelian</h3>

                  {/* Product */}
                  <div className="flex items-center gap-3 bg-muted rounded-2xl p-3 mb-4">
                    <img src={product.image} alt="" className="w-14 h-14 rounded-xl object-cover shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-foreground font-bold text-sm truncate">{product.name}</p>
                      <p className="text-muted-foreground text-xs">{product.seller}</p>
                      <p className="text-primary font-black text-sm mt-0.5">{formatPrice(product.price)} × {qty}</p>
                    </div>
                  </div>

                  {/* Rincian */}
                  <div className="space-y-2 mb-4 text-sm">
                    {[
                      ["Subtotal", formatPrice(product.price * qty)],
                      ["Biaya Layanan", "Gratis"],
                      ["Lokasi COD", product.location],
                    ].map(([k, v]) => (
                      <div key={k} className="flex justify-between">
                        <span className="text-muted-foreground">{k}</span>
                        <span className={k === "Biaya Layanan" ? "text-green-600 font-bold" : "font-semibold text-foreground"}>{v}</span>
                      </div>
                    ))}
                    <div className="h-px bg-border" />
                    <div className="flex justify-between">
                      <span className="font-bold text-foreground">Total</span>
                      <span className="font-black text-primary text-base">{formatPrice(product.price * qty)}</span>
                    </div>
                  </div>

                  {/* Payment method selector */}
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">Metode Pembayaran</p>
                  <button
                    onClick={() => setShowPaymentPicker(true)}
                    className="w-full flex items-center gap-3 bg-secondary border-2 rounded-2xl p-3.5 mb-5 transition-all active:scale-[0.98]"
                    style={{ borderColor: selected.color + "40" }}
                  >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: selected.color + "18" }}>
                      <selected.icon size={18} style={{ color: selected.color }} />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-foreground font-bold text-sm">{selected.label}</p>
                      <p className="text-muted-foreground text-[11px]">{selected.sub}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="text-primary text-xs font-bold">Ganti</span>
                      <ChevronRight size={14} className="text-primary" />
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      if (selectedPayment === "qris") {
                        setShowOrder(false);
                        setShowQrisCode(true);
                      } else {
                        setShowOrder(false);
                        setOrdered(true);
                      }
                    }}
                    className="w-full text-white font-black py-4 rounded-2xl text-base shadow-lg active:scale-95 transition-transform"
                    style={{ background: selected.color === "#c41230" || selected.color === "#10B981" ? selected.color : "#c41230" }}
                  >
                    {selectedPayment === "cod" ? "Pesan & Bayar di Tempat" : `Bayar ${formatPrice(product.price * qty)}`}
                  </button>
                </div>
              </div>
            </>
          );
        })()}
      </div>
    );
  }

  // ── REPORT MODAL ──
  function ReportModal() {
    const [selectedReason, setSelectedReason] = useState("");
    const [detail, setDetail] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    if (!showReportModal) return null;
    const { type, name } = showReportModal;

    const reasons = type === "penjual"
      ? ["Barang tidak sesuai deskripsi", "Penjual tidak responsif", "Penipuan / barang palsu", "Harga tidak wajar", "Penjual bersikap kasar", "Informasi produk menyesatkan", "Lainnya"]
      : ["Pembeli tidak hadir saat COD", "Pembeli bersikap kasar", "Pembeli melakukan penipuan", "Pembeli membatalkan tanpa alasan", "Lainnya"];

    function handleSubmit() {
      if (!selectedReason) return;
      setLoading(true);
      setTimeout(() => { setLoading(false); setSubmitted(true); }, 1200);
    }

    return (
      <div className="fixed inset-0 z-[90] flex flex-col justify-end" style={{ maxWidth: 430, margin: "0 auto" }}>
        <div className="absolute inset-0 bg-black/50" onClick={() => setShowReportModal(null)} />
        <div className="relative bg-card rounded-t-3xl shadow-2xl max-h-[90vh] flex flex-col">
          {/* Handle */}
          <div className="pt-4 pb-2 px-5 shrink-0">
            <div className="w-10 h-1 bg-border rounded-full mx-auto mb-4" />
            {submitted ? null : (
              <div className="flex items-center justify-between">
                <h3 className="text-foreground font-black text-lg">Laporkan {type === "penjual" ? "Penjual" : "Pembeli"}</h3>
                <button onClick={() => setShowReportModal(null)} className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                  <X size={15} className="text-foreground" />
                </button>
              </div>
            )}
          </div>

          {submitted ? (
            <div className="flex flex-col items-center justify-center px-8 py-10 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 size={40} className="text-green-500" />
              </div>
              <h3 className="text-foreground font-black text-xl mb-2">Laporan Terkirim!</h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-1">
                Laporan kamu terhadap <span className="font-bold text-foreground">{name}</span> sudah kami terima.
              </p>
              <p className="text-muted-foreground text-sm mb-6">Tim kami akan meninjau dalam 1×24 jam.</p>
              <button onClick={() => setShowReportModal(null)} className="w-full bg-primary text-white font-black py-3.5 rounded-2xl text-sm">
                Tutup
              </button>
            </div>
          ) : (
            <div className="overflow-y-auto flex-1 px-5 pb-8">
              {/* Target info */}
              <div className="flex items-center gap-3 bg-secondary rounded-2xl p-3.5 mb-5">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                  <Flag size={16} className="text-primary" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground font-semibold">Melaporkan {type}</p>
                  <p className="text-foreground font-black text-sm">{name}</p>
                </div>
              </div>

              {/* Reason */}
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3">Pilih Alasan Laporan <span className="text-primary">*</span></p>
              <div className="space-y-2 mb-5">
                {reasons.map((r) => (
                  <button
                    key={r}
                    onClick={() => setSelectedReason(r)}
                    className="w-full flex items-center gap-3 p-3.5 rounded-2xl border-2 text-left transition-all active:scale-[0.98]"
                    style={{ borderColor: selectedReason === r ? "#c41230" : "rgba(0,0,0,0.08)", background: selectedReason === r ? "rgba(196,18,48,0.05)" : "#fff" }}
                  >
                    <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0"
                      style={{ borderColor: selectedReason === r ? "#c41230" : "#d1d5db" }}>
                      {selectedReason === r && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                    </div>
                    <span className="text-sm font-medium text-foreground">{r}</span>
                  </button>
                ))}
              </div>

              {/* Detail */}
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">Keterangan Tambahan (opsional)</p>
              <div className="bg-card border-2 border-border rounded-2xl px-4 py-3 mb-5 focus-within:border-primary/50 transition-colors">
                <textarea
                  rows={4}
                  value={detail}
                  onChange={(e) => setDetail(e.target.value)}
                  maxLength={300}
                  placeholder={`Ceritakan lebih detail masalah yang kamu alami dengan ${type} ini...`}
                  className="w-full text-sm text-foreground bg-transparent outline-none resize-none placeholder:text-muted-foreground leading-relaxed"
                />
                <p className="text-[10px] text-muted-foreground text-right mt-1">{detail.length}/300</p>
              </div>

              {/* Warning */}
              <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-xl p-3.5 mb-5">
                <AlertCircle size={14} className="text-amber-500 shrink-0 mt-0.5" />
                <p className="text-amber-700 text-[11px] leading-relaxed">
                  Laporan palsu atau tidak berdasar dapat mengakibatkan akunmu dibekukan. Pastikan laporan kamu akurat dan jujur.
                </p>
              </div>

              <button
                onClick={handleSubmit}
                disabled={!selectedReason || loading}
                className="w-full bg-primary text-white font-black py-4 rounded-2xl text-base shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
                style={{ opacity: !selectedReason || loading ? 0.6 : 1 }}
              >
                {loading
                  ? <><svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>Mengirim...</>
                  : <><Flag size={16} /> Kirim Laporan</>}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── POST REQUEST MODAL ──
  function PostRequestModal() {
    const [title, setTitle] = useState("");
    const [desc, setDesc] = useState("");
    const [category, setCategory] = useState("");
    const [budgetMin, setBudgetMin] = useState("");
    const [budgetMax, setBudgetMax] = useState("");
    const [urgency, setUrgency] = useState<"normal" | "segera" | "mendesak">("normal");
    const [location, setLocation] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [requestDuration, setRequestDuration] = useState<"3" | "7">("3");

    const reqCategories = ["Elektronik", "Buku & Modul", "Fashion", "Makanan", "Jasa", "Kendaraan", "Kost & Kontrakan", "Lainnya"];
    const urgencies: { key: "normal" | "segera" | "mendesak"; label: string; color: string }[] = [
      { key: "normal", label: "Normal", color: "#6B7280" },
      { key: "segera", label: "Segera", color: "#F59E0B" },
      { key: "mendesak", label: "Mendesak!", color: "#EF4444" },
    ];

    function handleSubmit() {
      if (!title.trim()) { setError("Judul permintaan wajib diisi"); return; }
      if (!category) { setError("Pilih kategori terlebih dahulu"); return; }
      if (!desc.trim() || desc.length < 10) { setError("Deskripsi minimal 10 karakter"); return; }
      setError("");
      setLoading(true);
      setTimeout(() => {
        const newReq: RequestItem = {
          id: Date.now(),
          title: title.trim(),
          description: desc.trim(),
          category,
          budget: parseInt(budgetMin.replace(/\D/g, "")) || 0,
          budgetMax: parseInt(budgetMax.replace(/\D/g, "")) || undefined,
          poster: "Ahmad Rizky",
          posterAvatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=80&h=80&fit=crop&auto=format",
          location: location.trim() || "UMM",
          postedAt: "Baru saja",
          urgency,
          offers: 0,
          categoryColor: reqCategories.indexOf(category) >= 0
            ? ["#8B5CF6","#3B82F6","#EC4899","#F97316","#10B981","#06B6D4","#F59E0B","#6B7280"][reqCategories.indexOf(category)]
            : "#6B7280",
        };
        setRequests(prev => [newReq, ...prev]);
        setLoading(false);
        setSubmitted(true);
      }, 1200);
    }

    return (
      <div className="fixed inset-0 z-[90] flex flex-col justify-end" style={{ maxWidth: 430, margin: "0 auto" }}>
        <div className="absolute inset-0 bg-black/50" onClick={() => setShowPostRequestModal(false)} />
        <div className="relative bg-card rounded-t-3xl shadow-2xl max-h-[93vh] flex flex-col">
          <div className="pt-4 pb-2 px-5 shrink-0">
            <div className="w-10 h-1 bg-border rounded-full mx-auto mb-4" />
            {!submitted && (
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-foreground font-black text-lg">Pasang Permintaan</h3>
                  <p className="text-muted-foreground text-xs">Beritahu penjual apa yang kamu cari</p>
                </div>
                <button onClick={() => setShowPostRequestModal(false)} className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                  <X size={15} className="text-foreground" />
                </button>
              </div>
            )}
          </div>

          {submitted ? (
            <div className="flex flex-col items-center px-8 py-10 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 size={40} className="text-green-500" />
              </div>
              <h3 className="text-foreground font-black text-xl mb-2">Permintaan Terpasang! 🎉</h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                Permintaanmu sudah ditayangkan di Papan Permintaan. Penjual yang cocok akan segera menghubungimu!
              </p>
              <button onClick={() => setShowPostRequestModal(false)} className="w-full bg-primary text-white font-black py-3.5 rounded-2xl text-sm">
                Lihat Papan Permintaan
              </button>
            </div>
          ) : (
            <div className="overflow-y-auto flex-1 px-5 pb-8 space-y-4">
              {/* Title */}
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2 mt-2">Judul Permintaan <span className="text-primary">*</span></p>
                <div className={`bg-card border-2 rounded-2xl px-4 py-3 transition-colors ${error && !title ? "border-primary" : "border-border focus-within:border-primary/50"}`}>
                  <input
                    value={title}
                    onChange={(e) => { setTitle(e.target.value); setError(""); }}
                    maxLength={80}
                    placeholder="contoh: Cari laptop second RAM 8GB..."
                    className="w-full text-sm text-foreground bg-transparent outline-none placeholder:text-muted-foreground"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">Kategori <span className="text-primary">*</span></p>
                <div className="flex flex-wrap gap-2">
                  {reqCategories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => { setCategory(cat); setError(""); }}
                      className="px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-all"
                      style={{
                        borderColor: category === cat ? "#c41230" : "rgba(0,0,0,0.1)",
                        background: category === cat ? "rgba(196,18,48,0.08)" : "transparent",
                        color: category === cat ? "#c41230" : "#6b7280",
                      }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">Deskripsi <span className="text-primary">*</span></p>
                <div className={`bg-card border-2 rounded-2xl px-4 py-3 transition-colors border-border focus-within:border-primary/50`}>
                  <textarea
                    rows={3}
                    value={desc}
                    onChange={(e) => { setDesc(e.target.value); setError(""); }}
                    maxLength={300}
                    placeholder="Jelaskan spesifikasi, kondisi, atau kebutuhanmu secara detail..."
                    className="w-full text-sm text-foreground bg-transparent outline-none resize-none placeholder:text-muted-foreground leading-relaxed"
                  />
                  <p className="text-[10px] text-muted-foreground text-right">{desc.length}/300</p>
                </div>
              </div>

              {/* Budget */}
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">Budget (Rp)</p>
                <div className="flex gap-2">
                  <div className="flex-1 bg-card border-2 border-border rounded-2xl px-3 py-2.5 focus-within:border-primary/50">
                    <p className="text-[9px] text-muted-foreground mb-0.5">Minimum</p>
                    <input
                      value={budgetMin}
                      onChange={(e) => setBudgetMin(e.target.value.replace(/\D/g, ""))}
                      placeholder="0"
                      inputMode="numeric"
                      className="w-full text-sm font-bold text-foreground bg-transparent outline-none"
                    />
                  </div>
                  <div className="flex items-center text-muted-foreground text-sm">—</div>
                  <div className="flex-1 bg-card border-2 border-border rounded-2xl px-3 py-2.5 focus-within:border-primary/50">
                    <p className="text-[9px] text-muted-foreground mb-0.5">Maksimum</p>
                    <input
                      value={budgetMax}
                      onChange={(e) => setBudgetMax(e.target.value.replace(/\D/g, ""))}
                      placeholder="0"
                      inputMode="numeric"
                      className="w-full text-sm font-bold text-foreground bg-transparent outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Location */}
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">Lokasi COD / Pickup</p>
                <div className="bg-card border-2 border-border rounded-2xl px-4 py-3 focus-within:border-primary/50 flex items-center gap-2">
                  <MapPin size={14} className="text-muted-foreground shrink-0" />
                  <input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="contoh: Kampus 3, Sengkaling, Online..."
                    className="flex-1 text-sm text-foreground bg-transparent outline-none placeholder:text-muted-foreground"
                  />
                </div>
              </div>

              {/* Urgency */}
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">Tingkat Urgensi</p>
                <div className="flex gap-2">
                  {urgencies.map((u) => (
                    <button
                      key={u.key}
                      onClick={() => setUrgency(u.key)}
                      className="flex-1 py-2 rounded-xl text-xs font-bold border-2 transition-all"
                      style={{
                        borderColor: urgency === u.key ? u.color : "rgba(0,0,0,0.1)",
                        background: urgency === u.key ? u.color + "15" : "transparent",
                        color: urgency === u.key ? u.color : "#6b7280",
                      }}
                    >
                      {u.label}
                    </button>
                  ))}
                </div>
              </div>

              {error && <p className="text-primary text-[11px] flex items-center gap-1"><AlertCircle size={11} />{error}</p>}

              {/* Duration choice */}
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">Durasi Tayang & Paket</p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRequestDuration("3")}
                    className="p-3 rounded-2xl border-2 text-left transition-all cursor-pointer"
                    style={{
                      borderColor: requestDuration === "3" ? "#F59E0B" : "rgba(0,0,0,0.1)",
                      background: requestDuration === "3" ? "rgba(245,158,11,0.06)" : "transparent",
                    }}
                  >
                    <p className="font-bold text-xs text-foreground">3 Hari</p>
                    <p className="text-muted-foreground text-[10px] mb-1">Tayang singkat</p>
                    <p className="font-black text-sm text-amber-600">Rp 300</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRequestDuration("7")}
                    className="p-3 rounded-2xl border-2 text-left transition-all cursor-pointer"
                    style={{
                      borderColor: requestDuration === "7" ? "#F59E0B" : "rgba(0,0,0,0.1)",
                      background: requestDuration === "7" ? "rgba(245,158,11,0.06)" : "transparent",
                    }}
                  >
                    <p className="font-bold text-xs text-foreground">&gt;3 Hari (7 Hari)</p>
                    <p className="text-muted-foreground text-[10px] mb-1">Tayang standar</p>
                    <p className="font-black text-sm text-amber-600">Rp 500</p>
                  </button>
                </div>
              </div>

              {/* Fee info */}
              <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-amber-100 rounded-full flex items-center justify-center">
                    <Banknote size={14} className="text-amber-600" />
                  </div>
                  <div>
                    <p className="text-amber-800 font-bold text-xs">Biaya Pasang Permintaan</p>
                    <p className="text-amber-600 text-[10px]">Tayang {requestDuration === "3" ? "3 hari" : "7 hari"}</p>
                  </div>
                </div>
                <p className="text-amber-700 font-black text-base">
                  {requestDuration === "3" ? "Rp 300" : "Rp 500"}
                </p>
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-primary text-white font-black py-4 rounded-2xl text-base shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                style={{ opacity: loading ? 0.8 : 1 }}
              >
                {loading
                  ? <><svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>Memposting...</>
                  : <><Banknote size={16} /> Bayar {requestDuration === "3" ? "Rp 300" : "Rp 500"} & Pasang</>}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── SUGGESTION BOX MODAL ──
  function SuggestionBoxModal() {
    const [category, setCategory] = useState("");
    const [message, setMessage] = useState("");
    const [anonymous, setAnonymous] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const categories = [
      { id: "fitur", label: "Saran Fitur Baru", icon: Zap, color: "#8B5CF6" },
      { id: "bug", label: "Laporkan Bug / Error", icon: AlertCircle, color: "#EF4444" },
      { id: "ux", label: "Tampilan & Kemudahan", icon: Eye, color: "#3B82F6" },
      { id: "keamanan", label: "Keamanan Transaksi", icon: Shield, color: "#10B981" },
      { id: "konten", label: "Konten & Produk", icon: Package, color: "#F59E0B" },
      { id: "lainnya", label: "Lainnya", icon: MessageCircle, color: "#6B7280" },
    ];

    function handleSubmit() {
      if (!category) { setError("Pilih kategori saran terlebih dahulu"); return; }
      if (!message.trim() || message.length < 10) { setError("Saran minimal 10 karakter"); return; }
      setError("");
      setLoading(true);
      setTimeout(() => { setLoading(false); setSubmitted(true); }, 1200);
    }

    return (
      <div className="fixed inset-0 z-[90] flex flex-col justify-end" style={{ maxWidth: 430, margin: "0 auto" }}>
        <div className="absolute inset-0 bg-black/50" onClick={() => setShowSuggestionBox(false)} />
        <div className="relative bg-card rounded-t-3xl shadow-2xl max-h-[92vh] flex flex-col">
          <div className="pt-4 pb-2 px-5 shrink-0">
            <div className="w-10 h-1 bg-border rounded-full mx-auto mb-4" />
            {!submitted && (
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-foreground font-black text-lg">Kotak Saran</h3>
                  <p className="text-muted-foreground text-xs">Bantu kami jadi lebih baik</p>
                </div>
                <button onClick={() => setShowSuggestionBox(false)} className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                  <X size={15} className="text-foreground" />
                </button>
              </div>
            )}
          </div>

          {submitted ? (
            <div className="flex flex-col items-center px-8 py-10 text-center">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 size={40} className="text-purple-500" />
              </div>
              <h3 className="text-foreground font-black text-xl mb-2">Terima Kasih! 🙏</h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-2">
                Saran kamu sangat berarti bagi kami. Kami akan mempertimbangkan masukan ini untuk pengembangan Lapak Jas Merah.
              </p>
              <div className="bg-secondary rounded-2xl p-3.5 w-full mb-6 text-left">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-1">Kategori</p>
                <p className="text-foreground font-semibold text-sm">{categories.find((c) => c.id === category)?.label}</p>
              </div>
              <button onClick={() => setShowSuggestionBox(false)} className="w-full bg-primary text-white font-black py-3.5 rounded-2xl text-sm">
                Tutup
              </button>
            </div>
          ) : (
            <div className="overflow-y-auto flex-1 px-5 pb-8">
              {/* Category grid */}
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3 mt-2">Kategori Saran <span className="text-primary">*</span></p>
              <div className="grid grid-cols-3 gap-2 mb-5">
                {categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => { setCategory(c.id); setError(""); }}
                    className="flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all active:scale-95"
                    style={{ borderColor: category === c.id ? c.color : "rgba(0,0,0,0.08)", background: category === c.id ? c.color + "10" : "#fff" }}
                  >
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: c.color + "18" }}>
                      <c.icon size={16} style={{ color: c.color }} />
                    </div>
                    <span className="text-[10px] font-bold text-center leading-tight" style={{ color: category === c.id ? c.color : "#8a8a9a" }}>{c.label}</span>
                  </button>
                ))}
              </div>

              {/* Message */}
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">Tulis Saranmu <span className="text-primary">*</span></p>
              <div className={`bg-card border-2 rounded-2xl px-4 py-3 mb-2 transition-colors ${error && message.length < 10 ? "border-primary" : "border-border focus-within:border-primary/50"}`}>
                <textarea
                  rows={5}
                  value={message}
                  onChange={(e) => { setMessage(e.target.value); setError(""); }}
                  maxLength={500}
                  placeholder="Ceritakan ide, saran, atau keluhan kamu secara detail. Semakin detail semakin mudah kami tindaklanjuti..."
                  className="w-full text-sm text-foreground bg-transparent outline-none resize-none placeholder:text-muted-foreground leading-relaxed"
                />
                <p className="text-[10px] text-muted-foreground text-right mt-1">{message.length}/500</p>
              </div>
              {error && <p className="text-primary text-[11px] mb-3 flex items-center gap-1"><AlertCircle size={11} />{error}</p>}

              {/* Anonymous toggle */}
              <div className="flex items-center justify-between bg-secondary rounded-2xl px-4 py-3.5 mb-5">
                <div>
                  <p className="text-foreground font-bold text-sm">Kirim Anonim</p>
                  <p className="text-muted-foreground text-[11px]">Identitasmu tidak akan ditampilkan</p>
                </div>
                <button onClick={() => setAnonymous((v) => !v)}>
                  {anonymous
                    ? <ToggleRight size={32} className="text-primary" />
                    : <ToggleLeft size={32} className="text-muted-foreground" />}
                </button>
              </div>

              {!anonymous && (
                <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-xl p-3.5 mb-5">
                  <img src={profileAvatar} alt="" className="w-8 h-8 rounded-full object-cover shrink-0" />
                  <div>
                    <p className="text-blue-800 font-bold text-xs">Ahmad Rizky Pratama</p>
                    <p className="text-blue-600 text-[10px]">Saran dikirim atas namamu</p>
                  </div>
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-primary text-white font-black py-4 rounded-2xl text-base shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
                style={{ opacity: loading ? 0.8 : 1 }}
              >
                {loading
                  ? <><svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>Mengirim...</>
                  : <><Send size={16} /> Kirim Saran</>}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── STORE PAGE ──
  function StorePage({ sellerName }: { sellerName: string }) {
    const avatar = sellerAvatars[sellerName] ?? "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop&auto=format";
    const storeProducts = allProducts.filter((p) => p.seller === sellerName);
    const [activeTab, setActiveTab] = useState<"produk" | "ulasan">("produk");

    const storeReviews = [
      { id: 1, user: "Dinda_Psikologi", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&h=40&fit=crop&auto=format", rating: 5, comment: "Penjual sangat ramah dan responsif. Barang sesuai deskripsi, cepat COD di kampus!", date: "15 Jun 2026", product: storeProducts[0]?.name ?? "Produk" },
      { id: 2, user: "Fajar_FEB21",     avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&auto=format", rating: 5, comment: "Recommended banget! Harga sesuai, kondisi barang mulus. Penjual jujur.", date: "10 Jun 2026", product: storeProducts[0]?.name ?? "Produk" },
      { id: 3, user: "Sari_Manajemen",  avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&auto=format", rating: 4, comment: "Oke lah, barang sesuai foto. Respon cepat via chat.", date: "5 Jun 2026",  product: storeProducts[1]?.name ?? "Produk" },
    ];

    const avgRating = (storeReviews.reduce((s, r) => s + r.rating, 0) / storeReviews.length).toFixed(1);

    return (
      <div className="fixed inset-0 z-[60] bg-background overflow-y-auto" style={{ maxWidth: 430, margin: "0 auto" }}>
        {/* Hero */}
        <div className="relative" style={{ background: "linear-gradient(160deg,#c41230 0%,#8b0d22 100%)", paddingBottom: 60 }}>
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-10 bg-amber-400" />
          <div className="px-4 pt-10 pb-4 flex items-center gap-3">
            <button onClick={() => setViewStoreSeller(null)} className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
              <ArrowLeft size={18} className="text-white" />
            </button>
            <h1 className="flex-1 text-white font-black text-lg">Toko Penjual</h1>
            <button
              onClick={() => {
                const shareText = `Lapak Jas Merah - Kunjungi toko "${viewStoreSeller}" di Lapak Jas Merah UMM!`;
                const shareUrl = `${window.location.origin}/seller/${viewStoreSeller}`;
                if (navigator.share) {
                  navigator.share({
                    title: 'Lapak Jas Merah',
                    text: shareText,
                    url: shareUrl,
                  }).catch(() => {
                    navigator.clipboard.writeText(`${shareText}\nLink: ${shareUrl}`);
                    triggerToast("✓ Link toko disalin ke clipboard!");
                  });
                } else {
                  navigator.clipboard.writeText(`${shareText}\nLink: ${shareUrl}`);
                  triggerToast("✓ Link toko disalin ke clipboard!");
                }
              }}
              className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center cursor-pointer active:scale-95 transition-transform"
            >
              <Share2 size={16} className="text-white" />
            </button>
          </div>
        </div>

        {/* Avatar card overlap */}
        <div className="px-4 -mt-12 mb-4">
          <div className="bg-card rounded-2xl border border-border shadow-md p-4">
            <div className="flex items-start gap-4">
              <div className="relative shrink-0">
                <img src={avatar} alt={sellerName} className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-md" />
                <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-2 border-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <p className="text-foreground font-black text-base">{sellerName}</p>
                  <BadgeCheck size={15} className="text-blue-500 fill-blue-100" />
                </div>
                <p className="text-muted-foreground text-xs mb-2">Online sekarang · Bergabung Mar 2024</p>
                <div className="flex gap-3 text-center">
                  <div><p className="text-foreground font-black text-sm">{storeProducts.length}</p><p className="text-muted-foreground text-[10px]">Produk</p></div>
                  <div className="w-px h-6 bg-border self-center" />
                  <div><p className="text-foreground font-black text-sm">{avgRating}★</p><p className="text-muted-foreground text-[10px]">Rating</p></div>
                  <div className="w-px h-6 bg-border self-center" />
                  <div><p className="text-foreground font-black text-sm">98%</p><p className="text-muted-foreground text-[10px]">Respons</p></div>
                  <div className="w-px h-6 bg-border self-center" />
                  <div><p className="text-foreground font-black text-sm">24</p><p className="text-muted-foreground text-[10px]">Terjual</p></div>
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => { setViewStoreSeller(null); setActiveTab("chat"); }}
                className="flex-1 bg-primary text-white font-bold py-2.5 rounded-xl text-sm flex items-center justify-center gap-2"
              >
                <MessageSquare size={14} /> Chat Penjual
              </button>
              <button
                onClick={() => { setShowReportModal({ type: "penjual", name: sellerName }); }}
                className="w-10 h-10 bg-red-50 border border-red-200 rounded-xl flex items-center justify-center shrink-0"
              >
                <Flag size={15} className="text-red-500" />
              </button>
            </div>
          </div>
        </div>

        {/* Tab */}
        <div className="flex bg-muted mx-4 rounded-xl p-1 gap-1 mb-4">
          {(["produk", "ulasan"] as const).map((t) => (
            <button key={t} onClick={() => setActiveTab(t)}
              className="flex-1 py-2 rounded-lg text-xs font-bold transition-all"
              style={activeTab === t ? { background: "#c41230", color: "#fff" } : { color: "#8a8a9a" }}>
              {t === "produk" ? `Produk (${storeProducts.length})` : `Ulasan (${storeReviews.length})`}
            </button>
          ))}
        </div>

        {activeTab === "produk" && (
          <div className="grid grid-cols-2 gap-3 px-4 pb-8">
            {storeProducts.length === 0 ? (
              <div className="col-span-2 flex flex-col items-center py-16 text-center">
                <Package size={36} className="text-muted-foreground/30 mb-3" />
                <p className="text-foreground font-bold">Belum ada produk</p>
              </div>
            ) : storeProducts.map((p) => (
              <div key={p.id} onClick={() => { setViewStoreSeller(null); setSelectedProduct(p); }}
                className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm cursor-pointer active:scale-95 transition-transform">
                <div className="relative">
                  <img src={p.image} alt={p.name} className="w-full h-32 object-cover bg-muted" />
                  {p.discount && <span className="absolute top-2 left-2 bg-primary text-white text-[9px] font-black px-1.5 py-0.5 rounded-md">-{p.discount}%</span>}
                </div>
                <div className="p-2.5">
                  <p className="text-xs font-semibold text-foreground line-clamp-2 mb-1">{p.name}</p>
                  <p className="text-sm font-black text-primary">{formatPrice(p.price)}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Star size={9} className="text-accent fill-accent" />
                    <span className="text-[10px] text-muted-foreground">{p.rating} · {p.sold} terjual</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "ulasan" && (
          <div className="px-4 pb-8 space-y-3">
            {/* Rating summary */}
            <div className="bg-card rounded-2xl border border-border p-4 flex items-center gap-4">
              <div className="text-center">
                <p className="text-foreground font-black text-4xl leading-none">{avgRating}</p>
                <div className="flex justify-center gap-0.5 mt-1">
                  {[1,2,3,4,5].map((s) => <Star key={s} size={11} className="text-accent fill-accent" />)}
                </div>
                <p className="text-muted-foreground text-[10px] mt-1">{storeReviews.length} ulasan</p>
              </div>
              <div className="flex-1 space-y-1.5">
                {[5,4,3,2,1].map((star) => {
                  const count = storeReviews.filter((r) => r.rating === star).length;
                  return (
                    <div key={star} className="flex items-center gap-2">
                      <span className="text-[10px] text-muted-foreground w-3">{star}</span>
                      <Star size={9} className="text-accent fill-accent shrink-0" />
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-accent rounded-full" style={{ width: `${(count / storeReviews.length) * 100}%` }} />
                      </div>
                      <span className="text-[10px] text-muted-foreground w-3">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {storeReviews.map((r) => (
              <div key={r.id} className="bg-card rounded-2xl border border-border p-4">
                <div className="flex items-center gap-3 mb-2">
                  <img src={r.avatar} alt={r.user} className="w-8 h-8 rounded-full object-cover" />
                  <div className="flex-1">
                    <p className="text-foreground font-bold text-xs">{r.user}</p>
                    <div className="flex items-center gap-1">
                      {[1,2,3,4,5].map((s) => <Star key={s} size={9} className={s <= r.rating ? "text-accent fill-accent" : "text-muted-foreground"} />)}
                      <span className="text-muted-foreground text-[10px] ml-1">{r.date}</span>
                    </div>
                  </div>
                </div>
                <p className="text-[10px] text-primary font-semibold mb-1">{r.product}</p>
                <p className="text-muted-foreground text-sm leading-relaxed">"{r.comment}"</p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── SALES STATS PAGE ──
  function SalesStatsPage() {
    const salesData = [
      { id: "TRX-001", product: "Laptop Asus VivoBook 14",  price: 4500000, status: "selesai", date: "17 Jun", month: "Jun" },
      { id: "TRX-002", product: "Kalkulator Casio FX-991",  price: 360000,  status: "selesai", date: "15 Jun", month: "Jun" },
      { id: "TRX-003", product: "Buku Metode Penelitian",   price: 45000,   status: "selesai", date: "12 Jun", month: "Jun" },
      { id: "TRX-004", product: "Earphone Bluetooth TWS",   price: 95000,   status: "dibatalkan", date: "10 Jun", month: "Jun" },
      { id: "TRX-005", product: "Jaket Almamater UMM",      price: 185000,  status: "proses", date: "8 Jun",  month: "Jun" },
    ];
    const selesai = salesData.filter((s) => s.status === "selesai");
    const totalRevenue = selesai.reduce((s, t) => s + t.price, 0);
    const chartBars = [
      { label: "Feb", value: 280000 },
      { label: "Mar", value: 750000 },
      { label: "Apr", value: 420000 },
      { label: "Mei", value: 1200000 },
      { label: "Jun", value: totalRevenue },
    ];
    const maxVal = Math.max(...chartBars.map((b) => b.value));

    return (
      <div className="fixed inset-0 z-[65] bg-background overflow-y-auto" style={{ maxWidth: 430, margin: "0 auto" }}>
        {/* Header */}
        <div className="bg-primary sticky top-0 z-10 shadow-md">
          <div className="px-4 pt-10 pb-4 flex items-center gap-3">
            <button onClick={() => setShowSalesStats(false)} className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
              <ArrowLeft size={18} className="text-white" />
            </button>
            <div className="flex-1">
              <h1 className="text-white font-black text-lg">Statistik Penjualan</h1>
              <p className="text-white/60 text-[11px]">Juni 2026</p>
            </div>
          </div>
        </div>

        <div className="px-4 pt-5 pb-10 space-y-5">

          {/* Revenue card */}
          <div className="bg-gradient-to-br from-primary to-[#8b0d22] rounded-2xl p-5 shadow-lg">
            <p className="text-white/70 text-xs font-semibold mb-1">Total Pendapatan Bulan Ini</p>
            <p className="text-white font-black text-3xl leading-none mb-1">{formatPrice(totalRevenue)}</p>
            <p className="text-white/60 text-xs flex items-center gap-1">
              <TrendingUp size={11} /> Naik 24% dari bulan lalu
            </p>
          </div>

          {/* KPI grid */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Terjual",     value: selesai.length, suffix: "item",   color: "#10B981", icon: Package },
              { label: "Dibatalkan",  value: salesData.filter((s) => s.status === "dibatalkan").length, suffix: "item", color: "#EF4444", icon: X },
              { label: "Avg. Harga",  value: "Rp " + Math.round(totalRevenue / (selesai.length || 1) / 1000) + "rb", suffix: "", color: "#3B82F6", icon: Banknote },
            ].map(({ label, value, suffix, color, icon: Icon }) => (
              <div key={label} className="bg-card rounded-2xl border border-border p-3.5 text-center shadow-sm">
                <div className="w-8 h-8 rounded-xl mx-auto mb-2 flex items-center justify-center" style={{ background: color + "18" }}>
                  <Icon size={15} style={{ color }} />
                </div>
                <p className="text-foreground font-black text-sm leading-none">{value} <span className="text-[10px] font-normal text-muted-foreground">{suffix}</span></p>
                <p className="text-muted-foreground text-[10px] mt-1">{label}</p>
              </div>
            ))}
          </div>

          {/* Bar chart */}
          <div className="bg-card rounded-2xl border border-border p-4 shadow-sm">
            <p className="text-foreground font-bold text-sm mb-4">Pendapatan 5 Bulan Terakhir</p>
            <div className="flex items-end gap-2 h-32">
              {chartBars.map((b) => (
                <div key={b.label} className="flex-1 flex flex-col items-center gap-1">
                  <p className="text-[9px] text-muted-foreground font-semibold">{formatPrice(b.value).replace("Rp ", "").replace(".000", "rb")}</p>
                  <div className="w-full rounded-t-lg transition-all" style={{
                    height: `${Math.max((b.value / maxVal) * 100, 8)}%`,
                    background: b.label === "Jun" ? "#c41230" : "#e5e7eb",
                  }} />
                  <p className="text-[10px] font-bold" style={{ color: b.label === "Jun" ? "#c41230" : "#8a8a9a" }}>{b.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Top produk */}
          <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-border bg-secondary/50">
              <p className="text-foreground font-bold text-sm flex items-center gap-2"><TrendingUp size={14} className="text-primary" />Produk Terlaris</p>
            </div>
            {selesai.map((t, i) => (
              <div key={t.id} className={`flex items-center gap-3 px-4 py-3 ${i < selesai.length - 1 ? "border-b border-border" : ""}`}>
                <div className="w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs shrink-0"
                  style={{ background: i === 0 ? "#FEF3C7" : i === 1 ? "#F3F4F6" : "#FFF7ED", color: i === 0 ? "#92400E" : i === 1 ? "#6B7280" : "#9A3412" }}>
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-foreground font-semibold text-xs truncate">{t.product}</p>
                  <p className="text-muted-foreground text-[10px]">{t.date}</p>
                </div>
                <p className="text-primary font-black text-sm shrink-0">{formatPrice(t.price)}</p>
              </div>
            ))}
          </div>

          {/* Lihat daftar penjualan */}
          <button
            onClick={() => { setShowSalesStats(false); setActiveTab("profile"); setProfileSubPage("penjualan"); }}
            className="w-full bg-secondary border border-primary/20 text-primary font-bold py-3.5 rounded-2xl text-sm flex items-center justify-center gap-2"
          >
            <ClipboardList size={15} /> Lihat Daftar Penjualan Lengkap
          </button>
        </div>
      </div>
    );
  }

  // ── NOTIFICATION PANEL ──
  const notifData = [
    { id: 1, type: "chat",     icon: MessageCircle, color: "#3B82F6", title: "Pesan baru dari Rizki_FT2022", body: "\"Mas, apakah barangnya masih ada?\"", time: "10 mnt lalu",  read: false },
    { id: 2, type: "order",    icon: ShoppingBag,   color: "#10B981", title: "Pesanan kamu sedang diproses", body: "Powerbank 20000mAh sedang disiapkan penjual", time: "1 jam lalu",  read: false },
    { id: 3, type: "promo",    icon: Tag,           color: "#F59E0B", title: "Flash Sale dimulai! ⚡", body: "Diskon hingga 50% untuk produk elektronik pilihan", time: "2 jam lalu",  read: false },
    { id: 4, type: "like",     icon: Heart,         color: "#EC4899", title: "5 orang menyukai iklanmu", body: "Laptop Lenovo ThinkPad X1 diminati banyak pembeli", time: "3 jam lalu",  read: true },
    { id: 5, type: "order",    icon: Package,       color: "#10B981", title: "Pesanan selesai 🎉", body: "Kalkulator Casio FX-991 telah dikonfirmasi diterima", time: "Kemarin",      read: true },
    { id: 6, type: "system",   icon: Shield,        color: "#8B5CF6", title: "Akun kamu terverifikasi!", body: "NIM mahasiswa UMM kamu berhasil diverifikasi", time: "2 hari lalu",  read: true },
    { id: 7, type: "promo",    icon: Zap,           color: "#F59E0B", title: "Iklan kamu hampir habis masa tayang", body: "Meja Belajar Lipat akan habis dalam 2 hari lagi", time: "3 hari lalu",  read: true },
  ];

  function NotifPanel() {
    const unreadCount = notifData.filter((n) => !n.read && !readNotifs.includes(n.id)).length;

    return (
      <>
        {/* Backdrop */}
        <div className="fixed inset-0 z-[70]" onClick={() => setShowNotif(false)} />

        {/* Panel */}
        <div
          className="fixed top-0 right-0 bottom-0 z-[80] bg-card shadow-2xl flex flex-col"
          style={{ width: "min(360px, 100vw)", maxWidth: 430, borderLeft: "1px solid rgba(0,0,0,0.08)" }}
        >
          {/* Header */}
          <div className="bg-primary px-4 pt-10 pb-4">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-white font-black text-xl">Notifikasi</h2>
              <button onClick={() => setShowNotif(false)} className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <X size={16} className="text-white" />
              </button>
            </div>
            <p className="text-white/60 text-xs">
              {unreadCount > 0 ? `${unreadCount} belum dibaca` : "Semua sudah dibaca"}
            </p>
          </div>

          {/* Mark all read */}
          {unreadCount > 0 && (
            <button
              onClick={() => setReadNotifs(notifData.map((n) => n.id))}
              className="mx-4 mt-3 text-primary text-xs font-bold text-right block"
            >
              Tandai semua dibaca
            </button>
          )}

          {/* List */}
          <div className="flex-1 overflow-y-auto divide-y divide-border">
            {notifData.map((n) => {
              const isRead = n.read || readNotifs.includes(n.id);
              return (
                <button
                  key={n.id}
                  onClick={() => setReadNotifs((r) => r.includes(n.id) ? r : [...r, n.id])}
                  className="w-full flex items-start gap-3 px-4 py-3.5 text-left transition-colors hover:bg-muted/50 active:bg-muted"
                  style={{ background: isRead ? "transparent" : "rgba(196,18,48,0.04)" }}
                >
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 mt-0.5" style={{ background: n.color + "18" }}>
                    <n.icon size={18} style={{ color: n.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm leading-snug ${isRead ? "text-foreground font-medium" : "text-foreground font-bold"}`}>
                        {n.title}
                      </p>
                      {!isRead && <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />}
                    </div>
                    <p className="text-muted-foreground text-xs leading-relaxed mt-0.5 line-clamp-2">{n.body}</p>
                    <p className="text-muted-foreground text-[10px] mt-1.5 flex items-center gap-1">
                      <Clock size={9} /> {n.time}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </>
    );
  }

  // ── WISHLIST PAGE ──
  function WishlistPage() {
    const wishlisted = allProducts.filter((p) => wishlist.includes(p.id));

    return (
      <>
        {/* Backdrop */}
        <div className="fixed inset-0 z-[70]" onClick={() => setShowWishlist(false)} />

        {/* Panel */}
        <div
          className="fixed top-0 right-0 bottom-0 z-[80] bg-card shadow-2xl flex flex-col"
          style={{ width: "min(360px, 100vw)", maxWidth: 430, borderLeft: "1px solid rgba(0,0,0,0.08)" }}
        >
          {/* Header */}
          <div className="bg-primary px-4 pt-10 pb-4">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-white font-black text-xl">Wishlist</h2>
              <button onClick={() => setShowWishlist(false)} className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <X size={16} className="text-white" />
              </button>
            </div>
            <p className="text-white/60 text-xs">{wishlisted.length} produk disimpan</p>
          </div>

          <div className="flex-1 overflow-y-auto">
            {wishlisted.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full pb-20 text-center px-8">
                <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mb-4">
                  <Heart size={36} className="text-primary/30" />
                </div>
                <p className="text-foreground font-bold text-base mb-1">Wishlist masih kosong</p>
                <p className="text-muted-foreground text-sm">Tekan ikon ♡ pada produk untuk menyimpannya di sini</p>
                <button
                  onClick={() => setShowWishlist(false)}
                  className="mt-6 bg-primary text-white font-bold px-6 py-3 rounded-2xl text-sm"
                >
                  Jelajahi Produk
                </button>
              </div>
            ) : (
              <div className="p-4 space-y-3">
                {wishlisted.map((p) => (
                  <div key={p.id} className="bg-background rounded-2xl border border-border flex items-center gap-3 p-3 shadow-sm">
                    <button
                      onClick={() => { setShowWishlist(false); setSelectedProduct(p); }}
                      className="shrink-0"
                    >
                      <img src={p.image} alt={p.name} className="w-16 h-16 rounded-xl object-cover bg-muted" />
                    </button>
                    <button
                      onClick={() => { setShowWishlist(false); setSelectedProduct(p); }}
                      className="flex-1 min-w-0 text-left"
                    >
                      <p className="text-foreground font-bold text-sm line-clamp-2 leading-tight">{p.name}</p>
                      <p className="text-primary font-black text-sm mt-0.5">{formatPrice(p.price)}</p>
                      {p.originalPrice && (
                        <p className="text-muted-foreground text-[11px] line-through">{formatPrice(p.originalPrice)}</p>
                      )}
                      <div className="flex items-center gap-1 mt-1">
                        <Star size={9} className="text-accent fill-accent" />
                        <span className="text-[10px] text-muted-foreground">{p.rating} · {p.sold} terjual</span>
                      </div>
                    </button>
                    <div className="flex flex-col gap-2 shrink-0">
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleWishlist(p.id); }}
                        className="w-8 h-8 bg-secondary rounded-xl flex items-center justify-center"
                      >
                        <Heart size={14} className="text-primary fill-primary" />
                      </button>
                      <button
                        onClick={() => { setShowWishlist(false); setSelectedProduct(p); }}
                        className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center"
                      >
                        <ShoppingCart size={13} className="text-white" />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Total saved */}
                <div className="bg-secondary rounded-2xl p-3.5 text-center mt-2">
                  <p className="text-muted-foreground text-xs">Total nilai wishlist</p>
                  <p className="text-primary font-black text-lg">{formatPrice(wishlisted.reduce((s, p) => s + p.price, 0))}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </>
    );
  }

  // ── CATEGORIES PAGE ──
  function CategoriesPage() {
    const [activeCategory, setActiveCategory] = useState(activeCategoryFilter);
    const [sortBy, setSortBy] = useState("terbaru");
    const [searchQuery, setSearchQuery] = useState("");

    const categories = ["Semua", "Buku & Modul", "Elektronik", "Fashion", "Makanan", "Jasa", "Kendaraan", "Kost", "Alat Tulis", "Olahraga", "Lainnya"];
    const sorts = [
      { key: "terbaru", label: "Terbaru" },
      { key: "termurah", label: "Termurah" },
      { key: "termahal", label: "Termahal" },
      { key: "terlaris", label: "Terlaris" },
    ];

    const categoryKeywords: Record<string, string[]> = {
      "Buku & Modul": ["buku", "modul", "metode", "kalkulus"],
      "Elektronik":   ["laptop", "earphone", "powerbank", "asus", "casio", "bluetooth"],
      "Fashion":      ["jaket", "almamater", "baju", "kaos", "celana"],
      "Makanan":      ["nasi", "makan", "kotak", "makanan", "minuman"],
      "Jasa":         ["jasa", "desain", "poster", "ppt"],
      "Kendaraan":    ["motor", "honda", "yamaha", "sepeda"],
      "Kost":         ["kos", "kost", "kontrakan", "furnished"],
      "Alat Tulis":   ["alat", "tulis", "pulpen", "pensil"],
      "Olahraga":     ["olahraga", "sepatu", "jersey"],
      "Lainnya":      [],
    };

    const filtered = allProducts
      .filter((p) => {
        const keywords = categoryKeywords[activeCategory] ?? [];
        const nameLower = p.name.toLowerCase();
        const matchCat =
          activeCategory === "Semua" ||
          (activeCategory === "Lainnya"
            ? !Object.entries(categoryKeywords)
                .filter(([k]) => k !== "Lainnya")
                .some(([, kws]) => kws.some((kw) => nameLower.includes(kw)))
            : keywords.some((kw) => nameLower.includes(kw)));
        const matchSearch = searchQuery === "" || nameLower.includes(searchQuery.toLowerCase());
        return matchCat && matchSearch;
      })
      .sort((a, b) => {
        if (sortBy === "termurah") return a.price - b.price;
        if (sortBy === "termahal") return b.price - a.price;
        if (sortBy === "terlaris") return (b.sold || 0) - (a.sold || 0);
        return 0;
      });

    return (
      <div className="min-h-screen bg-background pb-24">
        <header className="bg-primary text-primary-foreground sticky top-0 z-50 shadow-lg">
          <div className="px-4 pt-4 pb-3">
            <div className="flex items-center justify-between mb-3">
              <span className="text-lg font-black">Kategori</span>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari produk..."
                className="w-full bg-white text-foreground rounded-xl pl-9 pr-4 py-2 text-sm outline-none"
              />
            </div>
          </div>
        </header>

        <div className="px-4 pt-3 overflow-x-auto flex gap-2 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => { setActiveCategory(cat); setActiveCategoryFilter(cat); }}
              className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-semibold flex-shrink-0 ${
                activeCategory === cat
                  ? "bg-primary text-white"
                  : "bg-card text-muted-foreground border border-border"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="px-4 pt-3 flex items-center justify-between">
          <div className="flex gap-2">
            {sorts.map((s) => (
              <button
                key={s.key}
                onClick={() => setSortBy(s.key)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                  sortBy === s.key
                    ? "bg-primary text-white"
                    : "bg-card text-muted-foreground border border-border"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
          <span className="text-xs text-muted-foreground">{filtered.length} produk ditemukan</span>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-center px-8">
            <Package className="w-14 h-14 text-muted-foreground/40" />
            <p className="font-bold text-base text-foreground">Produk tidak ditemukan</p>
            <p className="text-sm text-muted-foreground">Coba kategori atau kata kunci lain</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 px-4 pt-3">
            {filtered.map((p) => (
              <div
                key={p.id}
                onClick={() => setSelectedProduct(p)}
                className="bg-card rounded-2xl overflow-hidden shadow-sm border border-border cursor-pointer active:scale-95 transition-transform"
              >
                <div className="relative">
                  <img src={p.image} alt={p.name} className="w-full h-36 object-cover" />
                  {p.discount && (
                    <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                      -{p.discount}%
                    </span>
                  )}
                  {p.isNew && !p.discount && (
                    <span className="absolute top-2 left-2 bg-green-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                      Baru
                    </span>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleWishlist(p.id); }}
                    className="absolute top-2 right-2 w-7 h-7 bg-white/90 rounded-full flex items-center justify-center shadow"
                  >
                    <Heart className={`w-3.5 h-3.5 ${wishlist.includes(p.id) ? "fill-red-500 text-red-500" : "text-muted-foreground"}`} />
                  </button>
                </div>
                <div className="p-2.5">
                  <p className="text-xs font-semibold text-foreground line-clamp-2 mb-1 leading-snug">{p.name}</p>
                  <p className="text-sm font-black text-primary mb-1">{formatPrice(p.price)}</p>
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground mb-0.5">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>{p.rating}</span>
                    <span>·</span>
                    <span>{p.sold} terjual</span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    <span className="truncate">{p.location}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── SELL PAGE ──

  const contextValue = {
    screen, setScreen: setScreenAndPath,
    activeTab, setActiveTab: setActiveTabAndPath,
    selectedProduct, setSelectedProduct,
    wishlist, toggleWishlist,
    activeChatId, setActiveChatId,
    messages, setMessages,
    inputText, setInputText,
    chatSearch, setChatSearch,
    profileSubPage, setProfileSubPage: setProfileSubPageAndPath,
    editingItem, setEditingItem,
    showNotif, setShowNotif,
    showWishlist, setShowWishlist,
    readNotifs, setReadNotifs,
    showReportModal, setShowReportModal,
    showSuggestionBox, setShowSuggestionBox,
    viewStoreSeller, setViewStoreSeller,
    showSalesStats, setShowSalesStats,
    activeCategoryFilter, setActiveCategoryFilter,
    activeBanner, setActiveBanner,
    searchFocused, setSearchFocused,
    globalSearch, setGlobalSearch,
    showSearchResults, setShowSearchResults,
    trackingOrder, setTrackingOrder,
    purchaseData, setPurchaseData,
    salesData, setSalesData,
    profileAvatar, setProfileAvatar,
    profileBanner, setProfileBanner,
  };

  if (screen === "admin") {
    return (
      <AppContext.Provider value={contextValue}>
        <AdminDashboard onLogout={() => setScreen("landing")} />
      </AppContext.Provider>
    );
  }

  return (
    <AppContext.Provider value={contextValue}>
    <div
      className="min-h-screen bg-background"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", maxWidth: 430, margin: "0 auto", position: "relative" }}
    >
      {/* ── LANDING / AUTH SCREENS ── */}
      {screen === "landing" && (
        <div className="fixed inset-0 z-[100] overflow-y-auto animate-page" style={{ maxWidth: 430, margin: "0 auto", background: "#f8f8f8" }}>
          <LandingPage />
        </div>
      )}
      {(screen === "login" || screen === "register") && (
        <div className="fixed inset-0 z-[100] overflow-y-auto animate-page" style={{ maxWidth: 430, margin: "0 auto", background: "#f8f8f8" }}>
          <AuthPage mode={screen as "login" | "register"} />
        </div>
      )}

      {/* ── ORDER TRACKING ── */}
      {trackingOrder && <div className="animate-page"><OrderTrackingPage /></div>}

      {/* ── SEARCH RESULTS ── */}
      {showSearchResults && <div className="animate-page"><SearchResultsPage /></div>}

      {/* ── REPORT MODAL ── */}
      {showReportModal && <ReportModal />}

      {/* ── SUGGESTION BOX MODAL ── */}
      {showSuggestionBox && <SuggestionBoxModal />}

      {/* ── POST REQUEST MODAL ── */}
      {showPostRequestModal && <PostRequestModal />}

      {/* ── STORE PAGE ── */}
      {viewStoreSeller && <div className="animate-page"><StorePage sellerName={viewStoreSeller} /></div>}

      {/* ── SALES STATS PAGE ── */}
      {showSalesStats && <div className="animate-page"><SalesStatsPage /></div>}

      {/* ── NOTIFICATION PANEL ── */}
      {showNotif && <div className="animate-page"><NotifPanel /></div>}

      {/* ── WISHLIST PANEL ── */}
      {showWishlist && <div className="animate-page"><WishlistPage /></div>}

      {/* ── PRODUCT DETAIL PAGE ── */}
      {selectedProduct && <div className="animate-page"><ProductDetailPage product={selectedProduct} /></div>}

      {/* ── SELL PAGE ── */}
      {activeTab === "sell" && (
        <div className="fixed inset-0 z-50 bg-background overflow-y-auto animate-page" style={{ maxWidth: 430, margin: "0 auto" }}>
          <SellPage />
        </div>
      )}

      {/* ── CHAT PAGE (full-screen takeover) ── */}
      {activeTab === "chat" && activeChatId !== null && (
        <div className="fixed inset-0 z-50 bg-background animate-page" style={{ maxWidth: 430, margin: "0 auto" }}>
          <ChatPage />
        </div>
      )}

      {/* ── CHAT LIST PAGE ── */}
      {activeTab === "chat" && activeChatId === null && (
        <div className="animate-page">
          <ChatPage />
          {/* Bottom nav for chat list */}
        </div>
      )}

      {/* ── PROFILE PAGE ── */}
      {activeTab === "profile" && <div className="animate-page"><ProfilePage /></div>}

      {activeTab === "categories" && <div className="animate-page"><CategoriesPage /></div>}

      {/* ── HOME PAGE ── */}
      {activeTab !== "chat" && activeTab !== "sell" && activeTab !== "profile" && activeTab !== "categories" && (
        <div className="animate-page">
      {/* ── HEADER ── */}
      <header className="bg-primary text-primary-foreground sticky top-0 z-50 shadow-lg">
        <div className="px-4 pt-4 pb-3">
          {/* Top row */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center overflow-hidden">
                <img src={logo} alt="Logo" className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="text-white/70 text-[10px] leading-none mb-0.5">Selamat datang 👋</p>
                <p className="text-white font-bold text-sm leading-none">Lapak Jas Merah</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="relative p-1.5" onClick={() => { setShowNotif(true); setShowWishlist(false); }}>
                <Bell size={20} className="text-white" />
                {notifData.filter((n) => !n.read && !readNotifs.includes(n.id)).length > 0 && (
                  <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-accent rounded-full flex items-center justify-center border border-primary">
                    <span className="text-[9px] font-black text-foreground">
                      {notifData.filter((n) => !n.read && !readNotifs.includes(n.id)).length}
                    </span>
                  </span>
                )}
              </button>
              <button className="relative p-1.5" onClick={() => { setShowWishlist(true); setShowNotif(false); }}>
                <Heart size={20} className="text-white" />
                {wishlist.length > 0 && (
                  <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-accent rounded-full flex items-center justify-center border border-primary">
                    <span className="text-[9px] font-black text-foreground">{wishlist.length}</span>
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Location row */}
          <div className="flex items-center gap-1 mb-3">
            <MapPin size={12} className="text-white/60" />
            <span className="text-white/70 text-xs">Universitas Muhammadiyah Malang</span>
          </div>

          {/* Search bar */}
          <div
            className="flex items-center gap-2 bg-white rounded-xl px-3 py-2.5 shadow-sm"
            style={{ border: searchFocused ? "2px solid #f59e0b" : "2px solid transparent", transition: "border 0.2s" }}
          >
            <Search size={16} className="text-muted-foreground shrink-0" />
            <input
              type="text"
              value={globalSearch}
              placeholder="Cari buku, elektronik, kos..."
              className="flex-1 text-sm text-foreground bg-transparent outline-none placeholder:text-muted-foreground"
              onFocus={() => { setSearchFocused(true); setShowSearchResults(true); }}
              onBlur={() => setSearchFocused(false)}
              onChange={(e) => { setGlobalSearch(e.target.value); setShowSearchResults(true); }}
              onKeyDown={(e) => { if (e.key === "Enter") setShowSearchResults(true); }}
            />
            <button
              onClick={() => setShowSearchResults(true)}
              className="bg-primary text-white text-xs font-semibold px-3 py-1 rounded-lg"
            >
              Cari
            </button>
          </div>
        </div>
      </header>

      {/* ── MAIN SCROLL ── */}
      <main className="pb-24 overflow-y-auto">

        {/* ── BANNER CAROUSEL ── */}
        <div className="px-4 pt-4">
          <div className="relative rounded-2xl overflow-hidden shadow-md" style={{ height: 160 }}>
            {banners.map((b, i) => (
              <div
                key={b.id}
                className={`absolute inset-0 transition-opacity duration-500 ${i === activeBanner ? "opacity-100" : "opacity-0 pointer-events-none"}`}
              >
                <img
                  src={b.img}
                  alt={b.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className={`absolute inset-0 bg-gradient-to-r ${b.bg} opacity-85`} />
                <div className="relative z-10 p-4 h-full flex flex-col justify-between">
                  <span className="bg-accent text-foreground text-[10px] font-bold px-2.5 py-1 rounded-full w-fit">
                    {b.badge}
                  </span>
                  <div>
                    <h2 className="text-white font-black text-xl leading-tight whitespace-pre-line mb-1">
                      {b.title}
                    </h2>
                    <p className="text-white/80 text-xs">{b.sub}</p>
                  </div>
                </div>
              </div>
            ))}

            {/* Nav buttons */}
            <button
              onClick={() => setActiveBanner((p) => (p - 1 + banners.length) % banners.length)}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-6 h-6 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center"
            >
              <ChevronLeft size={14} className="text-white" />
            </button>
            <button
              onClick={() => setActiveBanner((p) => (p + 1) % banners.length)}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-6 h-6 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center"
            >
              <ChevronRight size={14} className="text-white" />
            </button>

            {/* Dots */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
              {banners.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveBanner(i)}
                  className="rounded-full transition-all"
                  style={{
                    width: i === activeBanner ? 20 : 6,
                    height: 6,
                    background: i === activeBanner ? "#f59e0b" : "rgba(255,255,255,0.5)",
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ── QUICK STATS ── */}
        <div className="px-4 pt-4 grid grid-cols-3 gap-2">
          {[
            { icon: Package, label: "12.4K Produk", color: "#c41230" },
            { icon: Shield, label: "100% Aman", color: "#10B981" },
            { icon: TrendingUp, label: "4.9K Transaksi", color: "#8B5CF6" },
          ].map(({ icon: Icon, label, color }) => (
            <div key={label} className="bg-card rounded-xl px-2 py-2.5 flex items-center gap-2 shadow-sm border border-border">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: color + "18" }}>
                <Icon size={14} style={{ color }} />
              </div>
              <span className="text-[10px] font-semibold text-foreground leading-tight">{label}</span>
            </div>
          ))}
        </div>

        {/* ── CATEGORIES ── */}
        <div className="pt-5">
          <div className="px-4 flex items-center justify-between mb-3">
            <h3 className="text-foreground font-bold text-base">Kategori</h3>
            <button
              onClick={() => { setActiveCategoryFilter("Semua"); setActiveTab("categories"); }}
              className="text-primary text-xs font-semibold flex items-center gap-0.5"
            >
              Semua <ChevronRight size={12} />
            </button>
          </div>
          <div className="grid grid-cols-4 gap-3 px-4">
            {categories.map(({ icon: Icon, label, color }) => {
              // Map home category labels to CategoriesPage filter labels
              const filterMap: Record<string, string> = {
                "Buku & Modul": "Buku & Modul",
                "Elektronik": "Elektronik",
                "Fashion": "Fashion",
                "Makanan": "Makanan",
                "Jasa": "Jasa",
                "Kendaraan": "Kendaraan",
                "Kost & Kontrakan": "Kost",
                "Lainnya": "Lainnya",
              };
              const filterLabel = filterMap[label] ?? "Semua";
              return (
                <button
                  key={label}
                  onClick={() => { setActiveCategoryFilter(filterLabel); setActiveTab("categories"); }}
                  className="flex flex-col items-center gap-1.5 group"
                >
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm transition-transform group-active:scale-95"
                    style={{ background: color + "15", border: `1.5px solid ${color}22` }}
                  >
                    <Icon size={22} style={{ color }} />
                  </div>
                  <span className="text-[10px] font-semibold text-muted-foreground text-center leading-tight line-clamp-2">
                    {label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>


        {/* ── PAPAN PERMINTAAN ── */}
        <div className="pt-6">
          <div className="px-4 flex items-center justify-between mb-3">
            <div>
              <h3 className="text-foreground font-bold text-base">📋 Papan Permintaan</h3>
              <p className="text-muted-foreground text-[11px]">Barang & jasa yang sedang dicari</p>
            </div>
            <button
              onClick={() => setShowPostRequestModal(true)}
              className="flex items-center gap-1.5 bg-primary text-white text-xs font-bold px-3 py-2 rounded-xl active:scale-95 transition-transform"
            >
              <PlusCircle size={12} />
              Pasang
            </button>
          </div>

          <div className="flex gap-3 overflow-x-auto px-4 pb-2" style={{ scrollbarWidth: "none" }}>
            {requests.map((req) => {
              const urgencyConfig = {
                normal: { label: "Normal", bg: "#6B728018", text: "#6B7280", dot: "#6B7280" },
                segera: { label: "Segera", bg: "#F59E0B18", text: "#D97706", dot: "#F59E0B" },
                mendesak: { label: "Mendesak!", bg: "#EF444418", text: "#DC2626", dot: "#EF4444" },
              }[req.urgency];
              return (
                <div
                  key={req.id}
                  className="shrink-0 bg-card rounded-2xl border border-border shadow-sm overflow-hidden flex flex-col"
                  style={{ width: 220 }}
                >
                  {/* Top color stripe */}
                  <div className="h-1.5 w-full" style={{ background: req.categoryColor }} />

                  <div className="p-3.5 flex flex-col flex-1">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span
                        className="text-[9px] font-black px-2 py-0.5 rounded-full"
                        style={{ background: urgencyConfig.bg, color: urgencyConfig.text }}
                      >
                        ● {urgencyConfig.label}
                      </span>
                      <span
                        className="text-[9px] font-semibold px-2 py-0.5 rounded-full"
                        style={{ background: req.categoryColor + "18", color: req.categoryColor }}
                      >
                        {req.category}
                      </span>
                    </div>

                    {/* Title */}
                    <p className="text-foreground font-bold text-sm leading-tight line-clamp-2 mb-1.5">{req.title}</p>

                    {/* Description */}
                    <p className="text-muted-foreground text-[11px] leading-relaxed line-clamp-2 mb-3 flex-1">{req.description}</p>

                    {/* Budget */}
                    <div className="bg-muted/60 rounded-xl px-3 py-2 mb-3">
                      <p className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wide">Budget</p>
                      <p className="text-primary font-black text-sm">
                        {formatPrice(req.budget)}
                        {req.budgetMax ? ` – ${formatPrice(req.budgetMax)}` : ""}
                      </p>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <img src={req.posterAvatar} alt={req.poster} className="w-5 h-5 rounded-full object-cover" />
                        <div>
                          <p className="text-[9px] font-semibold text-foreground leading-none">{req.poster}</p>
                          <p className="text-[8px] text-muted-foreground">{req.postedAt}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setActiveTab("chat")}
                        className="flex items-center gap-1 bg-primary/10 text-primary text-[10px] font-bold px-2.5 py-1.5 rounded-lg active:scale-95 transition-transform"
                      >
                        <MessageCircle size={11} />
                        {req.offers > 0 ? `${req.offers} penawaran` : "Tawarkan"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Post new CTA card */}
            <div
              className="shrink-0 rounded-2xl border-2 border-dashed border-primary/30 flex flex-col items-center justify-center gap-2 cursor-pointer active:scale-95 transition-transform"
              style={{ width: 160, minHeight: 200, background: "rgba(196,18,48,0.03)" }}
              onClick={() => setShowPostRequestModal(true)}
            >
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                <PlusCircle size={24} className="text-primary" />
              </div>
              <p className="text-primary font-bold text-xs text-center px-3 leading-tight">Pasang<br />Permintaanmu</p>
              <p className="text-muted-foreground text-[10px] text-center px-3 leading-tight">Beritahu penjual apa yang kamu cari</p>
            </div>
          </div>
        </div>

        {/* ── JUAL SEKARANG BANNER ── */}
        <div className="px-4 pt-6">
          <div className="bg-gradient-to-r from-[#f59e0b] to-[#f97316] rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-white/80 text-xs font-semibold">Punya barang nganggur?</p>
              <p className="text-white font-black text-base leading-tight">Jual Sekarang,\nGratis Ongkir!</p>
            </div>
            <button
              onClick={() => setActiveTab("sell")}
              className="bg-white text-foreground text-xs font-black px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-md active:scale-95 transition-transform"
            >
              <PlusCircle size={13} className="text-primary" />
              Jual
            </button>
          </div>
        </div>

        {/* ── PRODUK TERBARU ── */}
        <div className="pt-6 pb-4">
          <div className="px-4 flex items-center justify-between mb-3">
            <h3 className="text-foreground font-bold text-base">Produk Terbaru</h3>
            <button
              onClick={() => { setActiveCategoryFilter("Semua"); setActiveTab("categories"); }}
              className="text-primary text-xs font-semibold flex items-center gap-0.5 cursor-pointer active:scale-95 transition-transform"
            >
              Lihat Semua <ChevronRight size={12} />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3 px-4">
            {recentProducts.map((p) => (
              <div
                key={p.id}
                onClick={() => setSelectedProduct(p)}
                className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden active:scale-95 transition-transform cursor-pointer"
              >
                <div className="relative">
                  <img src={p.image} alt={p.name} className="w-full h-36 object-cover bg-muted" />
                  {p.isNew && (
                    <span className="absolute top-2 left-2 bg-[#10B981] text-white text-[9px] font-black px-1.5 py-0.5 rounded-md">
                      Baru
                    </span>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleWishlist(p.id); }}
                    className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm"
                  >
                    <Heart
                      size={11}
                      className={wishlist.includes(p.id) ? "text-primary fill-primary" : "text-muted-foreground"}
                    />
                  </button>
                </div>
                <div className="p-3">
                  <p className="text-foreground font-semibold text-xs leading-tight line-clamp-2 mb-1.5">{p.name}</p>
                  <p className="text-primary font-black text-sm mb-1">{formatPrice(p.price)}</p>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-0.5">
                      <Star size={9} className="text-accent fill-accent" />
                      <span className="text-[9px] font-semibold text-muted-foreground">{p.rating}</span>
                    </div>
                    <span className="text-[9px] text-muted-foreground">{p.sold} terjual</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin size={9} className="text-muted-foreground shrink-0" />
                    <span className="text-[10px] text-muted-foreground truncate">{p.location}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── TRUST SECTION ── */}
        <div className="px-4 pt-2 pb-2">
          <div className="bg-secondary rounded-2xl p-4">
            <p className="text-primary font-bold text-sm mb-3 text-center">Kenapa Lapak Jas Merah?</p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Shield, label: "Transaksi Aman", desc: "Escrow & verifikasi" },
                { icon: User, label: "Khusus UMM", desc: "Terverifikasi NIM" },
                { icon: Tag, label: "Harga Mahasiswa", desc: "Selalu terjangkau" },
              ].map(({ icon: Icon, label, desc }) => (
                <div key={label} className="flex flex-col items-center text-center gap-1.5">
                  <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                    <Icon size={16} className="text-white" />
                  </div>
                  <p className="text-foreground font-bold text-[10px] leading-tight">{label}</p>
                  <p className="text-muted-foreground text-[9px] leading-tight">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

      </main>

        </div>
      )}

      {/* ── BOTTOM NAVIGATION ── */}
      {activeChatId === null && activeTab !== "sell" && (
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full bg-card border-t border-border shadow-2xl z-50" style={{ maxWidth: 430 }}>
        <div className="flex items-center justify-around px-2 py-2">
          {[
            { id: "home", icon: Home, label: "Beranda" },
            { id: "categories", icon: Grid3X3, label: "Kategori" },
            { id: "sell", icon: PlusCircle, label: "Jual", special: true },
            { id: "chat", icon: MessageCircle, label: "Chat" },
            { id: "profile", icon: User, label: "Profil" },
          ].map(({ id, icon: Icon, label, special }) =>
            special ? (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className="flex flex-col items-center -mt-5"
              >
                <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center shadow-lg border-4 border-background">
                  <Icon size={24} className="text-white" />
                </div>
                <span className="text-[9px] font-bold text-primary mt-1">{label}</span>
              </button>
            ) : (
              <button
                key={id}
                onClick={() => { setActiveTab(id); if (id !== "chat") setActiveChatId(null); }}
                className="flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-colors relative"
              >
                <div className="relative">
                  <Icon
                    size={20}
                    className={activeTab === id ? "text-primary" : "text-muted-foreground"}
                    style={{ strokeWidth: activeTab === id ? 2.5 : 1.75 }}
                  />
                  {id === "chat" && totalUnread > 0 && (
                    <span className="absolute -top-1 -right-1.5 w-4 h-4 bg-primary text-white text-[9px] font-black rounded-full flex items-center justify-center">
                      {totalUnread}
                    </span>
                  )}
                </div>
                <span
                  className="text-[9px] font-semibold"
                  style={{ color: activeTab === id ? "#c41230" : "#8a8a9a" }}
                >
                  {label}
                </span>
              </button>
            )
          )}
        </div>
        {/* Safe area padding */}
        <div style={{ height: "env(safe-area-inset-bottom, 0px)" }} />
      </nav>
      )}
      {toastMessage && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-neutral-900 text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-lg z-[999] flex items-center gap-2 max-w-[90%] whitespace-nowrap">
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
    </AppContext.Provider>
  );
}
