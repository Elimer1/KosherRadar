// NEW (Milestone 4): shows the kashrut status of a restaurant on a card or a detail page.
// The status is always written in words (and a symbol), never only a color, so it is clear for everyone.
// A claim is never styled like a certificate, and KosherRadar never presents itself as the certifier.
// חדש (אבן דרך 4): מציג את סטטוס הכשרות. הסטטוס תמיד כתוב במילים (וסמל), לא רק בצבע. טענה לעולם לא נראית כתעודה.
import { useTranslation } from 'react-i18next';
import type { KashrutPreview, KashrutStatus } from '../types/search';
import type { HechsherOption } from '../types/submissions';
import {
  describeEvidenceName,
  describeValidity,
  formatMoreCount,
  getStatusHeadline,
} from '../utils/kashrutText';

interface KashrutBadgeProps {
  kashrut: KashrutPreview;
  hechsherOptions: HechsherOption[];
}

const STYLES: Record<KashrutStatus, { symbol: string; box: string }> = {
  VERIFIED: { symbol: '✓', box: 'border-green-600 bg-green-50 text-green-900' },
  UNVERIFIED: { symbol: '!', box: 'border-dashed border-amber-500 bg-amber-50 text-amber-900' },
  EXPIRED: { symbol: '✕', box: 'border-red-500 bg-red-50 text-red-900' },
  UNKNOWN: { symbol: '?', box: 'border-gray-300 bg-gray-50 text-gray-800' },
};

function KashrutBadge({ kashrut, hechsherOptions }: KashrutBadgeProps) {
  const { t } = useTranslation();
  const style = STYLES[kashrut.status];
  const moreText = formatMoreCount(kashrut.moreCount);
  // An expired certificate hidden behind a better item must not disappear from the preview (spec 5.6).
  const mentionsHiddenExpired = kashrut.hasRecentExpired && kashrut.status !== 'EXPIRED';

  return (
    <div className={`rounded-lg border px-3 py-2.5 text-sm leading-snug ${style.box}`}>
      <p className="font-semibold">
        <span aria-hidden="true" className="me-1">{style.symbol}</span>
        {getStatusHeadline(kashrut.status)}
      </p>

      {kashrut.primary && (
        <p className="mt-0.5">
          {describeEvidenceName(kashrut.primary, hechsherOptions)}
          {describeValidity(kashrut.primary) && <span> · {describeValidity(kashrut.primary)}</span>}
          {moreText && <span className="ms-2 font-medium">({moreText})</span>}
        </p>
      )}

      {mentionsHiddenExpired && <p className="mt-0.5 font-medium">{t('kashrut.alsoExpired')}</p>}
    </div>
  );
}

export default KashrutBadge;
