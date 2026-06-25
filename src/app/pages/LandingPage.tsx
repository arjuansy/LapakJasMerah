import { Shield, Tag, MessageSquare, MapPin, Star, Zap, ShoppingBag, Quote } from "lucide-react";
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
    { icon: Shield, title: "100% Aman", desc: "Escrow & verifikasi NIM UMM", color: "#10B981" },
    { icon: Tag, title: "Harga Mahasiswa", desc: "Barang bekas & baru, terjangkau", color: "#F59E0B" },
    { icon: MessageSquare, title: "Chat Langsung", desc: "Negosiasi dengan penjual", color: "#3B82F6" },
    { icon: MapPin, title: "COD di Kampus", desc: "Transaksi tatap muka", color: "#8B5CF6" },
  ];

  const testimonials = [
    { name: "Dinda R.", prodi: "Psikologi '23", text: "Beli buku bekas semester lalu di sini, hemat 60%! Kondisinya bagus banget.", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60&h=60&fit=crop&auto=format" },
    { name: "Fajar A.", prodi: "Teknik Sipil '22", text: "Jual laptop lama cuma 2 hari langsung laku. Prosesnya gampang banget.", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=60&h=60&fit=crop&auto=format" },
    { name: "Sari W.", prodi: "Manajemen '21", text: "Cari kost deket kampus 3 nemu di sini. Pemiliknya ramah, harga pas.", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop&auto=format" },
  ];

  const steps = [
    { step: "01", title: "Daftar dengan NIM", desc: "Verifikasi identitas mahasiswa UMM aktif untuk akses penuh", color: "#c41230" },
    { step: "02", title: "Cari atau Pasang Iklan", desc: "Temukan produk impian atau jual barangmu gratis tanpa komisi", color: "#f59e0b" },
    { step: "03", title: "COD & Transaksi Aman", desc: "Bayar via UMM Pay, ketemu langsung di kampus, selesai!", color: "#10B981" },
  ];

  return (
    <div className="min-h-screen bg-background overflow-y-auto" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* ── HERO ── */}
      <div className="relative overflow-hidden" style={{ background: "radial-gradient(120% 100% at 20% 0%, #e0273f 0%, #c41230 35%, #7a0a1c 70%, #1a1a2e 100%)", minHeight: 580 }}>
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full blur-2xl opacity-20" style={{ background: "#f59e0b" }} />
        <div className="absolute top-40 -left-24 w-56 h-56 rounded-full blur-2xl opacity-15" style={{ background: "#fff" }} />
        <div className="absolute bottom-10 right-10 w-44 h-44 rounded-full blur-xl opacity-10" style={{ background: "#f59e0b" }} />
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)", backgroundSize: "28px 28px" }} />

        <div className="relative z-10 px-6 pt-14 pb-10">
          {/* Logo row */}
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center shadow-lg overflow-hidden ring-2 ring-white/30">
                <img src={logo} alt="Logo" className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="text-white font-black text-lg leading-none tracking-tight">LapakJasMerah</p>
                <p className="text-white/60 text-[11px]">Universitas Muhammadiyah Malang</p>
              </div>
            </div>
          </div>

          {/* Headline — direvisi: highlight jatuh di "UMM", bukan kata tengah yang kurang bermakna */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/25 rounded-full px-3 py-1.5 mb-4 shadow-[0_0_20px_rgba(245,158,11,0.25)]">
              <Zap size={12} className="text-accent fill-accent" />
              <span className="text-white text-[11px] font-bold">Platform #1 Mahasiswa UMM</span>
            </div>
            <h1 className="text-white font-black text-4xl leading-[1.15] mb-3 tracking-tight">
              Jual &amp; Beli Bareng<br />
              Mahasiswa{" "}
              <span className="bg-gradient-to-r from-accent to-yellow-300 bg-clip-text text-transparent">UMM</span>
            </h1>
            <p className="text-white/75 text-sm leading-relaxed max-w-[320px]">
              Marketplace khusus civitas akademika UMM. Aman, terpercaya, dan harga terjangkau — semua terverifikasi email UMM.
            </p>
          </div>

          {/* CTA buttons */}
          <div className="flex gap-3 mb-5">
            <button
              onClick={() => navigate("/register")}
              className="flex-1 bg-accent text-foreground font-black py-3.5 rounded-2xl text-sm shadow-[0_8px_24px_rgba(245,158,11,0.35)] active:scale-95 transition-transform"
            >
              Daftar Gratis
            </button>
            <button
              onClick={() => navigate("/login")}
              className="flex-1 bg-white/10 backdrop-blur-sm border border-white/30 text-white font-bold py-3.5 rounded-2xl text-sm active:scale-95 transition-transform hover:bg-white/15"
            >
              Masuk
            </button>
          </div>

          {/* Divider halus sebelum social proof — kasih jarak napas, bukan numpuk langsung di bawah button */}
          <div className="h-px bg-white/10 mb-5" />

          {/* Social proof */}
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {["photo-1500648767791-00dcc994a43e", "photo-1494790108377-be9c29b29330", "photo-1519085360753-af0119f7cbe7", "photo-1438761681033-6461ffad8d80"].map((id) => (
                <img key={id} src={`https://images.unsplash.com/${id}?w=40&h=40&fit=crop&auto=format`} className="w-8 h-8 rounded-full border-2 border-primary object-cover" alt="" />
              ))}
            </div>
            <p className="text-white/80 text-xs"><span className="font-bold text-white">{dbStats.users}</span> mahasiswa sudah bergabung</p>
          </div>
        </div>

        {/* Product preview strip */}
        <div className="flex gap-3 px-6 pb-16 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          {products.slice(0, 5).map((p) => (
            <div key={p.id} className="shrink-0 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl overflow-hidden hover:bg-white/15 transition-colors" style={{ width: 120 }}>
              <img src={p.image} alt={p.name} className="w-full h-20 object-cover" />
              <div className="p-2">
                <p className="text-white text-[10px] font-semibold line-clamp-1">{p.name}</p>
                <p className="text-accent text-[11px] font-black">{formatPrice(p.price)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── STATS (floating card) — font diturunkan + truncate biar aman dari angka besar ── */}
      <div className="px-5 -mt-10 relative z-20">
        <div className="bg-card rounded-3xl border border-border shadow-xl px-4 py-5">
          {(() => {
            const dynamicStats = [
              { value: `${dbStats.products}`, label: "Produk Aktif" },
              { value: `${dbStats.users}`, label: "Pengguna" },
              { value: `${dbStats.transactions}`, label: "Transaksi" },
              { value: `${dbStats.avgRating}★`, label: "Rating" },
            ];
            return (
              <div className="grid grid-cols-4 gap-1">
                {dynamicStats.map(({ value, label }, i) => (
                  <div key={label} className={`text-center min-w-0 px-1 ${i !== 0 ? "border-l border-border" : ""}`}>
                    <p className="text-primary font-black text-sm truncate">{value}</p>
                    <p className="text-muted-foreground text-[9px] font-semibold uppercase tracking-wider mt-0.5 truncate">{label}</p>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      </div>

      {/* ── FEATURES — card dipaksa equal height dengan flex column + h-full ── */}
      <div className="px-5 pt-10 pb-8">
        <p className="text-primary text-xs font-bold uppercase tracking-widest mb-1">Kenapa Lapak Jas Merah?</p>
        <h2 className="text-foreground font-black text-2xl mb-6 tracking-tight">Dirancang untuk<br />Mahasiswa UMM</h2>
        <div className="grid grid-cols-2 gap-3 items-stretch">
          {features.map(({ icon: Icon, title, desc, color }) => (
            <div
              key={title}
              className="bg-card rounded-2xl border border-border p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col"
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center mb-3"
                style={{ background: `linear-gradient(135deg, ${color}25, ${color}10)` }}
              >
                <Icon size={20} style={{ color }} />
              </div>
              <p className="text-foreground font-bold text-sm mb-1">{title}</p>
              <p className="text-muted-foreground text-[11px] leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── HOW IT WORKS — connector line dibuat struktural (flex-col di kolom kiri), bukan absolute magic number ── */}
      <div className="px-5 pb-8">
        <div className="bg-secondary rounded-3xl p-5 relative overflow-hidden">
          <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full opacity-[0.06] bg-primary" />
          <p className="text-primary text-xs font-bold uppercase tracking-widest mb-1">Cara Kerja</p>
          <h2 className="text-foreground font-black text-xl mb-5 tracking-tight">Mudah dalam<br />3 Langkah</h2>
          <div className="relative">
            {steps.map(({ step, title, desc, color }, i) => (
              <div key={step} className="flex items-start gap-4">
                {/* Kolom kiri: circle + line, line otomatis nempel ke circle karena satu flex-col */}
                <div className="flex flex-col items-center shrink-0">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center font-black text-white text-sm shadow-md"
                    style={{ background: color }}
                  >
                    {step}
                  </div>
                  {i !== steps.length - 1 && (
                    <div className="w-px flex-1 bg-border my-1" style={{ minHeight: 20 }} />
                  )}
                </div>
                <div className={`flex-1 pt-1 ${i !== steps.length - 1 ? "pb-5" : ""}`}>
                  <p className="text-foreground font-bold text-sm">{title}</p>
                  <p className="text-muted-foreground text-[11px] leading-relaxed mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── TESTIMONIALS — background secondary (bukan card putih lagi) biar gak monoton merah-putih-putih-merah ── */}
      <div className="px-5 py-8 bg-secondary/50">
        <p className="text-primary text-xs font-bold uppercase tracking-widest mb-1">Testimoni</p>
        <h2 className="text-foreground font-black text-xl mb-5 tracking-tight">Kata Mereka</h2>
        <div className="space-y-3">
          {testimonials.map(({ name, prodi, text, avatar }) => (
            <div key={name} className="bg-card rounded-2xl border border-border p-4 shadow-sm relative overflow-hidden">
              <Quote size={48} className="absolute -top-2 -right-2 text-primary/[0.06]" />
              <div className="flex items-center gap-3 mb-3 relative">
                <img
                  src={avatar}
                  alt={name}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-accent ring-offset-2 ring-offset-card"
                />
                <div>
                  <p className="text-foreground font-bold text-sm">{name}</p>
                  <p className="text-muted-foreground text-[11px]">{prodi}</p>
                </div>
                <div className="ml-auto flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => <Star key={s} size={10} className="text-accent fill-accent" />)}
                </div>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed relative">"{text}"</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── FINAL CTA ── */}
      <div className="px-5 py-12">
        <div className="rounded-3xl p-6 text-center shadow-xl relative overflow-hidden" style={{ background: "linear-gradient(160deg, #c41230 0%, #7a0a1c 100%)" }}>
          <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full opacity-10 bg-accent" />
          <div className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full opacity-10 bg-white" />
          <div className="relative">
            <div className="w-14 h-14 bg-white/15 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4 ring-1 ring-white/20">
              <ShoppingBag size={28} className="text-white" />
            </div>
            <h2 className="text-white font-black text-2xl mb-2 tracking-tight">Siap Bergabung?</h2>
            <p className="text-white/75 text-sm mb-6">Daftar sekarang, gratis selamanya. Khusus mahasiswa UMM aktif.</p>
            <button
              onClick={() => navigate("/register")}
              className="w-full bg-accent text-foreground font-black py-4 rounded-2xl text-base mb-3 shadow-[0_8px_24px_rgba(245,158,11,0.4)] active:scale-95 transition-transform"
            >
              Daftar Sekarang — Gratis
            </button>
            <button
              onClick={() => navigate("/login")}
              className="w-full bg-white/10 backdrop-blur-sm border border-white/30 text-white font-bold py-3.5 rounded-2xl text-sm hover:bg-white/15"
            >
              Sudah punya akun? Masuk
            </button>
          </div>
        </div>
      </div>

      {/* ── FOOTER — balik ke list simpel, gak compete attention sama CTA di atasnya ── */}
      <div className="px-5 pb-12 text-center">
        <p className="text-muted-foreground text-[11px] font-bold uppercase tracking-widest mb-2">Dikembangkan Oleh</p>
        <p className="text-primary font-black text-xs mb-2">Informatika 2024 UMM</p>
        <p className="text-muted-foreground text-[12px] font-medium">
          Akhmad Arjuan Syuhada · Jingga Maulidhina · Umi Fadilah
        </p>
      </div>

    </div>
  );
}