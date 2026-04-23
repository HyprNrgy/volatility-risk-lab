import type { Metadata } from 'next';
import './globals.css'; // Global styles
import TickerTape from '@/components/TickerTape';

import GlobalAlerts from '@/components/GlobalAlerts';

export const metadata: Metadata = {
  title: 'Volatility Risk Lab',
  description: 'A platform for analyzing volatility and risk.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className="bg-zinc-950 font-sans selection:bg-indigo-500/30">
        <TickerTape />
        {children}
        <GlobalAlerts />
      </body>
    </html>
  );
}
