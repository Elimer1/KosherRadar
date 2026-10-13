import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { discoveryCopy } from './discoveryCopy';

interface DiscoveryMethodsProps {
  onSearchByName: () => void;
  onExploreArea: () => void;
  onNearMe: () => void;
}

function Icon({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7">
      {children}
    </svg>
  );
}

function DiscoveryMethods({ onSearchByName, onExploreArea, onNearMe }: DiscoveryMethodsProps) {
  const { t } = useTranslation();
  const copy = discoveryCopy();
  const actions = [onSearchByName, onExploreArea, onNearMe];

  return (
    <ul className="v2-methods" aria-label={t('search.form')}>
      {copy.methods.map((method, index) => (
        <li key={method.title}>
          <button type="button" className="v2-method" onClick={actions[index]}>
            <span className="v2-method-icon">
              {index === 0 && (
                <Icon>
                  <circle cx="11" cy="11" r="6" />
                  <path d="M15.5 15.5 20 20" />
                </Icon>
              )}
              {index === 1 && (
                <Icon>
                  <path d="M12 21s6-5.2 6-10a6 6 0 1 0-12 0c0 4.8 6 10 6 10z" />
                  <circle cx="12" cy="11" r="1.8" />
                </Icon>
              )}
              {index === 2 && (
                <Icon>
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 3v2.2M12 18.8V21M3 12h2.2M18.8 12H21" />
                </Icon>
              )}
            </span>
            <span>
              <span className="v2-method-title">{method.title}</span>
              <span className="v2-method-body">{method.body}</span>
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}

export default DiscoveryMethods;
