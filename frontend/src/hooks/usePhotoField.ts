import { useState } from 'react';
import type { ChangeEvent } from 'react';
import { checkPhotoFile } from '../utils/imageCheck';

// Keeps the chosen certificate photo and its client-side check result together.
export const usePhotoField = (maxBytes: number) => {
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoError, setPhotoError] = useState('');

  const handlePhotoChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setPhoto(null);
    setPhotoError('');

    if (!file) {
      return;
    }

    const problem = await checkPhotoFile(file, maxBytes);

    if (problem) {
      setPhotoError(problem);
      event.target.value = '';
      return;
    }

    setPhoto(file);
  };

  return { photo, photoError, handlePhotoChange };
};
