import type { Metadata } from 'next';
import { Inter as FontSans } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { cn } from '@/lib/utils';

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'Svarka.bg - The best place to play Svarka online',
  description: 'Play the Bulgarian card game Svarka online with your friends.',
  openGraph: {
    title: 'Svarka.bg - The best place to play Svarka online',
    description: 'Play the Bulgarian card game Svarka online with your friends.',
    images: [
      {
        url: '/logo.png',
        width: 120,
        height: 40,
        alt: 'Svarka.bg Logo',
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          fontSans.variable
        )}
      >
        <div className="relative flex min-h-screen flex-col bg-background">
          <Header />
          <main className="container mx-auto p-4 flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
