// NEW (Milestone 5): Hebrew must cover every English phrase, so a missing translation fails the build's tests.
// חדש (אבן דרך 5): לעברית חייב להיות כל משפט מאנגלית, כדי שתרגום חסר ייכשל בבדיקות.
import { describe, expect, it } from 'vitest';
import { en } from './en';
import { he } from './he';

const leaves = (value: unknown, prefix = ''): string[] => {
  if (value !== null && typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>).flatMap(([key, child]) =>
      leaves(child, prefix === '' ? key : `${prefix}.${key}`)
    );
  }

  return [prefix];
};

describe('locales', () => {
  it('gives Hebrew a phrase for every English phrase', () => {
    expect(leaves(he).sort()).toEqual(leaves(en).sort());
  });

  it('does not leave a Hebrew phrase empty', () => {
    const empty = leaves(he).filter((key) => {
      const value = key.split('.').reduce<unknown>((current, part) => {
        if (current !== null && typeof current === 'object') {
          return (current as Record<string, unknown>)[part];
        }

        return undefined;
      }, he);

      return typeof value !== 'string' || value.trim() === '';
    });

    expect(empty).toEqual([]);
  });
});
