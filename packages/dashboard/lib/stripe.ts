import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
});

export const PLANS = {
  free: {
    name: 'Free',
    requestLimit: 10_000,
    priceUsd: 0,
  },
  pro: {
    name: 'Pro',
    requestLimit: 100_000,
    priceUsd: 49,
    stripePriceId: process.env.STRIPE_PRO_PRICE_ID,
  },
} as const;
