import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ToastProvider } from '@/components/ui/Toast';
import { SessionProvider } from '@/components/providers/SessionProvider';
import {
  OrganizationJsonLd,
  LocalBusinessJsonLd,
  WebsiteJsonLd,
} from '@/components/seo/JsonLd';

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
    default: 'Ferme du Vardier - Élevage de Qualité à Madagascar | Porc, Poulet, Pintade, Poisson',
    template: '%s | Ferme du Vardier',
  },
  icons: {
    icon: '/images/logo.png',
    shortcut: '/images/logo.png',
    apple: '/images/logo.png',
  },
  description:
    'Ferme du Vardier à Madagascar : élevage de porcs, poulets fermiers Akoho Gasy, pintades Akanga, cailles et tilapia frais. Livraison à Antananarivo. Produits locaux de qualité supérieure.',
  keywords: [
    'ferme du vardier',
    'ferme du verdier',
    'ferme vardier',
    'ferme verdier',
    'vardier',
    'verdier',
    'ferme madagascar',
    'ferme de madagascar',
    'élevage porcin madagascar',
    'poulet fermier madagascar',
    'akoho gasy',
    'pintade akanga',
    'caille madagascar',
    'tilapia frais',
    'viande de porc antananarivo',
    'poisson frais madagascar',
    'élevage responsable',
    'produits fermiers madagascar',
    'livraison viande antananarivo',
    'volaille fermière',
    'pisciculture madagascar',
    'ferme élevage madagascar',
    'achat viande madagascar',
  ],
  authors: [{ name: 'Ferme du Vardier' }],
  creator: 'Ferme du Vardier',
  publisher: 'Ferme du Vardier',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://fermeduvardier.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'fr_MG',
    url: 'https://fermeduvardier.com',
    siteName: 'Ferme du Vardier',
    title: 'Ferme du Vardier - Élevage de Qualité à Madagascar',
    description:
      'Porcs, poulets Akoho Gasy, pintades Akanga, cailles et tilapia frais. Livraison à Antananarivo.',
    images: [
      {
        url: '/images/logo.png',
        width: 1200,
        height: 630,
        alt: 'Ferme du Vardier - Élevage de qualité à Madagascar',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ferme du Vardier - Élevage de Qualité à Madagascar',
    description:
      'Porcs, poulets Akoho Gasy, pintades Akanga, cailles et tilapia frais. Livraison à Antananarivo.',
    images: ['/images/logo.png'],
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
      <head>
        <OrganizationJsonLd />
        <LocalBusinessJsonLd />
        <WebsiteJsonLd />
      </head>
      <body className="font-sans" suppressHydrationWarning>
        <SessionProvider>
          <ToastProvider>
            <div className="flex flex-col min-h-screen">
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
          </ToastProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
