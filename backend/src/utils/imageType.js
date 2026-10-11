// Reads the first bytes of the file to find the real image type. The type the browser claims
// (file extension or Content-Type header) can be faked, so it is never trusted.
export const detectImageType = (buffer) => {
  if (!buffer || buffer.length < 12) {
    return null;
  }

  const isJpeg = buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  if (isJpeg) {
    return 'image/jpeg';
  }

  const pngSignature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  const isPng = pngSignature.every((byte, index) => buffer[index] === byte);
  if (isPng) {
    return 'image/png';
  }

  const isWebp =
    buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP';
  if (isWebp) {
    return 'image/webp';
  }

  return null;
};
