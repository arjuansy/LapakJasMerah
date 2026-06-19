const fs = require('fs');
const path = require('path');

const files = [
  'ProductDetailPage.tsx', 'StorePage.tsx', 'SalesStatsPage.tsx', 
  'NotifPanel.tsx', 'WishlistPage.tsx', 'CategoriesPage.tsx'
];
const baseDir = path.join(__dirname, 'src', 'app', 'pages');

const imports = `import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useApp } from "../context";
import { Product, formatPrice, storeProducts } from "../data";
import {
  ArrowLeft, Star, MapPin, Search, Grid3X3, Clock, Share2, Flag, ShoppingCart, MessageSquare, CheckCheck, Send, CheckCircle2, Package, TrendingUp, Filter, Heart, Tag, ExternalLink, ChevronRight, Zap, Bell, Image as ImageIcon, Smile, Settings, Edit3, Shield, Info, MoreVertical
} from "lucide-react";

`;

for (const f of files) {
  const filePath = path.join(baseDir, f);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace the component declaration
  const compName = f.replace('.tsx', '');
  content = content.replace(new RegExp(`^\\s*function ${compName}\\s*\\(`, 'm'), `export default function ${compName}(`);
  
  // Add imports
  fs.writeFileSync(filePath, imports + content, 'utf8');
  console.log('Updated', f);
}
