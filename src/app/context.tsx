import { createContext, useContext } from "react";
import type { Message, Product, RequestItem } from "./data";

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
  // wishlist
  wishlist: string[];
  toggleWishlist: (id: string) => void;
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
  purchaseData: PurchaseOrder[];
  setPurchaseData: React.Dispatch<React.SetStateAction<PurchaseOrder[]>>;
  salesData: SalesOrder[];
  setSalesData: React.Dispatch<React.SetStateAction<SalesOrder[]>>;
  profileAvatar: string;
  setProfileAvatar: (url: string) => void;
  profileBanner: string;
  setProfileBanner: (url: string) => void;
  triggerToast: (msg: string) => void;
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  listings: any[];
  setListings: React.Dispatch<React.SetStateAction<any[]>>;
  contacts: any[];
  setContacts: React.Dispatch<React.SetStateAction<any[]>>;
  startChat: (sellerName: string, productName?: string, productImg?: string, productPrice?: number) => void;
  // new additions
  requests: RequestItem[];
  setRequests: React.Dispatch<React.SetStateAction<RequestItem[]>>;
  editingRequest: RequestItem | null;
  setEditingRequest: (r: RequestItem | null) => void;
  showPostRequestModal: boolean;
  setShowPostRequestModal: (v: boolean) => void;
  notifData: any[]; // Deprecated, kept temporarily to avoid immediate errors
  notifications: any[];
  setNotifications: React.Dispatch<React.SetStateAction<any[]>>;
  unreadChatCount: number;
  setUnreadChatCount: React.Dispatch<React.SetStateAction<number>>;
  toastMessage: string | null;
  setToastMessage: (msg: string | null) => void;
  activeTab: any;
  setActiveTab: (tab: any) => void;
  trackingOrder: TrackingOrder | null;
  setTrackingOrder: (order: TrackingOrder | null) => void;
  selectedProduct: Product | null;
  setSelectedProduct: (p: Product | null) => void;
};

export const AppContext = createContext<AppContextType>(null!);
export const useApp = () => useContext(AppContext);

