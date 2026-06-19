import re
import os

filepath = "src/app/pages/ProfilePage.tsx"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# Replace signatures
components = [
    "SalesPage",
    "PurchasePage",
    "EditProfilePage",
    "SecurityPrivacyPage",
    "NotificationSettingsPage",
    "HelpCenterPage",
    "TermsPoliciesPage",
    "AboutPage",
    "EditItemPage"
]

for comp in components:
    content = re.sub(
        r"function " + comp + r"\(\) \{",
        f"function {comp}({{ onBack }}: {{ onBack: () => void }}) {{",
        content
    )
    
    # Replace the render calls in ProfilePage
    content = content.replace(
        f"<{comp} />",
        f"<{comp} onBack={{() => setProfileSubPage(null)}} />"
    )

# Replace the null calls inside onClick
content = content.replace("onClick={() => (null)}", "onClick={onBack}")

# Replace the other (null) calls which were used for navigation
content = content.replace("{ (null); setGlobalTab(\"home\"); }", "{ onBack(); setGlobalTab(\"home\"); }")
content = content.replace("setTimeout(() => { setSaved(false); (null); }, 1500);", "setTimeout(() => { setSaved(false); onBack(); }, 1500);")
content = content.replace("    (null);\n", "    onBack();\n")

# Fix Lihat Statistik button
content = content.replace("onClick={() => setShowSalesStats(true)}", "onClick={() => navigate(\"/sales-stats\")}")

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("ProfilePage.tsx fixed!")
