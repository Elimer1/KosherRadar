import { ZodError } from 'zod';
import { env } from '../config/env.js';

export const notFoundMiddleware = (req, res) => {
  res.status(404).json({ message: 'Route not found' });
};

export const errorMiddleware = (error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  if (error instanceof ZodError) {
    return res.status(400).json({
      message: 'Validation failed',
      code: 'VALIDATION_ERROR',
      errors: error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      })),
    });
  }

  if (error.name === 'AppError') {
    const body = { message: error.message };
    if (error.code) body.code = error.code;
    return res.status(error.statusCode).json(body);
  }

  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Invalid JSON body' });
  }

  if (error.type === 'entity.too.large') {
    return res.status(413).json({ message: 'Request body too large' });
  }

  if (error.code === 11000) {
    return res.status(409).json({ message: 'This value is already in use' });
  }

  if (error.name === 'ValidationError' || error.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid data', code: 'VALIDATION_ERROR' });
  }

  if (error.name === 'MongooseServerSelectionError' || error.name === 'MongoNetworkError') {
    console.error('Database unavailable:', error.message);
    return res.status(503).json({ message: 'Database is unavailable. Please try again later.' });
  }

  console.error(error);
  const message =
    env.nodeEnv === 'production' ? 'Something went wrong' : `Server error: ${error.message}`;
  res.status(500).json({ message });
};
