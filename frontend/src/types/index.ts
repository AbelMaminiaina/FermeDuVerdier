// Types pour les produits
export interface Product {
  id: string;
  name: string;
  slug: string;
  category: ProductCategory;
  description: string;
  shortDescription: string;
  price: number;
  originalPrice?: number;
  images: string[];
  inStock: boolean;
  stockQuantity?: number;
  badges: ProductBadge[];
  metadata?: ProductMetadata;
  characteristics?: string[];
  createdAt: string;
  updatedAt: string;
}

export type ProductCategory =
  | 'porc'
  | 'poisson'
  | 'transformes'
  | 'oeufs-frais'
  | 'oeufs-fecondes'
  | 'poules'
  | 'accessoires';

export type ProductBadge = 'bio' | 'plein_air' | 'nouveau' | 'promo' | 'populaire';

export interface ProductMetadata {
  race?: string;
  quantity?: number;
  eggColor?: string;
  weight?: string;
  dimensions?: string;
}

// Types pour les races de poules
export interface ChickenBreed {
  id: string;
  name: string;
  slug: string;
  image: string;
  galleryImages?: string[];
  eggColor: string;
  eggColorHex: string;
  temperament: string;
  productivity: 'faible' | 'moyenne' | 'élevée' | 'très-élevée';
  productivityNumber: number;
  eggsPerYear: string;
  description: string;
  characteristics: string[];
  whyChoose: string;
  origin: string;
  weight: string;
  available: boolean;
  price?: number;
}

// Types pour le panier
export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  slug: string;
  metadata?: ProductMetadata;
}

export interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
}

// Types pour les témoignages
export interface Testimonial {
  id: string;
  name: string;
  location: string;
  avatar?: string;
  content: string;
  rating: number;
  date: string;
  productPurchased?: string;
}

// Types pour les services
export interface Service {
  id: string;
  title: string;
  slug: string;
  description: string;
  longDescription: string;
  icon: string;
  features: string[];
  pricing?: string;
  available: boolean;
}

// Types pour le blog
export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  category: BlogCategory;
  publishedAt: string;
  updatedAt?: string;
  author: Author;
  tags: string[];
  readingTime: number;
}

export type BlogCategory = 'conseils' | 'recettes' | 'actualites' | 'evenements';

export interface Author {
  name: string;
  avatar: string;
  bio?: string;
}

// Types pour le formulaire de contact
export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  consent: boolean;
}

// Types pour la newsletter
export interface NewsletterFormData {
  email: string;
  consent: boolean;
}

// Types pour les commandes
export interface Order {
  id: string;
  customerEmail: string;
  customerName: string;
  items: CartItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
  status: OrderStatus;
  shippingAddress: Address;
  billingAddress?: Address;
  deliveryMethod: DeliveryMethod;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export type DeliveryMethod = 'standard' | 'express' | 'retrait';

export type PaymentMethod = 'card' | 'paypal' | 'virement';

export interface Address {
  firstName: string;
  lastName: string;
  address: string;
  addressLine2?: string;
  city: string;
  postalCode: string;
  country: string;
  phone: string;
}

// Types pour les valeurs de la ferme
export interface Value {
  id: string;
  title: string;
  description: string;
  icon: string;
}

// Types pour la FAQ
export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}
