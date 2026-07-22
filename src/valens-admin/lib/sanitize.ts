/**
 * Input sanitization utilities to prevent SQL injection and XSS attacks.
 * Strips dangerous characters while keeping text readable.
 */

// Allow letters (all languages), numbers, spaces, and basic punctuation
const SAFE_TEXT_REGEX = /[^a-zA-ZÀ-ÿçëÇË0-9\s.,\-']/g;

// Phone: only digits, +, spaces, dashes, parens
const SAFE_PHONE_REGEX = /[^0-9+\s\-()/]/g;

// Email: letters, digits, @, ., _, -, +
const SAFE_EMAIL_REGEX = /[^a-zA-Z0-9@._+\-]/g;

// Address: letters, digits, spaces, commas, dots, dashes, slashes, nr
const SAFE_ADDRESS_REGEX = /[^a-zA-ZÀ-ÿçëÇË0-9\s.,\-/\n]/g;

// Notes/message: same as text but allow newlines
const SAFE_NOTES_REGEX = /[^a-zA-ZÀ-ÿçëÇË0-9\s.,!?\-'()\n]/g;

export const sanitizeText = (value: string, maxLength = 100): string =>
  value.replace(SAFE_TEXT_REGEX, "").slice(0, maxLength);

export const sanitizePhone = (value: string, maxLength = 20): string =>
  value.replace(SAFE_PHONE_REGEX, "").slice(0, maxLength);

export const sanitizeEmail = (value: string, maxLength = 255): string =>
  value.replace(SAFE_EMAIL_REGEX, "").slice(0, maxLength).toLowerCase();

export const sanitizeAddress = (value: string, maxLength = 200): string =>
  value.replace(SAFE_ADDRESS_REGEX, "").slice(0, maxLength);

export const sanitizeNotes = (value: string, maxLength = 500): string =>
  value.replace(SAFE_NOTES_REGEX, "").slice(0, maxLength);
