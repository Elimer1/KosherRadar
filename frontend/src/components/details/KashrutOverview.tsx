// NEW (Redesign wave 1): the kashrut summary. Status still comes from the existing badge and payload.
// חדש (גל עיצוב 1): סיכום הכשרות. הסטטוס עדיין מגיע מהתג הקיים ומהנתונים.
import { useTranslation } from 'react-i18next';
import KashrutBadge from '../KashrutBadge';
import type { RestaurantDetails } from '../../types/restaurantDetails';
import type { KashrutPrimary } from '../../types/search';
import type { HechsherOption } from '../../types/submissions';
import { describeValidity } from '../../utils/kashrutText';
import { getHechsherLabel, getKashrutLevelLabel } from '../../utils/labels';
import { isSafeHttpUrl } from '../../utils/safeUrl';

interface KashrutOverviewProps {
  restaurant: RestaurantDetails;
  hechsherOptions: HechsherOption[];
}

function authorityLabel(primary: KashrutPrimary, hechsherOptions: HechsherOption[]) {
  if (!primary.hechsher) {
    return '';
  }

  return getHechsherLabel(primary.hechsher, primary.hechsherOther, hechsherOptions);
}

function OverviewFacts({
  kashrut,
  hechsherOptions,
}: {
  kashrut: RestaurantDetails['kashrut'];
  hechsherOptions: HechsherOption[];
}) {
  const { t } = useTranslation();
  const primary = kashrut.primary;

  // A claim is not given certificate rows. Those stay in the unverified section.
  // טענה לא מקבלת שורות של תעודה. הן נשארות באזור הטענות הלא מאומתות.
  if (!primary || (primary.kind !== 'VERIFIED' && primary.kind !== 'EXPIRED')) {
    return null;
  }

  const hechsher = authorityLabel(primary, hechsherOptions);
  const level = primary.kashrutLevel ? getKashrutLevelLabel(primary.kashrutLevel) : '';
  const validity = describeValidity(primary);
  const isExpired = primary.kind === 'EXPIRED';

  if (hechsher === '' && level === '' && validity === '') {
    return null;
  }

  return (
    <div className={isExpired ? 'kr-details-overview-facts kr-details-overview-facts--expired' : 'kr-details-overview-facts'}>
      <dl className="kr-details-facts">
        {hechsher !== '' && (
          <div>
            <dt>{t('filters.hechsher')}</dt>
            <dd className="kr-details-record-name kr-details-break" dir="auto">
              {hechsher}
            </dd>
          </div>
        )}
        {level !== '' && (
          <div>
            <dt>{t('filters.level')}</dt>
            <dd dir="auto">{level}</dd>
          </div>
        )}
      </dl>
      {validity !== '' && (
        <p className={isExpired ? 'kr-details-validity kr-details-validity--expired' : 'kr-details-validity'}>{validity}</p>
      )}
    </div>
  );
}

function KashrutOverview({ restaurant, hechsherOptions }: KashrutOverviewProps) {
  const { t } = useTranslation();

  return (
    <section className="kr-details-sheet" aria-labelledby="kashrut-heading">
      <h2 id="kashrut-heading" className="kr-details-heading">
        {t('details.kashrut')}
      </h2>
      <div className="kr-details-badge">
        <KashrutBadge kashrut={restaurant.kashrut} hechsherOptions={hechsherOptions} />
      </div>
      <OverviewFacts kashrut={restaurant.kashrut} hechsherOptions={hechsherOptions} />
      {restaurant.kashrut.status === 'UNKNOWN' && <p className="kr-details-unknown">{t('details.unknown')}</p>}
    </section>
  );
}

export function EvidenceFooter({ kosharotUrl }: { kosharotUrl: string | null }) {
  const { t } = useTranslation();
  const safeKosharot = isSafeHttpUrl(kosharotUrl) ? kosharotUrl : null;

  return (
    <div className="kr-details-note">
      {safeKosharot && (
        <p>
          <a href={safeKosharot} target="_blank" rel="noopener noreferrer">
            {t('details.kosharot')}
          </a>
        </p>
      )}
      <p className="kr-details-disclaimer">{t('details.disclaimer')}</p>
    </div>
  );
}

export default KashrutOverview;
