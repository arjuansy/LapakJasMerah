import { Request, Response, NextFunction } from 'express';

// Fallback route not found
export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new Error(`Rute tidak ditemukan - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// Global Error Handler
export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    // Sembunyikan stack trace jika di production
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};
