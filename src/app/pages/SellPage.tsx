import { toast } from "react-hot-toast";
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Camera,
  X,
  FileText,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  Banknote,
  MapPin,
  ToggleLeft,
  ToggleRight,
  BadgeCheck,
  Info,
} from "lucide-react";
import { useApp } from "../context";
import { formatPrice } from "../data";
import { supabase } from "../../config/supabaseClient";
import { storageService } from "../../services/storageService";
import { useAuth } from "../../hooks/useAuth";

export default function SellPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { setActiveTab, setProducts, setListings } = useApp();

  const [photos, setPhotos] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [step, setStep] = useState<"form" | "success">("form");
  const [adPackage, setAdPackage] = useState<"gratis" | "standard">("gratis");
  const [form, setForm] = useState({
    title: "",
    category: "",
    condition: "",
    price: "",
    negotiable: true,
    stock: "1",
    description: "",
    location: "",
    customLocation: "",
    meetup: "",
    phone: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [shake, setShake] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [conditionOpen, setConditionOpen] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);

  const categoryOptions = [
    "Buku & Modul", "Elektronik", "Fashion", "Makanan & Minuman",
    "Jasa", "Kendaraan", "Kost & Kontrakan", "Alat Tulis",
    "Olahraga", "Kosmetik", "Lainnya",
  ];
  const conditionOptions = ["Baru", "Seperti Baru", "Bekas - Baik", "Bekas - Cukup"];
  const locationOptions = [
    "Kampus 1 (GKB)", "Kampus 2", "Kampus 3", "Dinoyo",
    "Sengkaling", "Lowokwaru", "Dau", "Online / Kirim",
    "Lainnya (Isi Sendiri)",
  ];

  function triggerFileInput() {
    fileInputRef.current?.click();
  }

  function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;

    const maxPhotos = adPackage === "gratis" ? 3 : 5;
    const remaining = maxPhotos - photos.length;

    if (remaining <= 0) {
      toast.error(`Paket ${adPackage} maksimal ${maxPhotos} foto`);
      return;
    }

    const filesArray = Array.from(files).slice(0, remaining);

    filesArray.forEach((file) => {
      if (!file.type.startsWith("image/")) {
        setErrors((prev) => ({ ...prev, photos: "File yang diunggah harus berupa gambar" }));
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, photos: "Ukuran file foto maksimal 5MB" }));
        return;
      }

      setFiles((prev) => [...prev, file]);
      const objectUrl = URL.createObjectURL(file);
      setPhotos((prev) => {
        const next = [...prev, objectUrl];
        return next;
      });
      setErrors((prev) => {
        const next = { ...prev };
        delete next.photos;
        return next;
      });
    });

    e.target.value = "";
  }

  function removePhoto(i: number) {
    setPhotos((p) => p.filter((_, idx) => idx !== i));
    setFiles((f) => f.filter((_, idx) => idx !== i));
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = "Judul wajib diisi";
    if (!form.category) e.category = "Pilih kategori";
    if (!form.condition) e.condition = "Pilih kondisi barang";
    if (!form.price.trim()) e.price = "Harga wajib diisi";
    if (form.price && isNaN(Number(form.price.replace(/\./g, "")))) e.price = "Harga harus berupa angka";
    if (!form.description.trim()) e.description = "Deskripsi wajib diisi";
    if (!form.location) e.location = "Pilih lokasi";
    if (form.location === "Lainnya (Isi Sendiri)" && (!form.customLocation || !form.customLocation.trim())) {
      e.location = "Isi lokasi COD Anda";
    }
    if (!form.stock || parseInt(form.stock) < 1 || isNaN(parseInt(form.stock))) e.stock = "Stok minimal 1";
    if (photos.length === 0) e.photos = "Tambahkan minimal 1 foto";

    const maxPhotos = adPackage === "gratis" ? 3 : 5;
    if (photos.length > maxPhotos) {
      e.photos = `Paket gratis maksimal ${maxPhotos} foto (Anda memiliki ${photos.length} foto)`;
    }
    return e;
  }

  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    if (isSubmitting) return;
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length === 0) {
      setIsSubmitting(true);
      try {
        let imageUrl = "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=300&h=300&fit=crop&auto=format";

        if (files.length > 0) {
          const uploadPromises = files.map(file => storageService.uploadProductImage(file));
          const uploadedUrls = await Promise.all(uploadPromises);

          // Filter out any potential failed uploads (null/undefined)
          const validUrls = uploadedUrls.filter(url => url);

          if (validUrls.length > 0) {
            // Save as JSON string array
            imageUrl = JSON.stringify(validUrls);
          }
        }

        const numericPrice = Number(form.price.replace(/\./g, ""));
        const actualLocation = form.location === "Lainnya (Isi Sendiri)" ? form.customLocation : form.location;

        if (!user) {
          toast.error("Sesi telah habis. Silakan login kembali.");
          return;
        }

        // Resolusi Kategori
        let categoryId = 6; // Default 'Lainnya'
        const { data: catData } = await supabase.from('categories').select('id').ilike('name', form.category).single();
        if (catData) categoryId = catData.id;

        // 2. Submit Product to Supabase
        const expireDays = adPackage === 'standard' ? 14 : 7;
        const expiresAt = new Date(Date.now() + expireDays * 24 * 60 * 60 * 1000).toISOString();

        const { data: newProduct, error: insertError } = await supabase.from('products').insert({
          seller_id: user.id,
          category_id: categoryId,
          name: form.title,
          description: form.description,
          price: numericPrice,
          condition: form.condition,
          stock: parseInt(form.stock) || 1,
          location: actualLocation,
          image_url: imageUrl,
          status: 'AVAILABLE',
          ad_package: adPackage,
          is_premium: false, // Will be activated by Admin
          expires_at: expiresAt
        }).select('id').single();

        if (insertError) throw insertError;

        if (adPackage === 'standard') {
          const { error: pkgError } = await supabase.from('package_transactions').insert({
            user_id: user.id,
            transaction_type: 'ad_package',
            product_id: newProduct.id,
            package_name: 'Highlight Pencarian 14 Hari',
            amount: 5000,
            status: 'PENDING'
          });
          if (pkgError) throw pkgError;
        }

        setStep("success");
      } catch (err: any) {
        console.error("Gagal mengunggah produk", err);
        toast.error(`Gagal memposting iklan: ${err.message || "Terjadi kesalahan"}`);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  }

  function formatRupiah(val: string) {
    const num = val.replace(/\D/g, "");
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }

  if (step === "success") {
    return (
      <div className="flex flex-col h-full bg-background items-center justify-center px-8 pb-10 overflow-y-auto">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 size={48} className="text-green-500" />
        </div>
        <h2 className="text-foreground font-black text-2xl text-center mb-2">Iklan Berhasil Dipasang!</h2>
        <p className="text-muted-foreground text-sm text-center mb-2">
          Produk <span className="font-bold text-foreground">"{form.title}"</span> sudah aktif dan bisa ditemukan oleh pembeli.
        </p>
        <p className="text-muted-foreground text-xs text-center mb-8">Iklan akan ditinjau dalam 1×24 jam</p>

        <div className="w-full bg-card rounded-2xl border border-border p-4 mb-6 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Kategori</span>
            <span className="font-semibold text-foreground">{form.category}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Kondisi</span>
            <span className="font-semibold text-foreground">{form.condition}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Harga</span>
            <span className="font-bold text-primary">Rp {form.price}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Lokasi</span>
            <span className="font-semibold text-foreground">{form.location}</span>
          </div>
          <div className="flex justify-between text-sm pt-2 border-t border-border">
            <span className="text-muted-foreground">Paket Iklan</span>
            <span className={`font-bold ${adPackage === "gratis" ? "text-emerald-600" : "text-blue-600"}`}>
              {adPackage === "gratis" ? "Gratis — Rp 0" : "Standard — Rp 5.000"}
            </span>
          </div>
        </div>

        <button
          onClick={() => { setStep("form"); setForm({ title: "", category: "", condition: "", price: "", negotiable: true, stock: "1", description: "", location: "", customLocation: "", meetup: "", phone: "" }); setPhotos([]); setErrors({}); setAdPackage("gratis"); navigate("/marketplace"); }}
          className="w-full bg-primary text-white font-bold py-3.5 rounded-2xl text-sm mb-3"
        >
          Kembali ke Beranda
        </button>
        <button
          onClick={() => { setStep("form"); setForm({ title: "", category: "", condition: "", price: "", negotiable: true, stock: "1", description: "", location: "", customLocation: "", meetup: "", phone: "" }); setPhotos([]); setErrors({}); setAdPackage("gratis"); }}
          className="w-full bg-secondary text-primary font-bold py-3.5 rounded-2xl text-sm border border-primary/20"
        >
          Pasang Iklan Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="lg:max-w-7xl lg:mx-auto lg:px-8 lg:py-6 lg:flex lg:gap-12 h-full items-start">

      {/* ── KIRI: Form Pengisian ── */}
      <div className="relative flex flex-col h-full lg:h-[85vh] bg-background overflow-hidden w-full max-w-[430px] mx-auto lg:mx-0 lg:w-[450px] shrink-0 lg:rounded-3xl lg:border lg:border-border lg:shadow-xl">
        {/* Header */}
        <div className="bg-primary text-white px-4 pt-10 pb-4 z-40 shadow-md">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/marketplace")}
              className="p-1.5 rounded-full hover:bg-white/10"
            >
              <ArrowLeft size={20} className="text-white" />
            </button>
            <div className="flex-1">
              <h1 className="text-white font-black text-lg leading-tight">Pasang Iklan</h1>
              <p className="text-white/60 text-[11px]">Standard • Cepat • Aman</p>
            </div>
            <div className="bg-blue-400 text-white text-[10px] font-black px-2.5 py-1 rounded-full">
              Rp 5.000
            </div>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-2 mt-4">
            {["Foto", "Detail", "Harga", "Lokasi"].map((s, i) => (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div className="flex items-center gap-1.5">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black"
                    style={{ background: "rgba(255,255,255,0.9)", color: "#c41230" }}
                  >
                    {i + 1}
                  </div>
                  <span className="text-white/80 text-[10px] font-semibold">{s}</span>
                </div>
                {i < 3 && <div className="flex-1 h-px bg-white/25" />}
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 space-y-5 pt-5 pb-36">

          {/* ── FOTO ── */}
          <section className={`transition-all duration-300 ${errors.photos ? "bg-red-50/20 p-3.5 rounded-2xl border border-red-100/60" : ""} ${errors.photos && shake ? "animate-shake" : ""}`}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-foreground font-bold text-sm">Foto Produk <span className="text-primary">*</span></h3>
                <p className="text-muted-foreground text-[11px]">Maks. 5 foto · Foto pertama jadi sampul</p>
              </div>
              <span className="text-muted-foreground text-xs font-semibold">{photos.length}/5</span>
            </div>

            <div className="flex gap-2.5 flex-wrap">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handlePhotoUpload}
                accept="image/*"
                multiple
                className="hidden"
              />
              {photos.map((src, i) => (
                <div key={i} className="relative" style={{ width: 80, height: 80 }}>
                  <img src={src} alt="" className="w-full h-full object-cover rounded-xl border border-border" />
                  {i === 0 && (
                    <span className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[9px] font-bold text-center py-0.5 rounded-b-xl">
                      Sampul
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => removePhoto(i)}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-foreground rounded-full flex items-center justify-center shadow"
                  >
                    <X size={11} className="text-white" />
                  </button>
                </div>
              ))}
              {photos.length < 5 && (
                <button
                  type="button"
                  onClick={triggerFileInput}
                  className="flex flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-border bg-card hover:bg-secondary transition-colors"
                  style={{ width: 80, height: 80 }}
                >
                  <Camera size={20} className="text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground font-semibold">Tambah</span>
                </button>
              )}
            </div>
            {errors.photos && (
              <p className="text-primary text-[11px] flex items-center gap-1 mt-2">
                <AlertCircle size={11} /> {errors.photos}
              </p>
            )}
          </section>

          {/* ── DETAIL BARANG ── */}
          <section className="bg-card rounded-2xl border border-border overflow-hidden">
            <div className="px-4 py-3 border-b border-border bg-secondary/50">
              <p className="text-foreground font-bold text-sm flex items-center gap-2">
                <FileText size={14} className="text-primary" /> Detail Barang
              </p>
            </div>

            <div className="divide-y divide-border">
              {/* Judul */}
              <div className={`px-4 py-3.5 transition-all duration-300 ${errors.title ? "bg-red-50/20" : ""} ${errors.title && shake ? "animate-shake" : ""}`}>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide block mb-1.5">
                  Judul Iklan <span className="text-primary">*</span>
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="Contoh: Laptop Asus i5 Gen 11, mulus"
                  maxLength={70}
                  className="w-full text-sm text-foreground bg-transparent outline-none placeholder:text-muted-foreground"
                />
                <div className="flex justify-between items-center mt-1">
                  {errors.title
                    ? <p className="text-primary text-[11px] flex items-center gap-1"><AlertCircle size={11} />{errors.title}</p>
                    : <span />}
                  <span className="text-[10px] text-muted-foreground">{form.title.length}/70</span>
                </div>
              </div>

              {/* Kategori */}
              <div className={`px-4 py-3.5 relative transition-all duration-300 ${errors.category ? "bg-red-50/20" : ""} ${errors.category && shake ? "animate-shake" : ""}`}>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide block mb-1.5">
                  Kategori <span className="text-primary">*</span>
                </label>
                <button
                  onClick={() => { setCategoryOpen((o) => !o); setConditionOpen(false); setLocationOpen(false); }}
                  className="w-full flex items-center justify-between text-sm"
                >
                  <span className={form.category ? "text-foreground font-semibold" : "text-muted-foreground"}>
                    {form.category || "Pilih kategori..."}
                  </span>
                  <ChevronDown size={16} className="text-muted-foreground" style={{ transform: categoryOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
                </button>
                {errors.category && <p className="text-primary text-[11px] flex items-center gap-1 mt-1"><AlertCircle size={11} />{errors.category}</p>}
                {categoryOpen && (
                  <div className="absolute left-0 right-0 top-full z-30 bg-card border border-border rounded-xl shadow-xl mx-4 overflow-hidden">
                    {categoryOptions.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => { setForm((f) => ({ ...f, category: opt })); setCategoryOpen(false); }}
                        className="w-full px-4 py-2.5 text-sm text-left hover:bg-secondary transition-colors flex items-center justify-between"
                      >
                        <span className={form.category === opt ? "text-primary font-bold" : "text-foreground"}>{opt}</span>
                        {form.category === opt && <CheckCircle2 size={14} className="text-primary" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Kondisi */}
              <div className={`px-4 py-3.5 relative transition-all duration-300 ${errors.condition ? "bg-red-50/20" : ""} ${errors.condition && shake ? "animate-shake" : ""}`}>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide block mb-2">
                  Kondisi <span className="text-primary">*</span>
                </label>
                <div className="flex gap-2 flex-wrap">
                  {conditionOptions.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setForm((f) => ({ ...f, condition: opt }))}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold border transition-all"
                      style={
                        form.condition === opt
                          ? { background: "#c41230", color: "#fff", border: "1.5px solid #c41230" }
                          : { background: "#fff", color: "#8a8a9a", border: "1.5px solid rgba(0,0,0,0.1)" }
                      }
                    >
                      {opt}
                    </button>
                  ))}
                </div>
                {errors.condition && <p className="text-primary text-[11px] flex items-center gap-1 mt-2"><AlertCircle size={11} />{errors.condition}</p>}
              </div>


              {/* Deskripsi */}
              <div className={`px-4 py-3.5 transition-all duration-300 ${errors.description ? "bg-red-50/20" : ""} ${errors.description && shake ? "animate-shake" : ""}`}>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide block mb-1.5">
                  Deskripsi <span className="text-primary">*</span>
                </label>
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Jelaskan kondisi barang, alasan jual, kelengkapan, dll..."
                  maxLength={500}
                  className="w-full text-sm text-foreground bg-transparent outline-none resize-none placeholder:text-muted-foreground leading-relaxed"
                />
                <div className="flex justify-between items-center mt-1">
                  {errors.description
                    ? <p className="text-primary text-[11px] flex items-center gap-1"><AlertCircle size={11} />{errors.description}</p>
                    : <span />}
                  <span className="text-[10px] text-muted-foreground">{form.description.length}/500</span>
                </div>
              </div>
            </div>
          </section>

          {/* ── HARGA ── */}
          <section className="bg-card rounded-2xl border border-border overflow-hidden">
            <div className="px-4 py-3 border-b border-border bg-secondary/50">
              <p className="text-foreground font-bold text-sm flex items-center gap-2">
                <Banknote size={14} className="text-primary" /> Harga
              </p>
            </div>

            <div className="divide-y divide-border">
              <div className={`px-4 py-3.5 transition-all duration-300 ${errors.price ? "bg-red-50/20" : ""} ${errors.price && shake ? "animate-shake" : ""}`}>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide block mb-1.5">
                  Harga Jual (Rp) <span className="text-primary">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-foreground font-bold text-base">Rp</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={form.price}
                    onChange={(e) => setForm((f) => ({ ...f, price: formatRupiah(e.target.value) }))}
                    placeholder="0"
                    className="flex-1 text-foreground font-bold text-xl bg-transparent outline-none placeholder:text-muted-foreground"
                  />
                </div>
                {errors.price && <p className="text-primary text-[11px] flex items-center gap-1 mt-1"><AlertCircle size={11} />{errors.price}</p>}
                {form.price && !errors.price && (
                  <p className="text-muted-foreground text-[11px] mt-1">
                    = <span className="font-semibold text-foreground">
                      {Number(form.price.replace(/\./g, "")).toLocaleString("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 })}
                    </span>
                  </p>
                )}
              </div>

              <div className="px-4 py-3.5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-foreground">Harga bisa nego</p>
                    <p className="text-[11px] text-muted-foreground">Pembeli dapat menawar harga</p>
                  </div>
                  <button
                    onClick={() => setForm((f) => ({ ...f, negotiable: !f.negotiable }))}
                    className="transition-colors"
                  >
                    {form.negotiable
                      ? <ToggleRight size={32} className="text-primary" />
                      : <ToggleLeft size={32} className="text-muted-foreground" />}
                  </button>
                </div>
              </div>

              <div className={`px-4 py-3.5 transition-all duration-300 ${errors.stock ? "bg-red-50/20" : ""} ${errors.stock && shake ? "animate-shake" : ""}`}>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide block mb-1.5">
                  Stok Barang <span className="text-primary">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={form.stock}
                  onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
                  placeholder="1"
                  className="w-full text-foreground font-bold text-base bg-transparent outline-none placeholder:text-muted-foreground"
                />
                {errors.stock && <p className="text-primary text-[11px] flex items-center gap-1 mt-1"><AlertCircle size={11} />{errors.stock}</p>}
              </div>

            </div>
          </section>

          {/* ── LOKASI & TRANSAKSI ── */}
          <section className="bg-card rounded-2xl border border-border overflow-hidden">
            <div className="px-4 py-3 border-b border-border bg-secondary/50">
              <p className="text-foreground font-bold text-sm flex items-center gap-2">
                <MapPin size={14} className="text-primary" /> Lokasi & Transaksi
              </p>
            </div>

            <div className="divide-y divide-border">
              {/* Lokasi */}
              <div className={`px-4 py-3.5 relative transition-all duration-300 ${errors.location ? "bg-red-50/20" : ""} ${errors.location && shake ? "animate-shake" : ""}`}>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide block mb-1.5">
                  Lokasi <span className="text-primary">*</span>
                </label>
                <button
                  onClick={() => { setLocationOpen((o) => !o); setCategoryOpen(false); setConditionOpen(false); }}
                  className="w-full flex items-center justify-between text-sm"
                >
                  <span className={form.location ? "text-foreground font-semibold" : "text-muted-foreground"}>
                    {form.location || "Pilih lokasi COD / pickup..."}
                  </span>
                  <ChevronDown size={16} className="text-muted-foreground" style={{ transform: locationOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
                </button>
                {errors.location && <p className="text-primary text-[11px] flex items-center gap-1 mt-1"><AlertCircle size={11} />{errors.location}</p>}
                {locationOpen && (
                  <div className="absolute left-0 right-0 top-full z-30 bg-card border border-border rounded-xl shadow-xl mx-4 overflow-hidden max-h-60 overflow-y-auto">
                    {locationOptions.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => { setForm((f) => ({ ...f, location: opt })); setLocationOpen(false); }}
                        className="w-full px-4 py-2.5 text-sm text-left hover:bg-secondary transition-colors flex items-center justify-between"
                      >
                        <span className={form.location === opt ? "text-primary font-bold" : "text-foreground"}>{opt}</span>
                        {form.location === opt && <CheckCircle2 size={14} className="text-primary" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Custom Location */}
              {form.location === "Lainnya (Isi Sendiri)" && (
                <div className="px-4 py-3.5 bg-secondary/20">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide block mb-1.5">
                    Isi Lokasi COD <span className="text-primary">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.customLocation || ""}
                    onChange={(e) => setForm((f) => ({ ...f, customLocation: e.target.value }))}
                    placeholder="Ketik lokasi COD..."
                    className="w-full text-sm text-foreground bg-transparent outline-none placeholder:text-muted-foreground border-b border-border pb-1 focus:border-primary transition-colors"
                  />
                </div>
              )}

              {/* Tempat COD */}
              <div className="px-4 py-3.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide block mb-1.5">
                  Detail Tempat Temu (opsional)
                </label>
                <input
                  type="text"
                  value={form.meetup}
                  onChange={(e) => setForm((f) => ({ ...f, meetup: e.target.value }))}
                  placeholder="Contoh: Kantin GKB 1, depan ATM BNI"
                  className="w-full text-sm text-foreground bg-transparent outline-none placeholder:text-muted-foreground"
                />
              </div>

              {/* No HP */}
              <div className="px-4 py-3.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide block mb-1.5">
                  No. WhatsApp (opsional)
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-sm font-semibold">+62</span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value.replace(/\D/g, "") }))}
                    placeholder="8xx-xxxx-xxxx"
                    className="flex-1 text-sm text-foreground bg-transparent outline-none placeholder:text-muted-foreground"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* ── PAKET IKLAN ── */}
          <section className="space-y-3">
            <div>
              <h3 className="text-foreground font-bold text-sm">Paket Iklan</h3>
              <p className="text-muted-foreground text-[11px]">Pilih paket iklan yang sesuai dengan kebutuhan Anda</p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {/* Paket Gratis */}
              <button
                type="button"
                onClick={() => setAdPackage("gratis")}
                className="w-full text-left rounded-2xl border-2 overflow-hidden transition-all duration-200 cursor-pointer"
                style={{
                  borderColor: adPackage === "gratis" ? "#10B981" : "var(--border)",
                  background: adPackage === "gratis" ? "rgba(16,185,129,0.06)" : "var(--card)",
                }}
              >
                <div className="h-1 w-full animate-pulse" style={{ backgroundColor: adPackage === "gratis" ? "#10B981" : "var(--border)" }} />
                <div className="px-4 py-3">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-foreground font-bold text-sm">Gratis</span>
                      <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-emerald-500 text-white">BASIC</span>
                    </div>
                    <span className="font-bold text-base text-emerald-600">Rp 0</span>
                  </div>
                  <span className="text-muted-foreground text-[11px] block mb-2">Berlaku 7 hari</span>
                  {/* Features */}
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1">✓ Tayang 7 hari</span>
                    <span className="flex items-center gap-1">✓ Maksimal 3 foto</span>
                    <span className="flex items-center gap-1">✓ Chat dengan pembeli</span>
                    <span className="flex items-center gap-1 text-muted-foreground/60">✗ Label "Unggulan"</span>
                  </div>
                </div>
              </button>

              {/* Paket Standard */}
              <button
                type="button"
                onClick={() => setAdPackage("standard")}
                className="w-full text-left rounded-2xl border-2 overflow-hidden transition-all duration-200 cursor-pointer"
                style={{
                  borderColor: adPackage === "standard" ? "#3B82F6" : "var(--border)",
                  background: adPackage === "standard" ? "rgba(59,130,246,0.06)" : "var(--card)",
                }}
              >
                <div className="h-1 w-full" style={{ backgroundColor: adPackage === "standard" ? "#3B82F6" : "var(--border)" }} />
                <div className="px-4 py-3">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-foreground font-bold text-sm">Standard</span>
                      <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-blue-500 text-white">REKOMENDASI</span>
                    </div>
                    <span className="font-bold text-base text-blue-600">Rp 5.000</span>
                  </div>
                  <span className="text-muted-foreground text-[11px] block mb-2">Berlaku 14 hari</span>
                  {/* Features */}
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1">✓ Tayang 14 hari</span>
                    <span className="flex items-center gap-1">✓ Maksimal 5 foto</span>
                    <span className="flex items-center gap-1">✓ Label "Unggulan"</span>
                    <span className="flex items-center gap-1">✓ Prioritas Tampil</span>
                  </div>
                </div>
              </button>
            </div>
          </section>

          {/* ── INFO ── */}
          <div className="flex items-start gap-2.5 bg-blue-50 rounded-xl p-3.5 border border-blue-100">
            <Info size={15} className="text-blue-500 shrink-0 mt-0.5" />
            <p className="text-blue-700 text-[11px] leading-relaxed">
              Iklan akan ditinjau dalam <span className="font-bold">1×24 jam</span>. Pastikan informasi yang kamu berikan akurat agar proses verifikasi lebih cepat.
            </p>
          </div>

        </div>

        {/* ── SUBMIT BUTTON (fixed) ── */}
        <div className="absolute bottom-0 left-0 right-0 w-full bg-card border-t border-border px-4 py-3 z-40 shadow-2xl">
          {Object.keys(errors).length > 0 && (
            <p className={`text-primary text-[11px] font-semibold text-center mb-2 flex items-center justify-center gap-1 ${shake ? "animate-shake" : ""}`}>
              <AlertCircle size={11} /> Mohon lengkapi data yang masih kosong
            </p>
          )}
          {/* Price summary */}
          <div className="flex justify-between items-center mb-3 px-1 pt-1 border-t border-border">
            <span className="text-foreground font-bold text-sm">Total</span>
            <span className={`font-black text-sm ${adPackage === "gratis" ? "text-emerald-600" : "text-primary"}`}>
              {adPackage === "gratis" ? "Rp 0" : "Rp 5.000"}
            </span>
          </div>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`w-full bg-primary text-white font-black py-4 rounded-2xl text-base shadow-lg active:scale-95 transition-transform ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            {isSubmitting ? "Memproses..." : (adPackage === "gratis" ? "Pasang Iklan Gratis" : "Bayar Rp 5.000 & Pasang Iklan")}
          </button>
          <p className="text-center text-muted-foreground text-[10px] mt-2">
            Dengan memasang iklan, kamu menyetujui <span className="text-primary font-semibold">Syarat & Ketentuan</span> Lapak Jas Merah
          </p>
        </div>
      </div>

      {/* ── KANAN: Live Preview (Khusus Desktop) ── */}
      <div className="hidden lg:flex flex-col flex-1 bg-card rounded-3xl border border-border shadow-2xl overflow-hidden sticky top-[88px] h-[85vh]">
        <div className="bg-secondary px-6 py-4 border-b border-border flex items-center justify-between z-10 shrink-0">
          <div className="flex items-center gap-2">
            <BadgeCheck size={18} className="text-blue-500" />
            <h2 className="font-bold text-foreground text-sm">Live Preview Tampilan Iklan</h2>
          </div>
          <span className="text-[10px] font-bold text-muted-foreground bg-background px-2.5 py-1.5 rounded-lg border border-border">
            Simulasi Halaman Detail
          </span>
        </div>

        <div className="flex-1 overflow-y-auto bg-background/30 p-8 flex justify-center items-start">
          <div className="bg-card w-full max-w-[360px] rounded-[2rem] border-[6px] border-secondary shadow-xl overflow-hidden flex flex-col relative pb-6">
            {/* Header Mock */}
            <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10">
              <div className="w-8 h-8 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center">
                <ArrowLeft size={16} className="text-white" />
              </div>
              <div className="w-8 h-8 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center">
                <MapPin size={14} className="text-white" />
              </div>
            </div>

            {/* Image Area */}
            <div className="aspect-square bg-secondary relative">
              {photos.length > 0 ? (
                <img src={photos[0]} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/40">
                  <Camera size={48} className="mb-2 opacity-50" />
                  <span className="text-[11px] font-bold uppercase tracking-widest">Belum ada foto</span>
                </div>
              )}
              {adPackage === "standard" && (
                <span className="absolute bottom-4 right-4 bg-blue-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-md">
                  REKOMENDASI
                </span>
              )}
            </div>

            {/* Content Area */}
            <div className="p-5 flex flex-col gap-3">
              <div>
                <h3 className="font-bold text-foreground text-lg leading-tight mb-1">
                  {form.title || "Judul Iklan Anda"}
                </h3>
                <p className="font-black text-primary text-2xl">
                  Rp {form.price || "0"}
                </p>
              </div>

              <div className="flex flex-wrap gap-2 mt-1">
                <span className="bg-secondary text-foreground text-[10px] font-bold px-2.5 py-1 rounded-md border border-border">
                  {form.category || "Kategori"}
                </span>
                <span className="bg-secondary text-foreground text-[10px] font-bold px-2.5 py-1 rounded-md border border-border flex items-center gap-1">
                  <MapPin size={10} /> {form.location || "Lokasi"}
                </span>
                <span className="bg-secondary text-foreground text-[10px] font-bold px-2.5 py-1 rounded-md border border-border">
                  {form.condition || "Kondisi"}
                </span>
              </div>

              <div className="mt-3 pt-4 border-t border-dashed border-border">
                <p className="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {form.description || "Deskripsi lengkap mengenai barang Anda akan ditampilkan di sini. Pembeli dapat membaca detail, spesifikasi, dan kelengkapan barang sebelum membeli."}
                </p>
              </div>

              <div className="mt-4 flex items-center justify-between bg-secondary/50 p-3 rounded-2xl border border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-lg">
                    {user?.user_metadata?.full_name?.charAt(0) || "U"}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">{user?.user_metadata?.full_name || "Nama Penjual"}</p>
                    <p className="text-[10px] text-muted-foreground">Mahasiswa UMM</p>
                  </div>
                </div>
                <div className="bg-primary/10 text-primary px-3 py-1.5 rounded-xl text-[10px] font-bold">
                  Chat
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
//tes