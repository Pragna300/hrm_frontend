/** Format amounts in Indian Rupees for UI (backend may still store generic `currency` on invoices). */
export function formatInr(amount, { maximumFractionDigits = 0 } = {}) {
  const n = Number(amount);
  if (!Number.isFinite(n)) return '₹0';
  return `₹${n.toLocaleString('en-IN', { maximumFractionDigits })}`;
}
