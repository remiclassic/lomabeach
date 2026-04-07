/**
 * Nightly rates in major currency units (e.g. USD dollars, THB baht).
 * Must stay in sync with server-side booking validation (same file imported by API).
 */
export const NIGHTLY_RATE_MAJOR: Record<string, number> = {
  'beachfront-double': 245,
  'beachfront-family': 450,
  'triple-garden': 185,
  'double-garden': 140,
};

export const ROOM_MAX_GUESTS: Record<string, number> = {
  'beachfront-double': 2,
  'beachfront-family': 5,
  'triple-garden': 3,
  'double-garden': 2,
};

export const ROOM_DISPLAY_NAMES: Record<string, string> = {
  'beachfront-double': 'Beachfront Double',
  'beachfront-family': 'Beachfront Family Suite',
  'triple-garden': 'Triple Garden Retreat',
  'double-garden': 'Double Garden Sanctuary',
};

/** Stripe zero-decimal currencies — unit_amount is whole currency units. */
const ZERO_DECIMAL = new Set([
  'bif',
  'clp',
  'djf',
  'gnf',
  'jpy',
  'kmf',
  'krw',
  'mga',
  'pyg',
  'rwf',
  'ugx',
  'vnd',
  'vuv',
  'xaf',
  'xof',
  'xpf',
]);

export function majorUnitsToStripeUnitAmount(major: number, currency: string): number {
  const c = currency.toLowerCase();
  if (ZERO_DECIMAL.has(c)) {
    return Math.round(major);
  }
  return Math.round(major * 100);
}

export function calculateNights(checkIn: string, checkOut: string): number {
  const start = new Date(checkIn).getTime();
  const end = new Date(checkOut).getTime();
  const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : 0;
}
