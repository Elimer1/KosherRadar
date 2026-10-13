// NEW (Visual v2): restaurant details presentation; existing contracts and status labels stay authoritative.
// חדש (עיצוב 2): תצוגת פרטי מסעדה תוך שמירה על חוזים ותוויות קיימים.
// Unverified claims stay out of the certificate list and never use a verified label.
import { useTranslation } from 'react-i18next';
import type { KashrutEvidenceItem } from '../../types/restaurantDetails';
import type { HechsherOption } from '../../types/submissions';
import { describeEvidenceName } from '../../utils/kashrutText';

interface UnverifiedClaimsProps {
  claims: KashrutEvidenceItem[];
  hechsherOptions: HechsherOption[];
  showStatusLabel?: boolean;
}

function UnverifiedClaims({ claims, hechsherOptions, showStatusLabel = true }: UnverifiedClaimsProps) {
  const { t } = useTranslation();

  if (claims.length === 0) {
    return null;
  }

  return (
    <ul className="kr-v2-details-records">
      {claims.map((claim, index) => (
        <li
          key={`${claim.hechsher ?? 'none'}-${claim.kashrutLevel ?? 'none'}-${index}`}
          className="kr-v2-details-record kr-v2-details-record--claim"
          data-evidence="claim"
        >
          <p className="kr-v2-details-claim-note">{t('details.claimNote')}</p>
          {showStatusLabel && <p className="kr-v2-details-status kr-v2-details-status--claim">{t('details.claim')}</p>}
          <p className="kr-v2-details-claim-body" dir="auto">
            {t('details.claimSays', { name: describeEvidenceName(claim, hechsherOptions) })}
          </p>
        </li>
      ))}
    </ul>
  );
}

export default UnverifiedClaims;
