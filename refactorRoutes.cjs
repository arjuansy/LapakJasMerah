const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'src', 'app', 'pages');
const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  const filePath = path.join(pagesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Add useNavigate if missing
  if (!content.includes('useNavigate')) {
    content = content.replace(/from "react";/, 'from "react";\nimport { useNavigate } from "react-router-dom";');
  }
  
  // Ensure useNavigate hook is instantiated at the top of the component
  const componentMatch = content.match(/export default function \w+\([^)]*\)\s*{/);
  if (componentMatch) {
    const compStart = componentMatch[0];
    if (!content.includes('const navigate = useNavigate();')) {
        content = content.replace(compStart, compStart + '\n  const navigate = useNavigate();\n');
    }
  }

  // Replace screen routing
  content = content.replace(/setScreen\("landing"\)/g, 'navigate("/")');
  content = content.replace(/setScreen\('landing'\)/g, 'navigate("/")');
  content = content.replace(/setScreen\("login"\)/g, 'navigate("/login")');
  content = content.replace(/setScreen\('login'\)/g, 'navigate("/login")');
  content = content.replace(/setScreen\("register"\)/g, 'navigate("/register")');
  content = content.replace(/setScreen\('register'\)/g, 'navigate("/register")');
  content = content.replace(/setScreen\("admin"\)/g, 'navigate("/admin")');
  content = content.replace(/setScreen\('admin'\)/g, 'navigate("/admin")');
  content = content.replace(/setScreen\("app"\)/g, 'navigate("/marketplace")');
  content = content.replace(/setScreen\('app'\)/g, 'navigate("/marketplace")');

  // Replace tab routing
  content = content.replace(/setActiveTab\("home"\)/g, 'navigate("/marketplace")');
  content = content.replace(/setActiveTab\('home'\)/g, 'navigate("/marketplace")');
  content = content.replace(/setActiveTab\("categories"\)/g, 'navigate("/categories")');
  content = content.replace(/setActiveTab\('categories'\)/g, 'navigate("/categories")');
  content = content.replace(/setActiveTab\("sell"\)/g, 'navigate("/sell")');
  content = content.replace(/setActiveTab\('sell'\)/g, 'navigate("/sell")');
  content = content.replace(/setActiveTab\("chat"\)/g, 'navigate("/chat")');
  content = content.replace(/setActiveTab\('chat'\)/g, 'navigate("/chat")');
  content = content.replace(/setActiveTab\("profile"\)/g, 'navigate("/profile")');
  content = content.replace(/setActiveTab\('profile'\)/g, 'navigate("/profile")');
  
  // Replace setSelectedProduct
  content = content.replace(/setSelectedProduct\((.*?)\)/g, 'navigate(`/product/${$1.id}`)');
  
  // Replace setViewStoreSeller
  content = content.replace(/setViewStoreSeller\((.*?)\)/g, 'navigate(`/store/${$1}`)');
  
  fs.writeFileSync(filePath, content, 'utf8');
}

// Specifically fix ProfilePage.tsx to use local profileSubPage state
const profilePath = path.join(pagesDir, 'ProfilePage.tsx');
let profileContent = fs.readFileSync(profilePath, 'utf8');
profileContent = profileContent.replace(/const {[\s\S]*?setProfileSubPage[\s\S]*?} = useApp\(\);/g, (match) => {
    return match.replace(/setProfileSubPage,?/g, '').replace(/profileSubPage,?/g, '');
});
if (!profileContent.includes('const [profileSubPage, setProfileSubPage]')) {
    profileContent = profileContent.replace(/const navigate = useNavigate\(\);/, 'const navigate = useNavigate();\n  const [profileSubPage, setProfileSubPage] = useState<any>(null);');
}
fs.writeFileSync(profilePath, profileContent, 'utf8');

console.log('Router refactoring complete.');
