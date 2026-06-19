const jwt = require('jsonwebtoken');

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNyYXlpcG14c2NnZ29scHFhZnZsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTgwOTc3MywiZXhwIjoyMDk3Mzg1NzczfQ.qiiNMqgjHWpaYrVIqMxfd6asC72HuZzc7PRf6dLgL7Y";
const secret = "767a54b1-faab-46c8-957e-5ef713da4c11";

try {
  const decoded = jwt.verify(token, secret);
  console.log("SUCCESS! The secret is correct.");
  
  // Generate anon key
  const anonPayload = {
    iss: "supabase",
    ref: "crayipmxscggolpqafvl",
    role: "anon",
    iat: 1781809773,
    exp: 2097385773
  };
  
  const anonKey = jwt.sign(anonPayload, secret);
  console.log("ANON_KEY=" + anonKey);
  
} catch(e) {
  console.log("FAILED to verify:", e.message);
}
