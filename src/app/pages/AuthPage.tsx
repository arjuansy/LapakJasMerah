import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  User,
  BadgeCheck,
  AlertCircle,
  CheckCircle2,
  Info,
  X,
} from "lucide-react";
import { useApp } from "../context";
import { authService } from "../../services/authService";
import { useAuth } from "../../hooks/useAuth";

export default function AuthPage({ mode }: { mode: "login" | "register" }) {
  const navigate = useNavigate();
  const { setScreen } = useApp();
  const { user, profile } = useAuth();

  const isLogin = mode === "login";
  const [step, setStep] = useState<"form" | "otp">("form");
  const [form, setForm] = useState({ nim: "", email: "", name: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // Rate Limiting States
  const [resendCooldown, setResendCooldown] = useState(0);
  
  // OTP state
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpError, setOtpError] = useState("");
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Automatically redirect if already logged in
  useEffect(() => {
    if (user && profile) {
      if (profile.role === 'ADMIN' || profile.role === 'SUPER_ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate('/marketplace');
      }
    }
  }, [user, profile, navigate]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  function validate() {
    const e: Record<string, string> = {};
    if (!isLogin && !form.name.trim()) e.name = "Nama wajib diisi";
    if (!isLogin && (!form.nim.trim() || form.nim.length < 8)) e.nim = "NIM minimal 8 digit";
    if (!form.email.trim() || !form.email.includes("@")) e.email = "Email tidak valid";
    // Check webmail requirement
    if (!form.email.toLowerCase().endsWith("@webmail.umm.ac.id")) {
      e.email = "Harus menggunakan email @webmail.umm.ac.id";
    }
    return e;
  }

  async function handleSubmit() {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    // Throttle checks
    const lastRequest = localStorage.getItem('last_otp_request');
    if (lastRequest && Date.now() - parseInt(lastRequest) < 60000) {
      setErrors({ email: "Tunggu 60 detik sebelum meminta OTP lagi." });
      return;
    }

    setLoading(true);
    try {
      await authService.sendOTP(form.email, form.name, form.nim);
      localStorage.setItem('last_otp_request', Date.now().toString());
      setStep("otp");
      setResendCooldown(60);
      setErrors({});
    } catch (err: any) {
      if (err.message?.includes('rate limit')) {
         setErrors({ email: "Terlalu banyak percobaan. Coba lagi dalam 5 menit." });
      } else {
         setErrors({ email: err.message || "Gagal mengirim OTP. Pastikan email benar." });
      }
    } finally {
      setLoading(false);
    }
  }

  function handleOtpChange(val: string, idx: number) {
    const digit = val.replace(/\D/g, "").slice(-1);
    const next = [...otp];
    next[idx] = digit;
    setOtp(next);
    setOtpError("");
    if (digit && idx < 5) otpRefs.current[idx + 1]?.focus();
    if (!digit && idx > 0) otpRefs.current[idx - 1]?.focus();
  }

  function handleOtpKeyDown(e: React.KeyboardEvent, idx: number) {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
    }
  }

  function handleOtpPaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const next = [...otp];
    pasted.split("").forEach((d, i) => { next[i] = d; });
    setOtp(next);
    otpRefs.current[Math.min(pasted.length, 5)]?.focus();
  }

  async function handleVerifyOtp() {
    const entered = otp.join("");
    if (entered.length < 6) { setOtpError("Masukkan 6 digit kode OTP"); return; }
    
    setLoading(true);
    try {
      await authService.verifyOTP(form.email, entered);
      // Success! useAuth will catch the session and redirect automatically.
    } catch (err: any) {
      setOtpError(err.message || "Kode OTP salah atau kadaluarsa.");
      setOtp(["","","","","",""]);
      otpRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setLoading(true);
    try {
      await authService.sendOTP(form.email);
      setOtp(["","","","","",""]);
      setOtpError("");
      setResendCooldown(60);
      otpRefs.current[0]?.focus();
      localStorage.setItem('last_otp_request', Date.now().toString());
    } catch (err: any) {
      setOtpError(err.message || "Gagal mengirim ulang OTP.");
    } finally {
      setLoading(false);
    }
  }

  // ── OTP SCREEN ──
  if (step === "otp") {
    const maskedEmail = form.email.replace(/(.{2}).+(@.+)/, "$1****$2");
    return (
      <div className="min-h-screen bg-background flex flex-col" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <div className="relative overflow-hidden" style={{ background: "linear-gradient(150deg, #c41230 0%, #8b0d22 100%)", height: 200 }}>
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full opacity-10 bg-amber-400" />
          <div className="relative z-10 px-6 pt-12 flex items-center gap-3">
            <button onClick={() => { setStep("form"); setOtp(["","","","","",""]); setOtpError(""); }} className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
              <ArrowLeft size={18} className="text-white" />
            </button>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <span className="text-primary font-black text-[11px]">LJM</span>
              </div>
              <span className="text-white font-black text-base">Lapak Jas Merah</span>
            </div>
          </div>
          <div className="relative z-10 px-6 pt-5">
            <h1 className="text-white font-black text-2xl leading-tight">Verifikasi Email 📧</h1>
            <p className="text-white/70 text-sm mt-1">Kode OTP telah dikirim ke webmail UMM-mu</p>
          </div>
        </div>

        <div className="flex-1 px-5 pt-8 pb-10">
          <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4 flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c41230" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
              </div>
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Kode dikirim ke</p>
                <p className="text-sm font-black text-foreground">{maskedEmail}</p>
              </div>
            </div>
            <button onClick={() => setStep("form")} className="text-xs font-bold text-primary">Ubah</button>
          </div>

          <div className="mb-8">
            <label className="text-sm font-bold text-foreground block text-center mb-4">Masukkan 6 digit kode OTP</label>
            <div className="flex items-center justify-center gap-2">
              {otp.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => (otpRefs.current[i] = el)}
                  type="text"
                  inputMode="numeric"
                  value={d}
                  onChange={(e) => handleOtpChange(e.target.value, i)}
                  onKeyDown={(e) => handleOtpKeyDown(e, i)}
                  onPaste={handleOtpPaste}
                  className={`w-12 h-14 rounded-xl border-2 text-center text-xl font-black transition-colors bg-card text-foreground ${otpError ? "border-primary text-primary" : d ? "border-foreground" : "border-border focus:border-foreground"}`}
                  maxLength={1}
                />
              ))}
            </div>
            {otpError && <p className="text-primary text-[11px] mt-3 text-center flex items-center justify-center gap-1"><AlertCircle size={11} />{otpError}</p>}
            
            <div className="text-center mt-4">
              {resendCooldown > 0 ? (
                <p className="text-muted-foreground text-xs">Tidak menerima kode? Kirim ulang ({resendCooldown}s)</p>
              ) : (
                <button onClick={handleResend} className="text-primary font-bold text-xs" disabled={loading}>
                  Kirim ulang kode
                </button>
              )}
            </div>
          </div>

          <button
            onClick={handleVerifyOtp}
            disabled={loading}
            className="w-full bg-primary text-white font-black py-4 rounded-2xl text-base shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
            style={{ opacity: loading ? 0.8 : 1 }}
          >
            {loading ? (
              <><svg className="animate-spin w-5 h-5 text-white" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>Memverifikasi...</>
            ) : <><CheckCircle2 size={18} /> Verifikasi & Masuk</>}
          </button>
        </div>
      </div>
    );
  }

  // ── FORM SCREEN ──
  return (
    <div className="min-h-screen bg-background flex flex-col" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div className="relative overflow-hidden" style={{ background: "linear-gradient(150deg, #c41230 0%, #8b0d22 100%)", height: 220 }}>
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full opacity-10 bg-amber-400" />
        <div className="relative z-10 px-6 pt-12 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <span className="text-primary font-black text-[11px]">LJM</span>
            </div>
            <span className="text-white font-black text-base tracking-wide">Lapak Jas Merah</span>
          </div>
          <button onClick={() => setScreen("splash")} className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
            <X size={18} className="text-white" />
          </button>
        </div>
        <div className="relative z-10 px-6 pt-6">
          <h1 className="text-white font-black text-3xl leading-tight">{isLogin ? "Selamat\nDatang Kembali!" : "Mulai Jual Beli\ndi Kampus!"}</h1>
          <p className="text-white/80 text-sm mt-1.5 font-medium">{isLogin ? "Masuk dengan OTP untuk melanjutkan" : "Daftar dengan Webmail UMM kamu"}</p>
        </div>
      </div>

      <div className="flex-1 px-6 pt-8 pb-10">
        <div className="space-y-4">
          {!isLogin && (
            <>
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide block mb-1.5">Nama Lengkap</label>
                <div className={`flex items-center gap-2.5 bg-card rounded-2xl px-4 py-3.5 border-2 transition-colors ${errors.name ? "border-primary" : "border-border focus-within:border-primary/50"}`}>
                  <User size={18} className="text-muted-foreground" />
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => { setForm({ ...form, name: e.target.value }); setErrors({ ...errors, name: "" }); }}
                    placeholder="Contoh: Ahmad Rizky"
                    className="flex-1 text-sm font-semibold text-foreground bg-transparent outline-none placeholder:text-muted-foreground/50 placeholder:font-medium"
                  />
                </div>
                {errors.name && <p className="text-primary text-[10px] mt-1.5 font-bold flex items-center gap-1"><AlertCircle size={10} />{errors.name}</p>}
              </div>

              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide block mb-1.5">NIM Mahasiswa</label>
                <div className={`flex items-center gap-2.5 bg-card rounded-2xl px-4 py-3.5 border-2 transition-colors ${errors.nim ? "border-primary" : "border-border focus-within:border-primary/50"}`}>
                  <BadgeCheck size={18} className="text-muted-foreground" />
                  <input
                    type="number"
                    inputMode="numeric"
                    value={form.nim}
                    onChange={(e) => { setForm({ ...form, nim: e.target.value }); setErrors({ ...errors, nim: "" }); }}
                    placeholder="Contoh: 202110370311000"
                    className="flex-1 text-sm font-semibold text-foreground bg-transparent outline-none placeholder:text-muted-foreground/50 placeholder:font-medium"
                  />
                </div>
                {errors.nim && <p className="text-primary text-[10px] mt-1.5 font-bold flex items-center gap-1"><AlertCircle size={10} />{errors.nim}</p>}
              </div>
            </>
          )}

          <div>
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide block mb-1.5">Email Webmail UMM</label>
            <div className={`flex items-center gap-2.5 bg-card rounded-2xl px-4 py-3.5 border-2 transition-colors ${errors.email ? "border-primary" : "border-border focus-within:border-primary/50"}`}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
              <input
                type="email"
                value={form.email}
                onChange={(e) => { setForm({ ...form, email: e.target.value }); setErrors({ ...errors, email: "" }); }}
                placeholder="nama@webmail.umm.ac.id"
                className="flex-1 text-sm font-semibold text-foreground bg-transparent outline-none placeholder:text-muted-foreground/50 placeholder:font-medium"
              />
            </div>
            {errors.email && <p className="text-primary text-[10px] mt-1.5 font-bold flex items-center gap-1"><AlertCircle size={10} />{errors.email}</p>}
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-primary text-white font-black py-4 rounded-2xl text-base shadow-[0_8px_16px_-6px_rgba(196,18,48,0.4)] active:scale-95 transition-all mt-4 flex justify-center"
            style={{ opacity: loading ? 0.8 : 1 }}
          >
            {loading ? <svg className="animate-spin w-6 h-6" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg> : "Kirim OTP"}
          </button>
        </div>

        <div className="mt-8 text-center flex flex-col items-center">
          <p className="text-muted-foreground text-xs font-semibold">
            {isLogin ? "Belum punya akun?" : "Sudah punya akun?"}
          </p>
          <button
            onClick={() => {
              setErrors({});
              setForm({ nim: "", email: "", name: "" });
              navigate(isLogin ? "/register" : "/login");
            }}
            className="text-primary font-black text-sm mt-1"
          >
            {isLogin ? "Daftar Sekarang" : "Masuk di sini"}
          </button>
        </div>
      </div>
    </div>
  );
}
