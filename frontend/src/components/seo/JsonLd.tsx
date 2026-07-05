import Script from 'next/script';

// Organisation / Entreprise
export function OrganizationJsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Ferme du Vardier',
    alternateName: 'La Ferme du Vardier',
    url: 'https://fermeduvardier.com',
    logo: 'https://fermeduvardier.com/images/logo.png',
    description:
      'Élevage de qualité à Madagascar - Porcs, poulets fermiers, pintades, cailles et poissons frais. Produits locaux de la ferme directement chez vous.',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Lot IF 210',
      addressLocality: 'Ambatofotsy Ambohimalaza',
      addressRegion: 'Analamanga',
      addressCountry: 'MG',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'contact@fermeduvardier.com',
      contactType: 'customer service',
      availableLanguage: ['French', 'Malagasy'],
    },
    sameAs: [
      'https://www.facebook.com/fermeduvardier',
      'https://www.instagram.com/fermeduvardier',
    ],
  };

  return (
    <Script
      id="organization-jsonld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

// Entreprise locale / Ferme
export function LocalBusinessJsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': 'https://fermeduvardier.com/#localbusiness',
    name: 'Ferme du Vardier',
    image: 'https://fermeduvardier.com/images/logo.png',
    description:
      'Ferme d\'élevage à Madagascar proposant viande de porc, poulets fermiers Akoho Gasy, pintades Akanga, cailles et poissons tilapia frais.',
    url: 'https://fermeduvardier.com',
    email: 'contact@fermeduvardier.com',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Lot IF 210',
      addressLocality: 'Ambatofotsy Ambohimalaza',
      addressRegion: 'Analamanga',
      postalCode: '103',
      addressCountry: 'MG',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: -18.8792,
      longitude: 47.5079,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '08:00',
        closes: '17:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'Saturday',
        opens: '08:00',
        closes: '12:00',
      },
    ],
    priceRange: '$$',
    currenciesAccepted: 'MGA',
    paymentAccepted: 'Cash, Mobile Money',
  };

  return (
    <Script
      id="localbusiness-jsonld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

// Produit
interface ProductJsonLdProps {
  name: string;
  description: string;
  image: string;
  price: number;
  currency?: string;
  availability?: 'InStock' | 'OutOfStock' | 'PreOrder';
  sku?: string;
  slug: string;
}

export function ProductJsonLd({
  name,
  description,
  image,
  price,
  currency = 'MGA',
  availability = 'InStock',
  sku,
  slug,
}: ProductJsonLdProps) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description,
    image: image.startsWith('http')
      ? image
      : `https://fermeduvardier.com${image}`,
    url: `https://fermeduvardier.com/produits/${slug}`,
    sku: sku || slug,
    brand: {
      '@type': 'Brand',
      name: 'Ferme du Vardier',
    },
    offers: {
      '@type': 'Offer',
      price: price,
      priceCurrency: currency,
      availability: `https://schema.org/${availability}`,
      seller: {
        '@type': 'Organization',
        name: 'Ferme du Vardier',
      },
    },
  };

  return (
    <Script
      id={`product-jsonld-${slug}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

// Fil d'Ariane (Breadcrumb)
interface BreadcrumbItem {
  name: string;
  url: string;
}

export function BreadcrumbJsonLd({ items }: { items: BreadcrumbItem[] }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <Script
      id="breadcrumb-jsonld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

// FAQ
interface FAQItem {
  question: string;
  answer: string;
}

export function FAQJsonLd({ items }: { items: FAQItem[] }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return (
    <Script
      id="faq-jsonld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

// WebSite avec SearchAction
export function WebsiteJsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Ferme du Vardier',
    url: 'https://fermeduvardier.com',
    description:
      'Élevage de qualité à Madagascar - Porcs, poulets fermiers, pintades, cailles et poissons frais.',
    inLanguage: 'fr-MG',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://fermeduvardier.com/produits?search={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <Script
      id="website-jsonld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
