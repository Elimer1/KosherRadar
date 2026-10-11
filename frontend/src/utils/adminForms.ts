// NEW (Milestone 3): fills the edit forms from what the server sent (the reverse of the payload builders).
// חדש (אבן דרך 3): ממלא את טפסי העריכה ממה שהשרת שלח (ההפך מבוני המטען ששולחים).
import type { AdminRestaurant, AdminTeuda, RestaurantExtrasValues } from '../types/admin';
import type { RestaurantFormValues, TeudaFormValues } from '../types/submissions';

export const restaurantToFormValues = (restaurant: AdminRestaurant): RestaurantFormValues => {
  return {
    name: restaurant.name,
    address: restaurant.address,
    city: restaurant.city || '',
    latitude: restaurant.latitude === null ? '' : String(restaurant.latitude),
    longitude: restaurant.longitude === null ? '' : String(restaurant.longitude),
    phone: restaurant.phone || '',
    website: restaurant.website || '',
    foodType: restaurant.foodType,
    categories: restaurant.categories,
    foodKeywords: restaurant.foodKeywords.join(', '),
    claimedHechsher: restaurant.claimedHechsher || '',
    claimedHechsherOther: restaurant.claimedHechsherOther || '',
    claimedKashrutLevel: restaurant.claimedKashrutLevel || '',
  };
};

export const restaurantToExtrasValues = (restaurant: AdminRestaurant): RestaurantExtrasValues => {
  return {
    nameHe: restaurant.nameHe || '',
    nameEn: restaurant.nameEn || '',
    addressHe: restaurant.addressHe || '',
    addressEn: restaurant.addressEn || '',
    adminNote: restaurant.adminNote || '',
    kosharotUrl: restaurant.kosharotUrl || '',
  };
};

export const teudaToFormValues = (teuda: AdminTeuda): TeudaFormValues => {
  return {
    hechsher: teuda.hechsher,
    hechsherOther: teuda.hechsherOther || '',
    kashrutLevel: teuda.kashrutLevel,
    expirationDate: teuda.expirationDate,
    mashgiachName: teuda.mashgiachName,
    mashgiachPhone: teuda.mashgiachPhone,
  };
};
