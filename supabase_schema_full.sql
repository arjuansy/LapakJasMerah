-- KATEGORI
CREATE TABLE IF NOT EXISTS public.categories (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL
);

-- PRODUK
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    category_id INT NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    price NUMERIC(12, 2) NOT NULL,
    condition TEXT NOT NULL,
    stock INT NOT NULL DEFAULT 1,
    image_url TEXT,
    status TEXT NOT NULL DEFAULT 'AVAILABLE',
    location TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- PESANAN (ORDERS)
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    total_amount NUMERIC(12, 2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING',
    location TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ITEM PESANAN
CREATE TABLE IF NOT EXISTS public.order_items (
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    quantity INT NOT NULL,
    price_at_purchase NUMERIC(12, 2) NOT NULL,
    PRIMARY KEY (order_id, product_id)
);

-- PEMBAYARAN
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID UNIQUE NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    method TEXT NOT NULL,
    status TEXT NOT NULL,
    paid_at TIMESTAMP WITH TIME ZONE
);

-- CHAT
CREATE TABLE IF NOT EXISTS public.chats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE
);

-- PESAN CHAT
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id UUID NOT NULL REFERENCES public.chats(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- WISHLIST
CREATE TABLE IF NOT EXISTS public.wishlists (
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (user_id, product_id)
);

-- REQUESTS (WANTED BOARD)
CREATE TABLE IF NOT EXISTS public.requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    budget NUMERIC(12, 2),
    status TEXT NOT NULL DEFAULT 'OPEN',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ENABLE ROW LEVEL SECURITY
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;

-- POLICIES (ATURAN KEAMANAN)
-- Kategori: Semua orang bisa melihat. Hanya admin yg bisa menambah (biarkan false untuk sekarang)
CREATE POLICY "Kategori bisa dibaca siapa saja" ON public.categories FOR SELECT USING (true);

-- Produk: Semua orang bisa melihat
CREATE POLICY "Produk bisa dibaca siapa saja" ON public.products FOR SELECT USING (true);
CREATE POLICY "Pengguna bisa menambah produknya sendiri" ON public.products FOR INSERT WITH CHECK (auth.uid() = seller_id);
CREATE POLICY "Pengguna bisa mengubah produknya sendiri" ON public.products FOR UPDATE USING (auth.uid() = seller_id);
CREATE POLICY "Pengguna bisa menghapus produknya sendiri" ON public.products FOR DELETE USING (auth.uid() = seller_id);

-- Pesanan: Hanya pembeli dan penjual dari pesanan tersebut yg bisa melihat
CREATE POLICY "Pesanan hanya dilihat pembeli terkait" ON public.orders FOR SELECT USING (auth.uid() = buyer_id);
CREATE POLICY "Pembeli bisa membuat pesanan" ON public.orders FOR INSERT WITH CHECK (auth.uid() = buyer_id);
CREATE POLICY "Pembeli bisa update status pesanan" ON public.orders FOR UPDATE USING (auth.uid() = buyer_id);

-- Order Items
CREATE POLICY "Order items hanya bisa dilihat jika bisa melihat pesanan" ON public.order_items FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.buyer_id = auth.uid())
);
CREATE POLICY "Pembeli bisa menambah order items" ON public.order_items FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.buyer_id = auth.uid())
);

-- Payments
CREATE POLICY "Payments hanya bisa dilihat jika bisa melihat pesanan" ON public.payments FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.orders WHERE orders.id = payments.order_id AND orders.buyer_id = auth.uid())
);
CREATE POLICY "Pembeli bisa insert payments" ON public.payments FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.orders WHERE orders.id = payments.order_id AND orders.buyer_id = auth.uid())
);

-- Chats: Hanya penjual atau pembeli yg bisa melihat chat
CREATE POLICY "Chats bisa dilihat partisipan" ON public.chats FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);
CREATE POLICY "Pembeli bisa membuat chat" ON public.chats FOR INSERT WITH CHECK (auth.uid() = buyer_id);

-- Messages: Hanya penjual atau pembeli yg bisa melihat dan menambah
CREATE POLICY "Messages bisa dilihat partisipan" ON public.messages FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.chats WHERE chats.id = messages.chat_id AND (chats.buyer_id = auth.uid() OR chats.seller_id = auth.uid()))
);
CREATE POLICY "Pengguna di dalam chat bisa membalas" ON public.messages FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.chats WHERE chats.id = messages.chat_id AND (chats.buyer_id = auth.uid() OR chats.seller_id = auth.uid()))
    AND auth.uid() = sender_id
);

-- STORAGE SETUP FOR PRODUCT IMAGES
insert into storage.buckets (id, name, public) values ('products', 'products', true);
create policy "Gambar produk dapat dilihat semua orang" on storage.objects for select using ( bucket_id = 'products' );
create policy "Pengguna teregistrasi dapat mengunggah gambar" on storage.objects for insert with check ( bucket_id = 'products' AND auth.role() = 'authenticated' );

-- INSERT DUMMY CATEGORIES
INSERT INTO public.categories (name, slug) VALUES 
('Elektronik', 'elektronik'),
('Buku', 'buku'),
('Fashion', 'fashion'),
('Kendaraan', 'kendaraan'),
('Jasa', 'jasa'),
('Lainnya', 'lainnya')
ON CONFLICT (slug) DO NOTHING;
