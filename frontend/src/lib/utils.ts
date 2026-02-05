import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('fr-MG', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price) + ' Ar';
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length).trim() + '...';
}

export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

export function getProductivityLabel(productivity: string): string {
  const labels: Record<string, string> = {
    'faible': 'Faible',
    'moyenne': 'Moyenne',
    'élevée': 'Élevée',
    'très-élevée': 'Très élevée',
  };
  return labels[productivity] || productivity;
}

export function getProductivityColor(productivity: string): string {
  const colors: Record<string, string> = {
    'faible': 'bg-yellow-200',
    'moyenne': 'bg-orange-300',
    'élevée': 'bg-green-400',
    'très-élevée': 'bg-green-500',
  };
  return colors[productivity] || 'bg-gray-300';
}

export function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    'oeufs-frais': 'Œufs frais',
    'oeufs-fecondes': 'Œufs fécondés',
    'poules': 'Poules vivantes',
    'accessoires': 'Accessoires',
  };
  return labels[category] || category;
}

export function getBadgeLabel(badge: string): string {
  const labels: Record<string, string> = {
    'bio': 'Bio',
    'plein-air': 'Plein air',
    'nouveau': 'Nouveau',
    'promo': 'Promo',
    'populaire': 'Populaire',
  };
  return labels[badge] || badge;
}

export function generateOrderId(): string {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `FDV-${timestamp}-${randomStr}`.toUpperCase();
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePhone(phone: string): boolean {
  const phoneRegex = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/;
  return phoneRegex.test(phone);
}

export function validatePostalCode(postalCode: string): boolean {
  const postalCodeRegex = /^[0-9]{5}$/;
  return postalCodeRegex.test(postalCode);
}

export function getDeliveryEstimate(method: string): string {
  const estimates: Record<string, string> = {
    'standard': '3-5 jours ouvrés',
    'express': '1-2 jours ouvrés',
    'retrait': 'Disponible sous 24h',
  };
  return estimates[method] || '';
}

export function getShippingCost(method: string, subtotal: number): number {
  if (subtotal >= 200000) return 0; // Livraison gratuite au-dessus de 200 000 Ar

  const costs: Record<string, number> = {
    'standard': 25000,
    'express': 45000,
    'retrait': 0,
  };
  return costs[method] || 0;
}
