// Renders a map popup from stored restaurant fields and the existing actions.
// מציג חלון מפה משדות המסעדה השמורים ומהפעולות הקיימות.
import { act, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import i18n from '../../i18n';
import type { RestaurantCardData } from '../../types/search';
import MapPopupCard from './MapPopupCard';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const restaurant: RestaurantCardData = {
  id: 'abc',
  name: 'Grill House',
  nameHe: 'בית הגריל',
  nameEn: 'Grill House',
  address: '12 Herzl',
  addressHe: null,
  addressEn: null,
  city: 'Tel Aviv',
  latitude: 32.07,
  longitude: 34.77,
  phone: '03-1234567',
  foodType: 'MEAT',
  categories: [],
  kashrut: {
    status: 'VERIFIED',
    primary: {
      kind: 'VERIFIED',
      hechsher: 'LOCAL',
      hechsherOther: null,
      kashrutLevel: 'MEHADRIN',
      expirationDate: '2026-12-01',
    },
    moreCount: 1,
    hasRecentExpired: false,
  },
  distanceKm: 1.2,
};

const renderCard = (node: ReactNode) => {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);

  act(() => {
    root.render(<MemoryRouter>{node}</MemoryRouter>);
  });

  return { container, root };
};

describe('MapPopupCard', () => {
  let root: Root | null = null;
  let container: HTMLDivElement | null = null;

  afterEach(async () => {
    act(() => {
      root?.unmount();
    });
    container?.remove();
    root = null;
    container = null;
    await i18n.changeLanguage('en');
  });

  it('shows the stored name, place, kashrut summary, and the existing actions', async () => {
    await i18n.changeLanguage('en');
    ({ container, root } = renderCard(
      <MapPopupCard
        restaurant={restaurant}
        hechsherOptions={[{ value: 'LOCAL', labelEn: 'Local Rabbinate', labelHe: 'רבנות מקומית' }]}
      />
    ));

    const text = container?.textContent ?? '';
    expect(text).toContain('Grill House');
    expect(text).toContain('בית הגריל');
    expect(text).toContain('12 Herzl, Tel Aviv');
    expect(text).toContain('Meat');
    expect(text).toContain('Verified certificate');
    expect(text).toContain('Local Rabbinate');
    expect(text).toContain('Mehadrin');
    expect(text).not.toMatch(/rating|stars|open now|photo/i);

    const details = container?.querySelector('a[href="/restaurants/abc"]');
    expect(details?.textContent).toContain('View details');
    expect(container?.querySelector('a[href="tel:031234567"]')).not.toBeNull();
    expect(container?.querySelector('a[href="https://waze.com/ul?ll=32.07,34.77&navigate=yes"]')).not.toBeNull();
    expect(container?.querySelector('button')?.textContent).toContain('Share');
  });

  it('opens the restaurant in place, and leaves a modified click for a new tab', () => {
    const onOpen = vi.fn();
    ({ container, root } = renderCard(
      <MapPopupCard restaurant={{ ...restaurant, phone: null }} hechsherOptions={[]} onOpenRestaurant={onOpen} />
    ));

    expect(container?.querySelector('a[href^="tel:"]')).toBeNull();

    const details = container?.querySelector('a[href="/restaurants/abc"]') as HTMLAnchorElement;
    const plain = new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 });
    act(() => {
      details.dispatchEvent(plain);
    });
    expect(plain.defaultPrevented).toBe(true);
    expect(onOpen).toHaveBeenCalledWith('abc', false);

    const modified = new MouseEvent('click', { bubbles: true, cancelable: true, button: 0, ctrlKey: true });
    act(() => {
      details.dispatchEvent(modified);
    });
    expect(modified.defaultPrevented).toBe(false);
    expect(onOpen).toHaveBeenCalledWith('abc', true);
  });

  it('uses the Hebrew name and kashrut wording when the interface is Hebrew', async () => {
    await i18n.changeLanguage('he');
    ({ container, root } = renderCard(<MapPopupCard restaurant={restaurant} hechsherOptions={[]} />));

    const title = container?.querySelector('.kr-map-popup-title');
    expect(title?.textContent).toBe('בית הגריל');
    expect(title?.getAttribute('dir')).toBe('auto');
    expect(container?.textContent).toContain('תעודה מאומתת');
    expect(container?.textContent).toContain('לפרטים');
  });
});
