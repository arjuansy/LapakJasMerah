import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Phone, MoreVertical, Send } from "lucide-react";
import { useApp } from "../context";
import api from "../api";

interface Message {
  id: string;
  sender_id: string;
  content: string;
  sent_at: string;
}

interface Chat {
  id: string;
  product: { id: string; name: string; price: string; image_url: string };
  seller: { id: string; name: string; avatar_url: string };
  buyer: { id: string; name: string; avatar_url: string };
  messages: Message[];
}

export default function ChatPage() {
  const navigate = useNavigate();
  const { chatId } = useParams<{ chatId: string }>();
  
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Ambil userInfo dari local storage untuk mendapatkan myId
  const userInfoStr = localStorage.getItem("userInfo");
  const userInfo = userInfoStr ? JSON.parse(userInfoStr) : null;
  const myId = userInfo?.user?.id;

  // Fetch list of chats if no chatId, or fetch specific chat messages
  useEffect(() => {
    if (chatId) {
      // Fetch messages for specific chat
      api.get(`/chats/${chatId}/messages`)
        .then(res => {
          setActiveChat(res.data.chat);
          setMessages(res.data.messages);
        })
        .catch(err => console.error("Failed to load chat", err));
    } else {
      // Fetch all chats
      api.get("/chats")
        .then(res => {
          setChats(res.data);
        })
        .catch(err => console.error("Failed to load chats", err));
    }
  }, [chatId]);

  // Polling messages every 3 seconds instead of WebSockets
  useEffect(() => {
    if (!chatId) return;

    const interval = setInterval(() => {
      api.get(`/chats/${chatId}/messages`)
        .then(res => {
          setMessages(res.data.messages);
        })
        .catch(err => console.error("Failed to poll messages", err));
    }, 3000);

    return () => clearInterval(interval);
  }, [chatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSendMessage() {
    if (!inputText.trim() || !chatId) return;
    
    // Optimistic UI update
    const optimisticMsg: Message = {
      id: Date.now().toString(),
      sender_id: myId,
      content: inputText.trim(),
      sent_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, optimisticMsg]);
    setInputText("");

    try {
      await api.post(`/chats/${chatId}/messages`, { content: optimisticMsg.content });
    } catch (e) {
      console.error("Gagal mengirim pesan", e);
      // Anda dapat menambahkan logika retry atau hapus pesan optimistik di sini
    }
  }

  function getOpponent(chat: Chat) {
    return chat.buyer.id === myId ? chat.seller : chat.buyer;
  }

  function formatTime(isoString: string) {
    const d = new Date(isoString);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  }

  // ==== TAMPILAN DETAIL CHAT ====
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
            <img src={opponent.avatar_url || "https://api.dicebear.com/7.x/avataaars/svg?seed=user"} alt={opponent.name} className="w-9 h-9 rounded-full object-cover border-2 border-white/30" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm leading-tight truncate">{opponent.name}</p>
          </div>
        </div>

        {/* Product context card */}
        {prod && (
          <div className="px-4 py-2.5 bg-card border-b border-border shadow-sm">
            <div className="flex items-center gap-3 bg-secondary/80 rounded-xl p-2.5">
              <img src={prod.image_url} alt={prod.name} className="w-11 h-11 rounded-lg object-cover bg-muted shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-muted-foreground font-medium leading-none mb-0.5">Kamu bertanya tentang produk ini</p>
                <p className="text-foreground font-bold text-xs truncate">{prod.name}</p>
                <p className="text-primary font-black text-xs">Rp {prod.price}</p>
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
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                  <div className={`flex items-center justify-end gap-1 mt-1 ${isMe ? "text-white/70" : "text-muted-foreground"}`}>
                    <span className="text-[9px] font-medium">{formatTime(msg.sent_at)}</span>
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
      </div>

      <div className="flex-1 overflow-y-auto">
        {chats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full px-4 text-center">
            <p className="text-muted-foreground text-sm font-medium mt-4">Belum ada percakapan</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {chats.map((chat) => {
              const opp = getOpponent(chat);
              const lastMsg = chat.messages?.[0]?.content || "Mulai percakapan";
              return (
                <button
                  key={chat.id}
                  onClick={() => navigate(`/chat/${chat.id}`)}
                  className="w-full px-4 py-3.5 flex items-start gap-3 hover:bg-secondary/50 transition-colors text-left"
                >
                  <img src={opp.avatar_url || "https://api.dicebear.com/7.x/avataaars/svg?seed=user"} alt="" className="w-12 h-12 rounded-full object-cover shrink-0 bg-muted" />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-0.5">
                      <p className="font-bold text-foreground text-sm truncate pr-2">{opp.name}</p>
                    </div>
                    <p className="text-muted-foreground text-xs truncate mb-1">{lastMsg}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] bg-secondary text-muted-foreground px-2 py-0.5 rounded-md font-medium border border-border truncate max-w-[150px]">
                        {chat.product?.name}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
