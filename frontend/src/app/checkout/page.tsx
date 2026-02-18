'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  User,
  MapPin,
  Truck,
  CreditCard,
  ChevronRight,
  ChevronLeft,
  Store,
  Check,
  Phone,
  Smartphone,
} from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { formatPrice, getShippingCost } from '@/lib/utils';
import { Button, Input } from '@/components/ui';
import { createOrder } from '@/lib/api/checkout';
import { fadeInUp } from '@/lib/animations';

type Step = 'informations' | 'adresse' | 'livraison' | 'paiement';
type DeliveryMethod = 'standard' | 'express' | 'retrait';
type PaymentMethod = 'mvola' | 'orange_money' | 'airtel_money' | 'stripe';

interface CustomerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface AddressInfo {
  street: string;
  city: string;
  postalCode: string;
}

const steps: { id: Step; label: string; icon: React.ReactNode }[] = [
  { id: 'informations', label: 'Informations', icon: <User className="h-5 w-5" /> },
  { id: 'adresse', label: 'Adresse', icon: <MapPin className="h-5 w-5" /> },
  { id: 'livraison', label: 'Livraison', icon: <Truck className="h-5 w-5" /> },
  { id: 'paiement', label: 'Paiement', icon: <CreditCard className="h-5 w-5" /> },
];

const paymentMethods = [
  {
    id: 'mvola' as PaymentMethod,
    name: 'MVola',
    description: 'Paiement mobile Telma',
    icon: '/images/payments/mvola.png',
    color: 'bg-yellow-500',
  },
  {
    id: 'orange_money' as PaymentMethod,
    name: 'Orange Money',
    description: 'Paiement mobile Orange',
    icon: '/images/payments/orange-money.png',
    color: 'bg-orange-500',
  },
  {
    id: 'airtel_money' as PaymentMethod,
    name: 'Airtel Money',
    description: 'Paiement mobile Airtel',
    icon: '/images/payments/airtel-money.png',
    color: 'bg-red-500',
  },
  {
    id: 'stripe' as PaymentMethod,
    name: 'Carte bancaire',
    description: 'Visa, Mastercard, etc.',
    icon: '/images/payments/stripe.png',
    color: 'bg-indigo-500',
  },
];

