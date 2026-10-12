import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { primaryButtonCompactClassName } from '../components/formStyles';

function NotFoundPage() {
  const { t } = useTranslation();

  return (
    <div className="mx-auto max-w-lg rounded-xl border border-gray-200 bg-white px-6 py-12 text-center shadow-sm">
      <h1 className="text-2xl font-bold text-gray-900">{t('notFound.title')}</h1>
      <p className="mt-2 text-gray-600">{t('notFound.body')}</p>
      <Link to="/" className={`${primaryButtonCompactClassName} mt-5`}>
        {t('common.backHome')}
      </Link>
    </div>
  );
}

export default NotFoundPage;
