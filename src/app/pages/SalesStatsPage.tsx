import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useApp } from "../context";
import { Product, formatPrice } from "../data";
import {
  ArrowLeft, Star, MapPin, Search, Grid3X3, Clock, Share2, Flag, ShoppingCart, MessageSquare, CheckCheck, Send, CheckCircle2, Package, TrendingUp, Filter, Heart, Tag, ExternalLink, ChevronRight, Zap, Bell, Image as ImageIcon, Smile, Settings, Edit3, Shield, Info, MoreVertical, Search as SearchIcon, X, Banknote, ClipboardList
} from "lucide-react";

export default function SalesStatsPage() {
  const navigate = useNavigate();

  const { salesData } = useApp();
  
  const selesai = salesData.filter((s) => s.status === "selesai");
  const totalRevenue = selesai.reduce((s, t) => s + (t.price * t.qty), 0);
  
  const chartBars = [
    { label: "Feb", value: 0 },
    { label: "Mar", value: 0 },
    { label: "Apr", value: 0 },
    { label: "Mei", value: 0 },
    { label: "Jun", value: totalRevenue },
  ];
    const maxVal = Math.max(...chartBars.map((b) => b.value));

    return (
      <div className="fixed inset-0 z-[65] bg-background overflow-y-auto max-w-[430px] lg:max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-primary sticky top-0 z-10 shadow-md">
          <div className="px-4 lg:px-8 pt-10 lg:pt-6 pb-4 flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
              <ArrowLeft size={18} className="text-white" />
            </button>
            <div className="flex-1">
              <h1 className="text-white font-black text-lg">Statistik Penjualan</h1>
              <p className="text-white/60 text-[11px]">Juni 2026</p>
            </div>
          </div>
        </div>

        <div className="px-4 lg:px-8 pt-5 lg:pt-6 pb-10 space-y-5">

          {/* Revenue card */}
          <div className="bg-gradient-to-br from-primary to-[#8b0d22] rounded-2xl p-5 lg:p-6 shadow-lg">
            <p className="text-white/70 text-xs font-semibold mb-1">Total Pendapatan Bulan Ini</p>
            <p className="text-white font-black text-3xl lg:text-4xl leading-none mb-1">{formatPrice(totalRevenue)}</p>
            <p className="text-white/60 text-xs flex items-center gap-1">
              <TrendingUp size={11} /> Naik 24% dari bulan lalu
            </p>
          </div>

          <div className="lg:grid lg:grid-cols-[1fr_1.4fr] lg:gap-4 lg:space-y-0 space-y-5">
            {/* KPI grid — jadi kolom vertikal di desktop, sejajar dengan chart */}
            <div className="grid grid-cols-3 lg:grid-cols-1 gap-3 lg:gap-3">
              {[
                { label: "Terjual",     value: selesai.length, suffix: "item",   color: "#10B981", icon: Package },
                { label: "Dibatalkan",  value: salesData.filter((s) => s.status === "dibatalkan").length, suffix: "item", color: "#EF4444", icon: X },
                { label: "Avg. Harga",  value: "Rp " + Math.round(totalRevenue / (selesai.length || 1) / 1000) + "rb", suffix: "", color: "#3B82F6", icon: Banknote },
              ].map(({ label, value, suffix, color, icon: Icon }) => (
                <div key={label} className="bg-card rounded-2xl border border-border p-3.5 lg:p-4 text-center lg:text-left lg:flex lg:items-center lg:gap-3 shadow-sm">
                  <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-xl mx-auto lg:mx-0 mb-2 lg:mb-0 flex items-center justify-center shrink-0" style={{ background: color + "18" }}>
                    <Icon size={15} style={{ color }} />
                  </div>
                  <div>
                    <p className="text-foreground font-black text-sm leading-none">{value} <span className="text-[10px] font-normal text-muted-foreground">{suffix}</span></p>
                    <p className="text-muted-foreground text-[10px] mt-1 lg:mt-0.5">{label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Bar chart */}
            <div className="bg-card rounded-2xl border border-border p-4 lg:p-5 shadow-sm">
              <p className="text-foreground font-bold text-sm mb-4">Pendapatan 5 Bulan Terakhir</p>
              <div className="flex items-end gap-2 lg:gap-4 h-32 lg:h-44">
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
          </div>

          {/* Top produk */}
          <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-border bg-secondary/50">
              <p className="text-foreground font-bold text-sm flex items-center gap-2"><TrendingUp size={14} className="text-primary" />Produk Terlaris</p>
            </div>
            {selesai.length === 0 && (
              <div className="p-6 text-center text-muted-foreground text-xs font-semibold">Belum ada produk yang terjual.</div>
            )}
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
                <p className="text-primary font-black text-sm shrink-0">{formatPrice(t.price * t.qty)}</p>
              </div>
            ))}
          </div>

          {/* Lihat daftar penjualan */}
          <button
            onClick={() => { navigate("/profile", { state: { subPage: "penjualan" } }); }}
            className="w-full bg-secondary border border-primary/20 text-primary font-bold py-3.5 rounded-2xl text-sm flex items-center justify-center gap-2"
          >
            <ClipboardList size={15} /> Lihat Daftar Penjualan Lengkap
          </button>
        </div>
      </div>
    );
  }

