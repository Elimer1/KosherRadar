import mongoose from 'mongoose';
import { ROLES } from '../config/constants.js';

const userSchema = new mongoose.Schema(
  {
    // Always stored trimmed + lowercase so "A@x.com" and "a@x.com" are the same account.
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    // select: false means queries do NOT return the hash unless asked with .select('+passwordHash').
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: ROLES,
      default: 'USER',
    },
    // Private contribution points. Only the owner may see them.
    points: {
      type: Number,
      default: 0,
      min: 0,
      validate: {
        validator: Number.isInteger,
        message: 'points must be an integer',
      },
    },
  },
  { timestamps: true }
);

export const User = mongoose.model('User', userSchema);
