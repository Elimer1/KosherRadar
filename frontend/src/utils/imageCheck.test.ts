import { describe, expect, it } from 'vitest';
import { checkPhotoFile, detectImageType } from './imageCheck';
import { getHechsherLabel, getKashrutLevelLabel } from './labels';

const MAX = 5 * 1024 * 1024;

const makeFile = (bytes: number[], name = 'photo.jpg') => {
  const content = new Uint8Array([...bytes, ...new Array(32).fill(0)]);
  return new File([content], name, { type: 'image/jpeg' });
};

describe('detectImageType', () => {
  it('recognizes JPG, PNG and WebP by their first bytes', () => {
    const padding = new Array(16).fill(0);
    expect(detectImageType(new Uint8Array([0xff, 0xd8, 0xff, ...padding]))).toBe('image/jpeg');
    expect(detectImageType(new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, ...padding]))).toBe(
      'image/png'
    );
    const webp = new Uint8Array(16);
    webp.set([0x52, 0x49, 0x46, 0x46], 0);
    webp.set([0x57, 0x45, 0x42, 0x50], 8);
    expect(detectImageType(webp)).toBe('image/webp');
  });

  it('rejects text, PDFs and tiny files', () => {
    expect(detectImageType(new TextEncoder().encode('<script>alert(1)</script>'))).toBeNull();
    expect(detectImageType(new TextEncoder().encode('%PDF-1.7 and more text'))).toBeNull();
    expect(detectImageType(new Uint8Array([0xff, 0xd8]))).toBeNull();
  });
});

describe('checkPhotoFile', () => {
  it('accepts a real JPG under the limit', async () => {
    expect(await checkPhotoFile(makeFile([0xff, 0xd8, 0xff]), MAX)).toBe('');
  });

  it('rejects a file over the size limit', async () => {
    expect(await checkPhotoFile(makeFile([0xff, 0xd8, 0xff]), 10)).toBe('too-large');
  });

  it('rejects a non-image even when it is named .jpg', async () => {
    const fake = new File([new TextEncoder().encode('just some text content')], 'photo.jpg', {
      type: 'image/jpeg',
    });
    expect(await checkPhotoFile(fake, MAX)).toBe('bad-type');
  });
});

describe('labels', () => {
  const options = [{ value: 'BADATZ_MACHPUD', labelEn: 'Badatz Machpud', labelHe: 'x' }];

  it('shows readable names instead of raw values', () => {
    expect(getKashrutLevelLabel('MEHADRIN')).toBe('Mehadrin');
    expect(getHechsherLabel('BADATZ_MACHPUD', null, options)).toBe('Badatz Machpud');
  });

  it('shows the custom text for an OTHER hechsher', () => {
    expect(getHechsherLabel('OTHER', 'Rabbi Levi', options)).toBe('Rabbi Levi');
  });
});
