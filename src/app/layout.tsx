import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AgentsGuard | Real-time Control & Reliability Layer for Agentic AI',
  description:
    'AgentsGuard sits between AI agents and operational tools: Guard before execution, verify outcomes afterward, learn from failures, and test fixes before approval.',
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🛡️</text></svg>',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
