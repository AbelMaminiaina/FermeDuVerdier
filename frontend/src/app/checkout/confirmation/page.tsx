'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  CheckCircle,
  Phone,
  Smartphone,
  CreditCard,
  Home,
  ShoppingBag,
  Copy,
  MessageCircle,
} from 'lucide-react';
import { Button } from '@/components/ui';
import { fadeInUp } from '@/lib/animations';

const paymentInstructions: Record<string, { name: string; steps: string[]; number: string; color: string }> = {
  mvola: {
    name: 'MVola',
    color: 'bg-yellow-500',
    number: '034 00 000 00',
    steps: [
      'Composez #111# sur votre téléphone Telma',
      'Sélectionnez "Envoi d\'argent"',
      'Entrez le numéro: 034 00 000 00',
      'Entrez le montant de votre commande',
      'Confirmez avec votre code PIN',
      'Envoyez le numéro de transaction par WhatsApp',
    ],
  },
  orange_money: {
    name: 'Orange Money',
    color: 'bg-orange-500',
    number: '032 00 000 00',
    steps: [
      'Composez #144# sur votre téléphone Orange',
      'Sélectionnez "Transfert d\'argent"',
      'Entrez le numéro: 032 00 000 00',
      'Entrez le montant de votre commande',
      'Confirmez avec votre code PIN',
      'Envoyez le numéro de transaction par WhatsApp',
    ],
  },
  airtel_money: {
    name: 'Airtel Money',
    color: 'bg-red-500',
    number: '033 00 000 00',
    steps: [
      'Composez *444# sur votre téléphone Airtel',
      'Sélectionnez "Envoi d\'argent"',
      'Entrez le numéro: 033 00 000 00',
      'Entrez le montant de votre commande',
      'Confirmez avec votre code PIN',
      'Envoyez le numéro de transaction par WhatsApp',
    ],
  },
  stripe: {
    name: 'Carte bancaire',
    color: 'bg-indigo-500',
    number: '',
    steps: [
      'Vous allez recevoir un lien de paiement par email',
      'Cliquez sur le lien pour accéder à la page de paiement sécurisée',
      'Entrez les informations de votre carte bancaire',
      'Confirmez le paiement',
      'Vous recevrez une confirmation par email',
    ],
  },
};

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('order') || 'N/A';
  const paymentMethod = searchParams.get('payment') || 'mvola';
  const instructions = paymentInstructions[paymentMethod] || paymentInstructions.mvola;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const whatsappMessage = encodeURIComponent(
    `Bonjour, je viens de passer la commande ${orderNumber}. Voici mon numéro de transaction: `
  );

  return (
    <div className="min-h-screen bg-cream-50 py-12">
      <div className="container mx-auto px-4">
        <motion.div
          className="max-w-2xl mx-auto"
          variants={fadeInUp}
          initial="initial"
          animate="animate"
        >
          {/* Success header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-full bg-prairie-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-10 w-10 text-prairie-600" />
            </div>
            <h1 className="text-3xl font-display font-bold text-warm-800 mb-2">
              Commande confirmée !
            </h1>
            <p className="text-warm-600">
              Merci pour votre commande. Voici les instructions pour finaliser votre paiement.
            </p>
          </div>

          {/* Order number */}
          <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-warm-600">Numéro de commande</p>
                <p className="text-2xl font-bold text-warm-800">{orderNumber}</p>
              </div>
              <button
                onClick={() => copyToClipboard(orderNumber)}
                className="p-2 hover:bg-warm-100 rounded-lg transition-colors"
                title="Copier"
              >
                <Copy className="h-5 w-5 text-warm-600" />
              </button>
            </div>
          </div>

          {/* Payment instructions */}
          <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className={`w-12 h-12 ${instructions.color} rounded-lg flex items-center justify-center`}>
                {paymentMethod === 'stripe' ? (
                  <CreditCard className="h-6 w-6 text-white" />
                ) : (
                  <Smartphone className="h-6 w-6 text-white" />
                )}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-warm-800">
                  Paiement par {instructions.name}
                </h2>
                {instructions.number && (
                  <p className="text-warm-600">Numéro: {instructions.number}</p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium text-warm-800">Instructions de paiement :</h3>
              <ol className="space-y-3">
                {instructions.steps.map((step, index) => (
                  <li key={index} className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-prairie-100 text-prairie-600 flex items-center justify-center text-sm font-medium shrink-0">
                      {index + 1}
                    </span>
                    <span className="text-warm-700">{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Copy number button */}
            {instructions.number && (
              <button
                onClick={() => copyToClipboard(instructions.number)}
                className="mt-6 w-full flex items-center justify-center gap-2 p-3 bg-warm-100 hover:bg-warm-200 rounded-lg transition-colors"
              >
                <Copy className="h-4 w-4" />
                <span>Copier le numéro {instructions.number}</span>
              </button>
            )}
          </div>

          {/* WhatsApp contact */}
          {paymentMethod !== 'stripe' && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6">
              <div className="flex items-start gap-4">
                <MessageCircle className="h-6 w-6 text-green-600 shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-green-800 mb-2">
                    Confirmez votre paiement
                  </h3>
                  <p className="text-green-700 text-sm mb-4">
                    Après avoir effectué le paiement, envoyez-nous le numéro de transaction
                    par WhatsApp pour que nous puissions traiter votre commande rapidement.
                  </p>
                  <a
                    href={`https://wa.me/261380100101?text=${whatsappMessage}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Envoyer sur WhatsApp
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Contact info */}
          <div className="bg-warm-100 rounded-xl p-6 mb-8">
            <h3 className="font-semibold text-warm-800 mb-3">Besoin d&apos;aide ?</h3>
            <div className="flex items-center gap-2 text-warm-700">
              <Phone className="h-4 w-4" />
              <span>Appelez-nous au </span>
              <a href="tel:+261380100101" className="font-medium text-prairie-600 hover:underline">
                038 01 001 01
              </a>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/">
              <Button variant="outline" icon={<Home className="h-4 w-4" />}>
                Retour à l&apos;accueil
              </Button>
            </Link>
            <Link href="/produits">
              <Button icon={<ShoppingBag className="h-4 w-4" />}>
                Continuer mes achats
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-cream-50 flex items-center justify-center">Chargement...</div>}>
      <ConfirmationContent />
    </Suspense>
  );
}
