import { getMyProfileService } from '../services/userService.js';

export const getMyProfileController = async (req, res) => {
  const profile = getMyProfileService(req.user);
  res.status(200).json({ user: profile });
};
