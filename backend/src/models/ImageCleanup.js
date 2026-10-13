import mongoose from 'mongoose';

// Durable outbox: these ids are no longer referenced after the owning transaction commits.
const schema = new mongoose.Schema({
  publicId: { type: String, required: true, unique: true },
  attempts: { type: Number, default: 0 },
  lastFailure: { type: String },
}, { timestamps: true });
export const ImageCleanup = mongoose.model('ImageCleanup', schema);
