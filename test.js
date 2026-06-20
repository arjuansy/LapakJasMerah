import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://crayipmxscggolpqafvl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNyYXlpcG14c2NnZ29scHFhZnZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE4MDk3NzMsImV4cCI6MjA5NzM4NTc3M30.WOOnF6YUZ1J0r2kSf9AKkPl65SMzlxQVQR1zFckyXXk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase.from('products').select('*, seller:profiles!products_seller_id_fkey(full_name, username), categories(name)');
  console.log('Error with specific relation:', error);
  console.log('Data count:', data ? data.length : 0);
  if (data) {
    console.log(data[0]);
  }
}

test();
