// NEW (Agent 3): visible validation feedback and keyboard-accessible photo recovery.
// חדש (סוכן 3): משוב אימות וניקוי תמונה נגיש באמצעות מקלדת.
import { useTranslation } from 'react-i18next';

interface Props {
  photo: File | null;
  photoError: string;
  photoValidating: boolean;
  disabled: boolean;
  onClear: () => void;
}
export default function PhotoFieldRecovery({ photo, photoError, photoValidating, disabled, onClear }: Props) {
  const { t } = useTranslation();
  return (
    <div>
      {photoValidating && <p role="status" className="text-sm text-muted">{t('forms.photoValidating')}</p>}
      {(photo || photoError || photoValidating) && (
        <button type="button" disabled={disabled} className="min-h-11 text-sm font-medium text-grove underline" onClick={(event) => {
          // The uncontrolled file input must also reset so choosing the same file retries its read.
          const input = event.currentTarget.form?.querySelector<HTMLInputElement>('input[type="file"]');
          if (input) input.value = '';
          onClear();
        }}>
          {t('forms.clearPhoto')}
        </button>
      )}
    </div>
  );
}
