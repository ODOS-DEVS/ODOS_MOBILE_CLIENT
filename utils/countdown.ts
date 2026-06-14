export type CountdownParts = {
  totalSeconds: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

export function getSecondsRemaining(endsAt?: string | null, nowMs = Date.now()) {
  if (!endsAt) {
    return 0;
  }

  const endMs = new Date(endsAt).getTime();
  if (Number.isNaN(endMs)) {
    return 0;
  }

  return Math.max(Math.floor((endMs - nowMs) / 1000), 0);
}

export function splitCountdown(totalSeconds: number): CountdownParts {
  const safeTotal = Math.max(totalSeconds, 0);
  const days = Math.floor(safeTotal / 86_400);
  const hours = Math.floor((safeTotal % 86_400) / 3_600);
  const minutes = Math.floor((safeTotal % 3_600) / 60);
  const seconds = safeTotal % 60;

  return {
    totalSeconds: safeTotal,
    days,
    hours,
    minutes,
    seconds,
  };
}

export function formatCountdownLabel(
  totalSeconds: number,
  options?: { compact?: boolean },
) {
  const { days, hours, minutes, seconds } = splitCountdown(totalSeconds);

  if (totalSeconds <= 0) {
    return "Ended";
  }

  if (options?.compact) {
    if (days > 0) {
      return `${days}d ${hours}h`;
    }
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m ${seconds}s`;
  }

  if (days > 0) {
    return `${days}d ${String(hours).padStart(2, "0")}h ${String(minutes).padStart(2, "0")}m`;
  }

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function formatFlashEndsInLabel(totalSeconds: number) {
  if (totalSeconds <= 0) {
    return "Sale ended";
  }

  return `Ends in ${formatCountdownLabel(totalSeconds, { compact: true })}`;
}
