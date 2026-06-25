import { createClient } from '@supabase/supabase-js';
const supabaseUrl = 'https://crayipmxscggolpqafvl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNyYXlpcG14c2NnZ29scHFhZnZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE4MDk3NzMsImV4cCI6MjA5NzM4NTc3M30.WOOnF6YUZ1J0r2kSf9AKkPl65SMzlxQVQR1zFckyXXk';
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data, error } = await supabase.from('reports').select('*').limit(1);
  console.log("Data:", data, "Error:", error);
}

check();
