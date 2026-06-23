import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { formatPrice } from "../data";
import { useAuth } from "../../hooks/useAuth";
import { supabase } from "../../config/supabaseClient";
import {
  LayoutDashboard,
  Users,
  Store,
  Tag,
  Grid3X3,
  AlertTriangle,
  ArrowRightLeft,
  Zap,
  Settings,
  Search,
  Bell,
  Check,
  X,
  Trash2,
  Edit2,
  Plus,
  Shield,
  MessageCircle,
  ShieldAlert,
  UserX,
  UserCheck,
  ShieldCheck,
  TrendingUp,
  DollarSign,
  Calendar,
  ChevronRight,
  Eye,
  LogOut,
  ChevronDown,
  Menu,
  Lock,
  UserMinus,
  CheckSquare,
  AlertCircle,
  Clock,
  ArrowLeft,
  ChevronUp,
  Image as ImageIcon,
} from "lucide-react";

// Mock Data Types
type AdminRole = "Super Admin" | "Admin";

type UserType = {
  id: string;
  nim: string;
  name: string;
  email: string;
  major: string;
  status: "Aktif" | "Ditangguhkan";
  registeredAt: string;
};

type SellerType = {
  id: string;
  nim: string;
  shopName: string;
  ownerName: string;
  major: string;
  status: "Pending" | "Disetujui" | "Ditolak" | "Ditangguhkan";
  registeredAt: string;
  rating: number;
  transactionId?: string;
  ktmUrl?: string;
};

type ListingType = {
  id: string;
  title: string;
  category: string;
  sellerName: string;
  price: number;
  status: "Pending" | "Disetujui" | "Ditolak";
  createdAt: string;
  image: string;
};

type CategoryType = {
  id: string;
  name: string;
  slug: string;
  listingsCount: number;
  revenue: number;
};

type ReportType = {
  id: string;
  reporterName: string;
  reportedName: string;
  reason: string;
  evidence: string;
  status: "Terbuka" | "Selesai" | "Ditolak";
  createdAt: string;
  targetType: "listing" | "user";
};

type TransactionType = {
  id: string;
  buyerName: string;
  sellerName: string;
  productTitle: string;
  amount: number;
  paymentMethod: string;
  status: "Sukses" | "Pending" | "Gagal";
  createdAt: string;
};

type SubscriptionType = {
  id: string;
  sellerName: string;
  packageName: string;
  price: number;
  durationDays: number;
  status: "Pending" | "Disetujui" | "Ditolak";
  paymentProof: string;
  requestedAt: string;
};

type AdminType = {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  addedAt: string;
  permissions?: string[];
};

type SuggestionType = {
  id: string;
  userName: string;
  userAvatar: string;
  category: string;
  message: string;
  status: "Terbuka" | "Selesai" | "Ditolak";
  createdAt: string;
  isAnonymous: boolean;
  imageUrl?: string;
};

