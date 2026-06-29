export const MIN_BIRTH_YEAR = 1940;

export const MONTH_LABELS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

export const MONTH_SHORT_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

export function getBirthYearOptions(maxYear = new Date().getFullYear()) {
  const years: number[] = [];
  for (let year = maxYear; year >= MIN_BIRTH_YEAR; year -= 1) {
    years.push(year);
  }
  return years;
}

export function getDaysInMonth(year: number, monthIndex: number) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

export function clampBirthDay(year: number, monthIndex: number, day: number) {
  return Math.min(Math.max(day, 1), getDaysInMonth(year, monthIndex));
}

export function buildBirthDate(year: number, monthIndex: number, day: number) {
  return new Date(year, monthIndex, clampBirthDay(year, monthIndex, day));
}

export function parseBirthDateInput(value?: string | null) {
  if (!value) {
    return null;
  }

  const [year, month, day] = value.split("-");
  if (!year || !month || !day) {
    return null;
  }

  const parsed = buildBirthDate(Number(year), Number(month) - 1, Number(day));
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function formatBirthDateForDisplay(value: Date | null) {
  if (!value) {
    return "Select date of birth";
  }

  return value.toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function formatBirthDateForApi(value: Date | null) {
  if (!value) {
    return null;
  }

  const year = value.getFullYear();
  const month = `${value.getMonth() + 1}`.padStart(2, "0");
  const day = `${value.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getDefaultBirthDate(existing: Date | null) {
  if (existing) {
    return existing;
  }

  const currentYear = new Date().getFullYear();
  return buildBirthDate(Math.min(2000, currentYear), 0, 1);
}
