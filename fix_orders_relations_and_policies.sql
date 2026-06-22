-- 1. HAPUS POLICY LAMA YANG BERGANTUNG PADA KOLOM order_id
DROP POLICY IF EXISTS "Order items hanya bisa dilihat jika bisa melihat pesanan" ON public.order_items;
DROP POLICY IF EXISTS "Pembeli bisa menambah order items" ON public.order_items;

DROP POLICY IF EXISTS "Payments hanya bisa dilihat jika bisa melihat pesanan" ON public.payments;
DROP POLICY IF EXISTS "Pembeli bisa insert payments" ON public.payments;

-- 2. UBAH TIPE DATA order_id MENJADI UUID
ALTER TABLE public.order_items ALTER COLUMN order_id TYPE UUID USING order_id::UUID;
ALTER TABLE public.payments ALTER COLUMN order_id TYPE UUID USING order_id::UUID;

-- 3. TAMBAHKAN FOREIGN KEY AGAR SUPABASE MENGENALI RELASI
ALTER TABLE public.order_items ADD CONSTRAINT fk_order_items_orders FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;
ALTER TABLE public.payments ADD CONSTRAINT fk_payments_orders FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;

-- 4. KEMBALIKAN POLICY PEMBELI UNTUK ORDER ITEMS & PAYMENTS
CREATE POLICY "Order items hanya bisa dilihat jika bisa melihat pesanan" ON public.order_items FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.buyer_id = auth.uid())
);

CREATE POLICY "Pembeli bisa menambah order items" ON public.order_items FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.buyer_id = auth.uid())
);

CREATE POLICY "Payments hanya bisa dilihat jika bisa melihat pesanan" ON public.payments FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.orders WHERE orders.id = payments.order_id AND orders.buyer_id = auth.uid())
);

CREATE POLICY "Pembeli bisa insert payments" ON public.payments FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.orders WHERE orders.id = payments.order_id AND orders.buyer_id = auth.uid())
);

-- 5. TAMBAHKAN POLICY PENJUAL AGAR BISA MELIHAT & MENGUBAH PESANANNYA
DROP POLICY IF EXISTS "Sellers can view their orders" ON public.orders;
CREATE POLICY "Sellers can view their orders" ON public.orders FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.order_items
        JOIN public.products ON order_items.product_id = products.id
        WHERE order_items.order_id = orders.id AND products.seller_id = auth.uid()
    )
);

DROP POLICY IF EXISTS "Sellers can update their orders" ON public.orders;
CREATE POLICY "Sellers can update their orders" ON public.orders FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM public.order_items
        JOIN public.products ON order_items.product_id = products.id
        WHERE order_items.order_id = orders.id AND products.seller_id = auth.uid()
    )
);

DROP POLICY IF EXISTS "Sellers can view their order items" ON public.order_items;
CREATE POLICY "Sellers can view their order items" ON public.order_items FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.products WHERE id = order_items.product_id AND seller_id = auth.uid()
    )
);
