import re

filepath = "src/app/pages/ProfilePage.tsx"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# Replace the component top to include userInfo parsing
# Let's find "export default function ProfilePage() {"
profile_start_idx = content.find("export default function ProfilePage() {")
if profile_start_idx != -1:
    inject_code = """
  const userInfoStr = localStorage.getItem("userInfo");
  const userInfo = userInfoStr ? JSON.parse(userInfoStr) : null;
  const isLoggedIn = !!userInfo;
  const displayName = userInfo?.name || "Pengguna Tamu";
  const displayRole = isLoggedIn ? "Mahasiswa UMM" : "Tamu";
  const displayAvatar = userInfo?.avatar_url || "https://api.dicebear.com/7.x/avataaars/svg?seed=guest";
"""
    # Insert right after `const [profileSubPage...`
    # Let's find `const [profileSubPage, setProfileSubPage] = useState<any>(null);`
    insert_pos = content.find("const [profileSubPage, setProfileSubPage] = useState<any>(null);")
    if insert_pos != -1:
        end_of_line = content.find("\n", insert_pos) + 1
        content = content[:end_of_line] + inject_code + content[end_of_line:]

# Now replace the User Info section
user_info_old = """      {/* ── USER INFO ── */}
      <div className="pt-16 pb-4 px-4 text-center">
        <div className="flex items-center justify-center gap-1.5 mb-1">
          <h2 className="text-foreground font-black text-xl">Ahmad Rizky Pratama</h2>
          <BadgeCheck size={18} className="text-blue-500" />
        </div>
        <p className="text-muted-foreground text-sm font-medium">Mahasiswa UMM</p>
      </div>"""

user_info_new = """      {/* ── USER INFO ── */}
      <div className="pt-16 pb-4 px-4 text-center">
        <div className="flex items-center justify-center gap-1.5 mb-1">
          <h2 className="text-foreground font-black text-xl">{displayName}</h2>
          {isLoggedIn && <BadgeCheck size={18} className="text-blue-500" />}
        </div>
        <p className="text-muted-foreground text-sm font-medium">{displayRole}</p>
      </div>"""

if user_info_old in content:
    content = content.replace(user_info_old, user_info_new)

# Also replace the Avatar image src!
avatar_old = """          <div className="relative inline-block">
            <div className="w-24 h-24 rounded-full p-1 bg-background shadow-xl relative z-10 mx-auto">
              <img
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop"
                alt="Profile"
                className="w-full h-full rounded-full object-cover"
              />"""

avatar_new = """          <div className="relative inline-block">
            <div className="w-24 h-24 rounded-full p-1 bg-background shadow-xl relative z-10 mx-auto">
              <img
                src={displayAvatar}
                alt="Profile"
                className="w-full h-full rounded-full object-cover"
              />"""

if avatar_old in content:
    content = content.replace(avatar_old, avatar_new)

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("ProfilePage guest logic injected.")
