import os

files = ['src/app/pages/SellPage.tsx', 'src/app/pages/ProductDetailPage.tsx', 'src/app/pages/ProfilePage.tsx', 'src/app/pages/OrderTrackingPage.tsx']
for f in files:
    if not os.path.exists(f): continue
    with open(f, 'r', encoding='utf-8') as file:
        c = file.read()
    if 'react-hot-toast' not in c:
        c = 'import { toast } from "react-hot-toast";\n' + c
    c = c.replace('alert(', 'toast(')
    c = c.replace('toast(`Paket', 'toast.error(`Paket')
    c = c.replace('toast("Gagal', 'toast.error("Gagal')
    c = c.replace('toast("Tautan', 'toast.success("Tautan')
    c = c.replace('toast("Order', 'toast.error("Order')
    c = c.replace('toast("Simulasi', 'toast.error("Simulasi')
    c = c.replace('toast("Anda', 'toast.error("Anda')
    c = c.replace('toast("Pembayaran', 'toast.error("Pembayaran')
    c = c.replace('toast("Terjadi', 'toast.error("Terjadi')
    c = c.replace('toast("support', 'toast.success("support')
    with open(f, 'w', encoding='utf-8') as file:
        file.write(c)
print('Done!')
