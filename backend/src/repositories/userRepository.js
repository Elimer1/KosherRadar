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
