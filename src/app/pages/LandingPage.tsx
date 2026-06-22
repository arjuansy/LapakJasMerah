import { Shield, Tag, MessageSquare, MapPin, Star, Zap, ShoppingBag } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context";
import { formatPrice } from "../data";
import logo from "../../assets/logo.png";
import { supabase } from "../../config/supabaseClient";

export default function LandingPage() {
  const navigate = useNavigate();

  const { setScreen, products } = useApp();

  const [dbStats, setDbStats] = React.useState({ products: 0, transactions: 0, users: 0, avgRating: 4.9 });
  React.useEffect(() => {
    async function fetchStats() {
      const { count: pCount } = await supabase.from('products').select('*', { count: 'exact', head: true });
      const { count: oCount } = await supabase.from('orders').select('*', { count: 'exact', head: true });
      const { count: uCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
      setDbStats(prev => ({
        ...prev,
        products: pCount || 0,
        transactions: oCount || 0,
        users: uCount || 0,
      }));
    }
    fetchStats();
  }, []);

  const features = [
    { icon: Shield, title: "100% Aman", desc: "Escrow & verifikasi NIM mahasiswa UMM", color: "#10B981" },
    { icon: Tag, title: "Harga Mahasiswa", desc: "Barang bekas & baru, harga terjangkau", color: "#F59E0B" },
    { icon: MessageSquare, title: "Chat Langsung", desc: "Negosiasi langsung dengan penjual", color: "#3B82F6" },
    { icon: MapPin, title: "COD di Kampus", desc: "Transaksi tatap muka area UMM", color: "#8B5CF6" },
  ];

  const testimonials = [
    { name: "Dinda R.", prodi: "Psikologi '23", text: "Beli buku bekas semester lalu di sini, hemat 60%! Kondisinya bagus banget.", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60&h=60&fit=crop&auto=format" },
    { name: "Fajar A.", prodi: "Teknik Sipil '22", text: "Jual laptop lama cuma 2 hari langsung laku. Prosesnya gampang banget.", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=60&h=60&fit=crop&auto=format" },
    { name: "Sari W.", prodi: "Manajemen '21", text: "Cari kost deket kampus 3 nemu di sini. Pemiliknya ramah, harga pas.", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop&auto=format" },
  ];

  const stats = [
    { value: "12.4K+", label: "Produk Aktif" },
    { value: "8.2K+", label: "Pengguna" },
    { value: "4.9K+", label: "Transaksi" },
    { value: "4.9★", label: "Rating App" },
  ];

  return (
    <div className="min-h-screen bg-background overflow-y-auto" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* ── HERO ── */}
      <div className="relative overflow-hidden" style={{ background: "linear-gradient(160deg, #c41230 0%, #8b0d22 55%, #1a1a2e 100%)", minHeight: 520 }}>
        {/* Decorative circles */}
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full opacity-10" style={{ background: "#f59e0b" }} />
        <div className="absolute top-32 -left-20 w-48 h-48 rounded-full opacity-10" style={{ background: "#fff" }} />
        <div className="absolute bottom-0 right-0 w-40 h-40 rounded-full opacity-5" style={{ background: "#f59e0b" }} />

        <div className="relative z-10 px-6 pt-14 pb-8">
          {/* Logo row */}
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg overflow-hidden">
                <img src={logo} alt="Logo" className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="text-white font-black text-lg leading-none">LapakJasMerah</p>
                <p className="text-white/60 text-[11px]">Universitas Muhammadiyah Malang</p>
              </div>
            </div>
          </div>

          {/* Headline */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 bg-white/15 border border-white/20 rounded-full px-3 py-1.5 mb-4">
              <Zap size={12} className="text-accent" />
              <span className="text-white text-[11px] font-bold">Platform #1 Mahasiswa UMM</span>
            </div>
            <h1 className="text-white font-black text-4xl leading-tight mb-3">
              Jual &amp; Beli<br />
              <span style={{ color: "#f59e0b" }}>Sesama</span><br />
              Mahasiswa UMM
            </h1>
            <p className="text-white/75 text-sm leading-relaxed">
              Marketplace khusus civitas akademika UMM. Aman, terpercaya, dan harga terjangkau - semua terverifikasi email UMM.
            </p>
          </div>

          {/* CTA buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => navigate("/register")}
              className="flex-1 bg-accent text-foreground font-black py-3.5 rounded-2xl text-sm shadow-lg active:scale-95 transition-transform"
            >
              Daftar Gratis
            </button>
            <button
              onClick={() => navigate("/login")}
              className="flex-1 bg-white/15 border border-white/30 text-white font-bold py-3.5 rounded-2xl text-sm active:scale-95 transition-transform"
            >
              Masuk
            </button>
          </div>

          {/* Social proof */}
          <div className="flex items-center gap-3 mt-6">
            <div className="flex -space-x-2">
              {["photo-1500648767791-00dcc994a43e", "photo-1494790108377-be9c29b29330", "photo-1519085360753-af0119f7cbe7", "photo-1438761681033-6461ffad8d80"].map((id) => (
                <img key={id} src={`https://images.unsplash.com/${id}?w=40&h=40&fit=crop&auto=format`} className="w-8 h-8 rounded-full border-2 border-primary object-cover" alt="" />
              ))}
            </div>
            <p className="text-white/80 text-xs"><span className="font-bold text-white">{dbStats.users}</span> mahasiswa sudah bergabung</p>
          </div>
        </div>

        {/* Product preview strip */}
        <div className="flex gap-3 px-6 pb-8 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          {products.slice(0, 5).map((p) => (
            <div key={p.id} className="shrink-0 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl overflow-hidden" style={{ width: 120 }}>
              <img src={p.image} alt={p.name} className="w-full h-20 object-cover" />
              <div className="p-2">
                <p className="text-white text-[10px] font-semibold line-clamp-1">{p.name}</p>
                <p className="text-accent text-[11px] font-black">{formatPrice(p.price)}</p>
              </div>
            </div>
          ))}
        </div>
        {/* ── STATS ── */}
      <div className="px-5 py-6 bg-card border-b border-border">
        {(() => {
          const dynamicStats = [
            { value: `${dbStats.products}`, label: "Produk Aktif" },
            { value: `${dbStats.users}`, label: "Pengguna" },
            { value: `${dbStats.transactions}`, label: "Transaksi" },
            { value: `${dbStats.avgRating}★`, label: "Rating App" },
          ];

          return (
            <div className="grid grid-cols-4 gap-2">
              {dynamicStats.map(({ value, label }) => (
                <div key={label} className="text-center">
                  <p className="text-primary font-black text-sm">{value}</p>
                  <p className="text-muted-foreground text-[9px] font-semibold uppercase tracking-wider">{label}</p>
                </div>
              ))}
            </div>
          );
        })()}
      </div>    
      </div>

      {/* ── FEATURES ── */}
      <div className="px-5 py-8">
        <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest mb-1">Kenapa Lapak Jas Merah?</p>
        <h2 className="text-foreground font-black text-2xl mb-6">Dirancang untuk<br />Mahasiswa UMM</h2>
        <div className="grid grid-cols-2 gap-3">
          {features.map(({ icon: Icon, title, desc, color }) => (
            <div key={title} className="bg-card rounded-2xl border border-border p-4 shadow-sm">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: color + "18" }}>
                <Icon size={20} style={{ color }} />
              </div>
              <p className="text-foreground font-bold text-sm mb-1">{title}</p>
              <p className="text-muted-foreground text-[11px] leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── HOW IT WORKS ── */}
      <div className="px-5 pb-8">
        <div className="bg-secondary rounded-3xl p-5">
          <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest mb-1">Cara Kerja</p>
          <h2 className="text-foreground font-black text-xl mb-5">Mudah dalam<br />3 Langkah</h2>
          <div className="space-y-4">
            {[
              { step: "01", title: "Daftar dengan NIM", desc: "Verifikasi identitas mahasiswa UMM aktif untuk akses penuh", color: "#c41230" },
              { step: "02", title: "Cari atau Pasang Iklan", desc: "Temukan produk impian atau jual barangmu gratis tanpa komisi", color: "#f59e0b" },
              { step: "03", title: "COD & Transaksi Aman", desc: "Bayar via UMM Pay, ketemu langsung di kampus, selesai!", color: "#10B981" },
            ].map(({ step, title, desc, color }) => (
              <div key={step} className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-black text-white text-sm" style={{ background: color }}>
                  {step}
                </div>
                <div className="flex-1 pt-1">
                  <p className="text-foreground font-bold text-sm">{title}</p>
                  <p className="text-muted-foreground text-[11px] leading-relaxed mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── TESTIMONIALS ── */}
      <div className="px-5 pb-8">
        <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest mb-1">Testimoni</p>
        <h2 className="text-foreground font-black text-xl mb-5">Kata Mereka</h2>
        <div className="space-y-3">
          {testimonials.map(({ name, prodi, text, avatar }) => (
            <div key={name} className="bg-card rounded-2xl border border-border p-4 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <img src={avatar} alt={name} className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <p className="text-foreground font-bold text-sm">{name}</p>
                  <p className="text-muted-foreground text-[11px]">{prodi}</p>
                </div>
                <div className="ml-auto flex items-center gap-0.5">
                  {[1,2,3,4,5].map((s) => <Star key={s} size={10} className="text-accent fill-accent" />)}
                </div>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">"{text}"</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── FINAL CTA ── */}
      <div className="px-5 pb-12">
        <div className="bg-gradient-to-br from-primary to-[#8b0d22] rounded-3xl p-6 text-center shadow-xl">
          <div className="w-14 h-14 bg-white/15 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShoppingBag size={28} className="text-white" />
          </div>
          <h2 className="text-white font-black text-2xl mb-2">Siap Bergabung?</h2>
          <p className="text-white/75 text-sm mb-6">Daftar sekarang, gratis selamanya. Khusus mahasiswa UMM aktif.</p>
          <button
            onClick={() => navigate("/register")}
            className="w-full bg-accent text-foreground font-black py-4 rounded-2xl text-base mb-3 shadow-lg active:scale-95 transition-transform"
          >
            Daftar Sekarang — Gratis
          </button>
          <button
            onClick={() => navigate("/login")}
            className="w-full bg-white/15 border border-white/30 text-white font-bold py-3.5 rounded-2xl text-sm"
          >
            Sudah punya akun? Masuk
          </button>
        </div>
      </div>

    </div>
  );
}
