// Shows the kashrut status of a restaurant on a result row, a detail page, or a map popup.
// The status is written in words and a symbol, never only a color.
// A claim is never styled like a certificate, and KosherRadar never presents itself as the certifier.
import { useTranslation } from 'react-i18next';
import type { ReactNode } from 'react';
import type { KashrutPreview, KashrutStatus } from '../types/search';
import type { HechsherOption } from '../types/submissions';
import { describeEvidenceName, describeValidity, formatMoreCount, getStatusHeadline } from '../utils/kashrutText';

interface KashrutBadgeProps {
  kashrut: KashrutPreview;
  hechsherOptions: HechsherOption[];
}

function Mark({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.7">
      {children}
    </svg>
  );
}

function StatusMark({ status }: { status: KashrutStatus }) {
  if (status === 'VERIFIED') {
    return (
      <Mark>
        <circle cx="8" cy="8" r="6.2" />
        <path d="M5 8.2 7.1 10.2 11 6" />
      </Mark>
    );
  }

  if (status === 'UNVERIFIED') {
    return (
      <Mark>
        <path d="M8 2.4 14.2 13.6H1.8L8 2.4z" />
        <path d="M8 6.4v3.2" />
        <path d="M8 11.6h.01" />
      </Mark>
    );
  }

  if (status === 'EXPIRED') {
    return (
      <Mark>
        <circle cx="8" cy="8" r="6.2" />
        <path d="M5.4 5.4 10.6 10.6M10.6 5.4 5.4 10.6" />
      </Mark>
    );
  }

  return (
    <Mark>
      <circle cx="8" cy="8" r="6.2" />
      <path d="M6.4 6.2a1.7 1.7 0 0 1 3.1 1c0 1.2-1.5 1.4-1.5 2.4" />
      <path d="M8 12h.01" />
    </Mark>
  );
}

const STATUS_CLASS: Record<KashrutStatus, string> = {
  VERIFIED: 'v2-status-verified',
  UNVERIFIED: 'v2-status-unverified',
  EXPIRED: 'v2-status-expired',
  UNKNOWN: 'v2-status-unknown',
};

function KashrutBadge({ kashrut, hechsherOptions }: KashrutBadgeProps) {
  const { t } = useTranslation();
  const moreText = formatMoreCount(kashrut.moreCount);
  const mentionsHiddenExpired = kashrut.hasRecentExpired && kashrut.status !== 'EXPIRED';

  return (
    <div className={`v2-status ${STATUS_CLASS[kashrut.status]}`}>
      <p className="v2-status-label">
        <StatusMark status={kashrut.status} />
        <span>{getStatusHeadline(kashrut.status)}</span>
      </p>

      {kashrut.primary && (
        <p className="v2-status-evidence">
          <bdi>{describeEvidenceName(kashrut.primary, hechsherOptions)}</bdi>
          {describeValidity(kashrut.primary) && <span> · {describeValidity(kashrut.primary)}</span>}
          {moreText && <span className="ms-1 font-semibold">({moreText})</span>}
        </p>
      )}

      {mentionsHiddenExpired && <p className="v2-status-note font-semibold">{t('kashrut.alsoExpired')}</p>}
    </div>
  );
}

export default KashrutBadge;
