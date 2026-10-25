import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin']
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin']
});

export const metadata: Metadata = {
  title: 'Degalai.lt — Lietuvos Degalų Kainos Realiu Laiku',
  description:
    'Stebėkite ir lyginkite realaus laiko benzino 95, dyzelino ir LPG dujų kainas visoje Lietuvoje. Circle K, Neste, Viada, Orlen, Baltic Petroleum, Emsi, Saurida, Jozita.',
  keywords: [
    'degalų kainos',
    'kuro kainos',
    'benzinas 95 kaina',
    'dyzelinas kaina',
    'dujų kaina',
    'pigiausi degalai',
    'degalinės Lietuvoje',
    'Circle K kainos',
    'Neste kainos',
    'Viada kainos',
    'Saurida kainos'
  ],
  authors: [{ name: 'Degalai.lt Team' }],
  openGraph: {
    title: 'Degalai.lt — Lietuvos Degalų Kainos Realiu Laiku',
    description: 'Palyginkite realias benzino, dyzelino ir dujų kainas Lietuvos degalinėse interaktyviame žemėlapyje.',
    locale: 'lt_LT',
    type: 'website'
  }
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#090d16' }
  ],
  width: 'device-width',
  initialScale: 1
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="lt" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} min-h-screen flex flex-col antialiased selection:bg-emerald-500 selection:text-white`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
