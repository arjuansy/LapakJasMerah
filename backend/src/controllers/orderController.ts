import { Request, Response } from 'express';
import prisma from '../config/db';

import { snap } from '../config/midtrans';

export const createOrder = async (req: any, res: Response): Promise<void> => {
  const { productId, sellerId, qty, total, payment, location } = req.body;
  const buyerId = req.user.id;
  const buyerEmail = req.user.email;
  const buyerName = req.user.name;

  try {
    const order = await prisma.order.create({
      data: {
        buyer_id: buyerId,
        total_amount: total,
        location: location,
        status: 'PENDING',
        orderItems: {
          create: {
            product_id: productId,
            quantity: qty,
            price_at_purchase: total / qty
          }
        },
        payment: {
          create: {
            method: payment,
            status: 'PENDING'
          }
        }
      },
    });

    // Auto-create chat if it doesn't exist
    let chat = await prisma.chat.findFirst({
      where: { buyer_id: buyerId, seller_id: sellerId, product_id: productId }
    });

    if (!chat) {
      chat = await prisma.chat.create({
        data: { buyer_id: buyerId, seller_id: sellerId, product_id: productId }
      });
    }

    // Auto-send message
    await prisma.message.create({
      data: {
        chat_id: chat.id,
        sender_id: buyerId,
        content: `📦 *PESANAN BARU*\nSaya telah memesan produk ini dengan jumlah ${qty} (Total: Rp ${total}).\nMetode pembayaran: ${payment.toUpperCase()}.\nMohon segera diproses, terima kasih!`
      }
    });

    // If payment is not COD, generate Midtrans token
    let midtransToken = null;
    if (payment !== 'cod') {
      try {
        midtransToken = await snap.createTransactionToken({
          transaction_details: {
            order_id: order.id,
            gross_amount: total
          },
          customer_details: {
            first_name: buyerName,
            email: buyerEmail
          }
        });
      } catch (err) {
        console.error('Midtrans Snap Error:', err);
      }
    }

    res.status(201).json({ ...order, midtransToken });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error });
  }
};

export const payOrder = async (req: any, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const order = await prisma.order.update({
      where: { id },
      data: { status: 'PAID' }
    });

    await prisma.payment.update({
      where: { order_id: id },
      data: { status: 'PAID', paid_at: new Date() }
    });

    res.json({ message: 'Pembayaran berhasil disimulasikan', order });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const midtransWebhook = async (req: Request, res: Response): Promise<void> => {
  try {
    const notification = req.body;
    
    // In production, you should verify the signature using crypto and ServerKey
    
    const orderId = notification.order_id;
    const transactionStatus = notification.transaction_status;
    const fraudStatus = notification.fraud_status;

    if (transactionStatus === 'capture' || transactionStatus === 'settlement') {
      if (fraudStatus !== 'challenge') {
        // Success
        await prisma.order.update({ where: { id: orderId }, data: { status: 'PAID' } });
        await prisma.payment.update({ where: { order_id: orderId }, data: { status: 'PAID', paid_at: new Date() } });
      }
    } else if (transactionStatus === 'cancel' || transactionStatus === 'deny' || transactionStatus === 'expire') {
      // Failed
      await prisma.order.update({ where: { id: orderId }, data: { status: 'CANCELLED' } });
      await prisma.payment.update({ where: { order_id: orderId }, data: { status: 'FAILED' } });
    } else if (transactionStatus === 'pending') {
      // Pending
      await prisma.payment.update({ where: { order_id: orderId }, data: { status: 'PENDING' } });
    }

    res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ message: 'Webhook error' });
  }
};

export const completeOrder = async (req: any, res: Response): Promise<void> => {
  const { id } = req.params;
  const buyerId = req.user.id;

  try {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        orderItems: {
          include: { product: true }
        }
      }
    });

    if (!order || order.buyer_id !== buyerId) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    if (order.status === 'COMPLETED') {
      res.status(400).json({ message: 'Order is already completed' });
      return;
    }

    // Mark order as completed
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status: 'COMPLETED' }
    });

    // Transfer funds to seller
    // The seller is the owner of the products. Assuming 1 seller per order for simplicity.
    const sellerId = order.orderItems[0].product.seller_id;
    const amountToTransfer = order.total_amount;

    await prisma.user.update({
      where: { id: sellerId },
      data: {
        wallet_balance: {
          increment: amountToTransfer
        }
      }
    });

    res.json({ message: 'Pesanan Selesai. Dana telah diteruskan ke penjual.', order: updatedOrder });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getMyOrders = async (req: any, res: Response): Promise<void> => {
  try {
    const orders = await prisma.order.findMany({
      where: {
        OR: [
          { buyer_id: req.user.id },
          // Orders where I am the seller
          {
            orderItems: {
              some: {
                product: {
                  seller_id: req.user.id
                }
              }
            }
          }
        ],
      },
      include: {
        orderItems: {
          include: { product: true }
        },
        buyer: { select: { id: true, name: true, avatar_url: true } },
        payment: true
      },
      orderBy: { created_at: 'desc' }
    });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
