import { toast } from "react-hot-toast";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, CheckCircle2, Clock, Package, MapPin, MessageSquare,
  Phone, ChevronRight, Copy, Share2, Star, RefreshCw,
} from "lucide-react";
import { useApp } from "../context";
import { formatPrice } from "../data";
import { orderService } from "../../services/orderService";
import { authService } from "../../services/authService";

const STEPS = [
  {
    key: "dikonfirmasi",
    label: "Pesanan Dikonfirmasi",
    sub: "Penjual menerima pesananmu",
    icon: CheckCircle2,
    color: "#c41230",
  },
  {
    key: "diproses",
    label: "Pesanan Diproses",
    sub: "Penjual sedang menyiapkan barang",
    icon: Package,
    color: "#3B82F6",
  },
  {
    key: "menuju_lokasi",
    label: "Menuju Lokasi COD",
    sub: "Penjual sedang dalam perjalanan ke titik temu",
    icon: MapPin,
    color: "#F59E0B",
  },
  {
    key: "selesai",
    label: "Transaksi Selesai",
    sub: "Barang telah diterima dengan baik",
    icon: CheckCircle2,
    color: "#10B981",
  },
] as const;

type Status = "dikonfirmasi" | "diproses" | "menuju_lokasi" | "selesai" | "dibatalkan";

