export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { orderId, amount, productName, customerName } = req.body;

  if (!orderId || !amount) {
    return res.status(400).json({ error: 'Missing orderId or amount' });
  }

  const serverKey = process.env.MIDTRANS_SERVER_KEY || 'SB-Mid-server-dummy';
  const authString = Buffer.from(serverKey + ':').toString('base64');

  try {
    const response = await fetch('https://app.sandbox.midtrans.com/snap/v1/transactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Basic ${authString}`
      },
      body: JSON.stringify({
        transaction_details: {
          order_id: orderId,
          gross_amount: amount
        },
        item_details: [{
          id: 'item01',
          price: amount,
          quantity: 1,
          name: productName || 'Produk LapakJasMerah'
        }],
        customer_details: {
          first_name: customerName || 'Pembeli'
        }
      })
    });

    const data = await response.json();

    if (data.token) {
      return res.status(200).json({ token: data.token });
    } else {
      console.error('Midtrans Error:', data);
      return res.status(500).json({ error: 'Gagal mendapatkan token Midtrans' });
    }
  } catch (error) {
    console.error('Fetch Error:', error);
    return res.status(500).json({ error: 'Terjadi kesalahan pada server' });
  }
}
