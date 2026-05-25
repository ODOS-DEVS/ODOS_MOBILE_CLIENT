export function formatCurrency(value: number, currency = "GHS") {
  const amount = Number.isFinite(value) ? value : 0;
  if (currency === "GHS") {
    return `₵${amount.toFixed(2)}`;
  }

  return `${currency} ${amount.toFixed(2)}`;
}
