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
        <dt className="inline text-gray-500">{t('desk.hechsher')} </dt>
        <dd className="inline font-medium text-gray-900">
          {getHechsherLabel(teuda.hechsher, teuda.hechsherOther, hechsherOptions)}
        </dd>
      </div>
      <div>
        <dt className="inline text-gray-500">{t('desk.level')} </dt>
        <dd className="inline font-medium text-gray-900">{getKashrutLevelLabel(teuda.kashrutLevel)}</dd>
      </div>
      <div>
        <dt className="inline text-gray-500">{t('desk.expires')} </dt>
        <dd className="inline font-medium text-gray-900">{teuda.expirationDate}</dd>
      </div>
      <div>
        <dt className="inline text-gray-500">{t('desk.visibility')} </dt>
        <dd className="inline font-medium text-gray-900">{getVisibilityLabel(teuda.visibility)}</dd>
      </div>
      <div>
        <dt className="inline text-gray-500">{t('desk.mashgiach')} </dt>
        <dd className="inline font-medium text-gray-900">
          {teuda.mashgiachName}, {teuda.mashgiachPhone}
        </dd>
      </div>
      <div>
        <dt className="inline text-gray-500">{t('desk.photo')} </dt>
        <dd className="inline">
          <a
            href={teuda.photoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-green-700 underline"
          >
            {t('desk.openFull')}
          </a>
        </dd>
      </div>
      {teuda.submittedBy && (
        <div>
          <dt className="inline text-gray-500">{t('desk.sentByLabel')} </dt>
          <dd className="inline text-gray-900">{teuda.submittedBy.email}</dd>
        </div>
      )}
      {teuda.adminNote && (
        <div className="sm:col-span-2">
          <dt className="inline text-gray-500">{t('desk.privateNoteLabel')} </dt>
          <dd className="inline text-gray-900">{teuda.adminNote}</dd>
        </div>
      )}
    </dl>
  );
}

export default TeudaFacts;
