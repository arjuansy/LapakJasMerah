import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  User,
  BadgeCheck,
  Eye,
  Lock,
  AlertCircle,
  CheckCircle2,
  Info,
  X,
} from "lucide-react";
import { useApp } from "../context";
import api from "../api";
import { supabase } from "../../config/supabaseClient";
import logo from "../../assets/logo.png";

export default function AuthPage({ mode }: { mode: "login" | "register" }) {
  const navigate = useNavigate();

  const { setScreen } = useApp();

  const isLogin = mode === "login";
  const [step, setStep] = useState<"form" | "otp" | "forgot" | "forgot-otp" | "forgot-reset">("form");
  const [form, setForm] = useState({ nim: "", email: "", password: "", name: "", confirmPassword: "" });
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
  const [showNewPass, setShowNewPass] = useState(false);
  const [showNewConfirm, setShowNewConfirm] = useState(false);
  const [forgotError, setForgotError] = useState("");
  const [resetError, setResetError] = useState("");

  // OTP state
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpError, setOtpError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

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
    if (!isLogin && !form.email.toLowerCase().endsWith("@webmail.umm.ac.id"))
      e.email = "Harus menggunakan email @webmail.umm.ac.id";
    if (!form.password.trim() || form.password.length < 6) e.password = "Password minimal 6 karakter";
    if (!isLogin && form.password !== form.confirmPassword) e.confirmPassword = "Password tidak cocok";
    return e;
  }

  function handleSubmit() {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    if (!isLogin) {
      setLoading(true);
      supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: { name: form.name, nim: form.nim }
        }
      }).then(({ data, error }) => {
        setLoading(false);
        if (error) {
          setErrors({ email: error.message });
          return;
        }
        setStep("otp");
        setResendCooldown(60);
      });
    } else {
      setLoading(true);
      supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password
      }).then(({ data, error }) => {
        setLoading(false);
        if (error) {
          setErrors({ email: "Email atau password salah" });
          return;
        }
        localStorage.setItem("userInfo", JSON.stringify({
          token: data.session?.access_token,
          id: data.user?.id,
          name: data.user?.user_metadata?.name,
          email: data.user?.email,
          role: "BUYER"
        }));
        navigate("/marketplace");
      });
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

  function handleVerifyOtp() {
    const entered = otp.join("");
    if (entered.length < 6) { setOtpError("Masukkan 6 digit kode OTP"); return; }
    
    setLoading(true);
    supabase.auth.verifyOtp({
      email: form.email,
      token: entered,
      type: 'signup'
    }).then(({ data, error }) => {
      setLoading(false);
      if (error) {
        setOtpError(error.message || "Kode OTP salah. Coba lagi.");
        setOtp(["","","","","",""]); 
        otpRefs.current[0]?.focus(); 
        return;
      }
      
      localStorage.setItem("userInfo", JSON.stringify({
        token: data.session?.access_token,
        id: data.user?.id,
        name: data.user?.user_metadata?.name,
        email: data.user?.email,
        role: "BUYER"
      }));
      navigate("/marketplace");
    });
  }

  function handleResend() {
    supabase.auth.resend({ type: 'signup', email: form.email });
    setOtp(["","","","","",""]);
    setOtpError("");
    setResendCooldown(60);
    otpRefs.current[0]?.focus();
  }

  // ── OTP SCREEN ──
  if (step === "otp") {
    const maskedEmail = form.email.replace(/(.{2}).+(@.+)/, "$1****$2");
    return (
      <>
        {otpNotificationEl}
        <div className="min-h-screen bg-background flex flex-col" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        {/* Header */}
        <div className="relative overflow-hidden" style={{ background: "linear-gradient(150deg, #c41230 0%, #8b0d22 100%)", height: 200 }}>
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full opacity-10 bg-amber-400" />
          <div className="relative z-10 px-6 pt-12 flex items-center gap-3">
            <button onClick={() => { setStep("form"); setOtp(["","","","","",""]); setOtpError(""); }} className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
              <ArrowLeft size={18} className="text-white" />
            </button>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center overflow-hidden">
                <img src={logo} alt="Logo" className="w-full h-full object-cover" />
              </div>
              <span className="text-white font-black text-base">LapakJasMerah</span>
            </div>
          </div>
          <div className="relative z-10 px-6 pt-5">
            <h1 className="text-white font-black text-2xl leading-tight">Verifikasi Email 📧</h1>
            <p className="text-white/70 text-sm mt-1">Kode OTP telah dikirim ke webmail UMM-mu</p>
          </div>
        </div>

        <div className="flex-1 px-5 pt-8 pb-10">
          {/* Email info */}
          <div className="bg-secondary border border-primary/20 rounded-2xl p-4 flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c41230" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground font-medium">Kode dikirim ke</p>
              <p className="text-foreground font-bold text-sm truncate">{maskedEmail}</p>
            </div>
            <button onClick={() => setStep("form")} className="text-primary text-xs font-bold shrink-0">Ubah</button>
          </div>

          {/* OTP boxes */}
          <p className="text-foreground font-bold text-sm text-center mb-5">Masukkan 6 digit kode OTP</p>
          <div className="flex justify-center gap-3 mb-3" onPaste={handleOtpPaste}>
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={(el) => { otpRefs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(e.target.value, i)}
                onKeyDown={(e) => handleOtpKeyDown(e, i)}
                className="text-center text-xl font-black text-foreground bg-card rounded-2xl outline-none transition-all"
                style={{
                  width: 46, height: 56,
                  border: otpError ? "2px solid #c41230" : digit ? "2px solid #c41230" : "2px solid rgba(0,0,0,0.12)",
                  boxShadow: digit ? "0 0 0 3px rgba(196,18,48,0.12)" : "none",
                }}
              />
            ))}
          </div>

          {/* Error */}
          {otpError && (
            <p className="text-primary text-xs font-semibold text-center flex items-center justify-center gap-1 mb-4">
              <AlertCircle size={12} /> {otpError}
            </p>
          )}

          {/* Timer & resend */}
          <div className="flex items-center justify-center gap-1 mb-8 mt-3">
            <p className="text-muted-foreground text-sm">Tidak menerima kode?</p>
            {resendCooldown > 0 ? (
              <span className="text-muted-foreground text-sm font-bold">Kirim ulang ({resendCooldown}s)</span>
            ) : (
              <button onClick={handleResend} className="text-primary text-sm font-black">Kirim Ulang</button>
            )}
          </div>

          {/* Info hint */}
          <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-xl p-3 mb-6">
            <Info size={14} className="text-blue-500 shrink-0 mt-0.5" />
            <p className="text-blue-700 text-[11px] leading-relaxed">
              Cek inbox webmail UMM kamu di <span className="font-bold">webmail.umm.ac.id</span>. Kode berlaku selama <span className="font-bold">5 menit</span>. Untuk demo, gunakan kode <span className="font-black text-blue-800">123456</span>.
            </p>
          </div>

          {/* Verify button */}
          <button
            onClick={handleVerifyOtp}
            disabled={loading || otp.join("").length < 6}
            className="w-full bg-primary text-white font-black py-4 rounded-2xl text-base shadow-lg transition-all flex items-center justify-center gap-2"
            style={{ opacity: loading || otp.join("").length < 6 ? 0.6 : 1 }}
          >
            {loading ? (
              <>
                <svg className="animate-spin w-5 h-5 text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                </svg>
                Memverifikasi...
              </>
            ) : (
              <><CheckCircle2 size={18} /> Verifikasi & Buat Akun</>
            )}
          </button>
        </div>
      </div>
    </>
  );
}

  // ── FORGOT PASSWORD: EMAIL SCREEN ──
  if (step === "forgot") {
    return (
      <>
        {otpNotificationEl}
        <div className="min-h-screen bg-background flex flex-col" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <div className="relative overflow-hidden" style={{ background: "linear-gradient(150deg, #c41230 0%, #8b0d22 100%)", height: 220 }}>
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full opacity-10 bg-amber-400" />
          <div className="relative z-10 px-6 pt-12 flex items-center gap-3">
            <button onClick={() => { setStep("form"); setForgotEmail(""); setForgotError(""); }} className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
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
            <h1 className="text-white font-black text-2xl leading-tight">Lupa Password 🔑</h1>
            <p className="text-white/70 text-sm mt-1">Masukkan email webmail UMM untuk reset password</p>
          </div>
        </div>

        <div className="flex-1 px-5 pt-8 pb-10">
          {/* Step dots */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {["Email", "Kode OTP", "Password Baru"].map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black"
                    style={{ background: i === 0 ? "#c41230" : "rgba(0,0,0,0.08)", color: i === 0 ? "#fff" : "#8a8a9a" }}>
                    {i + 1}
                  </div>
                  <span className="text-xs font-semibold" style={{ color: i === 0 ? "#c41230" : "#8a8a9a" }}>{s}</span>
                </div>
                {i < 2 && <div className="w-4 h-px bg-border" />}
              </div>
            ))}
          </div>

          <div className="space-y-5">
            <div className="bg-secondary rounded-2xl p-4 flex items-start gap-3">
              <Info size={16} className="text-primary shrink-0 mt-0.5" />
              <p className="text-foreground text-sm leading-relaxed">
                Kode OTP akan dikirim ke <span className="font-bold">email webmail UMM</span> kamu. Pastikan kamu masih bisa mengakses email tersebut.
              </p>
            </div>

            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide block mb-1.5">
                Email Webmail UMM
              </label>
              <div className={`flex items-center gap-2 bg-card rounded-2xl px-4 py-3.5 border-2 transition-colors ${forgotError ? "border-primary" : "border-border focus-within:border-primary/50"}`}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground shrink-0"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => { setForgotEmail(e.target.value); setForgotError(""); }}
                  placeholder="nama@webmail.umm.ac.id"
                  className="flex-1 text-sm text-foreground bg-transparent outline-none placeholder:text-muted-foreground"
                />
              </div>
              {forgotError && <p className="text-primary text-[11px] mt-1 flex items-center gap-1"><AlertCircle size={11} />{forgotError}</p>}
            </div>

            <button
              onClick={() => {
                if (!forgotEmail.trim()) { setForgotError("Email wajib diisi"); return; }
                if (!forgotEmail.toLowerCase().endsWith("@webmail.umm.ac.id")) { setForgotError("Harus menggunakan email @webmail.umm.ac.id"); return; }
                setLoading(true);
                const code = Math.floor(100000 + Math.random() * 900000).toString();
                setCurrentOtp(code);
                setTimeout(() => {
                  setLoading(false);
                  setStep("forgot-otp");
                  setOtp(["","","","","",""]);
                  setOtpError("");
                  setResendCooldown(60);
                  setTimeout(() => {
                    setShowOtpNotification(true);
                  }, 500);
                }, 1000);
              }}
              disabled={loading}
              className="w-full bg-primary text-white font-black py-4 rounded-2xl text-base shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
              style={{ opacity: loading ? 0.8 : 1 }}
            >
              {loading ? (
                <><svg className="animate-spin w-5 h-5 text-white" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>Mengirim OTP...</>
              ) : "Kirim Kode OTP →"}
            </button>

            <button onClick={() => { setStep("form"); setForgotEmail(""); setForgotError(""); }} className="w-full text-center text-muted-foreground text-sm">
              Kembali ke <span className="text-primary font-bold">Masuk</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

  // ── FORGOT PASSWORD: OTP SCREEN ──
  if (step === "forgot-otp") {
    const maskedForgotEmail = forgotEmail.replace(/(.{2}).+(@.+)/, "$1****$2");
    return (
      <>
        {otpNotificationEl}
        <div className="min-h-screen bg-background flex flex-col" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <div className="relative overflow-hidden" style={{ background: "linear-gradient(150deg, #c41230 0%, #8b0d22 100%)", height: 200 }}>
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full opacity-10 bg-amber-400" />
          <div className="relative z-10 px-6 pt-12 flex items-center gap-3">
            <button onClick={() => { setStep("forgot"); setOtp(["","","","","",""]); setOtpError(""); }} className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
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
            <h1 className="text-white font-black text-2xl leading-tight">Verifikasi OTP 📧</h1>
            <p className="text-white/70 text-sm mt-1">Masukkan kode yang dikirim ke webmail-mu</p>
          </div>
        </div>

        <div className="flex-1 px-5 pt-8 pb-10">
          {/* Step dots */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {["Email", "Kode OTP", "Password Baru"].map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black"
                    style={{ background: i <= 1 ? "#c41230" : "rgba(0,0,0,0.08)", color: i <= 1 ? "#fff" : "#8a8a9a" }}>
                    {i < 1 ? <CheckCircle2 size={13} /> : i + 1}
                  </div>
                  <span className="text-xs font-semibold" style={{ color: i <= 1 ? "#c41230" : "#8a8a9a" }}>{s}</span>
                </div>
                {i < 2 && <div className="w-4 h-px" style={{ background: i < 1 ? "#c41230" : "#e5e7eb" }} />}
              </div>
            ))}
          </div>

          {/* Email chip */}
          <div className="bg-secondary border border-primary/20 rounded-2xl p-4 flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c41230" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground font-medium">Kode dikirim ke</p>
              <p className="text-foreground font-bold text-sm truncate">{maskedForgotEmail}</p>
            </div>
            <button onClick={() => setStep("forgot")} className="text-primary text-xs font-bold shrink-0">Ubah</button>
          </div>

          <p className="text-foreground font-bold text-sm text-center mb-5">Masukkan 6 digit kode OTP</p>
          <div className="flex justify-center gap-3 mb-3" onPaste={handleOtpPaste}>
            {otp.map((digit, i) => (
              <input key={i} ref={(el) => { otpRefs.current[i] = el; }} type="text" inputMode="numeric" maxLength={1}
                value={digit} onChange={(e) => handleOtpChange(e.target.value, i)} onKeyDown={(e) => handleOtpKeyDown(e, i)}
                className="text-center text-xl font-black text-foreground bg-card rounded-2xl outline-none transition-all"
                style={{ width: 46, height: 56, border: otpError ? "2px solid #c41230" : digit ? "2px solid #c41230" : "2px solid rgba(0,0,0,0.12)", boxShadow: digit ? "0 0 0 3px rgba(196,18,48,0.12)" : "none" }} />
            ))}
          </div>

          {otpError && <p className="text-primary text-xs font-semibold text-center flex items-center justify-center gap-1 mb-2"><AlertCircle size={12} /> {otpError}</p>}

          <div className="flex items-center justify-center gap-1 mb-8 mt-3">
            <p className="text-muted-foreground text-sm">Tidak menerima kode?</p>
            {resendCooldown > 0
              ? <span className="text-muted-foreground text-sm font-bold">Kirim ulang ({resendCooldown}s)</span>
              : <button onClick={handleResend} className="text-primary text-sm font-black">Kirim Ulang</button>}
          </div>

          <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-xl p-3 mb-6">
            <Info size={14} className="text-blue-500 shrink-0 mt-0.5" />
            <p className="text-blue-700 text-[11px] leading-relaxed">
              Cek inbox webmail UMM di <span className="font-bold">webmail.umm.ac.id</span>. Kode berlaku <span className="font-bold">5 menit</span>. Demo: gunakan <span className="font-black text-blue-800">123456</span>.
            </p>
          </div>

          <button
            onClick={() => {
              const entered = otp.join("");
              if (entered.length < 6) { setOtpError("Masukkan 6 digit kode OTP"); return; }
              if (entered !== currentOtp && entered !== "123456") { setOtpError("Kode OTP salah. Coba lagi."); setOtp(["","","","","",""]); otpRefs.current[0]?.focus(); return; }
              setStep("forgot-reset");
            }}
            disabled={otp.join("").length < 6}
            className="w-full bg-primary text-white font-black py-4 rounded-2xl text-base shadow-lg flex items-center justify-center gap-2"
            style={{ opacity: otp.join("").length < 6 ? 0.6 : 1 }}
          >
            <CheckCircle2 size={18} /> Verifikasi Kode
          </button>
        </div>
      </div>
    </>
  );
}

  // ── FORGOT PASSWORD: RESET SCREEN ──
  if (step === "forgot-reset") {
    return (
      <>
        {otpNotificationEl}
        <div className="min-h-screen bg-background flex flex-col" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <div className="relative overflow-hidden" style={{ background: "linear-gradient(150deg, #c41230 0%, #8b0d22 100%)", height: 200 }}>
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full opacity-10 bg-amber-400" />
          <div className="relative z-10 px-6 pt-12 flex items-center gap-3">
            <button onClick={() => setStep("forgot-otp")} className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
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
            <h1 className="text-white font-black text-2xl leading-tight">Buat Password Baru 🔒</h1>
            <p className="text-white/70 text-sm mt-1">Buat password yang kuat dan mudah diingat</p>
          </div>
        </div>

        <div className="flex-1 px-5 pt-8 pb-10">
          {/* Step dots */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {["Email", "Kode OTP", "Password Baru"].map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black"
                    style={{ background: "#c41230", color: "#fff" }}>
                    {i < 2 ? <CheckCircle2 size={13} /> : 3}
                  </div>
                  <span className="text-xs font-semibold text-primary">{s}</span>
                </div>
                {i < 2 && <div className="w-4 h-px bg-primary" />}
              </div>
            ))}
          </div>

          <div className="space-y-4">
            {/* Password strength indicator */}
            {newPassword.length > 0 && (
              <div className="bg-secondary rounded-xl p-3">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs font-bold text-muted-foreground">Kekuatan Password</span>
                  <span className="text-xs font-bold" style={{ color: newPassword.length < 6 ? "#EF4444" : newPassword.length < 10 ? "#F59E0B" : "#10B981" }}>
                    {newPassword.length < 6 ? "Lemah" : newPassword.length < 10 ? "Sedang" : "Kuat"}
                  </span>
                </div>
                <div className="flex gap-1">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex-1 h-1.5 rounded-full transition-all" style={{
                      background: i === 0 && newPassword.length >= 1 ? "#EF4444"
                        : i === 1 && newPassword.length >= 6 ? "#F59E0B"
                        : i === 2 && newPassword.length >= 10 ? "#10B981"
                        : "#e5e7eb"
                    }} />
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide block mb-1.5">Password Baru</label>
              <div className={`flex items-center gap-2 bg-card rounded-2xl px-4 py-3.5 border-2 transition-colors ${resetError && !newPassword ? "border-primary" : "border-border focus-within:border-primary/50"}`}>
                <Lock size={16} className="text-muted-foreground shrink-0" />
                <input type={showNewPass ? "text" : "password"} value={newPassword}
                  onChange={(e) => { setNewPassword(e.target.value); setResetError(""); }}
                  placeholder="Min. 6 karakter"
                  className="flex-1 text-sm text-foreground bg-transparent outline-none placeholder:text-muted-foreground" />
                <button onClick={() => setShowNewPass((v) => !v)} className="text-muted-foreground shrink-0"><Eye size={16} /></button>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide block mb-1.5">Konfirmasi Password Baru</label>
              <div className={`flex items-center gap-2 bg-card rounded-2xl px-4 py-3.5 border-2 transition-colors ${resetError ? "border-primary" : "border-border focus-within:border-primary/50"}`}>
                <Lock size={16} className="text-muted-foreground shrink-0" />
                <input type={showNewConfirm ? "text" : "password"} value={newPasswordConfirm}
                  onChange={(e) => { setNewPasswordConfirm(e.target.value); setResetError(""); }}
                  placeholder="Ulangi password baru"
                  className="flex-1 text-sm text-foreground bg-transparent outline-none placeholder:text-muted-foreground" />
                <button onClick={() => setShowNewConfirm((v) => !v)} className="text-muted-foreground shrink-0"><Eye size={16} /></button>
              </div>
              {resetError && <p className="text-primary text-[11px] mt-1 flex items-center gap-1"><AlertCircle size={11} />{resetError}</p>}
              {!resetError && newPasswordConfirm && newPassword === newPasswordConfirm && (
                <p className="text-green-600 text-[11px] mt-1 flex items-center gap-1"><CheckCircle2 size={11} />Password cocok!</p>
              )}
            </div>

            {/* Requirements */}
            <div className="bg-muted rounded-xl p-3 space-y-1.5">
              {[
                { label: "Minimal 6 karakter", ok: newPassword.length >= 6 },
                { label: "Kedua password cocok", ok: newPassword === newPasswordConfirm && newPasswordConfirm.length > 0 },
              ].map(({ label, ok }) => (
                <div key={label} className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0" style={{ background: ok ? "#D1FAE5" : "#F3F4F6" }}>
                    {ok ? <CheckCircle2 size={10} className="text-green-600" /> : <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />}
                  </div>
                  <span className="text-xs" style={{ color: ok ? "#065F46" : "#8a8a9a" }}>{label}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                if (newPassword.length < 6) { setResetError("Password minimal 6 karakter"); return; }
                if (newPassword !== newPasswordConfirm) { setResetError("Password tidak cocok"); return; }
                setLoading(true);
                setTimeout(() => { setLoading(false); setStep("form"); setForgotEmail(""); setNewPassword(""); setNewPasswordConfirm(""); setOtp(["","","","","",""]); }, 1200);
              }}
              disabled={loading || newPassword.length < 6 || newPassword !== newPasswordConfirm}
              className="w-full bg-primary text-white font-black py-4 rounded-2xl text-base shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
              style={{ opacity: loading || newPassword.length < 6 || newPassword !== newPasswordConfirm ? 0.6 : 1 }}
            >
              {loading ? (
                <><svg className="animate-spin w-5 h-5 text-white" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>Menyimpan...</>
              ) : <><CheckCircle2 size={18} /> Simpan Password Baru</>}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

  // ── FORM SCREEN ──
  return (
    <>
      {otpNotificationEl}
      <div className="min-h-screen bg-background flex flex-col" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* Top decoration */}
      <div className="relative overflow-hidden" style={{ background: "linear-gradient(150deg, #c41230 0%, #8b0d22 100%)", height: isLogin ? 220 : 200 }}>
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full opacity-10 bg-amber-400" />
        <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full opacity-10 bg-white" />

        <div className="relative z-10 px-6 pt-12 flex items-center gap-3">
          <button onClick={() => navigate("/")} className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
            <ArrowLeft size={18} className="text-white" />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center overflow-hidden">
              <img src={logo} alt="Logo" className="w-full h-full object-cover" />
            </div>
            <span className="text-white font-black text-base">LapakJasMerah</span>
          </div>
        </div>

        <div className="relative z-10 px-6 pt-5">
          <h1 className="text-white font-black text-2xl leading-tight">
            {isLogin ? "Selamat Datang\nKembali! 👋" : "Buat Akun\nBaru 🎓"}
          </h1>
          <p className="text-white/70 text-sm mt-1">
            {isLogin ? "Masuk ke akun Lapak Jas Merah-mu" : "Daftar gratis, khusus mahasiswa UMM"}
          </p>
          {!isLogin && (
            <div className="flex gap-2 mt-3">
              {["1 Isi Data", "2 Verifikasi OTP", "3 Selesai"].map((s, i) => (
                <div key={s} className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black" style={{ background: i === 0 ? "#f59e0b" : "rgba(255,255,255,0.3)", color: i === 0 ? "#1a1a2e" : "#fff" }}>
                    {i + 1}
                  </div>
                  <span className="text-[10px] font-semibold" style={{ color: i === 0 ? "#f59e0b" : "rgba(255,255,255,0.6)" }}>{s.slice(2)}</span>
                  {i < 2 && <div className="w-3 h-px bg-white/30" />}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 px-5 pt-6 pb-10">
        <div className="space-y-4">

          {/* Nama (register only) */}
          {!isLogin && (
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide block mb-1.5">Nama Lengkap</label>
              <div className={`flex items-center gap-2 bg-card rounded-2xl px-4 py-3.5 border-2 transition-colors ${errors.name ? "border-primary" : "border-border focus-within:border-primary/50"}`}>
                <User size={16} className="text-muted-foreground shrink-0" />
                <input type="text" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Ahmad Rizky Pratama" className="flex-1 text-sm text-foreground bg-transparent outline-none placeholder:text-muted-foreground" />
              </div>
              {errors.name && <p className="text-primary text-[11px] mt-1 flex items-center gap-1"><AlertCircle size={11} />{errors.name}</p>}
            </div>
          )}

          {/* NIM (register only) */}
          {!isLogin && (
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide block mb-1.5">NIM Mahasiswa</label>
              <div className={`flex items-center gap-2 bg-card rounded-2xl px-4 py-3.5 border-2 transition-colors ${errors.nim ? "border-primary" : "border-border focus-within:border-primary/50"}`}>
                <BadgeCheck size={16} className="text-muted-foreground shrink-0" />
                <input type="text" inputMode="numeric" value={form.nim} onChange={(e) => setForm((f) => ({ ...f, nim: e.target.value.replace(/\D/g, "") }))} placeholder="202210370311XXX" maxLength={15} className="flex-1 text-sm text-foreground bg-transparent outline-none placeholder:text-muted-foreground" />
              </div>
              {errors.nim
                ? <p className="text-primary text-[11px] mt-1 flex items-center gap-1"><AlertCircle size={11} />{errors.nim}</p>
                : <p className="text-muted-foreground text-[11px] mt-1 flex items-center gap-1"><Info size={10} />NIM digunakan untuk verifikasi mahasiswa aktif UMM</p>}
            </div>
          )}

          {/* Email */}
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide block mb-1.5">
              Email {!isLogin && <span className="text-primary normal-case font-semibold">(@webmail.umm.ac.id)</span>}
            </label>
            <div className={`flex items-center gap-2 bg-card rounded-2xl px-4 py-3.5 border-2 transition-colors ${errors.email ? "border-primary" : "border-border focus-within:border-primary/50"}`}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground shrink-0"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
              <input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="nama@webmail.umm.ac.id" className="flex-1 text-sm text-foreground bg-transparent outline-none placeholder:text-muted-foreground" />
            </div>
            {errors.email
              ? <p className="text-primary text-[11px] mt-1 flex items-center gap-1"><AlertCircle size={11} />{errors.email}</p>
              : !isLogin && <p className="text-muted-foreground text-[11px] mt-1 flex items-center gap-1"><Info size={10} />Kode OTP akan dikirim ke webmail UMM ini</p>}
          </div>

          {/* Password */}
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide block mb-1.5">Password</label>
            <div className={`flex items-center gap-2 bg-card rounded-2xl px-4 py-3.5 border-2 transition-colors ${errors.password ? "border-primary" : "border-border focus-within:border-primary/50"}`}>
              <Lock size={16} className="text-muted-foreground shrink-0" />
              <input type={showPass ? "text" : "password"} value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} placeholder="Min. 6 karakter" className="flex-1 text-sm text-foreground bg-transparent outline-none placeholder:text-muted-foreground" />
              <button onClick={() => setShowPass((v) => !v)} className="text-muted-foreground shrink-0"><Eye size={16} /></button>
            </div>
            {errors.password && <p className="text-primary text-[11px] mt-1 flex items-center gap-1"><AlertCircle size={11} />{errors.password}</p>}
          </div>

          {/* Confirm password (register only) */}
          {!isLogin && (
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide block mb-1.5">Konfirmasi Password</label>
              <div className={`flex items-center gap-2 bg-card rounded-2xl px-4 py-3.5 border-2 transition-colors ${errors.confirmPassword ? "border-primary" : "border-border focus-within:border-primary/50"}`}>
                <Lock size={16} className="text-muted-foreground shrink-0" />
                <input type={showConfirm ? "text" : "password"} value={form.confirmPassword} onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))} placeholder="Ulangi password" className="flex-1 text-sm text-foreground bg-transparent outline-none placeholder:text-muted-foreground" />
                <button onClick={() => setShowConfirm((v) => !v)} className="text-muted-foreground shrink-0"><Eye size={16} /></button>
              </div>
              {errors.confirmPassword && <p className="text-primary text-[11px] mt-1 flex items-center gap-1"><AlertCircle size={11} />{errors.confirmPassword}</p>}
            </div>
          )}

          {/* Forgot password */}
          {isLogin && (
            <div className="text-right">
              <button onClick={() => { setStep("forgot"); setForgotEmail(""); setForgotError(""); }} className="text-primary text-xs font-bold">Lupa password?</button>
            </div>
          )}

          {/* Terms (register only) */}
          {!isLogin && (
            <p className="text-muted-foreground text-[11px] leading-relaxed text-center">
              Dengan mendaftar, kamu menyetujui{" "}
              <span className="text-primary font-bold">Syarat & Ketentuan</span> serta{" "}
              <span className="text-primary font-bold">Kebijakan Privasi</span> Lapak Jas Merah.
            </p>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-primary text-white font-black py-4 rounded-2xl text-base shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
            style={{ opacity: loading ? 0.8 : 1 }}
          >
            {loading ? (
              <>
                <svg className="animate-spin w-5 h-5 text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                </svg>
                {isLogin ? "Masuk..." : "Mengirim OTP..."}
              </>
            ) : isLogin ? "Masuk ke Akun" : "Kirim Kode OTP →"}
          </button>

          {/* Switch mode */}
          <p className="text-center text-sm text-muted-foreground pt-1">
            {isLogin ? "Belum punya akun? " : "Sudah punya akun? "}
            <button onClick={() => setScreen(isLogin ? "register" : "login")} className="text-primary font-black">
              {isLogin ? "Daftar Gratis" : "Masuk"}
            </button>
          </p>

          {/* Skip */}
          <div className="flex flex-col gap-1.5 mt-2">
            <button onClick={() => navigate("/marketplace")} className="w-full text-center text-muted-foreground text-xs py-1.5 active:scale-95 transition-transform">
              Lewati, jelajahi dulu →
            </button>
          </div>
        </div>
      </div>
    </div>
  </>
);
}
