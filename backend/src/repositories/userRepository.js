import { User } from '../models/User.js';

export const findUserByIdRepo = async (userId) => {
  return User.findById(userId);
};

export const findUserByEmailRepo = async (email) => {
  return User.findOne({ email });
};

export const findUserByEmailWithPasswordRepo = async (email) => {
  return User.findOne({ email }).select('+passwordHash');
};

export const createUserRepo = async (userData) => {
  return User.create(userData);
};

export const setUserRoleRepo = async (userId, role) => {
  return User.findByIdAndUpdate(userId, { role }, { new: true });
};

// NEW (Milestone 3): add points once per key. One atomic update, so two admins clicking at the same
// moment, or a retry, cannot add the points twice. Returns null when the key was already used.
// חדש (אבן דרך 3): הוספת ניקוד פעם אחת לכל מפתח, בעדכון אטומי אחד. מחזיר null אם המפתח כבר נוצל.
export const awardPointsOnceRepo = async (userId, key, points) => {
  return User.findOneAndUpdate(
    { _id: userId, awardedPointKeys: { $ne: key } },
    { $inc: { points }, $push: { awardedPointKeys: key } },
    { new: true }
  );
};

// NEW (Milestone 3): saves a new password hash after a successful password reset.
// חדש (אבן דרך 3): שומר hash חדש של סיסמה אחרי איפוס סיסמה מוצלח.
export const setUserPasswordHashRepo = async (userId, passwordHash) => {
  return User.findByIdAndUpdate(userId, { passwordHash }, { new: true });
};
