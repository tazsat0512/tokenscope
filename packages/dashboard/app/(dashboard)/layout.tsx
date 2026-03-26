import { auth, currentUser } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { Sidebar } from '../../components/ui/nav';
import { users } from '../../db/schema';
import { db } from '../../lib/db';

async function ensureUser() {
  const { userId } = await auth();
  if (!userId) return;

  const existing = await db.select({ id: users.id }).from(users).where(eq(users.id, userId)).limit(1);
  if (existing.length > 0) return;

  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses?.[0]?.emailAddress ?? '';

  await db
    .insert(users)
    .values({
      id: userId,
      email,
      plan: 'free',
      requestCount: 0,
      requestCountResetAt: Date.now(),
    })
    .onConflictDoNothing();
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  await ensureUser();

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}
