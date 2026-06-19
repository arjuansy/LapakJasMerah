import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useApp } from "../context";
import { Product, formatPrice, storeProducts } from "../data";
import {
  ArrowLeft, Star, MapPin, Search, Grid3X3, Clock, Share2, Flag, ShoppingCart, MessageSquare, CheckCheck, Send, CheckCircle2, Package, TrendingUp, Filter, Heart, Tag, ExternalLink, ChevronRight, Zap, Bell, Image as ImageIcon, Smile, Settings, Edit3, Shield, Info, MoreVertical, Search as SearchIcon, X
} from "lucide-react";

export default function NotifPanel() {
  const navigate = useNavigate();
  const { notifData, readNotifs, setReadNotifs, setShowNotif } = useApp();

  const unreadCount = notifData.filter((n) => !n.read && !readNotifs.includes(n.id)).length;

    return (
      <>
        {/* Backdrop */}
        <div className="fixed inset-0 z-[70]" onClick={() => setShowNotif(false)} />

        {/* Panel */}
        <div
          className="fixed top-0 right-0 bottom-0 z-[80] bg-card shadow-2xl flex flex-col"
          style={{ width: "min(360px, 100vw)", maxWidth: 430, borderLeft: "1px solid rgba(0,0,0,0.08)" }}
        >
          {/* Header */}
          <div className="bg-primary px-4 pt-10 pb-4">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-white font-black text-xl">Notifikasi</h2>
              <button onClick={() => setShowNotif(false)} className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <X size={16} className="text-white" />
              </button>
            </div>
            <p className="text-white/60 text-xs">
              {unreadCount > 0 ? `${unreadCount} belum dibaca` : "Semua sudah dibaca"}
            </p>
          </div>

          {/* Mark all read */}
          {unreadCount > 0 && (
            <button
              onClick={() => setReadNotifs(notifData.map((n) => n.id))}
              className="mx-4 mt-3 text-primary text-xs font-bold text-right block"
            >
              Tandai semua dibaca
            </button>
          )}

          {/* List */}
          <div className="flex-1 overflow-y-auto divide-y divide-border">
            {notifData.map((n) => {
              const isRead = n.read || readNotifs.includes(n.id);
              return (
                <button
                  key={n.id}
                  onClick={() => setReadNotifs((r) => r.includes(n.id) ? r : [...r, n.id])}
                  className="w-full flex items-start gap-3 px-4 py-3.5 text-left transition-colors hover:bg-muted/50 active:bg-muted"
                  style={{ background: isRead ? "transparent" : "rgba(196,18,48,0.04)" }}
                >
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 mt-0.5" style={{ background: n.color + "18" }}>
                    <n.icon size={18} style={{ color: n.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm leading-snug ${isRead ? "text-foreground font-medium" : "text-foreground font-bold"}`}>
                        {n.title}
                      </p>
                      {!isRead && <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />}
                    </div>
                    <p className="text-muted-foreground text-xs leading-relaxed mt-0.5 line-clamp-2">{n.body}</p>
                    <p className="text-muted-foreground text-[10px] mt-1.5 flex items-center gap-1">
                      <Clock size={9} /> {n.time}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </>
    );
  }

  // ── WISHLIST PAGE ──