const fs = require('fs');
const path = require('path');

const appTsxPath = path.join(__dirname, 'src', 'app', 'App.tsx');
let content = fs.readFileSync(appTsxPath, 'utf8');

const lines = content.split('\n');

const startIdx = lines.findIndex(l => l.includes('      {/* ── HEADER ── */}'));
const endIdx = lines.findIndex(l => l.includes('      {/* ── BOTTOM NAVIGATION ── */}'));

// Find closing main and div just before bottom navigation
let closingIdx = endIdx - 1;
while(closingIdx > startIdx && !lines[closingIdx].includes('</main>')) {
  closingIdx--;
}

if (startIdx !== -1 && closingIdx !== -1) {
  const feedContent = lines.slice(startIdx, closingIdx + 1).join('\n');
  
  const imports = `import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context";
import { categories, banners, recentProducts, extraProducts, requestBoard, formatPrice } from "../data";
import logo from "../../assets/logo.png";
import {
  Search, Bell, Heart, MapPin, Star, Zap, ShoppingCart, MessageSquare, ChevronRight, CheckCircle2, AlertCircle, ShoppingBag
} from "lucide-react";

export default function MarketplaceFeed() {
  const navigate = useNavigate();
  const { 
    searchFocused, setSearchFocused, globalSearch, setGlobalSearch, setShowSearchResults,
    activeBanner, setActiveBanner, wishlist, toggleWishlist, notifData, readNotifs, setShowNotif, setShowWishlist
  } = useApp();

  return (
    <>
${feedContent}
    </>
  );
}
`;

  fs.writeFileSync(path.join(__dirname, 'src', 'app', 'pages', 'MarketplaceFeed.tsx'), imports, 'utf8');
  console.log('Extracted MarketplaceFeed.tsx');
} else {
  console.log('Could not find boundaries', startIdx, closingIdx);
}
