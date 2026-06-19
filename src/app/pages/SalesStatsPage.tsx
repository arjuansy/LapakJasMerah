import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useApp } from "../context";
import { Product, formatPrice, storeProducts } from "../data";
import {
  ArrowLeft, Star, MapPin, Search, Grid3X3, Clock, Share2, Flag, ShoppingCart, MessageSquare, CheckCheck, Send, CheckCircle2, Package, TrendingUp, Filter, Heart, Tag, ExternalLink, ChevronRight, Zap, Bell, Image as ImageIcon, Smile, Settings, Edit3, Shield, Info, MoreVertical, Search as SearchIcon, X
} from "lucide-react";

export default function SalesStatsPage() {
  const navigate = useNavigate();

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
            onClick={() => { setShowSalesStats(false); navigate("/profile"); setProfileSubPage("penjualan"); }}
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