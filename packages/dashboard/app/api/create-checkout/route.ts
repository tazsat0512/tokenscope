import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { PLANS, stripe } from '../../../lib/stripe';

export async function POST() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: PLANS.pro.stripePriceId,
        quantity: 1,
      },
    ],
    metadata: { userId },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/billing?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/billing?canceled=true`,
  });

  return NextResponse.json({ url: session.url });
}
