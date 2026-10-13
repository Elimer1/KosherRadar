import { AxiosError } from 'axios';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { createMemoryRouter, RouterProvider, useLocation } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import i18n from '../i18n';
import RestaurantDetailsPage from './RestaurantDetailsPage';
import type { RestaurantDetails } from '../types/restaurantDetails';
import { applyDocumentLanguage } from '../utils/language';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const getRestaurantDetails = vi.fn();
const getFormOptions = vi.fn();

vi.mock('../api/restaurantDetailsApi', () => ({
  getRestaurantDetails: (...args: unknown[]) => getRestaurantDetails(...args),
}));

vi.mock('../api/optionsApi', () => ({
  getFormOptions: (...args: unknown[]) => getFormOptions(...args),
}));

const ID = '507f1f77bcf86cd799439011';

const options = {
  hechsherOptions: [
    { value: 'RABBINATE', labelEn: 'Local Rabbinate', labelHe: 'רבנות מקומית' },
    { value: 'OTHER', labelEn: 'Other', labelHe: 'אחר' },
  ],
  hechsherOtherValue: 'OTHER',
  kashrutLevels: ['RABBANUT', 'MEHADRIN'],
  foodTypes: ['DAIRY'],
  categories: ['CAFE'],
  maxImageBytes: 5_000_000,
};

function sample(overrides: Partial<RestaurantDetails> = {}): RestaurantDetails {
  return {
    id: ID,
    name: 'Cafe Galil',
    nameHe: 'קפה גליל',
    nameEn: 'Cafe Galil',
    address: '12 Herzl',
    addressHe: null,
    addressEn: null,
    city: 'Tiberias',
    latitude: 32.79,
    longitude: 35.53,
    phone: '04-555-0101',
    website: 'https://cafe.example',
    foodType: 'DAIRY',
    categories: ['CAFE'],
    foodKeywords: ['coffee', 'קפה'],
    kosharotUrl: 'https://kosharot.example/place',
    kashrut: {
      status: 'VERIFIED',
      primary: {
        kind: 'VERIFIED',
        hechsher: 'RABBINATE',
        hechsherOther: null,
        kashrutLevel: 'MEHADRIN',
        expirationDate: '2026-12-01',
      },
      moreCount: 1,
      hasRecentExpired: true,
      items: [
        {
          kind: 'UNVERIFIED',
          teudaId: null,
          hechsher: 'OTHER',
          hechsherOther: 'A very long supervising authority name that must stay readable',
          kashrutLevel: 'RABBANUT',
          expirationDate: null,
        },
      ],
    },
    teudot: [
      {
        id: 'teuda-current',
        hechsher: 'RABBINATE',
        hechsherOther: null,
        kashrutLevel: 'MEHADRIN',
        expirationDate: '2026-12-01',
        visibility: 'VALID',
        photoUrl: 'https://cdn.example/cert.jpg',
        mashgiachName: 'Ruth Levi',
        mashgiachPhone: '052-111-2233',
      },
      {
        id: 'teuda-expired',
        hechsher: 'RABBINATE',
        hechsherOther: null,
        kashrutLevel: 'RABBANUT',
        expirationDate: '2026-04-01',
        visibility: 'RECENT_EXPIRED',
        photoUrl: 'javascript:alert(1)',
        mashgiachName: '   ',
        mashgiachPhone: null,
      },
    ],
    ...overrides,
  };
}

function Landed() {
  const location = useLocation();
  const state = location.state as { searchLocation?: { label?: string } } | null;
  return <p data-testid="landed">{`${location.pathname}${location.search}|${state?.searchLocation?.label ?? ''}`}</p>;
}

const mounted: Array<{ root: Root; container: HTMLDivElement }> = [];

function mount(pathname: string, state?: unknown) {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  mounted.push({ root, container });
  const router = createMemoryRouter(
    [
      { path: '/restaurants/:restaurantId', element: <RestaurantDetailsPage /> },
      { path: '/', element: <Landed /> },
    ],
    { initialEntries: [{ pathname, state }] }
  );

  return { container, root, router };
}

