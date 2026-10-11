import {
  getSubmissionContextService,
  submitTeudaService,
} from '../services/teudaSubmissionService.js';

export const getSubmissionContextController = async (req, res) => {
  const context = await getSubmissionContextService(req.params.restaurantId);
  res.status(200).json(context);
};

export const submitTeudaController = async (req, res) => {
  const teuda = await submitTeudaService({
    restaurantId: req.params.restaurantId,
    teudaData: req.body.teuda,
    file: req.file,
    user: req.user,
  });

  res.status(201).json({ teuda });
};
