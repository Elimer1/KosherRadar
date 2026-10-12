// NEW (Milestone 5): page title and description for the current screen. A client-rendered app cannot
// give each restaurant its own title to a crawler that does not run JavaScript; the static HTML stays generic.
// חדש (אבן דרך 5): כותרת ותיאור של המסך. אתר שרץ בדפדפן אינו נותן לזחלן שלא מריץ JavaScript כותרת נפרדת לכל מסעדה.
import { useEffect } from 'react';

export const usePageMeta = (title: string, description: string) => {
  useEffect(() => {
    document.title = title;

    const setContent = (selector: string, value: string) => {
      const node = document.querySelector(selector);

      if (node) {
        node.setAttribute('content', value);
      }
    };

    setContent('meta[name="description"]', description);
    setContent('meta[property="og:title"]', title);
    setContent('meta[property="og:description"]', description);
  }, [title, description]);
};
