export type StarIconName = "star" | "star-half" | "star-outline";

const MIN_RATING = 0.5;
const MAX_RATING = 5;

export function clampHalfStepRating(value: number, allowZero = false) {
  if (!Number.isFinite(value)) {
    return allowZero ? 0 : MIN_RATING;
  }

  if (value <= 0) {
    return allowZero ? 0 : MIN_RATING;
  }

  const rounded = Math.round(value * 2) / 2;
  return Math.max(allowZero ? 0 : MIN_RATING, Math.min(MAX_RATING, rounded));
}

export function getHalfStepRatingFromLocation(locationX: number, width: number) {
  if (!Number.isFinite(locationX) || !Number.isFinite(width) || width <= 0) {
    return 0;
  }

  const clampedX = Math.max(0, Math.min(locationX, width));
  if (clampedX <= 0) {
    return MIN_RATING;
  }

  const rawRating = (clampedX / width) * MAX_RATING;
  return Math.min(MAX_RATING, Math.max(MIN_RATING, Math.ceil(rawRating * 2) / 2));
}

export function getStarIconName(star: number, rating: number): StarIconName {
  const safeRating = Number.isFinite(rating) ? rating : 0;

  if (safeRating >= star) {
    return "star";
  }

  if (safeRating >= star - 0.5) {
    return "star-half";
  }

  return "star-outline";
}
