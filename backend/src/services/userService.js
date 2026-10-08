import { toPublicUser } from './authService.js';

// The profile is only ever built for the logged-in user themselves,
// which is why private points may be included here.
export const getMyProfileService = (user) => {
  return {
    ...toPublicUser(user),
    points: user.points,
  };
};
