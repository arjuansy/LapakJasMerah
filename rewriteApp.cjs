const fs = require('fs');
const path = require('path');

const appTsxPath = path.join(__dirname, 'src', 'app', 'App.tsx');
let oldContent = fs.readFileSync(appTsxPath, 'utf8');

// Extract the state block
const startIdx = oldContent.indexOf('export default function App() {') + 'export default function App() {'.length;
const endIdx = oldContent.indexOf('const resolvePathToState = (path: string) => {');

const stateBlock = oldContent.substring(startIdx, endIdx);

// Construct new App.tsx
const newContent = `import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

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
  ${stateBlock}

  // Remove the old resolvePathToState since routing is now handled by React Router

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
    startChat: (sellerName: string) => {
      // Logic for start chat
    }
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
`;

fs.writeFileSync(appTsxPath, newContent, 'utf8');
console.log('Rewritten App.tsx successfully.');
