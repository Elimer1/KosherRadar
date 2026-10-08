import axios from 'axios';

interface ApiErrorBody {
  message?: string;
  errors?: { field: string; message: string }[];
}

// Turns any error from an API call into a short message that is safe to show the user.
export const getErrorMessage = (error: unknown, fallback = 'Something went wrong. Please try again.') => {
  if (!axios.isAxiosError<ApiErrorBody>(error)) {
    return fallback;
  }

  // The request never got an answer: server is down, wrong URL, or blocked by CORS.
  if (!error.response) {
    return 'Cannot reach the server. Check your connection and try again.';
  }

  const body = error.response.data;

  // Validation errors list which field is wrong.
  if (body?.errors && body.errors.length > 0) {
    return body.errors.map((item) => item.message).join('. ');
  }

  return body?.message || fallback;
};
