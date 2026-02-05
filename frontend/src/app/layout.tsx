import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ToastProvider } from '@/components/ui/Toast';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-playfair',
});

export const metadata: Metadata = {
  title: {
    default: 'Ferme du Vardier - Œufs Bio et Poules Pondeuses à Madagascar',
    template: '%s | Ferme du Vardier',
  },
  description:
    'Découvrez nos œufs frais bio et nos poules pondeuses élevées en plein air à Madagascar. Livraison à Antananarivo et environs. Agriculture biologique et durable depuis 2010.',
  keywords: [
    'œufs bio',
    'poules pondeuses',
    'Madagascar',
    'Antananarivo',
    'Ambatolampy',
    'agriculture biologique',
    'œufs frais',
    'ferme avicole',
    'œufs fécondés',
    'poules plein air',
  ],
  authors: [{ name: 'Ferme du Vardier' }],
  creator: 'Ferme du Vardier',
  publisher: 'Ferme du Vardier',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://fermeduvardier.mg'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'fr_MG',
    url: 'https://fermeduvardier.mg',
    siteName: 'Ferme du Vardier',
    title: 'Ferme du Vardier - Œufs Bio et Poules Pondeuses',
    description:
      'Œufs frais bio et poules pondeuses élevées en plein air. Livraison à Antananarivo et environs.',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Ferme du Vardier - Poules en liberté',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ferme du Vardier - Œufs Bio et Poules Pondeuses',
    description:
      'Œufs frais bio et poules pondeuses élevées en plein air. Livraison à Antananarivo et environs.',
    images: ['/images/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${inter.variable} ${playfair.variable}`} suppressHydrationWarning>
      <body className="font-sans" suppressHydrationWarning>
        <ToastProvider>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </ToastProvider>
      </body>
    </html>
  );
}
