import { toast } from "react-hot-toast";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Star,
  MapPin,
  BadgeCheck,
  Camera,
  Settings,
  TrendingUp,
  ChevronRight,
  Heart,
  Eye,
  Edit3,
  MoreVertical,
  PlusCircle,
  ClipboardList,
  Package,
  Wallet,
  Lock,
  Bell as BellIcon,
  HelpCircle,
  MessageSquare,
  Shield,
  ExternalLink,
  LogOut,
  User,
  Phone,
  CheckCircle2,
  AlertCircle,
  FileText,
  Banknote,
  ChevronDown,
  ToggleLeft,
  ToggleRight,
  X,
  Info,
  Flag,
  ShoppingBag,
  Search,
  Clock,
  CheckCheck,
  Sun,
  Moon,
} from "lucide-react";
import { useApp } from "../context";
import { useAuth } from "../../hooks/useAuth";
import { authService } from "../../services/authService";
import { formatPrice, productDescriptions } from "../data";

// ── DAFTAR PENJUALAN ──
function SalesPage({ onBack }: { onBack: () => void }) {
  const {
    
    setShowReportModal,
    salesData,
    setSalesData,
    purchaseData,
    setPurchaseData,
    trackingOrder,
    setTrackingOrder,
    setActiveTab,
    startChat,
  } = useApp();
  const [salesTab, setSalesTab] = useState<"semua" | "proses" | "selesai" | "dibatalkan">("semua");
  const [showConfirmModal, setShowConfirmModal] = useState<string | null>(null);

  const statusConfig = {
    dikonfirmasi: { label: "Dikonfirmasi", bg: "#E0F2FE", text: "#0369A1" },
    diproses:     { label: "Diproses",     bg: "#FEF3C7", text: "#92400E" },
    menuju_lokasi:{ label: "Menuju COD",   bg: "#F5F3FF", text: "#6D28D9" },
    selesai:      { label: "Selesai",      bg: "#D1FAE5", text: "#065F46" },
    dibatalkan:   { label: "Dibatalkan",   bg: "#FEE2E2", text: "#991B1B" },
  };

  function updateOrderStatus(saleId: string, newStatus: "dikonfirmasi" | "diproses" | "menuju_lokasi" | "selesai" | "dibatalkan") {
    setSalesData((prev) =>
      prev.map((s) => s.id === saleId ? { ...s, status: newStatus } : s)
    );

    const orderIdNum = saleId.slice(-6);

    setPurchaseData((prev) =>
      prev.map((p) => p.id.slice(-6) === orderIdNum ? { ...p, status: newStatus } : p)
    );

    if (trackingOrder && trackingOrder.id.slice(-6) === orderIdNum) {
      setTrackingOrder({
        ...trackingOrder,
        status: newStatus,
      });
    }
  }

  function confirmShipped(id: string) {
    updateOrderStatus(id, "selesai");
    setShowConfirmModal(null);
  }

  const filtered = salesTab === "semua"
    ? salesData
    : salesTab === "proses"
      ? salesData.filter((s) => s.status === "dikonfirmasi" || s.status === "diproses" || s.status === "menuju_lokasi")
      : salesData.filter((s) => s.status === salesTab);

  const totalPendapatan = salesData.filter((s) => s.status === "selesai").reduce((sum, s) => sum + s.price * s.qty, 0);

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Header */}
      <div className="bg-primary sticky top-0 z-40 shadow-md">
        <div className="px-4 pt-10 pb-4 flex items-center gap-3">
          <button onClick={onBack} className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
            <ArrowLeft size={18} className="text-white" />
          </button>
          <div className="flex-1">
            <h1 className="text-white font-black text-lg">Daftar Penjualan</h1>
            <p className="text-white/60 text-[11px]">{salesData.length} transaksi total</p>
          </div>
        </div>

        {/* Summary card */}
        <div className="mx-4 mb-4 bg-white/10 rounded-2xl p-3.5 flex items-center justify-between">
          <div>
            <p className="text-white/70 text-[11px] font-semibold">Total Pendapatan</p>
            <p className="text-white font-black text-xl">{formatPrice(totalPendapatan)}</p>
          </div>
          <div className="flex gap-4 text-center">
            <div>
              <p className="text-white font-black text-lg leading-none">{salesData.filter((s) => s.status === "selesai").length}</p>
              <p className="text-white/60 text-[10px] mt-0.5">Selesai</p>
            </div>
            <div>
              <p className="text-white font-black text-lg leading-none">
                {salesData.filter((s) => s.status === "dikonfirmasi" || s.status === "diproses" || s.status === "menuju_lokasi").length}
              </p>
              <p className="text-white/60 text-[10px] mt-0.5">Proses</p>
            </div>
          </div>
        </div>

        {/* Tab filter */}
        <div className="flex gap-1 px-4 pb-3 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          {(["semua", "proses", "selesai", "dibatalkan"] as const).map((t) => (
            <button key={t} onClick={() => setSalesTab(t)}
              className="shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors"
              style={salesTab === t ? { background: "#fff", color: "#c41230" } : { background: "rgba(255,255,255,0.15)", color: "#fff" }}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="px-4 pt-4 space-y-3">
        {filtered.length === 0 && (
          <div className="flex flex-col items-center py-20 text-center">
            <Package size={40} className="text-muted-foreground/30 mb-3" />
            <p className="text-foreground font-bold">Tidak ada transaksi</p>
            <p className="text-muted-foreground text-sm">Belum ada penjualan di kategori ini</p>
          </div>
        )}
        {filtered.map((sale) => {
          const cfg = statusConfig[sale.status as keyof typeof statusConfig] || { label: sale.status, bg: "#E5E7EB", text: "#374151" };
          return (
            <div key={sale.id} className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
              {/* Header row */}
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-muted/40">
                <span className="text-[11px] font-bold text-muted-foreground">{sale.id}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground">{sale.date}</span>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full" style={{ background: cfg.bg, color: cfg.text }}>{cfg.label}</span>
                </div>
              </div>

              {/* Product row */}
              <div className="flex items-center gap-3 px-4 py-3">
                <img src={sale.image} alt="" className="w-14 h-14 rounded-xl object-cover bg-muted shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-foreground font-bold text-sm truncate">{sale.product}</p>
                  <p className="text-primary font-black text-sm">{formatPrice(sale.price)} {sale.qty > 1 && <span className="text-muted-foreground font-normal">×{sale.qty}</span>}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <img src={sale.buyerAvatar} alt="" className="w-4 h-4 rounded-full object-cover" />
                    <span className="text-muted-foreground text-[11px]">Pembeli: <span className="font-semibold text-foreground">{sale.buyer}</span></span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              {(sale.status === "dikonfirmasi" || sale.status === "diproses" || sale.status === "menuju_lokasi") && (
                <div className="flex flex-col gap-2 px-4 pb-3">
                  <div className="text-[10px] font-semibold text-muted-foreground flex items-center gap-1 bg-muted/30 p-2 rounded-xl border border-border/40">
                    <Clock size={11} className="text-primary animate-pulse shrink-0" />
                    <span>
                      {sale.status === "dikonfirmasi" && "Pesanan baru masuk, harap konfirmasi untuk mulai menyiapkan."}
                      {sale.status === "diproses" && "Barang sedang disiapkan. Klik kirim jika siap bertemu."}
                      {sale.status === "menuju_lokasi" && "Sedang menuju lokasi COD."}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => startChat(sale.buyer, sale.product, sale.image, sale.price)}
                      className="flex-1 bg-secondary border border-primary/20 text-primary text-xs font-bold py-2 rounded-xl"
                    >
                      Chat Pembeli
                    </button>
                    {sale.status === "dikonfirmasi" && (
                      <button
                        onClick={() => updateOrderStatus(sale.id, "diproses")}
                        className="flex-1 bg-primary text-white text-xs font-bold py-2 rounded-xl active:scale-95 transition-transform"
                      >
                        Siapkan Barang
                      </button>
                    )}
                    {sale.status === "diproses" && (
                      <button
                        onClick={() => updateOrderStatus(sale.id, "menuju_lokasi")}
                        className="flex-1 bg-amber-500 text-white text-xs font-bold py-2 rounded-xl active:scale-95 transition-transform"
                      >
                        Kirim ke COD
                      </button>
                    )}
                    {sale.status === "menuju_lokasi" && (
                      <button
                        onClick={() => setShowConfirmModal(sale.id)}
                        className="flex-1 bg-green-600 text-white text-xs font-bold py-2 rounded-xl active:scale-95 transition-transform"
                      >
                        Selesaikan
                      </button>
                    )}
                    <button
                      onClick={() => setShowReportModal({ type: "pembeli", name: sale.buyer })}
                      className="w-8 h-8 bg-red-50 border border-red-200 rounded-xl flex items-center justify-center shrink-0"
                    >
                      <Flag size={13} className="text-red-500" />
                    </button>
                  </div>
                </div>
              )}
              {sale.status === "selesai" && (
                <div className="px-4 pb-3 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[11px] text-green-600 font-semibold">
                    <CheckCircle2 size={12} /> Transaksi berhasil diselesaikan
                  </div>
                  <button
                    onClick={() => setShowReportModal({ type: "pembeli", name: sale.buyer })}
                    className="flex items-center gap-1 text-red-400 text-[10px] font-semibold"
                  >
                    <Flag size={10} /> Laporkan
                  </button>
                </div>
              )}
              {sale.status === "dibatalkan" && (
                <div className="px-4 pb-3">
                  <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                    <AlertCircle size={11} className="text-red-400" /> Pesanan dibatalkan
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Confirm Ship Modal */}
      {showConfirmModal && (() => {
        const sale = salesData.find((s) => s.id === showConfirmModal);
        if (!sale) return null;
        return (
          <div className="fixed inset-0 z-[80] flex items-center justify-center px-6" style={{ maxWidth: 430, margin: "0 auto" }}>
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowConfirmModal(null)} />
            <div className="relative bg-card rounded-3xl shadow-2xl p-6 w-full">
              <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={28} className="text-green-500" />
              </div>
              <h3 className="text-foreground font-black text-lg text-center mb-1">Konfirmasi Pengiriman</h3>
              <p className="text-muted-foreground text-sm text-center mb-4 leading-relaxed">
                Konfirmasi bahwa <span className="font-bold text-foreground">{sale.product}</span> sudah diterima oleh <span className="font-bold text-foreground">{sale.buyer}</span>?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowConfirmModal(null)}
                  className="flex-1 bg-secondary border border-border text-foreground font-bold py-3 rounded-2xl text-sm"
                >
                  Batal
                </button>
                <button
                  onClick={() => confirmShipped(sale.id)}
                  className="flex-[2] bg-primary text-white font-black py-3 rounded-2xl text-sm shadow-lg active:scale-95 transition-transform"
                >
                  ✓ Selesaikan
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

// ── DAFTAR PEMBELIAN ──
function PurchasePage({ onBack }: { onBack: () => void }) {
  const {
    
    setActiveTab: setGlobalTab,
    purchaseData,
    setPurchaseData,
    salesData,
    setSalesData,
    trackingOrder,
    setTrackingOrder,
    startChat,
  } = useApp();
  const [purchaseTab, setPurchaseTab] = useState<"semua" | "diproses" | "selesai" | "dibatalkan">("semua");
  const [showConfirmReceive, setShowConfirmReceive] = useState<string | null>(null);
  const [showReviewModal, setShowReviewModal] = useState<string | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [reviewSubmitted, setReviewSubmitted] = useState<string[]>([]);

  const statusConfig = {
    dikonfirmasi: { label: "Dikonfirmasi", bg: "#E0F2FE", text: "#0369A1" },
    diproses:     { label: "Diproses",     bg: "#FEF3C7", text: "#92400E" },
    menuju_lokasi:{ label: "Menuju COD",   bg: "#F5F3FF", text: "#6D28D9" },
    selesai:      { label: "Selesai",      bg: "#D1FAE5", text: "#065F46" },
    dibatalkan:   { label: "Dibatalkan",   bg: "#FEE2E2", text: "#991B1B" },
  };

  function confirmReceive(id: string) {
    const orderIdNum = id.slice(-6);

    // Update purchase list
    setPurchaseData((prev) => prev.map((p) => p.id === id ? { ...p, status: "selesai" } : p));

    // Update sales list
    setSalesData((prev) =>
      prev.map((s) => s.id.slice(-6) === orderIdNum ? { ...s, status: "selesai" } : s)
    );

    // Update active trackingOrder
    if (trackingOrder && trackingOrder.id.slice(-6) === orderIdNum) {
      setTrackingOrder({
        ...trackingOrder,
        status: "selesai",
      });
    }

    setShowConfirmReceive(null);
  }

  function submitReview(id: string) {
    setReviewSubmitted((prev) => [...prev, id]);
    setShowReviewModal(null);
    setReviewText("");
    setReviewRating(5);
  }

  const filtered = purchaseTab === "semua"
    ? purchaseData
    : purchaseTab === "diproses"
      ? purchaseData.filter((p) => p.status === "dikonfirmasi" || p.status === "diproses" || p.status === "menuju_lokasi")
      : purchaseData.filter((p) => p.status === purchaseTab);

  const totalBelanja = purchaseData.filter((p) => p.status === "selesai").reduce((sum, p) => sum + p.price * p.qty, 0);

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Header */}
      <div className="bg-primary sticky top-0 z-40 shadow-md">
        <div className="px-4 pt-10 pb-4 flex items-center gap-3">
          <button onClick={onBack} className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
            <ArrowLeft size={18} className="text-white" />
          </button>
          <div className="flex-1">
            <h1 className="text-white font-black text-lg">Daftar Pembelian</h1>
            <p className="text-white/60 text-[11px]">{purchaseData.length} transaksi total</p>
          </div>
        </div>

        {/* Summary card */}
        <div className="mx-4 mb-4 bg-white/10 rounded-2xl p-3.5 flex items-center justify-between">
          <div>
            <p className="text-white/70 text-[11px] font-semibold">Total Pengeluaran</p>
            <p className="text-white font-black text-xl">{formatPrice(totalBelanja)}</p>
          </div>
          <div className="flex gap-4 text-center">
            <div>
              <p className="text-white font-black text-lg leading-none">{purchaseData.filter((p) => p.status === "selesai").length}</p>
              <p className="text-white/60 text-[10px] mt-0.5">Selesai</p>
            </div>
            <div>
              <p className="text-white font-black text-lg leading-none">
                {purchaseData.filter((p) => p.status === "dikonfirmasi" || p.status === "diproses" || p.status === "menuju_lokasi").length}
              </p>
              <p className="text-white/60 text-[10px] mt-0.5">Diproses</p>
            </div>
          </div>
        </div>

        {/* Tab filter */}
        <div className="flex gap-1 px-4 pb-3 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          {(["semua", "diproses", "selesai", "dibatalkan"] as const).map((t) => (
            <button key={t} onClick={() => setPurchaseTab(t)}
              className="shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors"
              style={purchaseTab === t ? { background: "#fff", color: "#c41230" } : { background: "rgba(255,255,255,0.15)", color: "#fff" }}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="px-4 pt-4 space-y-3">
        {filtered.length === 0 && (
          <div className="flex flex-col items-center py-20 text-center">
            <ShoppingBag size={40} className="text-muted-foreground/30 mb-3" />
            <p className="text-foreground font-bold">Tidak ada pesanan</p>
            <p className="text-muted-foreground text-sm">Belum ada pembelian di kategori ini</p>
          </div>
        )}
        {filtered.map((order) => {
          const cfg = statusConfig[order.status as keyof typeof statusConfig] || { label: order.status, bg: "#E5E7EB", text: "#374151" };
          const isReviewed = reviewSubmitted.includes(order.id);
          return (
            <div key={order.id} className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
              {/* Header row */}
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-muted/40">
                <span className="text-[11px] font-bold text-muted-foreground">{order.id}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground">{order.date}</span>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full" style={{ background: cfg.bg, color: cfg.text }}>{cfg.label}</span>
                </div>
              </div>

              {/* Product row */}
              <div className="flex items-center gap-3 px-4 py-3">
                <img src={order.image} alt="" className="w-14 h-14 rounded-xl object-cover bg-muted shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-foreground font-bold text-sm truncate">{order.product}</p>
                  <p className="text-primary font-black text-sm">{formatPrice(order.price * order.qty)} {order.qty > 1 && <span className="text-muted-foreground font-normal text-xs">({order.qty} pcs)</span>}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <img src={order.sellerAvatar} alt="" className="w-4 h-4 rounded-full object-cover" />
                    <span className="text-muted-foreground text-[11px]">Penjual: <span className="font-semibold text-foreground">{order.seller}</span></span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              {(order.status === "dikonfirmasi" || order.status === "diproses" || order.status === "menuju_lokasi") && (
                <div className="flex gap-2 px-4 pb-3">
                  <button
                    onClick={() => startChat(order.seller, order.product, order.image, order.price)}
                    className="flex-1 bg-secondary border border-primary/20 text-primary text-xs font-bold py-2 rounded-xl"
                  >
                    Chat Penjual
                  </button>
                  <button
                    onClick={() => setShowConfirmReceive(order.id)}
                    className="flex-1 bg-primary text-white text-xs font-bold py-2 rounded-xl active:scale-95 transition-transform"
                  >
                    Konfirmasi Terima
                  </button>
                </div>
              )}
              {order.status === "selesai" && (
                <div className="flex gap-2 px-4 pb-3">
                  <button
                    onClick={() => { onBack(); setGlobalTab("home"); }}
                    className="flex-1 bg-secondary border border-border text-foreground text-xs font-bold py-2 rounded-xl"
                  >
                    Beli Lagi
                  </button>
                  {isReviewed ? (
                    <div className="flex-1 bg-green-50 border border-green-200 text-green-700 text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1">
                      <CheckCircle2 size={11} /> Diulas
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowReviewModal(order.id)}
                      className="flex-1 bg-accent text-foreground text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1"
                    >
                      <Star size={11} /> Beri Ulasan
                    </button>
                  )}
                </div>
              )}
              {order.status === "dibatalkan" && (
                <div className="flex-1 text-[11px] text-muted-foreground flex items-center gap-1.5 py-1">
                  <AlertCircle size={11} className="text-red-400 shrink-0" /> Pesanan dibatalkan oleh sistem
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Confirm Receive Modal */}
      {showConfirmReceive && (() => {
        const order = purchaseData.find((p) => p.id === showConfirmReceive);
        if (!order) return null;
        return (
          <div className="fixed inset-0 z-[80] flex items-center justify-center px-6" style={{ maxWidth: 430, margin: "0 auto" }}>
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowConfirmReceive(null)} />
            <div className="relative bg-card rounded-3xl shadow-2xl p-6 w-full">
              <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Package size={28} className="text-blue-500" />
              </div>
              <h3 className="text-foreground font-black text-lg text-center mb-1">Barang Sudah Diterima?</h3>
              <p className="text-muted-foreground text-sm text-center mb-4 leading-relaxed">
                Konfirmasi penerimaan <span className="font-bold text-foreground">{order.product}</span> dari <span className="font-bold text-foreground">{order.seller}</span>
              </p>
              <div className="flex gap-2">
                <button onClick={() => setShowConfirmReceive(null)} className="flex-1 bg-secondary border border-border text-foreground font-bold py-3 rounded-2xl text-sm">Belum</button>
                <button onClick={() => confirmReceive(order.id)} className="flex-[2] bg-primary text-white font-black py-3 rounded-2xl text-sm shadow-lg active:scale-95 transition-transform">✓ Sudah Terima</button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Review Modal */}
      {showReviewModal && (() => {
        const order = purchaseData.find((p) => p.id === showReviewModal);
        if (!order) return null;
        return (
          <div className="fixed inset-0 z-[80] flex flex-col justify-end" style={{ maxWidth: 430, margin: "0 auto" }}>
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowReviewModal(null)} />
            <div className="relative bg-card rounded-t-3xl shadow-2xl p-5 pb-8">
              <div className="w-10 h-1 bg-border rounded-full mx-auto mb-5" />
              <h3 className="text-foreground font-black text-lg mb-1">Beri Ulasan</h3>
              <p className="text-muted-foreground text-xs mb-4">{order.product} · {order.seller}</p>

              {/* Star rating */}
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">Rating</p>
              <div className="flex gap-2 mb-4">
                {[1,2,3,4,5].map((s) => (
                  <button key={s} onClick={() => setReviewRating(s)}>
                    <Star size={32} className={s <= reviewRating ? "text-amber-400 fill-amber-400" : "text-muted/30"} />
                  </button>
                ))}
              </div>

              {/* Comment */}
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">Komentar</p>
              <div className="bg-muted/50 border-2 border-border rounded-2xl px-4 py-3 mb-5 focus-within:border-primary/50 transition-colors">
                <textarea
                  rows={3}
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Bagaimana pengalaman kamu berbelanja di sini?"
                  className="w-full text-sm text-foreground bg-transparent outline-none resize-none placeholder:text-muted-foreground"
                />
              </div>

              <button
                onClick={() => submitReview(order.id)}
                className="w-full bg-primary text-white font-black py-4 rounded-2xl text-sm shadow-lg active:scale-95 transition-transform"
              >
                Kirim Ulasan
              </button>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

// ── EDIT PROFIL ──
function EditProfilePage({ onBack }: { onBack: () => void }) {
  const { profileAvatar, setProfileAvatar, profileBanner, setProfileBanner } = useApp();
  const { user, profile: authProfile, refreshSession } = useAuth();
  
  const userEmailBase = user?.email?.split("@")[0] || "";
  const baseName = authProfile?.full_name || user?.user_metadata?.full_name || userEmailBase || "Pengguna Tamu";

  const [profile, setProfile] = useState({
    name: "",
    username: "",
    nim: "",
    prodi: "",
    angkatan: "",
    bio: "",
    phone: "",
    location: "",
  });

  useEffect(() => {
    if (user || authProfile) {
      setProfile({
        name: authProfile?.full_name || user?.user_metadata?.full_name || userEmailBase || "Pengguna Tamu",
        username: authProfile?.username || userEmailBase || "tamu",
        nim: authProfile?.nim || user?.user_metadata?.nim || "",
        prodi: authProfile?.major || "",
        angkatan: authProfile?.angkatan || "",
        bio: authProfile?.bio || "",
        phone: authProfile?.phone || "",
        location: authProfile?.location || "",
      });
    }
  }, [user, authProfile, userEmailBase]);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const e: Record<string, string> = {};
    if (!profile.name.trim()) e.name = "Nama wajib diisi";
    if (!profile.username.trim()) e.username = "Username wajib diisi";
    if (profile.username.includes(" ")) e.username = "Username tidak boleh mengandung spasi";
    if (profile.bio.length > 120) e.bio = "Bio maksimal 120 karakter";
    return e;
  }

  async function handleSave() {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    
    if (!user) {
      toast.error("Anda harus login untuk menyimpan profil");
      return;
    }

    try {
      setSaving(true);
      await authService.updateProfile(user.id, {
        full_name: profile.name,
        username: profile.username,
        nim: profile.nim,
        major: profile.prodi,
        angkatan: profile.angkatan,
        bio: profile.bio,
        phone: profile.phone,
        location: profile.location,
        avatar_url: profileAvatar,
        banner_url: profileBanner
      });
      await refreshSession();
      setSaved(true);
      toast.success("Profil berhasil diperbarui!");
      setTimeout(() => setSaved(false), 2500);
    } catch (error: any) {
      toast.error(error.message || "Gagal menyimpan profil");
    } finally {
      setSaving(false);
    }
  }

  const prodiOptions = ["Teknik Informatika", "Teknik Sipil", "Manajemen", "Akuntansi", "Psikologi", "Hukum", "Kedokteran", "Farmasi", "PGSD", "Ilmu Komunikasi"];

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header */}
      <div className="bg-primary sticky top-0 z-40 shadow-md">
        <div className="px-4 pt-10 pb-4 flex items-center gap-3">
          <button onClick={onBack} className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
            <ArrowLeft size={18} className="text-white" />
          </button>
          <h1 className="flex-1 text-white font-black text-lg">Edit Profil</h1>
          {saved && (
            <div className="flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1.5">
              <CheckCircle2 size={13} className="text-green-300" />
              <span className="text-white text-xs font-bold">Tersimpan</span>
            </div>
          )}
        </div>
      </div>

      <div className="px-4 pt-5 space-y-5">

        {/* Banner Preview in Edit Profile */}
        <div className="relative h-32 rounded-2xl overflow-hidden bg-muted mb-4 border border-border shadow-inner">
          <img
            src={profileBanner || "/default-banner.jpg"}
            alt="Banner Preview"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
            <label className="bg-black/55 hover:bg-black/75 text-white text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors border border-white/20 shadow">
              <Camera size={14} /> Ganti Banner
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      if (typeof reader.result === "string") {
                        setProfileBanner(reader.result);
                      }
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
            </label>
          </div>
        </div>

        {/* Avatar */}
        <div className="flex flex-col items-center py-2">
          <div className="relative mb-3">
            <img
              src={profileAvatar}
              alt=""
              className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-xl bg-muted"
            />
            <label className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full border-2 border-white flex items-center justify-center shadow cursor-pointer hover:bg-primary/95 transition-all">
              <Camera size={14} className="text-white" />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      if (typeof reader.result === "string") {
                        setProfileAvatar(reader.result);
                      }
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
            </label>
          </div>
          <p className="text-muted-foreground text-xs">Ketuk ikon kamera untuk ganti foto profil</p>
        </div>

        {/* Form sections */}
        <section className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-secondary/50">
            <p className="text-foreground font-bold text-sm flex items-center gap-2"><User size={14} className="text-primary" />Informasi Dasar</p>
          </div>
          <div className="divide-y divide-border">
            {[
              { key: "name", label: "Nama Lengkap", placeholder: "Nama lengkap sesuai KTM", type: "text" },
              { key: "username", label: "Username", placeholder: "contoh: rizky.pratama", type: "text", prefix: "@" },
            ].map(({ key, label, placeholder, type, prefix }) => (
              <div key={key} className="px-4 py-3.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide block mb-1.5">{label}</label>
                <div className="flex items-center gap-1">
                  {prefix && <span className="text-muted-foreground font-bold text-sm">{prefix}</span>}
                  <input
                    type={type}
                    value={profile[key as keyof typeof profile]}
                    onChange={(e) => setProfile((p) => ({ ...p, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="flex-1 text-sm text-foreground bg-transparent outline-none placeholder:text-muted-foreground"
                  />
                </div>
                {errors[key] && <p className="text-primary text-[11px] mt-1 flex items-center gap-1"><AlertCircle size={10} />{errors[key]}</p>}
              </div>
            ))}

            {/* Bio */}
            <div className="px-4 py-3.5">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Bio</label>
                <span className="text-[10px] text-muted-foreground">{profile.bio.length}/120</span>
              </div>
              <textarea
                rows={3}
                value={profile.bio}
                onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))}
                placeholder="Ceritakan sedikit tentang dirimu..."
                maxLength={120}
                className="w-full text-sm text-foreground bg-transparent outline-none resize-none placeholder:text-muted-foreground leading-relaxed"
              />
              {errors.bio && <p className="text-primary text-[11px] mt-1 flex items-center gap-1"><AlertCircle size={10} />{errors.bio}</p>}
            </div>
          </div>
        </section>

        <section className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-secondary/50">
            <p className="text-foreground font-bold text-sm flex items-center gap-2"><BadgeCheck size={14} className="text-primary" />Data Akademik</p>
          </div>
          <div className="divide-y divide-border">
            {/* NIM — read only */}
            <div className="px-4 py-3.5 flex items-center justify-between">
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide block mb-0.5">NIM</label>
                <p className="text-sm font-semibold text-foreground">{profile.nim}</p>
              </div>
              <div className="flex items-center gap-1 bg-green-100 rounded-full px-2.5 py-1">
                <CheckCircle2 size={11} className="text-green-600" />
                <span className="text-green-700 text-[10px] font-bold">Terverifikasi</span>
              </div>
            </div>

            {/* Program Studi */}
            <div className="px-4 py-3.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide block mb-1.5">Program Studi</label>
              <select
                value={profile.prodi}
                onChange={(e) => setProfile((p) => ({ ...p, prodi: e.target.value }))}
                className="w-full text-sm text-foreground bg-transparent outline-none appearance-none"
              >
                {prodiOptions.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            {/* Angkatan */}
            <div className="px-4 py-3.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide block mb-1.5">Angkatan</label>
              <select
                value={profile.angkatan}
                onChange={(e) => setProfile((p) => ({ ...p, angkatan: e.target.value }))}
                className="w-full text-sm text-foreground bg-transparent outline-none"
              >
                {["2020","2021","2022","2023","2024","2025"].map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>
        </section>

        <section className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-secondary/50">
            <p className="text-foreground font-bold text-sm flex items-center gap-2"><Phone size={14} className="text-primary" />Kontak & Lokasi</p>
          </div>
          <div className="divide-y divide-border">
            <div className="px-4 py-3.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide block mb-1.5">No. WhatsApp</label>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-sm font-semibold">+62</span>
                <input
                  type="tel"
                  inputMode="numeric"
                  value={profile.phone.replace(/^0/, "")}
                  onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value.replace(/\D/g, "") }))}
                  placeholder="8xx-xxxx-xxxx"
                  className="flex-1 text-sm text-foreground bg-transparent outline-none placeholder:text-muted-foreground"
                />
              </div>
            </div>
            <div className="px-4 py-3.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide block mb-1.5">Lokasi</label>
              <input
                type="text"
                value={profile.location}
                onChange={(e) => setProfile((p) => ({ ...p, location: e.target.value }))}
                placeholder="Kelurahan, Kota"
                className="w-full text-sm text-foreground bg-transparent outline-none placeholder:text-muted-foreground"
              />
            </div>
          </div>
        </section>

      </div>

      {/* Save button fixed */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full bg-card border-t border-border px-4 py-3 z-40 shadow-2xl" style={{ maxWidth: 430 }}>
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-primary text-white font-black py-4 rounded-2xl text-base shadow-lg active:scale-95 transition-transform disabled:opacity-70 disabled:active:scale-100 flex items-center justify-center gap-2"
        >
          {saving ? "Menyimpan..." : saved ? <><CheckCircle2 size={18} /> Tersimpan!</> : "Simpan Perubahan"}
        </button>
      </div>
    </div>
  );
}

// ── EDIT ITEM PAGE ──
function EditItemPage({ onBack }: { onBack: () => void }) {
  const { editingItem,  setListings, setProducts, triggerToast } = useApp();
  const item = editingItem!;

  const [photos, setPhotos] = useState<string[]>([item.image]);
  const [form, setForm] = useState({
    title: item.name,
    category: "Elektronik",
    condition: "Bekas - Baik",
    price: item.price.toLocaleString("id-ID"),
    negotiable: true,
    description: productDescriptions[item.id] ?? "Deskripsi produk belum diisi.",
    location: "Kampus 1 (GKB)",
    meetup: "",
    phone: "081234567890",
    status: item.status,
    stock: item.stock !== undefined ? item.stock.toString() : "1",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [conditionOpen, setConditionOpen] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);

  const categoryOptions = ["Buku & Modul","Elektronik","Fashion","Makanan & Minuman","Jasa","Kendaraan","Kost & Kontrakan","Alat Tulis","Olahraga","Lainnya"];
  const conditionOptions = ["Baru","Seperti Baru","Bekas - Baik","Bekas - Cukup"];
  const locationOptions = ["Kampus 1 (GKB)","Kampus 2","Kampus 3","Dinoyo","Sengkaling","Lowokwaru","Dau","Online / Kirim"];

  const mockPhotos = [
    item.image,
    "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=200&h=200&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=200&h=200&fit=crop&auto=format",
  ];

  function formatRupiah(val: string) {
    return val.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = "Judul wajib diisi";
    if (!form.category) e.category = "Pilih kategori";
    if (!form.condition) e.condition = "Pilih kondisi";
    if (!form.price.trim()) e.price = "Harga wajib diisi";
    if (!form.stock.trim() || parseInt(form.stock) < 0) e.stock = "Stok tidak valid";
    if (!form.description.trim()) e.description = "Deskripsi wajib diisi";
    if (!form.location) e.location = "Pilih lokasi";
    return e;
  }

  function handleSave() {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    
    const numericPrice = Number(form.price.replace(/\./g, ""));
    const numericStock = parseInt(form.stock) || 0;
    const updatedImage = photos[0] || item.image;

    // Update global listings state
    setListings((prevListings) =>
      prevListings.map((l) =>
        l.id === item.id
          ? {
              ...l,
              name: form.title,
              price: numericPrice,
              image: updatedImage,
              status: numericStock === 0 ? "habis" : "aktif",
              stock: numericStock,
            }
          : l
      )
    );

    // Update global products state
    setProducts((prevProducts) =>
      prevProducts.map((p) =>
        p.id === item.id
          ? {
              ...p,
              name: form.title,
              price: numericPrice,
              image: updatedImage,
              location: form.location,
              stock: numericStock,
            }
          : p
      )
    );

    setSaved(true);
    setTimeout(() => { setSaved(false); onBack(); }, 1500);
  }

  function handleDelete() {
    setListings((prevListings) => prevListings.filter((l) => l.id !== item.id));
    setProducts((prevProducts) => prevProducts.filter((p) => p.id !== item.id));
    triggerToast("Iklan berhasil dihapus");
    setShowDeleteConfirm(false);
    onBack();
  }

  const DropdownField = ({ label, value, open, onToggle, options, onSelect, error }: {
    label: string; value: string; open: boolean; onToggle: () => void;
    options: string[]; onSelect: (v: string) => void; error?: string;
  }) => (
    <div className="px-4 py-3.5 relative">
      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide block mb-1.5">{label} <span className="text-primary">*</span></label>
      <button onClick={onToggle} className="w-full flex items-center justify-between text-sm">
        <span className={value ? "text-foreground font-semibold" : "text-muted-foreground"}>{value || `Pilih ${label.toLowerCase()}...`}</span>
        <ChevronDown size={15} className="text-muted-foreground" style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
      </button>
      {error && <p className="text-primary text-[11px] mt-1 flex items-center gap-1"><AlertCircle size={10} />{error}</p>}
      {open && (
        <div className="absolute left-0 right-0 top-full z-30 bg-card border border-border rounded-xl shadow-xl mx-4 overflow-hidden">
          {options.map((opt) => (
            <button key={opt} onClick={() => onSelect(opt)}
              className="w-full px-4 py-2.5 text-sm text-left hover:bg-secondary transition-colors flex items-center justify-between">
              <span className={value === opt ? "text-primary font-bold" : "text-foreground"}>{opt}</span>
              {value === opt && <CheckCircle2 size={13} className="text-primary" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header */}
      <div className="bg-primary sticky top-0 z-40 shadow-md">
        <div className="px-4 pt-10 pb-4 flex items-center gap-3">
          <button onClick={onBack} className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
            <ArrowLeft size={18} className="text-white" />
          </button>
          <div className="flex-1">
            <h1 className="text-white font-black text-lg">Edit Barang</h1>
            <p className="text-white/60 text-[11px] truncate">{form.title}</p>
          </div>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-9 h-9 bg-white/15 rounded-full flex items-center justify-center border border-white/20"
          >
            <X size={16} className="text-white" />
          </button>
        </div>
      </div>

      <div className="px-4 space-y-5 pt-5">

        {/* Photos */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-foreground font-bold text-sm">Foto Produk</h3>
              <p className="text-muted-foreground text-[11px]">Foto pertama jadi sampul</p>
            </div>
            <span className="text-muted-foreground text-xs font-semibold">{photos.length}/5</span>
          </div>
          <div className="flex gap-2.5 flex-wrap">
            {photos.map((src, i) => (
              <div key={i} className="relative" style={{ width: 80, height: 80 }}>
                <img src={src} alt="" className="w-full h-full object-cover rounded-xl border border-border" />
                {i === 0 && <span className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[9px] font-bold text-center py-0.5 rounded-b-xl">Sampul</span>}
                <button onClick={() => setPhotos((p) => p.filter((_, idx) => idx !== i))}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-foreground rounded-full flex items-center justify-center shadow">
                  <X size={11} className="text-white" />
                </button>
              </div>
            ))}
            {photos.length < 5 && (
              <button onClick={() => photos.length < mockPhotos.length && setPhotos((p) => [...p, mockPhotos[p.length % mockPhotos.length]])}
                className="flex flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-border bg-card"
                style={{ width: 80, height: 80 }}>
                <Camera size={20} className="text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground font-semibold">Tambah</span>
              </button>
            )}
          </div>
        </section>

        {/* Detail section */}
        <section className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-secondary/50">
            <p className="text-foreground font-bold text-sm flex items-center gap-2"><FileText size={14} className="text-primary" />Detail Barang</p>
          </div>
          <div className="divide-y divide-border">

            {/* Judul */}
            <div className="px-4 py-3.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide block mb-1.5">Judul Iklan <span className="text-primary">*</span></label>
              <input type="text" value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                maxLength={70}
                className="w-full text-sm text-foreground bg-transparent outline-none placeholder:text-muted-foreground"
              />
              <div className="flex justify-between mt-1">
                {errors.title ? <p className="text-primary text-[11px] flex items-center gap-1"><AlertCircle size={10} />{errors.title}</p> : <span />}
                <span className="text-[10px] text-muted-foreground">{form.title.length}/70</span>
              </div>
            </div>

            {/* Kategori */}
            <DropdownField label="Kategori" value={form.category} open={categoryOpen}
              onToggle={() => { setCategoryOpen((o) => !o); setConditionOpen(false); setLocationOpen(false); }}
              options={categoryOptions} onSelect={(v) => { setForm((f) => ({ ...f, category: v })); setCategoryOpen(false); }}
              error={errors.category} />

            {/* Kondisi */}
            <div className="px-4 py-3.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide block mb-2">Kondisi <span className="text-primary">*</span></label>
              <div className="flex gap-2 flex-wrap">
                {conditionOptions.map((opt) => (
                  <button key={opt} onClick={() => setForm((f) => ({ ...f, condition: opt }))}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold border transition-all"
                    style={form.condition === opt
                      ? { background: "#c41230", color: "#fff", border: "1.5px solid #c41230" }
                      : { background: "#fff", color: "#8a8a9a", border: "1.5px solid rgba(0,0,0,0.1)" }}>
                    {opt}
                  </button>
                ))}
              </div>
              {errors.condition && <p className="text-primary text-[11px] mt-2 flex items-center gap-1"><AlertCircle size={10} />{errors.condition}</p>}
            </div>

            {/* Deskripsi */}
            <div className="px-4 py-3.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide block mb-1.5">Deskripsi <span className="text-primary">*</span></label>
              <textarea rows={4} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                maxLength={500} placeholder="Jelaskan kondisi barang, alasan jual, kelengkapan..."
                className="w-full text-sm text-foreground bg-transparent outline-none resize-none placeholder:text-muted-foreground leading-relaxed" />
              <div className="flex justify-between mt-1">
                {errors.description ? <p className="text-primary text-[11px] flex items-center gap-1"><AlertCircle size={10} />{errors.description}</p> : <span />}
                <span className="text-[10px] text-muted-foreground">{form.description.length}/500</span>
              </div>
            </div>
          </div>
        </section>

        {/* Harga */}
        <section className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-secondary/50">
            <p className="text-foreground font-bold text-sm flex items-center gap-2"><Banknote size={14} className="text-primary" />Harga</p>
          </div>
          <div className="divide-y divide-border">
            <div className="px-4 py-3.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide block mb-1.5">Harga Jual (Rp) <span className="text-primary">*</span></label>
              <div className="flex items-center gap-2">
                <span className="text-foreground font-bold text-base">Rp</span>
                <input type="text" inputMode="numeric" value={form.price}
                  onChange={(e) => setForm((f) => ({ ...f, price: formatRupiah(e.target.value) }))}
                  placeholder="0"
                  className="flex-1 text-foreground font-bold text-xl bg-transparent outline-none placeholder:text-muted-foreground" />
              </div>
              {errors.price && <p className="text-primary text-[11px] mt-1 flex items-center gap-1"><AlertCircle size={10} />{errors.price}</p>}
              {form.price && !errors.price && (
                <p className="text-muted-foreground text-[11px] mt-1">
                  = <span className="font-semibold text-foreground">{Number(form.price.replace(/\./g, "")).toLocaleString("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 })}</span>
                </p>
              )}
            </div>
            <div className="px-4 py-3.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide block mb-1.5">Stok Barang <span className="text-primary">*</span></label>
              <input type="text" inputMode="numeric" value={form.stock}
                onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value.replace(/\D/g, "") }))}
                placeholder="0"
                className="w-full text-foreground font-bold text-base bg-transparent outline-none placeholder:text-muted-foreground" />
              {errors.stock && <p className="text-primary text-[11px] mt-1 flex items-center gap-1"><AlertCircle size={10} />{errors.stock}</p>}
            </div>
            <div className="px-4 py-3.5 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-foreground">Harga bisa nego</p>
                <p className="text-[11px] text-muted-foreground">Pembeli dapat menawar harga</p>
              </div>
              <button onClick={() => setForm((f) => ({ ...f, negotiable: !f.negotiable }))}>
                {form.negotiable ? <ToggleRight size={32} className="text-primary" /> : <ToggleLeft size={32} className="text-muted-foreground" />}
              </button>
            </div>
          </div>
        </section>

        {/* Lokasi */}
        <section className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-secondary/50">
            <p className="text-foreground font-bold text-sm flex items-center gap-2"><MapPin size={14} className="text-primary" />Lokasi & Transaksi</p>
          </div>
          <div className="divide-y divide-border">
            <DropdownField label="Lokasi" value={form.location} open={locationOpen}
              onToggle={() => { setLocationOpen((o) => !o); setCategoryOpen(false); setConditionOpen(false); }}
              options={locationOptions} onSelect={(v) => { setForm((f) => ({ ...f, location: v })); setLocationOpen(false); }}
              error={errors.location} />
            <div className="px-4 py-3.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide block mb-1.5">Detail Tempat Temu (opsional)</label>
              <input type="text" value={form.meetup} onChange={(e) => setForm((f) => ({ ...f, meetup: e.target.value }))}
                placeholder="Contoh: Kantin GKB 1, depan ATM BNI"
                className="w-full text-sm text-foreground bg-transparent outline-none placeholder:text-muted-foreground" />
            </div>
            <div className="px-4 py-3.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide block mb-1.5">No. WhatsApp (opsional)</label>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-sm font-semibold">+62</span>
                <input type="tel" inputMode="numeric" value={form.phone.replace(/^0/, "")}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value.replace(/\D/g, "") }))}
                  placeholder="8xx-xxxx-xxxx"
                  className="flex-1 text-sm text-foreground bg-transparent outline-none placeholder:text-muted-foreground" />
              </div>
            </div>
          </div>
        </section>

        {/* Riwayat perubahan */}
        <div className="flex items-start gap-2.5 bg-blue-50 rounded-xl p-3.5 border border-blue-100">
          <Info size={14} className="text-blue-500 shrink-0 mt-0.5" />
          <p className="text-blue-700 text-[11px] leading-relaxed">
            Perubahan akan ditinjau dalam <span className="font-bold">1×24 jam</span> sebelum ditayangkan ulang. Iklan tetap aktif selama proses peninjauan.
          </p>
        </div>

      </div>

      {/* Delete confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6" style={{ maxWidth: 430, margin: "0 auto" }}>
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowDeleteConfirm(false)} />
          <div className="relative bg-card rounded-3xl p-6 shadow-2xl w-full">
            <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <X size={28} className="text-red-500" />
            </div>
            <h3 className="text-foreground font-black text-lg text-center mb-2">Hapus Iklan?</h3>
            <p className="text-muted-foreground text-sm text-center leading-relaxed mb-5">
              Iklan <span className="font-bold text-foreground">"{form.title}"</span> akan dihapus permanen dan tidak bisa dikembalikan.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 bg-secondary border border-border text-foreground font-bold py-3 rounded-2xl text-sm">
                Batal
              </button>
              <button onClick={handleDelete}
                className="flex-1 bg-red-500 text-white font-black py-3 rounded-2xl text-sm">
                Hapus Iklan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save button fixed */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full bg-card border-t border-border px-4 py-3 z-40 shadow-2xl" style={{ maxWidth: 430 }}>
        {Object.keys(errors).length > 0 && (
          <p className="text-primary text-[11px] font-semibold text-center mb-2 flex items-center justify-center gap-1">
            <AlertCircle size={11} /> Mohon lengkapi data yang masih kosong
          </p>
        )}
        <button onClick={handleSave}
          className="w-full bg-primary text-white font-black py-4 rounded-2xl text-base shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2">
          {saved ? <><CheckCircle2 size={18} /> Perubahan Tersimpan!</> : "Simpan Perubahan"}
        </button>
      </div>
    </div>
  );
}

// ── KEAMANAN & PRIVASI PAGE ──
function SecurityPrivacyPage({ onBack }: { onBack: () => void }) {
  const {  } = useApp();
  const [twoFactor, setTwoFactor] = useState(false);
  const [waVisible, setWaVisible] = useState(true);
  const [nimVisible, setNimVisible] = useState(true);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [saved, setSaved] = useState(false);

  function handleSavePassword() {
    if (!oldPassword || !newPassword) return;
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setOldPassword("");
      setNewPassword("");
    }, 2000);
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header */}
      <div className="bg-primary sticky top-0 z-40 shadow-md">
        <div className="px-4 pt-10 pb-4 flex items-center gap-3">
          <button onClick={onBack} className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center cursor-pointer">
            <ArrowLeft size={18} className="text-white" />
          </button>
          <div className="flex-1">
            <h1 className="text-white font-black text-lg">Keamanan & Privasi</h1>
            <p className="text-white/60 text-[11px]">Kelola keamanan akun dan data pribadimu</p>
          </div>
        </div>
      </div>

      <div className="px-4 pt-6 space-y-6">
        {/* Section Keamanan */}
        <section className="space-y-3">
          <h3 className="text-foreground font-black text-sm uppercase tracking-wider px-1">Keamanan Akun</h3>
          <div className="bg-card border border-border rounded-2xl p-4 shadow-sm space-y-4">
            {/* 2FA Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-foreground font-bold text-sm">Autentikasi 2 Langkah</p>
                <p className="text-muted-foreground text-xs">Amankan akun dengan verifikasi tambahan</p>
              </div>
              <button onClick={() => setTwoFactor(!twoFactor)} className="text-primary focus:outline-none cursor-pointer">
                {twoFactor ? <ToggleRight size={36} className="text-primary fill-primary/20" /> : <ToggleLeft size={36} className="text-muted-foreground" />}
              </button>
            </div>

            <div className="h-px bg-border" />

            {/* Change Password form */}
            <div className="space-y-3">
              <p className="text-foreground font-bold text-sm">Ganti Kata Sandi</p>
              <input
                type="password"
                placeholder="Kata sandi lama"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full text-xs text-foreground bg-transparent border-2 border-border rounded-xl px-3.5 py-2.5 outline-none focus:border-primary/50"
              />
              <input
                type="password"
                placeholder="Kata sandi baru"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full text-xs text-foreground bg-transparent border-2 border-border rounded-xl px-3.5 py-2.5 outline-none focus:border-primary/50"
              />
              <button
                onClick={handleSavePassword}
                disabled={!oldPassword || !newPassword}
                className="w-full bg-primary text-white text-xs font-bold py-2.5 rounded-xl shadow active:scale-95 transition-transform cursor-pointer"
                style={{ opacity: !oldPassword || !newPassword ? 0.6 : 1 }}
              >
                {saved ? "Sandi Diperbarui ✓" : "Perbarui Kata Sandi"}
              </button>
            </div>
          </div>
        </section>

        {/* Section Privasi */}
        <section className="space-y-3">
          <h3 className="text-foreground font-black text-sm uppercase tracking-wider px-1">Privasi Data</h3>
          <div className="bg-card border border-border rounded-2xl p-4 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-foreground font-bold text-sm">Tampilkan WhatsApp di Iklan</p>
                <p className="text-muted-foreground text-xs">Izinkan pembeli langsung kontak via WA</p>
              </div>
              <button onClick={() => setWaVisible(!waVisible)} className="text-primary focus:outline-none cursor-pointer">
                {waVisible ? <ToggleRight size={36} className="text-primary fill-primary/20" /> : <ToggleLeft size={36} className="text-muted-foreground" />}
              </button>
            </div>

            <div className="h-px bg-border" />

            <div className="flex items-center justify-between">
              <div>
                <p className="text-foreground font-bold text-sm">Tampilkan NIM di Profil</p>
                <p className="text-muted-foreground text-xs">Publikasikan NIM Anda kepada pengguna lain</p>
              </div>
              <button onClick={() => setNimVisible(!nimVisible)} className="text-primary focus:outline-none cursor-pointer">
                {nimVisible ? <ToggleRight size={36} className="text-primary fill-primary/20" /> : <ToggleLeft size={36} className="text-muted-foreground" />}
              </button>
            </div>
          </div>
        </section>

        {/* Device logs */}
        <section className="space-y-3">
          <h3 className="text-foreground font-black text-sm uppercase tracking-wider px-1">Perangkat Aktif</h3>
          <div className="bg-card border border-border rounded-2xl p-4 shadow-sm space-y-3">
            {[
              { device: "Windows Chrome · Lapak (Sesi Ini)", loc: "Lowokwaru, Malang", time: "Aktif sekarang", primary: true },
              { device: "Samsung Galaxy S22", loc: "Dau, Malang", time: "2 jam lalu", primary: false },
            ].map((d, i) => (
              <div key={i} className="flex justify-between items-start text-xs">
                <div>
                  <p className="text-foreground font-semibold">{d.device}</p>
                  <p className="text-muted-foreground text-[10px]">{d.loc}</p>
                </div>
                <span className={d.primary ? "text-primary font-bold" : "text-muted-foreground"}>{d.time}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

// ── NOTIFIKASI PAGE ──
function NotificationSettingsPage({ onBack }: { onBack: () => void }) {
  const {  } = useApp();
  const [activeTab, setActiveTab] = useState<"daftar" | "pengaturan">("daftar");
  const [chatNotif, setChatNotif] = useState(true);
  const [offerNotif, setOfferNotif] = useState(true);
  const [promoNotif, setPromoNotif] = useState(false);
  const [waChannel, setWaChannel] = useState(true);
  const [saved, setSaved] = useState(false);

  const notifications = [
    { id: 1, title: "Pesan baru dari Rizki_FT2022", body: "\"Mas, apakah barangnya masih ada?\"", time: "10 mnt lalu", read: false, color: "#3B82F6" },
    { id: 2, title: "Pesanan kamu sedang diproses", body: "Powerbank 20000mAh sedang disiapkan penjual", time: "1 jam lalu", read: false, color: "#10B981" },
    { id: 3, title: "Flash Sale dimulai! ⚡", body: "Diskon hingga 50% untuk produk elektronik pilihan", time: "2 jam lalu", read: false, color: "#F59E0B" },
    { id: 4, title: "5 orang menyukai iklanmu", body: "Laptop Lenovo ThinkPad X1 diminati banyak pembeli", time: "3 jam lalu", read: true, color: "#EC4899" },
    { id: 5, title: "Pesanan selesai 🎉", body: "Kalkulator Casio FX-991 telah dikonfirmasi diterima", time: "Kemarin", read: true, color: "#10B981" },
  ];

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header */}
      <div className="bg-primary sticky top-0 z-40 shadow-md">
        <div className="px-4 pt-10 pb-4 flex items-center gap-3">
          <button onClick={onBack} className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center cursor-pointer">
            <ArrowLeft size={18} className="text-white" />
          </button>
          <div className="flex-1">
            <h1 className="text-white font-black text-lg">Notifikasi</h1>
            <p className="text-white/60 text-[11px]">Lihat kabar terbaru & atur preferensimu</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex px-4 pb-3 gap-2">
          <button
            onClick={() => setActiveTab("daftar")}
            className="flex-1 py-2 rounded-xl text-xs font-bold transition-all text-center cursor-pointer"
            style={
              activeTab === "daftar"
                ? { background: "#fff", color: "#c41230" }
                : { background: "rgba(255,255,255,0.15)", color: "#fff" }
            }
          >
            Pesan & Kabar
          </button>
          <button
            onClick={() => setActiveTab("pengaturan")}
            className="flex-1 py-2 rounded-xl text-xs font-bold transition-all text-center cursor-pointer"
            style={
              activeTab === "pengaturan"
                ? { background: "#fff", color: "#c41230" }
                : { background: "rgba(255,255,255,0.15)", color: "#fff" }
            }
          >
            Pengaturan
          </button>
        </div>
      </div>

      <div className="px-4 pt-6">
        {activeTab === "daftar" ? (
          <div className="space-y-3">
            {notifications.map((n) => (
              <div
                key={n.id}
                className="w-full flex items-start gap-3 px-4 py-3.5 text-left transition-colors rounded-2xl border border-border shadow-sm bg-card"
                style={{ borderLeftWidth: n.read ? 1 : 5, borderLeftColor: n.read ? "var(--border)" : "#c41230" }}
              >
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 mt-0.5" style={{ background: n.color + "18" }}>
                  <BellIcon size={18} style={{ color: n.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm leading-snug ${n.read ? "text-foreground font-medium" : "text-foreground font-bold"}`}>
                      {n.title}
                    </p>
                    {!n.read && <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5 animate-pulse" />}
                  </div>
                  <p className="text-muted-foreground text-xs leading-relaxed mt-0.5 line-clamp-2">{n.body}</p>
                  <p className="text-muted-foreground text-[10px] mt-1.5 flex items-center gap-1">
                    <span>{n.time}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            <section className="space-y-3">
              <h3 className="text-foreground font-black text-sm uppercase tracking-wider px-1">Tipe Notifikasi</h3>
              <div className="bg-card border border-border rounded-2xl p-4 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-foreground font-bold text-sm">Notifikasi Chat</p>
                    <p className="text-muted-foreground text-xs">Pesan masuk dari pembeli atau penjual</p>
                  </div>
                  <button onClick={() => setChatNotif(!chatNotif)} className="text-primary focus:outline-none cursor-pointer">
                    {chatNotif ? <ToggleRight size={36} className="text-primary fill-primary/20" /> : <ToggleLeft size={36} className="text-muted-foreground" />}
                  </button>
                </div>

                <div className="h-px bg-border" />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-foreground font-bold text-sm">Notifikasi Penawaran Baru</p>
                    <p className="text-muted-foreground text-xs">Ada penawaran untuk barang yang dicari</p>
                  </div>
                  <button onClick={() => setOfferNotif(!offerNotif)} className="text-primary focus:outline-none cursor-pointer">
                    {offerNotif ? <ToggleRight size={36} className="text-primary fill-primary/20" /> : <ToggleLeft size={36} className="text-muted-foreground" />}
                  </button>
                </div>

                <div className="h-px bg-border" />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-foreground font-bold text-sm">Promo & Rekomendasi</p>
                    <p className="text-muted-foreground text-xs">Diskon produk terbaru & tips belanja mahasiswa</p>
                  </div>
                  <button onClick={() => setPromoNotif(!promoNotif)} className="text-primary focus:outline-none cursor-pointer">
                    {promoNotif ? <ToggleRight size={36} className="text-primary fill-primary/20" /> : <ToggleLeft size={36} className="text-muted-foreground" />}
                  </button>
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="text-foreground font-black text-sm uppercase tracking-wider px-1">Saluran Pengiriman</h3>
              <div className="bg-card border border-border rounded-2xl p-4 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-foreground font-bold text-sm">Saluran WhatsApp</p>
                    <p className="text-muted-foreground text-xs">Kirim update transaksi penting ke WA</p>
                  </div>
                  <button onClick={() => setWaChannel(!waChannel)} className="text-primary focus:outline-none cursor-pointer">
                    {waChannel ? <ToggleRight size={36} className="text-primary fill-primary/20" /> : <ToggleLeft size={36} className="text-muted-foreground" />}
                  </button>
                </div>
              </div>
            </section>

            <button
              onClick={handleSave}
              className="w-full bg-primary text-white font-black py-4 rounded-2xl text-sm shadow-lg active:scale-95 transition-transform cursor-pointer"
            >
              {saved ? "Pengaturan Tersimpan ✓" : "Simpan Pengaturan"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── PUSAT BANTUAN (HELP CENTER) PAGE ──
function HelpCenterPage({ onBack }: { onBack: () => void }) {
  const {  } = useApp();
  const [search, setSearch] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: "Bagaimana cara melakukan COD yang aman di UMM?",
      a: "Selalu lakukan COD di area ramai kampus pada jam kuliah (misal di gazebo GKB 1, depan ATM Center, atau perpustakaan pusat). Periksa kondisi fisik barang secara teliti sebelum menyerahkan uang pembayaran."
    },
    {
      q: "Mengapa akun saya memerlukan NIM terverifikasi?",
      a: "Untuk menjaga ekosistem Lapak Jas Merah tetap aman dan bebas dari penipuan pihak luar. Centang biru NIM membuktikan Anda benar-benar mahasiswa UMM aktif."
    },
    {
      q: "Bagaimana cara memasang iklan baru?",
      a: "Masuk ke tab 'Jual', unggah foto produk Anda, lengkapi judul, kategori, kondisi barang, harga, lokasi COD pilihan, dan deskripsi detail produk. Klik pasang iklan untuk menayangkannya."
    },
    {
      q: "Apakah pasang permintaan di papan permintaan berbayar?",
      a: "Ya, kami menyediakan paket berbayar murah khusus untuk memasang pencarian barang di papan permintaan: Rp 300 untuk tayang selama 3 hari, atau Rp 500 untuk penayangan standar selama 7 hari."
    },
    {
      q: "Bagaimana cara kerja penawaran barang?",
      a: "Jika ada pengguna lain memposting barang yang sedang mereka cari di Papan Permintaan dan Anda memilikinya, Anda dapat menekan tombol 'Tawarkan' untuk langsung memulai percakapan chat dengan pencari barang."
    }
  ];

  const filteredFaqs = faqs.filter(faq =>
    faq.q.toLowerCase().includes(search.toLowerCase()) ||
    faq.a.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header */}
      <div className="bg-primary sticky top-0 z-40 shadow-md">
        <div className="px-4 pt-10 pb-4 flex items-center gap-3">
          <button onClick={onBack} className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center cursor-pointer">
            <ArrowLeft size={18} className="text-white" />
          </button>
          <div className="flex-1">
            <h1 className="text-white font-black text-lg">Pusat Bantuan</h1>
            <p className="text-white/60 text-[11px]">Cari jawaban atas pertanyaanmu</p>
          </div>
        </div>

        {/* FAQ Search bar */}
        <div className="px-4 pb-4">
          <div className="bg-white rounded-xl px-3 py-2 flex items-center gap-2 shadow-inner">
            <Search size={15} className="text-muted-foreground shrink-0" />
            <input
              type="text"
              placeholder="Cari solusi masalah..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 text-xs text-foreground bg-transparent outline-none placeholder:text-muted-foreground"
            />
            {search && <button onClick={() => setSearch("")} className="cursor-pointer"><X size={12} className="text-muted-foreground" /></button>}
          </div>
        </div>
      </div>

      <div className="px-4 pt-6 space-y-6">
        {/* FAQs */}
        <section className="space-y-3">
          <h3 className="text-foreground font-black text-sm uppercase tracking-wider px-1">Pertanyaan Populer</h3>
          <div className="space-y-2.5">
            {filteredFaqs.length === 0 ? (
              <p className="text-center text-muted-foreground text-xs py-8">Hasil pencarian FAQ tidak ditemukan.</p>
            ) : (
              filteredFaqs.map((faq, i) => (
                <div key={i} className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm transition-all duration-300">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full px-4 py-3.5 flex items-center justify-between text-left font-bold text-xs text-foreground cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown size={14} className={`text-muted-foreground transform transition-transform ${openFaq === i ? "rotate-180" : ""}`} />
                  </button>
                  {openFaq === i && (
                    <div className="px-4 pb-4 pt-1 text-muted-foreground text-[11px] leading-relaxed border-t border-border/50 bg-secondary/20">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </section>

        {/* Contact buttons */}
        <section className="space-y-3">
          <h3 className="text-foreground font-black text-sm uppercase tracking-wider px-1">Masih Butuh Bantuan?</h3>
          <div className="grid grid-cols-2 gap-3">
            <a
              href="https://wa.me/628123456789"
              target="_blank"
              rel="noreferrer"
              className="bg-card border border-border rounded-2xl p-4 text-center shadow-sm hover:border-emerald-500 transition-colors cursor-pointer flex flex-col items-center gap-1.5"
            >
              <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                <Phone size={16} className="text-emerald-600" />
              </div>
              <p className="font-bold text-xs text-foreground">Hubungi Admin</p>
              <p className="text-muted-foreground text-[9px]">WhatsApp Chat</p>
            </a>

            <div
              onClick={() => toast.success("support@umm.ac.id berhasil disalin!")}
              className="bg-card border border-border rounded-2xl p-4 text-center shadow-sm hover:border-primary transition-colors cursor-pointer flex flex-col items-center gap-1.5"
            >
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <FileText size={16} className="text-primary" />
              </div>
              <p className="font-bold text-xs text-foreground">Kirim Email</p>
              <p className="text-muted-foreground text-[9px]">support@umm.ac.id</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

// ── KEBIJAKAN & SYARAT PAGE ──
function TermsPoliciesPage({ onBack }: { onBack: () => void }) {
  const {  } = useApp();
  const [activeTab, setActiveTab] = useState<"syarat" | "kebijakan">("syarat");

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header */}
      <div className="bg-primary sticky top-0 z-40 shadow-md">
        <div className="px-4 pt-10 pb-4 flex items-center gap-3">
          <button onClick={onBack} className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center cursor-pointer">
            <ArrowLeft size={18} className="text-white" />
          </button>
          <div className="flex-1">
            <h1 className="text-white font-black text-lg">Kebijakan & Syarat</h1>
            <p className="text-white/60 text-[11px]">Pedoman penggunaan Lapak Jas Merah</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex px-4 pb-3 gap-2">
          <button
            onClick={() => setActiveTab("syarat")}
            className="flex-1 py-2 rounded-xl text-xs font-bold transition-all text-center cursor-pointer"
            style={
              activeTab === "syarat"
                ? { background: "#fff", color: "#c41230" }
                : { background: "rgba(255,255,255,0.15)", color: "#fff" }
            }
          >
            Syarat & Ketentuan
          </button>
          <button
            onClick={() => setActiveTab("kebijakan")}
            className="flex-1 py-2 rounded-xl text-xs font-bold transition-all text-center cursor-pointer"
            style={
              activeTab === "kebijakan"
                ? { background: "#fff", color: "#c41230" }
                : { background: "rgba(255,255,255,0.15)", color: "#fff" }
            }
          >
            Kebijakan Privasi
          </button>
        </div>
      </div>

      <div className="px-4 pt-6">
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4 text-xs leading-relaxed text-muted-foreground">
          {activeTab === "syarat" ? (
            <>
              <h3 className="text-foreground font-black text-sm mb-2">Syarat & Ketentuan Penggunaan</h3>
              <p className="font-semibold text-foreground">1. Ketentuan Umum</p>
              <p>Lapak Jas Merah adalah platform jual beli khusus mahasiswa UMM. Pengguna wajib memiliki NIM aktif dan mematuhi etika civitas akademika.</p>
              
              <p className="font-semibold text-foreground">2. Kewajiban Penjual</p>
              <p>Penjual wajib menyajikan deskripsi barang dengan jujur, mengunggah foto asli, dan mematuhi kesepakatan COD yang aman di lingkungan kampus.</p>
              
              <p className="font-semibold text-foreground">3. Transaksi & COD</p>
              <p>Segala transaksi dilakukan secara mandiri via COD (Cash On Delivery) di area kampus UMM. Disarankan menggunakan gazebo GKB atau perpustakaan.</p>
              
              <p className="font-semibold text-foreground">4. Barang Terlarang</p>
              <p>Dilarang keras memperjualbelikan senjata, obat-obatan terlarang, barang akademis bajakan/joki tugas, serta barang yang melanggar hukum Indonesia.</p>
            </>
          ) : (
            <>
              <h3 className="text-foreground font-black text-sm mb-2">Kebijakan Privasi Lapak Jas Merah</h3>
              <p className="font-semibold text-foreground">1. Data yang Dikumpulkan</p>
              <p>Kami mengumpulkan data nama lengkap, NIM, jurusan, angkatan, nomor WhatsApp, serta gambar produk yang diunggah untuk keperluan verifikasi identitas internal.</p>
              
              <p className="font-semibold text-foreground">2. Penggunaan Data</p>
              <p>Data NIM digunakan semata-mata untuk memvalidasi status kemahasiswaan aktif di UMM guna mencegah penipuan dari pihak luar.</p>
              
              <p className="font-semibold text-foreground">3. Keamanan Informasi</p>
              <p>Kami menerapkan protokol keamanan data untuk mencegah akses tidak sah, kebocoran data, atau manipulasi informasi profil Anda.</p>
              
              <p className="font-semibold text-foreground">4. Pembagian Data</p>
              <p>Kami tidak pernah menjual atau membagikan data pribadi Anda kepada pihak ketiga di luar ekosistem Universitas Muhammadiyah Malang.</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── TENTANG LAPAK JAS MERAH ──
function AboutPage({ onBack }: { onBack: () => void }) {
  const {  } = useApp();

  const stats = [
    { value: "12.4K+", label: "Produk Aktif" },
    { value: "8.2K+", label: "Pengguna" },
    { value: "4.9K+", label: "Transaksi" },
    { value: "4.9★", label: "Rating" },
  ];

  const features = [
    { emoji: "🛡️", title: "Transaksi Aman", desc: "Escrow & verifikasi NIM mahasiswa aktif UMM sebelum transaksi berlangsung" },
    { emoji: "🎓", title: "Khusus Civitas UMM", desc: "Platform eksklusif untuk mahasiswa, dosen, dan staf Universitas Muhammadiyah Malang" },
    { emoji: "💬", title: "Chat Langsung", desc: "Negosiasi harga & atur jadwal COD langsung dengan penjual tanpa perantara" },
    { emoji: "📍", title: "COD di Kampus", desc: "Transaksi tatap muka aman di area kampus UMM, GKB, perpustakaan, dan sekitarnya" },
    { emoji: "⚡", title: "Pasang Iklan Gratis", desc: "Jual barang tanpa biaya komisi. Mulai berjualan dalam hitungan menit" },
    { emoji: "🔔", title: "Notifikasi Real-time", desc: "Dapatkan notifikasi instan saat ada pembeli, pesan chat, atau update pesanan" },
  ];

  const team = [
    { name: "Ahmad Rizky Pratama", role: "Founder & CEO", prodi: "Teknik Informatika '22", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&auto=format" },
    { name: "Dinda Rahmawati", role: "UI/UX Designer", prodi: "Desain Komunikasi Visual '22", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&auto=format" },
    { name: "Fajar Andrian", role: "Backend Developer", prodi: "Teknik Informatika '21", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&auto=format" },
    { name: "Siti Rahayu", role: "Marketing & Growth", prodi: "Manajemen '22", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&auto=format" },
  ];

  const milestones = [
    { year: "Mar 2024", event: "Lapak Jas Merah diluncurkan sebagai proyek PKM-KC oleh mahasiswa TI UMM" },
    { year: "Jun 2024", event: "Mencapai 1.000 pengguna terdaftar dalam 3 bulan pertama" },
    { year: "Sep 2024", event: "Fitur Chat & COD diluncurkan — transaksi makin mudah & aman" },
    { year: "Jan 2025", event: "Integrasi QRIS untuk pembayaran digital. Papan Permintaan diluncurkan" },
    { year: "Jun 2026", event: "12.400+ produk aktif & 8.200+ pengguna aktif. Versi 1.0.0 dirilis" },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-primary sticky top-0 z-40 shadow-md">
        <div className="px-4 pt-10 pb-4 flex items-center gap-3">
          <button onClick={onBack} className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
            <ArrowLeft size={18} className="text-white" />
          </button>
          <h1 className="flex-1 text-white font-black text-lg">Tentang Lapak Jas Merah</h1>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="relative overflow-hidden" style={{ background: "linear-gradient(160deg, #c41230 0%, #8b0d22 60%, #1a1a2e 100%)", minHeight: 220 }}>
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full opacity-10" style={{ background: "#f59e0b" }} />
        <div className="absolute bottom-0 -left-10 w-36 h-36 rounded-full opacity-10" style={{ background: "#fff" }} />
        <div className="relative z-10 px-6 pt-8 pb-10 flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-2xl mb-4">
            <span className="text-primary font-black text-2xl leading-none">UMM</span>
          </div>
          <h2 className="text-white font-black text-2xl leading-tight mb-1">Lapak Jas Merah</h2>
          <p className="text-white/70 text-sm mb-3">Marketplace Civitas Akademika UMM</p>
          <div className="inline-flex items-center gap-2 bg-white/15 border border-white/20 rounded-full px-3 py-1.5">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-white text-[11px] font-bold">v1.0.0 · Juni 2026</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mx-4 -mt-5 bg-card rounded-2xl shadow-xl border border-border p-4 grid grid-cols-4 gap-2 mb-6">
        {stats.map(({ value, label }) => (
          <div key={label} className="text-center">
            <p className="text-primary font-black text-base leading-none">{value}</p>
            <p className="text-muted-foreground text-[9px] mt-1 leading-tight">{label}</p>
          </div>
        ))}
      </div>

      <div className="px-4 space-y-6">
        {/* Tentang */}
        <div className="bg-card rounded-2xl border border-border p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center">
              <Info size={15} className="text-primary" />
            </div>
            <h3 className="text-foreground font-black text-sm">Apa itu Lapak Jas Merah?</h3>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed">
            <span className="font-bold text-foreground">Lapak Jas Merah</span> adalah platform marketplace digital yang dirancang khusus untuk civitas akademika Universitas Muhammadiyah Malang (UMM).
          </p>
          <p className="text-muted-foreground text-sm leading-relaxed mt-2">
            Platform ini memfasilitasi jual beli barang & jasa antar mahasiswa, dosen, dan staf UMM secara aman, mudah, dan terpercaya — dengan verifikasi NIM aktif sebagai jaminan keamanan transaksi.
          </p>
        </div>

        {/* Visi Misi */}
        <div className="space-y-3">
          <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-2xl border border-primary/20 p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🎯</span>
              <h3 className="text-foreground font-black text-sm">Visi</h3>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Menjadi marketplace mahasiswa terpercaya dan terdepan di Indonesia, yang memberdayakan civitas akademika melalui ekosistem jual beli yang sehat dan transparan.
            </p>
          </div>
          <div className="bg-gradient-to-r from-blue-50 to-blue-50/50 rounded-2xl border border-blue-100 p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🚀</span>
              <h3 className="text-foreground font-black text-sm">Misi</h3>
            </div>
            <ul className="space-y-1.5">
              {[
                "Menyediakan platform aman & terverifikasi untuk jual beli intra-kampus",
                "Mendorong ekonomi kreatif dan kemandirian finansial mahasiswa",
                "Memudahkan akses barang kebutuhan perkuliahan dengan harga terjangkau",
                "Membangun komunitas jual beli yang jujur dan bertanggung jawab",
              ].map((m) => (
                <li key={m} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 size={13} className="text-blue-500 shrink-0 mt-0.5" />
                  <span>{m}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Fitur Unggulan */}
        <div>
          <h3 className="text-foreground font-black text-sm mb-3">Fitur Unggulan</h3>
          <div className="grid grid-cols-2 gap-2.5">
            {features.map(({ emoji, title, desc }) => (
              <div key={title} className="bg-card rounded-2xl border border-border p-3.5 shadow-sm">
                <span className="text-2xl mb-2 block">{emoji}</span>
                <p className="text-foreground font-bold text-xs mb-1">{title}</p>
                <p className="text-muted-foreground text-[10px] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Perjalanan / Milestones */}
        <div>
          <h3 className="text-foreground font-black text-sm mb-3">Perjalanan Kami</h3>
          <div className="bg-card rounded-2xl border border-border p-4 shadow-sm">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-border" />
              <div className="space-y-5">
                {milestones.map(({ year, event }, i) => (
                  <div key={year} className="flex gap-4 items-start">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 ${i === milestones.length - 1 ? "bg-primary" : "bg-muted border-2 border-border"}`}>
                      {i === milestones.length - 1 ? (
                        <span className="w-2 h-2 bg-white rounded-full" />
                      ) : (
                        <span className="w-2 h-2 bg-muted-foreground/40 rounded-full" />
                      )}
                    </div>
                    <div className="flex-1 pb-1">
                      <p className={`text-[10px] font-black mb-0.5 ${i === milestones.length - 1 ? "text-primary" : "text-muted-foreground"}`}>{year}</p>
                      <p className="text-foreground text-xs leading-relaxed">{event}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tim */}
        <div>
          <h3 className="text-foreground font-black text-sm mb-3">Tim Pengembang</h3>
          <div className="grid grid-cols-2 gap-2.5">
            {team.map(({ name, role, prodi, avatar }) => (
              <div key={name} className="bg-card rounded-2xl border border-border p-3.5 shadow-sm flex flex-col items-center text-center">
                <img src={avatar} alt={name} className="w-14 h-14 rounded-full object-cover border-2 border-border mb-2" />
                <p className="text-foreground font-bold text-xs leading-tight">{name}</p>
                <p className="text-primary text-[10px] font-semibold mt-0.5">{role}</p>
                <p className="text-muted-foreground text-[9px] mt-0.5 leading-tight">{prodi}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Kontak */}
        <div className="bg-gradient-to-br from-primary to-[#8b0d22] rounded-2xl p-4 text-center shadow-md">
          <p className="text-white font-black text-sm mb-1">Ada Pertanyaan?</p>
          <p className="text-white/70 text-[11px] mb-3">Hubungi kami melalui email atau media sosial</p>
          <div className="space-y-2">
            {[
              { label: "📧 Email", value: "lapak.jasmerah@umm.ac.id" },
              { label: "📸 Instagram", value: "@lapakjasmerah.umm" },
              { label: "📍 Kampus", value: "UMM, Lowokwaru, Malang" },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 flex items-center justify-between">
                <span className="text-white/70 text-[11px]">{label}</span>
                <span className="text-white font-semibold text-[11px]">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pb-4">
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <span className="text-primary font-black text-base">UMM</span>
          </div>
          <p className="text-foreground font-bold text-sm">Lapak Jas Merah</p>
          <p className="text-muted-foreground text-[11px] mt-0.5">v1.0.0 · © 2026 Civitas UMM</p>
          <p className="text-muted-foreground text-[10px] mt-1">Dibuat dengan ❤️ oleh mahasiswa, untuk mahasiswa</p>
        </div>
      </div>
    </div>
  );
}

// ── PROFILE PAGE ──
export default function ProfilePage() {
  const navigate = useNavigate();
  const [profileSubPage, setProfileSubPage] = useState<any>(null);

  const { user, profile, refreshSession } = useAuth();

  const handlePurchaseBadge = async () => {
    if (!user) {
      toast.error("Anda harus login untuk membeli badge");
      return;
    }
    
    setIsProcessingPayment(true);
    
    // Simulasi proses payment gateway
    setTimeout(async () => {
      try {
        await authService.updateProfile(user.id, { is_verified_seller: true });
        await refreshSession();
        
        setIsProcessingPayment(false);
        setBadgePaid(true);
        toast.success("Pembayaran berhasil!");
      } catch (err: any) {
        setIsProcessingPayment(false);
        toast.error("Gagal memperbarui profil: " + err.message);
      }
    }, 2000);
  };
  const isLoggedIn = !!user;
  const displayName = profile?.full_name || user?.user_metadata?.full_name || (isLoggedIn ? "Mahasiswa" : "Pengguna Tamu");
  const displayRole = profile?.role === 'ADMIN' ? 'Admin' : (isLoggedIn ? "Mahasiswa UMM" : "Tamu");
  const displayNim = profile?.nim || "";

  const {
    
    
    setActiveTab,
    editingItem,
    setEditingItem,
    setShowReportModal,
    setShowSalesStats,
    setShowSuggestionBox,
    setScreen,
    profileAvatar,
    setProfileAvatar,
    profileBanner,
    setProfileBanner,
    triggerToast,
    setSelectedProduct,
    toggleWishlist,
    wishlist,
    listings,
    setListings,
    products,
    isDarkMode,
    setIsDarkMode,
  } = useApp();

  const [activeProfileTab, setActiveProfileTab] = useState<"iklan" | "terjual" | "disukai">("iklan");

  const [showKtm, setShowKtm] = useState(false);
  const [showBadgePay, setShowBadgePay] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [badgePaid, setBadgePaid] = useState(false);

  useEffect(() => {
    if (user && products) {
      setListings(products.filter((p: any) => p.seller_id === user.id));
    }
  }, [user, products, setListings]);

  if (profileSubPage === "penjualan") return <div className="animate-page"><SalesPage onBack={() => setProfileSubPage(null)} /></div>;
  if (profileSubPage === "pembelian") return <div className="animate-page"><PurchasePage onBack={() => setProfileSubPage(null)} /></div>;
  if (profileSubPage === "editprofil") return <div className="animate-page"><EditProfilePage onBack={() => setProfileSubPage(null)} /></div>;
  if (profileSubPage === "editbarang") return <div className="animate-page"><EditItemPage onBack={() => setProfileSubPage(null)} /></div>;
  if (profileSubPage === "keamanan") return <div className="animate-page"><SecurityPrivacyPage onBack={() => setProfileSubPage(null)} /></div>;
  if (profileSubPage === "notifikasi") return <div className="animate-page"><NotificationSettingsPage onBack={() => setProfileSubPage(null)} /></div>;
  if (profileSubPage === "bantuan") return <div className="animate-page"><HelpCenterPage onBack={() => setProfileSubPage(null)} /></div>;
  if (profileSubPage === "kebijakan") return <div className="animate-page"><TermsPoliciesPage onBack={() => setProfileSubPage(null)} /></div>;
  if (profileSubPage === "tentang") return <div className="animate-page"><AboutPage onBack={() => setProfileSubPage(null)} /></div>;

  const soldItems: any[] = [];

  const likedItems: any[] = [];

  const menuGroups = [
    {
      title: "Transaksi",
      items: [
        { icon: ClipboardList, label: "Daftar Pembelian", badge: null, color: "#3B82F6", onPress: () => setProfileSubPage("pembelian") },
        { icon: Package, label: "Daftar Penjualan", badge: null, color: "#10B981", onPress: () => setProfileSubPage("penjualan") },
      ],
    },
    {
      title: "Akun",
      items: [
        { icon: Edit3, label: "Edit Profil", badge: null, color: "#8B5CF6", onPress: () => setProfileSubPage("editprofil") },
        { icon: BadgeCheck, label: "Verifikasi Mahasiswa", badge: "Terverifikasi", color: "#10B981", onPress: () => setShowKtm(true) },
        { icon: Lock, label: "Keamanan & Privasi", badge: null, color: "#6B7280", onPress: () => setProfileSubPage("keamanan") },
        { icon: BellIcon, label: "Notifikasi", badge: null, color: "#F97316", onPress: () => setProfileSubPage("notifikasi") },
      ],
    },
    {
      title: "Bantuan",
      items: [
        { icon: HelpCircle, label: "Pusat Bantuan", badge: null, color: "#06B6D4", onPress: () => setProfileSubPage("bantuan") },
        { icon: MessageSquare, label: "Kotak Saran", badge: null, color: "#8B5CF6", onPress: () => setShowSuggestionBox(true) },
        { icon: Shield, label: "Kebijakan & Syarat", badge: null, color: "#6B7280", onPress: () => setProfileSubPage("kebijakan") },
        { icon: ExternalLink, label: "Tentang Lapak Jas Merah", badge: null, color: "#c41230", onPress: () => setProfileSubPage("tentang") },
      ],
    },
    {
      title: "Tampilan",
      items: [
        {
          icon: isDarkMode ? Sun : Moon,
          label: isDarkMode ? "Mode Terang" : "Mode Gelap",
          badge: null,
          color: "#F59E0B",
          onPress: () => setIsDarkMode(!isDarkMode),
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">

      {/* ── HEADER PROFILE ── */}
      <div className="relative h-44">
        {/* Banner container with overflow-hidden */}
        <div className="absolute inset-0 overflow-hidden bg-muted">
          <img
            src={profileBanner || "/default-banner.jpg"}
            alt="Banner"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/20" />
        </div>

        {/* Camera icon to change banner */}
        <label className="absolute top-10 left-4 w-9 h-9 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center cursor-pointer transition-colors shadow border border-white/20 z-10">
          <Camera size={16} className="text-white" />
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onloadend = () => {
                  if (typeof reader.result === "string") {
                    setProfileBanner(reader.result);
                  }
                };
                reader.readAsDataURL(file);
              }
            }}
          />
        </label>

        {/* Settings button */}
        <button 
          onClick={() => setProfileSubPage("editprofil")}
          className="absolute top-10 right-4 w-9 h-9 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center border border-white/20 transition-colors shadow z-10"
        >
          <Settings size={18} className="text-white" />
        </button>

        {/* Avatar card — overlaps header */}
        <div className="absolute left-0 right-0 bottom-0 translate-y-1/2 flex flex-col items-center px-4 z-10">
          <div className="relative mb-2">
            <img
              src={profileAvatar || profile?.avatar_url || "/default-avatar.png"}
              alt="Profil"
              className="w-24 h-24 rounded-full border-4 border-white shadow-xl object-cover bg-muted"
            />
            <label className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full border-2 border-white flex items-center justify-center cursor-pointer shadow hover:bg-primary/95 transition-all">
              <Camera size={13} className="text-white" />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      if (typeof reader.result === "string") {
                        setProfileAvatar(reader.result);
                      }
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
            </label>
          </div>
        </div>
      </div>

      {/* ── USER INFO ── */}
      <div className="pt-16 pb-4 px-4 text-center">
        <div className="flex items-center justify-center gap-1.5 mb-1">
          <h2 className="text-foreground font-black text-xl">{displayName}</h2>
          {profile?.is_verified_seller && <BadgeCheck size={18} className="text-blue-500 fill-blue-100" />}
        </div>
        <p className="text-muted-foreground text-sm mb-1">
          {isLoggedIn ? `@${profile?.username || displayName.replace(/\s+/g, '').toLowerCase()} · ${displayRole}` : '@guest · Tamu'}
        </p>
        
        {profile?.bio && (
          <p className="text-sm text-foreground mb-3 px-6">{profile.bio}</p>
        )}

        <div className="flex items-center justify-center gap-1 mb-4">
          <MapPin size={12} className="text-muted-foreground" />
          <span className="text-muted-foreground text-xs">{isLoggedIn ? (profile?.location || 'Universitas Muhammadiyah Malang') : 'Belum Login'}</span>
        </div>

        {/* Rating & stats */}
        <div className="flex items-center justify-center gap-6 mb-4">
          <div className="text-center">
            <p className="text-foreground font-black text-lg leading-none">0.0</p>
            <div className="flex items-center gap-0.5 justify-center mt-0.5">
              {[1,2,3,4,5].map((s) => (
                <Star key={s} size={10} className="text-muted-foreground/30 fill-transparent" />
              ))}
            </div>
            <p className="text-muted-foreground text-[10px] mt-0.5">Rating</p>
          </div>
          <div className="w-px h-10 bg-border" />
          <div className="text-center">
            <p className="text-foreground font-black text-lg leading-none">0</p>
            <p className="text-muted-foreground text-[10px] mt-1">Terjual</p>
          </div>
          <div className="w-px h-10 bg-border" />
          <div className="text-center">
            <p className="text-foreground font-black text-lg leading-none">{listings.length}</p>
            <p className="text-muted-foreground text-[10px] mt-1">Iklan Aktif</p>
          </div>
          <div className="w-px h-10 bg-border" />
          <div className="text-center">
            <p className="text-foreground font-black text-lg leading-none">0%</p>
            <p className="text-muted-foreground text-[10px] mt-1">Respons</p>
          </div>
        </div>

        {/* Bergabung */}
        <div className="inline-flex items-center gap-1.5 bg-secondary px-3 py-1.5 rounded-full">
          <BadgeCheck size={12} className={isLoggedIn ? "text-primary" : "text-muted-foreground"} />
          <span className={`${isLoggedIn ? "text-primary" : "text-muted-foreground"} text-[11px] font-bold`}>
            {isLoggedIn ? "NIM Terverifikasi" : "Belum Terverifikasi"} · Bergabung {user?.created_at ? new Date(user.created_at).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' }).replace('mrt', 'Mar').replace('mei', 'Mei').replace('agu', 'Agt').replace('okt', 'Okt').replace('des', 'Des') : 'Mar 2024'}
          </span>
        </div>
      </div>

      {/* ── BADGE PENJUAL TERVERIFIKASI ── */}
      <div className="px-4 mb-5">
        <button
          onClick={() => !profile?.is_verified_seller && setShowBadgePay(true)}
          className={`w-full rounded-2xl border-2 p-4 flex items-center gap-3 text-left transition-all shadow-sm ${
            profile?.is_verified_seller
              ? "bg-blue-50 border-blue-100 dark:bg-blue-900/20 dark:border-blue-800"
              : "bg-card border-border active:scale-[0.98] hover:border-blue-200 dark:hover:border-blue-800"
          }`}
        >
          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
            profile?.is_verified_seller ? "bg-blue-500" : "bg-secondary"
          }`}>
            <BadgeCheck size={20} className={profile?.is_verified_seller ? "text-white" : "text-muted-foreground"} />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5">
              Badge Penjual Terverifikasi
              {profile?.is_verified_seller && <CheckCircle2 size={12} className="text-blue-500" />}
            </h3>
            <p className="text-[11px] text-muted-foreground mt-0.5 leading-tight">
              {profile?.is_verified_seller 
                ? "Kepercayaan pembeli meningkat dengan lencana ini." 
                : "Tingkatkan kepercayaan pembeli dengan lencana biru di profilmu."}
            </p>
          </div>
          {!profile?.is_verified_seller && (
            <div className="shrink-0 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-xs font-bold">
              Beli
            </div>
          )}
        </button>
      </div>

      {/* Payment Sheet */}
      {showBadgePay && (
        <div className="fixed inset-0 z-[90] flex flex-col items-center justify-center px-4" style={{ maxWidth: 430, margin: "0 auto" }}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !isProcessingPayment && setShowBadgePay(false)} />
          
          <div className="bg-background w-full rounded-3xl p-6 relative z-10 shadow-2xl animate-in slide-in-from-bottom-8">
            <button 
              onClick={() => !isProcessingPayment && setShowBadgePay(false)}
              className="absolute top-4 right-4 w-8 h-8 bg-secondary rounded-full flex items-center justify-center"
            >
              <X size={16} className="text-muted-foreground" />
            </button>
            
            {badgePaid ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCheck size={32} className="text-green-500" />
                </div>
                <h3 className="text-foreground font-black text-xl mb-2">Pembayaran Berhasil!</h3>
                <p className="text-muted-foreground text-sm mb-6">Badge penjual terverifikasi telah ditambahkan ke profil Anda.</p>
                <button
                  onClick={() => setShowBadgePay(false)}
                  className="w-full bg-primary text-white font-bold py-3.5 rounded-xl"
                >
                  Tutup
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
                    <BadgeCheck size={24} className="text-blue-500" />
                  </div>
                  <div>
                    <h3 className="text-foreground font-black text-lg">Badge Terverifikasi</h3>
                    <p className="text-muted-foreground text-[11px]">Berlaku selamanya untuk akun ini</p>
                  </div>
                </div>
                
                <div className="bg-secondary rounded-2xl p-4 mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-muted-foreground text-sm">Harga</span>
                    <span className="text-foreground font-bold text-sm">Rp 5.000</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-muted-foreground text-sm">Biaya Admin</span>
                    <span className="text-foreground font-bold text-sm">Rp 0</span>
                  </div>
                  <div className="w-full h-px bg-border my-3" />
                  <div className="flex justify-between items-center">
                    <span className="text-foreground font-black">Total Tagihan</span>
                    <span className="text-primary font-black text-lg">Rp 5.000</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setShowBadgePay(false)}
                    disabled={isProcessingPayment}
                    className="flex-1 bg-secondary text-foreground font-bold py-3.5 rounded-xl disabled:opacity-50"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handlePurchaseBadge}
                    disabled={isProcessingPayment}
                    className="flex-[2] bg-primary text-white font-black py-3.5 rounded-xl active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:active:scale-100"
                  >
                    {isProcessingPayment ? (
                      <span className="animate-pulse">Memproses...</span>
                    ) : (
                      <>Bayar Sekarang</>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── TOTAL PENJUALAN CARD ── */}
      {(() => {
        const salesTotal = 0; // total dari transaksi selesai
        return (
          <div className="px-4 mb-5">
            <button
              onClick={() => navigate("/sales-stats")}
              className="w-full bg-gradient-to-r from-[#c41230] to-[#8b0d22] rounded-2xl p-4 shadow-md text-left active:scale-[0.98] transition-transform"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-white/70 text-xs font-semibold mb-1 flex items-center gap-1.5">
                    <TrendingUp size={11} /> Total Penjualan
                  </p>
                  <p className="text-white font-black text-2xl leading-none">{formatPrice(salesTotal)}</p>
                  <p className="text-white/60 text-[10px] mt-1">Belum ada data</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="bg-white/20 rounded-xl px-2.5 py-1 flex items-center gap-1">
                    <span className="text-white text-[10px] font-bold">Lihat Statistik</span>
                    <ChevronRight size={11} className="text-white" />
                  </div>
                  <div className="flex gap-3 text-center mt-1">
                    <div>
                      <p className="text-white font-black text-base leading-none">0</p>
                      <p className="text-white/60 text-[9px]">Terjual</p>
                    </div>
                    <div>
                      <p className="text-white font-black text-base leading-none">0</p>
                      <p className="text-white/60 text-[9px]">Proses</p>
                    </div>
                  </div>
                </div>
              </div>
            </button>
          </div>
        );
      })()}


      {/* ── IKLAN SAYA TABS ── */}
      <div className="px-4 mb-1">
        <h3 className="text-foreground font-bold text-sm mb-3">Iklan Saya</h3>
        <div className="flex bg-muted rounded-xl p-1 gap-1">
          {([
            { id: "iklan", label: "Aktif", count: listings.length },
            { id: "terjual", label: "Terjual", count: 0 },
            { id: "disukai", label: "Disukai", count: 0 },
          ] as const).map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveProfileTab(t.id)}
              className="flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1"
              style={
                activeProfileTab === t.id
                  ? { background: "#c41230", color: "#fff" }
                  : { background: "transparent", color: "#8a8a9a" }
              }
            >
              {t.label}
              <span
                className="text-[10px] font-black px-1.5 py-0.5 rounded-full"
                style={
                  activeProfileTab === t.id
                    ? { background: "rgba(255,255,255,0.25)", color: "#fff" }
                    : { background: "rgba(0,0,0,0.08)", color: "#8a8a9a" }
                }
              >
                {t.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── TAB CONTENT ── */}
      <div className="px-4 pt-3 pb-1">
        {activeProfileTab === "iklan" && (
          <div className="space-y-3">
            {listings.map((item) => (
              <div key={item.id} className="bg-card rounded-2xl border border-border flex items-center gap-3 p-3 shadow-sm">
                <div className="relative shrink-0">
                  <img src={item.image} alt={item.name} className="w-16 h-16 rounded-xl object-cover bg-muted" />
                  {item.status === "habis" && (
                    <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center">
                      <span className="text-white text-[9px] font-black">HABIS</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-foreground font-bold text-sm truncate">{item.name}</p>
                  <p className="text-primary font-black text-sm">{formatPrice(item.price)}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-1 text-muted-foreground text-[10px]">
                      <Eye size={10} /> {item.views}
                    </span>
                    <span className="flex items-center gap-1 text-muted-foreground text-[10px]">
                      <Heart size={10} /> {item.likes}
                    </span>
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={item.status === "aktif"
                        ? { background: "#d1fae5", color: "#065f46" }
                        : { background: "#fee2e2", color: "#991b1b" }}
                    >
                      {item.status === "aktif" ? "Aktif" : "Stok Habis"}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5 shrink-0">
                  <button
                    onClick={() => { setEditingItem(item); setProfileSubPage("editbarang"); }}
                    className="w-8 h-8 bg-secondary rounded-xl flex items-center justify-center cursor-pointer active:scale-95"
                  >
                    <Edit3 size={13} className="text-primary" />
                  </button>
                </div>
              </div>
            ))}
            <button
              onClick={() => navigate("/sell")}
              className="w-full border-2 border-dashed border-primary/30 rounded-2xl py-4 flex items-center justify-center gap-2 text-primary font-bold text-sm"
            >
              <PlusCircle size={16} /> Pasang Iklan Baru
            </button>
          </div>
        )}

        {activeProfileTab === "terjual" && (
          <div className="space-y-3">
            {soldItems.map((item) => (
              <div key={item.id} className="bg-card rounded-2xl border border-border flex items-center gap-3 p-3 shadow-sm">
                <img src={item.image} alt={item.name} className="w-16 h-16 rounded-xl object-cover bg-muted shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-foreground font-bold text-sm truncate">{item.name}</p>
                  <p className="text-primary font-black text-sm">{formatPrice(item.price)}</p>
                  <p className="text-muted-foreground text-[10px] mt-1">Dibeli oleh <span className="font-semibold text-foreground">{item.buyer}</span></p>
                  <p className="text-muted-foreground text-[10px]">{item.soldDate}</p>
                </div>
                <span className="shrink-0 bg-green-100 text-green-700 text-[10px] font-black px-2.5 py-1 rounded-full">
                  Terjual
                </span>
              </div>
            ))}
          </div>
        )}

        {activeProfileTab === "disukai" && (
          <div className="grid grid-cols-2 gap-3">
            {likedItems.map((item) => {
              const prod = products.find((p) => p.id === item.id) || item;
              return (
                <div 
                  key={item.id} 
                  onClick={() => navigate(`/product/${prod as Product.id}`)}
                  className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm cursor-pointer active:scale-95 transition-transform"
                >
                  <div className="relative">
                    <img src={item.image} alt={item.name} className="w-full h-32 object-cover bg-muted" />
                    <button 
                      onClick={(e) => { e.stopPropagation(); toggleWishlist(item.id); }}
                      className="absolute top-2 right-2 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow cursor-pointer text-primary"
                    >
                      <Heart size={13} className="text-primary fill-primary" />
                    </button>
                  </div>
                  <div className="p-2.5">
                    <p className="text-foreground font-semibold text-xs truncate">{item.name}</p>
                    <p className="text-primary font-black text-sm mt-0.5">{formatPrice(item.price)}</p>
                    <p className="text-muted-foreground text-[10px] mt-0.5">{item.seller}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── MENU GROUPS ── */}
      <div className="px-4 pt-5 space-y-4">
        {menuGroups.map((group) => (
          <div key={group.title}>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 px-1">
              {group.title}
            </p>
            <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
              {group.items.map((item, idx) => (
                <button
                  key={item.label}
                  onClick={item.onPress}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 hover:bg-secondary/50 active:bg-secondary transition-colors text-left ${idx < group.items.length - 1 ? "border-b border-border" : ""}`}
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: item.color + "18" }}
                  >
                    <item.icon size={16} style={{ color: item.color }} />
                  </div>
                  <span className="flex-1 text-sm font-semibold text-foreground">{item.label}</span>
                  {item.badge && (
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0"
                      style={
                        item.badge === "Terverifikasi"
                          ? { background: "#d1fae5", color: "#065f46" }
                          : { background: "#fff0f3", color: "#c41230" }
                      }
                    >
                      {item.badge}
                    </span>
                  )}
                  <ChevronRight size={15} className="text-muted-foreground shrink-0" />
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Logout */}
        <button
          onClick={async () => { await authService.logout(); navigate("/"); }}
          className="w-full bg-card rounded-2xl border border-border p-4 flex items-center justify-center gap-2 text-primary font-bold text-sm shadow-sm hover:bg-secondary/50 active:bg-secondary transition-colors"
        >
          <LogOut size={16} className="text-primary" />
          Keluar dari Akun
        </button>

        <p className="text-center text-muted-foreground text-[11px] pb-2">
          Lapak Jas Merah v1.0.0 · Khusus Civitas UMM
        </p>
      </div>

      {showKtm && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center px-6" style={{ maxWidth: 430, margin: "0 auto" }}>
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowKtm(false)} />
          <div className="relative bg-gradient-to-br from-red-700 via-red-800 to-slate-900 rounded-3xl shadow-2xl p-6 w-full max-w-[360px] text-white border border-white/10 z-10">
            {/* Header UMM */}
            <div className="flex items-center justify-between border-b border-white/15 pb-4 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shrink-0">
                  <span className="text-primary font-black text-xs">UMM</span>
                </div>
                <div>
                  <h4 className="font-extrabold text-[11px] tracking-wider uppercase leading-none text-white">Universitas</h4>
                  <h4 className="font-extrabold text-[9px] text-white/70 tracking-widest uppercase leading-none mt-1">Muhammadiyah Malang</h4>
                </div>
              </div>
              <BadgeCheck size={20} className="text-blue-400 fill-blue-500/20" />
            </div>

            {/* KTM Body */}
            <div className="flex gap-4">
              {/* Photo */}
              <div className="w-24 h-32 rounded-xl border border-white/20 bg-white/5 overflow-hidden shrink-0">
                <img src={profileAvatar} alt="" className="w-full h-full object-cover" />
              </div>
              {/* Info */}
              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <p className="text-[9px] text-white/50 uppercase font-black tracking-wider leading-none mb-0.5">Nama Lengkap</p>
                  <p className="font-bold text-sm truncate leading-tight mb-2 text-white">{displayName}</p>
                  
                  <p className="text-[9px] text-white/50 uppercase font-black tracking-wider leading-none mb-0.5">NIM</p>
                  <p className="font-mono font-bold text-sm mb-2 text-white">{displayNim}</p>

                  <p className="text-[9px] text-white/50 uppercase font-black tracking-wider leading-none mb-0.5">Peran / Status</p>
                  <p className="font-bold text-[10px] text-white/90 truncate leading-tight">{displayRole}</p>
                </div>

                <div className="inline-flex items-center gap-1 bg-green-500/20 border border-green-500/30 rounded-lg px-2 py-1 self-start mt-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-[9px] text-green-300 font-extrabold tracking-wide uppercase">Mahasiswa Aktif</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-5 pt-3.5 border-t border-white/10 flex justify-between items-center text-[8px] text-white/40 font-mono">
              <span>KTM DIGITAL LAPAK JAS MERAH</span>
              <button 
                onClick={() => setShowKtm(false)}
                className="bg-white/10 hover:bg-white/20 text-white font-bold px-3 py-1.5 rounded-lg font-sans text-[9px] transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
