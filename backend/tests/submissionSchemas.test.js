import { describe, it, expect, vi } from 'vitest';
import { submitTeudaSchema } from '../src/schemas/teudaSchemas.js';
import { httpUrlField } from '../src/schemas/commonSchemas.js';
import { parseJsonFields } from '../src/middleware/parseJsonFields.js';
import { validateObjectIdParam } from '../src/middleware/validateObjectId.js';

const validTeuda = () => ({
  hechsher: 'BADATZ_BEIT_YOSEF',
  kashrutLevel: 'MEHADRIN',
  expirationDate: '2026-12-31',
  mashgiachName: 'Moshe Cohen',
  mashgiachPhone: '050-123-4567',
});

describe('submitTeudaSchema', () => {
  it('accepts a complete teuda', () => {
    const result = submitTeudaSchema.parse({ teuda: validTeuda() });
    expect(result.teuda.hechsher).toBe('BADATZ_BEIT_YOSEF');
  });

  it('requires the custom text when the hechsher is OTHER', () => {
    const data = { teuda: { ...validTeuda(), hechsher: 'OTHER' } };
    expect(() => submitTeudaSchema.parse(data)).toThrow(/Enter the name of the hechsher/);
  });

  it('keeps the custom text for OTHER and drops it for a standard hechsher', () => {
    const other = submitTeudaSchema.parse({
      teuda: { ...validTeuda(), hechsher: 'OTHER', hechsherOther: 'Rabbi Levi' },
    });
    expect(other.teuda.hechsherOther).toBe('Rabbi Levi');

    const standard = submitTeudaSchema.parse({
      teuda: { ...validTeuda(), hechsherOther: 'ignored text' },
    });
    expect(standard.teuda.hechsherOther).toBeUndefined();
  });

  it('rejects an unknown hechsher, an impossible date and a bad phone, and drops a kashrut level', () => {
    expect(() => submitTeudaSchema.parse({ teuda: { ...validTeuda(), hechsher: 'MADE_UP' } })).toThrow();
    expect(() => submitTeudaSchema.parse({ teuda: { ...validTeuda(), expirationDate: '2026-02-30' } })).toThrow();
    expect(() => submitTeudaSchema.parse({ teuda: { ...validTeuda(), mashgiachPhone: 'call me' } })).toThrow();

    const parsed = submitTeudaSchema.parse({ teuda: { ...validTeuda(), kashrutLevel: 'SUPER' } });
    expect(parsed.teuda.kashrutLevel).toBeUndefined();
  });

  it('allows a certificate without a mashgiach, and still rejects a blank name', () => {
    const { mashgiachName, mashgiachPhone, ...withoutMashgiach } = validTeuda();
    expect(submitTeudaSchema.parse({ teuda: withoutMashgiach }).teuda.mashgiachName).toBeUndefined();
    expect(() => submitTeudaSchema.parse({ teuda: { ...validTeuda(), mashgiachName: '   ' } })).toThrow();
  });

  it('ignores fields the client must not control (status, submittedBy, points)', () => {
    const result = submitTeudaSchema.parse({
      teuda: { ...validTeuda(), status: 'APPROVED', submittedBy: 'someone-else', points: 99 },
    });
    expect(result.teuda.status).toBeUndefined();
    expect(result.teuda.submittedBy).toBeUndefined();
    expect(result.teuda.points).toBeUndefined();
  });

  it('rejects an object in place of a string (NoSQL injection attempt)', () => {
    expect(() =>
      submitTeudaSchema.parse({ teuda: { ...validTeuda(), mashgiachName: { $gt: '' } } })
    ).toThrow();
  });
});

describe('httpUrlField', () => {
  it('accepts http and https links', () => {
    expect(httpUrlField.parse('https://example.com/menu')).toBe('https://example.com/menu');
    expect(httpUrlField.parse('http://example.com')).toBe('http://example.com');
  });

  it('rejects javascript: links and other schemes', () => {
    expect(() => httpUrlField.parse('javascript:alert(1)')).toThrow();
    expect(() => httpUrlField.parse('data:text/html,hi')).toThrow();
    expect(() => httpUrlField.parse('not a url')).toThrow();
  });
});

describe('parseJsonFields', () => {
  it('turns the named JSON strings into objects', () => {
    const req = { body: { teuda: '{"hechsher":"OTHER"}', other: 'text' } };
    const next = vi.fn();

    parseJsonFields(['teuda'])(req, {}, next);

    expect(req.body.teuda).toEqual({ hechsher: 'OTHER' });
    expect(req.body.other).toBe('text');
    expect(next).toHaveBeenCalled();
  });

  it('answers 400 for broken JSON', () => {
    expect(() => parseJsonFields(['teuda'])({ body: { teuda: '{oops' } }, {}, vi.fn())).toThrowError(
      expect.objectContaining({ statusCode: 400 })
    );
  });

  it('works when there is no body at all', () => {
    const req = {};
    parseJsonFields(['teuda'])(req, {}, vi.fn());
    expect(req.body).toEqual({});
  });
});

describe('validateObjectIdParam', () => {
  const run = (value) => validateObjectIdParam('restaurantId')({ params: { restaurantId: value } }, {}, vi.fn());

  it('accepts a 24 character hex id', () => {
    expect(() => run('64b7f0f2a1b2c3d4e5f60718')).not.toThrow();
  });

  it('rejects anything else with 400', () => {
    expect(() => run('123')).toThrowError(expect.objectContaining({ statusCode: 400 }));
    expect(() => run('$ne')).toThrowError(expect.objectContaining({ statusCode: 400 }));
  });
});
