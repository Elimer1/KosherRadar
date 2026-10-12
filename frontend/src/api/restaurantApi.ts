import { api } from './axiosInstance';
import type {
  RestaurantFormValues,
  RestaurantSubmitResult,
  SubmissionContext,
  TeudaFormValues,
  TeudaSubmitResult,
} from '../types/submissions';

// Turns the form strings into the JSON the server expects. Empty inputs are left out,
// and coordinates are only sent when the user typed both.
export const buildRestaurantPayload = (values: RestaurantFormValues) => {
  const keywords = values.foodKeywords
    .split(',')
    .map((keyword) => keyword.trim())
    .filter((keyword) => keyword !== '');

  return {
    name: values.name,
    address: values.address,
    city: values.city || undefined,
    latitude: values.latitude.trim() === '' ? undefined : Number(values.latitude),
    longitude: values.longitude.trim() === '' ? undefined : Number(values.longitude),
    phone: values.phone || undefined,
    website: values.website || undefined,
    foodType: values.foodType || undefined,
    categories: values.categories,
    foodKeywords: keywords,
    claimedHechsher: values.claimedHechsher || undefined,
    claimedHechsherOther: values.claimedHechsherOther || undefined,
    claimedKashrutLevel: values.claimedKashrutLevel || undefined,
    geoapifyPlaceId: values.geoapifyPlaceId || undefined,
  };
};

// NEW (Audit M1): the hechsher is the claim. A level is never sent. Empty certificate details are left out.
// חדש (ביקורת M1): ההכשר הוא הטענה. רמה לא נשלחת. פרטי תעודה ריקים לא נשלחים.
export const hasCertificateEvidence = (values: TeudaFormValues, photo: File | null) =>
  Boolean(photo || values.expirationDate || values.mashgiachName.trim() || values.mashgiachPhone.trim());

export const buildPendingTeudaPayload = (values: TeudaFormValues) => {
  const payload: Record<string, string> = { hechsher: values.hechsher };

  if (values.hechsherOther.trim()) {
    payload.hechsherOther = values.hechsherOther.trim();
  }

  if (values.expirationDate) {
    payload.expirationDate = values.expirationDate;
  }

  if (values.mashgiachName.trim()) {
    payload.mashgiachName = values.mashgiachName.trim();
  }

  if (values.mashgiachPhone.trim()) {
    payload.mashgiachPhone = values.mashgiachPhone.trim();
  }

  return payload;
};

const reportProgress = (onProgress?: (percent: number) => void) => (event: { loaded: number; total?: number }) => {
  if (onProgress && event.total) {
    onProgress(Math.round((event.loaded / event.total) * 100));
  }
};

export const submitRestaurant = async (
  values: RestaurantFormValues,
  teuda: TeudaFormValues | null,
  photo: File | null,
  lang: 'en' | 'he',
  onProgress?: (percent: number) => void
) => {
  const formData = new FormData();
  formData.append('restaurant', JSON.stringify(buildRestaurantPayload(values)));
  formData.append('lang', lang);

  if (teuda) {
    formData.append('teuda', JSON.stringify(buildPendingTeudaPayload(teuda)));
  }

  if (photo) {
    formData.append('photo', photo);
  }

  const response = await api.post<RestaurantSubmitResult>('/restaurants', formData, {
    onUploadProgress: reportProgress(onProgress),
  });
  return response.data;
};

export const getSubmissionContext = async (restaurantId: string) => {
  const response = await api.get<SubmissionContext>(`/restaurants/${restaurantId}/submission-context`);
  return response.data;
};

// The photo and the certificate details travel together as one multipart form.
export const submitTeuda = async (
  restaurantId: string,
  values: TeudaFormValues,
  photo: File | null,
  onProgress?: (percent: number) => void
) => {
  const formData = new FormData();
  formData.append('teuda', JSON.stringify(buildPendingTeudaPayload(values)));

  if (photo) {
    formData.append('photo', photo);
  }

  const response = await api.post<TeudaSubmitResult>(`/restaurants/${restaurantId}/teudot`, formData, {
    onUploadProgress: reportProgress(onProgress),
  });
  return response.data;
};
