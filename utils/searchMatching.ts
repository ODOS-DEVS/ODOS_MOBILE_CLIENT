const TOKEN_SPLIT_PATTERN = /[^a-z0-9]+/;

export function normalizeSearchText(value?: string | null): string {
  return (value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

export function tokenizeSearchText(value?: string | null): string[] {
  const normalized = normalizeSearchText(value);
  if (!normalized) return [];
  return normalized.split(TOKEN_SPLIT_PATTERN).filter((token) => token.length > 0);
}

export function tokenizeSearchQuery(query?: string | null): string[] {
  return normalizeSearchText(query).split(" ").filter(Boolean);
}

/** English singular/plural variants so "shoe" and "shoes" match the same items. */
export function getTermVariants(term: string): string[] {
  const word = term.trim().toLowerCase();
  if (!word) return [];

  const variants = new Set<string>([word]);
  if (word.length < 3) return [...variants];

  if (word.endsWith("ies") && word.length > 4) {
    variants.add(`${word.slice(0, -3)}y`);
  }

  if (word.endsWith("es") && word.length > 4) {
    variants.add(word.slice(0, -2));
    variants.add(word.slice(0, -1));
  }

  if (word.endsWith("s") && !word.endsWith("ss") && word.length > 3) {
    variants.add(word.slice(0, -1));
  }

  if (!word.endsWith("s")) {
    variants.add(`${word}s`);

    if (word.endsWith("y") && word.length > 2 && !/[aeiou]y$/.test(word)) {
      variants.add(`${word.slice(0, -1)}ies`);
    } else if (/(?:s|x|z|ch|sh)$/.test(word)) {
      variants.add(`${word}es`);
    }
  }

  return [...variants];
}

function variantsMatchToken(term: string, token: string): boolean {
  if (!term || !token) return false;

  const variants = getTermVariants(term);
  return variants.some(
    (variant) =>
      token === variant ||
      (variant.length >= 3 && token.startsWith(variant)) ||
      (token.length >= 3 && variant.startsWith(token)),
  );
}

export function termMatchesText(term: string, text: string): boolean {
  const normalizedText = normalizeSearchText(text);
  if (!normalizedText) return false;

  const tokens = tokenizeSearchText(normalizedText);
  if (tokens.some((token) => variantsMatchToken(term, token))) {
    return true;
  }

  return getTermVariants(term).some((variant) => normalizedText.includes(variant));
}

export function queryMatchesSearchableText(query: string, searchableText: string): boolean {
  const terms = tokenizeSearchQuery(query);
  if (terms.length === 0) return true;

  const normalizedSearchable = normalizeSearchText(searchableText);
  return terms.every((term) => termMatchesText(term, normalizedSearchable));
}

export type DiscoverySearchFields = {
  title?: string | null;
  description?: string | null;
  category?: string | null;
  subcategory?: string | null;
  categorySlugs?: string[] | null;
  subcategorySlugs?: string[] | null;
  placementTags?: string[] | null;
  storeTitle?: string | null;
  storeCategory?: string | null;
  marketTitle?: string | null;
  rating?: number | null;
};

export function buildDiscoverySearchText(fields: DiscoverySearchFields): string {
  return [
    fields.title,
    fields.description,
    fields.category,
    fields.subcategory,
    ...(fields.categorySlugs ?? []),
    ...(fields.subcategorySlugs ?? []),
    ...(fields.placementTags ?? []),
    fields.storeTitle,
    fields.storeCategory,
    fields.marketTitle,
  ]
    .filter(Boolean)
    .join(" ");
}

function scoreTermInField(term: string, fieldValue: string | null | undefined, weight: number): number {
  const normalizedField = normalizeSearchText(fieldValue);
  if (!normalizedField) return 0;

  const terms = tokenizeSearchQuery(term);
  if (terms.length === 0) return 0;

  let score = 0;
  const fieldTokens = tokenizeSearchText(normalizedField);

  for (const queryTerm of terms) {
    const variants = getTermVariants(queryTerm);

    if (variants.some((variant) => normalizedField === variant)) {
      score += weight * 1.4;
      continue;
    }

    if (variants.some((variant) => normalizedField.includes(variant))) {
      score += weight;
      continue;
    }

    if (fieldTokens.some((token) => variantsMatchToken(queryTerm, token))) {
      score += weight * 0.85;
    }
  }

  return score;
}

export function buildDiscoverySearchScore(query: string, fields: DiscoverySearchFields): number {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return 0;

  const searchableText = buildDiscoverySearchText(fields);
  if (!queryMatchesSearchableText(normalizedQuery, searchableText)) {
    return 0;
  }

  let score = 0;

  if (normalizeSearchText(fields.title).includes(normalizedQuery)) {
    score += 14;
  }
  if (normalizeSearchText(fields.marketTitle).includes(normalizedQuery)) {
    score += 12;
  }
  if (normalizeSearchText(fields.storeTitle).includes(normalizedQuery)) {
    score += 10;
  }
  if (
    normalizeSearchText(fields.category).includes(normalizedQuery) ||
    normalizeSearchText(fields.subcategory).includes(normalizedQuery)
  ) {
    score += 8;
  }
  if (normalizeSearchText(fields.description).includes(normalizedQuery)) {
    score += 4;
  }

  score += scoreTermInField(normalizedQuery, fields.title, 5);
  score += scoreTermInField(normalizedQuery, fields.marketTitle, 4.5);
  score += scoreTermInField(normalizedQuery, fields.storeTitle, 4);
  score += scoreTermInField(normalizedQuery, fields.category, 3);
  score += scoreTermInField(normalizedQuery, fields.subcategory, 3);
  score += scoreTermInField(normalizedQuery, fields.description, 1.5);
  score += scoreTermInField(normalizedQuery, fields.storeCategory, 2);
  score += scoreTermInField(
    normalizedQuery,
    (fields.placementTags ?? []).join(" "),
    1.2,
  );

  if (typeof fields.rating === "number") {
    score += fields.rating / 10;
  }

  return score;
}
