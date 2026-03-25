import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { TRPCProvider } from '../lib/trpc/provider';
import './globals.css';

export const metadata: Metadata = {
  title: 'TokenScope - AI Agent Cost Visibility',
  description: 'Visualize token consumption and auto-stop runaway AI agents',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="min-h-screen antialiased">
          <TRPCProvider>{children}</TRPCProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
