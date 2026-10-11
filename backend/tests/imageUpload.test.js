import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../src/config/cloudinary.js', () => ({
  isCloudinaryConfigured: vi.fn(),
  getCloudinary: vi.fn(),
}));

import { getCloudinary, isCloudinaryConfigured } from '../src/config/cloudinary.js';
import { detectImageType } from '../src/utils/imageType.js';
import {
  checkImageFile,
  deleteImageService,
  uploadTeudaImageService,
} from '../src/services/imageUploadService.js';

const padTo = (bytes, length = 64) => Buffer.concat([Buffer.from(bytes), Buffer.alloc(length)]);

const jpegBuffer = () => padTo([0xff, 0xd8, 0xff, 0xe0]);
const pngBuffer = () => padTo([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const webpBuffer = () => {
  const buffer = Buffer.alloc(64);
  buffer.write('RIFF', 0, 'ascii');
  buffer.write('WEBP', 8, 'ascii');
  return buffer;
};

const makeFile = (buffer, size = buffer.length) => ({ buffer, size, mimetype: 'image/jpeg' });

describe('detectImageType', () => {
  it('recognizes JPG, PNG and WebP by their first bytes', () => {
    expect(detectImageType(jpegBuffer())).toBe('image/jpeg');
    expect(detectImageType(pngBuffer())).toBe('image/png');
    expect(detectImageType(webpBuffer())).toBe('image/webp');
  });

  it('does not recognize GIF, PDF, scripts or executables', () => {
    expect(detectImageType(padTo(Buffer.from('GIF89a')))).toBeNull();
    expect(detectImageType(padTo(Buffer.from('%PDF-1.7')))).toBeNull();
    expect(detectImageType(padTo(Buffer.from('<script>alert(1)</script>')))).toBeNull();
    expect(detectImageType(padTo(Buffer.from('MZ')))).toBeNull();
  });

  it('returns null for empty or tiny input', () => {
    expect(detectImageType(Buffer.alloc(0))).toBeNull();
    expect(detectImageType(null)).toBeNull();
  });
});

describe('checkImageFile', () => {
  it('requires a file', () => {
    expect(() => checkImageFile(undefined)).toThrow(/photo is required/);
  });

  it('accepts a real image under 5 MB', () => {
    expect(() => checkImageFile(makeFile(jpegBuffer()))).not.toThrow();
  });

  it('rejects a file bigger than 5 MB with 413', () => {
    expect(() => checkImageFile(makeFile(jpegBuffer(), 5 * 1024 * 1024 + 1))).toThrowError(
      expect.objectContaining({ statusCode: 413 })
    );
  });

  it('rejects a script that was renamed to look like an image', () => {
    const fakeImage = makeFile(padTo(Buffer.from('<?php echo 1; ?>')));
    expect(() => checkImageFile(fakeImage)).toThrowError(expect.objectContaining({ statusCode: 400 }));
  });
});

describe('uploadTeudaImageService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('says upload is unavailable (503) when Cloudinary is not configured', async () => {
    isCloudinaryConfigured.mockReturnValue(false);

    await expect(uploadTeudaImageService(makeFile(jpegBuffer()))).rejects.toMatchObject({
      statusCode: 503,
    });
  });

  it('returns the secure URL and public id from Cloudinary', async () => {
    isCloudinaryConfigured.mockReturnValue(true);
    const end = vi.fn();
    const upload_stream = vi.fn((options, callback) => {
      setTimeout(() => callback(null, { secure_url: 'https://res.cloudinary.com/x.jpg', public_id: 'kosherradar/teudot/x' }), 0);
      return { end };
    });
    getCloudinary.mockReturnValue({ uploader: { upload_stream } });

    const result = await uploadTeudaImageService(makeFile(jpegBuffer()));

    expect(result).toEqual({
      photoUrl: 'https://res.cloudinary.com/x.jpg',
      cloudinaryPublicId: 'kosherradar/teudot/x',
    });
    expect(upload_stream.mock.calls[0][0]).toMatchObject({ resource_type: 'image' });
    expect(end).toHaveBeenCalled();
  });

  it('reports a Cloudinary failure as 502 and never returns a fake URL', async () => {
    isCloudinaryConfigured.mockReturnValue(true);
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const upload_stream = vi.fn((options, callback) => {
      setTimeout(() => callback(new Error('network down')), 0);
      return { end: vi.fn() };
    });
    getCloudinary.mockReturnValue({ uploader: { upload_stream } });

    await expect(uploadTeudaImageService(makeFile(jpegBuffer()))).rejects.toMatchObject({
      statusCode: 502,
    });
  });

  it('does not call Cloudinary when the file is not a real image', async () => {
    isCloudinaryConfigured.mockReturnValue(true);

    await expect(
      uploadTeudaImageService(makeFile(padTo(Buffer.from('not an image'))))
    ).rejects.toMatchObject({ statusCode: 400 });
    expect(getCloudinary).not.toHaveBeenCalled();
  });
});

describe('deleteImageService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('only logs when the delete fails', async () => {
    isCloudinaryConfigured.mockReturnValue(true);
    vi.spyOn(console, 'error').mockImplementation(() => {});
    getCloudinary.mockReturnValue({ uploader: { destroy: vi.fn().mockRejectedValue(new Error('boom')) } });

    await expect(deleteImageService('some/id')).resolves.toBeUndefined();
  });
});
