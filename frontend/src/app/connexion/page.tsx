'use client';

import React from 'react';
import { signIn } from 'next-auth/react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui';
import { fadeInUp } from '@/lib/animations';

function ConnexionContent() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const error = searchParams.get('error');

  return (
    <div className="min-h-screen bg-cream-50 py-12">
      <div className="container mx-auto px-4">
        <motion.div
          className="max-w-md mx-auto"
          variants={fadeInUp}
          initial="initial"
          animate="animate"
        >
          {/* Back link */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-warm-600 hover:text-prairie-600 mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour à l&apos;accueil
          </Link>

          <div className="bg-white rounded-xl p-8 shadow-sm">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-display font-bold text-warm-800 mb-2">
                Connexion
              </h1>
              <p className="text-warm-600">
                Connectez-vous pour passer votre commande
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error === 'OAuthSignin' && 'Erreur lors de la connexion. Veuillez réessayer.'}
                {error === 'OAuthCallback' && 'Erreur de callback. Veuillez réessayer.'}
                {error === 'OAuthCreateAccount' && 'Impossible de créer le compte.'}
                {error === 'Callback' && 'Erreur de connexion.'}
                {error === 'CredentialsSignin' && 'Email ou mot de passe incorrect.'}
                {!['OAuthSignin', 'OAuthCallback', 'OAuthCreateAccount', 'Callback', 'CredentialsSignin'].includes(error) &&
                  'Une erreur est survenue. Veuillez réessayer.'}
              </div>
            )}

            <div className="space-y-4">
              {/* Google */}
              <button
                onClick={() => signIn('google', { callbackUrl })}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-warm-300 rounded-lg hover:bg-warm-50 transition-colors"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span className="font-medium text-warm-700">Continuer avec Google</span>
              </button>

              {/* Facebook */}
              <button
                onClick={() => signIn('facebook', { callbackUrl })}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[#1877F2] text-white rounded-lg hover:bg-[#166FE5] transition-colors"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                <span className="font-medium">Continuer avec Facebook</span>
              </button>
            </div>

            <div className="mt-8 pt-6 border-t border-warm-100 text-center">
              <p className="text-sm text-warm-500">
                En vous connectant, vous acceptez nos{' '}
                <Link href="/cgv" className="text-prairie-600 hover:underline">
                  conditions générales
                </Link>{' '}
                et notre{' '}
                <Link href="/politique-confidentialite" className="text-prairie-600 hover:underline">
                  politique de confidentialité
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function ConnexionPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-cream-50 flex items-center justify-center">Chargement...</div>}>
      <ConnexionContent />
    </Suspense>
  );
}
