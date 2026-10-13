import { registerService, loginService, toPublicUser } from '../services/authService.js';
import { requestPasswordResetService, resetPasswordService } from '../services/passwordResetService.js';

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

// NEW (Milestone 3): password reset. The answer to "forgot password" is the same for every email.
// חדש (אבן דרך 3): איפוס סיסמה. התשובה ל"שכחתי סיסמה" זהה לכל מייל.
export const forgotPasswordController = async (req, res) => {
  // Account lookup, token writes and SMTP must not affect response timing or disclose account existence.
  void requestPasswordResetService(req.body).catch(() => {
    console.error('Password reset request could not be processed');
  });
  res.status(200).json({
    message: 'If an account exists for this email, a password reset link will be requested. Please check your inbox and spam folder.',
  });
};

export const resetPasswordController = async (req, res) => {
  await resetPasswordService(req.body);
  res.status(200).json({ message: 'Your password was changed. You can log in now.' });
};
