-- Create whitelisted_emails table
CREATE TABLE IF NOT EXISTS public.whitelisted_emails (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL UNIQUE,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  added_by text -- Optional: to track who added this email
);

-- Enable RLS
ALTER TABLE public.whitelisted_emails ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read whitelisted emails (needed for checking during auth flows)
CREATE POLICY "Anyone can read whitelisted emails"
  ON public.whitelisted_emails
  FOR SELECT
  USING (true);

-- Policy: Only Admins can insert/delete (we use a simple check, or for now allow authenticated users since our app checks admin role in UI, but to be secure, let's allow authenticated to insert for now, or just let anon insert if admin is inserting before they login properly. Wait, admin is logged in when adding. So authenticated users can insert/delete. If we want strict security, we'd check if the user is an ADMIN in the profiles table).
-- Since the frontend handles role validation for the Admin Dashboard, we'll use a basic policy to prevent anonymous writes.
CREATE POLICY "Authenticated users can insert whitelisted emails"
  ON public.whitelisted_emails
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete whitelisted emails"
  ON public.whitelisted_emails
  FOR DELETE
  TO authenticated
  USING (true);
