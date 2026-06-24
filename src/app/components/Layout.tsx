import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  Grid3X3,
  PlusCircle,
  MessageCircle,
  User,
} from "lucide-react";
import { useApp } from "../context";
import logoImg from "../../assets/logo.png";

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { unreadChatCount, toastMessage } = useApp();

  const totalUnread = unreadChatCount;

  // Determine active tab based on pathname
  let activeTab = "home";
  if (location.pathname.startsWith("/categories")) activeTab = "categories";
  else if (location.pathname.startsWith("/sell")) activeTab = "sell";
  else if (location.pathname.startsWith("/chat")) activeTab = "chat";
  else if (location.pathname.startsWith("/profile")) activeTab = "profile";

  const isChatDetail = location.pathname.match(/^\/chat\/\d+/);
  const hideNav = activeTab === "sell";

  const navItems = [
    { id: "home", path: "/marketplace", icon: Home, label: "Beranda" },
    { id: "categories", path: "/categories", icon: Grid3X3, label: "Kategori" },
    { id: "sell", path: "/sell", icon: PlusCircle, label: "Jual", special: true },
    { id: "chat", path: "/chat", icon: MessageCircle, label: "Chat" },
    { id: "profile", path: "/profile", icon: User, label: "Profil" },
  ];

  return (
    <div className="relative w-full h-full mx-auto flex flex-col bg-background shadow-2xl overflow-hidden max-w-[430px] md:max-w-3xl lg:max-w-none lg:shadow-none lg:overflow-visible">

      {/* ── NAVBAR ATAS (desktop, lg+) ── */}
      {!hideNav && (
        <header className="hidden lg:flex items-center justify-between bg-card border-b border-border px-8 h-16 shrink-0 sticky top-0 z-50">
          <div className="flex items-center gap-8">
            <button onClick={() => navigate("/marketplace")} className="flex items-center gap-2.5 shrink-0">
              <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center overflow-hidden">
                <img src={logoImg} alt="Logo" className="w-full h-full object-cover" />
              </div>
              <span className="font-black text-foreground text-base tracking-tight">Lapak Jas Merah</span>
            </button>

            <nav className="flex items-center gap-1">
              {navItems.filter((item) => !item.special).map(({ id, path, icon: Icon, label }) => (
                <button
                  key={id}
                  onClick={() => navigate(path)}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors relative"
                  style={{
                    color: activeTab === id ? "#c41230" : "#6b7280",
                    background: activeTab === id ? "rgba(196,18,48,0.08)" : "transparent",
                  }}
                >
                  <Icon size={17} style={{ strokeWidth: activeTab === id ? 2.5 : 1.75 }} />
                  {label}
                  {id === "chat" && totalUnread > 0 && (
                    <span className="absolute top-1 right-1.5 w-2 h-2 bg-primary rounded-full" />
                  )}
                </button>
              ))}
            </nav>
          </div>

          <button
            onClick={() => navigate("/sell")}
            className="flex items-center gap-2 bg-primary text-white font-bold text-sm px-4 py-2.5 rounded-xl shadow-sm hover:bg-primary/90 active:scale-95 transition-all"
          >
            <PlusCircle size={16} />
            Jual Barang
          </button>
        </header>
      )}

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden relative">
        <Outlet />
      </div>

      {/* ── BOTTOM NAVIGATION (mobile/tablet, < lg) ── */}
      {!hideNav && (
        <nav className="lg:hidden fixed bottom-0 left-1/2 -translate-x-1/2 w-full bg-card border-t border-border shadow-2xl z-50 max-w-[430px] md:max-w-3xl">
          <div className="flex items-center justify-around px-2 py-2">
            {navItems.map(({ id, path, icon: Icon, label, special }) =>
              special ? (
                <button
                  key={id}
                  onClick={() => navigate(path)}
                  className="flex flex-col items-center -mt-5"
                >
                  <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center shadow-lg border-4 border-background">
                    <Icon size={24} className="text-white" />
                  </div>
                  <span className="text-[9px] font-bold text-primary mt-1">{label}</span>
                </button>
              ) : (
                <button
                  key={id}
                  onClick={() => navigate(path)}
                  className="flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-colors relative"
                >
                  <div className="relative">
                    <Icon
                      size={20}
                      className={activeTab === id ? "text-primary" : "text-muted-foreground"}
                      style={{ strokeWidth: activeTab === id ? 2.5 : 1.75 }}
                    />
                    {id === "chat" && totalUnread > 0 && (
                      <span className="absolute -top-1 -right-1.5 w-4 h-4 bg-primary text-white text-[9px] font-black rounded-full flex items-center justify-center">
                        {totalUnread}
                      </span>
                    )}
                  </div>
                  <span
                    className="text-[9px] font-semibold"
                    style={{ color: activeTab === id ? "#c41230" : "#8a8a9a" }}
                  >
                    {label}
                  </span>
                </button>
              )
            )}
          </div>
          {/* Safe area padding */}
          <div style={{ height: "env(safe-area-inset-bottom, 0px)" }} />
        </nav>
      )}

      {/* Global Toast Message */}
      {toastMessage && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-neutral-900 text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-lg z-[999] flex items-center gap-2 max-w-[90%] whitespace-nowrap lg:bottom-6">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          {toastMessage}
        </div>
      )}
    </div>
  );
}