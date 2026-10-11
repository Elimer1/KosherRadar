// NEW (Milestone 3): the admin moderation dashboard with its five tabs (spec section 6).
// חדש (אבן דרך 3): לוח הניהול עם חמש הלשוניות שלו (סעיף 6 במסמך האפיון).
import { useState } from 'react';
import ExpiringSoonTab from '../components/admin/ExpiringSoonTab';
import ManageRestaurantsTab from '../components/admin/ManageRestaurantsTab';
import PendingReportsTab from '../components/admin/PendingReportsTab';
import PendingRestaurantsTab from '../components/admin/PendingRestaurantsTab';
import PendingTeudotTab from '../components/admin/PendingTeudotTab';
import FormAlert from '../components/FormAlert';
import { useFormOptions } from '../hooks/useFormOptions';

const TABS = [
  { id: 'restaurants', label: 'Pending Restaurants' },
  { id: 'teudot', label: 'Pending Teudot' },
  { id: 'reports', label: 'Pending Reports' },
  { id: 'expiring', label: 'Expiring Soon' },
  { id: 'manage', label: 'Manage Restaurants' },
] as const;

type TabId = (typeof TABS)[number]['id'];

function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<TabId>('restaurants');
  // The hechsher names for the screens come from the same list the forms use.
  const { options, error } = useFormOptions();

  if (error) {
    return <FormAlert message={error} />;
  }

  if (!options) {
    return <p className="text-gray-600">Loading...</p>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Admin dashboard</h1>

      <div role="tablist" aria-label="Admin sections" className="flex flex-wrap gap-2 border-b border-green-100 pb-2">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            id={`tab-${tab.id}`}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`panel-${tab.id}`}
            onClick={() => setActiveTab(tab.id)}
            className={
              activeTab === tab.id
                ? 'rounded bg-green-600 px-3 py-1.5 text-sm font-medium text-white'
                : 'rounded border border-green-200 px-3 py-1.5 text-sm font-medium text-green-800 hover:bg-green-50'
            }
          >
            {tab.label}
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
