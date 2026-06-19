import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import prisma from '../config/db';

// @desc    Get all chats for a user
// @route   GET /api/chats
// @access  Private
export const getChats = asyncHandler(async (req: any, res: Response): Promise<void> => {
  const userId = req.user.id;

  const chats = await prisma.chat.findMany({
    where: {
      OR: [
        { buyer_id: userId },
        { seller_id: userId },
      ],
    },
    include: {
      buyer: { select: { id: true, name: true, avatar_url: true } },
      seller: { select: { id: true, name: true, avatar_url: true } },
      product: { select: { id: true, name: true, image_url: true, price: true } },
      messages: {
        orderBy: { sent_at: 'desc' },
        take: 1,
      },
    },
    orderBy: {
      id: 'desc', // Simple fallback, ideally order by latest message
    },
  });

  res.json(chats);
});

// @desc    Find or create a chat session
// @route   POST /api/chats
// @access  Private
export const findOrCreateChat = asyncHandler(async (req: any, res: Response): Promise<void> => {
  const { product_id, seller_id } = req.body;
  const buyer_id = req.user.id;

  if (buyer_id === seller_id) {
    res.status(400);
    throw new Error('Anda tidak bisa chat dengan diri sendiri');
  }

  let chat = await prisma.chat.findFirst({
    where: {
      buyer_id,
      seller_id,
      product_id,
    },
    include: {
      product: { select: { id: true, name: true, image_url: true, price: true } },
      seller: { select: { id: true, name: true, avatar_url: true } },
      buyer: { select: { id: true, name: true, avatar_url: true } },
    }
  });

  if (!chat) {
    chat = await prisma.chat.create({
      data: {
        buyer_id,
        seller_id,
        product_id,
      },
      include: {
        product: { select: { id: true, name: true, image_url: true, price: true } },
        seller: { select: { id: true, name: true, avatar_url: true } },
        buyer: { select: { id: true, name: true, avatar_url: true } },
      }
    });
  }

  res.status(200).json(chat);
});

// @desc    Get messages for a chat
// @route   GET /api/chats/:id/messages
// @access  Private
export const getChatMessages = asyncHandler(async (req: any, res: Response): Promise<void> => {
  const chatId = req.params.id;
  const userId = req.user.id;

  // Verify ownership
  const chat = await prisma.chat.findUnique({
    where: { id: chatId },
    include: {
      product: { select: { id: true, name: true, image_url: true, price: true } },
      seller: { select: { id: true, name: true, avatar_url: true } },
      buyer: { select: { id: true, name: true, avatar_url: true } },
    }
  });

  if (!chat) {
    res.status(404);
    throw new Error('Chat tidak ditemukan');
  }

  if (chat.buyer_id !== userId && chat.seller_id !== userId) {
    res.status(403);
    throw new Error('Tidak memiliki akses ke chat ini');
  }

  const messages = await prisma.message.findMany({
    where: { chat_id: chatId },
    orderBy: { sent_at: 'asc' },
  });

  res.json({ chat, messages });
});

// @desc    Send a new message
// @route   POST /api/chats/:id/messages
// @access  Private
export const sendMessage = asyncHandler(async (req: any, res: Response): Promise<void> => {
  const chatId = req.params.id;
  const userId = req.user.id;
  const { content } = req.body;

  const chat = await prisma.chat.findUnique({ where: { id: chatId } });

  if (!chat || (chat.buyer_id !== userId && chat.seller_id !== userId)) {
    res.status(403);
    throw new Error('Tidak memiliki akses ke chat ini');
  }

  const message = await prisma.message.create({
    data: {
      chat_id: chatId,
      sender_id: userId,
      content,
    },
  });

  res.status(201).json(message);
});
