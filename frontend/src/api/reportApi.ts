import { api } from './axiosInstance';
import type { ReportFormValues } from '../types/submissions';

// Empty inputs are left out so the server treats them as "not provided".
export const buildReportPayload = (restaurantId: string, values: ReportFormValues) => {
  const isKashrutUpdate = values.type === 'KASHRUT_UPDATE';

  return {
    restaurantId,
    teudaId: values.teudaId || undefined,
    type: values.type,
    description: values.description,
    proposedHechsher: isKashrutUpdate ? values.proposedHechsher || undefined : undefined,
    proposedHechsherOther: isKashrutUpdate ? values.proposedHechsherOther || undefined : undefined,
    proposedKashrutLevel: isKashrutUpdate ? values.proposedKashrutLevel || undefined : undefined,
  };
};

export const submitReport = async (restaurantId: string, values: ReportFormValues) => {
  const response = await api.post<{ report: { id: string; status: string } }>(
    '/reports',
    buildReportPayload(restaurantId, values)
  );
  return response.data;
};
