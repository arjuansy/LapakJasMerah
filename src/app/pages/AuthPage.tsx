import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  User,
  BadgeCheck,
  AlertCircle,
  CheckCircle2,
  X,
  Eye,
  EyeOff,
  Lock,
  Mail
} from "lucide-react";
import { useApp } from "../context";
import { authService } from "../../services/authService";
import { useAuth } from "../../hooks/useAuth";
import { toast } from "react-hot-toast";

type AuthStep = "form" | "otp" | "forgot" | "forgot_otp" | "reset_password";

export default function AuthPage({ mode }: { mode: "login" | "register" }) {
  const navigate = useNavigate();
  const { setScreen } = useApp();
  const { user, profile } = useAuth();

  const isLogin = mode === "login";
  const [step, setStep] = useState<AuthStep>("form");
  const [form, setForm] = useState({ nim: "", email: "", name: "", password: "", newPassword: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Rate Limiting States
  const [resendCooldown, setResendCooldown] = useState(0);
  
  // OTP state
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpError, setOtpError] = useState("");
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Automatically redirect if already logged in (only if not doing reset flow)
  useEffect(() => {
    if (user && profile && step !== "reset_password") {
      if (profile.role === 'ADMIN' || profile.role === 'SUPER_ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate('/marketplace');
      }
    }
  }, [user, profile, navigate, step]);

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
    if (!form.password.trim() || form.password.length < 6) e.password = "Kata sandi minimal 6 karakter";
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

    setLoading(true);
    try {
      if (isLogin) {
        await authService.loginWithPassword(form.email, form.password);
        toast.success("Berhasil masuk!");
      } else {
        // Register (Sends confirmation email OTP)
        await authService.registerWithPassword(form.email, form.password, form.name, form.nim);
        toast.success("Pendaftaran berhasil! Silakan periksa email Anda.");
        setStep("otp");
        setResendCooldown(60);
      }
    } catch (err: any) {
      setErrors({ form: err.message || "Terjadi kesalahan. Coba lagi." });
    } finally {
      setLoading(false);
    }
  }

  // OTP Handlers
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
      if (step === "forgot_otp") {
        await authService.verifyPasswordResetOTP(form.email, entered);
        toast.success("Verifikasi berhasil! Silakan buat sandi baru.");
        setStep("reset_password");
        setOtp(["","","","","",""]);
      } else {
        await authService.verifySignupOTP(form.email, entered);
        toast.success("Verifikasi berhasil! Anda sekarang masuk.");
      }
    } catch (err: any) {
      setOtpError(err.message || "Kode OTP salah atau kadaluarsa.");
      setOtp(["","","","","",""]);
      otpRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  }

  // Forgot Password Handlers
  async function handleForgotRequest() {
    if (!form.email.trim() || !form.email.includes("@")) {
      setErrors({ email: "Masukkan email Webmail UMM yang valid" });
      return;
    }
    setLoading(true);
    try {
      await authService.sendPasswordResetOTP(form.email);
      toast.success("Kode pemulihan telah dikirim ke email Anda!");
      setStep("forgot_otp");
      setResendCooldown(60);
    } catch (err: any) {
      setErrors({ form: err.message || "Gagal mengirim kode pemulihan." });
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdatePassword() {
    if (!form.newPassword || form.newPassword.length < 6) {
      setErrors({ newPassword: "Sandi baru minimal 6 karakter" });
      return;
    }
    setLoading(true);
    try {
      await authService.updatePassword(form.newPassword);
      toast.success("Sandi berhasil diperbarui!");
      setStep("form");
      setForm({ ...form, password: "", newPassword: "" });
      navigate('/login');
    } catch (err: any) {
      setErrors({ form: err.message || "Gagal memperbarui sandi." });
    } finally {
      setLoading(false);
    }
  }

  // ── OTP SCREEN (Registrasi & Forgot Password) ──
  if (step === "otp" || step === "forgot_otp") {
    const maskedEmail = form.email.replace(/(.{2}).+(@.+)/, "$1****$2");
    return (
      <div className="min-h-screen bg-background flex flex-col" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <div className="relative overflow-hidden" style={{ background: "linear-gradient(150deg, #c41230 0%, #8b0d22 100%)", height: 200 }}>
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full opacity-10 bg-amber-400" />
          <div className="relative z-10 px-6 pt-12 flex items-center gap-3">
            <button onClick={() => { setStep(step === "forgot_otp" ? "forgot" : "form"); setOtp(["","","","","",""]); setOtpError(""); }} className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
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
            <h1 className="text-white font-black text-2xl leading-tight">
              {step === "forgot_otp" ? "Kode Pemulihan 🔑" : "Verifikasi Email 📧"}
            </h1>
            <p className="text-white/70 text-sm mt-1">Kode OTP telah dikirim ke webmail UMM-mu</p>
          </div>
        </div>

        <div className="flex-1 px-5 pt-8 pb-10">
          <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4 flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <Mail size={16} className="text-primary" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Kode dikirim ke</p>
                <p className="text-sm font-black text-foreground">{maskedEmail}</p>
              </div>
            </div>
            <button onClick={() => setStep(step === "forgot_otp" ? "forgot" : "form")} className="text-xs font-bold text-primary">Ubah</button>
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
              <p className="text-muted-foreground text-xs">Pastikan cek folder Spam atau Junk</p>
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
            ) : <><CheckCircle2 size={18} /> Verifikasi Kode</>}
          </button>
        </div>
      </div>
    );
  }

  // ── RESET PASSWORD SCREEN ──
  if (step === "reset_password") {
    return (
      <div className="min-h-screen bg-background flex flex-col" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <div className="relative overflow-hidden" style={{ background: "linear-gradient(150deg, #c41230 0%, #8b0d22 100%)", height: 200 }}>
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full opacity-10 bg-amber-400" />
          <div className="relative z-10 px-6 pt-12 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <span className="text-primary font-black text-[11px]">LJM</span>
              </div>
              <span className="text-white font-black text-base tracking-wide">Lapak Jas Merah</span>
            </div>
          </div>
          <div className="relative z-10 px-6 pt-6">
            <h1 className="text-white font-black text-2xl leading-tight">Buat Sandi Baru 🔐</h1>
            <p className="text-white/80 text-sm mt-1.5 font-medium">Masukkan sandi baru untuk akun Anda</p>
          </div>
        </div>

        <div className="flex-1 px-6 pt-8 pb-10">
          <div className="space-y-4">
            {errors.form && (
              <div className="bg-primary/10 text-primary px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2">
                <AlertCircle size={16} />
                {errors.form}
              </div>
            )}
            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide block mb-1.5">Sandi Baru</label>
              <div className={`flex items-center gap-2.5 bg-card rounded-2xl px-4 py-3.5 border-2 transition-colors ${errors.newPassword ? "border-primary" : "border-border focus-within:border-primary/50"}`}>
                <Lock size={18} className="text-muted-foreground" />
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={form.newPassword}
                  onChange={(e) => { setForm({ ...form, newPassword: e.target.value }); setErrors({ ...errors, newPassword: "" }); }}
                  placeholder="Minimal 6 karakter"
                  className="flex-1 text-sm font-semibold text-foreground bg-transparent outline-none placeholder:text-muted-foreground/50 placeholder:font-medium"
                />
                <button 
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  type="button"
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.newPassword && <p className="text-primary text-[10px] mt-1.5 font-bold flex items-center gap-1"><AlertCircle size={10} />{errors.newPassword}</p>}
            </div>

            <button
              onClick={handleUpdatePassword}
              disabled={loading}
              className="w-full bg-primary text-white font-black py-4 rounded-2xl text-base shadow-lg active:scale-95 transition-all mt-4 flex items-center justify-center gap-2"
              style={{ opacity: loading ? 0.8 : 1 }}
            >
              {loading ? <svg className="animate-spin w-5 h-5 text-white" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg> : <><CheckCircle2 size={18} /> Simpan Sandi Baru</>}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── FORGOT PASSWORD REQUEST SCREEN ──
  if (step === "forgot") {
    return (
      <div className="min-h-screen bg-background flex flex-col" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <div className="relative overflow-hidden" style={{ background: "linear-gradient(150deg, #c41230 0%, #8b0d22 100%)", height: 200 }}>
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full opacity-10 bg-amber-400" />
          <div className="relative z-10 px-6 pt-12 flex items-center gap-3">
            <button onClick={() => { setStep("form"); setErrors({}); }} className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
              <ArrowLeft size={18} className="text-white" />
            </button>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <span className="text-primary font-black text-[11px]">LJM</span>
              </div>
              <span className="text-white font-black text-base">Lapak Jas Merah</span>
            </div>
          </div>
          <div className="relative z-10 px-6 pt-6">
            <h1 className="text-white font-black text-2xl leading-tight">Lupa Sandi? 🔍</h1>
            <p className="text-white/80 text-sm mt-1.5 font-medium">Masukkan email untuk mendapatkan kode pemulihan</p>
          </div>
        </div>

        <div className="flex-1 px-6 pt-8 pb-10">
          <div className="space-y-4">
            {errors.form && (
              <div className="bg-primary/10 text-primary px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2">
                <AlertCircle size={16} />
                {errors.form}
              </div>
            )}
            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide block mb-1.5">Email Webmail UMM</label>
              <div className={`flex items-center gap-2.5 bg-card rounded-2xl px-4 py-3.5 border-2 transition-colors ${errors.email ? "border-primary" : "border-border focus-within:border-primary/50"}`}>
                <Mail size={18} className="text-muted-foreground" />
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
              onClick={handleForgotRequest}
              disabled={loading}
              className="w-full bg-primary text-white font-black py-4 rounded-2xl text-base shadow-[0_8px_16px_-6px_rgba(196,18,48,0.4)] active:scale-95 transition-all mt-4 flex justify-center"
              style={{ opacity: loading ? 0.8 : 1 }}
            >
              {loading ? <svg className="animate-spin w-6 h-6" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg> : "Kirim Kode Pemulihan"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── FORM SCREEN (Login/Register) ──
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
          <p className="text-white/80 text-sm mt-1.5 font-medium">{isLogin ? "Masuk dengan Kata Sandi Anda" : "Daftar dengan Webmail UMM kamu"}</p>
        </div>
      </div>

      <div className="flex-1 px-6 pt-8 pb-10">
        <div className="space-y-4">
          {errors.form && (
            <div className="bg-primary/10 text-primary px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2">
              <AlertCircle size={16} />
              {errors.form}
            </div>
          )}

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
              <Mail size={18} className="text-muted-foreground" />
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

          <div>
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide block mb-1.5">Kata Sandi</label>
            <div className={`flex items-center gap-2.5 bg-card rounded-2xl px-4 py-3.5 border-2 transition-colors ${errors.password ? "border-primary" : "border-border focus-within:border-primary/50"}`}>
              <Lock size={18} className="text-muted-foreground" />
              <input
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(e) => { setForm({ ...form, password: e.target.value }); setErrors({ ...errors, password: "" }); }}
                placeholder="Minimal 6 karakter"
                className="flex-1 text-sm font-semibold text-foreground bg-transparent outline-none placeholder:text-muted-foreground/50 placeholder:font-medium"
              />
              <button 
                onClick={() => setShowPassword(!showPassword)}
                className="text-muted-foreground hover:text-foreground transition-colors"
                type="button"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <p className="text-primary text-[10px] mt-1.5 font-bold flex items-center gap-1"><AlertCircle size={10} />{errors.password}</p>}
            
            {isLogin && (
              <div className="flex justify-end mt-2">
                <button 
                  type="button" 
                  onClick={() => { setErrors({}); setStep("forgot"); }}
                  className="text-xs font-bold text-primary hover:underline"
                >
                  Lupa Sandi?
                </button>
              </div>
            )}
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-primary text-white font-black py-4 rounded-2xl text-base shadow-[0_8px_16px_-6px_rgba(196,18,48,0.4)] active:scale-95 transition-all mt-4 flex justify-center"
            style={{ opacity: loading ? 0.8 : 1 }}
          >
            {loading ? <svg className="animate-spin w-6 h-6" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg> : (isLogin ? "Masuk" : "Daftar Akun")}
          </button>
        </div>

        <div className="mt-8 text-center flex flex-col items-center">
          <p className="text-muted-foreground text-xs font-semibold">
            {isLogin ? "Belum punya akun?" : "Sudah punya akun?"}
          </p>
          <button
            onClick={() => {
              setErrors({});
              setForm({ nim: "", email: "", name: "", password: "", newPassword: "" });
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
