import { useEffect, useState } from 'react';
import { getFormOptions } from '../api/optionsApi';
import { getErrorMessage } from '../api/errors';
import type { FormOptions } from '../types/submissions';

// Three submission pages need the same hechsher/category lists, so they share this loader.
export const useFormOptions = () => {
  const [options, setOptions] = useState<FormOptions | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadOptions = async () => {
      try {
        setOptions(await getFormOptions());
      } catch (err) {
        setError(getErrorMessage(err, 'Could not load the form choices.'));
      }
    };

    loadOptions();
  }, []);

  return { options, error };
};
