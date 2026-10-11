import { api } from './axiosInstance';
import type { SubmissionContext, TeudaFormValues, TeudaSubmitResult } from '../types/submissions';

export const getSubmissionContext = async (restaurantId: string) => {
  const response = await api.get<SubmissionContext>(`/restaurants/${restaurantId}/submission-context`);
  return response.data;
};

// The photo and the certificate details travel together as one multipart form.
export const submitTeuda = async (
  restaurantId: string,
  values: TeudaFormValues,
  photo: File,
  onProgress?: (percent: number) => void
) => {
  const formData = new FormData();
  formData.append('teuda', JSON.stringify(values));
  formData.append('photo', photo);

  const response = await api.post<TeudaSubmitResult>(`/restaurants/${restaurantId}/teudot`, formData, {
    onUploadProgress: (event) => {
      if (onProgress && event.total) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    },
  });
  return response.data;
};
