const usd = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

export function toCents(dollars: number): number {
  return Math.round(dollars * 100);
}

export function formatMoney(cents: number): string {
  return usd.format(cents / 100);
}
