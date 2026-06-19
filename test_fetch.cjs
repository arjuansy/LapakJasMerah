// use native fetch

const supabaseUrl = 'https://crayipmxscggolpqafvl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNyYXlpcG14c2NnZ29scHFhZnZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE4MDk3NzMsImV4cCI6MjA5NzM4NTc3M30.WOOnF6YUZ1J0r2kSf9AKkPl65SMzlxQVQR1zFckyXXk';

async function testFetch() {
  const response = await fetch(`${supabaseUrl}/auth/v1/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`
    },
    body: JSON.stringify({
      email: 'test4@webmail.umm.ac.id',
      password: 'hangatkantubuh',
      data: {
        full_name: 'Testing',
        nim: '123'
      }
    })
  });
  
  const text = await response.text();
  console.log("STATUS:", response.status);
  console.log("BODY:", text);
}

testFetch();
