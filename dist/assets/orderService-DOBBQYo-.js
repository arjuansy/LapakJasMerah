import{s as o}from"./main-cXwhjZTO.js";const c={async updateOrderStatus(t,e){try{const{data:r,error:s}=await o.from("orders").update({status:e,updated_at:new Date().toISOString()}).eq("id",t).select().single();s&&console.warn("Orders update failed (likely dummy ID):",s.message)}catch{}try{await o.from("shipments").update({status:e,updated_at:new Date().toISOString()}).eq("order_id",t)}catch{}return{status:"success"}},async confirmReceiptAndReduceStock(t){const{data:e,error:r}=await o.rpc("confirm_order_and_reduce_stock",{p_order_id:t});if(r)throw console.error("RPC confirm_order_and_reduce_stock gagal:",r),new Error(r.message||"Gagal mengonfirmasi pesanan");if(!e||e.success!==!0)throw new Error((e==null?void 0:e.message)||"Konfirmasi pesanan gagal");return e},async submitReview(t){const{data:e,error:r}=await o.from("reviews").insert([t]).select().single();if(r)throw r;return e},async getStoreReviews(t){const{data:e,error:r}=await o.from("reviews").select(`
        id,
        rating,
        comment,
        created_at,
        product_id,
        reviewer:profiles!reviewer_id(full_name, username, avatar_url)
      `).eq("seller_id",t).order("created_at",{ascending:!1});if(r)throw r;if(!e||e.length===0)return[];const s=[...new Set(e.map(i=>i.product_id).filter(Boolean))];if(s.length>0){const{data:i}=await o.from("products").select("id, name").in("id",s),n=new Map(i==null?void 0:i.map(a=>[a.id,a.name]));e.forEach(a=>{a.product_id&&(a.product={name:n.get(a.product_id)||"Produk"})})}return e}};export{c as orderService};
