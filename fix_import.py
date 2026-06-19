import os

file_path = 'src/app/App.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
for line in lines:
    if 'import { Skeleton }' in line:
        continue
    new_lines.append(line)

new_lines.insert(0, 'import { Skeleton } from "./components/Skeleton";\n')

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)
