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

    expect(searchRestaurants).toHaveBeenLastCalledWith(expect.objectContaining({ q: 'pizza' }), 1);

    await act(async () => {
      [...container.querySelectorAll('button')].find((button) => button.textContent === 'more')?.click();
    });

    expect(searchRestaurants).toHaveBeenLastCalledWith(expect.objectContaining({ q: 'pizza' }), 2);

    await act(async () => {
      [...container.querySelectorAll('button')].find((button) => button.textContent === 'change')?.click();
    });

    expect(searchRestaurants).toHaveBeenLastCalledWith(expect.objectContaining({ foodType: ['MEAT'] }), 1);
    expect(container.querySelector('[data-testid="page"]')?.textContent).toBe('1');
  });
});
