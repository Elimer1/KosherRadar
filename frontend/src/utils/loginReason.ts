// NEW (UX WP2): which sentence to show when login was opened for a page inside this site.
// The path has already been checked with safeReturnPath.
// חדש (חבילת UX 2): איזה משפט להציג כשדף הכניסה נפתח בגלל דף בתוך האתר.

const REASON_KEYS = [
  'auth.needRestaurant',
  'auth.needCertificate',
  'auth.needReport',
  'auth.needAccount',
  'auth.needAdmin',
  'auth.needContinue',
] as const;

export type LoginReasonKey = (typeof REASON_KEYS)[number];

const pathOnly = (path: string) => path.split('?')[0] ?? path;

export const loginReasonKey = (path: string): LoginReasonKey | null => {
  if (path === '/' || path === '') {
    return null;
  }

  const pathname = pathOnly(path);

  if (pathname === '/submit-restaurant') {
    return 'auth.needRestaurant';
  }

  if (/^\/restaurants\/[^/]+\/add-teuda$/.test(pathname)) {
    return 'auth.needCertificate';
  }

  if (/^\/restaurants\/[^/]+\/report$/.test(pathname)) {
    return 'auth.needReport';
  }

  if (pathname === '/account') {
    return 'auth.needAccount';
  }

  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    return 'auth.needAdmin';
  }

  return 'auth.needContinue';
};
