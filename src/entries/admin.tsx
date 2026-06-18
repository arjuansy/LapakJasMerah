import { createRoot } from "react-dom/client";
import { useState, useEffect } from "react";
import AdminDashboard from "../app/pages/AdminDashboard";
import { Shield, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import "../styles/index.css";

// Admin Accounts list matching initial admins in data
const ADMIN_ACCOUNTS = [
  { email: "iqbal.admin@webmail.umm.ac.id", password: "admin", role: "Super Admin", name: "M. Iqbal Pratama" },
  { email: "aisyah.adm@webmail.umm.ac.id", password: "admin", role: "Admin", name: "Aisyah Nabila" },
  { email: "fandy.adm@webmail.umm.ac.id", password: "admin", role: "Admin", name: "Fandy Septian" },
];

function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Email dan password wajib diisi");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      // Find matching admin account
      const matched = ADMIN_ACCOUNTS.find(
        (acc) => acc.email.toLowerCase() === email.trim().toLowerCase() && acc.password === password
      );

      if (matched) {
        localStorage.setItem("adminLoggedIn", "true");
        localStorage.setItem("adminUser", JSON.stringify(matched));
        
        // Redirect to admin dashboard
        const basePath = window.location.pathname.split("/admin/")[0];
        window.location.href = `${basePath}/admin/dashboard.html`;
      } else {
        setError("Email atau Password admin salah!");
        setLoading(false);
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 font-sans">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xl max-w-md w-full p-8 text-left space-y-6">
        {/* Branding header */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/30">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-gray-900 leading-tight">Portal Administrasi</h2>
            <p className="text-xs text-gray-400 font-semibold mt-1">Lapak Jas Merah UMM</p>
          </div>
        </div>

        {/* Warning notification */}
        <div className="bg-red-50 border border-red-150 rounded-xl p-3.5 flex items-start gap-2.5">
          <Lock className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <p className="text-[11px] text-red-700 leading-relaxed font-semibold">
            Halaman ini khusus untuk administrator Lapak Jas Merah. Pengguna biasa dilarang masuk.
          </p>
        </div>

        {/* Form fields */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-extrabold text-gray-500 uppercase tracking-wide block mb-1.5">
              Email Administrator
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              placeholder="nama.adm@webmail.umm.ac.id"
              className="w-full p-3 border border-gray-250 rounded-xl text-xs font-semibold bg-white outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
            />
          </div>

          <div>
            <label className="text-xs font-extrabold text-gray-500 uppercase tracking-wide block mb-1.5">
              Kata Sandi
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                placeholder="Kata sandi portal"
                className="w-full p-3 pr-10 border border-gray-250 rounded-xl text-xs font-semibold bg-white outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-red-600 text-xs font-semibold flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" /> {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 text-white font-extrabold py-3.5 rounded-xl text-xs shadow-md shadow-red-500/20 hover:bg-red-700 active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {loading ? "Memverifikasi..." : "Masuk Sebagai Admin"}
          </button>
        </form>

        {/* Demo Hints */}
        <div className="border-t border-gray-100 pt-4 text-center">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2">Akun Demo Pengujian</p>
          <div className="text-[10px] text-gray-500 bg-gray-50 rounded-lg p-2.5 font-semibold space-y-1 border border-gray-200/50">
            <p>Super Admin: <span className="font-bold text-gray-700">iqbal.admin@webmail.umm.ac.id</span></p>
            <p>Admin Biasa: <span className="font-bold text-gray-700">aisyah.adm@webmail.umm.ac.id</span></p>
            <p>Sandi: <span className="font-bold text-gray-700">admin</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminApp() {
  const path = window.location.pathname;
  const isLoginPage = path.includes("login.html") || path.endsWith("/login");
  const isLoggedIn = localStorage.getItem("adminLoggedIn") === "true";
  const [currentHash, setCurrentHash] = useState(window.location.hash);

  useEffect(() => {
    // Access control
    if (!isLoggedIn && !isLoginPage) {
      const basePath = window.location.pathname.split("/admin/")[0];
      window.location.href = `${basePath}/admin/login.html`;
    } else if (isLoggedIn && isLoginPage) {
      const basePath = window.location.pathname.split("/admin/")[0];
      window.location.href = `${basePath}/admin/dashboard.html`;
    }

    const handleHashChange = () => {
      setCurrentHash(window.location.hash);
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, [isLoggedIn, isLoginPage]);

  if (isLoginPage) {
    return <AdminLogin />;
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center font-bold text-sm text-gray-500">
        Mengalihkan ke halaman login...
      </div>
    );
  }

  // Determine Tab
  let defaultTab: any = "dashboard";
  if (path.includes("users.html")) {
    defaultTab = "users";
  } else if (path.includes("listings.html")) {
    defaultTab = "listings";
  } else if (path.includes("reports.html")) {
    defaultTab = "reports";
  } else if (path.includes("payments.html")) {
    const hash = currentHash.replace("#", "");
    defaultTab = hash === "subscriptions" ? "subscriptions" : "transactions";
  } else {
    // dashboard.html
    const hash = currentHash.replace("#", "");
    const validTabs = ["dashboard", "sellers", "categories", "admins", "settings"];
    defaultTab = validTabs.includes(hash) ? hash : "dashboard";
  }

  const handleLogout = () => {
    localStorage.removeItem("adminLoggedIn");
    localStorage.removeItem("adminUser");
    const basePath = window.location.pathname.split("/admin/")[0];
    window.location.href = `${basePath}/admin/login.html`;
  };

  return <AdminDashboard onLogout={handleLogout} defaultTab={defaultTab} />;
}

createRoot(document.getElementById("root")!).render(<AdminApp />);
