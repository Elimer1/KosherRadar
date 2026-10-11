// Makes names and addresses comparable: lower case, no Hebrew vowel marks, no punctuation,
// one space between words. Works for Hebrew and English text.
export const normalizeText = (text) => {
  if (!text) {
    return '';
  }

  return String(text)
    .toLowerCase()
    .replace(/[\u0591-\u05C7]/g, '')
    .replace(/[^\p{L}\p{N}\s]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
};

// Keeps digits only and turns the Israel country code into a leading 0,
// so "+972-50-123-4567" and "050 123 4567" compare as equal.
export const normalizePhone = (phone) => {
  if (!phone) {
    return '';
  }

  const digits = String(phone).replace(/\D/g, '');

  if (digits.startsWith('972')) {
    return `0${digits.slice(3)}`;
  }

  return digits;
};
