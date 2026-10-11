import { appError } from '../utils/appError.js';

const OBJECT_ID_PATTERN = /^[0-9a-fA-F]{24}$/;

export const isObjectIdString = (value) => {
  return typeof value === 'string' && OBJECT_ID_PATTERN.test(value);
};

export const validateObjectIdParam = (paramName) => (req, res, next) => {
  if (!isObjectIdString(req.params[paramName])) {
    throw appError('Invalid id', 400);
  }

  next();
};
