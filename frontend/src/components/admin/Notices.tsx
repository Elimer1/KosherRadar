// NEW (Milestone 3): result messages shown after an admin action (email status, points, warnings).
// חדש (אבן דרך 3): הודעות תוצאה שמוצגות אחרי פעולת מנהל (מצב המייל, נקודות, אזהרות).
import FormAlert from '../FormAlert';

export interface Notice {
  kind: 'error' | 'success' | 'warning';
  message: string;
}

interface NoticesProps {
  notices: Notice[];
  onDismiss: () => void;
}

function Notices({ notices, onDismiss }: NoticesProps) {
  if (notices.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      {notices.map((notice, index) => (
        <FormAlert key={index} kind={notice.kind} message={notice.message} />
      ))}
      <button type="button" onClick={onDismiss} className="text-xs font-medium text-gray-600 underline">
        Dismiss messages
      </button>
    </div>
  );
}

export default Notices;
