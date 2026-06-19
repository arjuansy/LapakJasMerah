import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useApp } from "../context";
import { Product, formatPrice, sellerAvatars } from "../data";
import {
  ArrowLeft, Star, MapPin, Search, Grid3X3, Clock, Share2, Flag, ShoppingCart, MessageSquare, CheckCheck, Send, CheckCircle2, Package, TrendingUp, Filter, Heart, Tag, ExternalLink, ChevronRight, Zap, Bell, Image as ImageIcon, Smile, Settings, Edit3, Shield, Info, MoreVertical, Search as SearchIcon, X, BadgeCheck
} from "lucide-react";
import { useParams } from "react-router-dom";

export default function StorePage() {
  const { sellerName } = useParams<{ sellerName: string }>();
  const navigate = useNavigate();
  const { products, triggerToast, setShowReportModal } = useApp();
  
  if (!sellerName) return null;

    const avatar = sellerAvatars[sellerName] ?? "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop&auto=format";
    const storeProducts = products.filter((p) => p.seller === sellerName);
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
            <button onClick={() => navigate(`/store/${null}`)} className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
              <ArrowLeft size={18} className="text-white" />
            </button>
            <h1 className="flex-1 text-white font-black text-lg">Toko Penjual</h1>
            <button
              onClick={() => {
                const shareText = `Lapak Jas Merah - Kunjungi toko "${sellerName}" di Lapak Jas Merah UMM!`;
                const shareUrl = `${window.location.origin}/seller/${sellerName}`;
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
                onClick={() => { navigate(`/store/${null}`); navigate("/chat"); }}
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
              <div key={p.id} onClick={() => { navigate(`/store/${null}`); navigate(`/product/${p.id}`); }}
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