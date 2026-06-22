-- Policy to allow ANYONE to delete expired products
CREATE POLICY "Enable delete for expired products"
ON public.products
FOR DELETE
TO public
USING (expires_at < now());

-- Policy to allow ANYONE to delete expired requests
CREATE POLICY "Enable delete for expired requests"
ON public.requests
FOR DELETE
TO public
USING (expires_at < now());
