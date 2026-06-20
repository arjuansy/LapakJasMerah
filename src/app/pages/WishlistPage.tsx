import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useApp } from "../context";
import { Product, formatPrice } from "../data";
import {
  ArrowLeft, Star, MapPin, Search, Grid3X3, Clock, Share2, Flag, ShoppingCart, MessageSquare, CheckCheck, Send, CheckCircle2, Package, TrendingUp, Filter, Heart, Tag, ExternalLink, ChevronRight, Zap, Bell, Image as ImageIcon, Smile, Settings, Edit3, Shield, Info, MoreVertical, Search as SearchIcon, X
} from "lucide-react";

export default function WishlistPage() {
  const navigate = useNavigate();
  const { products, wishlist, setShowWishlist, toggleWishlist } = useApp();
    const wishlisted = products.filter((p) => wishlist.includes(p.id));

    return (
      <>
        {/* Backdrop */}
        <div className="fixed inset-0 z-[70]" onClick={() => navigate("/marketplace")} />

        {/* Panel */}
        <div
          className="fixed top-0 right-0 bottom-0 z-[80] bg-card shadow-2xl flex flex-col"
          style={{ width: "min(360px, 100vw)", maxWidth: 430, borderLeft: "1px solid rgba(0,0,0,0.08)" }}
        >
          {/* Header */}
          <div className="bg-primary px-4 pt-10 pb-4">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-white font-black text-xl">Wishlist</h2>
              <button onClick={() => navigate("/marketplace")} className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
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
                  onClick={() => navigate("/marketplace")}
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
                      onClick={() => { navigate(`/product/${p.id}`); }}
                      className="shrink-0"
                    >
                      <img src={p.image} alt={p.name} className="w-16 h-16 rounded-xl object-cover bg-muted" />
                    </button>
                    <button
                      onClick={() => { navigate(`/product/${p.id}`); }}
                      className="flex-1 min-w-0 text-left"
                    >
                      <p className="text-foreground font-bold text-sm line-clamp-2 leading-tight">{p.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-primary font-black text-sm">{formatPrice(p.price)}</p>
                        {p.stock === 0 && <span className="bg-red-100 text-primary text-[9px] font-black px-1.5 py-0.5 rounded-md">Habis</span>}
                      </div>
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
                        onClick={() => { navigate(`/product/${p.id}`); }}
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