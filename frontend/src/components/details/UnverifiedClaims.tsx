// NEW (Redesign wave 1): unverified claims stay apart from approved certificates.
// חדש (גל עיצוב 1): טענות לא מאומתות נשארות בנפרד מתעודות שאושרו.
import { useTranslation } from 'react-i18next';
import type { KashrutEvidenceItem } from '../../types/restaurantDetails';
import type { HechsherOption } from '../../types/submissions';
import { describeEvidenceName } from '../../utils/kashrutText';

interface UnverifiedClaimsProps {
  claims: KashrutEvidenceItem[];
  hechsherOptions: HechsherOption[];
}

function UnverifiedClaims({ claims, hechsherOptions }: UnverifiedClaimsProps) {
  const { t } = useTranslation();

  if (claims.length === 0) {
    return null;
  }

  return (
    <section className="kr-details-sheet kr-details-claims" aria-labelledby="claims-heading">
      <h2 id="claims-heading" className="kr-details-heading">
        {t('details.claim')}
      </h2>
      <ul className="kr-details-list">
        {claims.map((claim, index) => (
          <li
            key={`${claim.hechsher ?? 'none'}-${claim.kashrutLevel ?? 'none'}-${index}`}
            className="kr-details-claim"
            data-evidence="claim"
          >
            <p className="kr-details-claim-note">{t('details.claimNote')}</p>
            <p className="kr-details-claim-kicker">
              <span aria-hidden="true">! </span>
              {t('details.claim')}
            </p>
            <p className="kr-details-break" dir="auto">
              {t('details.claimSays', { name: describeEvidenceName(claim, hechsherOptions) })}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default UnverifiedClaims;
