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

// Verified uses the forest surface. A claim stays on white with a dashed amber border so it cannot be read as approved.
const STYLES: Record<KashrutStatus, { symbol: string; box: string }> = {
  VERIFIED: { symbol: '✓', box: 'border-forest bg-mist text-forest-deep' },
  UNVERIFIED: { symbol: '!', box: 'border-dashed border-amber-ink bg-white text-amber-ink' },
  EXPIRED: { symbol: '✕', box: 'border-red-800 bg-red-50 text-red-900' },
  UNKNOWN: { symbol: '?', box: 'border-soft bg-canvas text-muted' },
};

function KashrutBadge({ kashrut, hechsherOptions }: KashrutBadgeProps) {
  const { t } = useTranslation();
  const style = STYLES[kashrut.status];
  const moreText = formatMoreCount(kashrut.moreCount);
  // An expired certificate hidden behind a better item must not disappear from the preview (spec 5.6).
  const mentionsHiddenExpired = kashrut.hasRecentExpired && kashrut.status !== 'EXPIRED';

  return (
    <div className={`rounded-xl border px-3 py-2.5 text-sm leading-snug ${style.box}`}>
      <p className="font-semibold">
        <span aria-hidden="true" className="me-1">
          {style.symbol}
        </span>
        {getStatusHeadline(kashrut.status)}
      </p>

      {kashrut.primary && (
        <p className="mt-1" dir="auto">
          {describeEvidenceName(kashrut.primary, hechsherOptions)}
          {describeValidity(kashrut.primary) && <span> · {describeValidity(kashrut.primary)}</span>}
          {moreText && <span className="ms-2 font-medium">({moreText})</span>}
        </p>
      )}

      {mentionsHiddenExpired && <p className="mt-1 font-medium">{t('kashrut.alsoExpired')}</p>}
    </div>
  );
}

export default KashrutBadge;
