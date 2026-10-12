import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

function NotFoundPage() {
  const { t } = useTranslation();

  return (
    <div className="py-12 text-center">
      <h1 className="text-2xl font-bold text-gray-900">{t('notFound.title')}</h1>
      <p className="mt-2 text-gray-600">{t('notFound.body')}</p>
      <Link to="/" className="mt-4 inline-block font-medium text-green-700 hover:underline">
        {t('common.backHome')}
      </Link>
    </div>
  );
}

export default NotFoundPage;
