import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Phone, MoreVertical, Send, Camera, Image as ImageIcon, X, Loader2 } from "lucide-react";
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
  image_url?: string | null;
  message_type?: "text" | "image";
}

interface Chat {
  id: string;
  product: { id: string; name: string; price: string; image_url: string };
  seller: { id: string; name: string; avatar_url: string };
  buyer: { id: string; name: string; avatar_url: string };
  messages: Message[];
}

class ChatErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: Error | null }> {
  constructor(props: { children: React.ReactNode }) {
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
  // =========================================================
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [filter, setFilter] = useState<"semua" | "belum_dibaca" | "sudah_dibaca">("semua");

  // State untuk fitur kamera/upload gambar
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

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
            messages(id, content, sent_at, sender_id, is_read, image_url, message_type)
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

  // Subscription global: update preview "pesan terakhir" + badge unread
  // di tampilan DAFTAR chat, walau chat itu belum dibuka.
  useEffect(() => {
    if (!myId) return;

    const listChannel = supabase
      .channel(`realtime:chats_list:${myId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages'
      }, (payload) => {
        const newMsg = payload.new as Message & { chat_id: string };

        setChats(prev => {
          const idx = prev.findIndex(c => c.id === newMsg.chat_id);
          if (idx === -1) return prev;

          const updated = [...prev];
          const targetChat = updated[idx];
          const existingMsgs = Array.isArray(targetChat.messages) ? targetChat.messages : [];

          if (existingMsgs.find(m => m.id === newMsg.id)) return prev;

          updated[idx] = {
            ...targetChat,
            messages: [...existingMsgs, newMsg]
          };
          return updated;
        });
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'messages'
      }, (payload) => {
        const updatedMsg = payload.new as Message & { chat_id: string };

        setChats(prev => prev.map(c => {
          if (c.id !== updatedMsg.chat_id) return c;
          const existingMsgs = Array.isArray(c.messages) ? c.messages : [];
          return {
            ...c,
            messages: existingMsgs.map(m => m.id === updatedMsg.id ? { ...m, ...updatedMsg } : m)
          };
        }));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(listChannel);
    };
  }, [myId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Mark messages as read when opening a chat
  useEffect(() => {
    if (chatId && myId) {
      supabase.from('messages')
        .update({ is_read: true })
        .eq('chat_id', chatId)
        .neq('sender_id', myId)
        .then(({ error }) => {
          if (error) {
            console.error("Failed to mark as read:", error);
            return;
          }

          setMessages(prev =>
            prev.map(m =>
              m.sender_id !== myId ? { ...m, is_read: true } : m
            )
          );

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

  // Bersihkan object URL preview saat komponen unmount / file berubah,
  // supaya tidak ada memory leak.
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);
  // =========================================================
  // AKHIR DARI SEMUA HOOK
  // =========================================================

  function handleFileSelected(file: File | null) {
    setShowAttachMenu(false);
    if (!file) return;

    // Validasi sederhana di sisi client (selaras dengan limit bucket: 5MB, tipe gambar)
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Format file tidak didukung. Gunakan JPG, PNG, WEBP, atau GIF.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran file maksimal 5MB.");
      return;
    }

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  }

  function cancelPreview() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewFile(null);
    setPreviewUrl(null);
  }

  async function uploadImageAndGetUrl(file: File): Promise<string | null> {
    if (!chatId || !myId) return null;

    const fileExt = file.name.split('.').pop() || 'jpg';
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
    // Path konvensi: {chat_id}/{user_id}/{filename} -> dipakai juga oleh RLS storage policy
    const filePath = `${chatId}/${myId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('chat-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error("Gagal upload gambar:", uploadError);
      toast.error("Gagal mengunggah gambar: " + uploadError.message);
      return null;
    }

    const { data: publicUrlData } = supabase.storage
      .from('chat-images')
      .getPublicUrl(filePath);

    return publicUrlData?.publicUrl || null;
  }

  async function handleSendMessage() {
    if (!chatId || !myId) return;
    if (!inputText.trim() && !previewFile) return;

    const content = inputText.trim();
    setInputText("");

    // ===== Kirim pesan GAMBAR =====
    if (previewFile) {
      const fileToUpload = previewFile;
      cancelPreview();
      setUploading(true);

      const tempId = `temp-${Date.now()}`;
      const tempImageUrl = URL.createObjectURL(fileToUpload);

      // Optimistic UI: tampilkan dulu pakai object URL lokal sambil upload jalan
      const optimisticMsg: Message = {
        id: tempId,
        sender_id: myId,
        content: content,
        sent_at: new Date().toISOString(),
        is_read: false,
        image_url: tempImageUrl,
        message_type: "image"
      };
      setMessages(prev => [...prev, optimisticMsg]);

      const uploadedUrl = await uploadImageAndGetUrl(fileToUpload);
      setUploading(false);

      if (!uploadedUrl) {
        // Upload gagal -> rollback optimistic message
        setMessages(prev => prev.filter(m => m.id !== tempId));
        URL.revokeObjectURL(tempImageUrl);
        return;
      }

      const { data, error } = await supabase.from('messages').insert({
        chat_id: chatId,
        sender_id: myId,
        content: content,
        image_url: uploadedUrl,
        message_type: "image",
        is_read: false
      }).select().single();

      URL.revokeObjectURL(tempImageUrl);

      if (error) {
        console.error("Gagal mengirim pesan gambar", error.message);
        toast.error("Gagal mengirim gambar: " + error.message);
        setMessages(prev => prev.filter(m => m.id !== tempId));
      } else if (data) {
        setMessages(prev => prev.map(m => m.id === tempId ? data : m));
      }
      return;
    }

    // ===== Kirim pesan TEKS biasa =====
    const tempId = `temp-${Date.now()}`;
    const newMessage: Message = {
      id: tempId,
      sender_id: myId,
      content: content,
      sent_at: new Date().toISOString(),
      is_read: false,
      message_type: "text"
    };

    setMessages(prev => [...prev, newMessage]);

    const { data, error } = await supabase.from('messages').insert({
      chat_id: chatId,
      sender_id: myId,
      content: content,
      message_type: "text",
      is_read: false
    }).select().single();

    if (error) {
      console.error("Gagal mengirim pesan", error.message);
      toast.error("Gagal mengirim pesan: " + error.message);
      setMessages(prev => prev.filter(m => m.id !== tempId));
    } else if (data) {
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
  if (chatId && activeChat) {
    const opponent = getOpponent(activeChat);
    const prod = activeChat.product;

    return (
      <div className="flex flex-col h-screen bg-background" style={{ maxWidth: 430, margin: "0 auto" }}>
        {/* Hidden file inputs untuk kamera & galeri */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => handleFileSelected(e.target.files?.[0] || null)}
        />
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFileSelected(e.target.files?.[0] || null)}
        />

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
            const isImage = msg.message_type === "image" && msg.image_url;

            return (
              <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[75%] rounded-2xl shadow-sm relative ${isImage ? "p-1.5" : "px-4 py-2.5"} ${isMe ? "bg-primary text-white rounded-br-sm" : "bg-card border border-border text-foreground rounded-bl-sm"}`}>
                  {isImage ? (
                    <div>
                      <img
                        src={msg.image_url!}
                        alt="Lampiran gambar"
                        className="rounded-xl max-h-72 w-full object-cover cursor-pointer"
                        onClick={() => window.open(msg.image_url!, '_blank')}
                      />
                      {msg.content && (
                        <p className="text-sm leading-relaxed mt-2 px-1.5">
                          {String(msg.content)}
                        </p>
                      )}
                      <div className={`flex items-center justify-end gap-1 mt-1 px-1.5 ${isMe ? "text-white/70" : "text-muted-foreground"}`}>
                        <span className="text-[9px] font-medium">{String(formatTime(msg?.sent_at || ""))}</span>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm leading-relaxed">
                        {typeof msg?.content === 'object' ? JSON.stringify(msg.content) : String(msg?.content || "")}
                      </p>
                      <div className={`flex items-center justify-end gap-1 mt-1 ${isMe ? "text-white/70" : "text-muted-foreground"}`}>
                        <span className="text-[9px] font-medium">{String(formatTime(msg?.sent_at || ""))}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Preview gambar sebelum kirim */}
        {previewUrl && (
          <div className="px-4 pt-3 bg-card border-t border-border">
            <div className="relative inline-block">
              <img src={previewUrl} alt="Preview" className="h-24 rounded-xl object-cover border border-border" />
              <button
                onClick={cancelPreview}
                className="absolute -top-2 -right-2 w-6 h-6 bg-neutral-900 text-white rounded-full flex items-center justify-center shadow-md"
              >
                <X size={13} />
              </button>
            </div>
          </div>
        )}

        {/* Attach menu popup (pilih kamera / galeri) */}
        {showAttachMenu && (
          <div className="px-4 pt-2 bg-card border-t border-border flex gap-3">
            <button
              onClick={() => { setShowAttachMenu(false); cameraInputRef.current?.click(); }}
              className="flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl bg-secondary text-primary font-bold text-xs active:scale-95 transition-transform"
            >
              <Camera size={20} />
              Kamera
            </button>
            <button
              onClick={() => { setShowAttachMenu(false); galleryInputRef.current?.click(); }}
              className="flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl bg-secondary text-primary font-bold text-xs active:scale-95 transition-transform"
            >
              <ImageIcon size={20} />
              Galeri
            </button>
          </div>
        )}

        {/* Input Bar */}
        <div className="bg-card border-t border-border px-4 py-3 flex gap-2 items-end z-40">
          <button
            onClick={() => setShowAttachMenu(prev => !prev)}
            disabled={uploading}
            className="w-11 h-11 rounded-full bg-secondary flex items-center justify-center shrink-0 text-primary disabled:opacity-50"
          >
            <Camera size={18} />
          </button>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={previewFile ? "Tambahkan keterangan (opsional)..." : "Tulis Pesan..."}
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
            disabled={(!inputText.trim() && !previewFile) || uploading}
            className="w-11 h-11 rounded-full bg-primary flex items-center justify-center shrink-0 disabled:opacity-50 disabled:bg-muted"
          >
            {uploading ? (
              <Loader2 size={18} className="text-white animate-spin" />
            ) : (
              <Send size={18} className="text-white ml-1" />
            )}
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
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${filter === f.id ? "bg-white text-primary" : "bg-white/20 text-white hover:bg-white/30"
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
              const lastMsg = lastMsgObj?.message_type === "image"
                ? "📷 Foto"
                : (lastMsgObj?.content || "Mulai percakapan");
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