import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://crayipmxscggolpqafvl.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNyYXlpcG14c2NnZ29scHFhZnZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE4MDk3NzMsImV4cCI6MjA5NzM4NTc3M30.WOOnF6YUZ1J0r2kSf9AKkPl65SMzlxQVQR1zFckyXXk'
);

async function test() {
  await supabase.auth.signInWithPassword({ email: 'iqbal.admin@webmail.umm.ac.id', password: 'admin' });
  const { data, error } = await supabase.from('chats').select('*');
  console.log("Error:", error?.message);
}
test();
