import express from 'express';
import { getProducts, getProductById, createProduct } from '../controllers/productController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

router.route('/')
  .get(getProducts)
  .post(protect, createProduct);

router.route('/:id')
  .get(getProductById);

export default router;
