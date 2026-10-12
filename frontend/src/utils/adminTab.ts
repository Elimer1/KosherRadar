// NEW (UX WP2): the admin queue lives in the address so Back can reopen the same tab.
// חדש (חבילת UX 2): תור הניהול נמצא בכתובת כדי שחזרה תפתח את אותה לשונית.

export const ADMIN_TABS = ['restaurants', 'teudot', 'reports', 'expiring', 'manage'] as const;

export type AdminTabId = (typeof ADMIN_TABS)[number];

const isAdminTab = (value: string): value is AdminTabId => {
  return (ADMIN_TABS as readonly string[]).includes(value);
};

export const parseAdminTab = (value: unknown): AdminTabId => {
  return typeof value === 'string' && isAdminTab(value) ? value : 'restaurants';
};

export const adminTabPath = (tab: AdminTabId) => {
  return tab === 'restaurants' ? '/admin' : `/admin?tab=${tab}`;
};

export const adminTabFromState = (state: unknown): AdminTabId => {
  if (!state || typeof state !== 'object' || !('adminTab' in state)) {
    return 'restaurants';
  }

  return parseAdminTab((state as { adminTab?: unknown }).adminTab);
};
