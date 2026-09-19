/**
 * Formats a numeric price to Indian Rupee (INR) currency representation.
 * e.g., 499 -> "₹499", 1250.5 -> "₹1,250.50"
 */
export function formatINR(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  if (isNaN(num)) return '₹0'

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(num)
}
