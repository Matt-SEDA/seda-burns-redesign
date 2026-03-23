import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SEDA Burns Dashboard',
  description: 'Live chain revenue and SEDA token burn tracking',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
