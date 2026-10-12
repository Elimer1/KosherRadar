import { getMyProfileService } from '../services/userService.js';
import { getMySubmissionsService } from '../services/userSubmissionsService.js';

export const getMyProfileController = async (req, res) => {
  const profile = getMyProfileService(req.user);
  res.status(200).json({ user: profile });
};

export const getMySubmissionsController = async (req, res) => {
  const submissions = await getMySubmissionsService(req.user._id);
  res.status(200).json(submissions);
};
