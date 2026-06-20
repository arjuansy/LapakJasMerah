import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://crayipmxscggolpqafvl.supabase.co',
  // You need the anon key or service role key here. I'll just check if type mismatch exists.
  // Actually, I cannot easily test it without the key.
);

console.log("ready");
