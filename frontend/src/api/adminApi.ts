// NEW (Milestone 3): API functions for the admin dashboard. Every request goes through the shared Axios
// instance, which adds the login token. The server checks the ADMIN role on every one of these calls.
// חדש (אבן דרך 3): פונקציות API ללוח הניהול. השרת בודק תפקיד ADMIN בכל אחת מהקריאות.
import { api } from './axiosInstance';
import { buildRestaurantPayload } from './restaurantApi';
import type {
  AdminReport,
  AdminRestaurant,
  AdminRestaurantDetails,
  AdminTeuda,
  ConflictBrief,
  EmailStatus,
  ExpiringTeuda,
  PageResult,
  PendingTeuda,
  PointsResult,
  ReportResolution,
  RestaurantExtrasValues,
} from '../types/admin';
import type { RestaurantFormValues, TeudaFormValues } from '../types/submissions';

// Empty text means "clear this value" on the server, so empty strings are sent as they are.
// טקסט ריק משמעותו "נקה את הערך" בשרת, ולכן מחרוזות ריקות נשלחות כמו שהן.
export const buildExtrasPayload = (extras: RestaurantExtrasValues) => {
  return {
    nameHe: extras.nameHe,
    nameEn: extras.nameEn,
    addressHe: extras.addressHe,
    addressEn: extras.addressEn,
    adminNote: extras.adminNote,
    kosharotUrl: extras.kosharotUrl,
  };
};

// The admin certificate form has one more field than the user form: a private note.
// NEW (ADMINCERT-001): omit blank custom names just like the public certificate builder.
// חדש (ADMINCERT-001): שם הכשר מותאם ריק לא נשלח, כמו בטופס הציבורי.
export const buildAdminTeudaPayload = (values: TeudaFormValues, adminNote: string) => {
  return { ...values, hechsherOther: values.hechsherOther.trim() || undefined, adminNote };
};

// ---------- Lists ----------

export const getPendingRestaurants = async (page: number) => {
  const response = await api.get<PageResult<AdminRestaurant>>('/admin/restaurants/pending', { params: { page } });
  return response.data;
};

export const getPendingTeudot = async (page: number) => {
  const response = await api.get<PageResult<PendingTeuda>>('/admin/teudot/pending', { params: { page } });
  return response.data;
};

export const getPendingReports = async (page: number) => {
  const response = await api.get<PageResult<AdminReport>>('/admin/reports/pending', { params: { page } });
  return response.data;
};

export const getExpiringSoon = async () => {
  const response = await api.get<{ items: ExpiringTeuda[] }>('/admin/teudot/expiring-soon');
  return response.data.items;
};

export const searchRestaurants = async (search: string, status: string, page: number) => {
  const response = await api.get<PageResult<AdminRestaurant>>('/admin/restaurants', {
    params: { search: search || undefined, status: status || undefined, page },
  });
  return response.data;
};

export const getRestaurantDetails = async (restaurantId: string, signal?: AbortSignal) => {
  const response = await api.get<AdminRestaurantDetails>(`/admin/restaurants/${restaurantId}`, { signal });
  return response.data;
};

// ---------- Restaurants ----------

export const approveRestaurant = async (restaurantId: string) => {
  const response = await api.post<{ restaurant: AdminRestaurant; alreadyApproved: boolean }>(
    `/admin/restaurants/${restaurantId}/approve`
  );
  return response.data;
};

export const rejectRestaurant = async (restaurantId: string, reason: string) => {
  const response = await api.post<{ restaurant: AdminRestaurant; emailStatus: EmailStatus }>(
    `/admin/restaurants/${restaurantId}/reject`,
    { reason }
  );
  return response.data;
};

export const updateRestaurant = async (
  restaurantId: string,
  values: RestaurantFormValues,
  extras: RestaurantExtrasValues
) => {
  const response = await api.put<{ restaurant: AdminRestaurant & { locationStatus?: string } }>(`/admin/restaurants/${restaurantId}`, {
    restaurant: buildRestaurantPayload(values),
    extras: buildExtrasPayload(extras),
  });
  return response.data.restaurant;
};

export const deleteRestaurant = async (restaurantId: string) => {
  const response = await api.delete<{ deleted: boolean; deletedCertificates: number }>(
    `/admin/restaurants/${restaurantId}`
  );
  return response.data;
};

// Creates an approved restaurant, optionally with an approved certificate (photo + details in one form).
export const createRestaurantAsAdmin = async (
  values: RestaurantFormValues,
  extras: RestaurantExtrasValues,
  teuda: TeudaFormValues | null,
  teudaNote: string,
  photo: File | null,
  onProgress?: (percent: number) => void
) => {
  const formData = new FormData();
  formData.append('restaurant', JSON.stringify(buildRestaurantPayload(values)));
  formData.append('extras', JSON.stringify(buildExtrasPayload(extras)));

  if (teuda && photo) {
    formData.append('teuda', JSON.stringify(buildAdminTeudaPayload(teuda, teudaNote)));
    formData.append('photo', photo);
  }

  const response = await api.post<{
    restaurant: AdminRestaurant;
    teuda: AdminTeuda | null;
    possibleDuplicateCount: number;
  }>('/admin/restaurants', formData, {
    onUploadProgress: (event) => {
      if (onProgress && event.total) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    },
  });
  return response.data;
};

// ---------- Certificates ----------

export const approveTeuda = async (teudaId: string) => {
  const response = await api.post<{
    teuda: AdminTeuda;
    alreadyApproved: boolean;
    conflictWarning: ConflictBrief[];
    points: PointsResult;
  }>(`/admin/teudot/${teudaId}/approve`);
  return response.data;
};

export const rejectTeuda = async (teudaId: string, reason: string) => {
  const response = await api.post<{ teuda: AdminTeuda; emailStatus: EmailStatus }>(
    `/admin/teudot/${teudaId}/reject`,
    { reason }
  );
  return response.data;
};

export const updateTeuda = async (teudaId: string, values: TeudaFormValues, adminNote: string) => {
  const response = await api.put<{ teuda: AdminTeuda }>(`/admin/teudot/${teudaId}`, {
    teuda: buildAdminTeudaPayload(values, adminNote),
  });
  return response.data.teuda;
};

export const deleteTeuda = async (teudaId: string) => {
  const response = await api.delete<{ deleted: boolean }>(`/admin/teudot/${teudaId}`);
  return response.data;
};

export const createTeudaAsAdmin = async (
  restaurantId: string,
  values: TeudaFormValues,
  adminNote: string,
  photo: File,
  onProgress?: (percent: number) => void
) => {
  const formData = new FormData();
  formData.append('teuda', JSON.stringify(buildAdminTeudaPayload(values, adminNote)));
  formData.append('photo', photo);

  const response = await api.post<{ teuda: AdminTeuda }>(`/admin/restaurants/${restaurantId}/teudot`, formData, {
    onUploadProgress: (event) => {
      if (onProgress && event.total) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    },
  });
  return response.data.teuda;
};

// ---------- Reports ----------

export const resolveReport = async (reportId: string, resolution: ReportResolution, adminNote: string) => {
  const response = await api.post<{ report: AdminReport; alreadyResolved: boolean; points: PointsResult }>(
    `/admin/reports/${reportId}/resolve`,
    { resolution, adminNote }
  );
  return response.data;
};

export const rejectReport = async (reportId: string, reason: string) => {
  const response = await api.post<{ report: AdminReport; emailStatus: EmailStatus }>(
    `/admin/reports/${reportId}/reject`,
    { reason }
  );
  return response.data;
};
