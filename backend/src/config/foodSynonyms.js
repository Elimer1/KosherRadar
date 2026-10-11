// NEW (Milestone 4): maintained bilingual food synonym groups for the main search (spec section 8).
// חדש (אבן דרך 4): קבוצות מילים נרדפות דו-לשוניות (עברית/אנגלית) לחיפוש האוכל הראשי.
//
// Every term is ONE word, already in the form normalizeText() produces (lower case, no vowel marks,
// no punctuation). Searching any term of a group finds every restaurant whose name or food keywords
// contain any term of the same group, so "pizza" finds a Hebrew "פיצרייה" and "פיצה" finds an
// English-tagged pizza place. No machine translation is used: only this list. To teach the search a
// new food, add a group here (the stored search fields are rebuilt the next time a restaurant is saved).
// כל מונח הוא מילה אחת בצורה המנורמלת. חיפוש של מונח כלשהו בקבוצה מוצא כל מסעדה שיש בשמה או במילות
// המפתח שלה מונח מאותה קבוצה. אין תרגום אוטומטי: רק הרשימה הזו. כדי ללמד אוכל חדש מוסיפים כאן קבוצה.
//
// NOTE: these term lists were written by the agent and have not been reviewed by the team.
// הערה: רשימות המונחים נכתבו על ידי הסוכן ועדיין לא נבדקו על ידי הצוות.
export const FOOD_SYNONYM_GROUPS = [
  { id: 'pizza', terms: ['pizza', 'pizzeria', 'פיצה', 'פיצרייה', 'פיצריה', 'פיצות'] },
  { id: 'burger', terms: ['burger', 'burgers', 'hamburger', 'המבורגר', 'בורגר', 'המבורגרים', 'בורגרים'] },
  { id: 'sushi', terms: ['sushi', 'סושי'] },
  { id: 'shawarma', terms: ['shawarma', 'shwarma', 'שווארמה', 'שוארמה'] },
  { id: 'falafel', terms: ['falafel', 'פלאפל'] },
  { id: 'hummus', terms: ['hummus', 'humus', 'hummous', 'חומוס', 'חומוסיה'] },
  { id: 'pasta', terms: ['pasta', 'italian', 'פסטה', 'איטלקי', 'איטלקית'] },
  { id: 'salad', terms: ['salad', 'salads', 'סלט', 'סלטים'] },
  { id: 'sandwich', terms: ['sandwich', 'sandwiches', 'סנדוויץ', 'כריך', 'כריכים', 'טוסט'] },
  { id: 'steak', terms: ['steak', 'steakhouse', 'grill', 'bbq', 'סטייק', 'סטקיה', 'גריל', 'מנגל'] },
  { id: 'schnitzel', terms: ['schnitzel', 'שניצל'] },
  { id: 'kebab', terms: ['kebab', 'kabab', 'kebabs', 'קבב', 'קבאב'] },
  { id: 'chicken', terms: ['chicken', 'עוף', 'תרנגולת', 'כנפיים'] },
  { id: 'fish', terms: ['fish', 'seafood', 'דגים', 'דג'] },
  { id: 'soup', terms: ['soup', 'soups', 'מרק', 'מרקים'] },
  { id: 'coffee', terms: ['coffee', 'cafe', 'café', 'espresso', 'קפה', 'אספרסו', 'קפיטריה'] },
  { id: 'bakery', terms: ['bakery', 'bread', 'pastry', 'pastries', 'מאפייה', 'מאפה', 'מאפים', 'לחם'] },
  { id: 'cake', terms: ['cake', 'cakes', 'dessert', 'desserts', 'עוגה', 'עוגות', 'קינוח', 'קינוחים'] },
  { id: 'icecream', terms: ['icecream', 'gelato', 'גלידה', 'גלידריה', 'גלטו'] },
  { id: 'breakfast', terms: ['breakfast', 'brunch', 'shakshuka', 'בראנץ', 'שקשוקה'] },
  { id: 'bagel', terms: ['bagel', 'bagels', 'בייגל', 'בייגלה'] },
  { id: 'asian', terms: ['asian', 'chinese', 'noodles', 'thai', 'wok', 'אסייתי', 'סיני', 'נודלס', 'תאילנדי', 'ווק'] },
  { id: 'mexican', terms: ['mexican', 'burrito', 'taco', 'tacos', 'מקסיקני', 'בוריטו', 'טאקו'] },
  { id: 'vegan', terms: ['vegan', 'vegetarian', 'טבעוני', 'צמחוני', 'צמחונית'] },
];