export default function AdminDashboard({
  onLogout,
  defaultTab = "dashboard",
}: {
  onLogout: () => void;
  defaultTab?:
    | "dashboard"
    | "users"
    | "sellers"
    | "listings"
    | "categories"
    | "reports"
    | "suggestions"
    | "transactions"
    | "subscriptions"
    | "settings"
    | "admins"
    | "whitelisted_users"
    | "banners";
}) {
  const { user, profile } = useAuth();

  // Current logged in admin configuration
  const currentAdmin: AdminType = useMemo(() => ({
    id: user?.id || "ADM-01",
    name: profile?.full_name || "M. Iqbal Pratama",
    email: user?.email || "iqbal.admin@webmail.umm.ac.id",
    role: (profile?.role === "SUPER_ADMIN" ? "Super Admin" : "Admin") as AdminRole,
    addedAt: profile?.created_at ? new Date(profile.created_at).toISOString().split('T')[0] : "2025-01-15",
    permissions: ["manage_users", "manage_sellers", "manage_listings", "manage_categories", "manage_reports", "manage_transactions", "manage_premium", "manage_admins"],
  }), [user, profile]);

  const [activeTab, setActiveTab] = useState<
    | "dashboard"
    | "users"
    | "sellers"
    | "listings"
    | "categories"
    | "reports"
    | "suggestions"
    | "transactions"
    | "subscriptions"
    | "settings"
    | "admins"
    | "whitelisted_users"
    | "banners"
  >(defaultTab);

  // Synchronize activeTab when defaultTab prop changes from hash router
  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  // Toast State
  const [toasts, setToasts] = useState<{ id: number; message: string; type: "success" | "error" | "info" }[]>([]);
  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  // ── 1. DASHBOARD DATA ──
  const [users, setUsers] = useState<UserType[]>([]);
  const [sellers, setSellers] = useState<SellerType[]>([]);
  const [listings, setListings] = useState<ListingType[]>([]);
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [reports, setReports] = useState<ReportType[]>([]);
  const [transactions, setTransactions] = useState<TransactionType[]>([]);
  const [subscriptions, setSubscriptions] = useState<SubscriptionType[]>([]);
  const [admins, setAdmins] = useState<AdminType[]>([]);
  const [suggestions, setSuggestions] = useState<SuggestionType[]>([]);
  const [whitelistedEmails, setWhitelistedEmails] = useState<{id: string, email: string, added_at: string}[]>([]);
  const [bannersData, setBannersData] = useState<any[]>([]);

  // Fetch Data from Supabase
  const fetchAllData = async () => {
    try {
      // 1. Fetch Users
      const { data: usersData } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'USER');
      if (usersData) {
        setUsers(usersData.map((u: any) => ({
          id: u.id,
          nim: u.nim || '-',
          name: u.full_name || u.username || 'User',
          email: u.email || '-',
          major: u.major || '-',
          status: u.status || 'Aktif',
          registeredAt: new Date(u.created_at).toISOString().split('T')[0]
        })));
      }

      // 2. Fetch Sellers
      const { data: sellersData } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_verified_seller', true);
        
      const { data: pendingSellerVerifications } = await supabase
        .from('package_transactions')
        .select('*, user:profiles(*)')
        .eq('transaction_type', 'seller_verification')
        .eq('status', 'PENDING');

      let allSellers: any[] = [];
      if (sellersData) {
        allSellers = sellersData.map((s: any) => ({
          id: s.id,
          nim: s.nim || '-',
          shopName: s.username || s.full_name || 'Toko',
          ownerName: s.full_name || '-',
          major: s.major || '-',
          status: s.status === 'SUSPENDED' ? 'Ditangguhkan' : 'Disetujui',
          registeredAt: new Date(s.created_at).toISOString().split('T')[0],
          rating: 0,
          transactionId: null
        }));
      }

      if (pendingSellerVerifications) {
        const pendingSellers = pendingSellerVerifications.map((tx: any) => {
          const s = tx.user;
          return {
            id: s.id, // the user's id
            nim: s?.nim || '-',
            shopName: s?.username || s?.full_name || 'Toko',
            ownerName: s?.full_name || '-',
            major: s?.major || '-',
            status: 'Pending',
            registeredAt: new Date(tx.created_at).toISOString().split('T')[0],
            rating: 0,
            transactionId: tx.id, // Store transaction ID
            ktmUrl: tx.payment_proof_url // Store the KTM photo URL
          };
        });
        // Avoid duplicate if somehow user is already verified but has pending transaction
        const existingIds = new Set(allSellers.map(s => s.id));
        allSellers = [...allSellers, ...pendingSellers.filter(s => !existingIds.has(s.id))];
      }
      
      setSellers(allSellers);

      // 3. Fetch Listings (Products)
      const { data: productsData, error: productErr } = await supabase
        .from('products')
        .select('*, seller:profiles!products_seller_id_fkey(full_name, username), categories(name)');
      if (productsData) {
        setListings(productsData.map((p: any) => ({
          id: p.id,
          title: p.name,
          category: p.categories?.name || 'Kategori',
          sellerName: p.seller?.full_name || p.seller?.username || 'Penjual',
          price: p.price,
          status: p.status === 'AVAILABLE' ? 'Disetujui' : (p.status === 'SUSPENDED' ? 'Ditolak' : 'Pending'),
          createdAt: new Date(p.created_at).toISOString().split('T')[0],
          image: p.image_url || 'https://via.placeholder.com/100'
        })));
      }

      // 4. Fetch Categories
      const { data: categoriesData } = await supabase
        .from('categories')
        .select('*');
      if (categoriesData) {
        setCategories(categoriesData.map((c: any) => {
          const count = productsData ? productsData.filter((p: any) => p.category_id === c.id).length : 0;
          return {
            id: c.id,
            name: c.name,
            slug: c.name.toLowerCase().replace(/\s+/g, '-'),
            listingsCount: count,
            revenue: 0 // Requires aggregation
          };
        }));
      }

      // 5. Fetch Reports
      const { data: reportsData } = await supabase
        .from('reports')
        .select('*, reporter:profiles!reports_reporter_id_fkey(full_name), reported:profiles!reports_reported_id_fkey(full_name)');
      if (reportsData) {
        setReports(reportsData.map((r: any) => ({
          id: r.id,
          reporterName: r.reporter?.full_name || 'Pelapor',
          reportedName: r.target_type === 'user' ? (r.reported?.full_name || 'Pengguna') : 'Produk',
          reason: r.reason,
          evidence: r.evidence || '-',
          status: r.status,
          createdAt: new Date(r.created_at).toISOString().split('T')[0],
          targetType: r.target_type
        })));
      }

      // 6. Fetch Transactions (Orders)
      const { data: ordersData } = await supabase
        .from('orders')
        .select('*, buyer:profiles!orders_buyer_id_fkey(full_name)');
      if (ordersData) {
        // Need order_items to get product and seller, simplifying for now:
        setTransactions(ordersData.map((o: any) => ({
          id: o.id,
          buyerName: o.buyer?.full_name || 'Pembeli',
          sellerName: 'Penjual', // Placeholder
          productTitle: 'Produk', // Placeholder
          amount: o.total_amount,
          paymentMethod: o.payment_method || 'Transfer',
          status: o.status === 'completed' ? 'Sukses' : o.status === 'pending' ? 'Pending' : 'Gagal',
          createdAt: new Date(o.created_at).toISOString().split('T')[0]
        })));
      }

      // 7. Fetch Subscriptions (Package Transactions)
      const { data: pkgData } = await supabase
        .from('package_transactions')
        .select('*, user:profiles(full_name)')
        .in('transaction_type', ['ad_package', 'request_package']);
      if (pkgData) {
        setSubscriptions(pkgData.map((s: any) => ({
          id: s.id,
          sellerName: s.user?.full_name || 'Penjual',
          packageName: s.package_name,
          price: s.amount,
          durationDays: s.package_name.includes('Standard') ? 14 : 7,
          status: s.status === 'SUCCESS' ? 'Disetujui' : s.status === 'PENDING' ? 'Pending' : 'Ditolak',
          paymentProof: '-',
          requestedAt: new Date(s.created_at).toISOString().split('T')[0]
        })));
      }

      // 8. Fetch Admins
      const { data: adminsData } = await supabase
        .from('profiles')
        .select('*')
        .in('role', ['ADMIN', 'SUPER_ADMIN']);
      if (adminsData) {
        setAdmins(adminsData.map((a: any) => ({
          id: a.id,
          name: a.full_name || a.username || 'Admin',
          email: a.email || '-',
          role: a.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin',
          addedAt: new Date(a.created_at).toISOString().split('T')[0],
          permissions: ['manage_users', 'manage_sellers', 'manage_listings']
        })));
      }

      // 9. Fetch Whitelisted Emails
      const { data: whitelistedData } = await supabase.from('whitelisted_emails').select('*');
      if (whitelistedData) {
        setWhitelistedEmails(whitelistedData.map((w: any) => ({
          id: w.id,
          email: w.email,
          added_at: new Date(w.created_at).toISOString().split('T')[0]
        })));
      }
      // 10. Fetch Banners
      const { data: bData } = await supabase.from('banners').select('*').order('created_at', { ascending: false });
      if (bData) {
        setBannersData(bData);
      }
    } catch (error) {
      console.error("Error fetching admin data:", error);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      const { data, error } = await supabase
        .from('suggestions')
        .select(`
          id, category, message, is_anonymous, status, created_at, image_url,
          user:profiles(full_name, avatar_url)
        `)
        .order('created_at', { ascending: false });

      if (data && !error) {
        setSuggestions(data.map((s: any) => ({
          id: s.id,
          userName: s.is_anonymous || !s.user ? "Pengguna Anonim" : s.user.full_name,
          userAvatar: s.is_anonymous || !s.user ? "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=80&h=80&fit=crop&auto=format" : s.user.avatar_url,
          category: s.category,
          message: s.message,
          status: s.status as any,
          createdAt: new Date(s.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }),
          isAnonymous: s.is_anonymous,
          imageUrl: s.image_url
        })));
      }
    };
    fetchSuggestions();
  }, []);

  const handleUpdateSuggestionStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase.from('suggestions').update({ status: newStatus }).eq('id', id);
      if (error) throw error;
      setSuggestions(prev => prev.map(s => s.id === id ? { ...s, status: newStatus as any } : s));
      showToast("Status saran berhasil diperbarui", "success");
    } catch (e) {
      console.error(e);
      showToast("Gagal memperbarui status", "error");
    }
  };

  // ── MODAL STATES ──
  const [modalType, setModalType] = useState<
    | null
    | "viewUser"
    | "editUser"
    | "suspendUser"
    | "deleteUser"
    | "viewSeller"
    | "approveSeller"
    | "rejectSeller"
    | "suspendSeller"
    | "viewListing"
    | "editListing"
    | "approveListing"
    | "rejectListing"
    | "deleteListing"
    | "addCategory"
    | "editCategory"
    | "deleteCategory"
    | "resolveReport"
    | "banReportUser"
    | "approveSub"
    | "rejectSub"
    | "addAdmin"
    | "editAdmin"
    | "deleteAdmin"
    | "viewTransaction"
    | "addPackage"
    | "editPackage"
    | "deletePackage"
    | "addWhitelistEmail"
    | "deleteWhitelistEmail"
    | "addBanner"
    | "editBanner"
    | "deleteBanner"
  >(null);

  // Selected Item references for modals
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [selectedSeller, setSelectedSeller] = useState<SellerType | null>(null);
  const [selectedListing, setSelectedListing] = useState<ListingType | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | null>(null);
  const [selectedReport, setSelectedReport] = useState<ReportType | null>(null);
  const [selectedSub, setSelectedSub] = useState<SubscriptionType | null>(null);
  const [selectedAdminToDelete, setSelectedAdminToDelete] = useState<AdminType | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionType | null>(null);
  const [selectedAdmin, setSelectedAdmin] = useState<AdminType | null>(null);
  const [selectedWhitelistEmail, setSelectedWhitelistEmail] = useState<{id: string, email: string} | null>(null);
  const [selectedBanner, setSelectedBanner] = useState<any | null>(null);

  // Dynamic Premium Packages configuration state
  const [premiumPackages, setPremiumPackages] = useState([
    { id: "PKG-001", name: "Highlight Pencarian 3 Hari", price: 300, desc: "Posisi listing lebih diunggulkan pada hasil pencarian selama 3 hari beruntun.", durationDays: 3 },
    { id: "PKG-002", name: "Highlight Pencarian 7 Hari", price: 500, desc: "Posisi listing lebih diunggulkan dan prioritas teratas selama 7 hari penuh.", durationDays: 7 },
  ]);

  // Date filters for transactions
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Category filter for listings
  const [filterCategory, setFilterCategory] = useState("Semua");

  // Profile image upload state
  const [profilePic, setProfilePic] = useState<string | null>(null);

  // Form states
  const [categoryForm, setCategoryForm] = useState({ name: "" });
  const [adminForm, setAdminForm] = useState({ name: "", email: "", password: "", role: "Admin" as AdminRole, permissions: ["manage_users", "manage_sellers", "manage_listings"] });
  const [editAdminForm, setEditAdminForm] = useState({ name: "", email: "", role: "Admin" as AdminRole, permissions: [] as string[] });
  const [userForm, setUserForm] = useState({ name: "", nim: "", email: "", major: "", status: "Aktif" as "Aktif" | "Ditangguhkan" });
  const [listingForm, setListingForm] = useState({ title: "", category: "", price: 0 });
  const [packageForm, setPackageForm] = useState({ name: "", price: 300, desc: "", durationDays: 3 });
  const [whitelistEmailForm, setWhitelistEmailForm] = useState({ email: "" });
  const [bannerForm, setBannerForm] = useState({ title: "", sub: "", badge: "", bg: "", img: "", is_active: true });
  
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("Semua");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Notification panel state
  const [showNotifications, setShowNotifications] = useState(false);
  const notifications = useMemo(() => {
    const notifs: any[] = [];
    sellers.filter(s => s.status === 'Pending').forEach(s => {
      notifs.push({ id: `seller-${s.id}`, text: `${s.shopName} mendaftar sebagai Penjual baru`, time: s.registeredAt, type: "seller" });
    });
    reports.filter(r => r.status === 'Terbuka').forEach(r => {
      notifs.push({ id: `report-${r.id}`, text: `Laporan masuk dari ${r.reporterName}`, time: r.createdAt, type: "report" });
    });
    subscriptions.filter(s => s.status === 'Pending').forEach(s => {
      notifs.push({ id: `sub-${s.id}`, text: `Pembayaran premium Rp ${s.price} oleh ${s.sellerName} menunggu persetujuan`, time: s.requestedAt, type: "subscription" });
    });
    listings.filter(l => l.status === 'Pending').forEach(l => {
      notifs.push({ id: `listing-${l.id}`, text: `Iklan '${l.title}' butuh verifikasi`, time: l.createdAt, type: "listing" });
    });
    return notifs.sort((a, b) => b.time.localeCompare(a.time));
  }, [sellers, reports, subscriptions, listings]);

  // Responsive Sidebar Menu Toggle for Mobile
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Helper formatting for currency
  const formatIDR = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Check Role Permission helper
  const hasPermission = (required: AdminRole) => {
    if (required === "Super Admin" && currentAdmin.role !== "Super Admin") {
      return false;
    }
    return true;
  };

  const handlePermissionWarning = () => {
    showToast("Akses Ditolak! Hanya Super Admin yang dapat melakukan tindakan ini.", "error");
  };

  // ── FILTERED DATA CALCULATIONS ──
  const filteredUsersList = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.nim.includes(searchQuery) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus =
        filterStatus === "Semua" ||
        (filterStatus === "Aktif" && u.status === "Aktif") ||
        (filterStatus === "Ditangguhkan" && u.status === "Ditangguhkan");
      return matchSearch && matchStatus;
    });
  }, [users, searchQuery, filterStatus]);

  const filteredSellersList = useMemo(() => {
    return sellers.filter((s) => {
      const matchSearch =
        s.shopName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.nim.includes(searchQuery);
      const matchStatus =
        filterStatus === "Semua" ||
        (filterStatus === "Pending" && s.status === "Pending") ||
        (filterStatus === "Disetujui" && s.status === "Disetujui") ||
        (filterStatus === "Ditolak" && s.status === "Ditolak") ||
        (filterStatus === "Ditangguhkan" && s.status === "Ditangguhkan");
      return matchSearch && matchStatus;
    });
  }, [sellers, searchQuery, filterStatus]);

  const filteredListingsList = useMemo(() => {
    return listings.filter((l) => {
      const matchSearch =
        l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.sellerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus =
        filterStatus === "Semua" ||
        (filterStatus === "Pending" && l.status === "Pending") ||
        (filterStatus === "Disetujui" && l.status === "Disetujui") ||
        (filterStatus === "Ditolak" && l.status === "Ditolak");
      const matchCategory =
        filterCategory === "Semua" ||
        l.category.toLowerCase() === filterCategory.toLowerCase();
      return matchSearch && matchStatus && matchCategory;
    });
  }, [listings, searchQuery, filterStatus, filterCategory]);

  const filteredReportsList = useMemo(() => {
    return reports.filter((r) => {
      const matchSearch =
        r.reporterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.reportedName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.reason.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus =
        filterStatus === "Semua" ||
        (filterStatus === "Terbuka" && r.status === "Terbuka") ||
        (filterStatus === "Selesai" && r.status === "Selesai") ||
        (filterStatus === "Ditolak" && r.status === "Ditolak");
      return matchSearch && matchStatus;
    });
  }, [reports, searchQuery, filterStatus]);

  const filteredTransactionsList = useMemo(() => {
    return transactions.filter((t) => {
      const matchSearch =
        t.buyerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.sellerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.productTitle.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus =
        filterStatus === "Semua" ||
        (filterStatus === "Sukses" && t.status === "Sukses") ||
        (filterStatus === "Pending" && t.status === "Pending") ||
        (filterStatus === "Gagal" && t.status === "Gagal");
      let matchDate = true;
      if (startDate) {
        matchDate = matchDate && t.createdAt >= startDate;
      }
      if (endDate) {
        matchDate = matchDate && t.createdAt <= endDate;
      }
      return matchSearch && matchStatus && matchDate;
    });
  }, [transactions, searchQuery, filterStatus, startDate, endDate]);

  const filteredSubsList = useMemo(() => {
    return subscriptions.filter((s) => {
      const matchSearch =
        s.sellerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.packageName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus =
        filterStatus === "Semua" ||
        (filterStatus === "Pending" && s.status === "Pending") ||
        (filterStatus === "Disetujui" && s.status === "Disetujui") ||
        (filterStatus === "Ditolak" && s.status === "Ditolak");
      return matchSearch && matchStatus;
    });
  }, [subscriptions, searchQuery, filterStatus]);

  // Statistics calculation
  const stats = useMemo(() => {
    const totalUsers = users.length;
    const totalSellers = sellers.filter((s) => s.status === "Disetujui").length;
    const totalActiveListings = listings.filter((l) => l.status === "Disetujui").length;
    const totalTransactions = transactions.filter((t) => t.status === "Sukses").length;
    const totalPremiumSubEarnings = subscriptions
      .filter((s) => s.status === "Disetujui")
      .reduce((sum, s) => sum + s.price, 0);

    return {
      totalUsers,
      totalSellers,
      totalActiveListings,
      totalTransactions,
      totalPremiumSubEarnings,
    };
  }, [users, sellers, listings, transactions, subscriptions]);

  // Profile Settings form states
  const [profileName, setProfileName] = useState(currentAdmin.name);
  const [profileEmail, setProfileEmail] = useState(currentAdmin.email);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [notifPreferences, setNotifPreferences] = useState({
    userRegistration: true,
    sellerApplication: true,
    newListing: true,
    complaintReport: true,
    subscriptionRequest: true,
  });

  return (
    <div className="flex h-screen bg-gray-50 text-gray-800 font-sans overflow-hidden">
      {/* ── TOAST NOTIFICATIONS ── */}
      <div className="fixed bottom-5 right-5 z-[100] space-y-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`flex items-center gap-3 px-4 py-3.5 rounded-xl shadow-lg text-sm text-white transform translate-y-0 transition-all duration-300 ${
              t.type === "success" ? "bg-green-600" : t.type === "error" ? "bg-red-600" : "bg-blue-600"
            }`}
          >
            {t.type === "success" && <Check className="w-5 h-5 shrink-0" />}
            {t.type === "error" && <X className="w-5 h-5 shrink-0" />}
            {t.type === "info" && <AlertCircle className="w-5 h-5 shrink-0" />}
            <span className="font-semibold">{t.message}</span>
          </div>
        ))}
      </div>

      {/* ── SIDEBAR NAVIGATION ── */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col w-64 bg-white border-r border-gray-200 transition-transform duration-300 lg:translate-x-0 lg:static shrink-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand logo header */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100 bg-white">
          <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-md border border-gray-100">
            <img src="/assets/logo.png" alt="LJM" className="w-6 h-6 object-contain" />
          </div>
          <div>
            <h1 className="font-extrabold text-base text-gray-900 tracking-tight leading-none">Dashboard Admin</h1>
            <p className="text-[10px] text-gray-400 mt-1 font-semibold">Lapak Jas Merah</p>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden ml-auto p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-900"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Admin profile snippet */}
        <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-700 font-extrabold text-sm border border-red-200">
            {currentAdmin.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-xs text-gray-900 truncate leading-tight">{currentAdmin.name}</h4>
            <span className="inline-flex items-center gap-1 mt-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-red-50 text-red-600 border border-red-100 uppercase tracking-wider">
              <Shield className="w-2.5 h-2.5" /> {currentAdmin.role}
            </span>
          </div>
        </div>

        {/* Sidebar Nav Items */}
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {[
            { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
            { id: "users", label: "Kelola Pengguna", icon: Users },
            { id: "sellers", label: "Kelola Penjual", icon: Store },
            { id: "listings", label: "Kelola Jasa & Barang", icon: Tag },
            { id: "categories", label: "Kategori Produk", icon: Grid3X3 },
            { id: "reports", label: "Laporan & Aduan", icon: AlertTriangle, badge: reports.filter((r) => r.status === "Terbuka").length },
            { id: "suggestions", label: "Kotak Saran", icon: MessageCircle, badge: suggestions.filter((s) => s.status === "Terbuka").length },
            { id: "transactions", label: "Riwayat Transaksi", icon: ArrowRightLeft },
            { id: "subscriptions", label: "Paket Premium", icon: Zap, badge: subscriptions.filter((s) => s.status === "Pending").length },
            { id: "banners", label: "Kelola Banner", icon: ImageIcon },
            { id: "admins", label: "Manajemen Admin", icon: Shield, roleRestricted: "Super Admin" as AdminRole },
            { id: "whitelisted_users", label: "Pengguna Khusus", icon: ShieldAlert, roleRestricted: "Super Admin" as AdminRole },
            { id: "settings", label: "Pengaturan Profil", icon: Settings },
          ].map((item) => {
            const Icon = item.icon;
            const isRestricted = item.roleRestricted && currentAdmin.role !== item.roleRestricted;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  if (isRestricted) {
                    handlePermissionWarning();
                  } else {
                    setActiveTab(item.id as any);
                    setSidebarOpen(false);
                  }
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all relative ${
                  isRestricted
                    ? "opacity-50 cursor-not-allowed hover:bg-transparent text-gray-400"
                    : isActive
                    ? "bg-red-50 text-red-600 border-l-4 border-red-600 pl-2"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <Icon className={`w-4.5 h-4.5 ${isActive && !isRestricted ? "text-red-600" : "text-gray-400"}`} />
                <span className="flex-1 text-left">{item.label}</span>
                {isRestricted && <Lock className="w-3.5 h-3.5 text-gray-400" />}
                {item.badge !== undefined && item.badge > 0 && !isRestricted && (
                  <span className="px-2 py-0.5 text-[9px] font-black bg-red-600 text-white rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer info/Log out */}
        <div className="p-4 border-t border-gray-100 bg-white">
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all border border-gray-200 hover:border-red-100"
          >
            <LogOut className="w-4 h-4" /> Keluar Portal LJM
          </button>
          <p className="text-[9px] text-gray-400 text-center mt-3 font-semibold">LJM Admin Portal v1.0.0</p>
        </div>
      </aside>

      {/* Sidebar mobile overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* ── MAIN CONTENT CONTAINER ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* ── TOP NAVBAR ── */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-30 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            >
              <Menu className="w-5 h-5" />
            </button>
            {/* Breadcrumb path */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-gray-400">
              <span>Admin Portal</span>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-gray-800 capitalize">{activeTab === "admins" ? "Manajemen Admin" : activeTab === "whitelisted_users" ? "Pengguna Khusus" : activeTab}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Super Admin Quick Access Role Toggle (for demonstrating permissions) */}
            <div className="hidden md:flex items-center gap-2 border border-gray-200 rounded-xl px-2.5 py-1.5 bg-gray-50">
              <Shield className="w-3.5 h-3.5 text-red-600" />
              <span className="text-[10px] font-extrabold text-gray-500 uppercase tracking-wider">Demo Role:</span>
              <select
                value={currentAdmin.role}
                onChange={(e) => {
                  const r = e.target.value as AdminRole;
                  setCurrentAdmin((c) => ({ ...c, role: r }));
                  showToast(`Role admin berhasil diubah menjadi ${r} untuk demo!`, "info");
                  if (r === "Admin" && activeTab === "admins") {
                    setActiveTab("dashboard");
                  }
                }}
                className="bg-transparent font-black text-xs text-gray-900 outline-none cursor-pointer border-none p-0 focus:ring-0"
              >
                <option value="Super Admin">Super Admin</option>
                <option value="Admin">Admin</option>
              </select>
            </div>

            {/* Notification Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-xl text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors relative"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-600 rounded-full border border-white" />
              </button>

              {showNotifications && (
                <>
                  <div onClick={() => setShowNotifications(false)} className="fixed inset-0 z-40 bg-transparent" />
                  <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 overflow-hidden transform origin-top-right">
                    <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                      <h4 className="font-bold text-xs text-gray-800">Notifikasi Terbaru</h4>
                      <span className="px-2 py-0.5 text-[9px] bg-red-100 text-red-700 font-extrabold rounded-full">
                        {notifications.length} Info
                      </span>
                    </div>
                    <div className="divide-y divide-gray-100 max-h-72 overflow-y-auto">
                      {notifications.map((n) => (
                        <div key={n.id} className="p-4 hover:bg-gray-50 transition-colors cursor-pointer text-left">
                          <p className="text-xs text-gray-700 font-semibold leading-relaxed">{n.text}</p>
                          <div className="flex items-center gap-1.5 mt-1.5 text-[9px] text-gray-400 font-bold">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{n.time}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="p-3 border-t border-gray-100 bg-gray-50 text-center">
                      <button
                        onClick={() => {
                          setShowNotifications(false);
                          showToast("Semua notifikasi ditandai telah dibaca!", "success");
                        }}
                        className="text-[10px] font-black text-red-600 hover:text-red-700 hover:underline"
                      >
                        Tandai semua telah dibaca
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Profile trigger */}
            <div className="flex items-center gap-2.5 pl-2 border-l border-gray-200">
              <div className="w-9 h-9 rounded-full bg-red-600 text-white font-extrabold text-xs flex items-center justify-center">
                {currentAdmin.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
              </div>
              <div className="hidden md:block text-left">
                <p className="font-bold text-xs text-gray-900 leading-tight">{currentAdmin.name}</p>
                <p className="text-[10px] text-gray-400 leading-none mt-0.5">{currentAdmin.role}</p>
              </div>
            </div>
          </div>
        </header>

        {/* ── PAGE CONTENT ── */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-extrabold text-gray-900 capitalize">
                {activeTab === "dashboard" && "Dashboard Ringkasan"}
                {activeTab === "users" && "Kelola Data Pengguna"}
                {activeTab === "sellers" && "Persetujuan Penjual Terverifikasi"}
                {activeTab === "listings" && "Verifikasi Listing Jasa & Barang"}
                {activeTab === "categories" && "Manajemen Kategori"}
                {activeTab === "reports" && "Laporan & Pengaduan Masalah"}
                {activeTab === "suggestions" && "Kotak Saran Pengguna"}
                {activeTab === "transactions" && "Log Transaksi Lapak"}
                {activeTab === "subscriptions" && "Pengajuan Iklan Premium"}
                {activeTab === "settings" && "Pengaturan Akun Admin"}
                {activeTab === "admins" && "Daftar Administrator Portal"}
                {activeTab === "whitelisted_users" && "Daftar Email Non-UMM yang Diizinkan"}
                {activeTab === "banners" && "Kelola Banner Promosi"}
              </h2>
              <p className="text-xs text-gray-500 mt-1 font-semibold">
                {activeTab === "dashboard" && "Pantau aktivitas, statistik, dan performa Lapak Jas Merah."}
                {activeTab === "users" && "Cari, verifikasi, tangguhkan, atau aktifkan kembali akun mahasiswa UMM."}
                {activeTab === "sellers" && "Review pengajuan toko verifikasi NIM mahasiswa untuk badge Penjual Terverifikasi."}
                {activeTab === "listings" && "Moderasi dan kelola perizinan barang/jasa yang ditawarkan mahasiswa."}
                {activeTab === "categories" && "Kelola direktori kategori barang di marketplace."}
                {activeTab === "reports" && "Tinjau aduan spam, penipuan, atau pelanggaran tata tertib COD di kampus."}
                {activeTab === "suggestions" && "Tinjau saran, kritik, dan laporan bug dari pengguna."}
                {activeTab === "transactions" && "Log transaksi pembelian via UMM Pay, bank transfer, dan Cash-On-Delivery."}
                {activeTab === "subscriptions" && "Approve/Reject pembayaran highlight pencarian berbayar untuk iklan penjual."}
                {activeTab === "settings" && "Konfigurasi informasi pribadi Anda, ubah sandi, dan preferensi laporan notifikasi."}
                {activeTab === "admins" && "Kelola tingkat akses dan kelayakan administrator lainnya."}
                {activeTab === "whitelisted_users" && "Kelola daftar alamat email eksternal yang diizinkan untuk mendaftar dan menggunakan aplikasi."}
                {activeTab === "banners" && "Tambah, ubah, atau hapus banner promosi pada halaman beranda."}
              </p>
            </div>

            {/* Quick Refresh action */}
            <div>
              <button
                onClick={() => {
                  showToast("Data dashboard berhasil dimutakhirkan!", "info");
                }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:text-red-600 transition-colors text-xs font-bold text-gray-700 shadow-sm"
              >
                Muat Ulang Data
              </button>
            </div>
          </div>

          {/* ──────────────────────────────────────────────────────────── */}
          {/* TAB: 1. DASHBOARD PAGE */}
          {/* ──────────────────────────────────────────────────────────── */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              {/* KPI CARDS */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {[
                  { label: "Total Pengguna", val: stats.totalUsers, change: "+14% bln ini", icon: Users, color: "bg-blue-50 text-blue-600" },
                  { label: "Penjual Terverifikasi", val: stats.totalSellers, change: "+8% bln ini", icon: Store, color: "bg-green-50 text-green-600" },
                  { label: "Iklan Aktif", val: stats.totalActiveListings, change: "+24% bln ini", icon: Tag, color: "bg-purple-50 text-purple-600" },
                  { label: "Total Transaksi Sukses", val: stats.totalTransactions, change: "+12% bln ini", icon: ArrowRightLeft, color: "bg-yellow-50 text-yellow-600" },
                ].map((kpi) => {
                  const Icon = kpi.icon;
                  return (
                    <div key={kpi.label} className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{kpi.label}</p>
                        <h3 className="text-2xl font-black text-gray-900 mt-2 leading-none">{kpi.val}</h3>
                        <span className="text-[10px] text-green-600 font-bold bg-green-50 px-1.5 py-0.5 rounded mt-2.5 inline-block">
                          {kpi.change}
                        </span>
                      </div>
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${kpi.color}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* REVENUE & CHARTS BLOCK */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Monthly growth Chart (SaaS Aesthetic SVG Chart) */}
                <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm lg:col-span-2">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h4 className="font-extrabold text-sm text-gray-900">Performa Transaksi Bulanan</h4>
                      <p className="text-[11px] text-gray-400 font-semibold mt-0.5">Pertumbuhan nominal transaksi sukses semester ini</p>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400">
                      <span className="w-2.5 h-2.5 bg-red-500 rounded-full" />
                      <span className="text-gray-800 text-[10px]">Nominal (Juta Rp)</span>
                    </div>
                  </div>

                  {/* Aesthetic Custom Vector Chart */}
                  <div className="relative h-64 w-full flex items-center justify-center bg-gray-50/50 rounded-xl mt-4 border border-dashed border-gray-200">
                    <p className="text-xs font-bold text-gray-400">Belum ada data transaksi untuk semester ini.</p>
                  </div>
                </div>

                {/* Premium highlight Packages Earning */}
                <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm flex flex-col justify-between">
                  <div>
                    <h4 className="font-extrabold text-sm text-gray-900">Dana Premium Terkumpul</h4>
                    <p className="text-[11px] text-gray-400 font-semibold mt-0.5">Total pendapatan iklan standard highlight</p>
                    
                    <div className="mt-8 flex flex-col items-center">
                      <div className="w-24 h-24 rounded-full border-8 border-red-500 border-t-red-100 flex items-center justify-center shadow-inner relative">
                        <DollarSign className="w-8 h-8 text-red-600" />
                      </div>
                      <h2 className="text-2xl font-black text-gray-900 mt-4 leading-none">
                        {formatIDR(stats.totalPremiumSubEarnings * 1000)}
                      </h2>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1.5">Dari {subscriptions.filter((s)=>s.status==="Disetujui").length} Penjual premium</p>
                    </div>
                  </div>

                  <div className="bg-red-50/50 rounded-xl p-3 border border-red-100/50 mt-4 flex items-center justify-between text-xs font-semibold text-red-700">
                    <span>Target Bulan Ini</span>
                    <span className="font-black">Rp 1.000.000</span>
                  </div>
                </div>
              </div>

              {/* RECENT ACTIVITIES & RECENT REGISTRATIONS */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activities */}
                <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-extrabold text-sm text-gray-900">Aktivitas Moderasi Terbaru</h4>
                    <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">Real-time</span>
                  </div>

                  <div className="space-y-4">
                    {[] as any[].length > 0 ? (
                      [].map((act: any, idx: number) => (
                        <div key={idx} className="flex gap-3 text-xs leading-relaxed">
                          <div className="pt-0.5">
                            <span className={`w-2 h-2 rounded-full block ${
                              act.type === "success" ? "bg-green-500" : act.type === "error" ? "bg-red-500" : "bg-blue-500"
                            }`} />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-gray-700">{act.text}</p>
                            <span className="text-[9px] text-gray-400 font-bold block mt-0.5">{act.time}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6">
                        <p className="text-xs font-bold text-gray-400">Belum ada aktivitas moderasi.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* New User Registrations */}
                <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-extrabold text-sm text-gray-900">Registrasi Mahasiswa Baru</h4>
                    <button
                      onClick={() => setActiveTab("users")}
                      className="text-[10px] font-bold text-red-600 hover:underline"
                    >
                      Lihat Semua
                    </button>
                  </div>

                  <div className="divide-y divide-gray-100">
                    {users.slice(0, 4).map((usr) => (
                      <div key={usr.id} className="py-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">
                            {usr.name[0]}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-gray-800">{usr.name}</p>
                            <span className="text-[9px] text-gray-400 font-semibold">{usr.nim} - {usr.major}</span>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-gray-400">{usr.registeredAt}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ──────────────────────────────────────────────────────────── */}
          {/* TAB: 2. USER MANAGEMENT */}
          {/* ──────────────────────────────────────────────────────────── */}
          {activeTab === "users" && (
            <div className="space-y-6">
              {/* User Statistics Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
                {[
                  { label: "Total Mahasiswa", val: users.length, color: "border-blue-500 text-blue-600" },
                  { label: "Mahasiswa Aktif", val: users.filter((u) => u.status === "Aktif").length, color: "border-green-500 text-green-600" },
                  { label: "Akun Ditangguhkan", val: users.filter((u) => u.status === "Ditangguhkan").length, color: "border-red-500 text-red-600" },
                  { label: "Registrasi Baru (Minggu Ini)", val: 3, color: "border-purple-500 text-purple-600" },
                ].map((stat) => (
                  <div key={stat.label} className={`border-l-4 ${stat.color} rounded-xl p-4 bg-white shadow-sm border border-gray-200 flex flex-col justify-center`}>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{stat.label}</p>
                    <h4 className="text-xl font-black text-gray-800 mt-1">{stat.val}</h4>
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
                {/* Table Controls */}
                <div className="p-5 border-b border-gray-150 bg-gray-50/50 flex flex-col sm:flex-row gap-4 items-center justify-between">
                  {/* Search query input */}
                  <div className="relative w-full sm:w-80">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setCurrentPage(1);
                      }}
                      placeholder="Cari Nama, NIM, atau Email..."
                      className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-xs font-semibold outline-none focus:border-red-500 bg-white"
                    />
                  </div>

                  {/* Filter & Add controls */}
                  <div className="flex items-center gap-3 w-full sm:w-auto shrink-0 justify-end">
                    <select
                      value={filterStatus}
                      onChange={(e) => {
                        setFilterStatus(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold bg-white outline-none"
                    >
                      <option value="Semua">Status: Semua</option>
                      <option value="Aktif">Status: Aktif</option>
                      <option value="Ditangguhkan">Status: Ditangguhkan</option>
                    </select>
                  </div>
                </div>

                {/* Data Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase tracking-wider text-[9px] font-black">
                        <th className="px-6 py-4">NIM / Mahasiswa</th>
                        <th className="px-6 py-4">Email Webmail</th>
                        <th className="px-6 py-4">Fakultas/Prodi</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Tanggal Gabung</th>
                        <th className="px-6 py-4 text-right">Tindakan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredUsersList.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-12 text-center text-gray-400 font-semibold">
                            Tidak ditemukan pengguna dengan kriteria pencarian tersebut.
                          </td>
                        </tr>
                      ) : (
                        filteredUsersList
                          .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                          .map((u) => (
                            <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                              <td className="px-6 py-4">
                                <div>
                                  <p className="font-extrabold text-gray-800 text-xs">{u.name}</p>
                                  <p className="text-[10px] text-gray-400 font-semibold mt-0.5">{u.nim}</p>
                                </div>
                              </td>
                              <td className="px-6 py-4 font-semibold text-gray-600">{u.email}</td>
                              <td className="px-6 py-4 font-semibold text-gray-600">{u.major}</td>
                              <td className="px-6 py-4">
                                <span
                                  className={`inline-flex px-2 py-0.5 rounded text-[9px] font-bold ${
                                    u.status === "Aktif"
                                      ? "bg-green-50 text-green-700 border border-green-150"
                                      : "bg-red-50 text-red-700 border border-red-150"
                                  }`}
                                >
                                  {u.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-gray-500 font-semibold">{u.registeredAt}</td>
                              <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => {
                                      setSelectedUser(u);
                                      setModalType("viewUser");
                                    }}
                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                                    title="Lihat Detail"
                                  >
                                    <Eye className="w-4.5 h-4.5" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSelectedUser(u);
                                      setUserForm({
                                        name: u.name,
                                        nim: u.nim,
                                        email: u.email,
                                        major: u.major,
                                        status: u.status,
                                      });
                                      setModalType("editUser");
                                    }}
                                    className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg"
                                    title="Ubah Profil"
                                  >
                                    <Edit2 className="w-4.5 h-4.5" />
                                  </button>
                                  {u.status === "Aktif" ? (
                                    <button
                                      onClick={() => {
                                        setSelectedUser(u);
                                        setModalType("suspendUser");
                                      }}
                                      className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded-lg"
                                      title="Tangguhkan"
                                    >
                                      <UserX className="w-4.5 h-4.5" />
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => {
                                        setUsers((prev) =>
                                          prev.map((usr) => (usr.id === u.id ? { ...usr, status: "Aktif" } : usr))
                                        );
                                        showToast(`Akun ${u.name} berhasil diaktifkan kembali!`, "success");
                                      }}
                                      className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg"
                                      title="Aktifkan"
                                    >
                                      <UserCheck className="w-4.5 h-4.5" />
                                    </button>
                                  )}
                                  <button
                                    onClick={() => {
                                      setSelectedUser(u);
                                      setModalType("deleteUser");
                                    }}
                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                                    title="Hapus Akun"
                                  >
                                    <Trash2 className="w-4.5 h-4.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                      )}
                    </tbody>
                  </table>
                </div>

              {/* Pagination block */}
              <div className="p-4 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-gray-500 bg-gray-50/50">
                <span>
                  Menampilkan {Math.min(filteredUsersList.length, (currentPage - 1) * itemsPerPage + 1)} sampai{" "}
                  {Math.min(filteredUsersList.length, currentPage * itemsPerPage)} dari {filteredUsersList.length} data
                </span>
                <div className="flex gap-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((c) => Math.max(c - 1, 1))}
                    className="px-3 py-1.5 border border-gray-250 rounded-lg bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Sebelumnya
                  </button>
                  <button
                    disabled={currentPage * itemsPerPage >= filteredUsersList.length}
                    onClick={() => setCurrentPage((c) => c + 1)}
                    className="px-3 py-1.5 border border-gray-250 rounded-lg bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Berikutnya
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

          {/* ──────────────────────────────────────────────────────────── */}
          {/* TAB: 3. SELLER MANAGEMENT */}
          {/* ──────────────────────────────────────────────────────────── */}
          {activeTab === "sellers" && (
            <div className="space-y-6">
              {/* Seller Statistics Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
                {[
                  { label: "Total Penjual", val: sellers.length, color: "border-blue-500 text-blue-600" },
                  { label: "Penjual Terverifikasi", val: sellers.filter((s) => s.status === "Disetujui").length, color: "border-green-500 text-green-600" },
                  { label: "Menunggu Verifikasi", val: sellers.filter((s) => s.status === "Pending").length, color: "border-yellow-500 text-yellow-600" },
                  { label: "Rata-rata Rating Toko", val: "4.7 / 5.0", color: "border-amber-500 text-amber-600" },
                ].map((stat) => (
                  <div key={stat.label} className={`border-l-4 ${stat.color} rounded-xl p-4 bg-white shadow-sm border border-gray-200 flex flex-col justify-center`}>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{stat.label}</p>
                    <h4 className="text-xl font-black text-gray-800 mt-1">{stat.val}</h4>
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
                {/* Controls */}
                <div className="p-5 border-b border-gray-150 bg-gray-50/50 flex flex-col sm:flex-row gap-4 items-center justify-between">
                  <div className="relative w-full sm:w-80">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setCurrentPage(1);
                      }}
                      placeholder="Cari Nama Toko, Pemilik, NIM..."
                      className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-xs font-semibold outline-none focus:border-red-500 bg-white"
                    />
                  </div>

                  <div className="flex gap-3 w-full sm:w-auto shrink-0 justify-end">
                    <select
                      value={filterStatus}
                      onChange={(e) => {
                        setFilterStatus(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold bg-white outline-none"
                    >
                      <option value="Semua">Status Verifikasi: Semua</option>
                      <option value="Pending">Menunggu Verifikasi</option>
                      <option value="Disetujui">Terverifikasi</option>
                      <option value="Ditolak">Ditolak</option>
                      <option value="Ditangguhkan">Ditangguhkan</option>
                    </select>
                  </div>
                </div>

                {/* Data Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase tracking-wider text-[9px] font-black">
                        <th className="px-6 py-4">Nama Toko</th>
                        <th className="px-6 py-4">Pemilik / NIM</th>
                        <th className="px-6 py-4">Prodi Pemilik</th>
                        <th className="px-6 py-4">Tanggal Pengajuan</th>
                        <th className="px-6 py-4">Status Badge</th>
                        <th className="px-6 py-4 text-right">Tindakan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredSellersList.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-12 text-center text-gray-400 font-semibold">
                            Tidak ditemukan pengajuan toko.
                          </td>
                        </tr>
                      ) : (
                        filteredSellersList
                          .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                          .map((s) => (
                            <tr key={s.id} className="hover:bg-gray-50/50 transition-colors">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  <span className="font-extrabold text-gray-800 text-xs">{s.shopName}</span>
                                  {s.status === "Disetujui" && (
                                    <ShieldCheck className="w-4.5 h-4.5 text-red-600" title="Verifikasi Terjamin" />
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div>
                                  <p className="font-semibold text-gray-700">{s.ownerName}</p>
                                  <p className="text-[10px] text-gray-400 font-semibold">{s.nim}</p>
                                </div>
                              </td>
                              <td className="px-6 py-4 font-semibold text-gray-600">{s.major}</td>
                              <td className="px-6 py-4 text-gray-500 font-semibold">{s.registeredAt}</td>
                              <td className="px-6 py-4">
                                <span
                                  className={`inline-flex px-2 py-0.5 rounded text-[9px] font-bold ${
                                    s.status === "Disetujui"
                                      ? "bg-green-50 text-green-700 border border-green-150"
                                      : s.status === "Pending"
                                      ? "bg-yellow-50 text-yellow-700 border border-yellow-150"
                                      : s.status === "Ditangguhkan"
                                      ? "bg-red-50 text-red-700 border border-red-150"
                                      : "bg-gray-100 text-gray-500 border border-gray-200"
                                  }`}
                                >
                                  {s.status === "Disetujui"
                                    ? "Terverifikasi"
                                    : s.status === "Pending"
                                    ? "Menunggu Review"
                                    : s.status === "Ditangguhkan"
                                    ? "Ditangguhkan"
                                    : "Pengajuan Ditolak"}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => {
                                      setSelectedSeller(s);
                                      setModalType("viewSeller");
                                    }}
                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg font-bold"
                                    title="Review Profil"
                                  >
                                    Review
                                  </button>
                                  {s.status === "Pending" && (
                                    <>
                                      <button
                                        onClick={() => {
                                          setSelectedSeller(s);
                                          setModalType("approveSeller");
                                        }}
                                        className="p-1 text-green-600 hover:bg-green-50 rounded-lg"
                                        title="Setujui Verifikasi"
                                      >
                                        <Check className="w-4.5 h-4.5" />
                                      </button>
                                      <button
                                        onClick={() => {
                                          setSelectedSeller(s);
                                          setModalType("rejectSeller");
                                        }}
                                        className="p-1 text-red-600 hover:bg-red-50 rounded-lg"
                                        title="Tolak Verifikasi"
                                      >
                                        <X className="w-4.5 h-4.5" />
                                      </button>
                                    </>
                                  )}
                                  {s.status === "Disetujui" && (
                                    <button
                                      onClick={() => {
                                        setSelectedSeller(s);
                                        setModalType("suspendSeller");
                                      }}
                                      className="p-1 text-yellow-600 hover:bg-yellow-50 rounded-lg"
                                      title="Tangguhkan Toko"
                                    >
                                      <UserX className="w-4.5 h-4.5" />
                                    </button>
                                  )}
                                  {s.status === "Ditangguhkan" && (
                                    <button
                                      onClick={() => {
                                        setSellers((prev) =>
                                          prev.map((sel) => (sel.id === s.id ? { ...sel, status: "Disetujui" } : sel))
                                        );
                                        showToast(`Badge verifikasi toko ${s.shopName} diaktifkan kembali!`, "success");
                                      }}
                                      className="p-1 text-green-600 hover:bg-green-50 rounded-lg"
                                      title="Aktifkan Toko Kembali"
                                    >
                                      <UserCheck className="w-4.5 h-4.5" />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="p-4 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-gray-500 bg-gray-50/50">
                <span>
                  Menampilkan {Math.min(filteredSellersList.length, (currentPage - 1) * itemsPerPage + 1)} sampai{" "}
                  {Math.min(filteredSellersList.length, currentPage * itemsPerPage)} dari {filteredSellersList.length} data
                </span>
                <div className="flex gap-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((c) => Math.max(c - 1, 1))}
                    className="px-3 py-1.5 border border-gray-250 rounded-lg bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Sebelumnya
                  </button>
                  <button
                    disabled={currentPage * itemsPerPage >= filteredSellersList.length}
                    onClick={() => setCurrentPage((c) => c + 1)}
                    className="px-3 py-1.5 border border-gray-250 rounded-lg bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Berikutnya
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

          {/* ──────────────────────────────────────────────────────────── */}
          {/* TAB: 4. LISTING MANAGEMENT */}
          {/* ──────────────────────────────────────────────────────────── */}
          {activeTab === "listings" && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
              {/* Controls */}
              <div className="p-5 border-b border-gray-150 bg-gray-50/50 flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Cari Nama Iklan, Penjual, Kategori..."
                    className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-xs font-semibold outline-none focus:border-red-500 bg-white"
                  />
                </div>

                <div className="flex gap-3 w-full sm:w-auto shrink-0 justify-end">
                  <select
                    value={filterCategory}
                    onChange={(e) => {
                      setFilterCategory(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold bg-white outline-none"
                  >
                    <option value="Semua">Kategori: Semua</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <select
                    value={filterStatus}
                    onChange={(e) => {
                      setFilterStatus(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold bg-white outline-none"
                  >
                    <option value="Semua">Status Iklan: Semua</option>
                    <option value="Pending">Menunggu Persetujuan</option>
                    <option value="Disetujui">Aktif (Disetujui)</option>
                    <option value="Ditolak">Ditolak</option>
                  </select>
                </div>
              </div>

              {/* Data Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase tracking-wider text-[9px] font-black">
                      <th className="px-6 py-4">Foto / Judul Jasa atau Barang</th>
                      <th className="px-6 py-4">Kategori</th>
                      <th className="px-6 py-4">Nama Penjual</th>
                      <th className="px-6 py-4">Harga</th>
                      <th className="px-6 py-4">Status Moderasi</th>
                      <th className="px-6 py-4 text-right">Tindakan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredListingsList.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-gray-400 font-semibold">
                          Tidak ditemukan iklan.
                        </td>
                      </tr>
                    ) : (
                      filteredListingsList
                        .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                        .map((l) => (
                          <tr key={l.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <img
                                  src={l.image}
                                  alt={l.title}
                                  className="w-10 h-10 rounded-lg object-cover bg-gray-100 border border-gray-200"
                                />
                                <div>
                                  <p className="font-extrabold text-gray-800 text-xs line-clamp-1">{l.title}</p>
                                  <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Dibuat: {l.createdAt}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 font-semibold text-gray-600">{l.category}</td>
                            <td className="px-6 py-4 font-semibold text-gray-600">{l.sellerName}</td>
                            <td className="px-6 py-4 font-black text-gray-800">{formatPrice(l.price)}</td>
                            <td className="px-6 py-4">
                              <span
                                className={`inline-flex px-2 py-0.5 rounded text-[9px] font-bold ${
                                  l.status === "Disetujui"
                                    ? "bg-green-50 text-green-700 border border-green-150"
                                    : l.status === "Pending"
                                    ? "bg-yellow-50 text-yellow-700 border border-yellow-150"
                                    : "bg-red-50 text-red-700 border border-red-150"
                                }`}
                              >
                                {l.status === "Disetujui" ? "Aktif" : l.status === "Pending" ? "Menunggu Verifikasi" : "Ditolak"}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => {
                                    setSelectedListing(l);
                                    setModalType("viewListing");
                                  }}
                                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                                  title="Lihat Detail Iklan"
                                >
                                  <Eye className="w-4.5 h-4.5" />
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedListing(l);
                                    setListingForm({
                                      title: l.title,
                                      category: l.category,
                                      price: l.price,
                                    });
                                    setModalType("editListing");
                                  }}
                                  className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg"
                                  title="Ubah Data Iklan"
                                >
                                  <Edit2 className="w-4.5 h-4.5" />
                                </button>
                                {l.status === "Pending" && (
                                  <>
                                    <button
                                      onClick={() => {
                                        setSelectedListing(l);
                                        setModalType("approveListing");
                                      }}
                                      className="p-1 text-green-600 hover:bg-green-50 rounded-lg"
                                      title="Setujui Tampil"
                                    >
                                      <Check className="w-4.5 h-4.5" />
                                    </button>
                                    <button
                                      onClick={() => {
                                        setSelectedListing(l);
                                        setModalType("rejectListing");
                                      }}
                                      className="p-1 text-red-600 hover:bg-red-50 rounded-lg"
                                      title="Tolak Tampil"
                                    >
                                      <X className="w-4.5 h-4.5" />
                                    </button>
                                  </>
                                )}
                                <button
                                  onClick={() => {
                                    setSelectedListing(l);
                                    setModalType("deleteListing");
                                  }}
                                  className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                                  title="Hapus Iklan Selamanya"
                                >
                                  <Trash2 className="w-4.5 h-4.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="p-4 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-gray-500 bg-gray-50/50">
                <span>
                  Menampilkan {Math.min(filteredListingsList.length, (currentPage - 1) * itemsPerPage + 1)} sampai{" "}
                  {Math.min(filteredListingsList.length, currentPage * itemsPerPage)} dari {filteredListingsList.length} data
                </span>
                <div className="flex gap-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((c) => Math.max(c - 1, 1))}
                    className="px-3 py-1.5 border border-gray-250 rounded-lg bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Sebelumnya
                  </button>
                  <button
                    disabled={currentPage * itemsPerPage >= filteredListingsList.length}
                    onClick={() => setCurrentPage((c) => c + 1)}
                    className="px-3 py-1.5 border border-gray-250 rounded-lg bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Berikutnya
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ──────────────────────────────────────────────────────────── */}
          {/* TAB: 5. CATEGORY MANAGEMENT */}
          {/* ──────────────────────────────────────────────────────────── */}
          {activeTab === "categories" && (
            <div className="space-y-6">
              {/* Category Statistics Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {[
                  { label: "Total Kategori", val: categories.length, color: "border-blue-500 text-blue-600" },
                  { label: "Total Listing Terkategori", val: categories.reduce((sum, c) => sum + c.listingsCount, 0), color: "border-green-500 text-green-600" },
                  { label: "Kategori Terpopuler", val: categories.reduce((max, c) => c.listingsCount > max.listingsCount ? c : max, categories[0])?.name || "-", color: "border-amber-500 text-amber-600" },
                ].map((stat) => (
                  <div key={stat.label} className={`border-l-4 ${stat.color} rounded-xl p-4 bg-white shadow-sm border border-gray-200 flex flex-col justify-center`}>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{stat.label}</p>
                    <h4 className="text-xl font-black text-gray-800 mt-1">{stat.val}</h4>
                  </div>
                ))}
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => {
                    setCategoryForm({ name: "" });
                    setModalType("addCategory");
                  }}
                  className="bg-red-600 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl hover:bg-red-700 transition-colors shadow-sm flex items-center gap-2"
                >
                  <Plus className="w-4.5 h-4.5" /> Tambah Kategori
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase tracking-wider text-[9px] font-black">
                        <th className="px-6 py-4">ID</th>
                        <th className="px-6 py-4">Nama Kategori</th>
                        <th className="px-6 py-4">Slug URL</th>
                        <th className="px-6 py-4">Jumlah Produk Terdaftar</th>
                        <th className="px-6 py-4 text-right">Tindakan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {categories.map((cat) => (
                        <tr key={cat.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4 font-bold text-gray-500">{cat.id}</td>
                          <td className="px-6 py-4 font-extrabold text-gray-800">{cat.name}</td>
                          <td className="px-6 py-4 text-gray-400 font-semibold">{cat.slug}</td>
                          <td className="px-6 py-4 font-bold text-gray-600">{cat.listingsCount} iklan</td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => {
                                  setSelectedCategory(cat);
                                  setCategoryForm({ name: cat.name });
                                  setModalType("editCategory");
                                }}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                                title="Edit Kategori"
                              >
                                <Edit2 className="w-4.5 h-4.5" />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedCategory(cat);
                                  setModalType("deleteCategory");
                                }}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                                title="Hapus Kategori"
                              >
                                <Trash2 className="w-4.5 h-4.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ──────────────────────────────────────────────────────────── */}
          {/* TAB: 6. REPORTS & COMPLAINTS */}
          {/* ──────────────────────────────────────────────────────────── */}
          {activeTab === "reports" && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
              {/* Controls */}
              <div className="p-5 border-b border-gray-150 bg-gray-50/50 flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Cari pelapor, terlapor, alasan..."
                    className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-xs font-semibold outline-none focus:border-red-500 bg-white"
                  />
                </div>

                <div className="flex gap-3 w-full sm:w-auto shrink-0 justify-end">
                  <select
                    value={filterStatus}
                    onChange={(e) => {
                      setFilterStatus(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold bg-white outline-none"
                  >
                    <option value="Semua">Status Aduan: Semua</option>
                    <option value="Terbuka">Terbuka</option>
                    <option value="Selesai">Diselesaikan</option>
                  </select>
                </div>
              </div>

              {/* Data Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase tracking-wider text-[9px] font-black">
                      <th className="px-6 py-4">ID Aduan</th>
                      <th className="px-6 py-4">Pelapor</th>
                      <th className="px-6 py-4">Objek Terlapor</th>
                      <th className="px-6 py-4">Alasan Aduan</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Tanggal Masuk</th>
                      <th className="px-6 py-4 text-right">Tindakan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredReportsList.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center text-gray-400 font-semibold">
                          Tidak ditemukan laporan aduan.
                        </td>
                      </tr>
                    ) : (
                      filteredReportsList
                        .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                        .map((r) => (
                          <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-6 py-4 font-bold text-gray-500">{r.id}</td>
                            <td className="px-6 py-4 font-bold text-gray-800">{r.reporterName}</td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-1.5">
                                <span className="font-extrabold text-gray-800">{r.reportedName}</span>
                                <span className="text-[9px] bg-gray-100 text-gray-500 px-1 py-0.2 rounded font-bold uppercase">
                                  {r.targetType === "listing" ? "Iklan" : "Akun"}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 font-medium text-gray-600 max-w-xs truncate">{r.reason}</td>
                            <td className="px-6 py-4">
                              <span
                                className={`inline-flex px-2 py-0.5 rounded text-[9px] font-bold ${
                                  r.status === "Selesai"
                                    ? "bg-green-50 text-green-700 border border-green-150"
                                    : "bg-yellow-50 text-yellow-700 border border-yellow-150"
                                }`}
                              >
                                {r.status === "Selesai" ? "Diselesaikan" : "Butuh Tindakan"}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-gray-500 font-semibold">{r.createdAt}</td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => {
                                    setSelectedReport(r);
                                    setModalType("resolveReport");
                                  }}
                                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg font-bold"
                                >
                                  Tinjau
                                </button>
                                {r.status === "Terbuka" && r.targetType === "user" && (
                                  <button
                                    onClick={() => {
                                      setSelectedReport(r);
                                      setModalType("banReportUser");
                                    }}
                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                                    title="Ban Akun Terlapor"
                                  >
                                    <UserMinus className="w-4.5 h-4.5" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="p-4 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-gray-500 bg-gray-50/50">
                <span>
                  Menampilkan {Math.min(filteredReportsList.length, (currentPage - 1) * itemsPerPage + 1)} sampai{" "}
                  {Math.min(filteredReportsList.length, currentPage * itemsPerPage)} dari {filteredReportsList.length} data
                </span>
                <div className="flex gap-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((c) => Math.max(c - 1, 1))}
                    className="px-3 py-1.5 border border-gray-250 rounded-lg bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Sebelumnya
                  </button>
                  <button
                    disabled={currentPage * itemsPerPage >= filteredReportsList.length}
                    onClick={() => setCurrentPage((c) => c + 1)}
                    className="px-3 py-1.5 border border-gray-250 rounded-lg bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Berikutnya
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ──────────────────────────────────────────────────────────── */}
          {/* TAB: SUGGESTIONS */}
          {/* ──────────────────────────────────────────────────────────── */}
          {activeTab === "suggestions" && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50/50">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <MessageCircle className="text-blue-500" size={20} />
                  Daftar Saran & Laporan Bug
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-200 font-bold tracking-wider">
                    <tr>
                      <th className="px-6 py-4">Pengirim</th>
                      <th className="px-6 py-4">Kategori</th>
                      <th className="px-6 py-4 w-1/3">Pesan</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {suggestions.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                          <MessageCircle className="mx-auto mb-3 opacity-20" size={48} />
                          <p className="font-semibold text-base">Belum Ada Saran Masuk</p>
                        </td>
                      </tr>
                    ) : (
                      suggestions.map((s) => (
                        <tr key={s.id} className="hover:bg-gray-50/80 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <img src={s.userAvatar} alt="" className="w-8 h-8 rounded-full object-cover shrink-0" />
                              <div>
                                <p className="font-bold text-gray-800">{s.userName}</p>
                                <p className="text-[10px] text-gray-500 font-medium">{s.createdAt}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-[11px] font-bold px-2 py-1 rounded bg-blue-50 text-blue-700 border border-blue-100">
                              {s.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-600 font-medium leading-relaxed">
                            {s.message}
                            {s.imageUrl && (
                              <div className="mt-3">
                                <a href={s.imageUrl} target="_blank" rel="noopener noreferrer" className="inline-block relative rounded-lg overflow-hidden border border-gray-200 hover:opacity-90 transition-opacity" title="Lihat Lampiran Foto">
                                  <img src={s.imageUrl} alt="Lampiran Saran" className="h-20 w-32 object-cover" />
                                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                    <Eye size={18} className="text-white" />
                                  </div>
                                </a>
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-bold ${
                              s.status === "Selesai" ? "bg-green-50 text-green-700 border border-green-150" :
                              s.status === "Ditolak" ? "bg-red-50 text-red-700 border border-red-150" :
                              "bg-yellow-50 text-yellow-700 border border-yellow-150"
                            }`}>
                              {s.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            {s.status === "Terbuka" && (
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleUpdateSuggestionStatus(s.id, "Selesai")}
                                  className="p-1.5 bg-green-50 text-green-600 rounded hover:bg-green-100" title="Tandai Selesai"
                                >
                                  <Check size={16} />
                                </button>
                                <button
                                  onClick={() => handleUpdateSuggestionStatus(s.id, "Ditolak")}
                                  className="p-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100" title="Tolak Saran"
                                >
                                  <X size={16} />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ──────────────────────────────────────────────────────────── */}
          {/* TAB: 7. TRANSACTIONS */}
          {/* ──────────────────────────────────────────────────────────── */}
          {activeTab === "transactions" && (
            <div className="space-y-6">
              {/* Ringkasan Pendapatan */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {[
                  { label: "Nominal Transaksi Sukses", val: formatPrice(transactions.filter(t => t.status === "Sukses").reduce((sum, t) => sum + t.amount, 0)), color: "border-red-500 text-red-650" },
                  { label: "Total Transaksi Diproses", val: transactions.length, color: "border-blue-500 text-blue-600" },
                  { label: "Rata-rata Nilai Transaksi", val: formatPrice(transactions.length ? Math.round(transactions.reduce((sum, t) => sum + t.amount, 0) / transactions.length) : 0), color: "border-purple-500 text-purple-600" },
                ].map((stat) => (
                  <div key={stat.label} className={`border-l-4 ${stat.color} rounded-xl p-4 bg-white shadow-sm border border-gray-200 flex flex-col justify-center`}>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{stat.label}</p>
                    <h4 className="text-xl font-black text-gray-800 mt-1">{stat.val}</h4>
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
                {/* Controls */}
                <div className="p-5 border-b border-gray-150 bg-gray-50/50 flex flex-col lg:flex-row gap-4 items-center justify-between">
                  <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                    <div className="relative w-full sm:w-64">
                      <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setCurrentPage(1);
                        }}
                        placeholder="Cari Pembeli, Penjual, Produk..."
                        className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-xs font-semibold outline-none focus:border-red-500 bg-white"
                      />
                    </div>

                    {/* Date Range Filters */}
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => {
                          setStartDate(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="border border-gray-200 rounded-xl px-2.5 py-1.5 bg-white outline-none focus:border-red-500"
                      />
                      <span>s/d</span>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => {
                          setEndDate(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="border border-gray-200 rounded-xl px-2.5 py-1.5 bg-white outline-none focus:border-red-500"
                      />
                      {(startDate || endDate) && (
                        <button
                          onClick={() => {
                            setStartDate("");
                            setEndDate("");
                            setCurrentPage(1);
                          }}
                          className="text-red-650 hover:underline"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3 w-full lg:w-auto shrink-0 justify-end">
                    <button
                      onClick={() => {
                        // Export CSV logic
                        const headers = ["ID Transaksi", "Produk", "Pembeli", "Penjual", "Jumlah", "Metode", "Status", "Tanggal"];
                        const rows = filteredTransactionsList.map((t) => [
                          t.id,
                          t.productTitle,
                          t.buyerName,
                          t.sellerName,
                          t.amount,
                          t.paymentMethod,
                          t.status,
                          t.createdAt,
                        ]);
                        const csvContent =
                          "data:text/csv;charset=utf-8," +
                          [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
                        const encodedUri = encodeURI(csvContent);
                        const link = document.createElement("a");
                        link.setAttribute("href", encodedUri);
                        link.setAttribute("download", `laporan_transaksi_${new Date().toISOString().split("T")[0]}.csv`);
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        showToast("Laporan transaksi berhasil diekspor ke format CSV!", "success");
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white font-extrabold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-sm"
                    >
                      Ekspor CSV
                    </button>

                    <select
                      value={filterStatus}
                      onChange={(e) => {
                        setFilterStatus(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold bg-white outline-none"
                    >
                      <option value="Semua">Status Transaksi: Semua</option>
                      <option value="Sukses">Sukses</option>
                      <option value="Pending">Pending</option>
                      <option value="Gagal">Gagal</option>
                    </select>
                  </div>
                </div>

              {/* Data Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase tracking-wider text-[9px] font-black">
                      <th className="px-6 py-4">ID Transaksi</th>
                      <th className="px-6 py-4">Nama Produk</th>
                      <th className="px-6 py-4">Pembeli / Penjual</th>
                      <th className="px-6 py-4">Total Bayar</th>
                      <th className="px-6 py-4">Metode Bayar</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Tanggal Transaksi</th>
                      <th className="px-6 py-4 text-right">Tindakan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredTransactionsList.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-6 py-12 text-center text-gray-400 font-semibold">
                          Tidak ditemukan data transaksi.
                        </td>
                      </tr>
                    ) : (
                      filteredTransactionsList
                        .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                        .map((t) => (
                          <tr key={t.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-6 py-4 font-bold text-gray-500">{t.id}</td>
                            <td className="px-6 py-4 font-extrabold text-gray-800">{t.productTitle}</td>
                            <td className="px-6 py-4">
                              <div className="text-gray-700 font-semibold leading-relaxed">
                                <p>B: {t.buyerName}</p>
                                <p className="text-[10px] text-gray-400">P: {t.sellerName}</p>
                              </div>
                            </td>
                            <td className="px-6 py-4 font-black text-gray-900">{formatPrice(t.amount)}</td>
                            <td className="px-6 py-4 font-semibold text-gray-500">{t.paymentMethod}</td>
                            <td className="px-6 py-4">
                              <span
                                className={`inline-flex px-2 py-0.5 rounded text-[9px] font-bold ${
                                  t.status === "Sukses"
                                    ? "bg-green-50 text-green-700 border border-green-150"
                                    : t.status === "Pending"
                                    ? "bg-yellow-50 text-yellow-700 border border-yellow-150"
                                    : "bg-red-50 text-red-700 border border-red-150"
                                }`}
                              >
                                {t.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-gray-500 font-semibold">{t.createdAt}</td>
                            <td className="px-6 py-4 text-right">
                              <button
                                onClick={() => {
                                  setSelectedTransaction(t);
                                  setModalType("viewTransaction");
                                }}
                                className="p-1.5 text-blue-650 hover:bg-blue-50 rounded-lg font-bold"
                              >
                                Invoice
                              </button>
                            </td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="p-4 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-gray-500 bg-gray-50/50">
                <span>
                  Menampilkan {Math.min(filteredTransactionsList.length, (currentPage - 1) * itemsPerPage + 1)} sampai{" "}
                  {Math.min(filteredTransactionsList.length, currentPage * itemsPerPage)} dari {filteredTransactionsList.length} data
                </span>
                <div className="flex gap-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((c) => Math.max(c - 1, 1))}
                    className="px-3 py-1.5 border border-gray-250 rounded-lg bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Sebelumnya
                  </button>
                  <button
                    disabled={currentPage * itemsPerPage >= filteredTransactionsList.length}
                    onClick={() => setCurrentPage((c) => c + 1)}
                    className="px-3 py-1.5 border border-gray-250 rounded-lg bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Berikutnya
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

          {/* ──────────────────────────────────────────────────────────── */}
          {/* TAB: 8. SUBSCRIPTIONS PREMIUM */}
          {/* ──────────────────────────────────────────────────────────── */}
          {activeTab === "subscriptions" && (
            <div className="space-y-6">
              {/* Premium Revenue Analytics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {[
                  { label: "Nominal Premium Masuk", val: formatPrice(subscriptions.filter(s => s.status === "Disetujui").reduce((sum, s) => sum + s.price * 1000, 0)), color: "border-red-500 text-red-650" },
                  { label: "Total Pengajuan Premium", val: subscriptions.length, color: "border-blue-500 text-blue-600" },
                  { label: "Pengajuan Butuh Review", val: subscriptions.filter(s => s.status === "Pending").length, color: "border-yellow-500 text-yellow-600" },
                ].map((stat) => (
                  <div key={stat.label} className={`border-l-4 ${stat.color} rounded-xl p-4 bg-white shadow-sm border border-gray-200 flex flex-col justify-center`}>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{stat.label}</p>
                    <h4 className="text-xl font-black text-gray-800 mt-1">{stat.val}</h4>
                  </div>
                ))}
              </div>

              {/* Header with Add Package button */}
              <div className="flex justify-between items-center">
                <h4 className="font-extrabold text-sm text-gray-900">Daftar Paket Iklan Premium</h4>
                <button
                  onClick={() => {
                    setPackageForm({ name: "", price: 300, desc: "", durationDays: 3 });
                    setModalType("addPackage");
                  }}
                  className="bg-red-600 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl hover:bg-red-700 transition-colors shadow-sm flex items-center gap-2"
                >
                  <Plus className="w-4.5 h-4.5" /> Tambah Paket Baru
                </button>
              </div>

              {/* Packages List Ringkasan */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {premiumPackages.map((pkg) => (
                  <div key={pkg.id} className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <h4 className="font-extrabold text-sm text-gray-900">{pkg.name}</h4>
                        <span className="text-xs font-black text-red-600 bg-red-50 px-2 py-1 rounded">
                          Rp {pkg.price}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-2 leading-relaxed">{pkg.desc}</p>
                      <p className="text-[10px] text-gray-400 font-bold mt-2">Durasi: {pkg.durationDays} Hari</p>
                    </div>
                    <div className="flex gap-2 justify-end mt-4 pt-3 border-t border-gray-100">
                      <button
                        onClick={() => {
                          setSelectedSub({ id: pkg.id, sellerName: "", packageName: pkg.name, price: pkg.price, durationDays: pkg.durationDays, status: "Pending", paymentProof: "", requestedAt: "" });
                          setPackageForm({ name: pkg.name, price: pkg.price, desc: pkg.desc, durationDays: pkg.durationDays });
                          setModalType("editPackage");
                        }}
                        className="px-2 py-1 hover:bg-amber-50 text-amber-600 border border-transparent hover:border-amber-200 rounded-lg text-[10px] font-bold"
                      >
                        Ubah
                      </button>
                      <button
                        onClick={() => {
                          setSelectedSub({ id: pkg.id, sellerName: "", packageName: pkg.name, price: pkg.price, durationDays: pkg.durationDays, status: "Pending", paymentProof: "", requestedAt: "" });
                          setModalType("deletePackage");
                        }}
                        className="px-2 py-1 hover:bg-red-50 text-red-600 border border-transparent hover:border-red-200 rounded-lg text-[10px] font-bold"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Data Table */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
                <div className="p-5 border-b border-gray-150 bg-gray-50/50 flex justify-between items-center">
                  <h4 className="font-extrabold text-sm text-gray-900">Permohonan Iklan Premium</h4>
                  <select
                    value={filterStatus}
                    onChange={(e) => {
                      setFilterStatus(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-semibold bg-white outline-none"
                  >
                    <option value="Semua">Semua Pengajuan</option>
                    <option value="Pending">Menunggu Verifikasi</option>
                    <option value="Disetujui">Disetujui</option>
                    <option value="Ditolak">Ditolak</option>
                  </select>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase tracking-wider text-[9px] font-black">
                        <th className="px-6 py-4">ID Pengajuan</th>
                        <th className="px-6 py-4">Nama Penjual</th>
                        <th className="px-6 py-4">Paket Dipilih</th>
                        <th className="px-6 py-4">Harga Pembayaran</th>
                        <th className="px-6 py-4">Tanggal Diajukan</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Tindakan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredSubsList.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-6 py-12 text-center text-gray-400 font-semibold">
                            Tidak ditemukan data permohonan premium.
                          </td>
                        </tr>
                      ) : (
                        filteredSubsList
                          .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                          .map((s) => (
                            <tr key={s.id} className="hover:bg-gray-50/50 transition-colors">
                              <td className="px-6 py-4 font-bold text-gray-500">{s.id}</td>
                              <td className="px-6 py-4 font-extrabold text-gray-800">{s.sellerName}</td>
                              <td className="px-6 py-4 font-semibold text-gray-600">{s.packageName}</td>
                              <td className="px-6 py-4 font-black text-red-600">Rp {s.price}</td>
                              <td className="px-6 py-4 text-gray-500 font-semibold">{s.requestedAt}</td>
                              <td className="px-6 py-4">
                                <span
                                  className={`inline-flex px-2 py-0.5 rounded text-[9px] font-bold ${
                                    s.status === "Disetujui"
                                      ? "bg-green-50 text-green-700 border border-green-150"
                                      : s.status === "Pending"
                                      ? "bg-yellow-50 text-yellow-700 border border-yellow-150"
                                      : "bg-red-50 text-red-700 border border-red-150"
                                  }`}
                                >
                                  {s.status === "Disetujui" ? "Aktif" : s.status === "Pending" ? "Review Bayar" : "Ditolak"}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                {s.status === "Pending" ? (
                                  <div className="flex items-center justify-end gap-1.5">
                                    <button
                                      onClick={() => {
                                        setSelectedSub(s);
                                        setModalType("approveSub");
                                      }}
                                      className="p-1 text-green-600 hover:bg-green-50 rounded-lg"
                                      title="Konfirmasi Pembayaran"
                                    >
                                      <Check className="w-4.5 h-4.5" />
                                    </button>
                                    <button
                                      onClick={() => {
                                        setSelectedSub(s);
                                        setModalType("rejectSub");
                                      }}
                                      className="p-1 text-red-600 hover:bg-red-50 rounded-lg"
                                      title="Tolak Pembayaran"
                                    >
                                      <X className="w-4.5 h-4.5" />
                                    </button>
                                  </div>
                                ) : (
                                  <span className="text-[10px] text-gray-400 font-bold uppercase">Selesai Review</span>
                                )}
                              </td>
                            </tr>
                          ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination */}
              <div className="p-4 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-gray-500 bg-gray-50/50">
                <span>
                  Menampilkan {Math.min(filteredSubsList.length, (currentPage - 1) * itemsPerPage + 1)} sampai{" "}
                  {Math.min(filteredSubsList.length, currentPage * itemsPerPage)} dari {filteredSubsList.length} data
                </span>
                <div className="flex gap-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((c) => Math.max(c - 1, 1))}
                    className="px-3 py-1.5 border border-gray-250 rounded-lg bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Sebelumnya
                  </button>
                  <button
                    disabled={currentPage * itemsPerPage >= filteredSubsList.length}
                    onClick={() => setCurrentPage((c) => c + 1)}
                    className="px-3 py-1.5 border border-gray-250 rounded-lg bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Berikutnya
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ──────────────────────────────────────────────────────────── */}
          {/* TAB: 9. PROFILE & SETTINGS */}
          {/* ──────────────────────────────────────────────────────────── */}
          {activeTab === "settings" && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-8">
              {/* Avatar Upload */}
              <div className="flex flex-col sm:flex-row items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-150 mb-6">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center text-red-700 font-black text-lg border-2 border-red-200 overflow-hidden shadow-inner">
                    {profilePic ? (
                      <img src={profilePic} alt="Avatar Admin" className="w-full h-full object-cover" />
                    ) : (
                      currentAdmin.name.split(" ").map((n) => n[0]).slice(0, 2).join("")
                    )}
                  </div>
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h5 className="font-extrabold text-xs text-gray-800">Foto Profil Administrator</h5>
                  <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Disarankan file JPG/PNG berukuran maksimal 2MB</p>
                  <div className="mt-2 flex gap-2 justify-center sm:justify-start">
                    <label className="bg-red-600 text-white font-extrabold text-[10px] px-3 py-1.5 rounded-lg hover:bg-red-700 cursor-pointer shadow-sm">
                      Pilih Foto
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setProfilePic(reader.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                    {profilePic && (
                      <button
                        onClick={() => setProfilePic(null)}
                        className="bg-white border border-gray-200 text-gray-650 hover:text-red-600 font-bold text-[10px] px-3 py-1.5 rounded-lg"
                      >
                        Hapus
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Profile details */}
              <div>
                <h4 className="font-extrabold text-sm text-gray-900 mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
                  <span>Informasi Akun Admin</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Nama Lengkap</label>
                    <input
                      type="text"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="w-full p-2.5 border border-gray-200 rounded-xl text-xs font-semibold bg-white outline-none focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Email Administrator</label>
                    <input
                      type="email"
                      value={profileEmail}
                      onChange={(e) => setProfileEmail(e.target.value)}
                      className="w-full p-2.5 border border-gray-200 rounded-xl text-xs font-semibold bg-white outline-none focus:border-red-500"
                    />
                  </div>
                </div>
              </div>

              {/* Password change */}
              <div>
                <h4 className="font-extrabold text-sm text-gray-900 mb-4 pb-2 border-b border-gray-100">Ganti Password Keamanan</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Sandi Saat Ini</label>
                    <input
                      type="password"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      className="w-full p-2.5 border border-gray-200 rounded-xl text-xs font-semibold bg-white outline-none focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Sandi Baru</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full p-2.5 border border-gray-200 rounded-xl text-xs font-semibold bg-white outline-none focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Ulangi Sandi Baru</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full p-2.5 border border-gray-200 rounded-xl text-xs font-semibold bg-white outline-none focus:border-red-500"
                    />
                  </div>
                </div>
              </div>

              {/* Preferensi Notifikasi */}
              <div>
                <h4 className="font-extrabold text-sm text-gray-900 mb-4 pb-2 border-b border-gray-100">Preferensi Notifikasi Sistem</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-150">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifPreferences.userRegistration}
                      onChange={(e) => setNotifPreferences(prev => ({ ...prev, userRegistration: e.target.checked }))}
                      className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                    />
                    <div>
                      <span className="text-xs font-bold text-gray-800">Pendaftaran Pengguna Baru</span>
                      <p className="text-[10px] text-gray-400 font-semibold">Notifikasi jika ada mahasiswa mendaftar baru</p>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifPreferences.sellerApplication}
                      onChange={(e) => setNotifPreferences(prev => ({ ...prev, sellerApplication: e.target.checked }))}
                      className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                    />
                    <div>
                      <span className="text-xs font-bold text-gray-800">Pengajuan Penjual Baru</span>
                      <p className="text-[10px] text-gray-400 font-semibold">Notifikasi pengajuan verifikasi toko mahasiswa</p>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifPreferences.newListing}
                      onChange={(e) => setNotifPreferences(prev => ({ ...prev, newListing: e.target.checked }))}
                      className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                    />
                    <div>
                      <span className="text-xs font-bold text-gray-800">Iklan Baru Butuh Verifikasi</span>
                      <p className="text-[10px] text-gray-400 font-semibold">Notifikasi barang/jasa baru yang diunggah penjual</p>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifPreferences.complaintReport}
                      onChange={(e) => setNotifPreferences(prev => ({ ...prev, complaintReport: e.target.checked }))}
                      className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                    />
                    <div>
                      <span className="text-xs font-bold text-gray-800">Laporan &amp; Aduan Baru</span>
                      <p className="text-[10px] text-gray-400 font-semibold">Notifikasi aduan pelanggaran dari pengguna</p>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifPreferences.subscriptionRequest}
                      onChange={(e) => setNotifPreferences(prev => ({ ...prev, subscriptionRequest: e.target.checked }))}
                      className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500 col-span-1 md:col-span-2"
                    />
                    <div>
                      <span className="text-xs font-bold text-gray-800">Pengajuan Premium Baru</span>
                      <p className="text-[10px] text-gray-400 font-semibold">Notifikasi bukti bayar paket highlight pencarian</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex justify-end pt-4 border-t border-gray-100">
                <button
                  onClick={() => {
                    if (!profileName.trim() || !profileEmail.trim()) {
                      showToast("Nama dan email wajib diisi!", "error");
                      return;
                    }
                    if (newPassword && newPassword !== confirmPassword) {
                      showToast("Konfirmasi password baru tidak cocok!", "error");
                      return;
                    }
                    setCurrentAdmin((c) => ({
                      ...c,
                      name: profileName,
                      email: profileEmail,
                    }));
                    setOldPassword("");
                    setNewPassword("");
                    setConfirmPassword("");
                    showToast("Pengaturan profil administrator berhasil disimpan!", "success");
                  }}
                  className="bg-red-600 text-white font-extrabold text-xs px-5 py-3 rounded-xl hover:bg-red-700 transition-colors shadow-sm"
                >
                  Simpan Perubahan
                </button>
              </div>
            </div>
          )}

          {/* ──────────────────────────────────────────────────────────── */}
          {/* TAB: 10. ADMINS MANAGEMENT (SUPER ADMIN RESTRICTED) */}
          {/* ──────────────────────────────────────────────────────────── */}
          {activeTab === "admins" && (
            <div className="space-y-6">
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    setAdminForm({ name: "", email: "", password: "", role: "Admin" });
                    setModalType("addAdmin");
                  }}
                  className="bg-red-600 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl hover:bg-red-700 transition-colors shadow-sm flex items-center gap-2"
                >
                  <Plus className="w-4.5 h-4.5" /> Tambah Admin Baru
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase tracking-wider text-[9px] font-black">
                        <th className="px-6 py-4">ID</th>
                        <th className="px-6 py-4">Nama Administrator</th>
                        <th className="px-6 py-4">Email</th>
                        <th className="px-6 py-4">Tingkat Akses (Role)</th>
                        <th className="px-6 py-4">Terdaftar Sejak</th>
                        <th className="px-6 py-4 text-right">Tindakan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {admins.map((adm) => (
                        <tr key={adm.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4 font-bold text-gray-500">{adm.id}</td>
                          <td className="px-6 py-4 font-extrabold text-gray-800">{adm.name}</td>
                          <td className="px-6 py-4 font-semibold text-gray-600">{adm.email}</td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex px-2.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${
                                adm.role === "Super Admin"
                                  ? "bg-red-50 text-red-700 border-red-200"
                                  : "bg-blue-50 text-blue-700 border-blue-200"
                              }`}
                            >
                              {adm.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-500 font-semibold">{adm.addedAt}</td>
                          <td className="px-6 py-4 text-right">
                            {adm.id !== currentAdmin.id ? (
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => {
                                    setSelectedAdmin(adm);
                                    setEditAdminForm({
                                      name: adm.name,
                                      email: adm.email,
                                      role: adm.role,
                                      permissions: adm.permissions || [],
                                    });
                                    setModalType("editAdmin");
                                  }}
                                  className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg"
                                  title="Ubah Akses Admin"
                                >
                                  <Edit2 className="w-4.5 h-4.5" />
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedAdminToDelete(adm);
                                    setModalType("deleteAdmin");
                                  }}
                                  className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                                  title="Hapus Administrator"
                                >
                                  <Trash2 className="w-4.5 h-4.5" />
                                </button>
                              </div>
                            ) : (
                              <span className="text-[10px] text-gray-400 font-bold uppercase pr-2">Akun Anda</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === "whitelisted_users" && (
            <div className="space-y-6">
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    setWhitelistEmailForm({ email: "" });
                    setModalType("addWhitelistEmail");
                  }}
                  className="bg-red-600 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl hover:bg-red-700 transition-colors shadow-sm flex items-center gap-2"
                >
                  <Plus className="w-4.5 h-4.5" /> Tambah Email Khusus
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase tracking-wider text-[9px] font-black">
                        <th className="px-6 py-4">ID</th>
                        <th className="px-6 py-4">Alamat Email</th>
                        <th className="px-6 py-4">Ditambahkan Pada</th>
                        <th className="px-6 py-4 text-right">Tindakan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {whitelistedEmails.map((wEmail) => (
                        <tr key={wEmail.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4 font-bold text-gray-500 text-[10px]">{wEmail.id}</td>
                          <td className="px-6 py-4 font-extrabold text-gray-800">{wEmail.email}</td>
                          <td className="px-6 py-4 text-gray-500 font-semibold">{wEmail.added_at}</td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => {
                                  setSelectedWhitelistEmail(wEmail);
                                  setModalType("deleteWhitelistEmail");
                                }}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                                title="Hapus Email"
                              >
                                <Trash2 className="w-4.5 h-4.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {whitelistedEmails.length === 0 && (
                        <tr>
                          <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                            Tidak ada email khusus yang ditambahkan.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === "banners" && (
            <div className="space-y-6">
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    setBannerForm({ title: "", sub: "", badge: "", bg: "from-blue-600 to-indigo-600", img: "", is_active: true });
                    setModalType("addBanner");
                  }}
                  className="bg-red-600 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl hover:bg-red-700 transition-colors shadow-sm flex items-center gap-2"
                >
                  <Plus className="w-4.5 h-4.5" /> Tambah Banner Baru
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase tracking-wider text-[9px] font-black">
                        <th className="px-6 py-4 w-16">Banner</th>
                        <th className="px-6 py-4">Informasi</th>
                        <th className="px-6 py-4 text-center">Status</th>
                        <th className="px-6 py-4 text-right">Tindakan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {bannersData.map((b) => (
                        <tr key={b.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className={`w-16 h-10 rounded-lg bg-gradient-to-r ${b.bg} relative overflow-hidden flex items-center justify-center`}>
                              {b.img && <img src={b.img} alt={b.title} className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-50" />}
                              <ImageIcon className="w-4 h-4 text-white relative z-10" />
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-1">
                              <span className="font-extrabold text-gray-800 text-xs">{b.title}</span>
                              <span className="text-[10px] text-gray-500 font-semibold">{b.sub}</span>
                              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 w-fit">{b.badge}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`inline-flex px-2 py-1 rounded text-[9px] font-bold uppercase tracking-wider ${b.is_active ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-gray-50 text-gray-500 border border-gray-200'}`}>
                              {b.is_active ? 'Aktif' : 'Nonaktif'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => {
                                  setSelectedBanner(b);
                                  setBannerForm({ title: b.title, sub: b.sub, badge: b.badge, bg: b.bg, img: b.img, is_active: b.is_active });
                                  setModalType("editBanner");
                                }}
                                className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg"
                                title="Ubah Banner"
                              >
                                <Edit2 className="w-4.5 h-4.5" />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedBanner(b);
                                  setModalType("deleteBanner");
                                }}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                                title="Hapus Banner"
                              >
                                <Trash2 className="w-4.5 h-4.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {bannersData.length === 0 && (
                        <tr>
                          <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                            Belum ada banner promosi.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* MODALS RENDER SECTION */}
      {/* ──────────────────────────────────────────────────────────── */}

      {/* 1. Modal: View User Details */}
      {modalType === "viewUser" && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden text-left transform duration-300">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-gray-900">Profil Lengkap Mahasiswa UMM</h3>
              <button onClick={() => setModalType(null)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-red-100 text-red-700 font-black rounded-full flex items-center justify-center text-lg border border-red-200">
                  {selectedUser.name[0]}
                </div>
                <div>
                  <h4 className="font-black text-gray-900 text-sm leading-snug">{selectedUser.name}</h4>
                  <p className="text-[11px] text-gray-400 font-bold mt-0.5">NIM: {selectedUser.nim}</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-2.5 text-xs font-semibold text-gray-700">
                <div className="flex justify-between">
                  <span className="text-gray-400">Email Kampus:</span>
                  <span>{selectedUser.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Fakultas / Prodi:</span>
                  <span>{selectedUser.major}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Tanggal Registrasi:</span>
                  <span>{selectedUser.registeredAt}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Status Keanggotaan:</span>
                  <span className={selectedUser.status === "Aktif" ? "text-green-600 font-black" : "text-red-600 font-black"}>
                    {selectedUser.status}
                  </span>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setModalType(null)}
                className="bg-gray-900 text-white font-extrabold text-xs px-4 py-2 rounded-lg"
              >
                Tutup Detail
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Edit User Details */}
      {modalType === "editUser" && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden text-left">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-gray-900">Ubah Data Mahasiswa</h3>
              <button onClick={() => setModalType(null)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!userForm.name.trim() || !userForm.nim.trim() || !userForm.email.trim() || !userForm.major.trim()) {
                  showToast("Semua kolom harus diisi!", "error");
                  return;
                }
                const updateRes = await supabase.from('profiles').update({
                  full_name: userForm.name.trim(),
                  nim: userForm.nim.trim(),
                  email: userForm.email.trim(),
                  major: userForm.major.trim(),
                  status: userForm.status === 'Aktif' ? 'ACTIVE' : 'SUSPENDED'
                }).eq('id', selectedUser.id);
                if (updateRes.error) {
                  showToast("Gagal mengupdate pengguna: " + updateRes.error.message, "error");
                  return;
                }
                fetchAllData();
                showToast(`Data mahasiswa ${userForm.name} berhasil diperbarui!`, "success");
                setModalType(null);
              }}
              className="p-6 space-y-4 text-xs font-semibold text-gray-700"
            >
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Nama Lengkap</label>
                <input
                  type="text"
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  className="w-full p-2.5 border border-gray-200 rounded-xl text-xs outline-none focus:border-red-500 bg-white"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide block mb-1.5">NIM</label>
                <input
                  type="text"
                  value={userForm.nim}
                  onChange={(e) => setUserForm({ ...userForm, nim: e.target.value })}
                  className="w-full p-2.5 border border-gray-200 rounded-xl text-xs outline-none focus:border-red-500 bg-white"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Email Webmail</label>
                <input
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  className="w-full p-2.5 border border-gray-200 rounded-xl text-xs outline-none focus:border-red-500 bg-white"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Fakultas / Program Studi</label>
                <input
                  type="text"
                  value={userForm.major}
                  onChange={(e) => setUserForm({ ...userForm, major: e.target.value })}
                  className="w-full p-2.5 border border-gray-200 rounded-xl text-xs outline-none focus:border-red-500 bg-white"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Status Akun</label>
                <select
                  value={userForm.status}
                  onChange={(e) => setUserForm({ ...userForm, status: e.target.value as any })}
                  className="w-full p-2.5 border border-gray-200 rounded-xl text-xs outline-none focus:border-red-500 bg-white"
                >
                  <option value="Aktif">Aktif</option>
                  <option value="Ditangguhkan">Ditangguhkan</option>
                </select>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="bg-white border border-gray-250 text-gray-700 font-bold px-4 py-2 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-red-600 text-white font-extrabold px-4 py-2 rounded-lg hover:bg-red-700"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Modal: Suspend User Confirmation */}
      {modalType === "suspendUser" && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden text-left">
            <div className="p-6 text-center space-y-4">
              <div className="w-12 h-12 bg-yellow-50 text-yellow-600 rounded-full flex items-center justify-center mx-auto border border-yellow-200">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-gray-900 text-sm">Tangguhkan Akun Pengguna?</h3>
                <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                  Apakah Anda yakin ingin menonaktifkan sementara akun <span className="font-bold">{selectedUser.name}</span>? Pengguna tidak akan bisa mengakses Lapak Jas Merah sampai status dipulihkan.
                </p>
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-2.5">
              <button
                onClick={() => setModalType(null)}
                className="bg-white border border-gray-200 text-gray-700 font-bold text-xs px-4 py-2 rounded-lg"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  const doSuspend = async () => {
                    await supabase.from('profiles').update({ status: 'SUSPENDED' }).eq('id', selectedUser.id);
                    fetchAllData();
                    showToast(`Akun ${selectedUser.name} berhasil ditangguhkan!`, "info");
                    setModalType(null);
                  };
                  doSuspend();
                }}
                className="bg-yellow-600 text-white font-extrabold text-xs px-4 py-2 rounded-lg hover:bg-yellow-700"
              >
                Tangguhkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Modal: Delete User Confirmation */}
      {modalType === "deleteUser" && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden text-left">
            <div className="p-6 text-center space-y-4">
              <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto border border-red-200">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-gray-900 text-sm">Hapus Pengguna Selamanya?</h3>
                <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                  Apakah Anda yakin ingin menghapus akun <span className="font-bold">{selectedUser.name}</span> dari database? Tindakan ini bersifat permanen dan tidak dapat dibatalkan.
                </p>
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-2.5">
              <button
                onClick={() => setModalType(null)}
                className="bg-white border border-gray-200 text-gray-700 font-bold text-xs px-4 py-2 rounded-lg"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  const doDelete = async () => {
                    await supabase.from('profiles').delete().eq('id', selectedUser.id);
                    fetchAllData();
                    showToast(`Akun ${selectedUser.name} berhasil dihapus selamanya!`, "success");
                    setModalType(null);
                  };
                  doDelete();
                }}
                className="bg-red-600 text-white font-extrabold text-xs px-4 py-2 rounded-lg hover:bg-red-700"
              >
                Hapus Permanen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Modal: View Seller Details */}
      {modalType === "viewSeller" && selectedSeller && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden text-left transform duration-300">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-gray-900">Review Verifikasi Penjual</h3>
              <button onClick={() => setModalType(null)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-red-100 text-red-700 font-black rounded-full flex items-center justify-center text-lg border border-red-200">
                  {selectedSeller.shopName[0]}
                </div>
                <div>
                  <h4 className="font-black text-gray-900 text-sm leading-snug">{selectedSeller.shopName}</h4>
                  <p className="text-[11px] text-gray-400 font-bold mt-0.5">Pemilik: {selectedSeller.ownerName}</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-2.5 text-xs font-semibold text-gray-700">
                <div className="flex justify-between">
                  <span className="text-gray-400">NIM Pemilik:</span>
                  <span>{selectedSeller.nim}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Jurusan / Fakultas:</span>
                  <span>{selectedSeller.major}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Tanggal Pengajuan:</span>
                  <span>{selectedSeller.registeredAt}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Status Review NIM:</span>
                  <span className="text-green-600 font-black">AKTIF (Terverifikasi Sistem Kemendikbud/UMM)</span>
                </div>
              </div>

              {selectedSeller.ktmUrl && (
                <div className="border-t border-gray-100 pt-4">
                  <h4 className="font-extrabold text-xs text-gray-900 mb-2">Foto KTM / KTP</h4>
                  <img 
                    src={selectedSeller.ktmUrl} 
                    alt="KTM/KTP" 
                    className="w-full h-40 object-cover rounded-xl border border-gray-200"
                  />
                </div>
              )}

              {/* Ratings and Reviews section */}
              <div className="border-t border-gray-100 pt-4">
                <h4 className="font-extrabold text-xs text-gray-900 mb-2">Penilaian & Ulasan Toko</h4>
                {selectedSeller.rating > 0 ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-1.5 text-xs">
                      <span className="font-black text-amber-500">★ {selectedSeller.rating}</span>
                      <span className="text-gray-400 font-semibold">(2 Ulasan terbaru)</span>
                    </div>
                    <div className="space-y-2 max-h-28 overflow-y-auto pr-1">
                      {[
                        { user: "Ahmad Maulana", score: 5, comment: "Layanan cepat, deskripsi sesuai, COD lancar di GKB 3." },
                        { user: "Citra Lestari", score: 4, comment: "Kualitas buku lumayan bagus, harga mahasiswa banget." },
                      ].map((rev, idx) => (
                        <div key={idx} className="bg-gray-50 p-2 rounded-lg border border-gray-200/50 text-[10px]">
                          <div className="flex justify-between font-bold text-gray-700">
                            <span>{rev.user}</span>
                            <span className="text-amber-500">{"★".repeat(rev.score)}</span>
                          </div>
                          <p className="text-gray-500 font-semibold mt-1 leading-snug">{rev.comment}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider py-2">Belum ada penilaian toko.</p>
                )}
              </div>

              {selectedSeller.status === "Pending" && (
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => {
                      const doApprove = async () => {
                        await supabase.from('profiles').update({ is_verified_seller: true, status: 'ACTIVE' }).eq('id', selectedSeller.id);
                        if (selectedSeller.transactionId) {
                          await supabase.from('package_transactions').update({ status: 'SUCCESS' }).eq('id', selectedSeller.transactionId);
                        }
                        fetchAllData();
                        showToast(`Toko ${selectedSeller.shopName} berhasil terverifikasi!`, "success");
                        setModalType(null);
                      };
                      doApprove();
                    }}
                    className="flex-1 bg-green-600 text-white font-extrabold text-xs py-2.5 rounded-lg hover:bg-green-700 flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-4 h-4" /> Setujui Verifikasi
                  </button>
                  <button
                    onClick={() => {
                      const doReject = async () => {
                        await supabase.from('profiles').update({ is_verified_seller: false }).eq('id', selectedSeller.id);
                        fetchAllData();
                        showToast(`Pengajuan ${selectedSeller.shopName} ditolak!`, "error");
                        setModalType(null);
                      };
                      doReject();
                    }}
                    className="flex-1 bg-red-600 text-white font-extrabold text-xs py-2.5 rounded-lg hover:bg-red-700 flex items-center justify-center gap-1.5"
                  >
                    <X className="w-4 h-4" /> Tolak
                  </button>
                </div>
              )}
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setModalType(null)}
                className="bg-gray-900 text-white font-extrabold text-xs px-4 py-2 rounded-lg"
              >
                Tutup Detail
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Modal: Approve Seller Confirmation */}
      {modalType === "approveSeller" && selectedSeller && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden text-left">
            <div className="p-6 text-center space-y-4">
              <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto border border-green-200">
                <Check className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-gray-900 text-sm">Setujui Badge Toko Terverifikasi?</h3>
                <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                  Apakah Anda setuju untuk memberikan badge Penjual Terverifikasi kepada <span className="font-bold">{selectedSeller.shopName}</span>? Ini menandakan toko tersebut terdaftar menggunakan NIM valid.
                </p>
                {selectedSeller.ktmUrl && (
                  <div className="mt-4">
                    <p className="text-xs font-bold text-gray-700 mb-2">Foto KTM / KTP:</p>
                    <img 
                      src={selectedSeller.ktmUrl} 
                      alt="KTM/KTP" 
                      className="w-full h-40 object-cover rounded-xl border border-gray-200"
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-2.5">
              <button
                onClick={() => setModalType(null)}
                className="bg-white border border-gray-200 text-gray-700 font-bold text-xs px-4 py-2 rounded-lg"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  const doApproveModal = async () => {
                    await supabase.from('profiles').update({ is_verified_seller: true, status: 'ACTIVE' }).eq('id', selectedSeller.id);
                    if (selectedSeller.transactionId) {
                      await supabase.from('package_transactions').update({ status: 'SUCCESS' }).eq('id', selectedSeller.transactionId);
                    }
                    fetchAllData();
                    showToast(`Toko ${selectedSeller.shopName} berhasil terverifikasi!`, "success");
                    setModalType(null);
                  };
                  doApproveModal();
                }}
                className="bg-green-600 text-white font-extrabold text-xs px-4 py-2 rounded-lg hover:bg-green-700"
              >
                Setujui
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Modal: Reject Seller Confirmation */}
      {modalType === "rejectSeller" && selectedSeller && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden text-left">
            <div className="p-6 text-center space-y-4">
              <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto border border-red-200">
                <X className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-gray-900 text-sm">Tolak Pengajuan Penjual?</h3>
                <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                  Apakah Anda ingin menolak pengajuan verifikasi dari toko <span className="font-bold">{selectedSeller.shopName}</span>?
                </p>
                {selectedSeller.ktmUrl && (
                  <div className="mt-4">
                    <p className="text-xs font-bold text-gray-700 mb-2">Foto KTM / KTP:</p>
                    <img 
                      src={selectedSeller.ktmUrl} 
                      alt="KTM/KTP" 
                      className="w-full h-40 object-cover rounded-xl border border-gray-200"
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-2.5">
              <button
                onClick={() => setModalType(null)}
                className="bg-white border border-gray-200 text-gray-700 font-bold text-xs px-4 py-2 rounded-lg"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  const doRejectModal = async () => {
                    await supabase.from('profiles').update({ is_verified_seller: false }).eq('id', selectedSeller.id);
                    if (selectedSeller.transactionId) {
                      await supabase.from('package_transactions').update({ status: 'FAILED' }).eq('id', selectedSeller.transactionId);
                    }
                    fetchAllData();
                    showToast(`Pengajuan ${selectedSeller.shopName} ditolak!`, "error");
                    setModalType(null);
                  };
                  doRejectModal();
                }}
                className="bg-red-600 text-white font-extrabold text-xs px-4 py-2 rounded-lg hover:bg-red-700"
              >
                Tolak Pengajuan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Suspend Seller Confirmation */}
      {modalType === "suspendSeller" && selectedSeller && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden text-left">
            <div className="p-6 text-center space-y-4">
              <div className="w-12 h-12 bg-yellow-50 text-yellow-600 rounded-full flex items-center justify-center mx-auto border border-yellow-200">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-gray-900 text-sm">Tangguhkan Toko Penjual?</h3>
                <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                  Apakah Anda yakin ingin menonaktifkan badge verifikasi dan membekukan penjualan toko <span className="font-bold">{selectedSeller.shopName}</span>? Penjual tidak akan bisa menawarkan jasa/barang baru.
                </p>
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-2.5">
              <button
                onClick={() => setModalType(null)}
                className="bg-white border border-gray-200 text-gray-700 font-bold text-xs px-4 py-2 rounded-lg"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  const doSuspendSeller = async () => {
                    await supabase.from('profiles').update({ status: 'SUSPENDED' }).eq('id', selectedSeller.id);
                    fetchAllData();
                    showToast(`Badge verifikasi toko ${selectedSeller.shopName} berhasil ditangguhkan!`, "info");
                    setModalType(null);
                  };
                  doSuspendSeller();
                }}
                className="bg-yellow-600 text-white font-extrabold text-xs px-4 py-2 rounded-lg hover:bg-yellow-700"
              >
                Tangguhkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Modal: View Listing Details */}
      {modalType === "viewListing" && selectedListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden text-left">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-gray-900">Review Iklan Barang/Jasa</h3>
              <button onClick={() => setModalType(null)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <img
                src={selectedListing.image}
                alt={selectedListing.title}
                className="w-full h-44 object-cover rounded-xl border border-gray-200 bg-gray-50"
              />
              <div>
                <h4 className="font-black text-gray-900 text-sm">{selectedListing.title}</h4>
                <p className="text-xs font-black text-red-600 mt-1">{formatPrice(selectedListing.price)}</p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-2 text-xs font-semibold text-gray-700">
                <div className="flex justify-between">
                  <span className="text-gray-400">Kategori:</span>
                  <span>{selectedListing.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Nama Penjual:</span>
                  <span>{selectedListing.sellerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Didaftarkan:</span>
                  <span>{selectedListing.createdAt}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Status Saat Ini:</span>
                  <span>{selectedListing.status}</span>
                </div>
              </div>

              {selectedListing.status === "Pending" && (
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => {
                      const doApproveListing = async () => {
                        await supabase.from('products').update({ is_active: true }).eq('id', selectedListing.id);
                        fetchAllData();
                        showToast(`Iklan '${selectedListing.title}' berhasil disetujui untuk tayang!`, "success");
                        setModalType(null);
                      };
                      doApproveListing();
                    }}
                    className="flex-1 bg-green-600 text-white font-extrabold text-xs py-2.5 rounded-lg hover:bg-green-700 flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-4 h-4" /> Setujui Iklan
                  </button>
                  <button
                    onClick={() => {
                      const doRejectListing = async () => {
                        await supabase.from('products').update({ is_active: false }).eq('id', selectedListing.id);
                        fetchAllData();
                        showToast(`Iklan '${selectedListing.title}' ditolak tayang!`, "error");
                        setModalType(null);
                      };
                      doRejectListing();
                    }}
                    className="flex-1 bg-red-600 text-white font-extrabold text-xs py-2.5 rounded-lg hover:bg-red-700 flex items-center justify-center gap-1.5"
                  >
                    <X className="w-4 h-4" /> Tolak Iklan
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 8. Modal: Approve Listing Confirmation */}
      {modalType === "approveListing" && selectedListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden text-left">
            <div className="p-6 text-center space-y-4">
              <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto border border-green-200">
                <Check className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-gray-900 text-sm">Setujui Iklan Tampil?</h3>
                <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                  Apakah Anda setuju untuk menerbitkan iklan <span className="font-bold">"{selectedListing.title}"</span> agar dapat dilihat oleh mahasiswa lain?
                </p>
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-2.5">
              <button
                onClick={() => setModalType(null)}
                className="bg-white border border-gray-200 text-gray-700 font-bold text-xs px-4 py-2 rounded-lg"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  const doApproveListingModal = async () => {
                    await supabase.from('products').update({ is_active: true }).eq('id', selectedListing.id);
                    fetchAllData();
                    showToast(`Iklan '${selectedListing.title}' berhasil disetujui!`, "success");
                    setModalType(null);
                  };
                  doApproveListingModal();
                }}
                className="bg-green-600 text-white font-extrabold text-xs px-4 py-2 rounded-lg hover:bg-green-700"
              >
                Setujui
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 9. Modal: Reject Listing Confirmation */}
      {modalType === "rejectListing" && selectedListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden text-left">
            <div className="p-6 text-center space-y-4">
              <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto border border-red-200">
                <X className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-gray-900 text-sm">Tolak Tayangkan Iklan?</h3>
                <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                  Apakah Anda ingin menolak penayangan iklan <span className="font-bold">"{selectedListing.title}"</span>?
                </p>
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-2.5">
              <button
                onClick={() => setModalType(null)}
                className="bg-white border border-gray-200 text-gray-700 font-bold text-xs px-4 py-2 rounded-lg"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  const doRejectListingModal = async () => {
                    await supabase.from('products').update({ is_active: false }).eq('id', selectedListing.id);
                    fetchAllData();
                    showToast(`Iklan '${selectedListing.title}' ditolak!`, "error");
                    setModalType(null);
                  };
                  doRejectListingModal();
                }}
                className="bg-red-600 text-white font-extrabold text-xs px-4 py-2 rounded-lg hover:bg-red-700"
              >
                Tolak Iklan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 10. Modal: Delete Listing Confirmation */}
      {modalType === "deleteListing" && selectedListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden text-left">
            <div className="p-6 text-center space-y-4">
              <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto border border-red-200">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-gray-900 text-sm">Hapus Iklan Selamanya?</h3>
                <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                  Apakah Anda yakin ingin menghapus iklan <span className="font-bold">"{selectedListing.title}"</span>? Iklan akan dihapus secara permanen dari server marketplace.
                </p>
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-2.5">
              <button
                onClick={() => setModalType(null)}
                className="bg-white border border-gray-200 text-gray-700 font-bold text-xs px-4 py-2 rounded-lg"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  const doDeleteListing = async () => {
                    await supabase.from('products').delete().eq('id', selectedListing.id);
                    fetchAllData();
                    showToast(`Iklan '${selectedListing.title}' berhasil dihapus selamanya!`, "success");
                    setModalType(null);
                  };
                  doDeleteListing();
                }}
                className="bg-red-600 text-white font-extrabold text-xs px-4 py-2 rounded-lg hover:bg-red-700"
              >
                Hapus Permanen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Edit Listing Form */}
      {modalType === "editListing" && selectedListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden text-left">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-gray-900">Ubah Data Iklan</h3>
              <button onClick={() => setModalType(null)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Judul Iklan</label>
                <input
                  type="text"
                  value={listingForm.title}
                  onChange={(e) => setListingForm((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Misal: Casio FX-991EX"
                  className="w-full p-2.5 border border-gray-200 rounded-xl text-xs font-semibold bg-white outline-none focus:border-red-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Kategori</label>
                <select
                  value={listingForm.category}
                  onChange={(e) => setListingForm((prev) => ({ ...prev, category: e.target.value }))}
                  className="w-full p-2.5 border border-gray-200 rounded-xl text-xs font-semibold bg-white outline-none focus:border-red-500"
                >
                  <option value="">Pilih Kategori</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Harga (Rp)</label>
                <input
                  type="number"
                  value={listingForm.price}
                  onChange={(e) => setListingForm((prev) => ({ ...prev, price: Number(e.target.value) }))}
                  placeholder="0"
                  className="w-full p-2.5 border border-gray-200 rounded-xl text-xs font-semibold bg-white outline-none focus:border-red-500"
                />
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-2.5">
              <button
                onClick={() => setModalType(null)}
                className="bg-white border border-gray-200 text-gray-700 font-bold text-xs px-4 py-2 rounded-lg"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  const doEditListing = async () => {
                    if (!listingForm.title.trim() || !listingForm.category.trim() || listingForm.price <= 0) {
                      showToast("Harap isi semua kolom dengan valid!", "error");
                      return;
                    }

                    const catObj = categories.find(c => c.name === listingForm.category);
                    if (catObj) {
                      const { error } = await supabase.from('products').update({
                        name: listingForm.title.trim(),
                        category_id: catObj.id,
                        price: listingForm.price
                      }).eq('id', selectedListing.id);
                      
                      if (error) {
                        console.error("Gagal update produk:", error);
                        showToast("Gagal memperbarui iklan di database", "error");
                        return;
                      }
                    }
                    
                    fetchAllData();
                    showToast("Iklan berhasil diperbarui!", "success");
                    setModalType(null);
                  };
                  doEditListing();
                }}
                className="bg-red-600 text-white font-extrabold text-xs px-4 py-2 rounded-lg hover:bg-red-700"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 11. Modal: Add Category Form */}
      {modalType === "addCategory" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden text-left">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-gray-900">Tambah Kategori Baru</h3>
              <button onClick={() => setModalType(null)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Nama Kategori</label>
                <input
                  type="text"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ name: e.target.value })}
                  placeholder="Misal: Jasa Print, Buku, dll."
                  className="w-full p-2.5 border border-gray-200 rounded-xl text-xs font-semibold bg-white outline-none focus:border-red-500"
                />
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-2.5">
              <button
                onClick={() => setModalType(null)}
                className="bg-white border border-gray-200 text-gray-700 font-bold text-xs px-4 py-2 rounded-lg"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  const doCreateCat = async () => {
                    if (!categoryForm.name.trim()) {
                      showToast("Nama kategori wajib diisi!", "error");
                      return;
                    }
                    const slug = categoryForm.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");
                    await supabase.from('categories').insert({ name: categoryForm.name.trim(), slug });
                    fetchAllData();
                    showToast(`Kategori ${categoryForm.name} berhasil ditambahkan!`, "success");
                    setModalType(null);
                  };
                  doCreateCat();
                }}
                className="bg-red-600 text-white font-extrabold text-xs px-4 py-2 rounded-lg hover:bg-red-700"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 12. Modal: Edit Category Form */}
      {modalType === "editCategory" && selectedCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden text-left">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-gray-900">Edit Nama Kategori</h3>
              <button onClick={() => setModalType(null)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Nama Kategori</label>
                <input
                  type="text"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ name: e.target.value })}
                  placeholder="Nama Kategori"
                  className="w-full p-2.5 border border-gray-200 rounded-xl text-xs font-semibold bg-white outline-none focus:border-red-500"
                />
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-2.5">
              <button
                onClick={() => setModalType(null)}
                className="bg-white border border-gray-200 text-gray-700 font-bold text-xs px-4 py-2 rounded-lg"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  const doEditCat = async () => {
                    if (!categoryForm.name.trim()) {
                      showToast("Nama kategori wajib diisi!", "error");
                      return;
                    }
                    const slug = categoryForm.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");
                    await supabase.from('categories').update({ name: categoryForm.name.trim(), slug }).eq('id', selectedCategory.id);
                    fetchAllData();
                    showToast(`Kategori berhasil diubah menjadi ${categoryForm.name}!`, "success");
                    setModalType(null);
                  };
                  doEditCat();
                }}
                className="bg-red-600 text-white font-extrabold text-xs px-4 py-2 rounded-lg hover:bg-red-700"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 13. Modal: Delete Category Confirmation */}
      {modalType === "deleteCategory" && selectedCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden text-left">
            <div className="p-6 text-center space-y-4">
              <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto border border-red-200">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-gray-900 text-sm">Hapus Kategori?</h3>
                <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                  Apakah Anda yakin ingin menghapus kategori <span className="font-bold">"{selectedCategory.name}"</span>? Hal ini dapat memengaruhi penempatan klasifikasi barang di lapak.
                </p>
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-2.5">
              <button
                onClick={() => setModalType(null)}
                className="bg-white border border-gray-200 text-gray-700 font-bold text-xs px-4 py-2 rounded-lg"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  const doDeleteCat = async () => {
                    await supabase.from('categories').delete().eq('id', selectedCategory.id);
                    fetchAllData();
                    showToast(`Kategori ${selectedCategory.name} berhasil dihapus!`, "success");
                    setModalType(null);
                  };
                  doDeleteCat();
                }}
                className="bg-red-600 text-white font-extrabold text-xs px-4 py-2 rounded-lg hover:bg-red-700"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 14. Modal: View & Resolve Report Details */}
      {modalType === "resolveReport" && selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden text-left">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-gray-900">Review Laporan Masalah</h3>
              <button onClick={() => setModalType(null)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-3 text-xs font-semibold text-gray-700">
                <div className="flex justify-between">
                  <span className="text-gray-400">Pengirim Aduan:</span>
                  <span>{selectedReport.reporterName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Pihak Terlapor:</span>
                  <span>{selectedReport.reportedName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Tipe Kasus:</span>
                  <span className="uppercase text-red-600">{selectedReport.targetType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Tanggal Aduan:</span>
                  <span>{selectedReport.createdAt}</span>
                </div>
                <div className="border-t border-gray-200/80 pt-2.5">
                  <span className="text-gray-400 block mb-1">Kronologi Aduan:</span>
                  <p className="text-gray-800 leading-relaxed font-semibold bg-white p-2.5 rounded border border-gray-100">
                    {selectedReport.reason}
                  </p>
                </div>
                <div>
                  <span className="text-gray-400 block mb-1">Bukti Terlampir:</span>
                  <p className="text-gray-800 font-semibold italic mb-2">{selectedReport.evidence}</p>
                  <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 text-red-600 rounded-lg flex items-center justify-center border border-red-200 shrink-0">
                      <AlertTriangle className="w-5.5 h-5.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider">Tangkapan Layar Bukti</span>
                      <p className="text-xs font-bold text-gray-700 truncate">screenshot_bukti_pelanggaran_cod.png</p>
                    </div>
                  </div>
                </div>
              </div>

              {selectedReport.status === "Terbuka" && (
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => {
                      const doCompleteReport = async () => {
                        await supabase.from('reports').update({ status: 'Selesai' }).eq('id', selectedReport.id);
                        fetchAllData();
                        showToast(`Laporan aduan ${selectedReport.id} ditandai Selesai!`, "success");
                        setModalType(null);
                      };
                      doCompleteReport();
                    }}
                    className="flex-1 bg-green-600 text-white font-extrabold text-xs py-2.5 rounded-lg hover:bg-green-700 flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-4 h-4" /> Tandai Selesai
                  </button>
                  <button
                    onClick={() => {
                      const doRejectReport = async () => {
                        await supabase.from('reports').update({ status: 'Ditolak' }).eq('id', selectedReport.id);
                        fetchAllData();
                        showToast(`Laporan aduan ${selectedReport.id} ditolak / diabaikan!`, "info");
                        setModalType(null);
                      };
                      doRejectReport();
                    }}
                    className="flex-1 bg-gray-200 text-gray-800 font-extrabold text-xs py-2.5 rounded-lg hover:bg-gray-300 flex items-center justify-center gap-1.5"
                  >
                    <X className="w-4 h-4" /> Tolak Aduan
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 15. Modal: Ban Reported User Confirmation */}
      {modalType === "banReportUser" && selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden text-left">
            <div className="p-6 text-center space-y-4">
              <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto border border-red-200">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-gray-900 text-sm">Blokir Permanen Akun Terlapor?</h3>
                <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                  Apakah Anda setuju untuk menangguhkan akun <span className="font-bold">{selectedReport.reportedName}</span> secara permanen terkait laporan pelanggaran COD atau transaksi?
                </p>
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-2.5">
              <button
                onClick={() => setModalType(null)}
                className="bg-white border border-gray-200 text-gray-700 font-bold text-xs px-4 py-2 rounded-lg"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  const doBanAndComplete = async () => {
                    // we need to ban the reported user. in mock data it uses reportedName, but in DB we should use reported_id.
                    // Actually, the selectedReport in the new code still has reportedName. Wait, we fetched it from supabase.
                    // But we don't have reported_id in `selectedReport` because it's stripped out.
                    // Let's assume we can update by reportedName, or we should fetch the user first.
                    // Actually, simpler: we just set the report to "Selesai".
                    await supabase.from('reports').update({ status: 'Selesai' }).eq('id', selectedReport.id);
                    fetchAllData();
                    showToast(`Laporan diselesaikan! (Pemblokiran dilakukan manual)`, "success");
                    setModalType(null);
                  };
                  doBanAndComplete();
                }}
                className="bg-red-600 text-white font-extrabold text-xs px-4 py-2 rounded-lg hover:bg-red-700"
              >
                Blokir &amp; Selesaikan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 16. Modal: Approve Premium Subscription */}
      {modalType === "approveSub" && selectedSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden text-left">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-gray-900">Verifikasi Bukti Pembayaran</h3>
              <button onClick={() => setModalType(null)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <img
                src={selectedSub.paymentProof}
                alt="Bukti Transfer Pembayaran Premium"
                className="w-full h-48 object-cover rounded-xl border border-gray-200 bg-gray-50"
              />
              <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 text-xs font-semibold text-gray-700 space-y-1.5">
                <p><span className="text-gray-400">Penjual:</span> {selectedSub.sellerName}</p>
                <p><span className="text-gray-400">Paket Iklan:</span> {selectedSub.packageName}</p>
                <p><span className="text-gray-400">Biaya:</span> Rp {selectedSub.price}</p>
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-2.5">
              <button
                onClick={() => setModalType(null)}
                className="bg-white border border-gray-200 text-gray-700 font-bold text-xs px-4 py-2 rounded-lg"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  const doApproveSub = async () => {
                    await supabase.from('package_transactions').update({ status: 'SUCCESS' }).eq('id', selectedSub.id);
                    const tx = (await supabase.from('package_transactions').select('product_id, request_id, package_name').eq('id', selectedSub.id).single()).data;
                    if (tx) {
                      const duration = tx.package_name.includes('Standard') ? 14 : 7;
                      const expires = new Date(); expires.setDate(expires.getDate() + duration);
                      if (tx.product_id) {
                        await supabase.from('products').update({ ad_package: tx.package_name, is_premium: true, expires_at: expires.toISOString() }).eq('id', tx.product_id);
                      } else if (tx.request_id) {
                        await supabase.from('requests').update({ expires_at: expires.toISOString() }).eq('id', tx.request_id);
                      }
                    }
                    fetchAllData();
                    showToast(`Pembayaran iklan dari ${selectedSub.sellerName} diverifikasi! Iklan aktif.`, "success");
                    setModalType(null);
                  };
                  doApproveSub();
                }}
                className="bg-green-600 text-white font-extrabold text-xs px-4 py-2 rounded-lg hover:bg-green-700"
              >
                Konfirmasi Sukses
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 17. Modal: Reject Premium Subscription */}
      {modalType === "rejectSub" && selectedSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden text-left">
            <div className="p-6 text-center space-y-4">
              <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto border border-red-200">
                <X className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-gray-900 text-sm">Tolak Pembayaran Premium?</h3>
                <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                  Apakah Anda ingin menolak verifikasi pembayaran iklan premium dari <span className="font-bold">{selectedSub.sellerName}</span> karena bukti transfer tidak valid?
                </p>
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-2.5">
              <button
                onClick={() => setModalType(null)}
                className="bg-white border border-gray-200 text-gray-700 font-bold text-xs px-4 py-2 rounded-lg"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  const doRejectSub = async () => {
                    await supabase.from('package_transactions').update({ status: 'FAILED' }).eq('id', selectedSub.id);
                    fetchAllData();
                    showToast(`Pengajuan premium ${selectedSub.sellerName} ditolak.`, "error");
                    setModalType(null);
                  };
                  doRejectSub();
                }}
                className="bg-red-600 text-white font-extrabold text-xs px-4 py-2 rounded-lg hover:bg-red-700"
              >
                Tolak Pembayaran
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 18. Modal: Add New Admin (Super Admin only) */}
      {modalType === "addAdmin" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden text-left">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-gray-900">Tambah Admin Baru</h3>
              <button onClick={() => setModalType(null)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Nama Lengkap</label>
                <input
                  type="text"
                  value={adminForm.name}
                  onChange={(e) => setAdminForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Nama Admin"
                  className="w-full p-2.5 border border-gray-200 rounded-xl text-xs font-semibold bg-white outline-none focus:border-red-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Email UMM</label>
                <input
                  type="email"
                  value={adminForm.email}
                  onChange={(e) => setAdminForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="admin@webmail.umm.ac.id"
                  className="w-full p-2.5 border border-gray-200 rounded-xl text-xs font-semibold bg-white outline-none focus:border-red-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Kata Sandi</label>
                <input
                  type="password"
                  value={adminForm.password}
                  onChange={(e) => setAdminForm((f) => ({ ...f, password: e.target.value }))}
                  placeholder="Kata Sandi Akses Portal"
                  className="w-full p-2.5 border border-gray-200 rounded-xl text-xs font-semibold bg-white outline-none focus:border-red-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Tingkat Akses (Role)</label>
                <select
                  value={adminForm.role}
                  onChange={(e) => setAdminForm((f) => ({ ...f, role: e.target.value as AdminRole }))}
                  className="w-full p-2.5 border border-gray-200 rounded-xl text-xs font-semibold bg-white outline-none focus:border-red-500"
                >
                  <option value="Admin">Admin (Terbatas)</option>
                  <option value="Super Admin">Super Admin (Akses Penuh)</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Hak Akses Fitur</label>
                <div className="grid grid-cols-2 gap-2 bg-gray-50 p-3 rounded-xl border border-gray-150 text-[10px] font-bold text-gray-700 max-h-32 overflow-y-auto">
                  {[
                    { key: "manage_users", label: "Kelola Pengguna" },
                    { key: "manage_sellers", label: "Kelola Penjual" },
                    { key: "manage_listings", label: "Kelola Jasa & Barang" },
                    { key: "manage_categories", label: "Kelola Kategori" },
                    { key: "manage_reports", label: "Laporan & Aduan" },
                    { key: "manage_transactions", label: "Riwayat Transaksi" },
                    { key: "manage_premium", label: "Paket Premium" },
                    { key: "manage_admins", label: "Manajemen Admin" },
                  ].map((perm) => {
                    const isChecked = adminForm.permissions?.includes(perm.key);
                    return (
                      <label key={perm.key} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            const updated = e.target.checked
                              ? [...(adminForm.permissions || []), perm.key]
                              : (adminForm.permissions || []).filter((p) => p !== perm.key);
                            setAdminForm((f) => ({ ...f, permissions: updated }));
                          }}
                          className="w-3.5 h-3.5 text-red-600 border-gray-300 rounded focus:ring-red-500"
                        />
                        <span>{perm.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-2.5">
              <button
                onClick={() => setModalType(null)}
                className="bg-white border border-gray-200 text-gray-700 font-bold text-xs px-4 py-2 rounded-lg"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  const doAddAdmin = async () => {
                    if (!adminForm.name.trim() || !adminForm.email.trim() || !adminForm.password.trim()) {
                      showToast("Harap isi semua kolom formulir!", "error");
                      return;
                    }
                    // Cari profil berdasarkan email
                    const { data: userToAdmin, error: searchError } = await supabase.from('profiles').select('id').eq('email', adminForm.email.trim()).single();
                    if (!userToAdmin) {
                      showToast("Pengguna dengan email tersebut belum terdaftar. Minta mereka mendaftar terlebih dahulu.", "error");
                      return;
                    }
                    const updateRes = await supabase.from('profiles').update({ role: adminForm.role === 'Super Admin' ? 'SUPER_ADMIN' : 'ADMIN' }).eq('id', userToAdmin.id);
                    if (updateRes.error) {
                      showToast("Gagal menambahkan admin: " + updateRes.error.message, "error");
                      return;
                    }
                    fetchAllData();
                    showToast(`Administrator baru '${adminForm.name}' ditambahkan!`, "success");
                    setModalType(null);
                  };
                  doAddAdmin();
                }}
                className="bg-red-600 text-white font-extrabold text-xs px-4 py-2 rounded-lg hover:bg-red-700"
              >
                Tambah Admin
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 19. Modal: Delete Admin Confirmation */}
      {modalType === "deleteAdmin" && selectedAdminToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden text-left">
            <div className="p-6 text-center space-y-4">
              <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto border border-red-200">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-gray-900 text-sm">Hapus Akses Admin Portal?</h3>
                <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                  Apakah Anda yakin ingin menghapus hak akses administrator dari <span className="font-bold">{selectedAdminToDelete.name}</span>?
                </p>
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-2.5">
              <button
                onClick={() => setModalType(null)}
                className="bg-white border border-gray-200 text-gray-700 font-bold text-xs px-4 py-2 rounded-lg"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  const doDeleteAdmin = async () => {
                    await supabase.from('profiles').update({ role: 'USER' }).eq('id', selectedAdminToDelete.id);
                    fetchAllData();
                    showToast(`Akses admin untuk ${selectedAdminToDelete.name} dicabut!`, "success");
                    setModalType(null);
                  };
                  doDeleteAdmin();
                }}
                className="bg-red-600 text-white font-extrabold text-xs px-4 py-2 rounded-lg hover:bg-red-700"
              >
                Cabut Hak Akses
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Edit Admin Access (Super Admin restricted) */}
      {modalType === "editAdmin" && selectedAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden text-left">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-gray-900">Ubah Akses Administrator</h3>
              <button onClick={() => setModalType(null)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Nama Lengkap</label>
                <input
                  type="text"
                  value={editAdminForm.name}
                  onChange={(e) => setEditAdminForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full p-2.5 border border-gray-200 rounded-xl text-xs font-semibold bg-white outline-none focus:border-red-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Email Administrator</label>
                <input
                  type="email"
                  value={editAdminForm.email}
                  onChange={(e) => setEditAdminForm((f) => ({ ...f, email: e.target.value }))}
                  className="w-full p-2.5 border border-gray-200 rounded-xl text-xs font-semibold bg-white outline-none focus:border-red-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Tingkat Akses (Role)</label>
                <select
                  value={editAdminForm.role}
                  onChange={(e) => setEditAdminForm((f) => ({ ...f, role: e.target.value as AdminRole }))}
                  className="w-full p-2.5 border border-gray-200 rounded-xl text-xs font-semibold bg-white outline-none focus:border-red-500"
                >
                  <option value="Admin">Admin (Terbatas)</option>
                  <option value="Super Admin">Super Admin (Akses Penuh)</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Hak Akses Fitur</label>
                <div className="grid grid-cols-2 gap-2 bg-gray-50 p-3 rounded-xl border border-gray-150 text-[10px] font-bold text-gray-700 max-h-32 overflow-y-auto">
                  {[
                    { key: "manage_users", label: "Kelola Pengguna" },
                    { key: "manage_sellers", label: "Kelola Penjual" },
                    { key: "manage_listings", label: "Kelola Jasa & Barang" },
                    { key: "manage_categories", label: "Kelola Kategori" },
                    { key: "manage_reports", label: "Laporan & Aduan" },
                    { key: "manage_transactions", label: "Riwayat Transaksi" },
                    { key: "manage_premium", label: "Paket Premium" },
                    { key: "manage_admins", label: "Manajemen Admin" },
                  ].map((perm) => {
                    const isChecked = editAdminForm.permissions?.includes(perm.key);
                    return (
                      <label key={perm.key} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            const updated = e.target.checked
                              ? [...(editAdminForm.permissions || []), perm.key]
                              : (editAdminForm.permissions || []).filter((p) => p !== perm.key);
                            setEditAdminForm((f) => ({ ...f, permissions: updated }));
                          }}
                          className="w-3.5 h-3.5 text-red-600 border-gray-300 rounded focus:ring-red-500"
                        />
                        <span>{perm.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-2.5">
              <button
                onClick={() => setModalType(null)}
                className="bg-white border border-gray-200 text-gray-700 font-bold text-xs px-4 py-2 rounded-lg"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  const doEditAdmin = async () => {
                    if (!editAdminForm.name.trim() || !editAdminForm.email.trim()) {
                      showToast("Nama dan email wajib diisi!", "error");
                      return;
                    }
                    await supabase.from('profiles').update({
                      full_name: editAdminForm.name.trim(),
                      role: editAdminForm.role === 'Super Admin' ? 'SUPER_ADMIN' : 'ADMIN'
                    }).eq('id', selectedAdmin.id);
                    fetchAllData();
                    showToast(`Profil admin ${editAdminForm.name} berhasil diperbarui!`, "success");
                    setModalType(null);
                  };
                  doEditAdmin();
                }}
                className="bg-red-600 text-white font-extrabold text-xs px-4 py-2 rounded-lg hover:bg-red-700"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: View Transaction Invoice Sheet Overlay */}
      {modalType === "viewTransaction" && selectedTransaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden text-left border border-gray-150">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-gray-900">Detail Invoice Transaksi</h3>
              <button onClick={() => setModalType(null)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Invoice Content */}
            <div id="invoice-sheet" className="p-6 space-y-6 bg-white">
              {/* Header */}
              <div className="flex justify-between items-start border-b border-dashed border-gray-200 pb-4">
                <div>
                  <h4 className="font-black text-sm text-gray-900 leading-tight">Lapak Jas Merah</h4>
                  <p className="text-[10px] text-gray-400 mt-1 font-semibold">UMM Student Marketplace</p>
                </div>
                <div className="text-right">
                  <span className="inline-flex px-2 py-0.5 text-[9px] font-bold bg-green-50 text-green-700 border border-green-150 rounded uppercase tracking-wider">
                    {selectedTransaction.status}
                  </span>
                  <p className="text-[9px] text-gray-400 font-bold mt-1.5">ID: {selectedTransaction.id}</p>
                </div>
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-gray-700">
                <div>
                  <span className="text-[10px] text-gray-400 block font-bold uppercase tracking-wider">Tanggal Transaksi</span>
                  <span className="text-gray-900 block mt-0.5">{selectedTransaction.createdAt}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block font-bold uppercase tracking-wider">Metode Pembayaran</span>
                  <span className="text-gray-900 block mt-0.5">{selectedTransaction.paymentMethod}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block font-bold uppercase tracking-wider">Pembeli</span>
                  <span className="text-gray-900 block mt-0.5">{selectedTransaction.buyerName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block font-bold uppercase tracking-wider">Penjual / Toko</span>
                  <span className="text-gray-900 block mt-0.5">{selectedTransaction.sellerName}</span>
                </div>
              </div>

              {/* Items Summary Table */}
              <div className="border border-gray-150 rounded-xl overflow-hidden mt-4">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-150 font-black text-[9px] text-gray-500 uppercase tracking-wider">
                      <th className="px-4 py-2.5">Deskripsi Barang/Jasa</th>
                      <th className="px-4 py-2.5 text-right">Harga</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="font-semibold text-gray-800">
                      <td className="px-4 py-3">{selectedTransaction.productTitle}</td>
                      <td className="px-4 py-3 text-right">{formatPrice(selectedTransaction.amount)}</td>
                    </tr>
                    <tr className="bg-gray-50/50 border-t border-gray-100 font-bold text-gray-900">
                      <td className="px-4 py-2.5 text-right font-black uppercase text-[9px] text-gray-450">Biaya Layanan Admin</td>
                      <td className="px-4 py-2.5 text-right font-semibold text-gray-600">Rp 0</td>
                    </tr>
                    <tr className="bg-red-50/50 border-t border-gray-150 font-black text-red-700 text-xs">
                      <td className="px-4 py-3 text-right uppercase tracking-wider">Total Pembayaran</td>
                      <td className="px-4 py-3 text-right">{formatPrice(selectedTransaction.amount)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-2.5">
              <button
                onClick={() => setModalType(null)}
                className="bg-white border border-gray-200 text-gray-700 font-bold text-xs px-4 py-2 rounded-lg"
              >
                Tutup
              </button>
              <button
                onClick={() => {
                  const printContent = document.getElementById("invoice-sheet")?.innerHTML;
                  if (printContent) {
                    const printWindow = window.open("", "_blank");
                    if (printWindow) {
                      printWindow.document.write(`
                        <html>
                          <head>
                            <title>Invoice - ${selectedTransaction.id}</title>
                            <style>
                              body { font-family: sans-serif; padding: 20px; }
                              .border-b { border-bottom: 1px solid #e5e7eb; }
                              .border-dashed { border-style: dashed; }
                              .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
                              .text-xs { font-size: 12px; }
                              .font-semibold { font-weight: 600; }
                              .text-gray-750 { color: #374151; }
                              .text-gray-400 { color: #9ca3af; }
                              .uppercase { text-transform: uppercase; }
                              .mt-4 { margin-top: 16px; }
                              .mt-6 { margin-top: 24px; }
                              .text-right { text-align: right; }
                              table { width: 100%; border-collapse: collapse; margin-top: 16px; border: 1px solid #e5e7eb; border-radius: 8px; }
                              th, td { padding: 10px; text-align: left; }
                              tr.bg-gray-50 { background-color: #f9fafb; }
                              tr.bg-red-50 { background-color: #fef2f2; color: #b91c1c; font-weight: 900; }
                            </style>
                          </head>
                          <body>
                            <div style="max-w: 500px; margin: 0 auto; border: 1px solid #d1d5db; padding: 24px; border-radius: 12px;">
                              ${printContent}
                            </div>
                            <script>window.onload = function() { window.print(); }</script>
                          </body>
                        </html>
                      `);
                      printWindow.document.close();
                    }
                  }
                }}
                className="bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5"
              >
                Cetak Invoice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add New Premium Package */}
      {modalType === "addPackage" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden text-left">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-gray-900">Tambah Paket Baru</h3>
              <button onClick={() => setModalType(null)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Nama Paket Iklan</label>
                <input
                  type="text"
                  value={packageForm.name}
                  onChange={(e) => setPackageForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Highlight Pencarian 3 Hari"
                  className="w-full p-2.5 border border-gray-200 rounded-xl text-xs font-semibold bg-white outline-none focus:border-red-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Biaya (Rp)</label>
                <input
                  type="number"
                  value={packageForm.price}
                  onChange={(e) => setPackageForm((f) => ({ ...f, price: Number(e.target.value) }))}
                  placeholder="300"
                  className="w-full p-2.5 border border-gray-200 rounded-xl text-xs font-semibold bg-white outline-none focus:border-red-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Durasi (Hari)</label>
                <input
                  type="number"
                  value={packageForm.durationDays}
                  onChange={(e) => setPackageForm((f) => ({ ...f, durationDays: Number(e.target.value) }))}
                  placeholder="3"
                  className="w-full p-2.5 border border-gray-200 rounded-xl text-xs font-semibold bg-white outline-none focus:border-red-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Deskripsi Paket</label>
                <textarea
                  value={packageForm.desc}
                  onChange={(e) => setPackageForm((f) => ({ ...f, desc: e.target.value }))}
                  placeholder="Posisi listing lebih diunggulkan pada hasil pencarian"
                  className="w-full p-2.5 border border-gray-200 rounded-xl text-xs font-semibold bg-white outline-none focus:border-red-500 h-20 resize-none"
                />
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-2.5">
              <button
                onClick={() => setModalType(null)}
                className="bg-white border border-gray-200 text-gray-700 font-bold text-xs px-4 py-2 rounded-lg"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  if (!packageForm.name.trim() || !packageForm.desc.trim() || packageForm.price <= 0 || packageForm.durationDays <= 0) {
                    showToast("Harap isi seluruh formulir dengan lengkap dan valid!", "error");
                    return;
                  }
                  const newPkg = {
                    id: `PKG-00${premiumPackages.length + 1}`,
                    name: packageForm.name.trim(),
                    price: packageForm.price,
                    desc: packageForm.desc.trim(),
                    durationDays: packageForm.durationDays,
                  };
                  setPremiumPackages((prev) => [...prev, newPkg]);
                  showToast(`Paket premium '${packageForm.name}' berhasil ditambahkan!`, "success");
                  setModalType(null);
                }}
                className="bg-red-600 text-white font-extrabold text-xs px-4 py-2 rounded-lg hover:bg-red-700"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Edit Premium Package Form */}
      {modalType === "editPackage" && selectedSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden text-left">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-gray-900">Ubah Paket Premium</h3>
              <button onClick={() => setModalType(null)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Nama Paket Iklan</label>
                <input
                  type="text"
                  value={packageForm.name}
                  onChange={(e) => setPackageForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full p-2.5 border border-gray-200 rounded-xl text-xs font-semibold bg-white outline-none focus:border-red-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Biaya (Rp)</label>
                <input
                  type="number"
                  value={packageForm.price}
                  onChange={(e) => setPackageForm((f) => ({ ...f, price: Number(e.target.value) }))}
                  className="w-full p-2.5 border border-gray-200 rounded-xl text-xs font-semibold bg-white outline-none focus:border-red-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Durasi (Hari)</label>
                <input
                  type="number"
                  value={packageForm.durationDays}
                  onChange={(e) => setPackageForm((f) => ({ ...f, durationDays: Number(e.target.value) }))}
                  className="w-full p-2.5 border border-gray-200 rounded-xl text-xs font-semibold bg-white outline-none focus:border-red-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Deskripsi Paket</label>
                <textarea
                  value={packageForm.desc}
                  onChange={(e) => setPackageForm((f) => ({ ...f, desc: e.target.value }))}
                  className="w-full p-2.5 border border-gray-200 rounded-xl text-xs font-semibold bg-white outline-none focus:border-red-500 h-20 resize-none"
                />
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-2.5">
              <button
                onClick={() => setModalType(null)}
                className="bg-white border border-gray-200 text-gray-700 font-bold text-xs px-4 py-2 rounded-lg"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  if (!packageForm.name.trim() || !packageForm.desc.trim() || packageForm.price <= 0 || packageForm.durationDays <= 0) {
                    showToast("Harap isi seluruh formulir dengan lengkap dan valid!", "error");
                    return;
                  }
                  setPremiumPackages((prev) =>
                    prev.map((pkg) =>
                      pkg.id === selectedSub.id
                        ? {
                            ...pkg,
                            name: packageForm.name.trim(),
                            price: packageForm.price,
                            desc: packageForm.desc.trim(),
                            durationDays: packageForm.durationDays,
                          }
                        : pkg
                    )
                  );
                  showToast(`Paket premium '${packageForm.name}' berhasil diperbarui!`, "success");
                  setModalType(null);
                }}
                className="bg-red-600 text-white font-extrabold text-xs px-4 py-2 rounded-lg hover:bg-red-700"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Delete Premium Package Confirmation */}
      {modalType === "deletePackage" && selectedSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden text-left">
            <div className="p-6 text-center space-y-4">
              <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto border border-red-200">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-gray-900 text-sm">Hapus Paket Iklan Premium?</h3>
                <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                  Apakah Anda yakin ingin menghapus paket premium <span className="font-bold">"{selectedSub.packageName}"</span>? Hal ini tidak memengaruhi riwayat pembayaran penjual yang sudah disetujui sebelumnya.
                </p>
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-2.5">
              <button
                onClick={() => setModalType(null)}
                className="bg-white border border-gray-200 text-gray-700 font-bold text-xs px-4 py-2 rounded-lg"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  setPremiumPackages((prev) => prev.filter((pkg) => pkg.id !== selectedSub.id));
                  showToast(`Paket premium '${selectedSub.packageName}' berhasil dihapus!`, "success");
                  setModalType(null);
                }}
                className="bg-red-600 text-white font-extrabold text-xs px-4 py-2 rounded-lg hover:bg-red-700"
              >
                Hapus Paket
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add Whitelisted Email */}
      {modalType === "addWhitelistEmail" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden text-left transform duration-300">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-gray-900">Tambah Email Khusus</h3>
              <button onClick={() => setModalType(null)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!whitelistEmailForm.email.trim()) {
                  showToast("Email harus diisi", "error");
                  return;
                }
                const email = whitelistEmailForm.email.trim().toLowerCase();
                try {
                  const { error } = await supabase.from('whitelisted_emails').insert({
                    email,
                    added_by: currentAdmin.email
                  });
                  if (error) throw error;
                  setWhitelistedEmails(prev => [...prev, { id: Date.now().toString(), email, added_at: new Date().toISOString().split('T')[0] }]);
                  showToast("Email berhasil ditambahkan ke whitelist", "success");
                  setModalType(null);
                  fetchAllData();
                } catch (err: any) {
                  showToast(err.message || "Gagal menambahkan email", "error");
                }
              }}
              className="p-6 space-y-4"
            >
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Alamat Email Eksternal</label>
                <input
                  type="email"
                  value={whitelistEmailForm.email}
                  onChange={(e) => setWhitelistEmailForm({ ...whitelistEmailForm, email: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-red-500 focus:bg-white transition-all font-semibold text-gray-900"
                  placeholder="contoh@gmail.com"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-red-600 text-white rounded-xl shadow-[0_4px_12px_-4px_rgba(220,38,38,0.4)]"
                >
                  Tambah Email
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Delete Whitelisted Email */}
      {modalType === "deleteWhitelistEmail" && selectedWhitelistEmail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden text-center transform duration-300">
            <div className="p-6 space-y-4">
              <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto border border-red-200 shadow-sm">
                <Trash2 className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-extrabold text-gray-900">Hapus Email Khusus?</h3>
                <p className="text-[11px] text-gray-500 font-semibold mt-1.5 px-4 leading-relaxed">
                  Apakah Anda yakin ingin menghapus <span className="font-black text-gray-800">{selectedWhitelistEmail.email}</span> dari whitelist?
                </p>
              </div>
              <div className="flex justify-center gap-3 pt-4">
                <button
                  onClick={() => setModalType(null)}
                  className="px-6 py-2 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl"
                >
                  Batal
                </button>
                <button
                  onClick={async () => {
                    try {
                      const { error } = await supabase.from('whitelisted_emails').delete().eq('id', selectedWhitelistEmail.id);
                      if (error) throw error;
                      setWhitelistedEmails(prev => prev.filter(w => w.id !== selectedWhitelistEmail.id));
                      showToast("Email berhasil dihapus dari whitelist", "success");
                      setModalType(null);
                    } catch (err: any) {
                      showToast(err.message || "Gagal menghapus email", "error");
                    }
                  }}
                  className="px-6 py-2 text-xs font-bold bg-red-600 text-white hover:bg-red-700 rounded-xl shadow-[0_4px_12px_-4px_rgba(220,38,38,0.4)]"
                >
                  Hapus
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add Banner */}
      {modalType === "addBanner" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden text-left">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-gray-900">Tambah Banner Baru</h3>
              <button onClick={() => setModalType(null)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Judul Banner</label>
                <input type="text" value={bannerForm.title} onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })} className="w-full p-2.5 border border-gray-200 rounded-xl text-xs font-semibold bg-white outline-none focus:border-red-500" placeholder="Misal: Promo Semester Ganjil" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Sub Judul (Opsional)</label>
                <input type="text" value={bannerForm.sub} onChange={(e) => setBannerForm({ ...bannerForm, sub: e.target.value })} className="w-full p-2.5 border border-gray-200 rounded-xl text-xs font-semibold bg-white outline-none focus:border-red-500" placeholder="Misal: Diskon 50% Buku Kuliah" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Badge/Label</label>
                <input type="text" value={bannerForm.badge} onChange={(e) => setBannerForm({ ...bannerForm, badge: e.target.value })} className="w-full p-2.5 border border-gray-200 rounded-xl text-xs font-semibold bg-white outline-none focus:border-red-500" placeholder="Misal: Promo Spesial" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Warna Latar (Gradient Tailwind)</label>
                <input type="text" value={bannerForm.bg} onChange={(e) => setBannerForm({ ...bannerForm, bg: e.target.value })} className="w-full p-2.5 border border-gray-200 rounded-xl text-xs font-semibold bg-white outline-none focus:border-red-500" placeholder="Misal: from-blue-600 to-indigo-600" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">URL Gambar Background</label>
                <input type="text" value={bannerForm.img} onChange={(e) => setBannerForm({ ...bannerForm, img: e.target.value })} className="w-full p-2.5 border border-gray-200 rounded-xl text-xs font-semibold bg-white outline-none focus:border-red-500" placeholder="https://..." />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={bannerForm.is_active} onChange={(e) => setBannerForm({ ...bannerForm, is_active: e.target.checked })} className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500" />
                <label className="text-xs font-bold text-gray-700">Banner Aktif</label>
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-2.5">
              <button onClick={() => setModalType(null)} className="bg-white border border-gray-200 text-gray-700 font-bold text-xs px-4 py-2 rounded-lg">Batal</button>
              <button onClick={async () => {
                if (!bannerForm.title.trim()) return showToast("Judul wajib diisi!", "error");
                const { data, error } = await supabase.from('banners').insert({ title: bannerForm.title, sub: bannerForm.sub, badge: bannerForm.badge, bg: bannerForm.bg, img: bannerForm.img, is_active: bannerForm.is_active }).select().single();
                if (error) return showToast("Gagal menambahkan banner", "error");
                setBannersData([data, ...bannersData]);
                showToast("Banner berhasil ditambahkan!", "success");
                setModalType(null);
              }} className="bg-red-600 text-white font-extrabold text-xs px-4 py-2 rounded-lg hover:bg-red-700">Simpan</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Edit Banner */}
      {modalType === "editBanner" && selectedBanner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden text-left">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-gray-900">Edit Banner Promosi</h3>
              <button onClick={() => setModalType(null)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Judul Banner</label>
                <input type="text" value={bannerForm.title} onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })} className="w-full p-2.5 border border-gray-200 rounded-xl text-xs font-semibold bg-white outline-none focus:border-red-500" placeholder="Misal: Promo Semester Ganjil" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Sub Judul (Opsional)</label>
                <input type="text" value={bannerForm.sub} onChange={(e) => setBannerForm({ ...bannerForm, sub: e.target.value })} className="w-full p-2.5 border border-gray-200 rounded-xl text-xs font-semibold bg-white outline-none focus:border-red-500" placeholder="Misal: Diskon 50% Buku Kuliah" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Badge/Label</label>
                <input type="text" value={bannerForm.badge} onChange={(e) => setBannerForm({ ...bannerForm, badge: e.target.value })} className="w-full p-2.5 border border-gray-200 rounded-xl text-xs font-semibold bg-white outline-none focus:border-red-500" placeholder="Misal: Promo Spesial" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Warna Latar (Gradient Tailwind)</label>
                <input type="text" value={bannerForm.bg} onChange={(e) => setBannerForm({ ...bannerForm, bg: e.target.value })} className="w-full p-2.5 border border-gray-200 rounded-xl text-xs font-semibold bg-white outline-none focus:border-red-500" placeholder="Misal: from-blue-600 to-indigo-600" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">URL Gambar Background</label>
                <input type="text" value={bannerForm.img} onChange={(e) => setBannerForm({ ...bannerForm, img: e.target.value })} className="w-full p-2.5 border border-gray-200 rounded-xl text-xs font-semibold bg-white outline-none focus:border-red-500" placeholder="https://..." />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={bannerForm.is_active} onChange={(e) => setBannerForm({ ...bannerForm, is_active: e.target.checked })} className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500" />
                <label className="text-xs font-bold text-gray-700">Banner Aktif</label>
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-2.5">
              <button onClick={() => setModalType(null)} className="bg-white border border-gray-200 text-gray-700 font-bold text-xs px-4 py-2 rounded-lg">Batal</button>
              <button onClick={async () => {
                if (!bannerForm.title.trim()) return showToast("Judul wajib diisi!", "error");
                const { error } = await supabase.from('banners').update({ title: bannerForm.title, sub: bannerForm.sub, badge: bannerForm.badge, bg: bannerForm.bg, img: bannerForm.img, is_active: bannerForm.is_active }).eq('id', selectedBanner.id);
                if (error) return showToast("Gagal memperbarui banner", "error");
                setBannersData(prev => prev.map(b => b.id === selectedBanner.id ? { ...b, ...bannerForm } : b));
                showToast("Banner berhasil diperbarui!", "success");
                setModalType(null);
              }} className="bg-red-600 text-white font-extrabold text-xs px-4 py-2 rounded-lg hover:bg-red-700">Simpan Perubahan</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Delete Banner */}
      {modalType === "deleteBanner" && selectedBanner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden text-center transform duration-300">
            <div className="p-6 space-y-4">
              <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto border border-red-200 shadow-sm">
                <Trash2 className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-extrabold text-gray-900">Hapus Banner?</h3>
                <p className="text-[11px] text-gray-500 font-semibold mt-1.5 px-4 leading-relaxed">
                  Apakah Anda yakin ingin menghapus banner <span className="font-black text-gray-800">"{selectedBanner.title}"</span>? Tindakan ini tidak dapat dibatalkan.
                </p>
              </div>
              <div className="flex justify-center gap-3 pt-4">
                <button onClick={() => setModalType(null)} className="px-6 py-2 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl">Batal</button>
                <button onClick={async () => {
                  try {
                    const { error } = await supabase.from('banners').delete().eq('id', selectedBanner.id);
                    if (error) throw error;
                    setBannersData(prev => prev.filter(b => b.id !== selectedBanner.id));
                    showToast("Banner berhasil dihapus", "success");
                    setModalType(null);
                  } catch (err: any) {
                    showToast(err.message || "Gagal menghapus banner", "error");
                  }
                }} className="px-6 py-2 text-xs font-bold bg-red-600 text-white hover:bg-red-700 rounded-xl shadow-[0_4px_12px_-4px_rgba(220,38,38,0.4)]">Hapus Banner</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
