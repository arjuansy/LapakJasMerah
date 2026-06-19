-- Jalankan query ini di SQL Editor Supabase untuk menambahkan tabel pengiriman dan ulasan

-- 1. Tabel Ulasan (Reviews)
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    reviewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    seller_id TEXT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Mengaktifkan RLS untuk reviews
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Kebijakan: Semua orang dapat membaca ulasan
DROP POLICY IF EXISTS "Ulasan bisa dibaca siapa saja" ON public.reviews;
CREATE POLICY "Ulasan bisa dibaca siapa saja" ON public.reviews FOR SELECT USING (true);

-- Kebijakan: Pengguna hanya dapat membuat ulasan dengan id mereka sendiri
DROP POLICY IF EXISTS "Pengguna dapat menulis ulasan" ON public.reviews;
CREATE POLICY "Pengguna dapat menulis ulasan" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

-- 2. Tabel Pengiriman (Shipments)
CREATE TABLE IF NOT EXISTS public.shipments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id TEXT UNIQUE NOT NULL,
    tracking_number TEXT,
    courier TEXT,
    status TEXT NOT NULL DEFAULT 'PENDING',
    estimated_arrival TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Mengaktifkan RLS untuk shipments
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;

-- Kebijakan: Semua orang dapat melihat status pengiriman pesanan mereka
DROP POLICY IF EXISTS "Pengguna dapat melihat pengiriman terkait" ON public.shipments;
CREATE POLICY "Pengguna dapat melihat pengiriman terkait" ON public.shipments FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.orders o
        WHERE o.id = public.shipments.order_id
        AND (o.buyer_id = auth.uid() OR o.id IN (
            SELECT oi.order_id FROM public.order_items oi 
            JOIN public.products p ON p.id = oi.product_id
            WHERE p.seller_id = auth.uid()
        ))
    )
);

-- Kebijakan: Sistem/Admin (atau penjual) yang dapat membuat update pengiriman
DROP POLICY IF EXISTS "Pengguna dapat memasukkan pengiriman terkait" ON public.shipments;
CREATE POLICY "Pengguna dapat memasukkan pengiriman terkait" ON public.shipments FOR ALL USING (true);
