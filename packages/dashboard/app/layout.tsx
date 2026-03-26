import { ClerkProvider } from '@clerk/nextjs';
import type { Metadata } from 'next';
import { TRPCProvider } from '../lib/trpc/provider';
import { Providers } from './providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'Reivo - AI Agent Cost Visibility',
  description: 'Visualize token consumption and auto-stop runaway AI agents',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className="min-h-screen antialiased">
          <TRPCProvider>
            <Providers>{children}</Providers>
          </TRPCProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
