import { createClient } from '@supabase/supabase-js';

// Pastikan Anda memindahkan nilai ini ke dalam file .env (VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY)
// Untuk sementara kita pakai url secara eksplisit untuk pengembangan
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://crayipmxscggolpqafvl.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNyYXlpcG14c2NnZ29scHFhZnZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE4MDk3NzMsImV4cCI6MjA5NzM4NTc3M30.WOOnF6YUZ1J0r2kSf9AKkPl65SMzlxQVQR1zFckyXXk'; 
// NOTE: Please setup env vars properly for anon key, I will use a dummy/invalid token for now 
// since I only have the Service Role Key from the user. 
// Wait, I cannot use Service Role Key in Frontend! I will need the ANON Key!

export const supabase = createClient(supabaseUrl, supabaseKey);
