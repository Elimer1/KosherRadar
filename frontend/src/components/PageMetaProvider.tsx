import { useEffect, useState, type ReactNode } from 'react';
import { PageMetaOverrideContext, writeDocumentMeta, type PageMetaValue } from '../hooks/usePageMeta';

export function PageMetaProvider({
  title,
  description,
  children,
}: PageMetaValue & { children: ReactNode }) {
  const [override, setOverride] = useState<PageMetaValue | null>(null);
  const current = override ?? { title, description };

  useEffect(() => {
    writeDocumentMeta(current.title, current.description);
  }, [current.title, current.description]);

  return <PageMetaOverrideContext.Provider value={setOverride}>{children}</PageMetaOverrideContext.Provider>;
}
