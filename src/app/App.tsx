import { Skeleton } from "./components/Skeleton";
import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import api from "./api";

import {
  categories, banners, recentProducts, initialMessages,
  extraProducts, allProducts, sellerAvatars, productDescriptions, formatPrice, requestBoard
} from "./data";
import type { Message, Product, RequestItem } from "./data";
import { AppContext } from "./context";
import type { PurchaseOrder, SalesOrder, EditingItem, TrackingOrder } from "./context";

import Layout from "./components/Layout";
import { Toaster, toast } from "react-hot-toast";
import { PostRequestModal, SuggestionBoxModal } from "./components/Modals";

import { ProtectedRoute } from "./components/ProtectedRoute";
import { AdminRoute } from "./components/AdminRoute";
import { supabase } from "../config/supabaseClient";
import { useAuth } from "../hooks/useAuth";

const LandingPage = React.lazy(() => import("./pages/LandingPage"));
const AuthPage = React.lazy(() => import("./pages/AuthPage"));
const MarketplaceFeed = React.lazy(() => import("./pages/MarketplaceFeed"));
const ProductDetailPage = React.lazy(() => import("./pages/ProductDetailPage"));
const StorePage = React.lazy(() => import("./pages/StorePage"));
const ChatPage = React.lazy(() => import("./pages/ChatPage"));
const ProfilePage = React.lazy(() => import("./pages/ProfilePage"));
const SellPage = React.lazy(() => import("./pages/SellPage"));
const OrderTrackingPage = React.lazy(() => import("./pages/OrderTrackingPage"));
const SearchResultsPage = React.lazy(() => import("./pages/SearchResultsPage"));
const AdminDashboard = React.lazy(() => import("./pages/AdminDashboard"));
const CategoriesPage = React.lazy(() => import("./pages/CategoriesPage"));
const WishlistPage = React.lazy(() => import("./pages/WishlistPage"));
const SalesStatsPage = React.lazy(() => import("./pages/SalesStatsPage"));
const NotifPanel = React.lazy(() => import("./pages/NotifPanel"));
const OnboardingPage = React.lazy(() => import("./pages/OnboardingPage"));

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [activeChatId, setActiveChatId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Record<number, Message[]>>({});
  const [inputText, setInputText] = useState("");
  const [chatSearch, setChatSearch] = useState("");
  const [editingItem, setEditingItem] = useState<EditingItem | null>(null);
  const [showNotif, setShowNotif] = useState(false);
  const [showWishlist, setShowWishlist] = useState(false);
  const [readNotifs, setReadNotifs] = useState<number[]>([]);
  const [showReportModal, setShowReportModal] = useState<{ type: "penjual" | "pembeli"; name: string } | null>(null);
  const [showSuggestionBox, setShowSuggestionBox] = useState(false);
  const [showSalesStats, setShowSalesStats] = useState(false);
  const [requests, setRequests] = useState<RequestItem[]>(requestBoard);
  const [editingRequest, setEditingRequest] = useState<RequestItem | null>(null);
  const [showPostRequestModal, setShowPostRequestModal] = useState(false);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState("Semua");
  const [activeBanner, setActiveBanner] = useState(0);
  const [searchFocused, setSearchFocused] = useState(false);
  const [globalSearch, setGlobalSearch] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  
  const { user } = useAuth();
  const [purchaseData, setPurchaseData] = useState<PurchaseOrder[]>([]);
  const [salesData, setSalesData] = useState<SalesOrder[]>([]);
  const [profileAvatar, setProfileAvatar] = useState("");
  const [profileBanner, setProfileBanner] = useState("");
  const [listings, setListings] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<any>(null);
  const [trackingOrder, setTrackingOrder] = useState<TrackingOrder | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadChatCount, setUnreadChatCount] = useState<number>(0);

  const toggleWishlist = async (id: string) => {
    if (!user) {
      toast.error("Silakan login untuk menyimpan wishlist");
      return;
    }
    const isWished = wishlist.includes(id);
    if (isWished) {
      setWishlist(prev => prev.filter(x => x !== id));
      await supabase.from('wishlists').delete().eq('user_id', user.id).eq('product_id', id);
    } else {
      setWishlist(prev => [...prev, id]);
      await supabase.from('wishlists').insert({ user_id: user.id, product_id: id });
    }
  };

  const triggerToast = (msg: string) => {
    toast.success(msg);
  };

  const startChat = (sellerName: string) => {
    // mock logic
  };

  useEffect(() => {
    // Fetch products from our actual Node.js Backend API!
    const fetchProducts = async () => {
      const { data: productsData, error } = await supabase
        .from('products')
        .select(`
          *,
          seller:profiles!products_seller_id_fkey(full_name, avatar_url),
          category:categories(name)
        `)
        .order('is_premium', { ascending: false })
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error("Gagal memuat produk dari Supabase:", error);
        return;
      }

      if (productsData) {
        const fetchedProducts: Product[] = productsData.map((p: any) => ({
          id: p.id,
          name: p.name,
          price: Number(p.price),
          category: p.category?.name || "Lainnya",
          condition: p.condition || "Baru",
          location: p.location,
          seller: p.seller?.full_name || "Penjual",
          seller_id: p.seller_id,
          sellerAvatar: p.seller?.avatar_url || "/default-avatar.png",
          image: p.image_url || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80",
          rating: 0,
          sold: 0,
          description: p.description || "",
          stock: p.stock || 1
        }));
        setProducts(fetchedProducts);
      }
    };
    const fetchRequests = async () => {
      const { data: requestsData, error } = await supabase
        .from('requests')
        .select(`
          *,
          user:profiles!requests_user_id_fkey(full_name, avatar_url)
        `)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error("Gagal memuat permintaan dari Supabase:", error);
        return;
      }
      
      if (requestsData) {
        const reqCategories = ["Elektronik", "Buku & Modul", "Fashion", "Makanan", "Jasa", "Kendaraan", "Kost & Kontrakan", "Lainnya"];
        
        const formattedRequests: RequestItem[] = requestsData.map((req: any) => ({
          id: req.id,
          title: req.title,
          description: req.description,
          category: req.category,
          budget: req.budget_min,
          budgetMax: req.budget_max,
          poster: req.user?.full_name || "Mahasiswa",
          posterId: req.user_id,
          posterAvatar: req.user?.avatar_url || "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=80&h=80&fit=crop&auto=format",
          location: req.location || "UMM",
          postedAt: new Date(req.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }),
          urgency: req.urgency as "normal" | "segera" | "mendesak",
          offers: 0,
          categoryColor: reqCategories.indexOf(req.category) >= 0
            ? ["#8B5CF6","#3B82F6","#EC4899","#F97316","#10B981","#06B6D4","#F59E0B","#6B7280"][reqCategories.indexOf(req.category)]
            : "#6B7280",
        }));
        setRequests(formattedRequests);
      }
    };

    fetchProducts();
    fetchRequests();
  }, []);

  useEffect(() => {
    if (!user) {
      setPurchaseData([]);
      setSalesData([]);
      setWishlist([]);
      return;
    }

    const fetchOrdersAndWishlist = async () => {
      // Fetch Wishlist
      const { data: wishData } = await supabase.from('wishlists').select('product_id').eq('user_id', user.id);
      if (wishData) setWishlist(wishData.map(w => w.product_id));

      // Fetch Purchase Data (user as buyer)
      const { data: purchases, error: purErr } = await supabase
        .from('orders')
        .select(`
          id, total_amount, status, created_at, location,
          order_items(quantity, price_at_purchase, product:products(name, image, seller:profiles(full_name, avatar_url)))
        `)
        .eq('buyer_id', user.id)
        .order('created_at', { ascending: false });

      if (purchases && !purErr) {
        const formattedPurchases: PurchaseOrder[] = purchases.flatMap(o => {
          return o.order_items.map((item: any) => ({
            id: o.id,
            product: item.product?.name || "Unknown Product",
            price: item.price_at_purchase,
            seller: item.product?.seller?.full_name || "Unknown Seller",
            date: new Date(o.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }),
            status: (o.status === "PENDING" ? "diproses" : o.status === "PAID" ? "menuju_lokasi" : o.status === "COMPLETED" ? "selesai" : "dibatalkan") as any,
            image: item.product?.image || "",
            qty: item.quantity
          }));
        });
        setPurchaseData(formattedPurchases);
      }

      // Fetch Sales Data (user as seller via products)
      const { data: sales, error: saleErr } = await supabase
        .from('order_items')
        .select(`
          order_id, quantity, price_at_purchase,
          order:orders(id, created_at, status, buyer:profiles(full_name, avatar_url)),
          product:products!inner(name, image, seller_id)
        `)
        .eq('product.seller_id', user.id);

      if (sales && !saleErr) {
        const formattedSales: SalesOrder[] = sales.map((item: any) => {
          const o = item.order;
          return {
            id: o?.id || item.order_id,
            product: item.product?.name || "Unknown Product",
            price: item.price_at_purchase,
            buyer: o?.buyer?.full_name || "Unknown Buyer",
            buyerAvatar: o?.buyer?.avatar_url || "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=80&h=80&fit=crop&auto=format",
            date: o?.created_at ? new Date(o.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "",
            status: (o?.status === "PENDING" ? "diproses" : o?.status === "PAID" ? "menuju_lokasi" : o?.status === "COMPLETED" ? "selesai" : "dibatalkan") as any,
            image: item.product?.image || "",
            qty: item.quantity
          };
        });
        // Sort sales by date descending
        formattedSales.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setSalesData(formattedSales);
      }

      // Fetch Notifications
      const { data: notifs } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (notifs) setNotifications(notifs);

      // Fetch Unread Chats count
      const fetchUnreadChats = async () => {
        // Find chats where user is participant
        const { data: myChats } = await supabase
          .from('chats')
          .select('id')
          .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`);
        
        if (myChats && myChats.length > 0) {
          const chatIds = myChats.map(c => c.id);
          const { count } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .in('chat_id', chatIds)
            .eq('is_read', false)
            .neq('sender_id', user.id);
          
          setUnreadChatCount(count || 0);
        }
      };
      fetchUnreadChats();
    };

    fetchOrdersAndWishlist();

    // Subscribe to notifications
    const notifChannel = supabase
      .channel('realtime:notifications')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` }, (payload) => {
        setNotifications(prev => [payload.new, ...prev]);
        toast.success(payload.new.title); // Show popup notification
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` }, (payload) => {
        setNotifications(prev => prev.map(n => n.id === payload.new.id ? payload.new : n));
      })
      .subscribe();

    // Subscribe to new messages for unread count
    const msgChannel = supabase
      .channel('realtime:messages_unread')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        if (payload.new.sender_id !== user.id) {
          // Verify if it's for this user's chat
          supabase.from('chats').select('id').eq('id', payload.new.chat_id).single().then(({ data }) => {
            if (data) {
              setUnreadChatCount(prev => prev + 1);
            }
          });
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(notifChannel);
      supabase.removeChannel(msgChannel);
    };
  }, [user]);

  const contextValue = {
    wishlist, toggleWishlist,
    activeChatId, setActiveChatId,
    messages, setMessages,
    inputText, setInputText,
    chatSearch, setChatSearch,
    notifications, setNotifications,
    unreadChatCount, setUnreadChatCount,
    editingItem, setEditingItem,
    showNotif, setShowNotif,
    showWishlist, setShowWishlist,
    readNotifs, setReadNotifs,
    showReportModal, setShowReportModal,
    showSuggestionBox, setShowSuggestionBox,
    showSalesStats, setShowSalesStats,
    activeCategoryFilter, setActiveCategoryFilter,
    activeBanner, setActiveBanner,
    searchFocused, setSearchFocused,
    globalSearch, setGlobalSearch,
    showSearchResults, setShowSearchResults,
    purchaseData, setPurchaseData,
    salesData, setSalesData,
    profileAvatar, setProfileAvatar,
    profileBanner, setProfileBanner,
    triggerToast,
    products, setProducts,
    listings, setListings,
    contacts, setContacts,
    startChat,
    requests, setRequests,
    editingRequest, setEditingRequest,
    showPostRequestModal, setShowPostRequestModal,
    notifData,
    toastMessage, setToastMessage,
    activeTab, setActiveTab,
    trackingOrder, setTrackingOrder,
    selectedProduct, setSelectedProduct
  };


  return (
    <AppContext.Provider value={contextValue as any}>
      <React.Suspense fallback={
        <div className="bg-background min-h-screen text-foreground pb-24" style={{ maxWidth: 430, margin: "0 auto" }}>
          <header className="bg-primary px-4 py-3 sticky top-0 z-50 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2">
              <Skeleton className="w-8 h-8 rounded-full bg-white/20" />
              <Skeleton className="w-24 h-5 bg-white/20" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="w-6 h-6 rounded-full bg-white/20" />
              <Skeleton className="w-6 h-6 rounded-full bg-white/20" />
            </div>
          </header>
          <div className="px-4 py-6">
            <Skeleton className="w-full h-32 mb-6" />
            <div className="grid grid-cols-4 gap-3 mb-8">
              <Skeleton className="w-full aspect-square rounded-2xl" />
              <Skeleton className="w-full aspect-square rounded-2xl" />
              <Skeleton className="w-full aspect-square rounded-2xl" />
              <Skeleton className="w-full aspect-square rounded-2xl" />
            </div>
            <Skeleton className="w-32 h-5 mb-4" />
            <div className="grid grid-cols-2 gap-3">
              <Skeleton className="w-full h-48 rounded-2xl" />
              <Skeleton className="w-full h-48 rounded-2xl" />
            </div>
          </div>
        </div>
      }>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<AuthPage mode="login" />} />
          <Route path="/register" element={<Navigate to="/register/akun-google" replace />} />
          <Route path="/register/akun-google" element={<AuthPage mode="register" />} />
          <Route path="/register/data-diri" element={<OnboardingPage />} />
          
          {/* Admin routes protected by AdminRoute */}
          <Route path="/admin/*" element={
            <AdminRoute>
              <AdminDashboard onLogout={() => {}} />
            </AdminRoute>
          } />
          
          {/* Public App layout routes (can be accessed without login) */}
          <Route element={<Layout />}>
            <Route path="/marketplace" element={<MarketplaceFeed />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />
            <Route path="/store/:sellerName" element={<StorePage />} />
            <Route path="/search" element={<SearchResultsPage />} />
          </Route>

          {/* App layout with bottom navigation protected by ProtectedRoute */}
          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path="/sell" element={<SellPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/chat/:chatId" element={<ChatPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/order/:id" element={<OrderTrackingPage />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/sales-stats" element={<SalesStatsPage />} />
          </Route>
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </React.Suspense>

      {/* Modals */}
      {showNotif && (
        <div className="fixed inset-0 z-[70] bg-transparent overflow-hidden animate-page" style={{ maxWidth: 430, margin: "0 auto" }}>
          <React.Suspense fallback={null}>
            <NotifPanel />
          </React.Suspense>
        </div>
      )}
      {showPostRequestModal && <PostRequestModal />}
      {showSuggestionBox && <SuggestionBoxModal />}
      <Toaster position="top-center" />
    </AppContext.Provider>
  );
}
