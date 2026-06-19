# Panduan Konfigurasi Supabase untuk Email OTP

Sistem baru LapakJasMerah menggunakan Supabase Auth (Email OTP). Agar sistem ini berjalan dengan sempurna di Vercel, lakukan konfigurasi berikut di *dashboard* Supabase Anda:

## 1. Aktifkan Fitur Email OTP
Fitur OTP di Supabase secara teknis menggunakan fitur **Magic Link**. 
1. Buka Supabase Dashboard > Project Anda.
2. Ke menu **Authentication** > **Providers** > **Email**.
3. Pastikan pengaturan berikut aktif:
   - **Enable Email provider** -> Nyala (On)
   - **Confirm email** -> Nyala (On) (Wajib untuk mengirimkan kode OTP).
4. Simpan (*Save*).

## 2. Pengaturan URL Konfigurasi (Redirect)
Agar setelah verifikasi *user* dapat diarahkan dengan benar kembali ke aplikasi Anda (Vercel):
1. Ke menu **Authentication** > **URL Configuration**.
2. Pada bagian **Site URL**, masukkan URL produksi Anda (misal: `https://lapak-jas-merah.vercel.app`).
3. Pada bagian **Redirect URLs**, klik *Add URL* dan masukkan *wildcard* atau exact URL:
   - `https://lapak-jas-merah.vercel.app/*`
   - `http://localhost:5173/*` (Untuk pengembangan lokal)
4. Simpan.

## 3. Menyesuaikan Template Email (Email Templates)
Agar OTP yang terkirim bukan sekadar tautan (*link*), Anda harus menyesuaikan *template* di Supabase. Supabase akan secara otomatis mendeteksi penggunaan `.signInWithOtp()` dan menyediakan `{{ .Token }}`.
1. Ke menu **Authentication** > **Email Templates**.
2. Pilih tab **Magic Link**.
3. Ubah isi email agar menyertakan token:
```html
<h2>Kode Verifikasi Lapak Jas Merah</h2>
<p>Silakan masukkan kode OTP berikut untuk masuk:</p>
<h1 style="font-size: 24px; letter-spacing: 4px;">{{ .Token }}</h1>
<p>Kode ini hanya berlaku sementara waktu.</p>
```
4. Simpan.

## 4. Konfigurasi Variabel Lingkungan Vercel
Pastikan Anda masuk ke pengaturan proyek di Vercel, lalu tambahkan *Environment Variables*:
- `VITE_SUPABASE_URL` = URL dari *Project Settings* > *API* Supabase Anda.
- `VITE_SUPABASE_ANON_KEY` = *anon* / *public key* dari *Project Settings* > *API* Supabase Anda.

*(Catatan: Jangan gunakan Secret/Service Role Key di Vercel untuk Frontend).*

Setelah keempat konfigurasi ini selesai, jalankan ulang *deploy* di Vercel. Pendaftaran dan login dengan OTP Email sekarang akan berfungsi penuh tanpa *backend* lokal.
