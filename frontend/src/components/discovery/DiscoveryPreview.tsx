import { useTranslation } from 'react-i18next';
import { discoveryCopy } from './discoveryCopy';

function DiscoveryPreview() {
  const { t } = useTranslation();
  const copy = discoveryCopy();

  return (
    <aside className="v2-preview" aria-hidden="true">
      <p className="v2-preview-kicker">{t('search.form')}</p>
      <ol>
        {copy.methods.map((method, index) => (
          <li key={method.title}>
            <span>{String(index + 1).padStart(2, '0')}</span>
            <span>{method.title}</span>
          </li>
        ))}
      </ol>
    </aside>
  );
}

export default DiscoveryPreview;
