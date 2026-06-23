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
import logoImg from "../../assets/logo.png";

type AuthStep = "form" | "otp" | "forgot" | "forgot_otp" | "reset_password";

export default function AuthPage({ mode, isAdminLogin }: { mode: "login" | "register", isAdminLogin?: boolean }) {
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
    // Jangan redirect otomatis jika ini halaman Admin Login (sesuai permintaan user: polos on load)
    if (isAdminLogin) return;

    if (user && profile && step !== "reset_password") {
      if (user.email && !user.email.toLowerCase().endsWith("@webmail.umm.ac.id") && user.email.toLowerCase() !== "arjuansyuhada@gmail.com") {
        authService.isEmailWhitelisted(user.email.toLowerCase()).then(isWhitelisted => {
          if (!isWhitelisted) {
            authService.logout().then(() => {
              toast.error("Akses ditolak: Hanya email @webmail.umm.ac.id atau yang terdaftar khusus yang diizinkan.", { duration: 5000 });
            });
          } else {
            if (!profile.nim) {
              navigate('/register/data-diri');
            } else if (profile.role === 'ADMIN' || profile.role === 'SUPER_ADMIN') {
              navigate('/admin/dashboard');
            } else {
              navigate('/marketplace');
            }
          }
        });
        return;
      }
      if (!profile.nim) {
        navigate('/register/data-diri');
      } else if (profile.role === 'ADMIN' || profile.role === 'SUPER_ADMIN') {
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

  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.includes("error=server_error")) {
      const params = new URLSearchParams(hash.replace("#", "?"));
      const errorDesc = params.get("error_description") || "";
      if (errorDesc.includes("Database error saving new user")) {
        toast.error("Gagal mendaftar: Hanya email @webmail.umm.ac.id yang diizinkan.", { duration: 5000 });
        window.history.replaceState(null, "", window.location.pathname + window.location.search);
      }
    }
  }, []);

  async function validate() {
    const e: Record<string, string> = {};
    if (!form.email.trim() || !form.email.includes("@")) e.email = "Email tidak valid";
    if (!form.password.trim() || form.password.length < 6) e.password = "Kata sandi minimal 6 karakter";
    // Check webmail requirement
    if (!form.email.toLowerCase().endsWith("@webmail.umm.ac.id") && form.email.toLowerCase() !== "arjuansyuhada@gmail.com") {
      const isWhitelisted = await authService.isEmailWhitelisted(form.email.toLowerCase());
      if (!isWhitelisted) {
        e.email = "Harus menggunakan email @webmail.umm.ac.id atau terdaftar khusus";
      }
    }
    return e;
  }

  async function handleSubmit() {
    const e = await validate();
    setErrors(e);
    if (Object.keys(e).length > 0) {
      if (e.email && e.email.includes("webmail.umm.ac.id")) {
        toast.error(e.email);
      }
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        const res = await authService.loginWithPassword(form.email, form.password);
        toast.success("Berhasil masuk!");
        try {
          if (res?.user) {
            const prof = await authService.getProfile(res.user.id);
            if (prof) {
              if (!prof.nim) navigate('/register/data-diri');
              else if (prof.role === 'ADMIN' || prof.role === 'SUPER_ADMIN') navigate('/admin/dashboard');
              else navigate('/marketplace');
            } else {
              navigate('/marketplace');
            }
          } else {
            navigate('/marketplace');
          }
        } catch (err) {
          navigate('/marketplace');
        }
      } else {
        // Register (Sends confirmation email OTP)
        await authService.registerWithPassword(form.email, form.password, form.name, form.nim);
        toast.success("Pendaftaran berhasil! Silakan periksa email Anda.");
        setStep("otp");
        setResendCooldown(60);
      }
    } catch (err: any) {
      let msg = err.message;
      if (msg === "{}" || !msg) msg = "Kesalahan internal pada server Supabase (Periksa skrip SQL & Trigger).";
      setErrors({ form: msg });
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
      <div className="min-h-screen bg-background flex flex-col lg:flex-row" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        {/* PANEL KIRI — hanya tampil desktop, brand/gradient */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center" style={{ background: "linear-gradient(150deg, #c41230 0%, #8b0d22 100%)" }}>
          <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full opacity-10 bg-amber-400" />
          <div className="relative z-10 px-12 text-white max-w-md">
            <h1 className="font-black text-4xl leading-tight mb-3">Mulai Jual Beli<br/>di Kampus!</h1>
            <p className="text-white/80 text-sm">Marketplace khusus mahasiswa UMM, aman dan terpercaya.</p>
          </div>
        </div>

        {/* PANEL KANAN — header gradient (mobile only) + form, lebar form dibatasi di desktop */}
        <div className="flex-1 flex flex-col lg:justify-center lg:items-center w-full">
          <div className="relative overflow-hidden w-full lg:hidden" style={{ background: "linear-gradient(150deg, #c41230 0%, #8b0d22 100%)", height: 200 }}>
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full opacity-10 bg-amber-400" />
          <div className="relative z-10 px-6 pt-12 flex items-center gap-3">
            <button onClick={() => { setStep(step === "forgot_otp" ? "forgot" : "form"); setOtp(["","","","","",""]); setOtpError(""); }} className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
              <ArrowLeft size={18} className="text-white" />
            </button>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <img src={logoImg} alt="LapakJasMerah" className="w-5 h-5 object-contain" />
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

          <div className="flex-1 lg:flex-none px-5 pt-8 pb-10 w-full lg:max-w-md lg:px-0 lg:pt-0">
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
      </div>
    );
  }

  // ── RESET PASSWORD SCREEN ──
  if (step === "reset_password") {
    return (
      <div className="min-h-screen bg-background flex flex-col lg:flex-row" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        {/* PANEL KIRI */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center" style={{ background: "linear-gradient(150deg, #c41230 0%, #8b0d22 100%)" }}>
          <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full opacity-10 bg-amber-400" />
          <div className="relative z-10 px-12 text-white max-w-md">
            <h1 className="font-black text-4xl leading-tight mb-3">Mulai Jual Beli<br/>di Kampus!</h1>
            <p className="text-white/80 text-sm">Marketplace khusus mahasiswa UMM, aman dan terpercaya.</p>
          </div>
        </div>

        {/* PANEL KANAN */}
        <div className="flex-1 flex flex-col lg:justify-center lg:items-center w-full">
          <div className="relative overflow-hidden w-full lg:hidden" style={{ background: "linear-gradient(150deg, #c41230 0%, #8b0d22 100%)", height: 200 }}>
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full opacity-10 bg-amber-400" />
          <div className="relative z-10 px-6 pt-12 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <img src={logoImg} alt="LapakJasMerah" className="w-5 h-5 object-contain" />
              </div>
              <span className="text-white font-black text-base tracking-wide">Lapak Jas Merah</span>
            </div>
          </div>
          <div className="relative z-10 px-6 pt-6">
            <h1 className="text-white font-black text-2xl leading-tight">Buat Sandi Baru 🔐</h1>
            <p className="text-white/80 text-sm mt-1.5 font-medium">Masukkan sandi baru untuk akun Anda</p>
          </div>
        </div>

          <div className="flex-1 lg:flex-none px-6 pt-8 pb-10 w-full lg:max-w-md lg:px-0 lg:pt-0">
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
      </div>
    );
  }

  // ── FORGOT PASSWORD REQUEST SCREEN ──
  if (step === "forgot") {
    return (
      <div className="min-h-screen bg-background flex flex-col lg:flex-row" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        {/* PANEL KIRI */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center" style={{ background: "linear-gradient(150deg, #c41230 0%, #8b0d22 100%)" }}>
          <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full opacity-10 bg-amber-400" />
          <div className="relative z-10 px-12 text-white max-w-md">
            <h1 className="font-black text-4xl leading-tight mb-3">Mulai Jual Beli<br/>di Kampus!</h1>
            <p className="text-white/80 text-sm">Marketplace khusus mahasiswa UMM, aman dan terpercaya.</p>
          </div>
        </div>

        {/* PANEL KANAN */}
        <div className="flex-1 flex flex-col lg:justify-center lg:items-center w-full">
          <div className="relative overflow-hidden w-full lg:hidden" style={{ background: "linear-gradient(150deg, #c41230 0%, #8b0d22 100%)", height: 200 }}>
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full opacity-10 bg-amber-400" />
          <div className="relative z-10 px-6 pt-12 flex items-center gap-3">
            <button onClick={() => { setStep("form"); setErrors({}); }} className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
              <ArrowLeft size={18} className="text-white" />
            </button>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <img src={logoImg} alt="LapakJasMerah" className="w-5 h-5 object-contain" />
              </div>
              <span className="text-white font-black text-base">Lapak Jas Merah</span>
            </div>
          </div>
          <div className="relative z-10 px-6 pt-6">
            <h1 className="text-white font-black text-2xl leading-tight">Lupa Sandi? 🔍</h1>
            <p className="text-white/80 text-sm mt-1.5 font-medium">Masukkan email untuk mendapatkan kode pemulihan</p>
          </div>
        </div>

          <div className="flex-1 lg:flex-none px-6 pt-8 pb-10 w-full lg:max-w-md lg:px-0 lg:pt-0">
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
      </div>
    );
  }

  // ── FORM SCREEN (Login/Register) ──
  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* PANEL KIRI */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center" style={{ background: isAdminLogin ? "linear-gradient(150deg, #111827 0%, #000000 100%)" : "linear-gradient(150deg, #c41230 0%, #8b0d22 100%)" }}>
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full opacity-10 bg-amber-400" />
        <div className="relative z-10 px-12 text-white max-w-md">
          <h1 className="font-black text-4xl leading-tight mb-3">Mulai Jual Beli<br/>di Kampus!</h1>
          <p className="text-white/80 text-sm">Marketplace khusus mahasiswa UMM, aman dan terpercaya.</p>
        </div>
      </div>

      {/* PANEL KANAN */}
      <div className="flex-1 flex flex-col lg:justify-center lg:items-center w-full">
        <div className="relative overflow-hidden w-full lg:hidden" style={{ background: isAdminLogin ? "linear-gradient(150deg, #111827 0%, #000000 100%)" : "linear-gradient(150deg, #c41230 0%, #8b0d22 100%)", height: 220 }}>
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full opacity-10 bg-amber-400" />
        <div className="relative z-10 px-6 pt-12 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <img src={logoImg} alt="LapakJasMerah" className="w-5 h-5 object-contain" />
            </div>
            <span className="text-white font-black text-base tracking-wide">Lapak Jas Merah {isAdminLogin && "Admin"}</span>
          </div>
          <button onClick={() => navigate("/")} className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
            <X size={18} className="text-white" />
          </button>
        </div>
        <div className="relative z-10 px-6 pt-6">
          <h1 className="text-white font-black text-3xl leading-tight">{isAdminLogin ? "Portal Admin\nLapak Jas Merah" : isLogin ? "Selamat\nDatang Kembali!" : "Mulai Jual Beli\ndi Kampus!"}</h1>
          <p className="text-white/80 text-sm mt-1.5 font-medium">{isLogin ? "Masuk dengan Kata Sandi Anda" : "Daftar dengan Webmail UMM kamu"}</p>
        </div>
      </div>

        <div className="flex-1 lg:flex-none px-6 pt-8 pb-10 w-full lg:max-w-md lg:px-0 lg:pt-0">
        <div className="space-y-4">
          {errors.form && (
            <div className="bg-primary/10 text-primary px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2">
              <AlertCircle size={16} />
              {errors.form}
            </div>
          )}

          {isLogin ? (
            <>
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
                
                <div className="flex justify-end mt-2">
                  <button 
                    type="button" 
                    onClick={() => { setErrors({}); setStep("forgot"); }}
                    className="text-xs font-bold text-primary hover:underline"
                  >
                    Lupa Sandi?
                  </button>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-primary text-white font-black py-4 rounded-2xl text-base shadow-[0_8px_16px_-6px_rgba(196,18,48,0.4)] active:scale-95 transition-all mt-4 flex justify-center"
                style={{ opacity: loading ? 0.8 : 1 }}
              >
                {loading ? <svg className="animate-spin w-6 h-6" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg> : "Masuk"}
              </button>
            </>
          ) : (
            <>
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide block mb-1.5">Email Webmail UMM / Khusus</label>
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
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-primary text-white font-black py-4 rounded-2xl text-base shadow-[0_8px_16px_-6px_rgba(196,18,48,0.4)] active:scale-95 transition-all mt-4 flex justify-center"
                style={{ opacity: loading ? 0.8 : 1 }}
              >
                {loading ? <svg className="animate-spin w-6 h-6" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg> : "Daftar Sekarang"}
              </button>

              <div className="relative flex items-center py-4">
                <div className="flex-grow border-t border-border"></div>
                <span className="flex-shrink-0 mx-4 text-muted-foreground text-xs font-bold uppercase">Atau</span>
                <div className="flex-grow border-t border-border"></div>
              </div>

              <button
                onClick={async () => {
                  try {
                    await authService.loginWithGoogle();
                  } catch (err: any) {
                    setErrors({ form: err.message || "Gagal masuk dengan Google" });
                  }
                }}
                className="w-full bg-card border-2 border-border text-foreground font-black py-4 rounded-2xl text-base shadow-[0_8px_16px_-6px_rgba(0,0,0,0.1)] active:scale-95 transition-all flex justify-center items-center gap-3 hover:bg-muted/50"
              >
                <svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                Daftar dengan Google
              </button>
            </>
          )}
        </div>

        <div className="mt-8 text-center flex flex-col items-center gap-5">
          {!isAdminLogin && (
            <div>
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
          )}

          {false && (
            <button
              onClick={() => navigate("/marketplace")}
              className="text-muted-foreground font-bold text-xs hover:text-foreground transition-colors py-2 px-6 rounded-full border-2 border-border/50 hover:border-border active:scale-95"
            >
              Lewati untuk lihat-lihat
            </button>
          )}
          </div>
        </div>
      </div>
    </div>
  );
}
