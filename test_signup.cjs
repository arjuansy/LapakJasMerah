const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://crayipmxscggolpqafvl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNyYXlpcG14c2NnZ29scHFhZnZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE4MDk3NzMsImV4cCI6MjA5NzM4NTc3M30.WOOnF6YUZ1J0r2kSf9AKkPl65SMzlxQVQR1zFckyXXk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSignup() {
  console.log("Attempting signup...");
  const { data, error } = await supabase.auth.signUp({
    email: 'test2@webmail.umm.ac.id',
    password: 'hangatkantubuh',
    options: {
      data: {
        full_name: 'Akhmad Arjuan Syuhada',
        nim: '202410370110043'
      }
    }
  });

  if (error) {
    console.error("ERROR CAUGHT!");
    console.error("error:", error);
    console.error("error.message:", error.message);
    console.error("JSON stringify:", JSON.stringify(error));
  } else {
    console.log("Signup successful!", data);
  }
}

testSignup();
