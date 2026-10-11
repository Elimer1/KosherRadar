import mongoose from 'mongoose';
import {
  CATEGORIES,
  FOOD_TYPES,
  KASHRUT_LEVELS,
  SUBMISSION_STATUSES,
} from '../config/constants.js';

const restaurantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 150 },
    nameHe: { type: String, trim: true, maxlength: 150 },
    nameEn: { type: String, trim: true, maxlength: 150 },

    address: { type: String, required: true, trim: true, maxlength: 250 },
    addressHe: { type: String, trim: true, maxlength: 250 },
    addressEn: { type: String, trim: true, maxlength: 250 },
    city: { type: String, trim: true, maxlength: 100 },

    latitude: { type: Number, required: true, min: -90, max: 90 },
    longitude: { type: Number, required: true, min: -180, max: 180 },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number] },
    },

    geoapifyPlaceId: { type: String, trim: true },
    phone: { type: String, trim: true, maxlength: 30 },
    website: { type: String, trim: true, maxlength: 300 },

    foodType: { type: String, enum: FOOD_TYPES, required: true },
    categories: { type: [{ type: String, enum: CATEGORIES }], default: [] },
    foodKeywords: { type: [String], default: [] },

    claimedHechsher: { type: String, trim: true, maxlength: 100 },
    claimedKashrutLevel: { type: String, enum: KASHRUT_LEVELS },

    status: { type: String, enum: SUBMISSION_STATUSES, default: 'PENDING' },
    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    adminNote: { type: String, trim: true, maxlength: 1000 },
    rejectionReason: {
      type: String,
      trim: true,
      maxlength: 1000,
      required: function requiredWhenRejected() {
        return this.status === 'REJECTED';
      },
    },

    kosharotUrl: { type: String, trim: true, maxlength: 300 },

    possibleDuplicates: [
      {
        restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant' },
        reasons: [String],
      },
    ],
  },
  { timestamps: true }
);

restaurantSchema.pre('validate', function syncLocation() {
  if (this.latitude !== undefined && this.longitude !== undefined) {
    this.location = { type: 'Point', coordinates: [this.longitude, this.latitude] };
  }
});

restaurantSchema.index({ location: '2dsphere' });
restaurantSchema.index({ status: 1, name: 1 });
restaurantSchema.index({ status: 1, city: 1 });
restaurantSchema.index({ status: 1, foodType: 1 });
restaurantSchema.index({ geoapifyPlaceId: 1 }, { sparse: true });
restaurantSchema.index({ submittedBy: 1 });

export const Restaurant = mongoose.model('Restaurant', restaurantSchema);
