// NEW (Visual v2): restaurant details presentation; existing contracts and status labels stay authoritative.
// חדש (עיצוב 2): תצוגת פרטי מסעדה תוך שמירה על חוזים ותוויות קיימים.
// Approved certificates as editorial records: current first, then expired.
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
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

function CertificatePhoto({ url }: { url: string }) {
  const { t } = useTranslation();
  // NEW (Visual v2): keep a failed preview out of React's tree while preserving the photo link.
  // חדש (עיצוב 2): הסתרת תמונה שלא נטענה בלי להסיר את הקישור לתעודה.
  const [failedUrl, setFailedUrl] = useState<string | null>(null);

  return (
    <a className="kr-v2-details-photo" href={url} target="_blank" rel="noopener noreferrer">
      {failedUrl !== url && (
        <img src={url} alt="" className="kr-v2-details-thumb" onError={() => setFailedUrl(url)} />
      )}
      <span>{t('details.photo')}</span>
    </a>
  );
}

function CertificateRecord({ teuda, hechsherOptions }: { teuda: PublicTeuda; hechsherOptions: HechsherOption[] }) {
  const { t } = useTranslation();
  const isExpired = teuda.visibility === 'RECENT_EXPIRED';
  const date = formatDateOnly(teuda.expirationDate);
  const hechsher = getHechsherLabel(teuda.hechsher, teuda.hechsherOther, hechsherOptions);
  const level = teuda.kashrutLevel.trim() === '' ? '' : getKashrutLevelLabel(teuda.kashrutLevel);
  const mashgiachName = teuda.mashgiachName?.trim() ?? '';
  const mashgiachPhone = teuda.mashgiachPhone?.trim() ?? '';
  const mashgiachTel = buildTelUrl(mashgiachPhone === '' ? null : mashgiachPhone);
  const photoUrl = isSafeHttpUrl(teuda.photoUrl) ? teuda.photoUrl : null;
  const hasMeta = level !== '' || mashgiachPhone !== '';

  return (
    <li
      className={
        isExpired
          ? 'kr-v2-details-record kr-v2-details-record--expired kr-details-certificate kr-details-certificate--expired'
          : 'kr-v2-details-record kr-v2-details-record--current kr-details-certificate kr-details-certificate--current'
      }
      data-evidence="certificate"
      data-visibility={teuda.visibility}
    >
      <p className={isExpired ? 'kr-v2-details-status kr-v2-details-status--expired' : 'kr-v2-details-status kr-v2-details-status--current'}>
        {isExpired ? t('details.expired') : t('details.verified')}
      </p>
      <h3 className="kr-v2-details-hechsher" dir="auto">
        {hechsher || t('kashrut.noHechsher')}
      </h3>
      <p className={isExpired ? 'kr-v2-details-expiry' : 'kr-v2-details-until'}>
        {isExpired ? t('kashrut.expiredOn', { date }) : t('kashrut.validUntil', { date })}
      </p>
      {mashgiachName !== '' && (
        <p className="kr-v2-details-mashgiach" dir="auto">
          {t('details.mashgiach', { name: mashgiachName })}
        </p>
      )}
      {hasMeta && (
        <dl className="kr-v2-details-meta">
          {level !== '' && (
            <>
              <dt>{t('filters.level')}</dt>
              <dd dir="auto">{level}</dd>
            </>
          )}
          {mashgiachPhone !== '' && (
            <>
              <dt>{t('details.mashgiachPhone')}</dt>
              <dd>
                {mashgiachTel ? (
                  <a href={mashgiachTel}>
                    <bdi dir="ltr">{mashgiachPhone}</bdi>
                  </a>
                ) : (
                  <bdi dir="ltr">{mashgiachPhone}</bdi>
                )}
              </dd>
            </>
          )}
        </dl>
      )}
      {photoUrl && <CertificatePhoto url={photoUrl} />}
    </li>
  );
}

function orderTeudot(teudot: PublicTeuda[]) {
  return [...teudot].sort((left, right) => {
    const rank = (visibility: PublicTeuda['visibility']) => (visibility === 'VALID' ? 0 : 1);
    return rank(left.visibility) - rank(right.visibility);
  });
}

function CertificateList({ teudot, hechsherOptions }: CertificateListProps) {
  if (teudot.length === 0) {
    return null;
  }

  return (
    <ul className="kr-v2-details-records">
      {orderTeudot(teudot).map((teuda) => (
        <CertificateRecord key={teuda.id} teuda={teuda} hechsherOptions={hechsherOptions} />
      ))}
    </ul>
  );
}

export default CertificateList;
