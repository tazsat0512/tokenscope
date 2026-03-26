import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { users } from '../../../../db/schema';
import { db } from '../../../../lib/db';
import { syncUserToKV } from '../../../../lib/kv-sync';
import { stripe } from '../../../../lib/stripe';

export async function POST(request: Request) {
  const body = await request.text();
  const sig = request.headers.get('stripe-signature');

  if (!sig) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event: ReturnType<typeof stripe.webhooks.constructEvent>;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (_err) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      const userId = session.metadata?.userId;
      if (userId) {
        await db
          .update(users)
          .set({
            plan: 'pro',
            stripeCustomerId: session.customer as string,
            updatedAt: new Date(),
          })
          .where(eq(users.id, userId));
        // Sync updated plan to proxy KV
        const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
        if (user[0]) await syncUserToKV(user[0]).catch(console.error);
      }
      break;
    }
    case 'customer.subscription.deleted': {
      const subscription = event.data.object;
      const customerId = subscription.customer as string;
      await db
        .update(users)
        .set({ plan: 'free', updatedAt: new Date() })
        .where(eq(users.stripeCustomerId, customerId));
      // Sync downgrade to proxy KV
      const downgraded = await db
        .select()
        .from(users)
        .where(eq(users.stripeCustomerId, customerId))
        .limit(1);
      if (downgraded[0]) await syncUserToKV(downgraded[0]).catch(console.error);
      break;
    }
  }

  return NextResponse.json({ received: true });
}
