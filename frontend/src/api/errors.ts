import axios from 'axios';
import i18n from '../i18n';

interface ApiErrorBody {
  message?: string;
  errors?: { field: string; message: string }[];
}

// Turns any error from an API call into a short message that is safe to show the user.
export const getErrorMessage = (error: unknown, fallback?: string) => {
  const generic = fallback || i18n.t('common.genericError');

  if (!axios.isAxiosError<ApiErrorBody>(error)) {
    return generic;
  }

  // The request never got an answer: server is down, wrong URL, or blocked by CORS.
  if (!error.response) {
    return i18n.t('common.offline');
  }

  const body = error.response.data;

  // Validation errors list which field is wrong.
  if (body?.errors && body.errors.length > 0) {
    return body.errors.map((item) => item.message).join('. ');
  }

  return body?.message || generic;
};

// Search has its own limit. The server message is English, so the page uses the active language instead.
// לחיפוש יש מגבלה משלו. הודעת השרת באנגלית, ולכן הדף משתמש בשפה הפעילה.
export const getSearchErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError<ApiErrorBody>(error) && error.response?.status === 429) {
    return i18n.t('home.rateLimited');
  }

  return getErrorMessage(error, fallback);
};
