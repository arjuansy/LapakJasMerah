-- Mengizinkan pengguna untuk melihat wishlist mereka sendiri
CREATE POLICY "Users can view own wishlists" 
ON public.wishlists
FOR SELECT 
USING (auth.uid() = user_id);

-- Mengizinkan pengguna untuk menambahkan wishlist untuk diri mereka sendiri
CREATE POLICY "Users can insert own wishlists" 
ON public.wishlists
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Mengizinkan pengguna untuk menghapus wishlist mereka sendiri
CREATE POLICY "Users can delete own wishlists" 
ON public.wishlists
FOR DELETE 
USING (auth.uid() = user_id);
