import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Singapore Airlines Roblox - Staff Portal',
  description: 'Staff and Server Management Portal',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-brand-dark text-brand-light">{children}</body>
    </html>
  );
}
