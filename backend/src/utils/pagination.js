// NEW (Milestone 3): the same list answer shape for every paginated admin endpoint.
// חדש (אבן דרך 3): אותה צורת תשובה לכל רשימה מחולקת לעמודים בממשק המנהל.
export const buildPage = ({ items, total, page, limit }) => {
  return { items, page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) };
};