export default function OrderTrackingPage() {
  const navigate = useNavigate();

  const {
    trackingOrder,
    setTrackingOrder,
    setActiveTab,
    purchaseData,
    setPurchaseData,
    salesData,
    setSalesData,
    startChat,
  } = useApp();
  const [showReview, setShowReview] = useState(false);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!trackingOrder) return null;

  const currentStatus = trackingOrder.status;

  const currentIdx = Math.max(0, STEPS.findIndex((s) => s.key === currentStatus));
  const currentStep = STEPS[currentIdx];

  const estimateMap: Record<Status, string> = {
    dikonfirmasi: "Estimasi COD: ±30 menit",
    diproses: "Estimasi COD: ±20 menit",
    menuju_lokasi: "Estimasi COD: ±5 menit",
    selesai: "Transaksi selesai",
    dibatalkan: "Transaksi dibatalkan",
  };

  async function handleConfirmReceipt() {
    if (!trackingOrder) return;
    try {
      await orderService.updateOrderStatus(trackingOrder.id, 'selesai');
      // Update active trackingOrder
      setTrackingOrder({
        ...trackingOrder,
        status: "selesai",
      });

      // Update purchase list
      setPurchaseData((prev) =>
        prev.map((p) => p.id === trackingOrder.id ? { ...p, status: "selesai" } : p)
      );

      // Update sales list
      const orderIdNum = trackingOrder.id.slice(-6);
      setSalesData((prev) =>
        prev.map((s) => s.id.slice(-6) === orderIdNum ? { ...s, status: "selesai" } : s)
      );
    } catch (err) {
      console.error("Gagal konfirmasi pesanan", err);
      toast.error("Terjadi kesalahan saat mengkonfirmasi pesanan");
    }
  }

  function handleCopyId() {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (showReview) {
    return (
      <div className="fixed inset-0 z-[60] bg-background flex flex-col" style={{ maxWidth: 430, margin: "0 auto" }}>
        <div className="bg-primary px-4 pt-10 pb-4 flex items-center gap-3 shadow-md">
          <button onClick={() => setShowReview(false)} className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
            <ArrowLeft size={18} className="text-white" />
          </button>
          <h1 className="text-white font-black text-lg">Beri Ulasan</h1>
        </div>

        {reviewSubmitted ? (
          <div className="flex flex-col items-center justify-center flex-1 px-8 text-center">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-5">
              <CheckCircle2 size={48} className="text-green-500" />
            </div>
            <h2 className="text-foreground font-black text-xl mb-2">Ulasan Terkirim!</h2>
            <p className="text-muted-foreground text-sm mb-6">Terima kasih sudah berbagi pengalaman belanjamu.</p>
            <button
              onClick={() => { setShowReview(false); setTrackingOrder(null); navigate("/marketplace"); }}
              className="w-full bg-primary text-white font-black py-4 rounded-2xl text-base"
            >
              Kembali ke Beranda
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-4 pt-6 pb-10 space-y-6">
            {/* Product */}
            <div className="flex items-center gap-3 bg-secondary rounded-2xl p-3.5">
              <img src={trackingOrder.image} alt="" className="w-14 h-14 rounded-xl object-cover bg-muted shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-foreground font-bold text-sm line-clamp-2">{trackingOrder.product}</p>
                <p className="text-muted-foreground text-xs">{trackingOrder.seller}</p>
              </div>
            </div>

            {/* Rating stars */}
            <div className="text-center">
              <p className="text-foreground font-bold text-base mb-4">Bagaimana pengalamanmu?</p>
              <div className="flex justify-center gap-3">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button key={s} onClick={() => setRating(s)}>
                    <Star
                      size={40}
                      className={s <= rating ? "text-accent fill-accent" : "text-muted-foreground/30"}
                      style={{ transition: "all 0.15s" }}
                    />
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <p className="text-muted-foreground text-sm mt-3">
                  {["", "Sangat Buruk 😞", "Kurang Memuaskan 😕", "Cukup 😐", "Memuaskan 😊", "Sangat Memuaskan ⭐"][rating]}
                </p>
              )}
            </div>

            {/* Review text */}
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide block mb-2">
                Tulis Ulasanmu (opsional)
              </label>
              <div className="bg-card border-2 border-border rounded-2xl px-4 py-3 focus-within:border-primary/50 transition-colors">
                <textarea
                  rows={4}
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  maxLength={300}
                  placeholder="Ceritakan kondisi barang, pengalaman COD, keramahan penjual..."
                  className="w-full text-sm text-foreground bg-transparent outline-none resize-none placeholder:text-muted-foreground leading-relaxed"
                />
                <p className="text-[10px] text-muted-foreground text-right mt-1">{reviewText.length}/300</p>
              </div>
            </div>

            <button
              onClick={async () => { 
                if (rating > 0) {
                  try {
                    const profile = await authService.getProfile();
                    if (profile) {
                      await orderService.submitReview({
                        order_id: trackingOrder.id,
                        product_id: trackingOrder.productId || trackingOrder.product,
                        reviewer_id: profile.id,
                        seller_id: trackingOrder.sellerId || trackingOrder.seller,
                        rating,
                        comment: reviewText
                      });
                    }
                    setReviewSubmitted(true);
                  } catch (err) {
                    console.error("Gagal mengirim ulasan", err);
                    toast.error("Gagal mengirim ulasan");
                  }
                } 
              }}
              disabled={rating === 0}
              className="w-full bg-primary text-white font-black py-4 rounded-2xl text-base shadow-lg transition-all"
              style={{ opacity: rating === 0 ? 0.5 : 1 }}
            >
              Kirim Ulasan
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[60] bg-background flex flex-col" style={{ maxWidth: 430, margin: "0 auto" }}>

      {/* Header */}
      <div className="bg-primary shrink-0 shadow-md">
        <div className="px-4 pt-10 pb-4 flex items-center gap-3">
          <button
            onClick={() => setTrackingOrder(null)}
            className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center"
          >
            <ArrowLeft size={18} className="text-white" />
          </button>
          <div className="flex-1">
            <h1 className="text-white font-black text-lg">Lacak Pesanan</h1>
            <p className="text-white/60 text-[11px]">{estimateMap[currentStatus]}</p>
          </div>
          <button className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
            <Share2 size={16} className="text-white" />
          </button>
        </div>

        {/* Status pill */}
        <div className="mx-4 mb-4">
          <div
            className="flex items-center gap-3 rounded-2xl px-4 py-3"
            style={{ background: currentStep.color + "25" }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: currentStep.color }}
            >
              <currentStep.icon size={18} className="text-white" />
            </div>
            <div className="flex-1">
              <p className="text-white font-black text-sm">{currentStep.label}</p>
              <p className="text-white/70 text-[11px]">{currentStep.sub}</p>
            </div>
            {currentStatus !== "selesai" && currentStatus !== "dibatalkan" && (
              <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin shrink-0" />
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-28">

        {/* Order info card */}
        <div className="px-4 pt-4">
          <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 bg-muted/40 border-b border-border">
              <span className="text-[11px] font-bold text-muted-foreground">{trackingOrder.id}</span>
              <button
                onClick={handleCopyId}
                className="flex items-center gap-1 text-[11px] text-primary font-bold"
              >
                <Copy size={11} />
                {copied ? "Disalin!" : "Salin"}
              </button>
            </div>
            <div className="flex items-center gap-3 p-4">
              <img src={trackingOrder.image} alt="" className="w-16 h-16 rounded-xl object-cover bg-muted shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-foreground font-bold text-sm line-clamp-2">{trackingOrder.product}</p>
                <p className="text-muted-foreground text-xs mt-0.5">{trackingOrder.seller}</p>
                <p className="text-primary font-black text-sm mt-1">
                  {formatPrice(trackingOrder.price)} × {trackingOrder.qty}
                </p>
              </div>
            </div>
            <div className="divide-y divide-border border-t border-border">
              {[
                ["Total Bayar", formatPrice(trackingOrder.price * trackingOrder.qty)],
                ["Metode Bayar", trackingOrder.payment],
                ["Lokasi COD", trackingOrder.location],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between px-4 py-2.5 text-sm">
                  <span className="text-muted-foreground">{k}</span>
                  <span className="font-semibold text-foreground">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="px-4 pt-5">
          <h3 className="text-foreground font-bold text-sm mb-4">Status Pesanan</h3>
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-border" />

            <div className="space-y-6">
              {STEPS.map((step, i) => {
                const done = i <= currentIdx;
                const active = i === currentIdx;
                return (
                  <div key={step.key} className="flex items-start gap-4 relative">
                    {/* Circle */}
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 z-10"
                      style={{
                        background: done ? step.color : "#fff",
                        borderColor: done ? step.color : "#e5e7eb",
                      }}
                    >
                      {done
                        ? <step.icon size={16} className="text-white" />
                        : <div className="w-3 h-3 rounded-full bg-border" />}
                    </div>

                    <div className="flex-1 pb-1 pt-2">
                      <div className="flex items-center justify-between">
                        <p
                          className="text-sm font-bold"
                          style={{ color: done ? "#1a1a2e" : "#8a8a9a" }}
                        >
                          {step.label}
                        </p>
                         {active && currentStatus !== "selesai" && currentStatus !== "dibatalkan" && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                            style={{ background: step.color + "20", color: step.color }}>
                            Sekarang
                          </span>
                        )}
                        {done && !active && (
                          <span className="text-[10px] text-muted-foreground font-medium">Selesai</span>
                        )}
                      </div>
                      <p
                        className="text-xs mt-0.5"
                        style={{ color: done ? "#8a8a9a" : "#c8c8d0" }}
                      >
                        {step.sub}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* COD Location */}
        <div className="px-4 pt-5">
          <div className="bg-card rounded-2xl border border-border p-4">
            <div className="flex items-center gap-2 mb-3">
              <MapPin size={15} className="text-primary" />
              <p className="text-foreground font-bold text-sm">Titik Temu COD</p>
            </div>
            <div className="bg-secondary rounded-xl px-3 py-2.5 flex items-center justify-between">
              <p className="text-foreground font-semibold text-sm">{trackingOrder.location}</p>
              <span className="text-primary text-xs font-bold">Konfirmasi →</span>
            </div>
            <p className="text-muted-foreground text-[11px] mt-2 flex items-center gap-1">
              <Clock size={10} /> Pastikan kamu sudah berada di lokasi sebelum penjual tiba
            </p>
          </div>
        </div>

        {/* Seller contact */}
        <div className="px-4 pt-4">
          <div className="bg-card rounded-2xl border border-border p-4 flex items-center gap-3">
            <div className="w-11 h-11 bg-secondary rounded-xl flex items-center justify-center shrink-0">
              <p className="text-primary font-black text-lg">{trackingOrder.seller[0]}</p>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-foreground font-bold text-sm">{trackingOrder.seller}</p>
              <p className="text-muted-foreground text-xs">Penjual · Online</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => startChat(trackingOrder.seller, trackingOrder.product, trackingOrder.image, trackingOrder.price)}
                className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center"
              >
                <MessageSquare size={16} className="text-primary" />
              </button>
              <button className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <Phone size={16} className="text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Refresh hint */}
        <div className="px-4 pt-4">
          <div className="flex items-center gap-2 justify-center text-muted-foreground text-xs">
            <RefreshCw size={11} className="animate-spin" style={{ animationDuration: "3s" }} />
            Menunggu konfirmasi proses dari penjual...
          </div>
        </div>
      </div>

      {/* Bottom actions */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full bg-card border-t border-border px-4 py-3 shadow-2xl z-10" style={{ maxWidth: 430 }}>
        {currentStatus === "selesai" ? (
          <div className="space-y-2">
            <button
              onClick={() => setShowReview(true)}
              className="w-full bg-accent text-foreground font-black py-3.5 rounded-2xl text-sm flex items-center justify-center gap-2 shadow-md"
            >
              <Star size={16} className="fill-foreground" /> Beri Ulasan Penjual
            </button>
            <button
              onClick={() => { setTrackingOrder(null); navigate("/marketplace"); }}
              className="w-full bg-secondary border border-border text-foreground font-bold py-3 rounded-2xl text-sm"
            >
              Kembali ke Beranda
            </button>
          </div>
        ) : currentStatus === "dibatalkan" ? (
          <button
            onClick={() => { setTrackingOrder(null); navigate("/marketplace"); }}
            className="w-full bg-secondary border border-border text-foreground font-bold py-3.5 rounded-2xl text-sm"
          >
            Kembali ke Beranda
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => startChat(trackingOrder.seller, trackingOrder.product, trackingOrder.image, trackingOrder.price)}
              className="flex-1 bg-secondary border border-primary/20 text-primary font-bold py-3.5 rounded-2xl text-sm flex items-center justify-center gap-2"
            >
              <MessageSquare size={15} /> Chat Penjual
            </button>
            <button
              onClick={handleConfirmReceipt}
              className="flex-1 bg-primary text-white font-black py-3.5 rounded-2xl text-sm flex items-center justify-center gap-2"
            >
              <CheckCircle2 size={15} /> Konfirmasi Terima
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
