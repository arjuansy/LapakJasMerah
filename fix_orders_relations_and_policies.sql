-- 1. Buat fungsi SECURITY DEFINER untuk mengecek apakah user adalah Penjual dari pesanan
CREATE OR REPLACE FUNCTION public.is_seller_of_order(check_order_id UUID, check_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.order_items
    JOIN public.products ON order_items.product_id = products.id
    WHERE order_items.order_id = check_order_id
      AND products.seller_id = check_user_id
  );
$$;

-- 2. Buat fungsi SECURITY DEFINER untuk mengecek apakah user adalah Pembeli dari pesanan
CREATE OR REPLACE FUNCTION public.is_buyer_of_order(check_order_id UUID, check_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.orders
    WHERE id = check_order_id AND buyer_id = check_user_id
  );
$$;

-- 3. Perbarui Policy tabel ORDERS
DROP POLICY IF EXISTS "Pesanan hanya dilihat pembeli terkait" ON public.orders;
DROP POLICY IF EXISTS "Sellers can view their orders" ON public.orders;
DROP POLICY IF EXISTS "Sellers can update their orders" ON public.orders;
DROP POLICY IF EXISTS "Pembeli bisa update status pesanan" ON public.orders;

-- Pembeli DAN Penjual bisa melihat pesanan
CREATE POLICY "Pesanan viewable by buyer and seller" ON public.orders FOR SELECT USING (
    auth.uid() = buyer_id OR public.is_seller_of_order(id, auth.uid())
);

-- Pembeli dan Penjual bisa melakukan UPDATE pada pesanannya
CREATE POLICY "Pesanan updatable by buyer and seller" ON public.orders FOR UPDATE USING (
    auth.uid() = buyer_id OR public.is_seller_of_order(id, auth.uid())
);


-- 4. Perbarui Policy tabel ORDER_ITEMS
DROP POLICY IF EXISTS "Order items hanya bisa dilihat jika bisa melihat pesanan" ON public.order_items;
DROP POLICY IF EXISTS "Sellers can view their order items" ON public.order_items;
DROP POLICY IF EXISTS "Pembeli bisa menambah order items" ON public.order_items;

CREATE POLICY "Order items viewable by buyer and seller" ON public.order_items FOR SELECT USING (
    public.is_buyer_of_order(order_id, auth.uid()) OR 
    EXISTS (SELECT 1 FROM public.products WHERE id = product_id AND seller_id = auth.uid())
);

CREATE POLICY "Pembeli bisa menambah order items" ON public.order_items FOR INSERT WITH CHECK (
    public.is_buyer_of_order(order_id, auth.uid())
);


-- 5. Perbarui Policy tabel PAYMENTS
DROP POLICY IF EXISTS "Payments hanya bisa dilihat jika bisa melihat pesanan" ON public.payments;
DROP POLICY IF EXISTS "Pembeli bisa insert payments" ON public.payments;

CREATE POLICY "Payments viewable by buyer" ON public.payments FOR SELECT USING (
    public.is_buyer_of_order(order_id, auth.uid())
);

CREATE POLICY "Pembeli bisa insert payments" ON public.payments FOR INSERT WITH CHECK (
    public.is_buyer_of_order(order_id, auth.uid())
);
