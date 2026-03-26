import { ClerkProvider } from '@clerk/nextjs';
import type { Metadata } from 'next';
import { TRPCProvider } from '../lib/trpc/provider';
import { Providers } from './providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'Reivo — Same output. Half the cost.',
  description:
    'AI proxy that auto-routes requests to the cheapest model without losing quality. Budget control, loop detection, and cost dashboard included. One line to set up.',
  metadataBase: new URL('https://reivo.dev'),
  openGraph: {
    title: 'Reivo — Same output. Half the cost.',
    description:
      'AI proxy that cuts API costs 40-60% via smart model routing. Supports OpenAI, Anthropic, Google. One line change.',
    url: 'https://reivo.dev',
    siteName: 'Reivo',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Reivo — Same output. Half the cost.',
    description: 'AI proxy that cuts API costs 40-60% via smart model routing. One line to set up.',
  },
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
