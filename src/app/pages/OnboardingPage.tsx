import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  BadgeCheck,
  AlertCircle,
  Lock,
  Eye,
  EyeOff,
  GraduationCap,
  BookOpen
} from "lucide-react";
import { authService } from "../../services/authService";
import { useAuth } from "../../hooks/useAuth";
import { toast } from "react-hot-toast";

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { user, profile, refreshSession, loading: authLoading } = useAuth();

  const [form, setForm] = useState({ 
    name: "", 
    nim: "", 
    faculty: "", 
    major: "", 
    password: "" 
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Initialize form with existing profile data (especially from Google)
  useEffect(() => {
    if (profile) {
      setForm(prev => ({
        ...prev,
        name: profile.full_name || prev.name,
      }));
    }
  }, [profile]);

  // Parse OAuth error from URL (if blocked by Postgres trigger)
  useEffect(() => {
    const hash = window.location.hash;
    const search = window.location.search;

    if (hash.includes('error=') || search.includes('error=')) {
      toast.error("Akses Ditolak: Pendaftaran dengan akun Google non-UMM diblokir oleh sistem.", { duration: 5000 });
      window.history.replaceState(null, '', window.location.pathname);
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  // If not logged in, shouldn't be here
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    } else if (user && user.email && !user.email.toLowerCase().endsWith("@webmail.umm.ac.id")) {
      // Force logout if non-webmail Google account
      authService.logout().then(() => {
        toast.error("Akses ditolak: Hanya email @webmail.umm.ac.id yang diizinkan.", { duration: 5000 });
        navigate('/login');
      });
    } else if (!authLoading && user && profile && profile.nim) {
      if (profile.role === 'ADMIN' || profile.role === 'SUPER_ADMIN') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/marketplace', { replace: true });
      }
    }
  }, [user, profile, navigate, authLoading]);

  const handleSubmit = async () => {
    const newErrors: Record<string, string> = {};

    if (!form.name) newErrors.name = "Nama wajib diisi";
    if (!form.nim) newErrors.nim = "NIM wajib diisi";
    if (!form.faculty) newErrors.faculty = "Fakultas wajib diisi";
    if (!form.major) newErrors.major = "Program Studi wajib diisi";
    if (!form.password || form.password.length < 6) newErrors.password = "Sandi minimal 6 karakter";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);
      setErrors({});

      // 1. Set/Update Password
      await authService.updatePassword(form.password);

      // 2. Update Profile Information
      await authService.updateProfile(user!.id, {
        full_name: form.name,
        nim: form.nim,
        faculty: form.faculty,
        major: form.major
      });

      // 3. Refresh Auth Context
      await refreshSession();

      toast.success("Profil berhasil dilengkapi!");
      
      // 4. Redirect to Marketplace
      navigate('/marketplace');
      
    } catch (err: any) {
      setErrors({ form: err.message || "Gagal menyimpan data" });
      toast.error(err.message || "Terjadi kesalahan saat menyimpan data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col sm:justify-center items-center p-4">
      {authLoading ? (
        <div className="flex flex-col items-center justify-center">
          <svg className="animate-spin w-8 h-8 text-primary mb-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>
          <p className="text-muted-foreground font-medium text-sm">Memuat sesi Anda...</p>
        </div>
      ) : (
        <div className="w-full max-w-md">
        
        {/* Header */}
        <div className="text-center mb-8 mt-12 sm:mt-0">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-primary/10 text-primary mb-6">
            <BadgeCheck size={32} className="fill-primary text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-black text-foreground mb-2">Lengkapi Profil</h1>
          <p className="text-muted-foreground text-sm px-4">
            Anda berhasil masuk dengan Google! Silakan lengkapi data mahasiswa Anda dan buat kata sandi untuk login selanjutnya.
          </p>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {errors.form && (
            <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-medium flex items-center gap-2">
              <AlertCircle size={18} />
              {errors.form}
            </div>
          )}

          {/* Full Name */}
          <div>
            <div className={`relative flex items-center bg-card border-2 rounded-2xl overflow-hidden transition-colors ${errors.name ? 'border-red-500' : 'border-border focus-within:border-primary'}`}>
              <div className="pl-4 pr-2 text-muted-foreground"><User size={20} /></div>
              <input
                type="text"
                placeholder="Nama Lengkap"
                className="w-full py-4 pr-4 bg-transparent outline-none text-foreground text-sm font-medium placeholder:font-normal"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            {errors.name && <p className="text-red-500 text-xs mt-1.5 ml-2 font-medium">{errors.name}</p>}
          </div>

          {/* NIM */}
          <div>
            <div className={`relative flex items-center bg-card border-2 rounded-2xl overflow-hidden transition-colors ${errors.nim ? 'border-red-500' : 'border-border focus-within:border-primary'}`}>
              <div className="pl-4 pr-2 text-muted-foreground"><BadgeCheck size={20} /></div>
              <input
                type="text"
                placeholder="Nomor Induk Mahasiswa (NIM)"
                className="w-full py-4 pr-4 bg-transparent outline-none text-foreground text-sm font-medium placeholder:font-normal"
                value={form.nim}
                onChange={(e) => setForm({ ...form, nim: e.target.value })}
              />
            </div>
            {errors.nim && <p className="text-red-500 text-xs mt-1.5 ml-2 font-medium">{errors.nim}</p>}
          </div>

          {/* Fakultas */}
          <div>
            <div className={`relative flex items-center bg-card border-2 rounded-2xl overflow-hidden transition-colors ${errors.faculty ? 'border-red-500' : 'border-border focus-within:border-primary'}`}>
              <div className="pl-4 pr-2 text-muted-foreground"><GraduationCap size={20} /></div>
              <input
                type="text"
                placeholder="Fakultas (Misal: Teknik)"
                className="w-full py-4 pr-4 bg-transparent outline-none text-foreground text-sm font-medium placeholder:font-normal"
                value={form.faculty}
                onChange={(e) => setForm({ ...form, faculty: e.target.value })}
              />
            </div>
            {errors.faculty && <p className="text-red-500 text-xs mt-1.5 ml-2 font-medium">{errors.faculty}</p>}
          </div>

          {/* Prodi */}
          <div>
            <div className={`relative flex items-center bg-card border-2 rounded-2xl overflow-hidden transition-colors ${errors.major ? 'border-red-500' : 'border-border focus-within:border-primary'}`}>
              <div className="pl-4 pr-2 text-muted-foreground"><BookOpen size={20} /></div>
              <input
                type="text"
                autoComplete="off"
                placeholder="Program Studi (Misal: Informatika)"
                className="w-full py-4 pr-4 bg-transparent outline-none text-foreground text-sm font-medium placeholder:font-normal"
                value={form.major}
                onChange={(e) => setForm({ ...form, major: e.target.value })}
              />
            </div>
            {errors.major && <p className="text-red-500 text-xs mt-1.5 ml-2 font-medium">{errors.major}</p>}
          </div>

          {/* Password */}
          <div>
            <div className={`relative flex items-center bg-card border-2 rounded-2xl overflow-hidden transition-colors ${errors.password ? 'border-red-500' : 'border-border focus-within:border-primary'}`}>
              <div className="pl-4 pr-2 text-muted-foreground"><Lock size={20} /></div>
              <input
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Buat Kata Sandi Baru"
                className="w-full py-4 pr-12 bg-transparent outline-none text-foreground text-sm font-medium placeholder:font-normal"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-1.5 ml-2 font-medium">{errors.password}</p>}
            <p className="text-muted-foreground text-xs mt-2 ml-2">Kata sandi ini akan digunakan untuk masuk dengan email Google Anda nantinya.</p>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-primary text-white font-black py-4 rounded-2xl text-base shadow-[0_8px_16px_-6px_rgba(196,18,48,0.4)] active:scale-95 transition-all mt-6 flex justify-center"
            style={{ opacity: loading ? 0.8 : 1 }}
          >
            {loading ? <svg className="animate-spin w-6 h-6" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg> : "Simpan Profil & Lanjutkan"}
          </button>
        </div>
      </div>
      )}
    </div>
  );
}
