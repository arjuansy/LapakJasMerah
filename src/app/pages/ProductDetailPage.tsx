import { toast } from "react-hot-toast";
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useApp } from "../context";
import { Product, formatPrice } from "../data";
import {
  ArrowLeft, Star, MapPin, Search, Grid3X3, Clock, Share2, Flag, ShoppingCart, MessageSquare, CheckCheck, Send, CheckCircle2, Package, TrendingUp, Filter, Heart, Tag, ExternalLink, ChevronRight, Zap, Bell, Image as ImageIcon, Smile, Settings, Edit3, Shield, Info, MoreVertical, Search as SearchIcon, X, BadgeCheck, RefreshCw
} from "lucide-react";
import { supabase } from "../../config/supabaseClient";
import { useAuth } from "../../hooks/useAuth";
import { parseImageUrls } from "../../utils/imageParser";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { purchaseData, setPurchaseData, salesData, setSalesData, profileAvatar, products, wishlist, toggleWishlist, setRequests, setShowPostRequestModal, setShowSuggestionBox, setTrackingOrder } = useApp();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [showOrder, setShowOrder] = useState(false);
  const [ordered, setOrdered] = useState(false);
  const [showPaymentPicker, setShowPaymentPicker] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState("cod");
  const [showQrisCode, setShowQrisCode] = useState(false);
  const [showReportModal, setShowReportModal] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);

  useEffect(() => {
    setLoading(true);
    const fetchProduct = async () => {
      const { data: p, error } = await supabase
        .from('products')
        .select(`
          *,
          seller:profiles!products_seller_id_fkey(full_name, avatar_url),
          category:categories(name)
        `)
        .eq('id', id)
        .single();

      if (error || !p) {
        console.error(error);
        setLoading(false);
        return;
      }

      // Fetch total sold and average rating manually
      let totalSold = 0;
      let avgRating = 0;
      let rCount = 0;

      const [{ data: soldData }, { data: reviewData }] = await Promise.all([
        supabase.from('order_items').select('quantity, order:orders!inner(status)').eq('product_id', p.id),
        supabase.from('reviews').select(`
          id, rating, comment, created_at,
          reviewer:profiles!reviews_reviewer_id_fkey(full_name, avatar_url)
        `).eq('product_id', p.id)
      ]);

      if (soldData) {
        totalSold = soldData.filter((s: any) => s.order?.status === 'COMPLETED').reduce((acc: number, curr: any) => acc + curr.quantity, 0);
      }

      if (reviewData && reviewData.length > 0) {
        setReviews(reviewData);
        rCount = reviewData.length;
        const sum = reviewData.reduce((acc, curr) => acc + curr.rating, 0);
        avgRating = Math.round((sum / reviewData.length) * 10) / 10;
      } else {
        setReviews([]);
      }

      setProduct({
        id: p.id,
        name: p.name,
        price: Number(p.price),
        category: p.category?.name || "Lainnya",
        condition: p.condition || "Baru",
        location: p.location,
        seller: p.seller?.full_name || "Penjual",
        seller_id: p.seller_id,
        sellerAvatar: p.seller?.avatar_url || "/default-avatar.png",
        image: p.image_url ? parseImageUrls(p.image_url)[0] : "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80",
        images_raw: p.image_url,
        rating: avgRating,
        ratingCount: rCount,
        sold: totalSold,
        description: p.description || "",
        stock: p.stock ?? 0,
        status: p.status || "AVAILABLE"
      });
      setLoading(false);
    };
    
    fetchProduct();
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Memuat produk...</div>;
  if (!product) return <div className="min-h-screen flex items-center justify-center">Produk tidak ditemukan</div>;

  const sellerAvatar = product.sellerAvatar || "";
  const desc = product.description || "";
  const isOutOfStock = product.stock <= 0 || product.status === "OUT_OF_STOCK";

  const imgs = parseImageUrls(product.images_raw || product.image || "");

  const related = products.filter((p) => p.id !== product.id).slice(0, 4);

  const paymentLabels: Record<string, string> = {
    ummpay: "UMM Pay", qris: "QRIS", bca: "Transfer BCA", bri: "Transfer BRI",
    mandiri: "Transfer Mandiri", bni: "Transfer BNI", gopay: "GoPay", ovo: "OVO",
    dana: "DANA", cod: "COD (Bayar di Tempat)",
  };

  const handleChatClick = async () => {
    if (!product) return;
    if (!user) {
      toast.error("Anda harus login terlebih dahulu untuk chat.");
      navigate("/auth");
      return;
    }
    
    try {
      const { data: existingChat, error: checkError } = await supabase.from('chats')
        .select('id')
        .eq('buyer_id', user.id)
        .eq('seller_id', product.seller_id)
        .maybeSingle();

      if (checkError) throw checkError;

      if (existingChat) {
        await supabase.from('chats')
          .update({ product_id: product.id })
          .eq('id', existingChat.id);

        navigate(`/chat/${existingChat.id}`);
      } else {
        const { data: newChat, error } = await supabase.from('chats').insert({
          buyer_id: user.id,
          seller_id: product.seller_id,
          product_id: product.id
        }).select().single();
        
        if (error) {
          if (error.code === '23505') {
            const { data: retryChat } = await supabase.from('chats')
              .select('id')
              .eq('buyer_id', user.id)
              .eq('seller_id', product.seller_id)
              .maybeSingle();
            if (retryChat) {
              navigate(`/chat/${retryChat.id}`);
              return;
            }
          }
          throw error;
        }
        if (newChat) navigate(`/chat/${newChat.id}`);
      }
    } catch (err) {
      console.error(err);
      toast.error("Gagal membuka chat");
    }
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
    if (orderId && product) {
      setTrackingOrder({
        id: orderId.toString(),
        product: product.name,
        productId: product.id.toString(),
        image: product.image || "",
        seller: product.seller,
        sellerId: product.seller_id,
        price: product.price,
        qty: qty,
        payment: selectedPayment,
        location: product.location,
        status: "dikonfirmasi"
      });
      setOrdered(false);
      navigate(`/order/${orderId}`);
    } else {
      toast.error("Order ID tidak ditemukan");
    }
  }

  if (showQrisCode) {
      return (
        <div className="fixed inset-0 z-[60] bg-background flex flex-col text-foreground max-w-[430px] lg:max-w-2xl mx-auto">
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
        <div className="fixed inset-0 z-[60] bg-background flex flex-col items-center justify-center px-8 max-w-[430px] lg:max-w-2xl mx-auto">
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
            onClick={() => { setOrdered(false); navigate('/marketplace'); }}
            className="w-full bg-secondary text-primary font-bold py-3.5 rounded-2xl text-sm border border-primary/20"
          >
            Kembali ke Beranda
          </button>
        </div>
      );
    }

    return (
      
<div className="fixed inset-0 z-[60] bg-background overflow-y-auto max-w-[430px] lg:max-w-6xl mx-auto">
    <div className="lg:flex lg:gap-10 lg:px-8 lg:pt-6 lg:items-start">

      {/* ══ KOLOM KIRI: galeri foto ══ */}
      <div className="lg:flex-1 lg:min-w-0">
        {/* ── IMAGE SECTION ── */}
        <div className="relative bg-muted lg:rounded-2xl lg:overflow-hidden" style={{ height: 320 }}>
          <img
            src={imgs[activeImg]}
            alt={product.name}
            className="w-full h-full object-cover lg:h-[460px]"
          />

          {/* Top bar */}
          <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 pt-10 lg:pt-4 pb-4"
            style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.45), transparent)" }}>
            <button
              onClick={() => navigate(-1)}
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
            <div className="absolute top-14 lg:top-4 left-4 bg-primary text-white text-xs font-black px-2.5 py-1 rounded-lg">
              -{product.discount}%
            </div>
          )}

          {/* Image dots */}
          {imgs.length > 1 && (
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
          )}
        </div>

        {/* Thumbnail strip */}
        {imgs.length > 1 && (
          <div className="flex gap-2 px-4 lg:px-0 pt-3 pb-1">
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
        )}
      </div>

      {/* ══ KOLOM KANAN: info + penjual , kotak beli (sticky) ══ */}
      <div className="lg:w-[400px] lg:shrink-0">
        {/* ── PRODUCT INFO ── */}
        <div className="px-4 lg:px-0 pt-3 pb-2">
          <h1 className="text-foreground font-black text-xl leading-snug mb-2">{product.name}</h1>

          <div className="flex items-end gap-3 mb-3">
            <span className="text-primary font-black text-2xl">{formatPrice(product.price)}</span>
            {product.originalPrice && (
              <span className="text-muted-foreground text-sm line-through pb-0.5">{formatPrice(product.originalPrice)}</span>
            )}
            {product.isNew && !isOutOfStock && (
              <span className="bg-green-100 text-green-700 text-[10px] font-black px-2 py-0.5 rounded-full pb-0.5">BARU</span>
            )}
            {isOutOfStock && (
              <span className="bg-neutral-200 text-neutral-600 text-[10px] font-black px-2 py-0.5 rounded-full pb-0.5">
                STOK HABIS
              </span>
            )}
          </div>

          <div className="flex items-center gap-4 mb-4 flex-wrap">
            <div className="flex items-center gap-1">
              <Star size={13} className="text-accent fill-accent" />
              <span className="text-sm font-bold text-foreground">
                {product.rating} {product.ratingCount ? `(${product.ratingCount})` : ''}
              </span>
            </div>
            <div className="w-px h-4 bg-border" />
            <span className="text-sm text-muted-foreground">{product.sold} terjual</span>
            <div className="w-px h-4 bg-border" />
            <span className={`text-sm font-semibold ${isOutOfStock ? "text-red-500" : "text-muted-foreground"}`}>
              {isOutOfStock ? "Stok habis" : `Sisa ${product.stock} stok`}
            </span>
            <div className="w-px h-4 bg-border" />
            <div className="flex items-center gap-1">
              <MapPin size={12} className="text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{product.location}</span>
            </div>
          </div>

          {product.id % 2 === 0 && (
            <div className="inline-flex items-center gap-1.5 bg-accent/10 border border-accent/30 px-3 py-1.5 rounded-full mb-4">
              <Tag size={11} className="text-accent" />
              <span className="text-xs font-bold text-foreground">Harga Bisa Nego</span>
            </div>
          )}

          <button
            onClick={() => setShowReportModal({ type: "produk", name: product.name, id: product.id, seller_id: product.seller_id })}
            className="flex items-center gap-1.5 px-3 py-2 border border-red-200 text-red-500 rounded-lg text-xs font-semibold mt-2 hover:bg-red-50 transition-colors"
          >
            <Flag size={12} /> Laporkan Iklan Ini
          </button>
        </div>

        <div className="h-2 bg-muted lg:hidden" />

        {/* ── SELLER INFO ── */}
        <div className="px-4 lg:px-0 py-4 lg:border lg:border-border lg:rounded-2xl lg:mt-2 lg:p-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img src={sellerAvatar} alt={product.seller} className="w-12 h-12 rounded-full object-cover border-2 border-border" />
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-1">
                <p className="font-bold text-foreground text-sm">{product.seller}</p>
                <BadgeCheck size={14} className="text-blue-500 shrink-0" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground">Belum ada ulasan</span>
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <BadgeCheck size={11} className="text-blue-500" />
                <span className="text-[10px] text-muted-foreground">Mahasiswa Terverifikasi &#183; Online sekarang</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {user?.id !== product.seller_id && (
                <button
                  onClick={handleChatClick}
                  className="bg-primary text-white text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 shadow-sm hidden lg:flex"
                >
                  <MessageSquare size={14} />
                  Chat Penjual
                </button>
              )}
              <button
                onClick={() => navigate('/store/' + product.seller_id)}
                className="bg-secondary text-primary text-xs font-bold px-3 py-2 rounded-xl border border-primary/20"
              >
                Lihat Toko
              </button>
            </div>
          </div>
        </div>

        {/* ── KOTAK BELI: fixed footer di mobile, sticky card di desktop ── */}
        <div
          className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-card border-t border-border px-4 py-3 z-10 shadow-2xl
                     lg:static lg:left-0 lg:translate-x-0 lg:max-w-none lg:w-full lg:mt-4 lg:rounded-2xl lg:border lg:border-border
                     lg:shadow-sm lg:sticky lg:top-6 lg:bg-card lg:p-4"
        >
          {/* Qty selector */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-muted-foreground">Jumlah:</span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                disabled={isOutOfStock}
                className="w-8 h-8 rounded-full border-2 border-border flex items-center justify-center text-foreground font-bold text-lg disabled:opacity-40"
              >
                &minus;
              </button>
              <span className="text-foreground font-black text-base w-6 text-center">{qty}</span>
              <button
                onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                disabled={isOutOfStock || qty >= product.stock}
                className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-lg disabled:opacity-40 disabled:bg-muted"
              >
                +
              </button>
            </div>
            <span className="text-primary font-black text-sm">{formatPrice(product.price * qty)}</span>
          </div>

          <div className="flex gap-2">
            {user?.id !== product.seller_id && (
              <button
                onClick={handleChatClick}
                className="flex-1 bg-secondary border border-primary/20 text-primary font-bold py-3.5 rounded-2xl text-sm flex items-center justify-center gap-2 lg:hidden"
              >
                <MessageSquare size={15} />
                Chat
              </button>
            )}
            <button
              onClick={() => {
                if (isOutOfStock) return;
                if (!user) {
                  toast.error("Anda harus login terlebih dahulu untuk membeli barang.");
                  navigate("/auth");
                  return;
                }
                if (user.id === product.seller_id) {
                  toast.error("Anda tidak dapat membeli barang milik Anda sendiri.");
                  return;
                }
                setShowOrder(true);
              }}
              disabled={isOutOfStock}
              className="flex-[2] bg-primary text-white font-black py-3.5 rounded-2xl text-sm flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none"
            >
              <ShoppingCart size={15} />
              {isOutOfStock ? "Stok Habis" : "Beli Sekarang"}
            </button>
          </div>
        </div>
      </div>
    </div>

    {/* ══ FULL WIDTH DI BAWAH: deskripsi, keamanan, ulasan, produk lainnya ══ */}
    <div className="lg:px-8">
      <div className="h-2 bg-muted lg:hidden" />

      {/* ── DESKRIPSI ── */}
      <div className="px-4 lg:px-0 py-4 lg:pt-8 lg:max-w-3xl">
        <h3 className="text-foreground font-bold text-sm mb-2">Deskripsi Produk</h3>
        <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
      </div>

      <div className="h-2 bg-muted lg:hidden" />

      {/* ── KEAMANAN TRANSAKSI ── */}
      <div className="px-4 lg:px-0 py-4 lg:max-w-3xl">
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

      {/* ── ULASAN PRODUK ── */}
      <div className="px-4 lg:px-0 py-4 bg-background lg:max-w-3xl">
        <h3 className="text-foreground font-bold text-sm mb-3 flex items-center gap-2">
          Ulasan
          <span className="text-muted-foreground text-xs font-normal">({reviews.length})</span>
        </h3>

        {reviews.length === 0 ? (
          <p className="text-muted-foreground text-xs">Belum ada ulasan untuk produk ini.</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((rev) => (
              <div key={rev.id} className="border-b border-border pb-3 last:border-0 last:pb-0">
                <div className="flex items-center gap-2 mb-1">
                  <img
                    src={rev.reviewer?.avatar_url || "/default-avatar.png"}
                    alt="avatar"
                    className="w-6 h-6 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <p className="text-foreground font-bold text-xs">{rev.reviewer?.full_name || "Pengguna"}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      {[1,2,3,4,5].map((s) => (
                        <Star
                          key={s}
                          size={9}
                          className={s <= rev.rating ? "text-accent fill-accent" : "text-muted"}
                        />
                      ))}
                    </div>
                  </div>
                  <span className="text-muted-foreground text-[10px]">
                    {new Date(rev.created_at).toLocaleDateString('id-ID')}
                  </span>
                </div>
                <p className="text-muted-foreground text-xs leading-relaxed mt-1">
                  {rev.comment}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── PRODUK LAINNYA ── */}
      <div className="px-4 lg:px-0 py-4 pb-36 lg:pb-12">
        <h3 className="text-foreground font-bold text-sm mb-3">Produk Lainnya</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {related.map((p) => (
            <button
              key={p.id}
              onClick={() => navigate(`/product/${p.id}`)}
              className="bg-card rounded-2xl border border-border overflow-hidden text-left shadow-sm active:scale-95 transition-transform"
            >
              <div className="relative">
                <img src={p.image} alt={p.name} className="w-full h-28 object-cover bg-muted" />
                {p.stock === 0 && (
                  <div className="absolute inset-0 bg-background/60 flex items-center justify-center z-10 backdrop-blur-[1px]">
                    <span className="bg-primary text-white text-[10px] font-black px-2.5 py-1 rounded-md shadow-sm">
                      Stok Habis
                    </span>
                  </div>
                )}
              </div>
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
    </div>

        {/* ── ORDER CONFIRMATION SHEET ── */}
        {showOrder && (() => {
          const paymentMethods = [
            { id: "qris",    label: "QRIS",            sub: "Sementara Tidak Tersedia", icon: Zap,     color: "#9CA3AF", logo: null, disabled: true },
            { id: "cod",     label: "COD (Bayar di Tempat)", sub: "Bayar saat COD di lokasi", icon: MapPin, color: "#10B981", logo: null },
          ];
          const selected = paymentMethods.find((m) => m.id === selectedPayment)!;

          return (
            <>
              {/* Payment Picker Sheet */}
              {showPaymentPicker && (
                <div className="fixed inset-0 z-30 flex flex-col items-center justify-center px-4">
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
                                onClick={() => { 
                                  if (m.disabled) {
                                    toast.error(`Metode pembayaran ${m.label} sementara tidak tersedia.`);
                                    return;
                                  }
                                  setSelectedPayment(id); 
                                  setShowPaymentPicker(false); 
                                }}
                                className={`w-full flex items-center gap-3 px-5 py-3.5 border-b border-border last:border-0 transition-colors ${m.disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-muted/50 active:bg-muted"}`}
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
              <div className="fixed inset-0 z-20 flex flex-col items-center justify-center px-4">
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
                        
                        if (selectedPayment === "cod") {
                          setShowOrder(false);
                          setOrdered(true);
                          
                          const sendNotif = async () => {
                            if (!user) return;
                            try {
                              let chatId = null;
                              const { data: existingChat } = await supabase.from('chats').select('id').eq('buyer_id', user.id).eq('seller_id', product.seller_id).maybeSingle();
                              if (existingChat) {
                                chatId = existingChat.id;
                              } else {
                                const { data: newChat } = await supabase.from('chats').insert({ buyer_id: user.id, seller_id: product.seller_id, product_id: product.id }).select().single();
                                if (newChat) chatId = newChat.id;
                              }
                              if (chatId) {
                                await supabase.from('messages').insert({
                                  chat_id: chatId,
                                  sender_id: user.id,
                                  content: `Pesanan Baru: ${qty}x ${product.name}. Klik untuk melihat daftar penjualan/pembelian.`,
                                  message_type: 'order_notification',
                                  is_read: false
                                });
                              }
                            } catch (err) {
                              console.error(err);
                            }
                          };
                          sendNotif();

                          return;
                        }

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
                                
                                const sendNotif = async () => {
                                  if (!user) return;
                                  try {
                                    let chatId = null;
                                    const { data: existingChat } = await supabase.from('chats').select('id').eq('buyer_id', user.id).eq('seller_id', product.seller_id).maybeSingle();
                                    if (existingChat) {
                                      chatId = existingChat.id;
                                    } else {
                                      const { data: newChat } = await supabase.from('chats').insert({ buyer_id: user.id, seller_id: product.seller_id, product_id: product.id }).select().single();
                                      if (newChat) chatId = newChat.id;
                                    }
                                    if (chatId) {
                                      await supabase.from('messages').insert({
                                        chat_id: chatId,
                                        sender_id: user.id,
                                        content: `Pesanan Baru: ${qty}x ${product.name}. Klik untuk melihat daftar penjualan/pembelian.`,
                                        message_type: 'order_notification',
                                        is_read: false
                                      });
                                    }
                                  } catch (err) {
                                    console.error(err);
                                  }
                                };
                                sendNotif();
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
                      } catch (err: any) {
                        console.error("Order error:", err);
                        toast.error(`Gagal memproses pesanan: ${err.message || err.toString()}`);
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

    const { user } = useAuth();
    
    if (!showReportModal) return null;
    const { type, name, id, seller_id } = showReportModal;

    const reasons = type === "penjual"
      ? ["Barang tidak sesuai deskripsi", "Penjual tidak responsif", "Penipuan / barang palsu", "Harga tidak wajar", "Penjual bersikap kasar", "Informasi produk menyesatkan", "Lainnya"]
      : ["Barang terlarang / ilegal", "Produk palsu / penipuan", "Spam", "Harga tidak wajar", "Lainnya"];

    async function handleSubmit() {
      if (!selectedReason) return;
      if (!user) {
        toast.error("Anda harus login untuk melaporkan");
        return;
      }
      setLoading(true);
      
      try {
        const { error } = await supabase.from('reports').insert({
          reporter_id: user.id,
          reported_id: seller_id, // we assume reported_id is the seller's id
          target_type: type === "produk" ? "product" : "user",
          reason: selectedReason + (detail ? ` - ${detail}` : ""),
          status: "Terbuka"
        });
        
        if (error) {
          console.error("Gagal mengirim laporan:", error);
          // Silent fallback if table doesn't exist yet
        }
      } catch(err) {
        console.error("Error submitting report", err);
      }
      
      setLoading(false); 
      setSubmitted(true);
    }

    return (
      <div className="fixed inset-0 z-[90] flex flex-col justify-end items-center">
        <div className="absolute inset-0 bg-black/50" onClick={() => setShowReportModal(null)} />
        <div className="relative bg-card rounded-t-3xl shadow-2xl max-h-[90vh] flex flex-col w-full max-w-[430px] lg:max-w-md">
          {/* Handle */}
          <div className="pt-4 pb-2 px-5 shrink-0">
            <div className="w-10 h-1 bg-border rounded-full mx-auto mb-4" />
            {submitted ? null : (
              <div className="flex items-center justify-between">
                <h3 className="text-foreground font-black text-lg">Laporkan {type === "penjual" ? "Penjual" : "Iklan"}</h3>
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
