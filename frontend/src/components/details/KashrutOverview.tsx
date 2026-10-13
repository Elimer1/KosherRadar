// NEW (Visual v2): restaurant details presentation; existing contracts and status labels stay authoritative.
// חדש (עיצוב 2): תצוגת פרטי מסעדה תוך שמירה על חוזים ותוויות קיימים.
// One concise kashrut line. The full record stays in the evidence column.
import { useTranslation } from 'react-i18next';
import type { RestaurantDetails } from '../../types/restaurantDetails';
import type { KashrutPrimary, KashrutStatus } from '../../types/search';
import type { HechsherOption } from '../../types/submissions';
import { describeEvidenceName, describeValidity, formatMoreCount, getStatusHeadline } from '../../utils/kashrutText';
import { getHechsherLabel, getKashrutLevelLabel } from '../../utils/labels';
import { isSafeHttpUrl } from '../../utils/safeUrl';
import StatusIcon from './StatusIcon';

interface KashrutOverviewProps {
  restaurant: RestaurantDetails;
  hechsherOptions: HechsherOption[];
}

function summaryParts(status: KashrutStatus, primary: KashrutPrimary | null, moreCount: number, hechsherOptions: HechsherOption[]) {
  const parts = [getStatusHeadline(status)];

  if (!primary) {
    return parts;
  }

  if (status === 'VERIFIED' || status === 'EXPIRED') {
    const hechsher = primary.hechsher ? getHechsherLabel(primary.hechsher, primary.hechsherOther, hechsherOptions) : '';
    const level = primary.kashrutLevel ? getKashrutLevelLabel(primary.kashrutLevel) : '';
    const validity = describeValidity(primary);
    if (hechsher) {
      parts.push(hechsher);
    }
    if (level) {
      parts.push(level);
    }
    if (validity) {
      parts.push(validity);
    }
    const more = formatMoreCount(moreCount);
    if (more) {
      parts.push(more);
    }
    return parts;
  }

  if (status === 'UNVERIFIED') {
    parts.push(describeEvidenceName(primary, hechsherOptions));
  }

  return parts;
}

function KashrutOverview({ restaurant, hechsherOptions }: KashrutOverviewProps) {
  const { t } = useTranslation();
  const kashrut = restaurant.kashrut;
  const status = kashrut.status;
  const parts = summaryParts(status, kashrut.primary, kashrut.moreCount, hechsherOptions);
  const showHistory = kashrut.hasRecentExpired && status !== 'EXPIRED';
  const summaryClass = [
    'kr-v2-details-summary',
    `kr-v2-details-summary--${status.toLowerCase()}`,
    status === 'EXPIRED' ? 'kr-details-overview-facts kr-details-overview-facts--expired' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <section className="kr-v2-details-overview" aria-labelledby="kashrut-heading">
      <h2 id="kashrut-heading" className="kr-v2-details-heading">
        {t('details.kashrut')}
      </h2>
      <p className={summaryClass} data-overview={status}>
        <StatusIcon status={status} />
        <span>{parts.join(' · ')}</span>
      </p>
      {showHistory && <p className="kr-v2-details-history">{t('kashrut.alsoExpired')}</p>}
      {status === 'UNKNOWN' && <p className="kr-v2-details-unknown">{t('details.unknown')}</p>}
    </section>
  );
}

export function EvidenceFooter({ kosharotUrl }: { kosharotUrl: string | null }) {
  const { t } = useTranslation();
  const safeKosharot = isSafeHttpUrl(kosharotUrl) ? kosharotUrl : null;

  return (
    <div className="kr-v2-details-footnote">
      {safeKosharot && (
        <p>
          <a href={safeKosharot} target="_blank" rel="noopener noreferrer">
            {t('details.kosharot')}
          </a>
        </p>
      )}
      <p className="kr-v2-details-disclaimer">{t('details.disclaimer')}</p>
    </div>
  );
}

export default KashrutOverview;
