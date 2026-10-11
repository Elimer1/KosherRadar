export const validateBody = (schema) => (req, res, next) => {
  req.body = schema.parse(req.body);
  next();
};
