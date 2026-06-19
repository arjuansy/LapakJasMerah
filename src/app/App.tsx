import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import api from "./api";

import {
  categories, banners, recentProducts, chatContacts, initialMessages,
  extraProducts, allProducts, sellerAvatars, productDescriptions, formatPrice, requestBoard
} from "./data";
import type { Message, Product, RequestItem } from "./data";
import { AppContext } from "./context";
import type { PurchaseOrder, SalesOrder, EditingItem, TrackingOrder } from "./context";

import Layout from "./components/Layout";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import MarketplaceFeed from "./pages/MarketplaceFeed";
import ProductDetailPage from "./pages/ProductDetailPage";
import StorePage from "./pages/StorePage";
import ChatPage from "./pages/ChatPage";
import ProfilePage from "./pages/ProfilePage";
import SellPage from "./pages/SellPage";
import OrderTrackingPage from "./pages/OrderTrackingPage";
import SearchResultsPage from "./pages/SearchResultsPage";
import AdminDashboard from "./pages/AdminDashboard";
import CategoriesPage from "./pages/CategoriesPage";
import WishlistPage from "./pages/WishlistPage";
import SalesStatsPage from "./pages/SalesStatsPage";
import NotifPanel from "./pages/NotifPanel";

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

  const toggleWishlist = (id: number) => {
    setWishlist(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const triggerToast = (msg: string) => {
    alert(msg);
  };

  const startChat = (sellerName: string) => {
    // mock logic
  };

  useEffect(() => {
    // Fetch products from our actual Node.js Backend API!
    api.get("/products")
      .then((res) => {
        // Mapping Supabase response to match our Frontend Product Interface
        const fetchedProducts: Product[] = res.data.products.map((p: any) => ({
          id: p.id,
          name: p.name,
          price: p.price,
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
      })
      .catch((err) => {
        console.error("Gagal memuat produk dari server:", err);
      });
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
    startChat
  };

  return (
    <AppContext.Provider value={contextValue as any}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/register" element={<AuthPage mode="register" />} />
        <Route path="/admin" element={<AdminDashboard onLogout={() => {}} />} />
        
        {/* App layout with bottom navigation */}
        <Route element={<Layout />}>
          <Route path="/marketplace" element={<MarketplaceFeed />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/sell" element={<SellPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/chat/:chatId" element={<ChatPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/store/:sellerName" element={<StorePage />} />
          <Route path="/order/:id" element={<OrderTrackingPage />} />
          <Route path="/search" element={<SearchResultsPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/sales-stats" element={<SalesStatsPage />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Modals */}
      {showNotif && (
        <div className="fixed inset-0 z-[70] bg-transparent overflow-hidden animate-page" style={{ maxWidth: 430, margin: "0 auto" }}>
          <NotifPanel />
        </div>
      )}
      
    </AppContext.Provider>
  );
}
