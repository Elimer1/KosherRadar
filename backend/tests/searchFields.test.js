// NEW (Milestone 4): tests for the stored search fields, the bilingual food synonyms and the search text parser.
// חדש (אבן דרך 4): בדיקות לשדות החיפוש השמורים, למילים הנרדפות הדו-לשוניות ולמפרק טקסט החיפוש.
import { describe, it, expect } from 'vitest';
import mongoose from 'mongoose';
import { FOOD_SYNONYM_GROUPS } from '../src/config/foodSynonyms.js';
import { Restaurant } from '../src/models/Restaurant.js';
import { normalizeText } from '../src/utils/normalizeText.js';
import {
  buildRestaurantSearchFields,
  getGroupIdsForQueryWord,
  parseSearchText,
  splitIntoWords,
} from '../src/utils/searchFields.js';

describe('food synonym list', () => {
  it('uses only one-word terms that are already normalized', () => {
    for (const group of FOOD_SYNONYM_GROUPS) {
      for (const term of group.terms) {
        expect(normalizeText(term), `${group.id}: ${term}`).toBe(term);
        expect(term, `${group.id}: ${term}`).not.toContain(' ');
      }
    }
  });

  it('has unique group ids', () => {
    const ids = FOOD_SYNONYM_GROUPS.map((group) => group.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('splitIntoWords', () => {
  it('lowercases, removes punctuation and Hebrew vowel marks', () => {
    expect(splitIntoWords("Pizza   Hut!, (Jerusalem)")).toEqual(['pizza', 'hut', 'jerusalem']);
    expect(splitIntoWords('פִּיצָה')).toEqual(['פיצה']);
  });

  it('returns no words for empty text', () => {
    expect(splitIntoWords('')).toEqual([]);
    expect(splitIntoWords(undefined)).toEqual([]);
  });
});

describe('buildRestaurantSearchFields', () => {
  it('builds name words from the name and the Hebrew and English names', () => {
    const fields = buildRestaurantSearchFields({ name: 'Cafe Nola', nameHe: 'קפה נולה', nameEn: 'Nola Cafe' });

    expect(fields.nameTokens).toEqual(expect.arrayContaining(['cafe', 'nola', 'קפה', 'נולה']));
    expect(fields.nameTokens).toHaveLength(4);
  });

  it('puts a pizza place into the pizza group whether it is named or tagged in English or Hebrew', () => {
    const byHebrewName = buildRestaurantSearchFields({ name: 'פיצרייה של דני', foodKeywords: [] });
    const byEnglishTag = buildRestaurantSearchFields({ name: 'Danny', foodKeywords: ['Pizza', 'pasta'] });

    expect(byHebrewName.foodGroups).toContain('pizza');
    expect(byEnglishTag.foodGroups).toEqual(expect.arrayContaining(['pizza', 'pasta']));
  });

  it('recognizes plural forms and the Hebrew article', () => {
    expect(buildRestaurantSearchFields({ name: 'The Burgers', foodKeywords: [] }).foodGroups).toContain('burger');
    expect(buildRestaurantSearchFields({ name: 'x', foodKeywords: ['הפיצה'] }).foodGroups).toContain('pizza');
  });

  it('keeps free food keywords that are not in any group', () => {
    const fields = buildRestaurantSearchFields({ name: 'Abu Said', foodKeywords: ['Kubeh Soup', 'malawach'] });

    expect(fields.foodTokens).toEqual(expect.arrayContaining(['kubeh', 'soup', 'malawach']));
    expect(fields.foodGroups).toContain('soup');
  });

  it('does not invent a group for an unrelated name', () => {
    expect(buildRestaurantSearchFields({ name: 'Moshe Place', foodKeywords: [] }).foodGroups).toEqual([]);
  });
});

describe('getGroupIdsForQueryWord', () => {
  it('finds a group from either language', () => {
    expect(getGroupIdsForQueryWord('pizza')).toContain('pizza');
    expect(getGroupIdsForQueryWord('פיצה')).toContain('pizza');
    expect(getGroupIdsForQueryWord('פיצרייה')).toContain('pizza');
  });

  it('finds a group from the beginning of a term while the visitor is still typing (3+ letters)', () => {
    expect(getGroupIdsForQueryWord('pizz')).toContain('pizza');
    expect(getGroupIdsForQueryWord('piz')).toContain('pizza');
    expect(getGroupIdsForQueryWord('pi')).toEqual([]);
  });

  it('finds nothing for an unknown word', () => {
    expect(getGroupIdsForQueryWord('jerusalem')).toEqual([]);
  });
});

describe('parseSearchText', () => {
  it('normalizes the text and finds the groups of each word', () => {
    const parsed = parseSearchText('  Pizza HUT ');

    expect(parsed.words).toEqual(['pizza', 'hut']);
    expect(parsed.normalized).toBe('pizza hut');
    expect(parsed.groupsByWord[0]).toContain('pizza');
    expect(parsed.groupsByWord[1]).toEqual([]);
  });

  it('only keeps the first six words, so a long text cannot build a huge query', () => {
    expect(parseSearchText('a1 b2 c3 d4 e5 f6 g7 h8').words).toHaveLength(6);
  });

  it('is empty for empty or symbol-only text', () => {
    expect(parseSearchText('').words).toEqual([]);
    expect(parseSearchText('!!! ???').words).toEqual([]);
  });

  it('turns regex characters into plain letters, so they can never change a pattern', () => {
    expect(parseSearchText('.*(a)').words).toEqual(['a']);
  });
});

describe('Restaurant model search fields', () => {
  const validData = () => ({
    name: 'Pizza Hut',
    nameHe: 'פיצה האט',
    address: '1 Main St',
    foodType: 'DAIRY',
    foodKeywords: ['pasta'],
    submittedBy: new mongoose.Types.ObjectId(),
  });

  it('are rebuilt from the names and keywords when the restaurant is validated', async () => {
    const restaurant = new Restaurant(validData());
    await restaurant.validate();

    expect(restaurant.nameTokens).toEqual(expect.arrayContaining(['pizza', 'hut', 'פיצה', 'האט']));
    expect(restaurant.foodTokens).toEqual(['pasta']);
    expect(restaurant.foodGroups).toEqual(expect.arrayContaining(['pizza', 'pasta']));
  });

  it('cannot be set by hand: a stale value is replaced', async () => {
    const restaurant = new Restaurant({ ...validData(), foodGroups: ['sushi'], nameTokens: ['fake'] });
    await restaurant.validate();

    expect(restaurant.foodGroups).not.toContain('sushi');
    expect(restaurant.nameTokens).not.toContain('fake');
  });
});
