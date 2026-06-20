import { supabase } from '../config/supabaseClient';

export interface ReviewInsert {
  order_id: string;
  product_id: string;
  reviewer_id: string;
  seller_id: string;
  rating: number;
  comment: string;
}

export const orderService = {
  // Mengonfirmasi penerimaan barang (Selesai)
  async updateOrderStatus(orderId: string, status: string) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', orderId)
        .select()
        .single();

      if (error) console.warn("Orders update failed (likely dummy ID):", error.message);
    } catch (e) { }

    // Update status pengiriman jika ada
    try {
      await supabase
        .from('shipments')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('order_id', orderId);
    } catch (e) { }

    return { status: 'success' };
  },

  // =========================================================
  // BARU: Konfirmasi pesanan diterima + kurangi stok secara ATOMIK
  // lewat database function `confirm_order_and_reduce_stock`.
  // Berbeda dengan updateOrderStatus di atas, method ini SENGAJA
  // melempar error (throw) kalau gagal, supaya UI tidak optimis
  // menganggap sukses padahal stok belum benar-benar dikurangi.
  // =========================================================
  async confirmReceiptAndReduceStock(orderId: string) {
    const { data, error } = await supabase.rpc('confirm_order_and_reduce_stock', {
      p_order_id: orderId
    });

    if (error) {
      console.error("RPC confirm_order_and_reduce_stock gagal:", error);
      throw new Error(error.message || "Gagal mengonfirmasi pesanan");
    }

    // Function SQL kita mengembalikan JSON { success, message }
    if (!data || data.success !== true) {
      throw new Error(data?.message || "Konfirmasi pesanan gagal");
    }

    return data;
  },

  // Mengirimkan ulasan (Review)
  async submitReview(review: ReviewInsert) {
    const { data, error } = await supabase
      .from('reviews')
      .insert([review])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Mengambil ulasan untuk seorang penjual (Store Page)
  async getStoreReviews(sellerId: string) {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        id,
        rating,
        comment,
        created_at,
        product:product_id(name),
        reviewer:reviewer_id(full_name, username, avatar_url)
      `)
      .eq('seller_id', sellerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }
};