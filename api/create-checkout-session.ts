import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import {
  NIGHTLY_RATE_MAJOR,
  ROOM_DISPLAY_NAMES,
  ROOM_MAX_GUESTS,
  calculateNights,
  majorUnitsToStripeUnitAmount,
} from '../constants/pricing';

function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key);
}

function getSiteUrl(req: VercelRequest): string {
  const configured = process.env.SITE_URL?.replace(/\/$/, '');
  if (configured) return configured;
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const proto =
    (req.headers['x-forwarded-proto'] as string) === 'https' || process.env.VERCEL
      ? 'https'
      : 'http';
  if (typeof host === 'string') return `${proto}://${host}`;
  return 'http://localhost:3000';
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    res.setHeader('Allow', 'POST');
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const stripe = getStripe();
  if (!stripe) {
    return res.status(503).json({ error: 'Stripe is not configured (missing STRIPE_SECRET_KEY).' });
  }

  const currency = (process.env.STRIPE_CURRENCY || 'usd').toLowerCase();

  let body: Record<string, unknown>;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } catch {
    return res.status(400).json({ error: 'Invalid JSON body' });
  }

  const roomId = String(body.roomId || '');
  const checkIn = String(body.checkIn || '');
  const checkOut = String(body.checkOut || '');
  const guests = Number(body.guests);
  const customerEmail = String(body.customerEmail || '').trim();
  const customerName = String(body.customerName || '').trim() || undefined;

  if (!roomId || NIGHTLY_RATE_MAJOR[roomId] === undefined) {
    return res.status(400).json({ error: 'Invalid room' });
  }

  if (!checkIn || !checkOut || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
    return res.status(400).json({ error: 'Missing or invalid dates / email' });
  }

  const nights = calculateNights(checkIn, checkOut);
  if (nights < 1) {
    return res.status(400).json({ error: 'Stay must be at least one night' });
  }

  const maxG = ROOM_MAX_GUESTS[roomId];
  if (!Number.isFinite(guests) || guests < 1 || guests > maxG) {
    return res.status(400).json({ error: 'Invalid guest count for this room' });
  }

  const nightlyMajor = NIGHTLY_RATE_MAJOR[roomId];
  const unitAmount = majorUnitsToStripeUnitAmount(nightlyMajor, currency);
  const roomName = ROOM_DISPLAY_NAMES[roomId] || roomId;
  const origin = getSiteUrl(req);

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: customerEmail,
      billing_address_collection: 'required',
      phone_number_collection: { enabled: true },
      line_items: [
        {
          price_data: {
            currency,
            product_data: {
              name: `${roomName} — Loma Beach Resort`,
              description: `${nights} night(s) · ${guests} guest(s) · Check-in ${checkIn} · Check-out ${checkOut}`,
            },
            unit_amount: unitAmount,
          },
          quantity: nights,
        },
      ],
      metadata: {
        room_id: roomId,
        check_in: checkIn,
        check_out: checkOut,
        guests: String(guests),
        customer_name: customerName ?? '',
      },
      success_url: `${origin}/?booking_success=1&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/?booking_cancel=1`,
    });

    return res.status(200).json({ url: session.url });
  } catch (e) {
    console.error('Stripe session error', e);
    const msg = e instanceof Error ? e.message : 'Checkout failed';
    return res.status(500).json({ error: msg });
  }
}
