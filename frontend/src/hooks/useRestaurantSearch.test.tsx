import axios from 'axios';
import { act, useState } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { emptySearchFilters, type SearchFilters } from '../types/search';
import { useRestaurantSearch } from './useRestaurantSearch';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const searchRestaurants = vi.fn();

vi.mock('../api/searchApi', () => ({
  searchRestaurants: (...args: unknown[]) => searchRestaurants(...args),
}));

const result = (page: number) => ({
  items: [],
  page,
  pageSize: 20,
  total: 40,
  hasMore: page < 2,
  capped: false,
  search: { mode: 'BASIC' as const, atlasUnavailable: false },
});

function Probe({ initial }: { initial: SearchFilters }) {
  const [filters, setFilters] = useState(initial);
  const search = useRestaurantSearch(filters, true);

  return (
    <div>
      <button type="button" onClick={() => setFilters({ ...filters, foodType: ['MEAT'] })}>
        change
      </button>
      <button type="button" onClick={() => void search.loadMore()}>
        more
      </button>
      <p data-testid="page">{search.page}</p>
      <p data-testid="error">{search.error}</p>
      <p data-testid="count">{search.items.length}</p>
    </div>
  );
}

const mounted: Array<{ root: Root; container: HTMLDivElement }> = [];

afterEach(() => {
  for (const item of mounted) {
    act(() => item.root.unmount());
    item.container.remove();
  }

  mounted.length = 0;
  searchRestaurants.mockReset();
});

describe('useRestaurantSearch pagination', () => {
  it('starts again at page 1 when the criteria change', async () => {
    searchRestaurants.mockImplementation(async (_filters: SearchFilters, page: number) => result(page));
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);
    mounted.push({ root, container });

    await act(async () => {
      root.render(<Probe initial={{ ...emptySearchFilters, q: 'pizza' }} />);
    });

    expect(searchRestaurants).toHaveBeenLastCalledWith(expect.objectContaining({ q: 'pizza' }), 1, expect.any(AbortSignal));

    await act(async () => {
      [...container.querySelectorAll('button')].find((button) => button.textContent === 'more')?.click();
    });

    expect(searchRestaurants).toHaveBeenLastCalledWith(expect.objectContaining({ q: 'pizza' }), 2, expect.any(AbortSignal));

    await act(async () => {
      [...container.querySelectorAll('button')].find((button) => button.textContent === 'change')?.click();
    });

    expect(searchRestaurants).toHaveBeenLastCalledWith(
      expect.objectContaining({ foodType: ['MEAT'] }),
      1,
      expect.any(AbortSignal)
    );
    expect(container.querySelector('[data-testid="page"]')?.textContent).toBe('1');
  });

  it('ignores a cancelled request and keeps the newer result', async () => {
    let calls = 0;

    searchRestaurants.mockImplementation((_filters: SearchFilters, _page: number, signal: AbortSignal) => {
      calls += 1;

      if (calls === 1) {
        return new Promise((_resolve, reject) => {
          signal.addEventListener('abort', () => {
            reject(new axios.CanceledError('canceled'));
          });
        });
      }

      return Promise.resolve({
        ...result(1),
        total: 1,
        hasMore: false,
        items: [{ id: 'kept' }],
      });
    });

    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);
    mounted.push({ root, container });

    await act(async () => {
      root.render(<Probe initial={{ ...emptySearchFilters, q: 'pizza' }} />);
    });

    await act(async () => {
      [...container.querySelectorAll('button')].find((button) => button.textContent === 'change')?.click();
    });

    expect(container.querySelector('[data-testid="error"]')?.textContent).toBe('');
    expect(container.querySelector('[data-testid="count"]')?.textContent).toBe('1');
    expect(container.querySelector('[data-testid="page"]')?.textContent).toBe('1');
  });

  it('shows the search rate-limit message for HTTP 429', async () => {
    searchRestaurants.mockRejectedValue(
      new axios.AxiosError('limited', 'ERR_BAD_REQUEST', undefined, undefined, {
        status: 429,
        statusText: 'Too Many Requests',
        headers: {},
        config: { headers: new axios.AxiosHeaders() },
        data: { message: 'Too many searches. Please wait a moment and try again.' },
      })
    );

    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);
    mounted.push({ root, container });

    await act(async () => {
      root.render(<Probe initial={emptySearchFilters} />);
    });

    expect(container.querySelector('[data-testid="error"]')?.textContent).toBe(
      'Too many searches. Please wait a moment and try again.'
    );
  });
});
