import { Suspense } from 'react';
import { Hero } from '@/components/home/Hero';
import { Story } from '@/components/home/Story';
import { Values } from '@/components/home/Values';
import { FeaturedProducts } from '@/components/home/FeaturedProducts';
import { Testimonials } from '@/components/home/Testimonials';
import { CTASection } from '@/components/home/CTASection';

export default function HomePage() {
  return (
    <>
      <Hero />
      <Values />
      <Suspense fallback={
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl overflow-hidden border border-warm-100 animate-pulse">
                  <div className="aspect-square bg-warm-200" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-warm-200 rounded w-3/4" />
                    <div className="h-3 bg-warm-200 rounded w-1/2" />
                    <div className="h-6 bg-warm-200 rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      }>
        <FeaturedProducts />
      </Suspense>
      <Story />
      <Testimonials />
      <CTASection />
    </>
  );
}
