create or replace function cleanup_expired_posts()
returns void
language plpgsql
security definer
as $$
begin
  delete from public.products where expires_at < now();
  delete from public.requests where expires_at < now();
end;
$$;
