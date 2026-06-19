const midtransClient = require('midtrans-client');
import dotenv from 'dotenv';

dotenv.config();

// Create Snap API instance
export const snap = new midtransClient.Snap({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY || 'SB-Mid-server-dummy',
  clientKey: process.env.MIDTRANS_CLIENT_KEY || 'SB-Mid-client-dummy'
});

// Create Core API instance (if needed later)
export const coreApi = new midtransClient.CoreApi({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY || 'SB-Mid-server-dummy',
  clientKey: process.env.MIDTRANS_CLIENT_KEY || 'SB-Mid-client-dummy'
});
