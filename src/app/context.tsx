import { createContext, useContext } from "react";
import type { Message, Product } from "./data";

export type ProfileSubPage = null | "penjualan" | "pembelian" | "editprofil" | "editbarang" | "keamanan" | "notifikasi" | "bantuan" | "kebijakan" | "tentang";
export type Screen = "landing" | "login" | "register" | "app" | "admin";

export type EditingItem = { id: number; name: string; price: number; image: string; status: string };
export type TrackingOrder = {
  id: string; product: string; image: string; seller: string;
  price: number; qty: number; payment: string; location: string;
  status: "dikonfirmasi" | "diproses" | "menuju_lokasi" | "selesai" | "dibatalkan";
};

export type PurchaseOrder = {
  id: string;
  product: string;
  price: number;
  seller: string;
  sellerAvatar: string;
  date: string;
  status: "dikonfirmasi" | "diproses" | "menuju_lokasi" | "selesai" | "dibatalkan";
  image: string;
  qty: number;
};

export type SalesOrder = {
  id: string;
  product: string;
  price: number;
  buyer: string;
  buyerAvatar: string;
  date: string;
  status: "dikonfirmasi" | "diproses" | "menuju_lokasi" | "selesai" | "dibatalkan";
  image: string;
  qty: number;
};

export type AppContextType = {
  // screen
  screen: Screen;
  setScreen: (s: Screen) => void;
  // tab
  activeTab: string;
  setActiveTab: (t: string) => void;
  // product
  selectedProduct: Product | null;
  setSelectedProduct: (p: Product | null) => void;
  // wishlist
  wishlist: number[];
  toggleWishlist: (id: number) => void;
  // chat
  activeChatId: number | null;
  setActiveChatId: (id: number | null) => void;
  messages: Record<number, Message[]>;
  setMessages: React.Dispatch<React.SetStateAction<Record<number, Message[]>>>;
  inputText: string;
  setInputText: (t: string) => void;
  chatSearch: string;
  setChatSearch: (s: string) => void;
  // profile
  profileSubPage: ProfileSubPage;
  setProfileSubPage: (p: ProfileSubPage) => void;
  editingItem: EditingItem | null;
  setEditingItem: (item: EditingItem | null) => void;
  // modals / overlays
  showNotif: boolean;
  setShowNotif: (v: boolean) => void;
  showWishlist: boolean;
  setShowWishlist: (v: boolean) => void;
  readNotifs: number[];
  setReadNotifs: React.Dispatch<React.SetStateAction<number[]>>;
  showReportModal: { type: "penjual" | "pembeli"; name: string } | null;
  setShowReportModal: (v: { type: "penjual" | "pembeli"; name: string } | null) => void;
  showSuggestionBox: boolean;
  setShowSuggestionBox: (v: boolean) => void;
  viewStoreSeller: string | null;
  setViewStoreSeller: (s: string | null) => void;
  showSalesStats: boolean;
  setShowSalesStats: (v: boolean) => void;
  // categories
  activeCategoryFilter: string;
  setActiveCategoryFilter: (s: string) => void;
  // banner
  activeBanner: number;
  setActiveBanner: (n: number) => void;
  searchFocused: boolean;
  setSearchFocused: (v: boolean) => void;
  globalSearch: string;
  setGlobalSearch: (s: string) => void;
  showSearchResults: boolean;
  setShowSearchResults: (v: boolean) => void;
  trackingOrder: TrackingOrder | null;
  setTrackingOrder: (o: TrackingOrder | null) => void;
  purchaseData: PurchaseOrder[];
  setPurchaseData: React.Dispatch<React.SetStateAction<PurchaseOrder[]>>;
  salesData: SalesOrder[];
  setSalesData: React.Dispatch<React.SetStateAction<SalesOrder[]>>;
  profileAvatar: string;
  setProfileAvatar: (url: string) => void;
  profileBanner: string;
  setProfileBanner: (url: string) => void;
};

export const AppContext = createContext<AppContextType>(null!);
export const useApp = () => useContext(AppContext);

