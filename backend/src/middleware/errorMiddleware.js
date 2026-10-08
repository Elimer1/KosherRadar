import { env } from '../config/env.js';

export const notFoundMiddleware = (req, res) => {
  res.status(404).json({ message: 'Route not found' });
};

// Every error response has the same shape: { message, code?, errors? }.
// Stack traces are only printed to the server console, never sent to the client.
export const errorMiddleware = (error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  if (error.name === 'AppError') {
    const body = { message: error.message };
    if (error.code) body.code = error.code;
    if (error.errors) body.errors = error.errors;
    return res.status(error.statusCode).json(body);
  }

  // Malformed JSON in the request body.
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Invalid JSON body' });
  }

  if (error.type === 'entity.too.large') {
    return res.status(413).json({ message: 'Request body too large' });
  }

  // Unique index violation (for example two signups with the same email at once).
  if (error.code === 11000) {
    return res.status(409).json({ message: 'This value is already in use' });
  }

  if (error.name === 'ValidationError' || error.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid data', code: 'VALIDATION_ERROR' });
  }

  // MongoDB (Atlas) cannot be reached.
  if (error.name === 'MongooseServerSelectionError' || error.name === 'MongoNetworkError') {
    console.error('Database unavailable:', error.message);
    return res.status(503).json({ message: 'Database is unavailable. Please try again later.' });
  }

  console.error(error);
  const message =
    env.nodeEnv === 'production' ? 'Something went wrong' : `Server error: ${error.message}`;
  res.status(500).json({ message });
};
