import json

with open(r'C:\Users\IQBAL\.gemini\antigravity-ide\brain\b113a112-b830-4267-ab78-39c93ee154a0\.system_generated\logs\transcript.jsonl', 'r', encoding='utf-8') as f:
    for line in f:
        data = json.loads(line)
        if data.get('type') == 'VIEW_FILE' or data.get('type') == 'TOOL_RESPONSE':
            # print it out
            content = data.get('content', '')
            if 'ProductDetailPage.tsx' in content and 'export default function ProductDetailPage()' in content:
                print("FOUND A BACKUP!")
                with open('backup_product.txt', 'w', encoding='utf-8') as out:
                    out.write(content)
                break
