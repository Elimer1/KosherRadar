// NEW (Visual v2): restaurant details presentation; existing contracts and status labels stay authoritative.
// חדש (עיצוב 2): תצוגת פרטי מסעדה תוך שמירה על חוזים ותוויות קיימים.
// Loading, missing, and failed states. They use the same light page, not a green band.
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import FormAlert from '../FormAlert';
import type { RememberedSearchLocation } from '../../hooks/useSearchCriteria';

export interface DetailsBackState {
  searchLocation: RememberedSearchLocation;
}

interface BackLinkProps {
  to: string;
  state?: DetailsBackState;
}

export function DetailsBackLink({ to, state }: BackLinkProps) {
  const { t } = useTranslation();

  return (
    <Link to={to} state={state} className="kr-back kr-details-back kr-v2-details-back">
      <span aria-hidden="true" className="kr-back-mark">
        ‹
      </span>
      {t('details.back')}
    </Link>
  );
}

export function DetailsLoading({ to, state }: BackLinkProps) {
  const { t } = useTranslation();

  return (
    <div className="kr-v2-details">
      <DetailsBackLink to={to} state={state} />
      <p className="kr-v2-details-loading" role="status">
        <span className="kr-spinner" aria-hidden="true" />
        {t('details.loading')}
      </p>
    </div>
  );
}

export function DetailsNotFound({ to, state }: BackLinkProps) {
  const { t } = useTranslation();

  return (
    <div className="kr-v2-details">
      <section className="kr-v2-details-state">
        <h1 className="kr-v2-details-state-title">{t('details.notFoundTitle')}</h1>
        <p className="kr-v2-details-state-copy">{t('details.notFoundBody')}</p>
        <DetailsBackLink to={to} state={state} />
      </section>
    </div>
  );
}

interface LoadErrorProps extends BackLinkProps {
  message: string;
  onRetry: () => void;
}

export function DetailsLoadError({ message, onRetry, to, state }: LoadErrorProps) {
  const { t } = useTranslation();

  return (
    <div className="kr-v2-details">
      <section className="kr-v2-details-state">
        <FormAlert message={message} />
        <div className="kr-v2-details-state-actions">
          <button type="button" className="kr-v2-details-primary" onClick={onRetry}>
            {t('common.tryAgain')}
          </button>
          <DetailsBackLink to={to} state={state} />
        </div>
      </section>
    </div>
  );
}
