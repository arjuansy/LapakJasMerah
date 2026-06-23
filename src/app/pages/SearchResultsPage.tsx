import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, Star, Heart, MapPin, X, SlidersHorizontal, ChevronDown, Clock, Trash2, TrendingUp } from "lucide-react";
import { useApp } from "../context";
import { formatPrice } from "../data";
import type { Product } from "../data";

export default function SearchResultsPage() {
  const navigate = useNavigate();

  const { globalSearch, setGlobalSearch, setShowSearchResults, setSelectedProduct, wishlist, toggleWishlist, products } = useApp();

  const [sortBy, setSortBy] = useState("relevan");
  const [filterCondition, setFilterCondition] = useState("");
  const [filterLocation, setFilterLocation] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [showFilter, setShowFilter] = useState(false);

  const [debouncedQuery, setDebouncedQuery] = useState(globalSearch);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    const history = localStorage.getItem("search_history");
    let parsedHistory: string[] = [];
    if (history) {
      try {
        parsedHistory = JSON.parse(history);
        setSearchHistory(parsedHistory);
      } catch (e) {
        setSearchHistory([]);
      }
    }

    if (globalSearch.trim()) {
      const trimmed = globalSearch.trim();
      const nextHistory = [
        trimmed,
        ...parsedHistory.filter((item) => item.toLowerCase() !== trimmed.toLowerCase()),
      ].slice(0, 5);
      setSearchHistory(nextHistory);
      localStorage.setItem("search_history", JSON.stringify(nextHistory));
    }
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(globalSearch);
    }, 300);
    return () => clearTimeout(handler);
  }, [globalSearch]);

  function saveToHistory(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;
    const nextHistory = [
      trimmed,
      ...searchHistory.filter((item) => item.toLowerCase() !== trimmed.toLowerCase()),
    ].slice(0, 5);
    setSearchHistory(nextHistory);
    localStorage.setItem("search_history", JSON.stringify(nextHistory));
  }

  function removeFromHistory(text: string) {
    const nextHistory = searchHistory.filter((item) => item !== text);
    setSearchHistory(nextHistory);
    localStorage.setItem("search_history", JSON.stringify(nextHistory));
  }

  const query = debouncedQuery.trim().toLowerCase();

  const results = products.filter((p) => {
    const matchQuery = !query ||
      p.name.toLowerCase().includes(query) ||
      p.seller.toLowerCase().includes(query) ||
      p.location.toLowerCase().includes(query);
    const matchMin = !minPrice || p.price >= Number(minPrice.replace(/\./g, ""));
    const matchMax = !maxPrice || p.price <= Number(maxPrice.replace(/\./g, ""));
    return matchQuery && matchMin && matchMax;
  }).sort((a, b) => {
    if (sortBy === "termurah") return a.price - b.price;
    if (sortBy === "termahal") return b.price - a.price;
    if (sortBy === "terlaris") return b.sold - a.sold;
    if (sortBy === "rating") return b.rating - a.rating;
    const aExact = a.name.toLowerCase().includes(query) ? 1 : 0;
    const bExact = b.name.toLowerCase().includes(query) ? 1 : 0;
    return bExact - aExact;
  });

  function formatRupiah(val: string) {
    return val.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }

  const activeFilters = [filterCondition, filterLocation, minPrice || maxPrice ? "Harga" : ""].filter(Boolean);

  const popularSearches = ["Jaket Almamater", "Buku Kalkulus", "Kost Putri", "Casio", "Sepeda"];

  const suggestions = globalSearch.trim()
    ? products
        .filter((p) => p.name.toLowerCase().includes(globalSearch.toLowerCase().trim()))
        .slice(0, 5)
    : [];

  return (
    <div className="fixed inset-0 z-[55] bg-background flex flex-col max-w-[430px] lg:max-w-3xl mx-auto">

      {/* Search header */}
      <div className="bg-primary px-4 pt-10 pb-3 shadow-md shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => { setShowSearchResults(false); setGlobalSearch(""); }}
            className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center shrink-0"
          >
            <ArrowLeft size={18} className="text-white" />
          </button>
          <div className="flex-1 flex items-center gap-2 bg-white rounded-xl px-3 py-2.5 shadow-sm">
            <Search size={15} className="text-muted-foreground shrink-0" />
            <input
              type="text"
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  saveToHistory(globalSearch);
                  (e.target as HTMLInputElement).blur();
                }
              }}
              placeholder="Cari produk, penjual..."
              autoFocus
              className="flex-1 text-sm text-foreground bg-transparent outline-none placeholder:text-muted-foreground"
            />
            {globalSearch && (
              <button onClick={() => setGlobalSearch("")}>
                <X size={14} className="text-muted-foreground" />
              </button>
            )}
          </div>
        </div>

        {/* Sort row */}
        <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          <button
            onClick={() => setShowFilter((v) => !v)}
            className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-colors"
            style={showFilter || activeFilters.length > 0
              ? { background: "#fff", color: "#c41230", border: "1.5px solid #c41230" }
              : { background: "rgba(255,255,255,0.15)", color: "#fff", border: "1.5px solid rgba(255,255,255,0.2)" }}
          >
            <SlidersHorizontal size={11} />
            Filter {activeFilters.length > 0 && `(${activeFilters.length})`}
          </button>
          {[
            { key: "relevan", label: "Relevan" },
            { key: "terlaris", label: "Terlaris" },
            { key: "termurah", label: "Termurah" },
            { key: "termahal", label: "Termahal" },
            { key: "rating", label: "Rating" },
          ].map((s) => (
            <button
              key={s.key}
              onClick={() => setSortBy(s.key)}
              className="shrink-0 px-3 py-1.5 rounded-full text-xs font-bold border transition-colors"
              style={sortBy === s.key
                ? { background: "#fff", color: "#c41230", border: "1.5px solid #c41230" }
                : { background: "rgba(255,255,255,0.15)", color: "#fff", border: "1.5px solid rgba(255,255,255,0.2)" }}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Suggestions and History Overlay */}
      {isFocused && (
        <div className="absolute inset-x-0 bottom-0 top-[148px] bg-background z-40 overflow-y-auto px-4 py-4 space-y-5 animate-page">
          {/* If query is empty, show History and Popular Searches */}
          {!globalSearch.trim() ? (
            <>
              {/* Riwayat Pencarian */}
              {searchHistory.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Pencarian Terakhir</h4>
                    <button
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setSearchHistory([]);
                        localStorage.removeItem("search_history");
                      }}
                      className="text-[11px] text-primary font-bold"
                    >
                      Hapus Semua
                    </button>
                  </div>
                  <div className="space-y-1">
                    {searchHistory.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between py-2 border-b border-border/40">
                        <button
                          onMouseDown={() => {
                            setGlobalSearch(item);
                            saveToHistory(item);
                            setIsFocused(false);
                          }}
                          className="flex items-center gap-2.5 text-sm text-foreground font-semibold flex-1 text-left"
                        >
                          <Clock size={14} className="text-muted-foreground" />
                          {item}
                        </button>
                        <button
                          onMouseDown={(e) => {
                            e.preventDefault();
                            removeFromHistory(item);
                          }}
                          className="p-1 hover:bg-secondary rounded-lg text-muted-foreground hover:text-primary transition-colors"
                        >
                          <X size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pencarian Populer */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Pencarian Populer 🔥</h4>
                <div className="flex flex-wrap gap-2">
                  {popularSearches.map((item) => (
                    <button
                      key={item}
                      onMouseDown={() => {
                        setGlobalSearch(item);
                        saveToHistory(item);
                        setIsFocused(false);
                      }}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-card border border-border text-xs font-bold text-foreground hover:border-primary/30 transition-all hover:bg-secondary"
                    >
                      <TrendingUp size={11} className="text-primary" />
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            /* If typing, show suggestions */
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Saran Pencarian</h4>
              {suggestions.length === 0 ? (
                <p className="text-xs text-muted-foreground italic py-2">Tidak ada saran yang cocok</p>
              ) : (
                <div className="space-y-1">
                  {suggestions.map((p) => (
                    <button
                      key={p.id}
                      onMouseDown={() => {
                        setGlobalSearch(p.name);
                        saveToHistory(p.name);
                        setIsFocused(false);
                        navigate(`/product/${p.id}`);
                        setShowSearchResults(false);
                      }}
                      className="w-full flex items-center justify-between py-2.5 border-b border-border/40 text-left hover:bg-secondary transition-colors rounded-xl px-2"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Search size={14} className="text-primary shrink-0" />
                        <span className="text-sm font-semibold text-foreground truncate">{p.name}</span>
                      </div>
                      <span className="text-xs text-primary font-bold shrink-0">{formatPrice(p.price)}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Filter panel */}
      {showFilter && (
        <div className="bg-card border-b border-border px-4 py-4 shrink-0 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide block mb-1.5">Harga Min</label>
              <div className="flex items-center gap-1 border border-border rounded-xl px-3 py-2 bg-background">
                <span className="text-xs text-muted-foreground">Rp</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={minPrice}
                  onChange={(e) => setMinPrice(formatRupiah(e.target.value))}
                  placeholder="0"
                  className="flex-1 text-sm text-foreground bg-transparent outline-none"
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide block mb-1.5">Harga Max</label>
              <div className="flex items-center gap-1 border border-border rounded-xl px-3 py-2 bg-background">
                <span className="text-xs text-muted-foreground">Rp</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(formatRupiah(e.target.value))}
                  placeholder="∞"
                  className="flex-1 text-sm text-foreground bg-transparent outline-none"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <button
              onClick={() => { setFilterCondition(""); setFilterLocation(""); setMinPrice(""); setMaxPrice(""); }}
              className="text-xs text-muted-foreground font-semibold"
            >
              Reset Filter
            </button>
            <button
              onClick={() => setShowFilter(false)}
              className="bg-primary text-white text-xs font-bold px-4 py-2 rounded-xl"
            >
              Terapkan
            </button>
          </div>
        </div>
      )}

      {/* Result count */}
      <div className="px-4 py-2.5 bg-card border-b border-border shrink-0">
        <p className="text-muted-foreground text-xs">
          {query
            ? <><span className="font-bold text-foreground">{results.length}</span> hasil untuk "<span className="font-bold text-primary">{globalSearch}</span>"</>
            : <><span className="font-bold text-foreground">{results.length}</span> produk tersedia</>}
        </p>
      </div>

      {/* Results grid */}
      <div className="flex-1 overflow-y-auto">
        {results.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full pb-20 text-center px-8">
            <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mb-4">
              <Search size={32} className="text-muted-foreground/40" />
            </div>
            <p className="text-foreground font-bold text-base mb-1">Produk tidak ditemukan</p>
            <p className="text-muted-foreground text-sm mb-4">
              Coba kata kunci lain atau hapus filter yang aktif
            </p>
            <button
              onClick={() => { setGlobalSearch(""); setMinPrice(""); setMaxPrice(""); setFilterCondition(""); setFilterLocation(""); }}
              className="bg-primary text-white font-bold px-6 py-3 rounded-2xl text-sm"
            >
              Reset Pencarian
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 p-4 pb-8">
            {results.map((p: Product) => (
              <div
                key={p.id}
                onClick={() => { setShowSearchResults(false); navigate(`/product/${p.id}`); }}
                className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm cursor-pointer active:scale-95 transition-transform"
              >
                <div className="relative">
                  <img src={p.image} alt={p.name} className="w-full h-36 object-cover bg-muted" />
                  {p.discount && (
                    <span className="absolute top-2 left-2 bg-primary text-white text-[9px] font-black px-1.5 py-0.5 rounded-md">
                      -{p.discount}%
                    </span>
                  )}
                  {p.isNew && !p.discount && (
                    <span className="absolute top-2 left-2 bg-green-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md z-10">
                      Baru
                    </span>
                  )}
                  {p.stock === 0 && (
                    <div className="absolute inset-0 bg-background/60 flex items-center justify-center z-10 backdrop-blur-[1px]">
                      <span className="bg-primary text-white text-[10px] font-black px-2.5 py-1 rounded-md shadow-sm">
                        Stok Habis
                      </span>
                    </div>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleWishlist(p.id); }}
                    className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm"
                  >
                    <Heart size={12} className={wishlist.includes(p.id) ? "text-primary fill-primary" : "text-muted-foreground"} />
                  </button>
                </div>
                <div className="p-2.5">
                  <p className="text-xs font-semibold text-foreground line-clamp-2 leading-snug mb-1">{p.name}</p>
                  <p className="text-sm font-black text-primary">{formatPrice(p.price)}</p>
                  {p.originalPrice && (
                    <p className="text-[10px] text-muted-foreground line-through">{formatPrice(p.originalPrice)}</p>
                  )}
                  <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center gap-1">
                      <Star size={9} className="text-accent fill-accent" />
                      <span className="text-[10px] text-muted-foreground">{p.rating}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">{p.sold} terjual</span>
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <MapPin size={9} className="text-muted-foreground shrink-0" />
                    <span className="text-[10px] text-muted-foreground truncate">{p.location}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
