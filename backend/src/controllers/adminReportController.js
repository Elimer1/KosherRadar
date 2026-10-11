// NEW (Milestone 3): HTTP handlers for admin handling of reports.
// חדש (אבן דרך 3): מטפלי HTTP לטיפול מנהל בדיווחים.
import {
  listPendingReportsService,
  rejectReportService,
  resolveReportService,
} from '../services/adminReportService.js';

export const listPendingReportsController = async (req, res) => {
  res.status(200).json(await listPendingReportsService(req.validatedQuery));
};

export const resolveReportController = async (req, res) => {
  const result = await resolveReportService({
    reportId: req.params.reportId,
    resolution: req.body.resolution,
    adminNote: req.body.adminNote,
  });

  res.status(200).json(result);
};

export const rejectReportController = async (req, res) => {
  res.status(200).json(await rejectReportService({ reportId: req.params.reportId, reason: req.body.reason }));
};
