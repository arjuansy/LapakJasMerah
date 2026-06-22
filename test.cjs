require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function test() {
  const { data, error } = await supabase.from('orders').select('id, order_items(quantity)').limit(1);
  console.log("Data:", data);
  console.log("Error:", error);
}
test();
