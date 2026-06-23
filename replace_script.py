import sys

filepath = 'src/app/pages/ProductDetailPage.tsx'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

start_marker = '<div className=\"fixed inset-0 z-[60] bg-background overflow-y-auto max-w-[430px] lg:max-w-2xl mx-auto\">'
end_marker = '        {/* -- ORDER CONFIRMATION SHEET -- */}'

start_idx = content.find(start_marker)
if start_idx == -1:
    print('Error: start_marker not found')
    sys.exit(1)

end_idx = content.find(end_marker, start_idx)
if end_idx == -1:
    print('Error: end_marker not found')
    sys.exit(1)

new_block = '''<div className="fixed inset-0 z-[60] bg-background overflow-y-auto max-w-[430px] lg:max-w-6xl mx-auto">

    <div className="lg:flex lg:gap-10 lg:px-8 lg:pt-6 lg:items-start">

      {/* -- KOLOM KIRI: galeri foto -- */}
      <div className="lg:flex-1 lg:min-w-0">
        {/* -- IMAGE SECTION -- */}
        <div className="relative bg-muted lg:rounded-2xl lg:overflow-hidden" style={{ height: 320 }}>
          <img
            src={imgs[activeImg]}
            alt={product.name}
            className="w-full h-full object-cover lg:h-[460px]"
          />

          {/* Top bar */}
          <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 pt-10 lg:pt-4 pb-4"
            style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.45), transparent)" }}>
            <button
              onClick={() => navigate(-1)}
              className="w-9 h-9 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center"
            >
              <ArrowLeft size={18} className="text-white" />
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleShareProduct(product)}
                className="w-9 h-9 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center cursor-pointer active:scale-95 transition-transform"
              >
                <Share2 size={16} className="text-white" />
              </button>
              <button
                onClick={() => toggleWishlist(product.id)}
                className="w-9 h-9 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center"
              >
                <Heart
                  size={16}
                  className={wishlist.includes(product.id) ? "text-primary fill-primary" : "text-white"}
                />
              </button>
            </div>
          </div>

          {/* Discount badge */}
          {product.discount && (
            <div className="absolute top-14 lg:top-4 left-4 bg-primary text-white text-xs font-black px-2.5 py-1 rounded-lg">
              -{product.discount}%
            </div>
          )}

          {/* Image dots */}
          {imgs.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
              {imgs.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className="rounded-full transition-all"
                  style={{
                    width: i === activeImg ? 20 : 7,
                    height: 7,
                    background: i === activeImg ? "#c41230" : "rgba(255,255,255,0.6)",
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Thumbnail strip */}
        {imgs.length > 1 && (
          <div className="flex gap-2 px-4 lg:px-0 pt-3 pb-1">
            {imgs.map((src, i) => (
              <button
                key={i}
                onClick={() => setActiveImg(i)}
                className="shrink-0 rounded-xl overflow-hidden border-2 transition-all"
                style={{ borderColor: i === activeImg ? "#c41230" : "transparent", width: 52, height: 52 }}
              >
                <img src={src} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* -- KOLOM KANAN: info + penjual + kotak beli (sticky) -- */}
      <div className="lg:w-[400px] lg:shrink-0">
        {/* -- PRODUCT INFO -- */}
        <div className="px-4 lg:px-0 pt-3 pb-2">
          <h1 className="text-foreground font-black text-xl leading-snug mb-2">{product.name}</h1>

          <div className="flex items-end gap-3 mb-3">
            <span className="text-primary font-black text-2xl">{formatPrice(product.price)}</span>
            {product.originalPrice && (
              <span className="text-muted-foreground text-sm line-through pb-0.5">{formatPrice(product.originalPrice)}</span>
            )}
            {product.isNew && !isOutOfStock && (
              <span className="bg-green-100 text-green-700 text-[10px] font-black px-2 py-0.5 rounded-full pb-0.5">BARU</span>
            )}
            {isOutOfStock && (
              <span className="bg-neutral-200 text-neutral-600 text-[10px] font-black px-2 py-0.5 rounded-full pb-0.5">
                STOK HABIS
              </span>
            )}
          </div>

          <div className="flex items-center gap-4 mb-4 flex-wrap">
            <div className="flex items-center gap-1">
              <Star size={13} className="text-accent fill-accent" />
              <span className="text-sm font-bold text-foreground">
                {product.rating} {product.ratingCount ? () : ''}
              </span>
            </div>
            <div className="w-px h-4 bg-border" />
            <span className="text-sm text-muted-foreground">{product.sold} terjual</span>
            <div className="w-px h-4 bg-border" />
            <span className={	ext-sm font-semibold }>
              {isOutOfStock ? "Stok habis" : Sisa  stok}
            </span>
            <div className="w-px h-4 bg-border" />
            <div className="flex items-center gap-1">
              <MapPin size={12} className="text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{product.location}</span>
            </div>
          </div>

          {product.id % 2 === 0 && (
            <div className="inline-flex items-center gap-1.5 bg-accent/10 border border-accent/30 px-3 py-1.5 rounded-full mb-4">
              <Tag size={11} className="text-accent" />
              <span className="text-xs font-bold text-foreground">Harga Bisa Nego</span>
            </div>
          )}

          <button
            onClick={() => setShowReportModal({ type: "penjual", name: product.seller })}
            className="flex items-center gap-1.5 text-muted-foreground text-xs font-semibold mt-1"
          >
            <Flag size={12} /> Laporkan Penjual
          </button>
        </div>

        <div className="h-2 bg-muted lg:hidden" />

        {/* -- SELLER INFO -- */}
        <div className="px-4 lg:px-0 py-4 lg:border lg:border-border lg:rounded-2xl lg:mt-2 lg:bg-card lg:shadow-sm">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img src={sellerAvatar} alt={product.seller} className="w-12 h-12 rounded-full object-cover border-2 border-border" />
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-1">
                <p className="font-bold text-foreground text-sm">{product.seller}</p>
                <BadgeCheck size={14} className="text-blue-500 shrink-0" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground">Belum ada ulasan</span>
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <BadgeCheck size={11} className="text-blue-500" />
                <span className="text-[10px] text-muted-foreground">Mahasiswa Terverifikasi · Online sekarang</span>
              </div>
            </div>
            <button
              onClick={() => navigate('/store/' + product.seller_id)}
              className="bg-secondary text-primary text-xs font-bold px-3 py-2 rounded-xl border border-primary/20"
            >
              Lihat Toko
            </button>
          </div>
        </div>

        {/* -- KOTAK BELI: fixed footer di mobile, sticky card di desktop -- */}
        <div
          className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-card border-t border-border px-4 py-3 z-10 shadow-2xl
                     lg:left-0 lg:translate-x-0 lg:max-w-none lg:w-full lg:mt-4 lg:rounded-2xl lg:border lg:border-border
                     lg:shadow-sm lg:sticky lg:top-6 lg:bg-card lg:p-4"
        >
          {/* Qty selector */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-muted-foreground">Jumlah:</span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                disabled={isOutOfStock}
                className="w-8 h-8 rounded-full border-2 border-border flex items-center justify-center text-foreground font-bold text-lg disabled:opacity-40"
              >
                -
              </button>
              <span className="text-foreground font-black text-base w-6 text-center">{qty}</span>
              <button
                onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                disabled={isOutOfStock || qty >= product.stock}
                className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-lg disabled:opacity-40 disabled:bg-muted"
              >
                +
              </button>
            </div>
            <span className="text-primary font-black text-sm">{formatPrice(product.price * qty)}</span>
          </div>

          <div className="flex gap-2">
            {user?.id !== product.seller_id && (
              <button
                onClick={async () => { 
                  if (!user) {
                    toast.error("Anda harus login terlebih dahulu untuk chat.");
                    navigate("/auth");
                    return;
                  }
                  
                  try {
                    const { data: existingChat, error: checkError } = await supabase.from('chats')
                      .select('id')
                      .eq('buyer_id', user.id)
                      .eq('seller_id', product.seller_id)
                      .maybeSingle();

                    if (checkError) throw checkError;

                    if (existingChat) {
                      await supabase.from('chats')
                        .update({ product_id: product.id })
                        .eq('id', existingChat.id);

                      navigate(/chat/);
                    } else {
                      const { data: newChat, error } = await supabase.from('chats').insert({
                        buyer_id: user.id,
                        seller_id: product.seller_id,
                        product_id: product.id
                      }).select().single();
                      
                      if (error) {
                        if (error.code === '23505') {
                          const { data: retryChat } = await supabase.from('chats')
                            .select('id')
                            .eq('buyer_id', user.id)
                            .eq('seller_id', product.seller_id)
                            .maybeSingle();
                          if (retryChat) {
                            navigate(/chat/);
                            return;
                          }
                        }
                        throw error;
                      }
                      if (newChat) navigate(/chat/);
                    }
                  } catch (err) {
                    console.error(err);
                    toast.error("Gagal membuka chat");
                  }
                }}
                className="flex-1 bg-secondary border border-primary/20 text-primary font-bold py-3.5 rounded-2xl text-sm flex items-center justify-center gap-2"
              >
                <MessageSquare size={15} />
                Chat
              </button>
            )}
            <button
              onClick={() => {
                if (isOutOfStock) return;
                if (!user) {
                  toast.error("Anda harus login terlebih dahulu untuk membeli barang.");
                  navigate("/auth");
                  return;
                }
                if (user.id === product.seller_id) {
                  toast.error("Anda tidak dapat membeli barang milik Anda sendiri.");
                  return;
                }
                setShowOrder(true);
              }}
              disabled={isOutOfStock}
              className="flex-[2] bg-primary text-white font-black py-3.5 rounded-2xl text-sm flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none"
            >
              <ShoppingCart size={15} />
              {isOutOfStock ? "Stok Habis" : "Beli Sekarang"}
            </button>
          </div>
        </div>
      </div>
    </div>

    {/* -- FULL WIDTH DI BAWAH: deskripsi, keamanan, ulasan, produk lainnya -- */}
    <div className="lg:px-8">
      <div className="h-2 bg-muted lg:hidden" />

      {/* -- DESKRIPSI -- */}
      <div className="px-4 lg:px-0 py-4 lg:pt-8 lg:max-w-3xl">
        <h3 className="text-foreground font-bold text-sm mb-2">Deskripsi Produk</h3>
        <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
      </div>

      <div className="h-2 bg-muted lg:hidden" />

      {/* -- KEAMANAN TRANSAKSI -- */}
      <div className="px-4 lg:px-0 py-4 lg:max-w-3xl">
        <h3 className="text-foreground font-bold text-sm mb-3">Keamanan Transaksi</h3>
        <div className="space-y-2.5">
          {[
            { icon: Shield, label: "Pembayaran dijamin aman", sub: "Uang ditahan hingga barang diterima", color: "#10B981" },
            { icon: RefreshCw, label: "Proteksi pembeli", sub: "Kembalikan barang jika tidak sesuai", color: "#3B82F6" },
            { icon: BadgeCheck, label: "Penjual terverifikasi", sub: "NIM dan identitas sudah dicek UMM", color: "#8B5CF6" },
          ].map(({ icon: Icon, label, sub, color }) => (
            <div key={label} className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: color + "18" }}>
                <Icon size={16} style={{ color }} />
              </div>
              <div>
                <p className="text-foreground font-semibold text-xs">{label}</p>
                <p className="text-muted-foreground text-[10px]">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* -- ULASAN PRODUK -- */}
      <div className="px-4 lg:px-0 py-4 bg-background lg:max-w-3xl">
        <h3 className="text-foreground font-bold text-sm mb-3 flex items-center gap-2">
          Ulasan
          <span className="text-muted-foreground text-xs font-normal">({reviews.length})</span>
        </h3>

        {reviews.length === 0 ? (
          <p className="text-muted-foreground text-xs">Belum ada ulasan untuk produk ini.</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((rev) => (
              <div key={rev.id} className="border-b border-border pb-3 last:border-0 last:pb-0">
                <div className="flex items-center gap-2 mb-1">
                  <img
                    src={rev.reviewer?.avatar_url || "/default-avatar.png"}
                    alt="avatar"
                    className="w-6 h-6 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <p className="text-foreground font-bold text-xs">{rev.reviewer?.full_name || "Pengguna"}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      {[1,2,3,4,5].map((s) => (
                        <Star
                          key={s}
                          size={9}
                          className={s <= rev.rating ? "text-accent fill-accent" : "text-muted"}
                        />
                      ))}
                    </div>
                  </div>
                  <span className="text-muted-foreground text-[10px]">
                    {new Date(rev.created_at).toLocaleDateString('id-ID')}
                  </span>
                </div>
                <p className="text-muted-foreground text-xs leading-relaxed mt-1">
                  {rev.comment}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* -- PRODUK LAINNYA -- */}
      <div className="px-4 lg:px-0 py-4 pb-36 lg:pb-12">
        <h3 className="text-foreground font-bold text-sm mb-3">Produk Lainnya</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {related.map((p) => (
            <button
              key={p.id}
              onClick={() => navigate(/product/)}
              className="bg-card rounded-2xl border border-border overflow-hidden text-left shadow-sm active:scale-95 transition-transform"
            >
              <div className="relative">
                <img src={p.image} alt={p.name} className="w-full h-28 object-cover bg-muted" />
                {p.stock === 0 && (
                  <div className="absolute inset-0 bg-background/60 flex items-center justify-center z-10 backdrop-blur-[1px]">
                    <span className="bg-primary text-white text-[10px] font-black px-2.5 py-1 rounded-md shadow-sm">
                      Stok Habis
                    </span>
                  </div>
                )}
              </div>
              <div className="p-2.5">
                <p className="text-foreground font-semibold text-xs truncate">{p.name}</p>
                <p className="text-primary font-black text-sm mt-0.5">{formatPrice(p.price)}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <Star size={9} className="text-accent fill-accent" />
                  <span className="text-[10px] text-muted-foreground">{p.rating}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
''' + '\n'

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content[:start_idx] + new_block + content[end_idx:])
