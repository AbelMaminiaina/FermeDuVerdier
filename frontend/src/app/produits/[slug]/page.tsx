import { notFound } from 'next/navigation';
import { unstable_noStore as noStore } from 'next/cache';
import { Metadata } from 'next';
import { API_BASE_URL } from '@/lib/api/config';
import ProductDetailClient from './ProductDetailClient';
import { getProductBySlug, getRelatedProducts as getLocalRelatedProducts } from '@/data/products';
import { ProductJsonLd, BreadcrumbJsonLd } from '@/components/seo/JsonLd';

async function getProduct(slug: string) {
  noStore();
  try {
    const res = await fetch(`${API_BASE_URL}/products/${slug}`);
    if (!res.ok) {
      // Fallback vers les données locales
      const localProduct = getProductBySlug(slug);
      return localProduct || null;
    }
    return res.json();
  } catch (error) {
    console.error('Error fetching product, using local data:', error);
    // Fallback vers les données locales
    const localProduct = getProductBySlug(slug);
    return localProduct || null;
  }
}

async function getRelatedProducts(slug: string, productId: string) {
  noStore();
  try {
    const res = await fetch(`${API_BASE_URL}/products/${slug}/related?limit=4`);
    if (!res.ok) {
      // Fallback vers les données locales
      return getLocalRelatedProducts(productId, 4);
    }
    return res.json();
  } catch (error) {
    console.error('Error fetching related products, using local data:', error);
    // Fallback vers les données locales
    return getLocalRelatedProducts(productId, 4);
  }
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Génération dynamique des métadonnées SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return {
      title: 'Produit non trouvé',
      description: 'Ce produit n\'existe pas ou n\'est plus disponible.',
    };
  }

  const imageUrl = product.images?.[0]?.startsWith('http')
    ? product.images[0]
    : `https://fermeduvardier.com${product.images?.[0] || '/images/logo.png'}`;

  return {
    title: product.name,
    description: product.shortDescription || product.description?.slice(0, 160),
    keywords: [
      product.name,
      product.category,
      'ferme du vardier',
      'madagascar',
      'produit fermier',
      'livraison antananarivo',
    ],
    openGraph: {
      title: `${product.name} | Ferme du Vardier`,
      description: product.shortDescription || product.description?.slice(0, 160),
      url: `https://fermeduvardier.com/produits/${slug}`,
      siteName: 'Ferme du Vardier',
      images: [
        {
          url: imageUrl,
          width: 800,
          height: 600,
          alt: product.name,
        },
      ],
      locale: 'fr_MG',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} | Ferme du Vardier`,
      description: product.shortDescription || product.description?.slice(0, 160),
      images: [imageUrl],
    },
    alternates: {
      canonical: `/produits/${slug}`,
    },
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;

  const product = await getProduct(slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = await getRelatedProducts(slug, product.id);

  const breadcrumbItems = [
    { name: 'Accueil', url: 'https://fermeduvardier.com' },
    { name: 'Produits', url: 'https://fermeduvardier.com/produits' },
    { name: product.name, url: `https://fermeduvardier.com/produits/${slug}` },
  ];

  return (
    <>
      <ProductJsonLd
        name={product.name}
        description={product.description}
        image={product.images?.[0] || '/images/logo.png'}
        price={product.price}
        availability={product.inStock ? 'InStock' : 'OutOfStock'}
        slug={slug}
      />
      <BreadcrumbJsonLd items={breadcrumbItems} />
      <ProductDetailClient
        product={product}
        relatedProducts={relatedProducts}
      />
    </>
  );
}