export default function CheckoutPage() {
  const router = useRouter();
  const cart = useCart();
  const [currentStep, setCurrentStep] = useState<Step>('informations');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });
  const [addressInfo, setAddressInfo] = useState<AddressInfo>({
    street: '',
    city: '',
    postalCode: '',
  });
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('standard');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('mvola');
  const [notes, setNotes] = useState('');

  // Calculations
  const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingCost = deliveryMethod === 'retrait' ? 0 : getShippingCost(deliveryMethod, subtotal);
  const total = subtotal + shippingCost;

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);

  const goToNextStep = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex].id);
    }
  };

  const goToPrevStep = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex].id);
    }
  };

  const validateCurrentStep = (): boolean => {
    switch (currentStep) {
      case 'informations':
        return !!(customerInfo.firstName && customerInfo.lastName && customerInfo.email && customerInfo.phone);
      case 'adresse':
        if (deliveryMethod === 'retrait') return true;
        return !!(addressInfo.street && addressInfo.city);
      case 'livraison':
        return !!deliveryMethod;
      case 'paiement':
        return !!paymentMethod;
      default:
        return false;
    }
  };

  const handleSubmitOrder = async () => {
    if (!validateCurrentStep()) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await createOrder({
        items: cart.items,
        customer: {
          email: customerInfo.email,
          firstName: customerInfo.firstName,
          lastName: customerInfo.lastName,
          phone: customerInfo.phone,
        },
        shippingAddress: {
          street: addressInfo.street || 'Retrait en magasin',
          city: addressInfo.city || 'Ambatolampy Tsimahafotsy',
          postalCode: addressInfo.postalCode || '000',
        },
        deliveryMethod,
        notes: notes || undefined,
      });

      if (response.success && response.orderNumber) {
        cart.clearCart();
        router.push(`/checkout/confirmation?order=${response.orderNumber}&payment=${paymentMethod}`);
      } else {
        setError(response.message || 'Une erreur est survenue');
      }
    } catch (err) {
      setError('Erreur lors de la création de la commande. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-cream-50 py-12">
        <div className="container mx-auto px-4 text-center py-20">
          <h1 className="text-2xl font-display font-bold text-warm-800 mb-4">
            Votre panier est vide
          </h1>
          <Link href="/produits">
            <Button size="lg">Voir nos produits</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          className="mb-8"
          variants={fadeInUp}
          initial="initial"
          animate="animate"
        >
          <h1 className="text-3xl font-display font-bold text-warm-800 mb-2">
            Finaliser ma commande
          </h1>
        </motion.div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <button
                  onClick={() => index <= currentStepIndex && setCurrentStep(step.id)}
                  className={`flex flex-col items-center gap-2 ${
                    index <= currentStepIndex ? 'cursor-pointer' : 'cursor-default'
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                      index < currentStepIndex
                        ? 'bg-prairie-600 text-white'
                        : index === currentStepIndex
                        ? 'bg-prairie-600 text-white'
                        : 'bg-warm-200 text-warm-500'
                    }`}
                  >
                    {index < currentStepIndex ? <Check className="h-5 w-5" /> : step.icon}
                  </div>
                  <span
                    className={`text-sm font-medium hidden sm:block ${
                      index <= currentStepIndex ? 'text-prairie-600' : 'text-warm-500'
                    }`}
                  >
                    {step.label}
                  </span>
                </button>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-2 rounded ${
                      index < currentStepIndex ? 'bg-prairie-600' : 'bg-warm-200'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-2">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-xl p-6 shadow-sm"
            >
              {/* Step: Informations */}
              {currentStep === 'informations' && (
                <div>
                  <h2 className="text-xl font-semibold text-warm-800 mb-6 flex items-center gap-2">
                    <User className="h-5 w-5 text-prairie-600" />
                    Vos informations
                  </h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-warm-700 mb-2">
                        Prénom *
                      </label>
                      <Input
                        value={customerInfo.firstName}
                        onChange={(e) =>
                          setCustomerInfo({ ...customerInfo, firstName: e.target.value })
                        }
                        placeholder="Votre prénom"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-warm-700 mb-2">
                        Nom *
                      </label>
                      <Input
                        value={customerInfo.lastName}
                        onChange={(e) =>
                          setCustomerInfo({ ...customerInfo, lastName: e.target.value })
                        }
                        placeholder="Votre nom"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-warm-700 mb-2">
                        Email *
                      </label>
                      <Input
                        type="email"
                        value={customerInfo.email}
                        onChange={(e) =>
                          setCustomerInfo({ ...customerInfo, email: e.target.value })
                        }
                        placeholder="votre@email.com"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-warm-700 mb-2">
                        Téléphone *
                      </label>
                      <Input
                        type="tel"
                        value={customerInfo.phone}
                        onChange={(e) =>
                          setCustomerInfo({ ...customerInfo, phone: e.target.value })
                        }
                        placeholder="034 00 000 00"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step: Adresse */}
              {currentStep === 'adresse' && (
                <div>
                  <h2 className="text-xl font-semibold text-warm-800 mb-6 flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-prairie-600" />
                    Adresse de livraison
                  </h2>
                  {deliveryMethod === 'retrait' ? (
                    <div className="bg-prairie-50 rounded-lg p-4 text-center">
                      <Store className="h-12 w-12 text-prairie-600 mx-auto mb-3" />
                      <p className="text-warm-700 font-medium">Retrait en magasin</p>
                      <p className="text-warm-600 text-sm mt-1">
                        1 Chemin du Vardier, Ambatolampy Tsimahafotsy
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-warm-700 mb-2">
                          Adresse *
                        </label>
                        <Input
                          value={addressInfo.street}
                          onChange={(e) =>
                            setAddressInfo({ ...addressInfo, street: e.target.value })
                          }
                          placeholder="Numéro et nom de rue"
                          required
                        />
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-warm-700 mb-2">
                            Ville *
                          </label>
                          <Input
                            value={addressInfo.city}
                            onChange={(e) =>
                              setAddressInfo({ ...addressInfo, city: e.target.value })
                            }
                            placeholder="Antananarivo"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-warm-700 mb-2">
                            Code postal
                          </label>
                          <Input
                            value={addressInfo.postalCode}
                            onChange={(e) =>
                              setAddressInfo({ ...addressInfo, postalCode: e.target.value })
                            }
                            placeholder="101"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Step: Livraison */}
              {currentStep === 'livraison' && (
                <div>
                  <h2 className="text-xl font-semibold text-warm-800 mb-6 flex items-center gap-2">
                    <Truck className="h-5 w-5 text-prairie-600" />
                    Mode de livraison
                  </h2>
                  <div className="space-y-3">
                    {/* Retrait en magasin */}
                    <label
                      className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                        deliveryMethod === 'retrait'
                          ? 'border-prairie-600 bg-prairie-50'
                          : 'border-warm-200 hover:border-prairie-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="delivery"
                        value="retrait"
                        checked={deliveryMethod === 'retrait'}
                        onChange={() => setDeliveryMethod('retrait')}
                        className="sr-only"
                      />
                      <Store className={`h-8 w-8 ${deliveryMethod === 'retrait' ? 'text-prairie-600' : 'text-warm-400'}`} />
                      <div className="flex-1">
                        <p className="font-medium text-warm-800">Retrait en magasin</p>
                        <p className="text-sm text-warm-600">
                          Récupérez votre commande à la ferme
                        </p>
                      </div>
                      <span className="font-semibold text-prairie-600">Gratuit</span>
                    </label>

                    {/* Livraison standard */}
                    <label
                      className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                        deliveryMethod === 'standard'
                          ? 'border-prairie-600 bg-prairie-50'
                          : 'border-warm-200 hover:border-prairie-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="delivery"
                        value="standard"
                        checked={deliveryMethod === 'standard'}
                        onChange={() => setDeliveryMethod('standard')}
                        className="sr-only"
                      />
                      <Truck className={`h-8 w-8 ${deliveryMethod === 'standard' ? 'text-prairie-600' : 'text-warm-400'}`} />
                      <div className="flex-1">
                        <p className="font-medium text-warm-800">Livraison standard</p>
                        <p className="text-sm text-warm-600">Livraison sous 24-48h</p>
                      </div>
                      <span className="font-semibold text-warm-800">
                        {subtotal >= 100000 ? (
                          <span className="text-prairie-600">Gratuit</span>
                        ) : (
                          formatPrice(10000)
                        )}
                      </span>
                    </label>

                    {/* Livraison express */}
                    <label
                      className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                        deliveryMethod === 'express'
                          ? 'border-prairie-600 bg-prairie-50'
                          : 'border-warm-200 hover:border-prairie-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="delivery"
                        value="express"
                        checked={deliveryMethod === 'express'}
                        onChange={() => setDeliveryMethod('express')}
                        className="sr-only"
                      />
                      <Truck className={`h-8 w-8 ${deliveryMethod === 'express' ? 'text-prairie-600' : 'text-warm-400'}`} />
                      <div className="flex-1">
                        <p className="font-medium text-warm-800">Livraison express</p>
                        <p className="text-sm text-warm-600">Livraison le jour même</p>
                      </div>
                      <span className="font-semibold text-warm-800">{formatPrice(20000)}</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Step: Paiement */}
              {currentStep === 'paiement' && (
                <div>
                  <h2 className="text-xl font-semibold text-warm-800 mb-6 flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-prairie-600" />
                    Mode de paiement
                  </h2>
                  <div className="grid md:grid-cols-2 gap-3">
                    {paymentMethods.map((method) => (
                      <label
                        key={method.id}
                        className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                          paymentMethod === method.id
                            ? 'border-prairie-600 bg-prairie-50'
                            : 'border-warm-200 hover:border-prairie-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="payment"
                          value={method.id}
                          checked={paymentMethod === method.id}
                          onChange={() => setPaymentMethod(method.id)}
                          className="sr-only"
                        />
                        <div className={`w-12 h-12 ${method.color} rounded-lg flex items-center justify-center`}>
                          <Smartphone className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-warm-800">{method.name}</p>
                          <p className="text-sm text-warm-600">{method.description}</p>
                        </div>
                        {paymentMethod === method.id && (
                          <Check className="h-5 w-5 text-prairie-600" />
                        )}
                      </label>
                    ))}
                  </div>

                  {/* Notes */}
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-warm-700 mb-2">
                      Notes de commande (optionnel)
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Instructions spéciales pour la livraison..."
                      className="w-full px-4 py-3 rounded-lg border border-warm-300 focus:border-prairie-500 focus:ring-2 focus:ring-prairie-200 resize-none"
                      rows={3}
                    />
                  </div>
                </div>
              )}

              {/* Error message */}
              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                  {error}
                </div>
              )}

              {/* Navigation buttons */}
              <div className="flex justify-between mt-8 pt-6 border-t border-warm-100">
                {currentStepIndex > 0 ? (
                  <Button
                    variant="outline"
                    onClick={goToPrevStep}
                    icon={<ChevronLeft className="h-4 w-4" />}
                  >
                    Retour
                  </Button>
                ) : (
                  <Link href="/panier">
                    <Button variant="outline" icon={<ChevronLeft className="h-4 w-4" />}>
                      Retour au panier
                    </Button>
                  </Link>
                )}

                {currentStep === 'paiement' ? (
                  <Button
                    onClick={handleSubmitOrder}
                    disabled={!validateCurrentStep() || isLoading}
                    loading={isLoading}
                  >
                    Confirmer la commande
                  </Button>
                ) : (
                  <Button
                    onClick={goToNextStep}
                    disabled={!validateCurrentStep()}
                    icon={<ChevronRight className="h-4 w-4" />}
                    iconPosition="right"
                  >
                    Continuer
                  </Button>
                )}
              </div>
            </motion.div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 shadow-sm sticky top-24">
              <h2 className="text-xl font-semibold text-warm-800 mb-4">Récapitulatif</h2>

              {/* Items */}
              <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                {cart.items.map((item) => (
                  <div key={item.productId} className="flex gap-3">
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-warm-50 shrink-0">
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-warm-800 text-sm truncate">{item.name}</p>
                      <p className="text-sm text-warm-600">Qté: {item.quantity}</p>
                      <p className="text-sm font-semibold text-prairie-600">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t border-warm-100 pt-4 space-y-2">
                <div className="flex justify-between text-warm-600">
                  <span>Sous-total</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-warm-600">
                  <span>Livraison</span>
                  {shippingCost === 0 ? (
                    <span className="text-prairie-600">Gratuit</span>
                  ) : (
                    <span>{formatPrice(shippingCost)}</span>
                  )}
                </div>
                <div className="flex justify-between text-lg font-semibold text-warm-800 pt-2 border-t border-warm-100">
                  <span>Total</span>
                  <span className="text-prairie-600">{formatPrice(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
