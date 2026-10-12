import { submitReportService } from '../services/reportSubmissionService.js';

export const submitReportController = async (req, res) => {
  const report = await submitReportService({ reportData: req.body, file: req.file, user: req.user });
  res.status(201).json({ report });
};
