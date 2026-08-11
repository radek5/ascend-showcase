export function formatCurrency(
  amount: number,
  currency: string,
) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
  }).format(amount / 100);
}
