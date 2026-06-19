import { Skeleton } from "./components/Skeleton";
import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import api from "./api";

import {
  categories, banners, recentProducts, chatContacts, initialMessages,
  extraProducts, allProducts, sellerAvatars, productDescriptions, formatPrice, requestBoard, notifData
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
  const [wishlist, setWishlist] = useState<number[]>([]);
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
  const [showPostRequestModal, setShowPostRequestModal] = useState(false);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState("Semua");
  const [activeBanner, setActiveBanner] = useState(0);
  const [searchFocused, setSearchFocused] = useState(false);
  const [globalSearch, setGlobalSearch] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
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

  const toggleWishlist = (id: number) => {
    setWishlist(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
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
          seller:profiles!products_seller_id_fkey(name, avatar_url),
          category:categories(name)
        `);
        
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
          seller: p.seller?.name || "Penjual",
          sellerAvatar: p.seller?.avatar_url || "https://api.dicebear.com/7.x/avataaars/svg?seed=seller",
          image: p.image_url || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80",
          rating: 0,
          sold: 0,
          description: p.description || "",
          stock: p.stock || 1
        }));
        setProducts(fetchedProducts);
      }
    };
    fetchProducts();
  }, []);

  const contextValue = {
    wishlist, toggleWishlist,
    activeChatId, setActiveChatId,
    messages, setMessages,
    inputText, setInputText,
    chatSearch, setChatSearch,
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
          <Route path="/register" element={<AuthPage mode="register" />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
          
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
          <NotifPanel />
        </div>
      )}
      {showPostRequestModal && <PostRequestModal />}
      {showSuggestionBox && <SuggestionBoxModal />}
      <Toaster position="top-center" />
    </AppContext.Provider>
  );
}
