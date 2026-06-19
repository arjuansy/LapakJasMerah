import React, { useState } from "react";
import { useApp } from "../context";
import { useAuth } from "../../hooks/useAuth";
import type { RequestItem } from "../data";
import {
  X, CheckCircle2, Banknote, Zap, AlertCircle, Eye, Shield, Package, MessageCircle, ToggleRight, ToggleLeft, Send
} from "lucide-react";
import { supabase } from "../../services/supabase";

// ── POST REQUEST MODAL ──
export function PostRequestModal() {
  const { setShowPostRequestModal, setRequests, editingRequest, setEditingRequest } = useApp();
  const { profile, user } = useAuth();
  const [title, setTitle] = useState(editingRequest?.title || "");
  const [desc, setDesc] = useState(editingRequest?.description || "");
  const [category, setCategory] = useState(editingRequest?.category || "");
  const [budgetMin, setBudgetMin] = useState(editingRequest ? String(editingRequest.budget) : "");
  const [budgetMax, setBudgetMax] = useState(editingRequest?.budgetMax ? String(editingRequest.budgetMax) : "");
  const [urgency, setUrgency] = useState<"normal" | "segera" | "mendesak">(editingRequest?.urgency || "normal");
  const [location, setLocation] = useState(editingRequest?.location || "");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [requestDuration, setRequestDuration] = useState<"1" | "7">("1");

  const reqCategories = ["Elektronik", "Buku & Modul", "Fashion", "Makanan", "Jasa", "Kendaraan", "Kost & Kontrakan", "Lainnya"];
  const urgencies: { key: "normal" | "segera" | "mendesak"; label: string; color: string }[] = [
    { key: "normal", label: "Normal", color: "#6B7280" },
    { key: "segera", label: "Segera", color: "#F59E0B" },
    { key: "mendesak", label: "Mendesak!", color: "#EF4444" },
  ];

  async function handleSubmit() {
    if (!title.trim()) { setError("Judul permintaan wajib diisi"); return; }
    if (!category) { setError("Pilih kategori terlebih dahulu"); return; }
    if (!desc.trim() || desc.length < 10) { setError("Deskripsi minimal 10 karakter"); return; }
    if (!user) { setError("Anda harus login untuk memposting permintaan"); return; }
    
    setError("");
    setLoading(true);

    const budgetMinNum = parseInt(budgetMin.replace(/\D/g, "")) || 0;
    const budgetMaxNum = budgetMax ? parseInt(budgetMax.replace(/\D/g, "")) : null;

    const requestPayload = {
      user_id: user.id,
      title: title.trim(),
      description: desc.trim(),
      category: category,
      budget_min: budgetMinNum,
      budget_max: budgetMaxNum,
      location: location.trim() || "UMM",
      urgency: urgency,
    };

    let resultError = null;
    let savedRequest = null;

    if (editingRequest) {
      const { data, error } = await supabase
        .from('requests')
        .update(requestPayload)
        .eq('id', editingRequest.id)
        .select()
        .single();
      resultError = error;
      savedRequest = data;
    } else {
      const { data, error } = await supabase
        .from('requests')
        .insert([requestPayload])
        .select()
        .single();
      resultError = error;
      savedRequest = data;
    }

    if (resultError) {
      console.error("Gagal menyimpan permintaan:", resultError);
      setError("Gagal menyimpan permintaan ke server.");
      setLoading(false);
      return;
    }
    
    if (savedRequest) {
      // Reload UI directly with new item logic so UI updates immediately
      const newReq: RequestItem = {
        id: savedRequest.id,
        title: savedRequest.title,
        description: savedRequest.description,
        category: savedRequest.category,
        budget: savedRequest.budget_min,
        budgetMax: savedRequest.budget_max,
        poster: profile?.full_name || user?.user_metadata?.full_name || "Mahasiswa",
        posterId: user.id,
        posterAvatar: profile?.avatar_url || user?.user_metadata?.avatar_url || "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=80&h=80&fit=crop&auto=format",
        location: savedRequest.location,
        postedAt: "Baru saja",
        urgency: savedRequest.urgency,
        offers: editingRequest ? editingRequest.offers : 0,
        categoryColor: reqCategories.indexOf(category) >= 0
          ? ["#8B5CF6","#3B82F6","#EC4899","#F97316","#10B981","#06B6D4","#F59E0B","#6B7280"][reqCategories.indexOf(category)]
          : "#6B7280",
      };

      if (editingRequest) {
        setRequests(prev => prev.map(r => r.id === editingRequest.id ? newReq : r));
      } else {
        setRequests(prev => [newReq, ...prev]);
      }
    }
    
    setLoading(false);
    setSubmitted(true);
  }

  return (
    <div className="fixed inset-0 z-[90] flex flex-col justify-end" style={{ maxWidth: 430, margin: "0 auto" }}>
      <div className="absolute inset-0 bg-black/50" onClick={() => setShowPostRequestModal(false)} />
      <div className="relative bg-card rounded-t-3xl shadow-2xl max-h-[93vh] flex flex-col z-10">
        <div className="pt-4 pb-2 px-5 shrink-0">
          <div className="w-10 h-1 bg-border rounded-full mx-auto mb-4" />
          {!submitted && (
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-foreground font-black text-lg">
                  {editingRequest ? "Edit Permintaan" : "Buat Permintaan Baru"}
                </h3>
              </div>
              <button onClick={() => { setShowPostRequestModal(false); setEditingRequest(null); }} className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                <X size={15} className="text-foreground" />
              </button>
            </div>
          )}
        </div>

        {submitted ? (
          <div className="flex flex-col items-center px-8 py-10 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 size={40} className="text-green-500" />
            </div>
            <h3 className="text-foreground font-black text-xl mb-2">
              {editingRequest ? "Berhasil Diperbarui!" : "Permintaan Terpasang! 🎉"}
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
              {editingRequest ? "Papan permintaan Anda berhasil diperbarui." : "Permintaanmu sudah ditayangkan di Papan Permintaan. Penjual yang cocok akan segera menghubungimu!"}
            </p>
            <button onClick={() => { setShowPostRequestModal(false); setEditingRequest(null); }} className="w-full bg-primary text-white font-black py-3.5 rounded-2xl text-sm">
              Lihat Papan Permintaan
            </button>
          </div>
        ) : (
          <div className="overflow-y-auto flex-1 px-5 pb-8 space-y-4">
            {/* Title */}
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2 mt-2">Judul Permintaan <span className="text-primary">*</span></p>
              <div className={`bg-card border-2 rounded-2xl px-4 py-3 transition-colors ${error && !title ? "border-primary" : "border-border focus-within:border-primary/50"}`}>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Dicari Buku Kalkulator UMM..."
                  className="w-full text-sm text-foreground bg-transparent outline-none placeholder:text-muted-foreground"
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">Kategori <span className="text-primary">*</span></p>
              <div className="grid grid-cols-2 gap-2">
                {reqCategories.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => { setCategory(c); setError(""); }}
                    className="p-3.5 rounded-2xl border-2 text-center text-xs font-bold transition-all active:scale-[0.98] cursor-pointer"
                    style={{
                      borderColor: category === c ? "#c41230" : "rgba(0,0,0,0.08)",
                      background: category === c ? "rgba(196,18,48,0.05)" : "#fff",
                      color: category === c ? "#c41230" : "#6B7280"
                    }}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">Deskripsi Kebutuhan <span className="text-primary">*</span></p>
              <div className={`bg-card border-2 rounded-2xl px-4 py-3 transition-colors ${error && (!desc || desc.length < 10) ? "border-primary" : "border-border focus-within:border-primary/50"}`}>
                <textarea
                  rows={4}
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Jelaskan detail barang/jasa yang dicari, kondisi, spesifikasi..."
                  className="w-full text-sm text-foreground bg-transparent outline-none resize-none placeholder:text-muted-foreground leading-relaxed"
                />
              </div>
            </div>

            {/* Budget */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">Budget Min</p>
                <div className="bg-card border-2 border-border focus-within:border-primary/50 rounded-2xl px-4 py-3 transition-colors flex items-center">
                  <span className="text-xs font-bold text-muted-foreground mr-1.5">Rp</span>
                  <input
                    value={budgetMin}
                    onChange={(e) => setBudgetMin(e.target.value.replace(/\D/g, ""))}
                    placeholder="0"
                    className="w-full text-sm text-foreground bg-transparent outline-none"
                  />
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">Budget Max</p>
                <div className="bg-card border-2 border-border focus-within:border-primary/50 rounded-2xl px-4 py-3 transition-colors flex items-center">
                  <span className="text-xs font-bold text-muted-foreground mr-1.5">Rp</span>
                  <input
                    value={budgetMax}
                    onChange={(e) => setBudgetMax(e.target.value.replace(/\D/g, ""))}
                    placeholder="0"
                    className="w-full text-sm text-foreground bg-transparent outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Urgency */}
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">Tingkat Urgensi</p>
              <div className="grid grid-cols-3 gap-2">
                {urgencies.map((u) => (
                  <button
                    key={u.key}
                    type="button"
                    onClick={() => setUrgency(u.key)}
                    className="p-3 rounded-2xl border-2 text-center text-xs font-bold transition-all active:scale-[0.98] cursor-pointer"
                    style={{
                      borderColor: urgency === u.key ? u.color : "rgba(0,0,0,0.08)",
                      background: urgency === u.key ? u.color + "12" : "#fff",
                      color: urgency === u.key ? u.color : "#6B7280"
                    }}
                  >
                    {u.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Location */}
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">Lokasi COD</p>
              <div className="bg-card border-2 border-border focus-within:border-primary/50 rounded-2xl px-4 py-3 transition-colors">
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Contoh: Perpustakaan UMM, Gazebo GKB 1..."
                  className="w-full text-sm text-foreground bg-transparent outline-none placeholder:text-muted-foreground"
                />
              </div>
            </div>

            {error && <p className="text-primary text-[11px] flex items-center gap-1"><AlertCircle size={11} />{error}</p>}

            {/* Duration */}
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">Durasi Tayang</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRequestDuration("1")}
                  className="p-3 rounded-2xl border-2 text-left transition-all cursor-pointer"
                  style={{
                    borderColor: requestDuration === "1" ? "#F59E0B" : "rgba(0,0,0,0.1)",
                    background: requestDuration === "1" ? "rgba(245,158,11,0.06)" : "transparent",
                  }}
                >
                  <p className="font-bold text-xs text-foreground">1 Hari</p>
                  <p className="text-muted-foreground text-[10px] mb-1">Singkat & cepat</p>
                  <p className="font-black text-sm text-emerald-600">Gratis</p>
                </button>
                <button
                  type="button"
                  onClick={() => setRequestDuration("7")}
                  className="p-3 rounded-2xl border-2 text-left transition-all cursor-pointer"
                  style={{
                    borderColor: requestDuration === "7" ? "#F59E0B" : "rgba(0,0,0,0.1)",
                    background: requestDuration === "7" ? "rgba(245,158,11,0.06)" : "transparent",
                  }}
                >
                  <p className="font-bold text-xs text-foreground">&gt;3 Hari (7 Hari)</p>
                  <p className="text-muted-foreground text-[10px] mb-1">Tayang standar</p>
                  <p className="font-black text-sm text-amber-600">Rp 500</p>
                </button>
              </div>
            </div>

            {/* Fee info */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-amber-100 rounded-full flex items-center justify-center">
                  <Banknote size={14} className="text-amber-600" />
                </div>
                <div>
                  <p className="text-amber-800 font-bold text-xs">Biaya Pasang Permintaan</p>
                  <p className="text-amber-600 text-[10px]">Tayang {requestDuration === "1" ? "1 hari" : "7 hari"}</p>
                </div>
              </div>
              <p className="text-amber-700 font-black text-base">
                {requestDuration === "1" ? "Gratis" : "Rp 500"}
              </p>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-primary text-white font-black py-4 rounded-2xl text-base shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              style={{ opacity: loading ? 0.8 : 1 }}
            >
              {loading
                ? <><svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>Memposting...</>
                : submitted
                ? <><CheckCircle2 size={16} /> Tersimpan!</>
                : <><Banknote size={16} /> {requestDuration === "1" ? "Pasang Permintaan" : "Bayar Rp 500 & Pasang"}</>}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── SUGGESTION BOX MODAL ──
export function SuggestionBoxModal() {
  const { setShowSuggestionBox, profileAvatar } = useApp();
  const [category, setCategory] = useState("");
  const [message, setMessage] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const categories = [
    { id: "fitur", label: "Saran Fitur Baru", icon: Zap, color: "#8B5CF6" },
    { id: "bug", label: "Laporkan Bug / Error", icon: AlertCircle, color: "#EF4444" },
    { id: "ux", label: "Tampilan & Kemudahan", icon: Eye, color: "#3B82F6" },
    { id: "keamanan", label: "Keamanan Transaksi", icon: Shield, color: "#10B981" },
    { id: "konten", label: "Konten & Produk", icon: Package, color: "#F59E0B" },
    { id: "lainnya", label: "Lainnya", icon: MessageCircle, color: "#6B7280" },
  ];

  function handleSubmit() {
    if (!category) { setError("Pilih kategori saran terlebih dahulu"); return; }
    if (!message.trim() || message.length < 10) { setError("Saran minimal 10 karakter"); return; }
    setError("");
    setLoading(true);
    setTimeout(() => { setLoading(false); setSubmitted(true); }, 1200);
  }

  return (
    <div className="fixed inset-0 z-[90] flex flex-col justify-end" style={{ maxWidth: 430, margin: "0 auto" }}>
      <div className="absolute inset-0 bg-black/50" onClick={() => setShowSuggestionBox(false)} />
      <div className="relative bg-card rounded-t-3xl shadow-2xl max-h-[92vh] flex flex-col z-10">
        <div className="pt-4 pb-2 px-5 shrink-0">
          <div className="w-10 h-1 bg-border rounded-full mx-auto mb-4" />
          {!submitted && (
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-foreground font-black text-lg">Kotak Saran</h3>
                <p className="text-muted-foreground text-xs">Bantu kami jadi lebih baik</p>
              </div>
              <button onClick={() => setShowSuggestionBox(false)} className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                <X size={15} className="text-foreground" />
              </button>
            </div>
          )}
        </div>

        {submitted ? (
          <div className="flex flex-col items-center px-8 py-10 text-center">
            <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 size={40} className="text-purple-500" />
            </div>
            <h3 className="text-foreground font-black text-xl mb-2">Terima Kasih! 🙏</h3>
            <p className="text-muted-foreground text-sm leading-relaxed mb-2">
              Saran kamu sangat berarti bagi kami. Kami akan mempertimbangkan masukan ini untuk pengembangan Lapak Jas Merah.
            </p>
            <div className="bg-secondary rounded-2xl p-3.5 w-full mb-6 text-left">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-1">Kategori</p>
              <p className="text-foreground font-semibold text-sm">{categories.find((c) => c.id === category)?.label}</p>
            </div>
            <button onClick={() => setShowSuggestionBox(false)} className="w-full bg-primary text-white font-black py-3.5 rounded-2xl text-sm">
              Tutup
            </button>
          </div>
        ) : (
          <div className="overflow-y-auto flex-1 px-5 pb-8">
            {/* Category grid */}
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3 mt-2">Kategori Saran <span className="text-primary">*</span></p>
            <div className="grid grid-cols-3 gap-2 mb-5">
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => { setCategory(c.id); setError(""); }}
                  className="flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all active:scale-95 cursor-pointer"
                  style={{ borderColor: category === c.id ? c.color : "rgba(0,0,0,0.08)", background: category === c.id ? c.color + "10" : "#fff" }}
                >
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: c.color + "18" }}>
                    <c.icon size={16} style={{ color: c.color }} />
                  </div>
                  <span className="text-[10px] font-bold text-center leading-tight" style={{ color: category === c.id ? c.color : "#8a8a9a" }}>{c.label}</span>
                </button>
              ))}
            </div>

            {/* Message */}
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">Tulis Saranmu <span className="text-primary">*</span></p>
            <div className={`bg-card border-2 rounded-2xl px-4 py-3 mb-2 transition-colors ${error && message.length < 10 ? "border-primary" : "border-border focus-within:border-primary/50"}`}>
              <textarea
                rows={5}
                value={message}
                onChange={(e) => { setMessage(e.target.value); setError(""); }}
                maxLength={500}
                placeholder="Ceritakan ide, saran, atau keluhan kamu secara detail. Semakin detail semakin mudah kami tindaklanjuti..."
                className="w-full text-sm text-foreground bg-transparent outline-none resize-none placeholder:text-muted-foreground leading-relaxed"
              />
              <p className="text-[10px] text-muted-foreground text-right mt-1">{message.length}/500</p>
            </div>
            {error && <p className="text-primary text-[11px] mb-3 flex items-center gap-1"><AlertCircle size={11} />{error}</p>}

            {/* Anonymous toggle */}
            <div className="flex items-center justify-between bg-secondary rounded-2xl px-4 py-3.5 mb-5">
              <div>
                <p className="text-foreground font-bold text-sm">Kirim Anonim</p>
                <p className="text-muted-foreground text-[11px]">Identitasmu tidak akan ditampilkan</p>
              </div>
              <button onClick={() => setAnonymous((v) => !v)} className="cursor-pointer">
                {anonymous
                  ? <ToggleRight size={32} className="text-primary" />
                  : <ToggleLeft size={32} className="text-muted-foreground" />}
              </button>
            </div>

            {!anonymous && (
              <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-xl p-3.5 mb-5">
                <img src={profileAvatar || "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=80&h=80&fit=crop&auto=format"} alt="" className="w-8 h-8 rounded-full object-cover shrink-0" />
                <div>
                  <p className="text-blue-800 font-bold text-xs">Ahmad Rizky Pratama</p>
                  <p className="text-blue-600 text-[10px]">Saran dikirim atas namamu</p>
                </div>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-primary text-white font-black py-4 rounded-2xl text-base shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              style={{ opacity: loading ? 0.8 : 1 }}
            >
              {loading
                ? <><svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>Mengirim...</>
                : <><Send size={16} /> Kirim Saran</>}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
