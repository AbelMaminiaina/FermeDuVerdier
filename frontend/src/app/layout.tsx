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
    default: 'Ferme du Vardier - Élevage Porcin et Pisciculture à Madagascar',
    template: '%s | Ferme du Vardier',
  },
  icons: {
    icon: '/images/logo.jpeg',
    shortcut: '/images/logo.jpeg',
    apple: '/images/logo.jpeg',
  },
  description:
    'Découvrez notre élevage porcin et notre pisciculture de qualité à Madagascar. Viande de porc et poissons frais. Livraison à Antananarivo et environs. Élevage responsable depuis 2024.',
  keywords: [
    'élevage porcin',
    'pisciculture',
    'Madagascar',
    'Antananarivo',
    'Ambatolampy',
    'viande de porc',
    'poissons frais',
    'ferme',
    'élevage responsable',
    'qualité',
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
    title: 'Ferme du Vardier - Élevage Porcin et Pisciculture',
    description:
      'Viande de porc et poissons frais de qualité. Livraison à Antananarivo et environs.',
    images: [
      {
        url: '/images/porc/test3.jpeg',
        width: 1200,
        height: 630,
        alt: 'Ferme du Vardier - Élevage porcin',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ferme du Vardier - Élevage Porcin et Pisciculture',
    description:
      'Viande de porc et poissons frais de qualité. Livraison à Antananarivo et environs.',
    images: ['/images/porc/test3.jpeg'],
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
