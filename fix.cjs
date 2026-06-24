const fs = require('fs');
const content = fs.readFileSync('src/app/pages/ProductDetailPage.tsx', 'utf-8');
const lines = content.split('\n');

const startIndex = lines.findIndex(l => l.includes('rCount = reviewData.length;'));
if (startIndex !== -1) {
  // Remove everything until } else {
  let endIndex = startIndex + 1;
  while (!lines[endIndex].includes('}, [id]);')) {
    endIndex++;
  }
  
  const missing = `        const sum = reviewData.reduce((acc, curr) => acc + curr.rating, 0);
        avgRating = Math.round((sum / reviewData.length) * 10) / 10;
      } else {
        setReviews([]);
      }

      setProduct({
        id: p.id,
        name: p.name,
        price: Number(p.price),
        category: p.category?.name || "Lainnya",
        condition: p.condition || "Baru",
        location: p.location,
        seller: p.seller?.full_name || "Penjual",
        seller_id: p.seller_id,
        sellerAvatar: p.seller?.avatar_url || "/default-avatar.png",
        image: p.image_url ? parseImageUrls(p.image_url)[0] : "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80",
        images_raw: p.image_url,
        rating: avgRating,
        ratingCount: rCount,
        sold: totalSold,
        description: p.description || "",
        stock: p.stock ?? 0,
        status: p.status || "AVAILABLE"
      });
      setLoading(false);
    };
    
    fetchProduct();`;

  lines.splice(startIndex + 1, endIndex - (startIndex + 1), ...missing.split('\n'));
  fs.writeFileSync('src/app/pages/ProductDetailPage.tsx', lines.join('\n'));
  console.log("Fixed!");
}
