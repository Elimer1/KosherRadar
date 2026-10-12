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
    // NEW (Audit M4): bumped when the password changes. Missing on an old account means 0, so a deploy
    // does not log everyone out. A token without tv is also treated as 0.
    // חדש (ביקורת M4): עולה כשהסיסמה משתנה. חשבון ישן בלי השדה נחשב 0, כדי שפריסה לא תנתק את כולם.
    // טוקן בלי tv נחשב גם הוא 0.
    tokenVersion: {
      type: Number,
      default: 0,
      min: 0,
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
    // NEW (Audit M4): bumped when the password changes. Missing on an old account means 0.
    // חדש (ביקורת M4): עולה כשהסיסמה משתנה. חשבון ישן בלי השדה נחשב 0.
    tokenVersion: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

export const User = mongoose.model('User', userSchema);
