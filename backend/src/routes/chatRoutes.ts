import express from 'express';
import { getChats, findOrCreateChat, getChatMessages, sendMessage } from '../controllers/chatController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

router.route('/')
  .get(protect, getChats)
  .post(protect, findOrCreateChat);

router.route('/:id/messages')
  .get(protect, getChatMessages)
  .post(protect, sendMessage);

export default router;
