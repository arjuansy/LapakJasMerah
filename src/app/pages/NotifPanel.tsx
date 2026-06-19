import React from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context";
import { supabase } from "../../config/supabaseClient";

import {
  Clock, Package, MessageSquare, Bell, X
} from "lucide-react";

export default function NotifPanel() {
  const navigate = useNavigate();
  const { notifications, setNotifications, setShowNotif } = useApp();

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const markAllRead = async () => {
    // Update locally first
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    // Update DB
    await supabase.from('notifications').update({ is_read: true }).eq('is_read', false);
  };

  const markRead = async (id: string, related_id: string | null, type: string) => {
    // Update locally
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    // Update DB
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);

    // Navigation
    setShowNotif(false);
    if (type === 'chat' && related_id) {
      navigate(`/chat/${related_id}`);
    } else if (type === 'order') {
      navigate(`/order-tracking`); // or wherever order details are
    }
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 60000) return "Baru saja";
    if (diff < 3600000) return `${Math.floor(diff/60000)}m yang lalu`;
    if (diff < 86400000) return `${Math.floor(diff/3600000)}j yang lalu`;
    return d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
  };

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
              onClick={markAllRead}
              className="mx-4 mt-3 text-primary text-xs font-bold text-right block"
            >
              Tandai semua dibaca
            </button>
          )}

          {/* List */}
          <div className="flex-1 overflow-y-auto divide-y divide-border">
            {notifications.map((n) => {
              const isRead = n.is_read;
              const Icon = n.type === 'order' ? Package : n.type === 'chat' ? MessageSquare : Bell;
              const color = n.type === 'order' ? '#10B981' : n.type === 'chat' ? '#3B82F6' : '#F59E0B';

              return (
                <button
                  key={n.id}
                  onClick={() => markRead(n.id, n.related_id, n.type)}
                  className="w-full flex items-start gap-3 px-4 py-3.5 text-left transition-colors hover:bg-muted/50 active:bg-muted"
                  style={{ background: isRead ? "transparent" : "rgba(196,18,48,0.04)" }}
                >
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 mt-0.5" style={{ background: color + "18" }}>
                    <Icon size={18} style={{ color: color }} />
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
                      <Clock size={9} /> {formatTime(n.created_at)}
                    </p>
                  </div>
                </button>
              );
            })}
            
            {notifications.length === 0 && (
              <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                 <p className="text-muted-foreground text-sm">Tidak ada notifikasi saat ini.</p>
              </div>
            )}
          </div>
        </div>
      </>
    );
  }

  // ── WISHLIST PAGE ──