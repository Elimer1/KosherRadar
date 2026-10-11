import mongoose from 'mongoose';
import {
  CATEGORIES,
  FOOD_TYPES,
  HECHSHER_VALUES,
  KASHRUT_LEVELS,
  SUBMISSION_STATUSES,
} from '../config/constants.js';
import { normalizePhone, normalizeText } from '../utils/normalizeText.js';

// GeoJSON point. It is a sub-document so it simply does not exist when a restaurant has no
// coordinates; an empty location would break the 2dsphere index.
const pointSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['Point'], required: true },
    coordinates: { type: [Number], required: true },
  },
  { _id: false }
);

const restaurantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 150 },
    nameHe: { type: String, trim: true, maxlength: 150 },
    nameEn: { type: String, trim: true, maxlength: 150 },

    address: { type: String, required: true, trim: true, maxlength: 250 },
    addressHe: { type: String, trim: true, maxlength: 250 },
    addressEn: { type: String, trim: true, maxlength: 250 },
    city: { type: String, trim: true, maxlength: 100 },

    // Optional: coordinates are never invented. A restaurant without them cannot be placed on the map
    // until an admin adds them (or the address is geocoded in a later milestone).
    latitude: { type: Number, min: -90, max: 90 },
    longitude: { type: Number, min: -180, max: 180 },
    location: { type: pointSchema },

    geoapifyPlaceId: { type: String, trim: true },
    phone: { type: String, trim: true, maxlength: 30 },
    website: { type: String, trim: true, maxlength: 300 },

    foodType: { type: String, enum: FOOD_TYPES, required: true },
    categories: { type: [{ type: String, enum: CATEGORIES }], default: [] },
    foodKeywords: { type: [String], default: [] },

    claimedHechsher: { type: String, enum: HECHSHER_VALUES },
    claimedHechsherOther: { type: String, trim: true, maxlength: 100 },
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

    // Filled by the duplicate check. Only admins see it; it never blocks a submission.
    possibleDuplicates: [
      {
        _id: false,
        restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant' },
        reasons: [String],
      },
    ],

    // Lookup copies used by the duplicate check. Always derived from name, address and phone.
    nameNormalized: { type: String, index: true },
    addressNormalized: { type: String },
    phoneNormalized: { type: String },
  },
  { timestamps: true }
);

restaurantSchema.pre('validate', function syncDerivedFields() {
  const hasCoordinates = typeof this.latitude === 'number' && typeof this.longitude === 'number';

  // GeoJSON order is [longitude, latitude].
  this.location = hasCoordinates
    ? { type: 'Point', coordinates: [this.longitude, this.latitude] }
    : undefined;

  this.nameNormalized = normalizeText(this.name);
  this.addressNormalized = normalizeText(this.address);
  this.phoneNormalized = normalizePhone(this.phone) || undefined;
});

restaurantSchema.index({ location: '2dsphere' });
restaurantSchema.index({ status: 1, name: 1 });
restaurantSchema.index({ status: 1, city: 1 });
restaurantSchema.index({ status: 1, foodType: 1 });
restaurantSchema.index({ geoapifyPlaceId: 1 }, { sparse: true });
restaurantSchema.index({ phoneNormalized: 1 }, { sparse: true });
restaurantSchema.index({ addressNormalized: 1 });
restaurantSchema.index({ submittedBy: 1 });

export const Restaurant = mongoose.model('Restaurant', restaurantSchema);
