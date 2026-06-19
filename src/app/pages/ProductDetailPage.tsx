import { toast } from "react-hot-toast";
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useApp } from "../context";
import { Product, formatPrice } from "../data";
import {
  ArrowLeft, Star, MapPin, Search, Grid3X3, Clock, Share2, Flag, ShoppingCart, MessageSquare, CheckCheck, Send, CheckCircle2, Package, TrendingUp, Filter, Heart, Tag, ExternalLink, ChevronRight, Zap, Bell, Image as ImageIcon, Smile, Settings, Edit3, Shield, Info, MoreVertical, Search as SearchIcon, X
} from "lucide-react";
import { supabase } from "../../config/supabaseClient";
import { useAuth } from "../../hooks/useAuth";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { purchaseData, setPurchaseData, salesData, setSalesData, profileAvatar, products, wishlist, toggleWishlist, setRequests, setShowPostRequestModal, setShowSuggestionBox } = useApp();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [showOrder, setShowOrder] = useState(false);
  const [ordered, setOrdered] = useState(false);
  const [showPaymentPicker, setShowPaymentPicker] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState("qris");
  const [showQrisCode, setShowQrisCode] = useState(false);
  const [showReportModal, setShowReportModal] = useState<any>(null);

  useEffect(() => {
    setLoading(true);
    const fetchProduct = async () => {
      const { data: p, error } = await supabase
        .from('products')
        .select(`
          *,
          seller:profiles!products_seller_id_fkey(name, avatar_url),
          category:categories(name)
        `)
        .eq('id', id)
        .single();

      if (error || !p) {
        console.error(error);
        setLoading(false);
        return;
      }

      setProduct({
        id: p.id,
        name: p.name,
        price: Number(p.price),
        category: p.category?.name || "Lainnya",
        condition: p.condition || "Baru",
        location: p.location,
        seller: p.seller?.name || "Penjual",
        seller_id: p.seller_id,
        sellerAvatar: p.seller?.avatar_url || "https://api.dicebear.com/7.x/avataaars/svg?seed=seller",
        image: p.image_url || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80",
        rating: 0,
        sold: 0,
        description: p.description || "",
        stock: p.stock || 1
      });
      setLoading(false);
    };
    
    fetchProduct();
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Memuat produk...</div>;
  if (!product) return <div className="min-h-screen flex items-center justify-center">Produk tidak ditemukan</div>;

  const sellerAvatar = product.sellerAvatar || "";
  const desc = product.description || "";

  const imgs = [
    product.image,
    "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=400&q=80"
  ];

  const related = products.filter((p) => p.id !== product.id).slice(0, 4);

  const paymentLabels: Record<string, string> = {
    ummpay: "UMM Pay", qris: "QRIS", bca: "Transfer BCA", bri: "Transfer BRI",
    mandiri: "Transfer Mandiri", bni: "Transfer BNI", gopay: "GoPay", ovo: "OVO",
    dana: "DANA", cod: "COD (Bayar di Tempat)",
  };

  function handleShareProduct(p: any) {
    const url = window.location.origin + `/product/${p.id}`;
    navigator.clipboard.writeText(url).then(() => {
      toast.success("Tautan produk berhasil disalin ke clipboard!\n" + url);
    }).catch(err => {
      console.error("Gagal menyalin tautan", err);
      toast.error("Gagal menyalin tautan.");
    });
  }

  function launchTracking() {
    const orderId = (window as any).currentOrderId;
    if (orderId) {
      setOrdered(false);
      navigate(`/order/${orderId}`);
    } else {
      toast.error("Order ID tidak ditemukan");
    }
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
                onClick={async () => {
                  try {
                    const orderId = (window as any).currentOrderId;
                    if (orderId) {
                      await supabase.from('payments').insert({
                        order_id: orderId,
                        method: selectedPayment,
                        status: 'PAID',
                        paid_at: new Date().toISOString()
                      });
                      await supabase.from('orders').update({ status: 'PAID' }).eq('id', orderId);
                    }
                    setShowQrisCode(false);
                    setOrdered(true);
                  } catch (err) {
                    console.error("Gagal bayar", err);
                    toast.error("Simulasi pembayaran gagal.");
                  }
                }}
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
              onClick={async () => { 
                if (!user) {
                  toast.error("Anda harus login terlebih dahulu untuk chat.");
                  navigate("/auth");
                  return;
                }
                
                try {
                  const { data: existingChat } = await supabase.from('chats')
                    .select('id')
                    .eq('buyer_id', user.id)
                    .eq('seller_id', product.seller_id)
                    .eq('product_id', product.id)
                    .single();

                  if (existingChat) {
                    navigate(`/chat/${existingChat.id}`);
                  } else {
                    const { data: newChat, error } = await supabase.from('chats').insert({
                      buyer_id: user.id,
                      seller_id: product.seller_id,
                      product_id: product.id
                    }).select().single();
                    
                    if (error) throw error;
                    if (newChat) navigate(`/chat/${newChat.id}`);
                  }
                } catch (err) {
                  console.error(err);
                  toast.error("Gagal membuka chat");
                }
              }}
              className="flex-1 bg-secondary border border-primary/20 text-primary font-bold py-3.5 rounded-2xl text-sm flex items-center justify-center gap-2"
            >
              <MessageSquare size={15} />
              Chat
            </button>
            <button
              onClick={() => {
                const userInfo = localStorage.getItem("userInfo");
                if (!userInfo) {
                  toast.error("Anda harus login terlebih dahulu untuk membeli barang.");
                  navigate("/auth");
                  return;
                }
                setShowOrder(true);
              }}
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
                <div className="fixed inset-0 z-30 flex flex-col items-center justify-center px-4" style={{ maxWidth: 430, margin: "0 auto" }}>
                  <div className="absolute inset-0 bg-black/60" onClick={() => setShowPaymentPicker(false)} />
                  <div className="relative bg-card rounded-3xl shadow-2xl pb-6 max-h-[80vh] flex flex-col w-full max-w-[380px] z-10">
                    <div className="p-5 border-b border-border shrink-0 text-center">
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
              <div className="fixed inset-0 z-20 flex flex-col items-center justify-center px-4" style={{ maxWidth: 430, margin: "0 auto" }}>
                <div className="absolute inset-0 bg-black/50" onClick={() => setShowOrder(false)} />
                <div className="relative bg-card rounded-3xl shadow-2xl p-5 pb-6 w-full max-w-[380px] z-10">
                  <h3 className="text-foreground font-black text-lg mb-4 text-center">Konfirmasi Pembelian</h3>

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
                    onClick={async () => {
                      if (!user) {
                        toast.error("Anda harus login untuk membeli produk.");
                        navigate("/auth");
                        return;
                      }
                      
                      try {
                        const { data: orderData, error: orderError } = await supabase.from('orders').insert({
                          buyer_id: user.id,
                          total_amount: product.price * qty,
                          status: 'PENDING',
                          location: product.location
                        }).select().single();

                        if (orderError) throw orderError;
                        const createdOrderId = orderData.id;

                        await supabase.from('order_items').insert({
                          order_id: createdOrderId,
                          product_id: product.id,
                          quantity: qty,
                          price_at_purchase: product.price
                        });
                        
                        (window as any).currentOrderId = createdOrderId;
                        
                        try {
                          const paymentRes = await fetch('/api/pay', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              orderId: createdOrderId,
                              amount: product.price * qty,
                              productName: product.name,
                              customerName: user.email
                            })
                          });
                          const paymentData = await paymentRes.json();
                          if (paymentData.token) {
                            setShowOrder(false);
                            (window as any).snap.pay(paymentData.token, {
                              onSuccess: async function(result: any) {
                                await supabase.from('payments').insert({
                                  order_id: createdOrderId,
                                  method: selectedPayment,
                                  status: 'PAID',
                                  paid_at: new Date().toISOString()
                                });
                                await supabase.from('orders').update({ status: 'PAID' }).eq('id', createdOrderId);
                                setOrdered(true);
                              },
                              onPending: function(result: any) {
                                setShowQrisCode(true);
                              },
                              onError: function(result: any) {
                                toast.error("Pembayaran gagal.");
                              },
                              onClose: function() {
                                toast.error("Anda menutup popup pembayaran.");
                              }
                            });
                          } else {
                            setShowOrder(false);
                            setShowQrisCode(true);
                          }
                        } catch (e) {
                          setShowOrder(false);
                          setShowQrisCode(true);
                        }
                      } catch (err) {
                        console.error("Order error:", err);
                        toast.error("Gagal memproses pesanan.");
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
