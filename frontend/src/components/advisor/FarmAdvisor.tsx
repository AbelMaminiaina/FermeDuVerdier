'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Send } from 'lucide-react';
import { Button } from '@/components/ui';
import ProductGrid from '@/components/products/ProductGrid';
import { askAdvisor, AdvisorResponse } from '@/lib/api/advisor';
import { fadeInUp, viewportOnce } from '@/lib/animations';

const SUGGESTIONS = [
  'Je débute un petit élevage de poules',
  'Un repas pour 10 personnes ce week-end',
  'Je veux des œufs frais toute la semaine',
];

interface FarmAdvisorProps {
  className?: string;
}

// Conseiller IA : le client décrit son besoin, le backend propose des produits du catalogue
export function FarmAdvisor({ className = 'py-16 bg-cream-50' }: FarmAdvisorProps) {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState<AdvisorResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const ask = async (text: string) => {
    const trimmed = text.trim();
    if (trimmed.length < 3 || loading) return;

    setQuestion(trimmed);
    setLoading(true);
    setError(null);
    try {
      setAnswer(await askAdvisor(trimmed));
    } catch (err) {
      setAnswer(null);
      setError(err instanceof Error ? err.message : 'Le conseiller est indisponible pour le moment');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    ask(question);
  };

  return (
    <section className={className}>
      <div className="container mx-auto px-4">
        <motion.div
          className="max-w-2xl mx-auto text-center mb-8"
          variants={fadeInUp}
          initial="initial"
          whileInView="animate"
          viewport={viewportOnce}
        >
          <span className="inline-flex items-center gap-2 text-prairie-600 font-medium mb-2">
            <Sparkles className="h-4 w-4" />
            Conseiller de la ferme
          </span>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-warm-800 mb-2">
            Besoin d&apos;un conseil ?
          </h2>
          <p className="text-warm-600">
            Décrivez votre besoin, notre conseiller vous propose les produits adaptés.
          </p>
        </motion.div>

        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              maxLength={500}
              placeholder="Ex. : je veux commencer un élevage de poules pondeuses"
              aria-label="Votre question au conseiller"
              className="flex-1 min-w-0 rounded-md border border-warm-200 bg-white px-4 py-3 text-warm-800 placeholder:text-warm-400 focus:outline-none focus:ring-[3px] focus:ring-prairie-200 focus:border-prairie-500"
            />
            <Button
              type="submit"
              loading={loading}
              disabled={question.trim().length < 3}
              icon={<Send className="h-4 w-4" />}
            >
              Conseillez-moi
            </Button>
          </div>

          <div className="flex flex-wrap justify-center gap-2 mt-4">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => ask(s)}
                disabled={loading}
                className="rounded-full border border-warm-200 bg-white px-3 py-1.5 text-sm text-warm-600 hover:border-prairie-400 hover:text-prairie-700 transition-colors disabled:opacity-50"
              >
                {s}
              </button>
            ))}
          </div>
        </form>

        {error && (
          <p role="alert" className="max-w-2xl mx-auto mt-6 text-center text-red-600">
            {error}
          </p>
        )}

        <div className="mt-10" aria-live="polite">
          {loading && (
            <p className="text-center text-warm-500 animate-pulse">Le conseiller réfléchit…</p>
          )}
          {answer && !loading && (
            <>
              <p className="max-w-2xl mx-auto mb-8 rounded-lg bg-white border border-prairie-100 px-5 py-4 text-warm-700">
                {answer.message}
              </p>
              {answer.products.length > 0 && <ProductGrid products={answer.products} />}
            </>
          )}
        </div>
      </div>
    </section>
  );
}

export default FarmAdvisor;
