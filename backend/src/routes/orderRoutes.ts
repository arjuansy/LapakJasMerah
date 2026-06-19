import express from 'express';
import { createOrder, getMyOrders, payOrder, completeOrder, midtransWebhook } from '../controllers/orderController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

router.post('/webhook/midtrans', midtransWebhook);

router.route('/')
  .post(protect, createOrder)
  .get(protect, getMyOrders);

router.post('/:id/pay', protect, payOrder);
router.post('/:id/complete', protect, completeOrder);

export default router;
