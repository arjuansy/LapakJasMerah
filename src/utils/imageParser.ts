/**
 * Mem-parsing string image_url dari Supabase untuk mendukung multiple images
 * Jika formatnya JSON array ["url1", "url2"], ia akan mengembalikan array tersebut.
 * Jika berupa string URL tunggal, ia akan mengembalikan array dengan 1 item tersebut.
 */
export function parseImageUrls(image_url: string | null | undefined): string[] {
  if (!image_url) return [];
  
  try {
    const parsed = JSON.parse(image_url);
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch (e) {
    // Abaikan jika bukan JSON, berarti ini URL tunggal dari versi lama
  }
  
  // Menangani kasus string CSV (hanya berjaga-jaga)
  if (image_url.includes(",") && !image_url.startsWith("http")) {
    return image_url.split(",").map(url => url.trim());
  }

  return [image_url];
}
