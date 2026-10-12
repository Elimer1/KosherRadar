// NEW (Milestone 3): loads one page of an admin list and lets the tab move between pages and reload.
// Five dashboard tabs need exactly this, so it is shared. `resetKey` changes (for example the search text)
// send the list back to page 1.
// חדש (אבן דרך 3): טוען עמוד אחד של רשימת ניהול ומאפשר מעבר בין עמודים ורענון. חמש לשוניות צריכות בדיוק את זה.
import { useEffect, useState } from 'react';
import { getErrorMessage } from '../api/errors';
import i18n from '../i18n';
import type { PageResult } from '../types/admin';

export const usePagedList = <T>(load: (page: number) => Promise<PageResult<T>>, resetKey = '') => {
  const [data, setData] = useState<PageResult<T> | null>(null);
  const [page, setPage] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [reloadCounter, setReloadCounter] = useState(0);
  const [lastResetKey, setLastResetKey] = useState(resetKey);

  // A new search or filter always starts again from page 1.
  if (lastResetKey !== resetKey) {
    setLastResetKey(resetKey);
    setPage(1);
  }

  useEffect(() => {
    // `ignore` stops an old, slow answer from replacing a newer one (for example while typing a search).
    let ignore = false;

    const loadPage = async () => {
      setLoading(true);
      setError('');

      try {
        const result = await load(page);

        if (!ignore) {
          setData(result);

          // After deleting the last item of the last page, go back one page instead of showing an empty one.
          if (result.items.length === 0 && page > 1) {
            setPage(page - 1);
          }
        }
      } catch (err) {
        if (!ignore) {
          setError(getErrorMessage(err, i18n.t('desk.loadList')));
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadPage();

    return () => {
      ignore = true;
    };
    // `load` is a new function on every render; the real triggers are the page, the reset key and reload.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, resetKey, reloadCounter]);

  const reload = () => setReloadCounter((current) => current + 1);

  return { data, page, setPage, error, loading, reload };
};
