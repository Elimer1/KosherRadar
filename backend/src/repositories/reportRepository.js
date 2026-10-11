import { Report } from '../models/Report.js';

export const createReportRepo = async (reportData) => {
  return Report.create(reportData);
};

// Guards against the same person sending the same report twice (double click, retry).
export const findSimilarPendingReportRepo = async ({ restaurant, teuda, submittedBy, description }) => {
  return Report.findOne({
    restaurant,
    teuda: teuda || { $exists: false },
    submittedBy,
    description,
    status: 'PENDING',
  });
};
