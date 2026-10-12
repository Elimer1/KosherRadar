// NEW (Milestone 3): the facts of one certificate as an admin sees them, including the full-size photo link.
// חדש (אבן דרך 3): העובדות של תעודה אחת כפי שמנהל רואה אותן, כולל קישור לתמונה בגודל מלא.
import { useTranslation } from 'react-i18next';
import type { AdminTeuda } from '../../types/admin';
import type { HechsherOption } from '../../types/submissions';
import { getVisibilityLabel } from '../../utils/adminLabels';
import { getHechsherLabel, getKashrutLevelLabel } from '../../utils/labels';

interface TeudaFactsProps {
  teuda: AdminTeuda;
  hechsherOptions: HechsherOption[];
}

function TeudaFacts({ teuda, hechsherOptions }: TeudaFactsProps) {
  const { t } = useTranslation();

  return (
    <dl className="grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
      <div>
        <dt className="inline text-muted">{t('desk.hechsher')} </dt>
        <dd className="inline font-medium text-ink">
          {getHechsherLabel(teuda.hechsher, teuda.hechsherOther, hechsherOptions)}
        </dd>
      </div>
      <div>
        <dt className="inline text-muted">{t('desk.level')} </dt>
        <dd className="inline font-medium text-ink">
          {teuda.kashrutLevel ? getKashrutLevelLabel(teuda.kashrutLevel) : t('desk.notSet')}
        </dd>
      </div>
      <div>
        <dt className="inline text-muted">{t('desk.expires')} </dt>
        <dd className="inline font-medium text-ink">{teuda.expirationDate || t('desk.notSet')}</dd>
      </div>
      <div>
        <dt className="inline text-muted">{t('desk.visibility')} </dt>
        <dd className="inline font-medium text-ink">
          {teuda.visibility ? getVisibilityLabel(teuda.visibility) : t('desk.notSet')}
        </dd>
      </div>
      <div>
        <dt className="inline text-muted">{t('desk.mashgiach')} </dt>
        <dd className="inline font-medium text-ink">
          {teuda.mashgiachName || teuda.mashgiachPhone
            ? [teuda.mashgiachName, teuda.mashgiachPhone].filter(Boolean).join(', ')
            : t('desk.notSet')}
        </dd>
      </div>
      <div>
        <dt className="inline text-muted">{t('desk.photo')} </dt>
        <dd className="inline">
          {teuda.photoUrl ? (
            <span className="inline-flex flex-col gap-2">
              <a
                href={teuda.photoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-grove underline"
              >
                {t('desk.openFull')}
              </a>
              <img src={teuda.photoUrl} alt={t('forms.photo')} className="max-h-48 max-w-full rounded border border-soft" />
            </span>
          ) : (
            <span className="font-medium text-ink">{t('desk.notSet')}</span>
          )}
        </dd>
      </div>
      {teuda.submittedBy && (
        <div>
          <dt className="inline text-muted">{t('desk.sentByLabel')} </dt>
          <dd className="inline text-ink">{teuda.submittedBy.email}</dd>
        </div>
      )}
      {teuda.adminNote && (
        <div className="sm:col-span-2">
          <dt className="inline text-muted">{t('desk.privateNoteLabel')} </dt>
          <dd className="inline text-ink">{teuda.adminNote}</dd>
        </div>
      )}
    </dl>
  );
}

export default TeudaFacts;
