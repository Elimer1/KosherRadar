import { act } from 'react';
import type { ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import i18n from '../i18n';
import KashrutBadge from './KashrutBadge';
import LocationField from './LocationField';
import SearchFiltersPanel from './SearchFiltersPanel';
import { emptySearchFilters } from '../types/search';
import type { KashrutPreview, KashrutStatus } from '../types/search';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const mounted: Array<{ root: Root; container: HTMLDivElement }> = [];

const render = (node: ReactNode) => {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);

  act(() => {
    root.render(node);
  });

  mounted.push({ root, container });
  return container;
};

afterEach(() => {
  while (mounted.length > 0) {
    const current = mounted.pop();

    if (!current) {
      break;
    }

    act(() => {
      current.root.unmount();
    });
    current.container.remove();
  }
});

const preview = (status: KashrutStatus): KashrutPreview => ({
  status,
  primary:
    status === 'UNKNOWN'
      ? null
      : {
          kind: status,
          hechsher: 'RABANUT',
          hechsherOther: null,
          kashrutLevel: 'MEHADRIN',
          expirationDate: status === 'EXPIRED' ? '2020-01-02' : '2027-06-01',
        },
  moreCount: status === 'VERIFIED' ? 1 : 0,
  hasRecentExpired: status === 'VERIFIED',
});

describe('discovery presentation', () => {
  it('keeps an unverified claim visually distinct from a verified certificate', async () => {
    await act(async () => {
      await i18n.changeLanguage('en');
    });

    const verified = render(<KashrutBadge kashrut={preview('VERIFIED')} hechsherOptions={[]} />);
    const unverified = render(<KashrutBadge kashrut={preview('UNVERIFIED')} hechsherOptions={[]} />);
    const expired = render(<KashrutBadge kashrut={preview('EXPIRED')} hechsherOptions={[]} />);
    const unknown = render(<KashrutBadge kashrut={preview('UNKNOWN')} hechsherOptions={[]} />);

    expect(verified.textContent).toContain('Verified certificate');
    expect(verified.textContent).toContain('Also has an EXPIRED certificate.');
    expect(unverified.textContent).toContain('Unverified claim (no certificate)');
    expect(expired.textContent).toContain('EXPIRED certificate');
    expect(unknown.textContent).toContain('Kashrut status unknown');

    const verifiedBox = verified.firstElementChild?.className ?? '';
    const unverifiedBox = unverified.firstElementChild?.className ?? '';
    expect(verifiedBox).not.toContain('border-dashed');
    expect(unverifiedBox).toContain('border-dashed');
    expect(unverifiedBox).toContain('amber');
    expect(verifiedBox).not.toContain('amber');
  });

  it('applies a filter immediately and does not add an Apply step', async () => {
    await act(async () => {
      await i18n.changeLanguage('en');
    });

    const onChange = vi.fn();
    const container = render(
      <SearchFiltersPanel filters={emptySearchFilters} options={null} onChange={onChange} />
    );

    expect([...container.querySelectorAll('button')].map((button) => button.textContent)).not.toContain('Apply');

    const hideExpired = [...container.querySelectorAll('label')].find((label) =>
      label.textContent?.includes('Hide restaurants')
    );
    const input = hideExpired?.querySelector('input');
    expect(input).toBeTruthy();

    act(() => {
      input?.click();
    });

    expect(onChange).toHaveBeenCalledWith({ ...emptySearchFilters, hideExpired: true });
  });

  it('does not request the device location until the visitor asks', async () => {
    await act(async () => {
      await i18n.changeLanguage('en');
    });

    const getCurrentPosition = vi.fn();
    const previous = navigator.geolocation;
    Object.defineProperty(navigator, 'geolocation', {
      configurable: true,
      value: { getCurrentPosition },
    });

    const container = render(
      <LocationField filters={emptySearchFilters} onPickLocation={() => undefined} onClearLocation={() => undefined} />
    );

    expect(getCurrentPosition).not.toHaveBeenCalled();

    const button = [...container.querySelectorAll('button')].find((item) => item.textContent === 'Use my current location');

    act(() => {
      button?.click();
    });

    expect(getCurrentPosition).toHaveBeenCalledTimes(1);

    Object.defineProperty(navigator, 'geolocation', {
      configurable: true,
      value: previous,
    });
  });
});
