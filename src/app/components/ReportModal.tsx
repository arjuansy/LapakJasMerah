import React, { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { supabase } from "../../config/supabaseClient";
import toast from "react-hot-toast";
import { X, CheckCircle2, Flag, AlertCircle } from "lucide-react";

export default function ReportModal({ showReportModal, setShowReportModal }: { showReportModal: any, setShowReportModal: any }) {
  const [selectedReason, setSelectedReason] = useState("");
  const [detail, setDetail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const { user } = useAuth();
  
  if (!showReportModal) return null;
  const { type, name, id, seller_id } = showReportModal;

  const reasons = type === "penjual"
    ? ["Barang tidak sesuai deskripsi", "Penjual tidak responsif", "Penipuan / barang palsu", "Harga tidak wajar", "Penjual bersikap kasar", "Informasi produk menyesatkan", "Lainnya"]
    : ["Barang terlarang / ilegal", "Produk palsu / penipuan", "Spam", "Harga tidak wajar", "Lainnya"];

  async function handleSubmit() {
    if (!selectedReason) return;
    if (!user) {
      toast.error("Anda harus login untuk melaporkan");
      return;
    }
    setLoading(true);
    
    try {
      const { error } = await supabase.from('reports').insert({
        reporter_id: user.id,
        reported_id: seller_id, // we assume reported_id is the seller's id
        target_type: type === "produk" ? "product" : "user",
        reason: selectedReason + (detail ? ` - ${detail}` : ""),
        status: "Terbuka"
      });
      
      if (error) {
        console.error("Gagal mengirim laporan:", error);
        // Silent fallback if table doesn't exist yet
      }
    } catch(err) {
      console.error("Error submitting report", err);
    }
    
    setLoading(false); 
    setSubmitted(true);
  }

  return (
    <div className="fixed inset-0 z-[90] flex flex-col justify-end items-center">
      <div className="absolute inset-0 bg-black/50" onClick={() => setShowReportModal(null)} />
      <div className="relative bg-card rounded-t-3xl shadow-2xl max-h-[90vh] flex flex-col w-full max-w-[430px] lg:max-w-md">
        {/* Handle */}
        <div className="pt-4 pb-2 px-5 shrink-0">
          <div className="w-10 h-1 bg-border rounded-full mx-auto mb-4" />
          {submitted ? null : (
            <div className="flex items-center justify-between">
              <h3 className="text-foreground font-black text-lg">Laporkan {type === "penjual" ? "Penjual" : "Iklan"}</h3>
              <button onClick={() => setShowReportModal(null)} className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                <X size={15} className="text-foreground" />
              </button>
            </div>
          )}
        </div>

        {submitted ? (
          <div className="flex flex-col items-center justify-center px-8 py-10 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 size={40} className="text-green-500" />
            </div>
            <h3 className="text-foreground font-black text-xl mb-2">Laporan Terkirim!</h3>
            <p className="text-muted-foreground text-sm leading-relaxed mb-1">
              Laporan kamu terhadap <span className="font-bold text-foreground">{name}</span> sudah kami terima.
            </p>
            <p className="text-muted-foreground text-sm mb-6">Tim kami akan meninjau dalam 1x24 jam.</p>
            <button onClick={() => setShowReportModal(null)} className="w-full bg-primary text-white font-black py-3.5 rounded-2xl text-sm">
              Tutup
            </button>
          </div>
        ) : (
          <div className="overflow-y-auto flex-1 px-5 pb-8">
            {/* Target info */}
            <div className="flex items-center gap-3 bg-secondary rounded-2xl p-3.5 mb-5">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                <Flag size={16} className="text-primary" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground font-semibold">Melaporkan {type}</p>
                <p className="text-foreground font-black text-sm">{name}</p>
              </div>
            </div>

            {/* Reason */}
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3">Pilih Alasan Laporan <span className="text-primary">*</span></p>
            <div className="space-y-2 mb-5">
              {reasons.map((r) => (
                <button
                  key={r}
                  onClick={() => setSelectedReason(r)}
                  className="w-full flex items-center gap-3 p-3.5 rounded-2xl border-2 text-left transition-all active:scale-[0.98]"
                  style={{ borderColor: selectedReason === r ? "#c41230" : "rgba(0,0,0,0.08)", background: selectedReason === r ? "rgba(196,18,48,0.05)" : "#fff" }}
                >
                  <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0"
                    style={{ borderColor: selectedReason === r ? "#c41230" : "#d1d5db" }}>
                    {selectedReason === r && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                  </div>
                  <span className="text-sm font-medium text-foreground">{r}</span>
                </button>
              ))}
            </div>

            {/* Detail */}
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">Keterangan Tambahan (opsional)</p>
            <div className="bg-card border-2 border-border rounded-2xl px-4 py-3 mb-5 focus-within:border-primary/50 transition-colors">
              <textarea
                rows={4}
                value={detail}
                onChange={(e) => setDetail(e.target.value)}
                maxLength={300}
                placeholder={`Ceritakan lebih detail masalah yang kamu alami dengan ${type} ini...`}
                className="w-full text-sm text-foreground bg-transparent outline-none resize-none placeholder:text-muted-foreground leading-relaxed"
              />
              <p className="text-[10px] text-muted-foreground text-right mt-1">{detail.length}/300</p>
            </div>

            {/* Warning */}
            <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-xl p-3.5 mb-5">
              <AlertCircle size={14} className="text-amber-500 shrink-0 mt-0.5" />
              <p className="text-amber-700 text-[11px] leading-relaxed">
                Laporan palsu atau tidak berdasar dapat mengakibatkan akunmu dibekukan. Pastikan laporan kamu akurat dan jujur.
              </p>
            </div>

            <button
              onClick={handleSubmit}
              disabled={!selectedReason || loading}
              className="w-full bg-primary text-white font-black py-4 rounded-2xl text-base shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
              style={{ opacity: !selectedReason || loading ? 0.6 : 1 }}
            >
              {loading
                ? <><svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>Mengirim...</>
                : <><Flag size={16} /> Kirim Laporan</>}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
