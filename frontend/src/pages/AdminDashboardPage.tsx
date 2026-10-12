// NEW (Milestone 3): the admin moderation dashboard with its five tabs (spec section 6).
// חדש (אבן דרך 3): לוח הניהול עם חמש הלשוניות שלו (סעיף 6 במסמך האפיון).
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import ExpiringSoonTab from '../components/admin/ExpiringSoonTab';
import ManageRestaurantsTab from '../components/admin/ManageRestaurantsTab';
import PendingReportsTab from '../components/admin/PendingReportsTab';
import PendingRestaurantsTab from '../components/admin/PendingRestaurantsTab';
import PendingTeudotTab from '../components/admin/PendingTeudotTab';
import FormAlert from '../components/FormAlert';
import { useFormOptions } from '../hooks/useFormOptions';
import { parseAdminTab, type AdminTabId } from '../utils/adminTab';

const TABS = [
  { id: 'restaurants', labelKey: 'admin.tabRestaurants' },
  { id: 'teudot', labelKey: 'admin.tabTeudot' },
  { id: 'reports', labelKey: 'admin.tabReports' },
  { id: 'expiring', labelKey: 'admin.tabExpiring' },
  { id: 'manage', labelKey: 'admin.tabManage' },
] as const;

function AdminDashboardPage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const rawTab = searchParams.get('tab');
  const activeTab = parseAdminTab(rawTab);

  useEffect(() => {
    if (rawTab !== null && rawTab !== activeTab) {
      setSearchParams({}, { replace: true });
    }
  }, [activeTab, rawTab, setSearchParams]);

  const selectTab = (tab: AdminTabId) => {
    setSearchParams(tab === 'restaurants' ? {} : { tab });
  };
  // The hechsher names for the screens come from the same list the forms use.
  const { options, error } = useFormOptions();

  if (error) {
    return <FormAlert message={error} />;
  }

  if (!options) {
    return <p className="text-gray-600">{t('admin.loading')}</p>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">{t('admin.title')}</h1>

      <div role="tablist" aria-label={t('admin.sections')} className="flex flex-wrap gap-2 border-b border-green-100 pb-2">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            id={`tab-${tab.id}`}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`panel-${tab.id}`}
            onClick={() => selectTab(tab.id)}
            className={
              activeTab === tab.id
                ? 'rounded bg-green-600 px-3 py-1.5 text-sm font-medium text-white'
                : 'rounded border border-green-200 px-3 py-1.5 text-sm font-medium text-green-800 hover:bg-green-50'
            }
          >
            {t(tab.labelKey)}
          </button>
        ))}
      </div>

      <div id={`panel-${activeTab}`} role="tabpanel" aria-labelledby={`tab-${activeTab}`}>
        {activeTab === 'restaurants' && <PendingRestaurantsTab hechsherOptions={options.hechsherOptions} />}
        {activeTab === 'teudot' && <PendingTeudotTab hechsherOptions={options.hechsherOptions} />}
        {activeTab === 'reports' && <PendingReportsTab hechsherOptions={options.hechsherOptions} />}
        {activeTab === 'expiring' && <ExpiringSoonTab hechsherOptions={options.hechsherOptions} />}
        {activeTab === 'manage' && <ManageRestaurantsTab />}
      </div>
    </div>
  );
}

export default AdminDashboardPage;
