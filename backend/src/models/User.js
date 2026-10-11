import mongoose from 'mongoose';
import { ROLES } from '../config/constants.js';

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
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
    points: {
      type: Number,
      default: 0,
      min: 0,
      validate: {
        validator: Number.isInteger,
        message: 'points must be an integer',
      },
    },
    // NEW (Milestone 3): keys of point awards already given, e.g. "TEUDA:<id>". Makes awards idempotent.
    // חדש (אבן דרך 3): מפתחות של ניקוד שכבר ניתן (למשל "TEUDA:<id>"), כדי שאישור חוזר לא ייתן ניקוד פעמיים.
    awardedPointKeys: {
      type: [String],
      default: [],
      select: false,
    },
  },
  { timestamps: true }
);

export const User = mongoose.model('User', userSchema);
