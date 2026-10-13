// Status text under the map. Errors stay visible; warnings stay warnings.
// טקסט מצב מתחת למפה. שגיאות נשארות גלויות, ואזהרות נשארות אזהרות.
import { useTranslation } from 'react-i18next';

interface MapNoticesProps {
  tooWide: boolean;
  error: string;
  capped: boolean;
  showEmpty: boolean;
  showRadius: boolean;
  onRetry: () => void;
}

function MapNotices({ tooWide, error, capped, showEmpty, showRadius, onRetry }: MapNoticesProps) {
  const { t } = useTranslation();

  return (
    <div className="kr-map-notices">
      {tooWide && (
        <p role="status" className="kr-map-notice kr-map-notice-warn">
          {t('map.zoomIn')}
        </p>
      )}
      {error !== '' && (
        <p role="alert" className="kr-map-notice kr-map-notice-error">
          {error}{' '}
          <button type="button" onClick={onRetry} className="kr-map-retry">
            {t('common.tryAgain')}
          </button>
        </p>
      )}
      {capped && (
        <p role="status" className="kr-map-notice kr-map-notice-warn">
          {t('map.capped')}
        </p>
      )}
      {showEmpty && <p className="kr-map-notice kr-map-notice-empty">{t('map.empty')}</p>}
      {showRadius && <p className="kr-map-note">{t('map.radius')}</p>}
      <p className="kr-map-note">{t('map.note')}</p>
    </div>
  );
}

export default MapNotices;
