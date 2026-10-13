import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import i18n from '../i18n';
import { checkPhotoFile } from '../utils/imageCheck';

// Keeps the chosen certificate photo and its client-side check result together.
export const usePhotoField = (maxBytes: number) => {
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoError, setPhotoError] = useState('');
  // NEW (Agent 3): refs guard same-event submission and invalidate obsolete reads.
  // חדש (סוכן 3): מניעת שליחה בזמן קריאה והתעלמות מתוצאות ישנות.
  const [photoValidating, setPhotoValidating] = useState(false);
  const validation = useRef({ version: 0, pending: false, error: '' });
  useEffect(() => () => { validation.current.version += 1; }, []);
  const getPhotoSubmissionError = () => validation.current.pending
    ? i18n.t('forms.photoValidating') : validation.current.error;

  const handlePhotoChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    const version = ++validation.current.version;
    validation.current.pending = Boolean(file);
    validation.current.error = '';
    setPhotoValidating(Boolean(file));
    setPhotoError('');

    if (!file) {
      setPhoto(null);
      return;
    }

    let problem: string;
    try {
      problem = await checkPhotoFile(file, maxBytes);
    } catch {
      problem = 'read-failed';
    }
    if (version !== validation.current.version) return;

    const message = problem === 'too-large'
      ? i18n.t('forms.photoTooLarge', { max: Math.round(maxBytes / (1024 * 1024)) })
      : problem === 'read-failed' ? i18n.t('forms.photoReadFailed')
      : problem ? i18n.t('forms.photoType') : '';
    validation.current.pending = false;
    validation.current.error = message;
    setPhotoValidating(false);
    setPhotoError(message);
    // Keep the last valid selection, but block submission until the error is recovered.
    if (!problem) setPhoto(file);
  };

  return { photo, photoError, photoValidating, getPhotoSubmissionError, handlePhotoChange };
};
