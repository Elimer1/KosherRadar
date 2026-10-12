import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import { PageMetaProvider } from '../components/PageMetaProvider';
import { usePageMeta } from './usePageMeta';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

function Titled({ title }: { title: string }) {
  usePageMeta(title, `${title} description`);
  return <h1>{title}</h1>;
}

describe('usePageMeta', () => {
  let root: Root | null = null;
  let container: HTMLDivElement | null = null;

  afterEach(() => {
    act(() => {
      root?.unmount();
    });
    container?.remove();
    root = null;
    container = null;
    document.title = '';
    document.head.querySelector('meta[name="description"]')?.remove();
  });

  it('restores the previous document title when the page unmounts', () => {
    document.title = 'KosherRadar';
    const description = document.createElement('meta');
    description.setAttribute('name', 'description');
    description.setAttribute('content', 'Search restaurants');
    document.head.appendChild(description);
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);

    act(() => {
      root?.render(<Titled title="Claimed Grill - KosherRadar" />);
    });
    expect(document.title).toBe('Claimed Grill - KosherRadar');
    expect(description.getAttribute('content')).toBe('Claimed Grill - KosherRadar description');

    act(() => {
      root?.render(<p>Home</p>);
    });
    expect(document.title).toBe('KosherRadar');
    expect(description.getAttribute('content')).toBe('Search restaurants');
  });

  it('keeps a page title over the layout title, including after the layout title changes', () => {
    document.title = 'Start';
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);

    const render = (home: string, page: string | null) => {
      act(() => {
        root?.render(
          <PageMetaProvider title={home} description={`${home} description`}>
            {page ? <Titled title={page} /> : <p>Home</p>}
          </PageMetaProvider>
        );
      });
    };

    render('KosherRadar', 'Claimed Grill - KosherRadar');
    expect(document.title).toBe('Claimed Grill - KosherRadar');

    render('KosherRadar - Kashrut information for restaurants in Israel', 'Pizza Place - KosherRadar');
    expect(document.title).toBe('Pizza Place - KosherRadar');

    render('KosherRadar - Kashrut information for restaurants in Israel', null);
    expect(document.title).toBe('KosherRadar - Kashrut information for restaurants in Israel');
  });
});
