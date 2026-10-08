import { registerService, loginService, toPublicUser } from '../services/authService.js';

export const registerController = async (req, res) => {
  const result = await registerService(req.body);
  res.status(201).json(result);
};

export const loginController = async (req, res) => {
  const result = await loginService(req.body);
  res.status(200).json(result);
};

export const getCurrentUserController = async (req, res) => {
  res.status(200).json({ user: toPublicUser(req.user) });
};
