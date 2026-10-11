// NEW (Milestone 4): builds the stored search fields of a restaurant and parses the visitor's search text.
// חדש (אבן דרך 4): בונה את שדות החיפוש השמורים של מסעדה ומפרק את טקסט החיפוש של המבקר.
//
// Stored on each restaurant (see the Restaurant model):
//   nameTokens  normalized words of the name (and the Hebrew / English names)  -> "name starts with" search
//   foodTokens  normalized words of the food keywords                          -> keyword search
//   foodGroups  ids of the synonym groups found in the name and the keywords   -> bilingual food search
// Both sides use the same normalizeText(), so Hebrew vowel marks, case and punctuation never matter.
// בשני הצדדים משתמשים באותה normalizeText, ולכן ניקוד, אותיות גדולות וסימני פיסוק לא משנים.
import { FOOD_SYNONYM_GROUPS } from '../config/foodSynonyms.js';
import { normalizeText } from './normalizeText.js';

const MAX_WORD_LENGTH = 40;
const MAX_QUERY_WORDS = 6;
const MIN_PARTIAL_WORD_LENGTH = 3;

export const splitIntoWords = (text) => {
  return normalizeText(text)
    .split(' ')
    .filter((word) => word !== '')
    .map((word) => word.slice(0, MAX_WORD_LENGTH));
};

const unique = (values) => [...new Set(values)];

// A Hebrew word can carry the article "ה" in front ("הפיצה"), so the word is also tried without it.
// מילה בעברית יכולה להתחיל ב"ה" הידיעה, לכן מנסים גם בלי האות הזו.
const wordForms = (word) => {
  return word.length > 3 && word.startsWith('ה') ? [word, word.slice(1)] : [word];
};

// A stored word belongs to a group when it is a term, or starts with a long enough term ("pizzas").
// מילה שמורה שייכת לקבוצה אם היא מונח, או מתחילה במונח ארוך מספיק ("pizzas").
const getGroupIdsForStoredWord = (word) => {
  const forms = wordForms(word);

  return FOOD_SYNONYM_GROUPS.filter((group) =>
    group.terms.some((term) => forms.some((form) => form === term || (term.length >= 4 && form.startsWith(term))))
  ).map((group) => group.id);
};

// A word the visitor is still typing ("pizz") also reaches a group when it is the beginning of a term.
// מילה שהמבקר עדיין מקליד ("pizz") מגיעה לקבוצה גם כשהיא תחילת מונח.
export const getGroupIdsForQueryWord = (word) => {
  const fromStored = getGroupIdsForStoredWord(word);

  if (word.length < MIN_PARTIAL_WORD_LENGTH) {
    return fromStored;
  }

  const fromPrefix = FOOD_SYNONYM_GROUPS.filter((group) =>
    group.terms.some((term) => term.startsWith(word))
  ).map((group) => group.id);

  return unique([...fromStored, ...fromPrefix]);
};

export const buildRestaurantSearchFields = ({ name, nameHe, nameEn, foodKeywords }) => {
  const nameTokens = unique([name, nameHe, nameEn].flatMap((text) => splitIntoWords(text)));
  const foodTokens = unique((foodKeywords || []).flatMap((keyword) => splitIntoWords(keyword)));
  const foodGroups = unique([...nameTokens, ...foodTokens].flatMap((word) => getGroupIdsForStoredWord(word)));

  return { nameTokens, foodTokens, foodGroups };
};

// The visitor's text as words. Only the first words count, so a very long text cannot build a huge query.
// טקסט המבקר כמילים. רק המילים הראשונות נספרות, כך שטקסט ארוך לא יוצר שאילתה ענקית.
export const parseSearchText = (text) => {
  const words = splitIntoWords(text).slice(0, MAX_QUERY_WORDS);

  return {
    normalized: words.join(' '),
    words,
    groupsByWord: words.map((word) => getGroupIdsForQueryWord(word)),
  };
};
