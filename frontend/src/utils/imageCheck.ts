// Looks at the first bytes of a file to find its real image type. The server checks again,
// this only gives the user a fast, clear message before a slow upload.
export const detectImageType = (bytes: Uint8Array) => {
  if (bytes.length < 12) {
    return null;
  }

  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return 'image/jpeg';
  }

  const pngSignature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  if (pngSignature.every((byte, index) => bytes[index] === byte)) {
    return 'image/png';
  }

  const asText = (start: number, end: number) => String.fromCharCode(...bytes.slice(start, end));
  if (asText(0, 4) === 'RIFF' && asText(8, 12) === 'WEBP') {
    return 'image/webp';
  }

  return null;
};

// Returns an error message, or an empty string when the file looks fine.
export const checkPhotoFile = async (file: File, maxBytes: number) => {
  if (file.size > maxBytes) {
    return 'too-large';
  }

  const firstBytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());

  if (!detectImageType(firstBytes)) {
    return 'bad-type';
  }

  return '';
};
