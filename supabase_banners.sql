-- Migration script for banners table

-- 1. Create table
CREATE TABLE IF NOT EXISTS public.banners (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  sub text NOT NULL,
  badge text NOT NULL,
  bg text NOT NULL,
  img text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable RLS
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;

-- 3. Create policies
-- Everyone can view active banners
CREATE POLICY "Banners are viewable by everyone" ON public.banners
  FOR SELECT USING (is_active = true);

-- Admins can do everything (assumes simple setup where admin manages via UI but we'll allow all for authenticated users for now or specific roles if defined, we'll use a broad policy for simplicity in this demo environment, ideally restricted to admin roles)
CREATE POLICY "Admins can insert banners" ON public.banners
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins can update banners" ON public.banners
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can delete banners" ON public.banners
  FOR DELETE USING (auth.role() = 'authenticated');

-- Additional policy to let admins see inactive banners
CREATE POLICY "Admins can see all banners" ON public.banners
  FOR SELECT USING (auth.role() = 'authenticated');

-- 4. Insert initial data (from existing data.ts)
INSERT INTO public.banners (title, sub, badge, bg, img) VALUES
('Semester Baru,
Semangat Baru!', 'Temukan buku & alat kuliah terlengkap', 'Promo Semester', 'from-[#c41230] to-[#8b0d22]', 'https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=400&h=200&fit=crop&auto=format'),
('Flash Sale
Elektronik!', 'Laptop, earphone, & gadget murah', 'Diskon 40%', 'from-[#1a1a2e] to-[#16213e]', 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=200&fit=crop&auto=format'),
('Jual Barang
Bekas Kuliah', 'Pasang iklan gratis, cepat laku!', 'Gratis Iklan', 'from-[#f59e0b] to-[#d97706]', 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=200&fit=crop&auto=format');
