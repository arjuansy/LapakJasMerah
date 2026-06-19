-- ==========================================
-- 1. DROP SEMUA TABEL LAMA (RESET BERSIH)
-- ==========================================
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.chats CASCADE;
DROP TABLE IF EXISTS public.payments CASCADE;
DROP TABLE IF EXISTS public.order_items CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.wishlists CASCADE;
DROP TABLE IF EXISTS public.requests CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Drop Trigger Lama
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- ==========================================
-- 2. BUAT ULANG TABEL PROFIL & TRIGGER
-- ==========================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'USER'::text,
  faculty TEXT,
  major TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING ( true );

DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK ( auth.uid() = id );

DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;
CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING ( auth.uid() = id );

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    'USER'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ==========================================
-- 3. BUAT ULANG TABEL MARKETPLACE
-- ==========================================
CREATE TABLE public.categories (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL
);

CREATE TABLE public.products (
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

CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    total_amount NUMERIC(12, 2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING',
    location TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.order_items (
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    quantity INT NOT NULL,
    price_at_purchase NUMERIC(12, 2) NOT NULL,
    PRIMARY KEY (order_id, product_id)
);

CREATE TABLE public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID UNIQUE NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    method TEXT NOT NULL,
    status TEXT NOT NULL,
    paid_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE public.chats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE
);

CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id UUID NOT NULL REFERENCES public.chats(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.wishlists (
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (user_id, product_id)
);

CREATE TABLE public.requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    budget NUMERIC(12, 2),
    status TEXT NOT NULL DEFAULT 'OPEN',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 4. ATURAN KEAMANAN (RLS)
-- ==========================================
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Kategori bisa dibaca siapa saja" ON public.categories;
CREATE POLICY "Kategori bisa dibaca siapa saja" ON public.categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Produk bisa dibaca siapa saja" ON public.products;
CREATE POLICY "Produk bisa dibaca siapa saja" ON public.products FOR SELECT USING (true);

DROP POLICY IF EXISTS "Pengguna bisa menambah produknya sendiri" ON public.products;
CREATE POLICY "Pengguna bisa menambah produknya sendiri" ON public.products FOR INSERT WITH CHECK (auth.uid() = seller_id);

DROP POLICY IF EXISTS "Pengguna bisa mengubah produknya sendiri" ON public.products;
CREATE POLICY "Pengguna bisa mengubah produknya sendiri" ON public.products FOR UPDATE USING (auth.uid() = seller_id);

DROP POLICY IF EXISTS "Pengguna bisa menghapus produknya sendiri" ON public.products;
CREATE POLICY "Pengguna bisa menghapus produknya sendiri" ON public.products FOR DELETE USING (auth.uid() = seller_id);

DROP POLICY IF EXISTS "Pesanan hanya dilihat pembeli terkait" ON public.orders;
CREATE POLICY "Pesanan hanya dilihat pembeli terkait" ON public.orders FOR SELECT USING (auth.uid() = buyer_id);

DROP POLICY IF EXISTS "Pembeli bisa membuat pesanan" ON public.orders;
CREATE POLICY "Pembeli bisa membuat pesanan" ON public.orders FOR INSERT WITH CHECK (auth.uid() = buyer_id);

DROP POLICY IF EXISTS "Pembeli bisa update status pesanan" ON public.orders;
CREATE POLICY "Pembeli bisa update status pesanan" ON public.orders FOR UPDATE USING (auth.uid() = buyer_id);

DROP POLICY IF EXISTS "Order items hanya bisa dilihat jika bisa melihat pesanan" ON public.order_items;
CREATE POLICY "Order items hanya bisa dilihat jika bisa melihat pesanan" ON public.order_items FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.buyer_id = auth.uid())
);

DROP POLICY IF EXISTS "Pembeli bisa menambah order items" ON public.order_items;
CREATE POLICY "Pembeli bisa menambah order items" ON public.order_items FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.buyer_id = auth.uid())
);

DROP POLICY IF EXISTS "Payments hanya bisa dilihat jika bisa melihat pesanan" ON public.payments;
CREATE POLICY "Payments hanya bisa dilihat jika bisa melihat pesanan" ON public.payments FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.orders WHERE orders.id = payments.order_id AND orders.buyer_id = auth.uid())
);

DROP POLICY IF EXISTS "Pembeli bisa insert payments" ON public.payments;
CREATE POLICY "Pembeli bisa insert payments" ON public.payments FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.orders WHERE orders.id = payments.order_id AND orders.buyer_id = auth.uid())
);

DROP POLICY IF EXISTS "Chats bisa dilihat partisipan" ON public.chats;
CREATE POLICY "Chats bisa dilihat partisipan" ON public.chats FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

DROP POLICY IF EXISTS "Pembeli bisa membuat chat" ON public.chats;
CREATE POLICY "Pembeli bisa membuat chat" ON public.chats FOR INSERT WITH CHECK (auth.uid() = buyer_id);

DROP POLICY IF EXISTS "Messages bisa dilihat partisipan" ON public.messages;
CREATE POLICY "Messages bisa dilihat partisipan" ON public.messages FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.chats WHERE chats.id = messages.chat_id AND (chats.buyer_id = auth.uid() OR chats.seller_id = auth.uid()))
);

DROP POLICY IF EXISTS "Pengguna di dalam chat bisa membalas" ON public.messages;
CREATE POLICY "Pengguna di dalam chat bisa membalas" ON public.messages FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.chats WHERE chats.id = messages.chat_id AND (chats.buyer_id = auth.uid() OR chats.seller_id = auth.uid()))
    AND auth.uid() = sender_id
);

-- ==========================================
-- 5. STORAGE & KATEGORI DUMMY
-- ==========================================
INSERT INTO storage.buckets (id, name, public) VALUES ('products', 'products', true) ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Gambar produk dapat dilihat semua orang" ON storage.objects;
CREATE POLICY "Gambar produk dapat dilihat semua orang" ON storage.objects FOR SELECT USING ( bucket_id = 'products' );

DROP POLICY IF EXISTS "Pengguna teregistrasi dapat mengunggah gambar" ON storage.objects;
CREATE POLICY "Pengguna teregistrasi dapat mengunggah gambar" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'products' AND auth.role() = 'authenticated' );

INSERT INTO public.categories (name, slug) VALUES 
('Elektronik', 'elektronik'),
('Buku', 'buku'),
('Fashion', 'fashion'),
('Kendaraan', 'kendaraan'),
('Jasa', 'jasa'),
('Lainnya', 'lainnya')
ON CONFLICT (slug) DO NOTHING;
