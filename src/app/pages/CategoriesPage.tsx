import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useApp } from "../context";
import { Product, formatPrice } from "../data";
import {
  ArrowLeft, Star, MapPin, Search, Grid3X3, Clock, Share2, Flag, ShoppingCart, MessageSquare, CheckCheck, Send, CheckCircle2, Package, TrendingUp, Filter, Heart, Tag, ExternalLink, ChevronRight, Zap, Bell, Image as ImageIcon, Smile, Settings, Edit3, Shield, Info, MoreVertical, Search as SearchIcon, X
} from "lucide-react";

export default function CategoriesPage() {
  const navigate = useNavigate();
  const { activeCategoryFilter, setActiveCategoryFilter, products, wishlist, toggleWishlist } = useApp();

  const [activeCategory, setActiveCategory] = useState(activeCategoryFilter || "Semua");
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

  const filtered = products
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
              onFocus={() => navigate('/search')}
              onChange={(e) => { 
                setSearchQuery(e.target.value); 
                /* Note: We don't set global search here unless we want to, but navigating away is enough */
              }}
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
              onClick={() => navigate(`/product/${p.id}`)}
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