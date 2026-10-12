import { api } from './axiosInstance';

// NEW (update): the report is a note plus an optional certificate photo.
// חדש (עדכון): הדיווח הוא הערה ותמונת תעודה אופציונלית.
export const submitReport = async (restaurantId: string, description: string, photo: File | null) => {
  const formData = new FormData();
  formData.append('restaurantId', restaurantId);
  formData.append('description', description);

  if (photo) {
    formData.append('photo', photo);
  }

  const response = await api.post<{ report: { id: string; status: string } }>('/reports', formData);
  return response.data;
};
