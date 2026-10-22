export function formatCurrency(value: number, currency = "GHS") {
  const amount = Number.isFinite(value) ? value : 0;
  if (currency === "GHS") {
    return `₵${amount.toFixed(2)}`;
  }

  return `${currency} ${amount.toFixed(2)}`;
}

/**
 * Money that has to fit in a metric strip: ₵4.3k, ₵1.2M, ₵840.
 *
 * Distinct from `formatCompactCurrency` in utils/vendorAnalytics, which spells
 * out the ISO code ("GHS 4.3k") for analytics panels with room for it. In a
 * row of four metrics on a small phone the code costs more width than it adds.
 */
export function formatCurrencyCompact(value: number, currency = "GHS") {
  const amount = Number.isFinite(value) ? value : 0;
  const symbol = currency === "GHS" ? "₵" : `${currency} `;
  const abs = Math.abs(amount);

  if (abs >= 1_000_000) {
    return `${symbol}${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (abs >= 1_000) {
    return `${symbol}${(amount / 1_000).toFixed(abs >= 10_000 ? 0 : 1)}k`;
  }
  return `${symbol}${Math.round(amount)}`;
}
