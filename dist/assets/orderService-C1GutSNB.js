import{s as t}from"./main-YLscPiuy.js";const n={async updateOrderStatus(a,e){try{const{data:r,error:s}=await t.from("orders").update({status:e,updated_at:new Date().toISOString()}).eq("id",a).select().single();s&&console.warn("Orders update failed (likely dummy ID):",s.message)}catch{}try{await t.from("shipments").update({status:e,updated_at:new Date().toISOString()}).eq("order_id",a)}catch{}return{status:"success"}},async confirmReceiptAndReduceStock(a){const{data:e,error:r}=await t.rpc("confirm_order_and_reduce_stock",{p_order_id:a});if(r)throw console.error("RPC confirm_order_and_reduce_stock gagal:",r),new Error(r.message||"Gagal mengonfirmasi pesanan");if(!e||e.success!==!0)throw new Error((e==null?void 0:e.message)||"Konfirmasi pesanan gagal");return e},async submitReview(a){const{data:e,error:r}=await t.from("reviews").insert([a]).select().single();if(r)throw r;return e},async getStoreReviews(a){const{data:e,error:r}=await t.from("reviews").select(`
        id,
        rating,
        comment,
        created_at,
        product:product_id(name),
        reviewer:reviewer_id(full_name, username, avatar_url)
      `).eq("seller_id",a).order("created_at",{ascending:!1});if(r)throw r;return e}};export{n as orderService};
