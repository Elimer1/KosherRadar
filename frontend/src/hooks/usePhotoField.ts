import { useState } from 'react';
import type { ChangeEvent } from 'react';
import i18n from '../i18n';
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

    if (problem === 'too-large') {
      setPhotoError(i18n.t('forms.photoTooLarge', { max: Math.round(maxBytes / (1024 * 1024)) }));
      event.target.value = '';
      return;
    }

    if (problem) {
      setPhotoError(i18n.t('forms.photoType'));
      event.target.value = '';
      return;
    }

    setPhoto(file);
  };

  return { photo, photoError, handlePhotoChange };
};
