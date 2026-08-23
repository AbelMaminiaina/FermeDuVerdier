import { Testimonial } from '@/types';

export const testimonials: Testimonial[] = [
  {
    id: '6',
    name: 'Nirina R.',
    location: 'Antananarivo',
    avatar: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="150" height="150"%3E%3Crect width="150" height="150" fill="white"/%3E%3C/svg%3E',
    content: 'Depuis que j\'achète mes œufs à la Ferme du Vardier, impossible de revenir en arrière ! Les jaunes sont d\'un orange incroyable et le goût est incomparable. Mes enfants adorent aller chercher les œufs directement à la ferme.',
    rating: 5,
    date: '2024-02-15',
    productPurchased: 'Œufs bio boîte de 12',
  },
  {
    id: '2',
    name: 'Hery A.',
    location: 'Antsirabe',
    avatar: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="150" height="150"%3E%3Crect width="150" height="150" fill="white"/%3E%3C/svg%3E',
    content: 'J\'ai acheté trois poules Sussex il y a 6 mois et je suis ravi ! Elles sont en pleine forme, pondent régulièrement et sont d\'une gentillesse incroyable avec les enfants. Les conseils de l\'équipe m\'ont été très précieux pour débuter.',
    rating: 5,
    date: '2024-01-20',
    productPurchased: 'Poules Sussex',
  },
  {
    id: '4',
    name: 'Andry L.',
    location: 'Antananarivo',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    content: 'Amateur de belles races, j\'ai craqué pour les œufs fécondés Marans. Sur 12 œufs, 10 poussins ont éclos ! Ils sont magnifiques avec leur plumage noir cuivré. Je recommande vivement pour la qualité des souches.',
    rating: 5,
    date: '2024-02-28',
    productPurchased: 'Œufs fécondés Marans',
  },
  {
    id: '5',
    name: 'Fanja B.',
    location: 'Tamatave',
    avatar: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="150" height="150"%3E%3Crect width="150" height="150" fill="white"/%3E%3C/svg%3E',
    content: 'La livraison à domicile est vraiment pratique ! Les œufs arrivent toujours frais et bien emballés. L\'équipe est très réactive et sympathique. C\'est un plaisir de soutenir une ferme locale qui travaille avec passion.',
    rating: 5,
    date: '2024-03-10',
    productPurchased: 'Livraison œufs bio',
  },
  {
    id: '1',
    name: 'Tojo G.',
    location: 'Antsirabe',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    content: 'Mon poulailler de la Ferme du Vardier est solide et bien pensé. Le montage était simple avec les instructions fournies. Les poules sont heureuses dedans ! Le rapport qualité-prix est excellent.',
    rating: 4,
    date: '2024-01-05',
    productPurchased: 'Poulailler bois',
  },
];

export function getRecentTestimonials(limit = 5): Testimonial[] {
  return testimonials
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
}

export function getAverageRating(): number {
  const total = testimonials.reduce((acc, t) => acc + t.rating, 0);
  return Math.round((total / testimonials.length) * 10) / 10;
}
