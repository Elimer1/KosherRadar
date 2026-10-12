import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { primaryButtonCompactClassName } from '../components/formStyles';

function NotFoundPage() {
  const { t } = useTranslation();

  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-soft bg-white px-6 py-12 text-center shadow-[0_8px_24px_rgba(23,75,58,0.06)]">
      <h1 className="text-2xl font-semibold tracking-tight text-ink">{t('notFound.title')}</h1>
      <p className="mt-2 text-muted">{t('notFound.body')}</p>
      <Link to="/" className={`${primaryButtonCompactClassName} mt-5`}>
        {t('common.backHome')}
      </Link>
    </div>
  );
}

export default NotFoundPage;
