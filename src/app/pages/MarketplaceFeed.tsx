import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useApp } from "../context";
import { useAuth } from "../../hooks/useAuth";
import { categories, banners, recentProducts, extraProducts, requestBoard, formatPrice } from "../data";
import logo from "../../assets/logo.png";
import {
  Search, Bell, Heart, MapPin, Star, Zap, ShoppingCart, MessageSquare, ChevronRight, CheckCircle2, AlertCircle, ShoppingBag, Package, Shield, TrendingUp, ChevronLeft,
  PlusCircle, MessageCircle, User, Tag
} from "lucide-react";

export default function MarketplaceFeed() {
  const navigate = useNavigate();
  const { 
    searchFocused, setSearchFocused, globalSearch, setGlobalSearch, setShowSearchResults,
    activeBanner, setActiveBanner, wishlist, toggleWishlist, notifData, readNotifs, setShowNotif, setShowWishlist, setActiveCategoryFilter, setShowPostRequestModal,
    products, requests
  } = useApp();

  const { profile } = useAuth();

  return (
    <>
      <Helmet>
        <title>Beranda | Lapak Jas Merah</title>
        <meta name="description" content="Temukan barang bekas, buku, kos, dan jasa dengan harga mahasiswa di Universitas Muhammadiyah Malang." />
      </Helmet>
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
                <p className="text-white font-bold text-sm leading-none">{profile?.full_name || "Mahasiswa UMM"}</p>
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
              onClick={() => { setActiveCategoryFilter("Semua"); navigate("/categories"); }}
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
                  onClick={() => { setActiveCategoryFilter(filterLabel); navigate("/categories"); }}
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
                        onClick={() => navigate("/chat")}
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
              <p className="text-white font-black text-base leading-tight">Jual Sekarang,<br />Gratis Ongkir!</p>
            </div>
            <button
              onClick={() => navigate("/sell")}
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
              onClick={() => { setActiveCategoryFilter("Semua"); navigate("/categories"); }}
              className="text-primary text-xs font-semibold flex items-center gap-0.5 cursor-pointer active:scale-95 transition-transform"
            >
              Lihat Semua <ChevronRight size={12} />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3 px-4">
            {products.filter((p) => p.id > 4 || p.isNew).slice(0, 6).map((p) => (
              <div
                key={p.id}
                onClick={() => navigate(`/product/${p.id}`)}
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
    </>
  );
}
