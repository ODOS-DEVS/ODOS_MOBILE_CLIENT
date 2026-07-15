export const STORE_AUDIENCE_OPTIONS = [
  { label: "Ladies", value: "ladies" },
  { label: "Gents", value: "gents" },
  { label: "Kids", value: "kids" },
  { label: "Beauty", value: "beauty" },
  { label: "Groceries", value: "groceries" },
  { label: "Automobile", value: "automobile" },
] as const;

export type StoreAudienceSlug = (typeof STORE_AUDIENCE_OPTIONS)[number]["value"];

export function formatStoreAudienceLabel(slug: string) {
  const match = STORE_AUDIENCE_OPTIONS.find((option) => option.value === slug);
  if (match) {
    return match.label;
  }

  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
