import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Hostel Management System',
  description: 'Premium Hostel Management Solution',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