async function show(pathname: string, state?: unknown) {
  const view = mount(pathname, state);
  await act(async () => {
    view.root.render(<RouterProvider router={view.router} />);
  });
  return view;
}

describe('RestaurantDetailsPage', () => {
  beforeEach(async () => {
    sessionStorage.clear();
    await i18n.changeLanguage('en');
    applyDocumentLanguage('en');
    getRestaurantDetails.mockReset();
    getFormOptions.mockReset();
    getFormOptions.mockResolvedValue(options);
  });

  afterEach(async () => {
    for (const item of mounted) {
      act(() => {
        item.root.unmount();
      });
      item.container.remove();
    }

    mounted.length = 0;
    sessionStorage.clear();
    await i18n.changeLanguage('en');
    applyDocumentLanguage('en');
  });

  it('shows a loading state and keeps the return path before the restaurant arrives', async () => {
    getRestaurantDetails.mockReturnValue(new Promise(() => undefined));
    const { container } = await show(`/restaurants/${ID}`, { from: '/?q=pizza' });

    expect(container.textContent).toContain('Loading...');
    expect(container.textContent).not.toContain('Cafe Galil');
    expect(container.querySelector('a')?.getAttribute('href')).toBe('/?q=pizza');
  });

  it('shows a not-found page for a missing or invalid restaurant', async () => {
    getRestaurantDetails.mockRejectedValue(new AxiosError('missing', '404', undefined, undefined, response(404)));
    const missing = await show(`/restaurants/${ID}`);
    expect(missing.container.textContent).toContain('Restaurant not found');
    expect(missing.container.textContent).not.toContain('Could not load this restaurant.');

    getRestaurantDetails.mockRejectedValue(new AxiosError('bad', '400', undefined, undefined, response(400)));
    const invalid = await show('/restaurants/not-an-id');
    expect(invalid.container.textContent).toContain('Restaurant not found');
  });

  it('shows a network or server failure and can try the same restaurant again', async () => {
    getRestaurantDetails.mockRejectedValueOnce(new AxiosError('offline'));
    getRestaurantDetails.mockResolvedValueOnce(sample());
    const { container } = await show(`/restaurants/${ID}`);

    expect(container.textContent).toContain('Cannot reach the server. Check your connection and try again.');
    expect(container.querySelector('[role="alert"]')).not.toBeNull();

    await act(async () => {
      [...container.querySelectorAll('button')].find((button) => button.textContent === 'Try again')?.click();
    });

    expect(container.textContent).toContain('Cafe Galil');
    expect(getRestaurantDetails).toHaveBeenCalledTimes(2);
  });

  it('returns to the originating search and restores the remembered location', async () => {
    getRestaurantDetails.mockResolvedValue(sample());
    const { container } = await show(`/restaurants/${ID}`, {
      from: '/?q=pizza',
      searchLocation: { source: 'named', label: 'Tiberias', lat: 32.79, lng: 35.53, radiusKm: null },
    });

    await act(async () => {
      container.querySelector('a.kr-details-back')?.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    });

    expect(container.querySelector('[data-testid="landed"]')?.textContent).toBe('/?q=pizza|Tiberias');
  });

  it('separates current certificates, expired certificates, and unverified claims', async () => {
    getRestaurantDetails.mockResolvedValue(sample());
    const { container } = await show(`/restaurants/${ID}`);

    expect(document.title).toBe('Cafe Galil - KosherRadar');
    expect(container.querySelector('h1')?.getAttribute('dir')).toBe('auto');
    expect(container.querySelector('h1')?.textContent).toBe('Cafe Galil');
    expect(container.textContent).toContain('קפה גליל');
    expect(container.querySelector('.kr-details-place')?.textContent).toBe('12 Herzl, Tiberias');
    expect(container.textContent).toContain('Dairy');
    expect(container.textContent).toContain('Cafe');
    expect(container.textContent).toContain('Serves: coffee, קפה');
    expect(container.textContent).toContain('Also has an EXPIRED certificate.');

    const current = container.querySelector('.kr-details-certificate--current');
    const expired = container.querySelector('.kr-details-certificate--expired');
    const claim = container.querySelector('[data-evidence="claim"]');

    expect(current?.textContent).toContain('Verified certificate');
    expect(current?.textContent).toContain('Local Rabbinate');
    expect(current?.textContent).toContain('Mehadrin');
    expect(current?.textContent).toContain('Valid until 1 Dec 2026');
    expect(current?.textContent).toContain('Mashgiach: Ruth Levi');
    expect(current?.textContent).not.toContain('Expired on');
    expect(current?.querySelector('a[href="https://cdn.example/cert.jpg"]')?.getAttribute('rel')).toBe('noopener noreferrer');
    expect(current?.querySelector('a[href="tel:0521112233"]')).not.toBeNull();

    expect(expired?.textContent).toContain('EXPIRED certificate');
    expect(expired?.textContent).toContain('Expired on 1 Apr 2026');
    expect(expired?.textContent).toContain('Rabbanut');
    expect(expired?.textContent).not.toContain('Valid until');
    expect(expired?.textContent).not.toContain('Ruth Levi');
    expect(expired?.textContent).not.toContain('View the certificate photo');

    expect(claim?.textContent).toContain('Unverified claim');
    expect(claim?.textContent).toContain('A very long supervising authority name that must stay readable');
    expect(claim?.textContent).toContain('No certificate has been checked for this.');
    expect(claim?.closest('.kr-details-certificate')).toBeNull();
    expect(container.querySelector('a[href^="javascript:"]')).toBeNull();
    expect(container.querySelectorAll('[data-evidence="certificate"]')).toHaveLength(2);
  });

  it('does not present expired or unverified evidence as a current certificate', async () => {
    getRestaurantDetails.mockResolvedValueOnce(
      sample({
        kashrut: {
          status: 'EXPIRED',
          primary: {
            kind: 'EXPIRED',
            hechsher: 'RABBINATE',
            hechsherOther: null,
            kashrutLevel: 'RABBANUT',
            expirationDate: '2026-04-01',
          },
          moreCount: 0,
          hasRecentExpired: true,
          items: [],
        },
        teudot: [sample().teudot[1]],
      })
    );
    const expired = await show(`/restaurants/${ID}`);
    const overview = expired.container.querySelector('.kr-details-overview-facts--expired');
    expect(overview?.textContent).toContain('Expired on 1 Apr 2026');
    expect(overview?.textContent).not.toContain('Valid until');
    expect(expired.container.textContent).toContain('EXPIRED certificate');

    getRestaurantDetails.mockResolvedValueOnce(
      sample({
        kashrut: {
          status: 'UNVERIFIED',
          primary: {
            kind: 'UNVERIFIED',
            hechsher: 'OTHER',
            hechsherOther: 'Neighborhood mashgiach',
            kashrutLevel: null,
            expirationDate: null,
          },
          moreCount: 0,
          hasRecentExpired: false,
          items: [
            {
              kind: 'UNVERIFIED',
              teudaId: null,
              hechsher: 'OTHER',
              hechsherOther: 'Neighborhood mashgiach',
              kashrutLevel: null,
              expirationDate: null,
            },
          ],
        },
        teudot: [],
      })
    );
    const claimOnly = await show(`/restaurants/${ID}`);
    expect(claimOnly.container.querySelector('[data-evidence="certificate"]')).toBeNull();
    expect(claimOnly.container.querySelector('[data-evidence="claim"] .kr-v2-details-status')).toBeNull();
    expect(claimOnly.container.querySelector('.kr-details-facts')).toBeNull();
    expect(claimOnly.container.textContent).toContain('Unverified claim (no certificate)');
    expect(claimOnly.container.textContent).toContain('Neighborhood mashgiach');
    expect(claimOnly.container.textContent).not.toContain('Verified certificate');
    expect(claimOnly.container.textContent).not.toContain('Valid until');
  });

  it('keeps contact, map, share, report, and certificate links that the data supports', async () => {
    getRestaurantDetails.mockResolvedValue(sample());
    const { container } = await show(`/restaurants/${ID}`);
    const hrefs = [...container.querySelectorAll('a')].map((anchor) => anchor.getAttribute('href'));

    expect(hrefs).toContain('tel:045550101');
    expect(hrefs).toContain('https://cafe.example');
    expect(hrefs).toContain('https://kosharot.example/place');
    expect(hrefs).toContain(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent('Cafe Galil 12 Herzl, Tiberias')}`);
    expect(hrefs).toContain('https://waze.com/ul?ll=32.79,35.53&navigate=yes');
    expect(hrefs).toContain(`/restaurants/${ID}/add-teuda`);
    expect(hrefs).toContain(`/restaurants/${ID}/report`);
    expect(container.querySelector('button')?.textContent).toBe('Share');
    expect(container.textContent).toContain('You need an account to send a certificate or a report.');
  });

  it('does not invent evidence, directions, or links when those fields are missing', async () => {
    getRestaurantDetails.mockResolvedValue(
      sample({
        name: 'Quiet Place',
        nameHe: null,
        nameEn: null,
        address: '1 Street, Haifa',
        city: 'Haifa',
        latitude: null,
        longitude: null,
        phone: null,
        website: 'javascript:alert(1)',
        foodType: null,
        categories: [],
        foodKeywords: [],
        kosharotUrl: 'notaurl',
        kashrut: {
          status: 'UNKNOWN',
          primary: null,
          moreCount: 0,
          hasRecentExpired: false,
          items: [],
        },
        teudot: [],
      })
    );
    const { container } = await show(`/restaurants/${ID}`);

    expect(container.querySelector('.kr-details-place')?.textContent).toBe('1 Street, Haifa');
    expect(container.textContent).toContain('Nobody has added a kashrut certificate or claim for this restaurant yet.');
    expect(container.textContent).not.toContain('Certificates');
    expect(container.textContent).not.toContain('Unverified claim');
    expect(container.textContent).not.toContain('Call');
    expect(container.textContent).not.toContain('Waze');
    expect(container.textContent).not.toContain('View on Kosharot');
    expect(container.querySelector('a[href^="javascript:"]')).toBeNull();
    expect(container.querySelector('a[href^="https://waze.com"]')).toBeNull();
    expect(container.querySelector('a[href^="https://www.google.com/maps"]')).not.toBeNull();
    expect(container.textContent).toContain('KosherRadar is not a kashrut authority.');
    expect(container.querySelector(`a[href="/restaurants/${ID}/add-teuda"]`)).not.toBeNull();
  });

  it('ignores a response for a restaurant the visitor already left', async () => {
    let resolveFirst: (value: RestaurantDetails) => void = () => undefined;
    const first = new Promise<RestaurantDetails>((resolve) => {
      resolveFirst = resolve;
    });
    getRestaurantDetails.mockImplementation((id: string) =>
      id === 'first-place' ? first : Promise.resolve(sample({ id, name: 'Second Place', nameEn: 'Second Place', nameHe: null }))
    );

    const { container, router } = await show('/restaurants/first-place');
    expect(container.textContent).toContain('Loading...');

    await act(async () => {
      await router.navigate('/restaurants/second-place');
    });
    expect(container.textContent).toContain('Second Place');

    await act(async () => {
      resolveFirst(sample({ id: 'first-place', name: 'First Place', nameEn: 'First Place', nameHe: null }));
    });

    expect(container.textContent).toContain('Second Place');
    expect(container.textContent).not.toContain('First Place');
  });

  it('follows the active language and document direction', async () => {
    getRestaurantDetails.mockResolvedValue(sample());
    const { container } = await show(`/restaurants/${ID}`);

    await act(async () => {
      await i18n.changeLanguage('he');
    });

    expect(document.documentElement.dir).toBe('rtl');
    expect(document.documentElement.lang).toBe('he');
    expect(container.querySelector('h1')?.textContent).toBe('קפה גליל');
    expect(container.textContent).toContain('Cafe Galil');
    expect(container.textContent).toContain('חזרה לחיפוש');
    expect(container.textContent).toContain('ניווט');
    expect(container.textContent).toContain('תעודה מאומתת');
    expect(container.textContent).toContain('תעודה שפג תוקפה');
    expect(container.textContent).toContain('טענה לא מאומתת');
    expect(container.textContent).toContain('רבנות מקומית');
    expect(container.querySelector('.kr-details-certificate--expired')?.textContent).toContain('פג ב-1 אפר׳ 2026');
    expect(container.querySelector('.kr-details-certificate--current')?.textContent).not.toContain('פג ב-');

    await act(async () => {
      await i18n.changeLanguage('en');
    });

    expect(document.documentElement.dir).toBe('ltr');
    expect(container.querySelector('h1')?.textContent).toBe('Cafe Galil');
    expect(container.textContent).toContain('Back to search');
  });

  // NEW (Visual v2): cover summary hierarchy, certificate ordering, fallback images, and keyboard navigation.
  // חדש (עיצוב 2): בדיקות סיכום, סדר תעודות, תמונות שלא נטענו וניווט מקלדת.
  it('keeps one short kashrut overview and the full record in the evidence list', async () => {
    getRestaurantDetails.mockResolvedValue(sample());
    const { container } = await show(`/restaurants/${ID}`);
    const overview = container.querySelector('[data-overview="VERIFIED"]');

    expect(container.querySelector('.kr-details-hero')).toBeNull();
    expect(container.querySelector('.kr-v2-details-title')?.textContent).toBe('Cafe Galil');
    expect(overview?.textContent).toContain('Verified certificate');
    expect(overview?.textContent).toContain('Local Rabbinate');
    expect(overview?.textContent).toContain('Valid until 1 Dec 2026');
    expect(overview?.textContent).toContain('+1 more');
    expect(overview?.textContent).not.toContain('Mashgiach');
    expect(overview?.querySelector('a')).toBeNull();
    expect(container.querySelector('.kr-v2-details-history')?.textContent).toContain('Also has an EXPIRED certificate.');
    expect(container.querySelector('.kr-details-certificate--current')?.textContent).toContain('Mashgiach: Ruth Levi');
    expect(container.querySelector('summary')?.textContent).toContain('Directions');

    const directions = container.querySelector('[data-directions]');
    expect(directions?.querySelector('a[href*="google.com/maps"]')).not.toBeNull();
    expect(directions?.querySelector('a[href*="waze.com"]')).not.toBeNull();
    expect(container.querySelector('button')?.textContent).toBe('Share');
  });

  it('lists a current certificate before an expired one when the payload is reversed', async () => {
    const reversed = sample();
    reversed.teudot = [reversed.teudot[1], reversed.teudot[0]];
    getRestaurantDetails.mockResolvedValue(reversed);
    const { container } = await show(`/restaurants/${ID}`);
    const records = [...container.querySelectorAll('[data-evidence="certificate"]')];

    expect(records.map((record) => record.getAttribute('data-visibility'))).toEqual(['VALID', 'RECENT_EXPIRED']);
    expect(container.querySelector('.kr-v2-details-record--claim')).not.toBeNull();
    expect(container.querySelector('.kr-v2-details-record--claim')?.textContent).toContain(
      'No certificate has been checked for this.'
    );
  });

  it('keeps the photo link when its preview fails and survives a language change', async () => {
    getRestaurantDetails.mockResolvedValue(sample());
    const { container } = await show(`/restaurants/${ID}`);
    await act(async () => {
      container.querySelector('img')?.dispatchEvent(new Event('error'));
    });
    expect(container.querySelector('img')).toBeNull();
    expect(container.querySelector('a[href="https://cdn.example/cert.jpg"]')).not.toBeNull();
    await act(async () => { await i18n.changeLanguage('he'); });
    expect(container.querySelector('a[href="https://cdn.example/cert.jpg"]')?.textContent).toContain(i18n.t('details.photo'));
    expect(container.querySelector('h1')?.textContent).toBe('קפה גליל');
  });

  it('starts directions collapsed and restores focus when Escape closes it', async () => {
    getRestaurantDetails.mockResolvedValue(sample());
    const { container } = await show(`/restaurants/${ID}`);
    const chooser = container.querySelector('details')!;
    expect(chooser.open).toBe(false);
    chooser.open = true;
    await act(async () => {
      chooser.querySelector('a')?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    });
    expect(chooser.open).toBe(false);
    expect(document.activeElement).toBe(chooser.querySelector('summary'));
  });
});

function response(status: number) {
  return {
    status,
    statusText: '',
    headers: {},
    config: {} as never,
    data: {},
  };
}
