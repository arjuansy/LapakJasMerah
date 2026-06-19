const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, 'src', 'app', 'App.tsx');
const content = fs.readFileSync(appPath, 'utf8');

const components = [
  { name: 'ProductDetailPage', startStr: '  function ProductDetailPage({', nextStr: '  function ReportModal()' },
  { name: 'StorePage', startStr: '  function StorePage({', nextStr: '  function SalesStatsPage()' },
  { name: 'SalesStatsPage', startStr: '  function SalesStatsPage()', nextStr: '  function NotifPanel()' },
  { name: 'NotifPanel', startStr: '  function NotifPanel()', nextStr: '  function WishlistPage()' },
  { name: 'WishlistPage', startStr: '  function WishlistPage()', nextStr: '  function CategoriesPage()' },
  { name: 'CategoriesPage', startStr: '  function CategoriesPage()', nextStr: '  // ── RENDER ──' }
];

for (const comp of components) {
  const startIdx = content.indexOf(comp.startStr);
  let endIdx = content.indexOf(comp.nextStr, startIdx);
  
  if (startIdx === -1 || endIdx === -1) {
    console.log("Failed to find boundaries for", comp.name);
    continue;
  }
  
  // Extract content between startIdx and endIdx
  let compCode = content.substring(startIdx, endIdx).trim();
  
  const imports = `import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useApp } from "../context";
import { Product, formatPrice, storeProducts } from "../data";
import {
  ArrowLeft, Star, MapPin, Search, Grid3X3, Clock, Share2, Flag, ShoppingCart, MessageSquare, CheckCheck, Send, CheckCircle2, Package, TrendingUp, Filter, Heart, Tag, ExternalLink, ChevronRight, Zap, Bell, Image as ImageIcon, Smile, Settings, Edit3, Shield, Info, MoreVertical, Search as SearchIcon, X
} from "lucide-react";

`;
  
  compCode = compCode.replace(/^function /, 'export default function ');
  
  fs.writeFileSync(path.join(__dirname, 'src', 'app', 'pages', `${comp.name}.tsx`), imports + compCode, 'utf8');
  console.log(`Extracted ${comp.name} successfully.`);
}
