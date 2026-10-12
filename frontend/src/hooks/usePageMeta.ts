// NEW (Milestone 5): page title and description for the current screen. A client-rendered app cannot
// give each restaurant its own title to a crawler that does not run JavaScript; the static HTML stays generic.
// The layout owns the document title. A page can override it, and leaving that page puts the layout title back.
// חדש (אבן דרך 5): כותרת ותיאור של המסך. אתר שרץ בדפדפן אינו נותן לזחלן שלא מריץ JavaScript כותרת נפרדת לכל מסעדה.
// הפריסה מחזיקה את כותרת המסמך. דף יכול להחליף אותה, ויציאה מהדף מחזירה את כותרת הפריסה.
import { createContext, useContext, useEffect } from 'react';

export interface PageMetaValue {
  title: string;
  description: string;
}

export const PageMetaOverrideContext = createContext<((meta: PageMetaValue | null) => void) | null>(null);

const readContent = (selector: string) => document.querySelector(selector)?.getAttribute('content') ?? '';

const writeContent = (selector: string, value: string) => {
  document.querySelector(selector)?.setAttribute('content', value);
};

export const writeDocumentMeta = (title: string, description: string) => {
  document.title = title;
  writeContent('meta[name="description"]', description);
  writeContent('meta[property="og:title"]', title);
  writeContent('meta[property="og:description"]', description);
};

export const usePageMeta = (title: string, description: string) => {
  const setOverride = useContext(PageMetaOverrideContext);

  useEffect(() => {
    if (!setOverride) {
      const previousTitle = document.title;
      const previousDescription = readContent('meta[name="description"]');
      const previousOgTitle = readContent('meta[property="og:title"]');
      const previousOgDescription = readContent('meta[property="og:description"]');
      writeDocumentMeta(title, description);

      return () => {
        document.title = previousTitle;
        writeContent('meta[name="description"]', previousDescription);
        writeContent('meta[property="og:title"]', previousOgTitle);
        writeContent('meta[property="og:description"]', previousOgDescription);
      };
    }

    setOverride({ title, description });

    return () => setOverride(null);
  }, [title, description, setOverride]);
};
