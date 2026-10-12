import { Restaurant } from '../models/Restaurant.js';
import { Teuda } from '../models/Teuda.js';
import { Report } from '../models/Report.js';

const LIMIT = 50;

export const listMyRestaurantsRepo = async (userId) => {
  return Restaurant.find({ submittedBy: userId })
    .select('name status rejectionReason createdAt')
    .sort({ createdAt: -1 })
    .limit(LIMIT)
    .lean();
};

export const listMyTeudotRepo = async (userId) => {
  return Teuda.find({ submittedBy: userId })
    .select('status rejectionReason createdAt restaurant submittedWithNewRestaurant')
    .populate('restaurant', 'name')
    .sort({ createdAt: -1 })
    .limit(LIMIT)
    .lean();
};

export const listMyReportsRepo = async (userId) => {
  return Report.find({ submittedBy: userId })
    .select('description status rejectionReason createdAt restaurant')
    .populate('restaurant', 'name')
    .sort({ createdAt: -1 })
    .limit(LIMIT)
    .lean();
};
