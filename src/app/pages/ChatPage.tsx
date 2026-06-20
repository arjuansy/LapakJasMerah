import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Phone, MoreVertical, Send } from "lucide-react";
import { useApp } from "../context";
import { supabase } from "../../config/supabaseClient";
import { useAuth } from "../../hooks/useAuth";
import toast from "react-hot-toast";

interface Message {
  id: string;
  sender_id: string;
  content: string;
  sent_at: string;
  is_read?: boolean;
}

interface Chat {
  id: string;
  product: { id: string; name: string; price: string; image_url: string };
  seller: { id: string; name: string; avatar_url: string };
  buyer: { id: string; name: string; avatar_url: string };
  messages: Message[];
}

class ChatErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: Error | null}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-100 text-red-900 h-screen overflow-auto">
          <h1 className="font-bold text-xl mb-2">Error in ChatPage!</h1>
          <p className="font-mono text-sm whitespace-pre-wrap">{this.state.error?.toString()}</p>
          <p className="font-mono text-xs whitespace-pre-wrap mt-4">{this.state.error?.stack}</p>
        </div>
      );
    }
    return this.props.children;
  }
}

function ChatPageInner() {
  const navigate = useNavigate();
  const { chatId } = useParams<{ chatId: string }>();
  const { user } = useAuth();

  // =========================================================
  // SEMUA HOOK HARUS DI SINI, DI PALING ATAS, TANPA TERKECUALI.
  // Jangan ada hook lagi di bawah setelah ini, dan jangan ada
  // `if (...) return ...` di ATAS baris-baris hook ini.
  // =========================================================
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [filter, setFilter] = useState<"semua" | "belum_dibaca" | "sudah_dibaca">("semua");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const myId = user?.id;

  // Fetch list of chats if no chatId, or fetch specific chat messages
  useEffect(() => {
    if (!myId) return;

    if (chatId) {
      const fetchChat = async () => {
        const { data: chatData, error: chatErr } = await supabase
          .from('chats')
          .select(`
            id,
            product:products(id, name, price, image_url),
            seller:profiles!chats_seller_id_fkey(id, full_name, avatar_url),
            buyer:profiles!chats_buyer_id_fkey(id, full_name, avatar_url)
          `)
          .eq('id', chatId)
          .maybeSingle();

        if (chatErr) console.error("Error fetching chat:", chatErr.message);

        if (chatData) {
          const extractObj = (rel: any) => Array.isArray(rel) ? rel[0] : rel;

          const sellerObj = extractObj(chatData.seller);
          const buyerObj = extractObj(chatData.buyer);
          const productObj = extractObj(chatData.product);

          setActiveChat({
            ...chatData,
            product: productObj,
            seller: sellerObj ? { ...sellerObj, name: sellerObj.full_name } : null,
            buyer: buyerObj ? { ...buyerObj, name: buyerObj.full_name } : null
          } as any);
        } else if (!chatErr) {
          // chat tidak ditemukan — reset activeChat supaya tidak nyangkut data lama
          setActiveChat(null);
        }

        const { data: msgs, error: msgErr } = await supabase
          .from('messages')
          .select('*')
          .eq('chat_id', chatId)
          .order('sent_at', { ascending: true });

        if (msgErr) console.error("Error fetching messages:", msgErr.message);
        if (msgs) setMessages(msgs);
      };
      fetchChat();
    } else {
      // Reset activeChat ketika balik ke daftar chat
      setActiveChat(null);
      setMessages([]);

      const fetchAllChats = async () => {
        const { data, error } = await supabase
          .from('chats')
          .select(`
            id,
            product:products(id, name, price, image_url),
            seller:profiles!chats_seller_id_fkey(id, full_name, avatar_url),
            buyer:profiles!chats_buyer_id_fkey(id, full_name, avatar_url),
            messages(id, content, sent_at, sender_id, is_read)
          `)
          .or(`buyer_id.eq.${myId},seller_id.eq.${myId}`);

        if (error) console.error("Error fetching all chats:", error.message);

        if (data) {
          const extractObj = (rel: any) => Array.isArray(rel) ? rel[0] : rel;

          const mapped = data.map((c: any) => {
             const sellerObj = extractObj(c.seller);
             const buyerObj = extractObj(c.buyer);

             return {
               ...c,
               product: extractObj(c.product),
               seller: sellerObj ? { ...sellerObj, name: sellerObj.full_name } : null,
               buyer: buyerObj ? { ...buyerObj, name: buyerObj.full_name } : null
             };
          });
          setChats(mapped as any);
        }
      };
      fetchAllChats();
    }
  }, [chatId, myId]);

  useEffect(() => {
    if (!chatId) return;

    const channel = supabase
      .channel(`realtime:messages:${chatId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `chat_id=eq.${chatId}`
      }, (payload) => {
        setMessages(prev => {
          if (prev.find(m => m.id === payload.new.id)) return prev;
          return [...prev, payload.new as Message];
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Mark messages as read when opening a chat
  useEffect(() => {
    if (chatId && myId) {
      console.log("[mark-as-read] triggered for chatId:", chatId, "myId:", myId);
      supabase.from('messages')
        .update({ is_read: true })
        .eq('chat_id', chatId)
        .neq('sender_id', myId)
        .select() // <-- penting: paksa supabase mengembalikan baris yang ter-update
        .then(({ data, error }) => {
          console.log("[mark-as-read] result:", { updatedRows: data?.length, error });
          if (error) {
            console.error("Failed to mark as read:", error);
            return;
          }
          if (!data || data.length === 0) {
            console.warn("[mark-as-read] 0 baris ter-update — kemungkinan kena RLS atau chat_id/sender_id tidak match!");
          }

          // Sinkronkan state lokal supaya badge "belum dibaca" di daftar chat
          // langsung hilang, tanpa perlu fetch ulang seluruh daftar chat.

          // 1) Update messages di tampilan detail chat (kalau lagi dibuka)
          setMessages(prev =>
            prev.map(m =>
              m.sender_id !== myId ? { ...m, is_read: true } : m
            )
          );

          // 2) Update messages di dalam state `chats` (dipakai daftar chat)
          setChats(prev =>
            prev.map(c =>
              c.id === chatId
                ? {
                    ...c,
                    messages: (c.messages || []).map(m =>
                      m.sender_id !== myId ? { ...m, is_read: true } : m
                    )
                  }
                : c
            )
          );
        });
    }
  }, [chatId, myId]);
  // =========================================================
  // AKHIR DARI SEMUA HOOK
  // =========================================================

  async function handleSendMessage() {
    if (!inputText.trim() || !chatId || !myId) return;

    const content = inputText.trim();
    setInputText("");

    // Optimistic UI Update
    const tempId = `temp-${Date.now()}`;
    const newMessage: Message = {
      id: tempId,
      sender_id: myId,
      content: content,
      sent_at: new Date().toISOString(),
      is_read: false
    };

    setMessages(prev => [...prev, newMessage]);

    const { data, error } = await supabase.from('messages').insert({
      chat_id: chatId,
      sender_id: myId,
      content: content,
      is_read: false
    }).select().single();

    if (error) {
      console.error("Gagal mengirim pesan", error.message);
      toast.error("Gagal mengirim pesan: " + error.message);

      // Rollback optimistic update
      setMessages(prev => prev.filter(m => m.id !== tempId));
    } else if (data) {
      // Replace temp ID with real ID from database
      setMessages(prev => prev.map(m => m.id === tempId ? data : m));
    }
  }

  function getOpponent(chat: Chat) {
    if (!chat) return { name: "Pengguna", avatar_url: "/default-avatar.png", id: "" };

    const buyer = chat.buyer || { id: "", name: "Pembeli Hapus", avatar_url: "" };
    const seller = chat.seller || { id: "", name: "Penjual Hapus", avatar_url: "" };

    return buyer.id === myId ? seller : buyer;
  }

  function formatTime(isoString: string) {
    const d = new Date(isoString);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  }

  const hasUnread = (chat: Chat) => {
    if (!chat || !chat.messages || !Array.isArray(chat.messages)) return false;
    return chat.messages.some(m => m.sender_id !== myId && m.is_read === false);
  };

  const filteredChats = chats.filter(chat => {
    if (filter === "semua") return true;
    const unread = hasUnread(chat);
    if (filter === "belum_dibaca") return unread;
    if (filter === "sudah_dibaca") return !unread;
    return true;
  });

  // ==== TAMPILAN DETAIL CHAT ====
  // Catatan: ini sekarang HANYA mengontrol JSX yang ditampilkan,
  // bukan jumlah hook yang dipanggil — jadi aman.
  if (chatId && activeChat) {
    const opponent = getOpponent(activeChat);
    const prod = activeChat.product;

    return (
      <div className="flex flex-col h-screen bg-background" style={{ maxWidth: 430, margin: "0 auto" }}>
        {/* Chat Header */}
        <div className="bg-primary text-white px-4 pt-10 pb-3 flex items-center gap-3 shadow-md sticky top-0 z-40">
          <button onClick={() => navigate("/chat")} className="p-1.5 rounded-full hover:bg-white/10 transition-colors">
            <ArrowLeft size={20} className="text-white" />
          </button>
          <div className="relative">
            <img src={opponent?.avatar_url || "/default-avatar.png"} alt={String(opponent?.name || "Pengguna")} className="w-9 h-9 rounded-full object-cover border-2 border-white/30" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm leading-tight truncate">
              {typeof opponent?.name === 'object' ? JSON.stringify(opponent.name) : String(opponent?.name || "Pengguna")}
            </p>
          </div>
        </div>

        {/* Product context card */}
        {prod && (
          <div className="px-4 py-2.5 bg-card border-b border-border shadow-sm">
            <div className="flex items-center gap-3 bg-secondary/80 rounded-xl p-2.5">
              <img src={prod?.image_url || "/default-banner.jpg"} alt={String(prod?.name)} className="w-11 h-11 rounded-lg object-cover bg-muted shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-muted-foreground font-medium leading-none mb-0.5">Kamu bertanya tentang produk ini</p>
                <p className="text-foreground font-bold text-xs truncate">
                  {typeof prod?.name === 'object' ? JSON.stringify(prod.name) : String(prod?.name || "")}
                </p>
                <p className="text-primary font-black text-xs">
                  Rp {typeof prod?.price === 'object' ? JSON.stringify(prod.price) : String(prod?.price || 0)}
                </p>
              </div>
              <button
                onClick={() => navigate(`/product/${prod.id}`)}
                className="bg-primary text-white text-[10px] font-bold px-3 py-1.5 rounded-lg shrink-0 active:scale-95 transition-transform"
              >
                Lihat
              </button>
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(196,18,48,0.04) 1px, transparent 0)", backgroundSize: "20px 20px" }}>
          {messages.map((msg) => {
            const isMe = msg.sender_id === myId;
            return (
              <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 shadow-sm relative ${isMe ? "bg-primary text-white rounded-br-sm" : "bg-card border border-border text-foreground rounded-bl-sm"}`}>
                  <p className="text-sm leading-relaxed">
                    {typeof msg?.content === 'object' ? JSON.stringify(msg.content) : String(msg?.content || "")}
                  </p>
                  <div className={`flex items-center justify-end gap-1 mt-1 ${isMe ? "text-white/70" : "text-muted-foreground"}`}>
                    <span className="text-[9px] font-medium">{String(formatTime(msg?.sent_at || ""))}</span>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="bg-card border-t border-border px-4 py-3 flex gap-2 items-end z-40">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Tulis Pesan..."
            className="flex-1 bg-secondary text-sm rounded-2xl px-4 py-3 outline-none resize-none max-h-32 text-foreground"
            rows={1}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputText.trim()}
            className="w-11 h-11 rounded-full bg-primary flex items-center justify-center shrink-0 disabled:opacity-50 disabled:bg-muted"
          >
            <Send size={18} className="text-white ml-1" />
          </button>
        </div>
      </div>
    );
  }

  // ==== LOADING STATE: chatId ada tapi activeChat belum siap ====
  if (chatId && !activeChat) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <p className="text-muted-foreground text-sm">Memuat percakapan...</p>
      </div>
    );
  }

  // ==== TAMPILAN DAFTAR CHAT ====
  return (
    <div className="flex flex-col h-full bg-background" style={{ maxWidth: 430, margin: "0 auto" }}>
      <div className="bg-primary text-white px-4 pt-10 pb-4 z-40 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/")} className="p-1.5 rounded-full hover:bg-white/10 transition-colors">
              <ArrowLeft size={20} className="text-white" />
            </button>
            <h1 className="text-xl font-black tracking-tight">Pesan</h1>
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {[
            { id: "semua", label: "Semua" },
            { id: "belum_dibaca", label: "Belum Dibaca" },
            { id: "sudah_dibaca", label: "Sudah Dibaca" }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id as any)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                filter === f.id ? "bg-white text-primary" : "bg-white/20 text-white hover:bg-white/30"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full px-4 text-center">
            <p className="text-muted-foreground text-sm font-medium mt-4">Belum ada percakapan</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredChats.map((chat) => {
              const opp = getOpponent(chat);

              const msgsArray = Array.isArray(chat.messages) ? chat.messages : [];
              const sortedMessages = [...msgsArray].sort((a, b) => {
                const timeA = a.sent_at ? new Date(a.sent_at).getTime() : 0;
                const timeB = b.sent_at ? new Date(b.sent_at).getTime() : 0;
                return timeB - timeA;
              });

              const lastMsgObj = sortedMessages[0];
              const lastMsg = lastMsgObj?.content || "Mulai percakapan";
              const isUnread = hasUnread(chat);

              return (
                <div key={chat.id} className="border-b-4 border-secondary/60 last:border-b-0">
                  <button
                    onClick={() => navigate(`/chat/${chat.id}`)}
                    className={`w-full px-4 py-3.5 flex items-start gap-3 hover:bg-secondary/50 transition-colors text-left ${isUnread ? "bg-primary/5" : ""}`}
                  >
                    <img src={opp.avatar_url || "/default-avatar.png"} alt="" className="w-12 h-12 rounded-full object-cover shrink-0 bg-muted" />
                    <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-0.5">
                      <p className={`text-sm truncate pr-2 ${isUnread ? "font-black text-foreground" : "font-bold text-foreground/80"}`}>{opp?.name || "Pengguna"}</p>
                      {lastMsgObj && (
                        <span className={`text-[10px] whitespace-nowrap ${isUnread ? "text-primary font-bold" : "text-muted-foreground"}`}>
                          {lastMsgObj.sent_at ? formatTime(lastMsgObj.sent_at) : ""}
                        </span>
                      )}
                    </div>
                    <div className="flex justify-between items-center">
                      <p className={`text-xs truncate pr-4 ${isUnread ? "text-foreground font-bold" : "text-muted-foreground"}`}>{lastMsg}</p>
                      {isUnread && (
                        <span className="w-2.5 h-2.5 bg-primary rounded-full shrink-0"></span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] bg-secondary text-muted-foreground px-2 py-0.5 rounded-md font-medium border border-border truncate max-w-[150px]">
                        {chat?.product?.name || "Produk"}
                      </span>
                    </div>
                  </div>
                </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <ChatErrorBoundary>
      <ChatPageInner />
    </ChatErrorBoundary>
  );
}
