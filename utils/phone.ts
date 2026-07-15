/** Ghana local mobile: 10 digits starting with 0 (e.g. 0541234567). */

export function extractPhoneDigits(value: string) {
  return value.replace(/\D/g, "");
}

export function formatPhoneInput(value: string) {
  return extractPhoneDigits(value).slice(0, 10);
}

export function normalizeGhanaPhone(value: string): string | null {
  const digits = extractPhoneDigits(value);

  if (digits.length === 10 && digits.startsWith("0")) {
    return digits;
  }

  if (digits.length === 12 && digits.startsWith("233")) {
    return `0${digits.slice(3)}`;
  }

  if (digits.length === 9) {
    return `0${digits}`;
  }

  return null;
}

export function formatGhanaPhoneDisplay(value: string) {
  const digits = extractPhoneDigits(value);
  if (digits.length !== 10) {
    return value.trim() || value;
  }
  return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
}

export function validateGhanaPhone(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const digits = extractPhoneDigits(trimmed);
  if (digits.length !== 10) {
    return "Enter a 10-digit Ghana phone number (e.g. 0541234567).";
  }

  if (!digits.startsWith("0")) {
    return "Phone number should start with 0.";
  }

  return null;
}

export function isGhanaPhoneVerified(
  phone: string,
  verifiedPhone: string | null | undefined,
  phoneVerified: boolean,
) {
  const normalized = normalizeGhanaPhone(phone);
  if (!normalized || !phoneVerified || !verifiedPhone) {
    return false;
  }

  return normalizeGhanaPhone(verifiedPhone) === normalized;
}
