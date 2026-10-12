import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { createMemoryRouter, RouterProvider, useLocation, useNavigate } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DRAFT_COMMIT_DELAY_MS, useSearchCriteria } from './useSearchCriteria';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

vi.mock('../api/placesApi', () => ({
  geocodePlace: vi.fn().mockResolvedValue({ available: false, place: null, reason: 'not_found' }),
}));

function Probe() {
  const criteria = useSearchCriteria();
  const location = useLocation();
  const navigate = useNavigate();
  const remembered = location.state as { searchLocation?: { lat?: number; source?: string } } | null;

  return (
    <div>
      <input aria-label="draft" value={criteria.draftQuery} onChange={(event) => criteria.setDraftQuery(event.target.value)} />
      <button type="button" onClick={() => criteria.setDraftQuery('pizz')}>
        type-partial
      </button>
      <button type="button" onClick={() => criteria.setDraftQuery('  pizza  ')}>
        type-pizza
      </button>
      <button type="button" onClick={() => criteria.setDraftQuery('falafel')}>
        type-falafel
      </button>
      <button type="button" onClick={() => criteria.setDraftQuery(' ')}>
        type-space
      </button>
      <button type="button" onClick={() => criteria.commitDraftQuery()}>
        commit
      </button>
      <button type="button" onClick={() => criteria.updateFilters({ foodType: ['MEAT'] })}>
        meat
      </button>
      <button type="button" onClick={() => criteria.pickLocation({ source: 'device', label: '', latitude: 31.7, longitude: 35.2 })}>
        device
      </button>
      <button type="button" onClick={() => navigate('/?q=%D7%A4%D7%99%D7%A6%D7%94&foodType=DAIRY')}>
        external
      </button>
      <button type="button" onClick={() => navigate(-1)}>
        back
      </button>
      <button type="button" onClick={() => navigate(1)}>
        forward
      </button>
      <p data-testid="url">{`${location.pathname}${location.search}`}</p>
      <p data-testid="food">{criteria.applied.foodType.join(',')}</p>
      <p data-testid="source">{criteria.locationSource ?? ''}</p>
      <p data-testid="lat">{remembered?.searchLocation?.lat ?? ''}</p>
    </div>
  );
}

const mounted: Array<{ root: Root; container: HTMLDivElement }> = [];

const renderProbe = () => {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  const router = createMemoryRouter([{ path: '*', element: <Probe /> }], { initialEntries: ['/'] });

  act(() => {
    root.render(<RouterProvider router={router} />);
  });

  mounted.push({ root, container });
  return container;
};

const text = (container: HTMLElement, selector: string) => container.querySelector(selector)?.textContent ?? '';

const click = (container: HTMLElement, name: string) => {
  const button = [...container.querySelectorAll('button')].find((item) => item.textContent === name);

  act(() => {
    button?.click();
  });
};

afterEach(() => {
  for (const item of mounted) {
    act(() => item.root.unmount());
    item.container.remove();
  }

  mounted.length = 0;
  sessionStorage.clear();
});

describe('useSearchCriteria', () => {
  it('clears the field when a whitespace-only query is committed', () => {
    const container = renderProbe();
    click(container, 'type-space');
    click(container, 'commit');

    expect((container.querySelector('input') as HTMLInputElement).value).toBe('');
    expect(text(container, '[data-testid="url"]')).toBe('/');
  });

  it('keeps draft text out of the URL until it is committed', () => {
    const container = renderProbe();
    click(container, 'type-partial');

    expect((container.querySelector('input') as HTMLInputElement).value).toBe('pizz');
    expect(text(container, '[data-testid="url"]')).toBe('/');
  });

  it('applies the latest draft together with a filter and can navigate back', () => {
    const container = renderProbe();
    click(container, 'type-pizza');
    click(container, 'commit');
    click(container, 'type-falafel');
    click(container, 'meat');

    expect(text(container, '[data-testid="url"]')).toBe('/?q=falafel&foodType=MEAT');
    expect((container.querySelector('input') as HTMLInputElement).value).toBe('falafel');

    click(container, 'back');

    expect(text(container, '[data-testid="url"]')).toBe('/?q=pizza');
    expect((container.querySelector('input') as HTMLInputElement).value).toBe('pizza');
    expect(text(container, '[data-testid="food"]')).toBe('');

    click(container, 'forward');

    expect(text(container, '[data-testid="url"]')).toBe('/?q=falafel&foodType=MEAT');
    expect((container.querySelector('input') as HTMLInputElement).value).toBe('falafel');
  });

  it('updates the field when navigation changes the applied query', () => {
    const container = renderProbe();
    click(container, 'type-partial');
    click(container, 'external');

    expect((container.querySelector('input') as HTMLInputElement).value).toBe('פיצה');
    expect(text(container, '[data-testid="food"]')).toBe('DAIRY');
    expect(text(container, '[data-testid="url"]')).toBe('/?q=%D7%A4%D7%99%D7%A6%D7%94&foodType=DAIRY');
  });

  it('commits typed text after a short pause', () => {
    vi.useFakeTimers();

    try {
      const container = renderProbe();
      click(container, 'type-pizza');

      expect(text(container, '[data-testid="url"]')).toBe('/');
      expect((container.querySelector('input') as HTMLInputElement).value).toBe('  pizza  ');

      act(() => {
        vi.advanceTimersByTime(DRAFT_COMMIT_DELAY_MS - 1);
      });

      expect(text(container, '[data-testid="url"]')).toBe('/');

      act(() => {
        vi.advanceTimersByTime(1);
      });

      expect(text(container, '[data-testid="url"]')).toBe('/?q=pizza');
      expect((container.querySelector('input') as HTMLInputElement).value).toBe('  pizza  ');
    } finally {
      vi.useRealTimers();
    }
  });

  it('flushes a pending draft with a filter and does not clear the box when the timer is cancelled', () => {
    vi.useFakeTimers();

    try {
      const container = renderProbe();
      click(container, 'type-pizza');
      click(container, 'meat');

      expect(text(container, '[data-testid="url"]')).toBe('/?q=pizza&foodType=MEAT');
      expect((container.querySelector('input') as HTMLInputElement).value).toBe('pizza');

      act(() => {
        vi.advanceTimersByTime(DRAFT_COMMIT_DELAY_MS);
      });

      expect(text(container, '[data-testid="url"]')).toBe('/?q=pizza&foodType=MEAT');
      expect((container.querySelector('input') as HTMLInputElement).value).toBe('pizza');
    } finally {
      vi.useRealTimers();
    }
  });

  it('keeps device coordinates out of the URL', () => {
    const container = renderProbe();
    click(container, 'device');

    expect(text(container, '[data-testid="url"]')).toBe('/');
    expect(text(container, '[data-testid="url"]')).not.toContain('31.7');
    expect(text(container, '[data-testid="source"]')).toBe('device');
    expect(text(container, '[data-testid="lat"]')).toBe('31.7');
  });
});
