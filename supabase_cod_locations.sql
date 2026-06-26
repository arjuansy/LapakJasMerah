-- SQL Migration: Add cod_locations to products table
-- Run this in your Supabase SQL Editor

ALTER TABLE products
ADD COLUMN IF NOT EXISTS cod_locations JSONB DEFAULT '[]'::jsonb;

-- opsional: index kalau nanti mau query/filter berdasarkan isi jsonb
CREATE INDEX IF NOT EXISTS idx_products_cod_locations ON products USING GIN (cod_locations);

-- Contoh isi data untuk testing manual (lewat Supabase Table Editor atau SQL)
-- UPDATE products
-- SET cod_locations = '[
--   {
--     "id": "spot-1",
--     "name": "Gedung Kuliah Bersama I (GKB I)",
--     "description": "Lobi utama dekat pos satpam, mudah ditemukan.",
--     "lat": -7.9215,
--     "lng": 112.5975,
--     "tag": "Area CCTV & Satpam"
--   },
--   {
--     "id": "spot-2",
--     "name": "Kantin Dekat Fakultas Teknik",
--     "description": "Meja paling pojok, jam istirahat siang.",
--     "lat": -7.9221,
--     "lng": 112.5979,
--     "tag": "Ramai"
--   }
-- ]'::jsonb
-- WHERE id = 1; -- ganti dengan id produk yang mau dites
