import { afterEach, describe, expect, it } from 'vitest';
import i18n from '../i18n';
import { restaurantDisplayNames } from './restaurantName';

const names = {
  name: 'Pizza Place',
  nameHe: 'מקום פיצה',
  nameEn: null as string | null,
};

describe('restaurantDisplayNames', () => {
  afterEach(async () => {
    await i18n.changeLanguage('en');
  });

  it('keeps the submitted name in English when no English name was stored', async () => {
    await i18n.changeLanguage('en');
    expect(restaurantDisplayNames(names)).toEqual({
      primary: 'Pizza Place',
      secondary: ['מקום פיצה'],
    });
  });

  it('uses the stored Hebrew name as the heading when the interface is Hebrew', async () => {
    await i18n.changeLanguage('he');
    expect(restaurantDisplayNames(names)).toEqual({
      primary: 'מקום פיצה',
      secondary: ['Pizza Place'],
    });
  });

  it('uses a stored English name as the heading and does not invent the other language', async () => {
    await i18n.changeLanguage('en');
    expect(
      restaurantDisplayNames({ name: 'Claimed Grill', nameHe: null, nameEn: 'The Claimed Grill' })
    ).toEqual({
      primary: 'The Claimed Grill',
      secondary: ['Claimed Grill'],
    });
  });
});
