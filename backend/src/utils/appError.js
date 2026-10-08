export const appError = (message, statusCode = 500, code = undefined) => {
  const error = new Error(message);
  error.name = 'AppError';
  error.statusCode = statusCode;
  error.code = code;
  return error;
};
