export type BusinessHoursMap = Record<
  string,
  { open?: string; close?: string; closed?: boolean }
>;

export const STORE_HOURS_DAY_KEYS = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
] as const;

const DAY_LABELS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export function getDayKey(date: Date): (typeof STORE_HOURS_DAY_KEYS)[number] {
  return STORE_HOURS_DAY_KEYS[date.getDay()];
}

export function getDayLabel(dayKey: string): string {
  const index = STORE_HOURS_DAY_KEYS.indexOf(
    dayKey as (typeof STORE_HOURS_DAY_KEYS)[number],
  );
  return index >= 0 ? DAY_LABELS[index] : dayKey;
}

function parseTimeToMinutes(value?: string): number | null {
  if (!value) {
    return null;
  }
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) {
    return null;
  }
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    return null;
  }
  return hours * 60 + minutes;
}

export function formatTimeLabel(value?: string): string {
  const minutes = parseTimeToMinutes(value);
  if (minutes == null) {
    return "";
  }
  const hours24 = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const period = hours24 >= 12 ? "PM" : "AM";
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  return `${hours12}:${String(mins).padStart(2, "0")} ${period}`;
}

function findNextOpenDay(businessHours: BusinessHoursMap, from: Date) {
  for (let offset = 1; offset <= 7; offset += 1) {
    const nextDate = new Date(from);
    nextDate.setDate(from.getDate() + offset);
    const nextKey = getDayKey(nextDate);
    const nextDay = businessHours[nextKey];
    if (nextDay && !nextDay.closed && nextDay.open) {
      return {
        label: offset === 1 ? "tomorrow" : getDayLabel(nextKey),
        openTime: formatTimeLabel(nextDay.open),
      };
    }
  }
  return null;
}

export type StoreOpenStatus = {
  isOpen: boolean;
  label: string;
  todayHoursLabel: string | null;
};

/** Returns null when the store hasn't set up hours at all — callers should
 * hide the open/closed UI rather than show a misleading default. */
export function computeStoreOpenStatus(
  businessHours: BusinessHoursMap | null | undefined,
  now: Date = new Date(),
): StoreOpenStatus | null {
  if (!businessHours || Object.keys(businessHours).length === 0) {
    return null;
  }

  const todayKey = getDayKey(now);
  const today = businessHours[todayKey];
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  if (!today || today.closed) {
    const next = findNextOpenDay(businessHours, now);
    return {
      isOpen: false,
      label: next ? `Closed · Opens ${next.label} at ${next.openTime}` : "Closed today",
      todayHoursLabel: null,
    };
  }

  const openMinutes = parseTimeToMinutes(today.open);
  const closeMinutes = parseTimeToMinutes(today.close);
  const todayHoursLabel =
    openMinutes != null && closeMinutes != null
      ? `${formatTimeLabel(today.open)} – ${formatTimeLabel(today.close)}`
      : null;

  if (openMinutes == null || closeMinutes == null) {
    return { isOpen: false, label: "Hours unavailable", todayHoursLabel };
  }

  const isOpen =
    closeMinutes > openMinutes
      ? nowMinutes >= openMinutes && nowMinutes < closeMinutes
      : nowMinutes >= openMinutes || nowMinutes < closeMinutes; // overnight hours

  if (isOpen) {
    return {
      isOpen: true,
      label: `Open now · Closes ${formatTimeLabel(today.close)}`,
      todayHoursLabel,
    };
  }

  if (nowMinutes < openMinutes) {
    return {
      isOpen: false,
      label: `Closed · Opens today at ${formatTimeLabel(today.open)}`,
      todayHoursLabel,
    };
  }

  const next = findNextOpenDay(businessHours, now);
  return {
    isOpen: false,
    label: next ? `Closed · Opens ${next.label} at ${next.openTime}` : "Closed",
    todayHoursLabel,
  };
}

export function getWeekScheduleRows(businessHours: BusinessHoursMap) {
  return STORE_HOURS_DAY_KEYS.map((key, index) => {
    const day = businessHours[key];
    const hours =
      !day || day.closed
        ? "Closed"
        : day.open && day.close
          ? `${formatTimeLabel(day.open)} – ${formatTimeLabel(day.close)}`
          : "Closed";
    return { key, day: DAY_LABELS[index], hours };
  });
}
