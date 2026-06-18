import { useState, useRef, useEffect } from "react";
import {
  ArrowLeft,
  Phone,
  MoreVertical,
  CheckCheck,
  Image as ImageIcon,
  Smile,
  Send,
  Search,
  Tag,
  MessageCircle,
} from "lucide-react";
import { useApp } from "../context";
import { chatContacts, allProducts } from "../data";
import type { Message } from "../data";

export default function ChatPage() {
  const {
    activeChatId,
    setActiveChatId,
    messages,
    setMessages,
    inputText,
    setInputText,
    chatSearch,
    setChatSearch,
    setActiveTab,
    setSelectedProduct,
  } = useApp();

  const [activeFilter, setActiveFilter] = useState<"Semua" | "Belum Dibaca" | "Penjual" | "Pembeli">("Semua");
  const [contacts, setContacts] = useState(chatContacts);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeChatId, messages]);

  useEffect(() => {
    if (activeChatId !== null) {
      setContacts((prev) =>
        prev.map((c) => (c.id === activeChatId ? { ...c, unread: 0 } : c))
      );
    }
  }, [activeChatId]);

  const activeContact = contacts.find((c) => c.id === activeChatId);
  const filteredContacts = contacts.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(chatSearch.toLowerCase()) ||
      c.product.toLowerCase().includes(chatSearch.toLowerCase());
    if (!matchesSearch) return false;

    if (activeFilter === "Belum Dibaca") {
      return c.unread > 0;
    }
    if (activeFilter === "Penjual") {
      return c.role === "penjual";
    }
    if (activeFilter === "Pembeli") {
      return c.role === "pembeli";
    }
    return true;
  });
  const totalUnread = contacts.reduce((sum, c) => sum + c.unread, 0);

  function sendImage(imageUrl: string) {
    if (activeChatId === null) return;
    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
    const newMsg: Message = {
      id: Date.now(),
      text: "",
      image: imageUrl,
      fromMe: true,
      time,
      status: "sent",
    };
    setMessages((prev) => ({
      ...prev,
      [activeChatId]: [...(prev[activeChatId] || []), newMsg],
    }));

    // Auto reply simulation after image
    setTimeout(() => {
      const replies = [
        "Wah gambarnya jelas kak. Kondisi barangnya sesuai foto kan?",
        "Oke kak, saya cek dulu. Kita COD di Gazebo perpus kampus 3?",
        "Bagus kak. Boleh nego dikit kan ya?",
      ];
      const randomReply = replies[Math.floor(Math.random() * replies.length)];
      const replyMsg: Message = {
        id: Date.now() + 1,
        text: randomReply,
        fromMe: false,
        time: `${new Date().getHours().toString().padStart(2, "0")}:${new Date().getMinutes().toString().padStart(2, "0")}`,
        status: "sent",
      };
      setMessages((prev) => ({
        ...prev,
        [activeChatId]: [...(prev[activeChatId] || []), replyMsg],
      }));
    }, 1500);
  }

  function sendMessage() {
    if (!inputText.trim() || activeChatId === null) return;
    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
    const newMsg: Message = {
      id: Date.now(),
      text: inputText.trim(),
      fromMe: true,
      time,
      status: "sent",
    };
    setMessages((prev) => ({
      ...prev,
      [activeChatId]: [...(prev[activeChatId] || []), newMsg],
    }));
    setInputText("");

    // Auto reply simulation
    setTimeout(() => {
      const replies = [
        "Iya kak, barangnya masih bagus & mulus.",
        "Bisa COD di Gazebo GKB 1 UMM siang ini?",
        "Harga pas ya kak, udah murah banget soalnya.",
        "Boleh kak, mau ketemuan jam berapa?",
        "Siap kak! Sampai ketemu di lokasi COD nanti ya.",
      ];
      const randomReply = replies[Math.floor(Math.random() * replies.length)];
      const replyMsg: Message = {
        id: Date.now() + 1,
        text: randomReply,
        fromMe: false,
        time: `${new Date().getHours().toString().padStart(2, "0")}:${new Date().getMinutes().toString().padStart(2, "0")}`,
        status: "sent",
      };
      setMessages((prev) => ({
        ...prev,
        [activeChatId]: [...(prev[activeChatId] || []), replyMsg],
      }));
    }, 1500);
  }

  // Detail chat view
  if (activeChatId !== null && activeContact) {
    const msgs = messages[activeChatId] || [];
    return (
      <div className="flex flex-col h-screen bg-background" style={{ maxWidth: 430, margin: "0 auto" }}>
        {/* Chat Header */}
        <div className="bg-primary text-white px-4 pt-10 pb-3 flex items-center gap-3 shadow-md sticky top-0 z-40">
          <button
            onClick={() => setActiveChatId(null)}
            className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
          >
            <ArrowLeft size={20} className="text-white" />
          </button>
          <div className="relative">
            <img
              src={activeContact.avatar}
              alt={activeContact.name}
              className="w-9 h-9 rounded-full object-cover border-2 border-white/30"
            />
            {activeContact.online && (
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-primary" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm leading-tight truncate">{activeContact.name}</p>
            <p className="text-white/70 text-[10px]">
              {activeContact.online ? "Sedang online" : "Terakhir aktif kemarin"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                window.open(`tel:08123456789`, "_self");
              }}
              className="p-1.5 rounded-full hover:bg-white/10 active:scale-90 transition-transform"
            >
              <Phone size={17} className="text-white" />
            </button>
            <button className="p-1.5 rounded-full hover:bg-white/10">
              <MoreVertical size={17} className="text-white" />
            </button>
          </div>
        </div>

        {/* Product card */}
        <div className="px-4 py-2.5 bg-card border-b border-border">
          <div className="flex items-center gap-3 bg-secondary rounded-xl p-2.5">
            <img
              src={activeContact.productImg}
              alt={activeContact.product}
              className="w-11 h-11 rounded-lg object-cover bg-muted shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-muted-foreground font-medium leading-none mb-0.5">Produk yang ditanyakan</p>
              <p className="text-foreground font-bold text-xs truncate">{activeContact.product}</p>
            </div>
            <button
              onClick={() => {
                const prod = allProducts.find((p) => p.name === activeContact.product);
                if (prod) {
                  setSelectedProduct(prod);
                } else {
                  alert("Rincian produk tidak ditemukan.");
                }
              }}
              className="bg-primary text-white text-[10px] font-bold px-3 py-1.5 rounded-lg shrink-0 active:scale-95 transition-transform"
            >
              Lihat
            </button>
          </div>
        </div>

        {/* Messages */}
        <div
          className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, rgba(196,18,48,0.04) 1px, transparent 0)",
            backgroundSize: "20px 20px",
          }}
        >
          {msgs.map((msg, i) => {
            const showDate = i === 0;
            return (
              <div key={msg.id}>
                {showDate && (
                  <div className="flex justify-center mb-3">
                    <span className="bg-card text-muted-foreground text-[10px] font-medium px-3 py-1 rounded-full shadow-sm border border-border">
                      Hari ini
                    </span>
                  </div>
                )}
                <div className={`flex ${msg.fromMe ? "justify-end" : "justify-start"}`}>
                  {!msg.fromMe && (
                    <img
                      src={activeContact.avatar}
                      alt=""
                      className="w-7 h-7 rounded-full object-cover mr-2 mt-auto shrink-0"
                    />
                  )}
                  <div
                    className="max-w-[72%] px-3.5 py-2.5 shadow-sm overflow-hidden"
                    style={{
                      background: msg.fromMe ? "#c41230" : "#ffffff",
                      borderRadius: msg.fromMe
                        ? "18px 18px 4px 18px"
                        : "18px 18px 18px 4px",
                    }}
                  >
                    {msg.image && (
                      <img src={msg.image} alt="Media" className="max-w-full rounded-lg max-h-48 object-cover mb-1 bg-muted" />
                    )}
                    {msg.text && (
                      <p
                        className="text-sm leading-relaxed"
                        style={{ color: msg.fromMe ? "#ffffff" : "#1a1a2e" }}
                      >
                        {msg.text}
                      </p>
                    )}
                    <div className={`flex items-center gap-1 mt-0.5 ${msg.fromMe ? "justify-end" : "justify-start"}`}>
                      <span
                        className="text-[9px]"
                        style={{ color: msg.fromMe ? "rgba(255,255,255,0.7)" : "#8a8a9a" }}
                      >
                        {msg.time}
                      </span>
                      {msg.fromMe && (
                        <CheckCheck size={11} className="text-white/70" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick reply chips */}
        <div className="px-4 py-2 flex gap-2 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          {["Masih ada?", "Bisa COD?", "Harga final?", "Oke deal! 👍"].map((q) => (
            <button
              key={q}
              onClick={() => setInputText(q)}
              className="shrink-0 bg-secondary text-primary text-xs font-semibold px-3 py-1.5 rounded-full border border-primary/20 whitespace-nowrap"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input bar */}
        <div className="bg-card border-t border-border px-3 py-2.5 flex items-end gap-2">
          <label className="p-2 text-muted-foreground shrink-0 cursor-pointer hover:bg-secondary rounded-full active:scale-95 transition-all">
            <ImageIcon size={20} />
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    if (typeof reader.result === "string") {
                      sendImage(reader.result);
                    }
                  };
                  reader.readAsDataURL(file);
                }
              }}
            />
          </label>
          <button className="p-2 text-muted-foreground shrink-0" onClick={() => setInputText((prev) => prev + " 😊")}>
            <Smile size={20} />
          </button>
          <div className="flex-1 bg-muted rounded-2xl px-4 py-2.5 min-h-[40px] flex items-center">
            <textarea
              rows={1}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Ketik pesan..."
              className="flex-1 bg-transparent text-sm text-foreground outline-none resize-none placeholder:text-muted-foreground leading-relaxed"
              style={{ maxHeight: 80 }}
            />
          </div>
          <button
            onClick={sendMessage}
            disabled={!inputText.trim()}
            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all"
            style={{
              background: inputText.trim() ? "#c41230" : "#e5e5ea",
            }}
          >
            <Send size={16} className={inputText.trim() ? "text-white" : "text-muted-foreground"} />
          </button>
        </div>
        <div style={{ height: "env(safe-area-inset-bottom, 0px)" }} />
      </div>
    );
  }

  // Chat list view
  return (
    <div className="flex flex-col min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-primary text-white px-4 pt-10 pb-4 sticky top-0 z-40 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-white font-black text-xl">Pesan</h1>
          {totalUnread > 0 && (
            <span className="bg-accent text-foreground text-xs font-black px-2.5 py-1 rounded-full">
              {totalUnread} baru
            </span>
          )}
        </div>
        {/* Search */}
        <div className="flex items-center gap-2 bg-white/15 rounded-xl px-3 py-2.5">
          <Search size={15} className="text-white/70 shrink-0" />
          <input
            type="text"
            value={chatSearch}
            onChange={(e) => setChatSearch(e.target.value)}
            placeholder="Cari percakapan..."
            className="flex-1 text-sm text-white bg-transparent outline-none placeholder:text-white/50"
          />
        </div>
      </div>

      {/* Filter chips */}
      <div className="px-4 py-3 flex gap-2 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
        {(["Semua", "Belum Dibaca", "Penjual", "Pembeli"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className="shrink-0 text-xs font-bold px-4 py-1.5 rounded-full border transition-colors"
            style={
              activeFilter === f
                ? { background: "#c41230", color: "#fff", border: "1.5px solid #c41230" }
                : { background: "#fff", color: "#8a8a9a", border: "1.5px solid rgba(0,0,0,0.1)" }
            }
          >
            {f}
          </button>
        ))}
      </div>

      {/* Contact list */}
      <div className="flex-1 divide-y divide-border">
        {filteredContacts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-8">
            <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-4">
              <MessageCircle size={28} className="text-primary" />
            </div>
            <p className="text-foreground font-bold text-base mb-1">Tidak ada percakapan</p>
            <p className="text-muted-foreground text-sm">Coba kata kunci lain</p>
          </div>
        ) : (
          filteredContacts.map((contact) => (
            <button
              key={contact.id}
              onClick={() => setActiveChatId(contact.id)}
              className="w-full flex items-center gap-3 px-4 py-3.5 bg-card hover:bg-secondary/50 active:bg-secondary transition-colors text-left"
            >
              {/* Avatar */}
              <div className="relative shrink-0">
                <img
                  src={contact.avatar}
                  alt={contact.name}
                  className="w-12 h-12 rounded-full object-cover border border-border"
                />
                {contact.online && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-card" />
                )}
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <p className="font-bold text-sm text-foreground truncate">{contact.name}</p>
                  <span
                    className="text-[10px] font-medium shrink-0 ml-2"
                    style={{ color: contact.unread > 0 ? "#c41230" : "#8a8a9a" }}
                  >
                    {contact.time}
                  </span>
                </div>
                {/* Product pill */}
                <div className="flex items-center gap-1 mb-1">
                  <Tag size={9} className="text-muted-foreground shrink-0" />
                  <span className="text-[10px] text-muted-foreground truncate">{contact.product}</span>
                </div>
                <div className="flex items-center justify-between">
                  <p
                    className="text-xs truncate flex-1"
                    style={{
                      color: contact.unread > 0 ? "#1a1a2e" : "#8a8a9a",
                      fontWeight: contact.unread > 0 ? 600 : 400,
                    }}
                  >
                    {contact.lastMsg}
                  </p>
                  {contact.unread > 0 && (
                    <span className="ml-2 w-5 h-5 bg-primary text-white text-[10px] font-black rounded-full flex items-center justify-center shrink-0">
                      {contact.unread}
                    </span>
                  )}
                </div>
              </div>

              {/* Thumbnail */}
              <img
                src={contact.productImg}
                alt=""
                className="w-10 h-10 rounded-lg object-cover border border-border shrink-0"
              />
            </button>
          ))
        )}
      </div>
    </div>
  );
}
