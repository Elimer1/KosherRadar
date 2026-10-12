// NEW (Milestone 5): share control for the restaurant page and the map popup.
// חדש (אבן דרך 5): כפתור שיתוף לדף המסעדה ולחלון הסמן במפה.
import { useState } from 'react';
import { sharePage } from '../utils/navigationLinks';

interface ShareButtonProps {
  title: string;
  url: string;
  className: string;
}

function ShareButton({ title, url, className }: ShareButtonProps) {
  const [message, setMessage] = useState('');

  const handleShare = async () => {
    const result = await sharePage(title, url);

    if (result === 'copied') {
      setMessage('Link copied');
      return;
    }

    if (result === 'failed') {
      setMessage('Could not share this page');
      return;
    }

    setMessage('');
  };

  return (
    <span className="inline-flex flex-col items-start">
      <button type="button" onClick={handleShare} className={className}>
        Share
      </button>
      {message !== '' && (
        <span role="status" className="mt-1 text-xs text-gray-600">
          {message}
        </span>
      )}
    </span>
  );
}

export default ShareButton;
