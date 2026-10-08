import { toPublicUser } from './authService.js';

export const getMyProfileService = (user) => {
  return {
    ...toPublicUser(user),
    points: user.points,
  };
};
