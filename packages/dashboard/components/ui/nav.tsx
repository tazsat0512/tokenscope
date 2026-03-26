'use client';

import { UserButton } from '@clerk/nextjs';
import { Activity, BarChart3, Bot, CreditCard, RotateCcw, Settings } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '../../lib/utils';
import { Logo } from '../logo';
import { ThemeToggle } from '../theme-toggle';

const navItems = [
  { href: '/overview', label: 'Overview', icon: BarChart3 },
  { href: '/sessions', label: 'Sessions', icon: Activity },
  { href: '/agents', label: 'Agents', icon: Bot },
  { href: '/loops', label: 'Loops', icon: RotateCcw },
  { href: '/settings', label: 'Settings', icon: Settings },
  { href: '/billing', label: 'Billing', icon: CreditCard },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-64 flex-col border-r bg-card">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/overview" className="flex items-center">
          <Logo className="h-7" />
        </Link>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
              pathname === href
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="flex items-center justify-between border-t p-4">
        <UserButton />
        <ThemeToggle />
      </div>
    </aside>
  );
}
