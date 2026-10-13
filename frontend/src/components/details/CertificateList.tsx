// NEW (Redesign wave 1): approved certificates, current and recently expired, kept visually distinct.
// חדש (גל עיצוב 1): תעודות מאושרות, בתוקף ושפג תוקפן לאחרונה, בהפרדה חזותית ברורה.
import { useTranslation } from 'react-i18next';
import type { PublicTeuda } from '../../types/restaurantDetails';
import type { HechsherOption } from '../../types/submissions';
import { formatDateOnly } from '../../utils/kashrutText';
import { getHechsherLabel, getKashrutLevelLabel } from '../../utils/labels';
import { buildTelUrl } from '../../utils/navigationLinks';
import { isSafeHttpUrl } from '../../utils/safeUrl';

interface CertificateListProps {
  teudot: PublicTeuda[];
  hechsherOptions: HechsherOption[];
}

function CertificateCard({ teuda, hechsherOptions }: { teuda: PublicTeuda; hechsherOptions: HechsherOption[] }) {
  const { t } = useTranslation();
  // RECENT_EXPIRED is still public evidence, and it must not be presented as current.
  // RECENT_EXPIRED היא עדיין ראיה ציבורית, ואסור להציג אותה כתעודה בתוקף.
  const isExpired = teuda.visibility === 'RECENT_EXPIRED';
  const date = formatDateOnly(teuda.expirationDate);
  const hechsher = getHechsherLabel(teuda.hechsher, teuda.hechsherOther, hechsherOptions);
  const level = teuda.kashrutLevel.trim() === '' ? '' : getKashrutLevelLabel(teuda.kashrutLevel);
  const mashgiachName = teuda.mashgiachName?.trim() ?? '';
  const mashgiachPhone = teuda.mashgiachPhone?.trim() ?? '';
  const mashgiachTel = buildTelUrl(mashgiachPhone === '' ? null : mashgiachPhone);
  const photoUrl = isSafeHttpUrl(teuda.photoUrl) ? teuda.photoUrl : null;

  return (
    <li
      className={
        isExpired
          ? 'kr-details-certificate kr-details-certificate--expired'
          : 'kr-details-certificate kr-details-certificate--current'
      }
      data-evidence="certificate"
      data-visibility={teuda.visibility}
    >
      <h3 className="kr-details-kicker">
        <span aria-hidden="true">{isExpired ? '✕ ' : '✓ '}</span>
        {isExpired ? t('details.expired') : t('details.verified')}
      </h3>
      <div className="kr-details-record-body">
        <dl className="kr-details-facts">
          <div>
            <dt>{t('filters.hechsher')}</dt>
            <dd className="kr-details-record-name kr-details-break" dir="auto">
              {hechsher || t('kashrut.noHechsher')}
            </dd>
          </div>
          {level !== '' && (
            <div>
              <dt>{t('filters.level')}</dt>
              <dd dir="auto">{level}</dd>
            </div>
          )}
        </dl>
        <p className={isExpired ? 'kr-details-validity kr-details-validity--expired' : 'kr-details-validity'}>
          {isExpired ? t('kashrut.expiredOn', { date }) : t('kashrut.validUntil', { date })}
        </p>
        {mashgiachName !== '' && (
          <p className="kr-details-break" dir="auto">
            {t('details.mashgiach', { name: mashgiachName })}
          </p>
        )}
        {mashgiachPhone !== '' && (
          <p className="kr-details-contact-line">
            {t('details.mashgiachPhone')}{' '}
            {mashgiachTel ? (
              <a href={mashgiachTel}>
                <bdi dir="ltr">{mashgiachPhone}</bdi>
              </a>
            ) : (
              <bdi dir="ltr">{mashgiachPhone}</bdi>
            )}
          </p>
        )}
        {photoUrl && (
          <p>
            <a className="kr-details-photo" href={photoUrl} target="_blank" rel="noopener noreferrer">
              {t('details.photo')}
            </a>
          </p>
        )}
      </div>
    </li>
  );
}

function CertificateList({ teudot, hechsherOptions }: CertificateListProps) {
  const { t } = useTranslation();

  if (teudot.length === 0) {
    return null;
  }

  return (
    <section className="kr-details-sheet" aria-labelledby="certificates-heading">
      <h2 id="certificates-heading" className="kr-details-heading">
        {t('details.certificates')}
      </h2>
      <ul className="kr-details-list">
        {teudot.map((teuda) => (
          <CertificateCard key={teuda.id} teuda={teuda} hechsherOptions={hechsherOptions} />
        ))}
      </ul>
    </section>
  );
}

export default CertificateList;
