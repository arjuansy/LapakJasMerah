const fs = require('fs');
const path = require('path');

const files = [
  'index.html',
  'login.html',
  'marketplace.html',
  'profile.html',
  'admin/dashboard.html',
  'admin/listings.html',
  'admin/login.html',
  'admin/payments.html',
  'admin/reports.html',
  'admin/users.html'
];

files.forEach(file => {
  const p = path.join(__dirname, file);
  if (fs.existsSync(p)) {
    let content = fs.readFileSync(p, 'utf8');
    
    // Replace title
    content = content.replace(/<title>.*?<\/title>/g, '<title>Lapak Jas Merah</title>');
    
    // Add favicon if not exists
    if (!content.includes('<link rel="icon"')) {
      content = content.replace('</title>', '</title>\n    <link rel="icon" type="image/png" href="/favicon.png" />');
    }
    
    fs.writeFileSync(p, content, 'utf8');
    console.log(`Updated ${file}`);
  }
});
