// Compact map notices. Errors stay on the map; quiet notes stay under it.
import { useTranslation } from 'react-i18next';

interface MapNoticeProps {
  tooWide: boolean;
  error: string;
  capped: boolean;
  showEmpty: boolean;
  showRadius: boolean;
  onRetry: () => void;
}

export function MapOverlayNotices({ tooWide, error, capped, showEmpty, onRetry }: Omit<MapNoticeProps, 'showRadius'>) {
  const { t } = useTranslation();

  if (!tooWide && error === '' && !capped && !showEmpty) {
    return null;
  }

  return (
    <div className="kr-v2-map-toasts">
      {tooWide && (
        <p role="status" className="kr-v2-map-toast kr-v2-map-toast-warn">
          {t('map.zoomIn')}
        </p>
      )}
      {error !== '' && (
        <div role="alert" className="kr-v2-map-toast kr-v2-map-toast-error">
          <p className="kr-v2-map-toast-text">{error}</p>
          <button type="button" onClick={onRetry} className="kr-v2-map-retry">
            {t('common.tryAgain')}
          </button>
        </div>
      )}
      {capped && (
        <p role="status" className="kr-v2-map-toast kr-v2-map-toast-warn">
          {t('map.capped')}
        </p>
      )}
      {showEmpty && <p className="kr-v2-map-toast">{t('map.empty')}</p>}
    </div>
  );
}

export function MapFootnotes({ showRadius }: { showRadius: boolean }) {
  const { t } = useTranslation();

  return (
    <div className="kr-v2-map-footnotes">
      {showRadius && <p className="kr-v2-map-footnote">{t('map.radius')}</p>}
      <p className="kr-v2-map-footnote">{t('map.note')}</p>
    </div>
  );
}
