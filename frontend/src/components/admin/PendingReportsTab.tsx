// NEW (Milestone 3): dashboard tab "Pending Reports": resolve (applying a correction or not) or reject reports.
// Only a correction that is really applied earns the contributor a point.
// חדש (אבן דרך 3): לשונית "דיווחים ממתינים": סגירה (עם תיקון או בלי) או דחייה. רק תיקון שהוחל בפועל מזכה בנקודה.
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getPendingReports, rejectReport, resolveReport } from '../../api/adminApi';
import { getErrorMessage } from '../../api/errors';
import { usePagedList } from '../../hooks/usePagedList';
import { describeEmailStatus, describePoints } from '../../utils/adminLabels';
import { getHechsherLabel, getKashrutLevelLabel } from '../../utils/labels';
import type { AdminReport, ReportResolution } from '../../types/admin';
import type { HechsherOption } from '../../types/submissions';
import FormAlert from '../FormAlert';
import { inputClassName, labelClassName } from '../formStyles';
import Notices from './Notices';
import type { Notice } from './Notices';
import Pagination from './Pagination';
import RejectForm from './RejectForm';

interface PendingReportsTabProps {
  hechsherOptions: HechsherOption[];
}

const canApplyProposal = (report: AdminReport) =>
  report.type === 'KASHRUT_UPDATE' && Boolean(report.proposedHechsher || report.proposedKashrutLevel);

function PendingReportsTab({ hechsherOptions }: PendingReportsTabProps) {
  const { data, page, setPage, error, loading, reload } = usePagedList(getPendingReports);
  const [busyId, setBusyId] = useState('');
  const [rejectingId, setRejectingId] = useState('');
  const [notices, setNotices] = useState<Notice[]>([]);
  // The chosen outcome and private note, per report.
  const [resolutions, setResolutions] = useState<Record<string, ReportResolution>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});

  const getResolution = (report: AdminReport): ReportResolution =>
    resolutions[report.id] || (canApplyProposal(report) ? 'APPLY_PROPOSED' : 'NO_CORRECTION');

  const handleResolve = async (report: AdminReport) => {
    setBusyId(report.id);
    setNotices([]);

    try {
      const result = await resolveReport(report.id, getResolution(report), notes[report.id] || '');
      setNotices([
        { kind: 'success', message: 'Report resolved.' },
        { kind: 'success', message: describePoints(result.points) },
      ]);
      reload();
    } catch (err) {
      setNotices([{ kind: 'error', message: getErrorMessage(err, 'Could not resolve the report.') }]);
    } finally {
      setBusyId('');
    }
  };

  const handleReject = async (reportId: string, reason: string) => {
    setBusyId(reportId);
    setNotices([]);

    try {
      const result = await rejectReport(reportId, reason);
      setNotices([{ kind: 'success', message: 'Report rejected.' }, describeEmailStatus(result.emailStatus)]);
      setRejectingId('');
      reload();
    } catch (err) {
      setNotices([{ kind: 'error', message: getErrorMessage(err, 'Could not reject the report.') }]);
    } finally {
      setBusyId('');
    }
  };

  return (
    <section className="space-y-4" aria-label="Pending reports">
      <Notices notices={notices} onDismiss={() => setNotices([])} />
      <FormAlert message={error} />

      {loading && !data && <p className="text-gray-600">Loading...</p>}
      {data && data.items.length === 0 && <p className="text-gray-600">No reports are waiting for review.</p>}

      <ul className="space-y-4">
        {data?.items.map((report) => (
          <li key={report.id} className="space-y-3 rounded border border-green-100 p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h3 className="text-lg font-semibold text-gray-900">
                {report.restaurant?.name || 'Unknown restaurant'}
                <span className="ms-2 rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                  {report.type === 'KASHRUT_UPDATE' ? 'Kashrut update' : 'General report'}
                </span>
              </h3>
              {report.restaurant && (
                <Link to={`/admin/restaurants/${report.restaurant.id}`} className="text-sm font-medium text-green-700 underline">
                  View restaurant
                </Link>
              )}
            </div>

            <p className="whitespace-pre-wrap text-sm text-gray-800">{report.description}</p>
            <p className="text-sm text-gray-500">Sent by {report.submittedBy?.email || 'an unknown user'}</p>

            {report.teuda && (
              <p className="text-sm text-gray-700">
                About the certificate:{' '}
                {getHechsherLabel(report.teuda.hechsher, report.teuda.hechsherOther, hechsherOptions)},{' '}
                {getKashrutLevelLabel(report.teuda.kashrutLevel)}, expires {report.teuda.expirationDate}
              </p>
            )}

            {canApplyProposal(report) && (
              <p className="text-sm text-gray-700">
                Proposed:{' '}
                {report.proposedHechsher
                  ? getHechsherLabel(report.proposedHechsher, report.proposedHechsherOther, hechsherOptions)
                  : 'same hechsher'}
                {report.proposedKashrutLevel ? `, ${getKashrutLevelLabel(report.proposedKashrutLevel)}` : ''}
              </p>
            )}

            {rejectingId === report.id ? (
              <RejectForm
                idPrefix={`reject-report-${report.id}`}
                busy={busyId === report.id}
                onConfirm={(reason) => handleReject(report.id, reason)}
                onCancel={() => setRejectingId('')}
              />
            ) : (
              <div className="space-y-3 rounded bg-green-50 p-3">
                <div>
                  <label htmlFor={`resolution-${report.id}`} className={labelClassName}>
                    How was this handled?
                  </label>
                  <select
                    id={`resolution-${report.id}`}
                    disabled={busyId === report.id}
                    value={getResolution(report)}
                    onChange={(event) =>
                      setResolutions((current) => ({ ...current, [report.id]: event.target.value as ReportResolution }))
                    }
                    className={inputClassName}
                  >
                    {canApplyProposal(report) && (
                      <option value="APPLY_PROPOSED">Apply the proposed correction now</option>
                    )}
                    <option value="CORRECTION_ALREADY_MADE">I already corrected the record myself</option>
                    <option value="NO_CORRECTION">Resolve without changing anything</option>
                  </select>
                </div>

                <div>
                  <label htmlFor={`note-${report.id}`} className={labelClassName}>
                    Private note (optional, never shown to users)
                  </label>
                  <input
                    id={`note-${report.id}`}
                    type="text"
                    maxLength={1000}
                    disabled={busyId === report.id}
                    value={notes[report.id] || ''}
                    onChange={(event) => setNotes((current) => ({ ...current, [report.id]: event.target.value }))}
                    className={inputClassName}
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={busyId === report.id}
                    onClick={() => handleResolve(report)}
                    className="rounded bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {busyId === report.id ? 'Working...' : 'Resolve'}
                  </button>
                  <button
                    type="button"
                    disabled={busyId === report.id}
                    onClick={() => setRejectingId(report.id)}
                    className="rounded border border-red-300 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Reject...
                  </button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>

      {data && <Pagination page={page} totalPages={data.totalPages} total={data.total} disabled={loading} onPageChange={setPage} />}
    </section>
  );
}

export default PendingReportsTab;
