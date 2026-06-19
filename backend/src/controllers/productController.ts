import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import prisma from '../config/db';

export const getProducts = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const skip = (page - 1) * limit;
  const keyword = req.query.keyword ? String(req.query.keyword) : undefined;

  const where = keyword ? {
    OR: [
      { name: { contains: keyword, mode: 'insensitive' as const } },
      { description: { contains: keyword, mode: 'insensitive' as const } },
    ]
  } : {};

  const products = await prisma.product.findMany({
    where,
    skip,
    take: limit,
    include: {
      seller: {
        select: { id: true, name: true, avatar_url: true },
      },
      category: {
        select: { name: true },
      },
    },
    orderBy: { created_at: 'desc' },
  });

  const total = await prisma.product.count({ where });

  res.json({
    products,
    page,
    pages: Math.ceil(total / limit),
    total
  });
});

export const getProductById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const product = await prisma.product.findUnique({
    where: { id: req.params.id as string },
    include: {
      seller: {
        select: { id: true, name: true, avatar_url: true, university: true },
      },
      category: {
        select: { name: true },
      },
    },
  });

  if (product) {
    res.json(product);
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

export const createProduct = asyncHandler(async (req: any, res: Response): Promise<void> => {
  const { name, description, price, category, location, image, condition, stock } = req.body;

  // Find Category ID based on name passed from Frontend
  const categoryRecord = await prisma.category.findFirst({
    where: { name: { equals: category, mode: 'insensitive' } }
  });

  const product = await prisma.product.create({
    data: {
      name,
      description,
      price,
      category_id: categoryRecord ? categoryRecord.id : 1, // Fallback to 1 if not found
      location,
      image_url: image,
      condition,
      stock: stock ? parseInt(stock) : 1,
      seller_id: req.user.id,
    },
  });

  res.status(201).json(product);
});
