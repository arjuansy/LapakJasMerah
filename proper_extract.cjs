const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, 'src', 'app', 'App.tsx');
const content = fs.readFileSync(appPath, 'utf8');

const components = [
  { name: 'ProductDetailPage', startStr: '  function ProductDetailPage(' },
  { name: 'StorePage', startStr: '  function StorePage(' },
  { name: 'SalesStatsPage', startStr: '  function SalesStatsPage(' },
  { name: 'NotifPanel', startStr: '  function NotifPanel(' },
  { name: 'WishlistPage', startStr: '  function WishlistPage(' },
  { name: 'CategoriesPage', startStr: '  function CategoriesPage(' }
];

const nextFuncs = [
  '  function ReportModal(',
  '  function StorePage(',
  '  function NotifPanel(',
  '  function WishlistPage(',
  '  function CategoriesPage(',
  '  // ── RENDER ──'
];

for (let i = 0; i < components.length; i++) {
  const comp = components[i];
  const startIdx = content.indexOf(comp.startStr);
  
  let endIdx = -1;
  // find the next function
  let searchStart = startIdx + 10;
  
  // Actually, let's just find the closing bracket by a better heuristic.
  // The functions are at indentation level 2 (  function).
  // The closing bracket will be `  }` at the start of a line.
  
  const lines = content.slice(startIdx).split('\n');
  let body = [];
  for(let j=0; j<lines.length; j++) {
     body.push(lines[j]);
     if (lines[j] === '  }') {
         // This is the end
         break;
     }
  }
  
  let compCode = body.join('\n');
  
  const imports = `import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useApp } from "../context";
import { Product, formatPrice, storeProducts } from "../data";
import {
  ArrowLeft, Star, MapPin, Search, Grid3X3, Clock, Share2, Flag, ShoppingCart, MessageSquare, CheckCheck, Send, CheckCircle2, Package, TrendingUp, Filter, Heart, Tag, ExternalLink, ChevronRight, Zap, Bell, Image as ImageIcon, Smile, Settings, Edit3, Shield, Info, MoreVertical, Search as SearchIcon, X
} from "lucide-react";

`;
  
  compCode = compCode.replace(/^  function /, 'export default function ');
  
  fs.writeFileSync(path.join(__dirname, 'src', 'app', 'pages', `${comp.name}.tsx`), imports + compCode, 'utf8');
  console.log(`Extracted ${comp.name} successfully.`);
}
