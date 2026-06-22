const fs = require('fs');
const env = fs.readFileSync('.env', 'utf8').split('\n').reduce((acc, line) => {
  const [k, v] = line.split('=');
  if (k && v) acc[k.trim()] = v.trim();
  return acc;
}, {});

// USE SERVICE ROLE KEY TO BYPASS RLS
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data, error } = await supabase.from('chats').select('id, buyer_id, seller_id, request_id').limit(10);
  console.log('Chats data (Service Role):', data);
  console.log('Chats error (Service Role):', error);
}

run();
