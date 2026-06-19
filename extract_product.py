import re

with open('original_app.txt', 'r', encoding='utf-8') as f:
    content = f.read()

start = content.find('function ProductDetailPage(')
end = content.find('function StorePage(')

component = content[start:end]

# Now we need to merge this with the new API-based fetching logic since we updated it to use API in a previous session.
# We will just write it to a temp file and I can manually merge using my tools.
with open('original_ProductDetailPage.tsx', 'w', encoding='utf-8') as f:
    f.write(component)
