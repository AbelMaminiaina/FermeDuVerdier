import type { Metadata } from 'next';
import localFont from 'next/font/local';
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

// Typographie reprise de la maquette ShopWise : Roboto (texte), Quicksand (titres), Inter (menu).
// Les trois polices sont hébergées dans le projet (next/font/local) : next/font/google (Next 14)
// ne sait pas lire les URLs « /l/font?kit=… » que Google sert selon la police et le pays, ce qui
// faisait échouer le build (Roboto en local, Quicksand sur le VPS). Le build ne dépend plus de Google.
const inter = localFont({
  src: './fonts/inter-latin-variable.woff2',
  weight: '100 900',
  display: 'swap',
  variable: '--font-inter',
});

const roboto = localFont({
  src: './fonts/roboto-latin-variable.woff2',
  weight: '300 700',
  display: 'swap',
  variable: '--font-roboto',
});

const quicksand = localFont({
  src: './fonts/quicksand-latin-variable.woff2',
  weight: '400 700',
  display: 'swap',
  variable: '--font-quicksand',
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
    <html lang="fr" className={`${inter.variable} ${roboto.variable} ${quicksand.variable}`} suppressHydrationWarning>
      <head>
        <OrganizationJsonLd />
        <LocalBusinessJsonLd />
        <WebsiteJsonLd />
      </head>
      <body className="font-sans" suppressHydrationWarning>
        <SessionProvider>
          <ToastProvider>
            {/* overflow-x-clip (et non hidden) : coupe les animations qui glissent hors écran sans casser le header sticky */}
            <div className="flex flex-col min-h-screen overflow-x-clip">
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
