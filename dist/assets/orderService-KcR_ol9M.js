import{s as a}from"./index-CyXdVS0V.js";const d={async updateOrderStatus(r,t){try{const{data:e,error:s}=await a.from("orders").update({status:t,updated_at:new Date().toISOString()}).eq("id",r).select().single();s&&console.warn("Orders update failed (likely dummy ID):",s.message)}catch{}try{await a.from("shipments").update({status:t,updated_at:new Date().toISOString()}).eq("order_id",r)}catch{}return{status:"success"}},async submitReview(r){const{data:t,error:e}=await a.from("reviews").insert([r]).select().single();if(e)throw e;return t},async getStoreReviews(r){const{data:t,error:e}=await a.from("reviews").select(`
        id,
        rating,
        comment,
        created_at,
        product:product_id(name),
        reviewer:reviewer_id(full_name, username, avatar_url)
      `).eq("seller_id",r).order("created_at",{ascending:!1});if(e)throw e;return t}};export{d as orderService};
