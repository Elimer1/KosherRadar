// NEW (Milestone 3) / חדש (אבן דרך 3)
import { describe, expect, it } from 'vitest';
import { readResetToken } from './resetToken';

describe('readResetToken', () => {
  const token = 'ab12'.repeat(16);

  it('returns a well-formed token from the query string', () => {
    expect(readResetToken(`?token=${token}`)).toBe(token);
  });

  it('accepts new fragment links and refuses ambiguous duplicate/mixed tokens', () => {
    expect(readResetToken('', `#token=${token}`)).toBe(token);
    expect(readResetToken(`?token=${token}&token=${token}`)).toBe('');
    expect(readResetToken(`?token=${token}`, `#token=${token}`)).toBe('');
  });

  it('returns an empty string when the token is missing or malformed', () => {
    expect(readResetToken('')).toBe('');
    expect(readResetToken('?token=short')).toBe('');
    expect(readResetToken(`?token=${token}zz`)).toBe('');
    expect(readResetToken('?other=1')).toBe('');
  });
});
