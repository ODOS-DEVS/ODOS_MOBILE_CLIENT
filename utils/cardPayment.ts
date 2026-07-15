export type CardBrand = "visa" | "mastercard" | "amex" | "discover" | "verve" | "unknown";

export type CardFieldErrors = Partial<
  Record<"cardName" | "cardNumber" | "expiry" | "cvv", string>
>;

export type CardFormValues = {
  cardName: string;
  cardNumber: string;
  expiry: string;
  cvv: string;
};

const CARD_BRAND_LABELS: Record<CardBrand, string> = {
  visa: "Visa",
  mastercard: "Mastercard",
  amex: "American Express",
  discover: "Discover",
  verve: "Verve",
  unknown: "Debit / Credit",
};

export function getCardBrandLabel(brand: CardBrand) {
  return CARD_BRAND_LABELS[brand];
}

export function detectCardBrand(cardNumber: string): CardBrand {
  const digits = cardNumber.replace(/\D/g, "");
  if (!digits) {
    return "unknown";
  }

  if (/^4/.test(digits)) {
    return "visa";
  }

  if (/^3[47]/.test(digits)) {
    return "amex";
  }

  if (/^5[1-5]/.test(digits) || /^2(2[2-9]|[3-6]\d|7[01]|720)/.test(digits)) {
    return "mastercard";
  }

  if (/^6(?:011|5)/.test(digits)) {
    return "discover";
  }

  if (/^(5060|5078|6500|6501)/.test(digits)) {
    return "verve";
  }

  return "unknown";
}

export function getCardNumberMaxLength(brand: CardBrand) {
  if (brand === "amex") {
    return 15;
  }
  return 16;
}

export function getCvvMaxLength(brand: CardBrand) {
  return brand === "amex" ? 4 : 3;
}

export function formatCardNumberInput(raw: string, brand?: CardBrand): string {
  const resolvedBrand = brand ?? detectCardBrand(raw);
  const digits = raw.replace(/\D/g, "").slice(0, getCardNumberMaxLength(resolvedBrand));

  if (resolvedBrand === "amex") {
    const partOne = digits.slice(0, 4);
    const partTwo = digits.slice(4, 10);
    const partThree = digits.slice(10, 15);
    return [partOne, partTwo, partThree].filter(Boolean).join(" ");
  }

  return digits.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
}

export function formatCardExpiryInput(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 4);

  if (digits.length <= 2) {
    const month = Number(digits);
    if (digits.length === 2 && month > 12) {
      return `0${digits[0]}/${digits[1]}`;
    }
    return digits;
  }

  const month = digits.slice(0, 2);
  const year = digits.slice(2, 4);
  const monthValue = Number(month);

  if (monthValue < 1) {
    return `01/${year}`;
  }

  if (monthValue > 12) {
    return `12/${year}`;
  }

  return `${month}/${year}`;
}

export function formatCardholderName(raw: string): string {
  return raw.replace(/\s{2,}/g, " ").replace(/[^a-zA-Z\s.'-]/g, "").slice(0, 40);
}

export function formatCardCvvInput(raw: string, brand?: CardBrand): string {
  const resolvedBrand = brand ?? "unknown";
  return raw.replace(/\D/g, "").slice(0, getCvvMaxLength(resolvedBrand));
}

export function passesLuhnCheck(cardNumber: string): boolean {
  const digits = cardNumber.replace(/\D/g, "");
  if (digits.length < 12) {
    return false;
  }

  let sum = 0;
  let shouldDouble = false;

  for (let index = digits.length - 1; index >= 0; index -= 1) {
    let digit = Number(digits[index]);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
}

export function isCardExpiryValid(expiry: string): boolean {
  if (!/^\d{2}\/\d{2}$/.test(expiry)) {
    return false;
  }

  const [monthText, yearText] = expiry.split("/");
  const month = Number(monthText);
  const year = Number(yearText);

  if (month < 1 || month > 12) {
    return false;
  }

  const now = new Date();
  const currentYear = now.getFullYear() % 100;
  const currentMonth = now.getMonth() + 1;

  if (year < currentYear) {
    return false;
  }

  if (year === currentYear && month < currentMonth) {
    return false;
  }

  return true;
}

export function formatCardNumberForPreview(cardNumber: string, brand: CardBrand): string {
  const digits = cardNumber.replace(/\D/g, "");
  const groupSizes = brand === "amex" ? [4, 6, 5] : [4, 4, 4, 4];

  return groupSizes
    .map((size, index) => {
      const start = groupSizes.slice(0, index).reduce((sum, value) => sum + value, 0);
      const chunk = digits.slice(start, start + size);
      if (!chunk) {
        return "•".repeat(size);
      }
      if (index < groupSizes.length - 1) {
        return "•".repeat(size);
      }
      return chunk.padEnd(size, "•");
    })
    .join(" ");
}

export function validateCardForm(values: CardFormValues): CardFieldErrors {
  const errors: CardFieldErrors = {};
  const brand = detectCardBrand(values.cardNumber);
  const cardDigits = values.cardNumber.replace(/\D/g, "");
  const cvvDigits = values.cvv.replace(/\D/g, "");

  if (!values.cardName.trim() || values.cardName.trim().length < 2) {
    errors.cardName = "Enter the name printed on your card.";
  }

  if (cardDigits.length < getCardNumberMaxLength(brand)) {
    errors.cardNumber = `Enter the full ${getCardNumberMaxLength(brand)}-digit card number.`;
  } else if (!passesLuhnCheck(cardDigits)) {
    errors.cardNumber = "This card number doesn't look valid.";
  }

  if (!/^\d{2}\/\d{2}$/.test(values.expiry)) {
    errors.expiry = "Enter expiry as MM/YY.";
  } else if (!isCardExpiryValid(values.expiry)) {
    errors.expiry = "This card appears to be expired.";
  }

  const requiredCvvLength = getCvvMaxLength(brand);
  if (cvvDigits.length < requiredCvvLength) {
    errors.cvv =
      brand === "amex"
        ? "Enter the 4-digit security code on the front."
        : "Enter the 3-digit CVV on the back.";
  }

  return errors;
}

export function getCardBrandColors(brand: CardBrand): [string, string, string] {
  switch (brand) {
    case "visa":
      return ["#1A1F71", "#2E4BC6", "#0D1545"];
    case "mastercard":
      return ["#1F1F1F", "#EB001B", "#F79E1B"];
    case "amex":
      return ["#006FCF", "#0099DF", "#004E8A"];
    case "discover":
      return ["#FF6000", "#F9A01B", "#C44D00"];
    case "verve":
      return ["#5B2C87", "#8E44AD", "#3A1D5C"];
    default:
      return ["#1E293B", "#334155", "#0F172A"];
  }
}
