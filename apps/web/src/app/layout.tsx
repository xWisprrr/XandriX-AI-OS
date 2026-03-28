import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'XandriX Chat',
  description: 'XandriX AI OS — secure web AI assistant with full project awareness',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
