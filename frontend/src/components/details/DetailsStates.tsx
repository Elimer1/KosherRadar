// NEW (Redesign wave 1): loading, missing, and failed states for the restaurant page.
// חדש (גל עיצוב 1): מצבי טעינה, מסעדה חסרה, וכשל טעינה בדף המסעדה.
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
    <Link to={to} state={state} className="kr-back kr-details-back">
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
    <div className="kr-details">
      <DetailsBackLink to={to} state={state} />
      <p className="kr-details-hero kr-details-loading" role="status">
        <span className="kr-spinner" aria-hidden="true" />
        {t('details.loading')}
      </p>
    </div>
  );
}

export function DetailsNotFound({ to, state }: BackLinkProps) {
  const { t } = useTranslation();

  return (
    <div className="kr-details">
      <section className="kr-details-hero kr-details-state">
        <h1 className="kr-details-title">{t('details.notFoundTitle')}</h1>
        <p className="kr-details-hero-copy">{t('details.notFoundBody')}</p>
        <Link to={to} state={state} className="kr-details-command">
          {t('details.back')}
        </Link>
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
    <div className="kr-details">
      <section className="kr-details-sheet kr-details-state">
        <FormAlert message={message} />
        <div className="kr-details-state-actions">
          <button type="button" className="kr-details-solid" onClick={onRetry}>
            {t('common.tryAgain')}
          </button>
          <DetailsBackLink to={to} state={state} />
        </div>
      </section>
    </div>
  );
}
