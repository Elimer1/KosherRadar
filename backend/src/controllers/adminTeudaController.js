// NEW (Milestone 3): HTTP handlers for admin certificate (teuda) moderation.
// חדש (אבן דרך 3): מטפלי HTTP לניהול תעודות על ידי מנהל.
import {
  approveTeudaService,
  createTeudaByAdminService,
  deleteTeudaService,
  listExpiringSoonService,
  listPendingTeudotService,
  rejectTeudaService,
  updateTeudaByAdminService,
} from '../services/adminTeudaService.js';

export const listPendingTeudotController = async (req, res) => {
  res.status(200).json(await listPendingTeudotService(req.validatedQuery));
};

export const listExpiringSoonController = async (req, res) => {
  res.status(200).json({ items: await listExpiringSoonService() });
};

export const createTeudaController = async (req, res) => {
  const teuda = await createTeudaByAdminService({
    restaurantId: req.params.restaurantId,
    teudaData: req.body.teuda,
    file: req.file,
    admin: req.user,
  });

  res.status(201).json({ teuda });
};

export const updateTeudaController = async (req, res) => {
  const teuda = await updateTeudaByAdminService({ teudaId: req.params.teudaId, teudaData: req.body.teuda });
  res.status(200).json({ teuda });
};

export const approveTeudaController = async (req, res) => {
  res.status(200).json(await approveTeudaService({ teudaId: req.params.teudaId }));
};

export const rejectTeudaController = async (req, res) => {
  res.status(200).json(await rejectTeudaService({ teudaId: req.params.teudaId, reason: req.body.reason }));
};

export const deleteTeudaController = async (req, res) => {
  res.status(200).json(await deleteTeudaService({ teudaId: req.params.teudaId }));
};
