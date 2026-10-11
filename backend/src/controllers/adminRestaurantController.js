// NEW (Milestone 3): HTTP handlers for admin restaurant moderation. They only read the request, call a service and answer.
// חדש (אבן דרך 3): מטפלי HTTP לניהול מסעדות. רק קוראים את הבקשה, קוראים לשירות ועונים.
import {
  approveRestaurantService,
  createRestaurantByAdminService,
  deleteRestaurantService,
  getRestaurantForAdminService,
  listPendingRestaurantsService,
  rejectRestaurantService,
  searchRestaurantsForAdminService,
  updateRestaurantByAdminService,
} from '../services/adminRestaurantService.js';

export const listPendingRestaurantsController = async (req, res) => {
  res.status(200).json(await listPendingRestaurantsService(req.validatedQuery));
};

export const searchRestaurantsController = async (req, res) => {
  res.status(200).json(await searchRestaurantsForAdminService(req.validatedQuery));
};

export const getRestaurantController = async (req, res) => {
  res.status(200).json(await getRestaurantForAdminService(req.params.restaurantId));
};

export const createRestaurantController = async (req, res) => {
  const result = await createRestaurantByAdminService({
    restaurantData: req.body.restaurant,
    extras: req.body.extras,
    teudaData: req.body.teuda,
    file: req.file,
    admin: req.user,
  });

  res.status(201).json(result);
};

export const updateRestaurantController = async (req, res) => {
  const restaurant = await updateRestaurantByAdminService({
    restaurantId: req.params.restaurantId,
    restaurantData: req.body.restaurant,
    extras: req.body.extras,
  });

  res.status(200).json({ restaurant });
};

export const approveRestaurantController = async (req, res) => {
  res.status(200).json(await approveRestaurantService({ restaurantId: req.params.restaurantId }));
};

export const rejectRestaurantController = async (req, res) => {
  const result = await rejectRestaurantService({
    restaurantId: req.params.restaurantId,
    reason: req.body.reason,
  });

  res.status(200).json(result);
};

export const deleteRestaurantController = async (req, res) => {
  res.status(200).json(await deleteRestaurantService({ restaurantId: req.params.restaurantId }));
};
