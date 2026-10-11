// NEW (Milestone 3): the facts of one certificate as an admin sees them, including the full-size photo link.
// חדש (אבן דרך 3): העובדות של תעודה אחת כפי שמנהל רואה אותן, כולל קישור לתמונה בגודל מלא.
import type { AdminTeuda } from '../../types/admin';
import type { HechsherOption } from '../../types/submissions';
import { getVisibilityLabel } from '../../utils/adminLabels';
import { getHechsherLabel, getKashrutLevelLabel } from '../../utils/labels';

interface TeudaFactsProps {
  teuda: AdminTeuda;
  hechsherOptions: HechsherOption[];
}

function TeudaFacts({ teuda, hechsherOptions }: TeudaFactsProps) {
  return (
    <dl className="grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
      <div>
        <dt className="inline text-gray-500">Hechsher: </dt>
        <dd className="inline font-medium text-gray-900">
          {getHechsherLabel(teuda.hechsher, teuda.hechsherOther, hechsherOptions)}
        </dd>
      </div>
      <div>
        <dt className="inline text-gray-500">Level: </dt>
        <dd className="inline font-medium text-gray-900">{getKashrutLevelLabel(teuda.kashrutLevel)}</dd>
      </div>
      <div>
        <dt className="inline text-gray-500">Expires: </dt>
        <dd className="inline font-medium text-gray-900">{teuda.expirationDate}</dd>
      </div>
      <div>
        <dt className="inline text-gray-500">Visibility: </dt>
        <dd className="inline font-medium text-gray-900">{getVisibilityLabel(teuda.visibility)}</dd>
      </div>
      <div>
        <dt className="inline text-gray-500">Mashgiach: </dt>
        <dd className="inline font-medium text-gray-900">
          {teuda.mashgiachName}, {teuda.mashgiachPhone}
        </dd>
      </div>
      <div>
        <dt className="inline text-gray-500">Photo: </dt>
        <dd className="inline">
          <a
            href={teuda.photoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-green-700 underline"
          >
            Open full size
          </a>
        </dd>
      </div>
      {teuda.submittedBy && (
        <div>
          <dt className="inline text-gray-500">Sent by: </dt>
          <dd className="inline text-gray-900">{teuda.submittedBy.email}</dd>
        </div>
      )}
      {teuda.adminNote && (
        <div className="sm:col-span-2">
          <dt className="inline text-gray-500">Private note: </dt>
          <dd className="inline text-gray-900">{teuda.adminNote}</dd>
        </div>
      )}
    </dl>
  );
}

export default TeudaFacts;
