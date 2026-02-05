import { Service, FAQItem } from '@/types';

export const services: Service[] = [
  {
    id: 'livraison',
    title: 'Livraison à Antananarivo et environs',
    slug: 'livraison',
    description: 'Recevez vos œufs frais et vos produits directement chez vous ! Nous livrons dans toute la région d\'Antananarivo et ses environs.',
    longDescription: `Notre service de livraison à domicile vous permet de recevoir vos œufs frais sans vous déplacer. Nous organisons des tournées régulières pour garantir la fraîcheur de nos produits.

**Zones de livraison :**
- Antananarivo centre : livraison sous 24h
- Banlieue d'Antananarivo : livraison sous 24-48h
- Ambatolampy et environs : livraison sous 24h
- Autres régions : nous consulter

**Frais de livraison :**
- Gratuit dès 200 000 Ar d'achat
- 15 000 Ar pour les commandes inférieures à 200 000 Ar
- Livraison express (+10 000 Ar) : disponible sur certains secteurs

Les œufs sont transportés dans des emballages isothermes pour garantir leur conservation.`,
    icon: 'Truck',
    features: [
      'Livraison sous 24-48h',
      'Gratuit dès 200 000 Ar d\'achat',
      'Emballage isotherme',
      'Suivi de commande par SMS',
      'Créneau horaire au choix',
      'Livraison express disponible',
    ],
    pricing: 'Gratuit dès 200 000 Ar / 15 000 Ar sinon',
    available: true,
  },
  {
    id: 'gardiennage',
    title: 'Gardiennage de Poules',
    slug: 'gardiennage',
    description: 'Partez en vacances l\'esprit tranquille ! Nous gardons vos poules à la ferme pendant votre absence et prenons soin d\'elles comme des nôtres.',
    longDescription: `Vous avez des poules et vous souhaitez partir en vacances ? Notre service de gardiennage est fait pour vous !

**Ce que nous offrons :**
- Hébergement dans nos installations sécurisées
- Alimentation bio de qualité
- Surveillance quotidienne de la santé
- Récupération des œufs pendant votre absence
- Rapport de séjour à votre retour

**Comment ça marche ?**
1. Réservez votre séjour minimum 1 semaine avant
2. Déposez vos poules la veille ou le jour du départ
3. Nous nous occupons de tout pendant votre absence
4. Récupérez vos poules à votre retour (et les œufs !)

**Tarifs :**
- 5 000 Ar/jour/poule (alimentation incluse)
- Dépose et reprise gratuites à la ferme
- Possibilité de transport à domicile (+30 000 Ar)`,
    icon: 'Home',
    features: [
      'Soins quotidiens professionnels',
      'Alimentation bio incluse',
      'Hébergement sécurisé',
      'Récupération des œufs',
      'Rapport de santé au retour',
      'Disponible toute l\'année',
    ],
    pricing: '5 000 Ar/jour/poule',
    available: true,
  },
  {
    id: 'location',
    title: 'Location de Matériel',
    slug: 'location',
    description: 'Besoin d\'une couveuse ou d\'un poulailler temporaire ? Louez notre matériel professionnel pour vos projets ponctuels.',
    longDescription: `Notre service de location vous permet d'accéder à du matériel professionnel sans investissement important.

**Matériel disponible à la location :**

*Couveuses automatiques :*
- Couveuse 24 œufs : 10 000 Ar/jour ou 50 000 Ar/semaine
- Couveuse 48 œufs : 15 000 Ar/jour ou 80 000 Ar/semaine
- Éleveuse poussinière : 8 000 Ar/jour ou 40 000 Ar/semaine

*Poulaillers temporaires :*
- Poulailler mobile 4 poules : 20 000 Ar/jour ou 100 000 Ar/semaine
- Enclos grillagé 6m² : 10 000 Ar/jour ou 50 000 Ar/semaine

**Conditions :**
- Caution demandée (restituée au retour du matériel en bon état)
- Formation à l'utilisation incluse
- Livraison possible (frais selon distance)
- Réservation minimum 48h à l'avance`,
    icon: 'Package',
    features: [
      'Couveuses automatiques',
      'Poulaillers temporaires',
      'Enclos et parcs',
      'Formation à l\'utilisation',
      'Livraison possible',
      'Tarifs à la journée ou semaine',
    ],
    pricing: 'À partir de 8 000 Ar/jour',
    available: true,
  },
  {
    id: 'conseils',
    title: 'Conseils Personnalisés',
    slug: 'conseils',
    description: 'Vous débutez en aviculture ? Bénéficiez de nos conseils d\'experts pour créer et entretenir votre poulailler dans les meilleures conditions.',
    longDescription: `Fort de notre expérience, nous vous accompagnons dans tous vos projets avicoles, que vous soyez débutant ou éleveur confirmé.

**Nos services de conseil :**

*Pour les débutants :*
- Choix des races adaptées à votre situation
- Installation et aménagement du poulailler
- Alimentation et soins quotidiens
- Prévention des maladies

*Pour les confirmés :*
- Sélection et amélioration génétique
- Optimisation de la ponte
- Résolution de problèmes spécifiques
- Conseils pour l'incubation

**Formules proposées :**
- Consultation téléphonique (30 min) : gratuit pour nos clients
- Visite conseil à domicile (1h) : 100 000 Ar
- Accompagnement installation complète : sur devis

Nous pouvons également intervenir en cas de problème de santé pour vous orienter vers le bon traitement ou vétérinaire.`,
    icon: 'MessageCircle',
    features: [
      'Conseils pour débutants',
      'Choix des races',
      'Installation du poulailler',
      'Alimentation et santé',
      'Visite à domicile possible',
      'Suivi personnalisé',
    ],
    pricing: 'Gratuit par téléphone / 100 000 Ar la visite',
    available: true,
  },
];

export const faqItems: FAQItem[] = [
  {
    id: '1',
    question: 'Combien de poules me faut-il pour avoir des œufs tous les jours ?',
    answer: 'Pour avoir des œufs quotidiennement, nous conseillons minimum 3 poules pondeuses. Une bonne pondeuse produit en moyenne 250-300 œufs par an, soit environ 5 œufs par semaine. Avec 3 poules, vous aurez donc 2 à 3 œufs par jour en pleine saison de ponte.',
    category: 'elevage',
  },
  {
    id: '2',
    question: 'Faut-il un coq pour avoir des œufs ?',
    answer: 'Non, les poules pondent des œufs sans coq ! Le coq n\'est nécessaire que si vous souhaitez avoir des œufs fécondés pour faire naître des poussins. Les œufs de consommation sont non fécondés.',
    category: 'elevage',
  },
  {
    id: '3',
    question: 'Quelle surface faut-il pour élever des poules ?',
    answer: 'Comptez environ 10 m² de parcours herbeux par poule pour leur bien-être. Le poulailler lui-même doit offrir au minimum 1 m² pour 3-4 poules. Plus l\'espace est grand, plus vos poules seront heureuses et productives !',
    category: 'elevage',
  },
  {
    id: '4',
    question: 'Comment conserver les œufs frais ?',
    answer: 'Les œufs frais se conservent 28 jours après la ponte à température ambiante (dans un endroit frais) ou au réfrigérateur. Ne lavez pas les œufs avant de les stocker, cela enlève la couche protectrice naturelle (cuticule). Conservez-les pointe vers le bas.',
    category: 'oeufs',
  },
  {
    id: '5',
    question: 'Quelle est la différence entre œufs bio et plein air ?',
    answer: 'Les œufs "plein air" viennent de poules ayant accès à l\'extérieur (4 m² min/poule). Les œufs "bio" ajoutent des exigences supplémentaires : alimentation 100% biologique, densité plus faible, interdiction des traitements antibiotiques préventifs.',
    category: 'oeufs',
  },
  {
    id: '6',
    question: 'Comment faire éclore des œufs fécondés ?',
    answer: 'Il vous faut une couveuse maintenue à 37,5°C avec 55-65% d\'humidité. Les œufs doivent être retournés 3 fois par jour pendant 18 jours, puis placés en position fixe pour l\'éclosion vers le 21ème jour. Nous fournissons un guide détaillé avec chaque achat.',
    category: 'incubation',
  },
  {
    id: '7',
    question: 'Les poules font-elles du bruit ?',
    answer: 'Les poules sont généralement calmes. Elles caquettent doucement et font un peu plus de bruit après la ponte (le fameux "chant de la ponte"). Ce bruit reste modéré et acceptable en zone résidentielle. Seul le coq chante fort le matin !',
    category: 'elevage',
  },
  {
    id: '8',
    question: 'Livrez-vous les poules vivantes ?',
    answer: 'Oui, nous livrons les poules vivantes dans des caisses de transport adaptées, dans un rayon de 50 km autour de la ferme à Ambatolampy. Au-delà, nous préférons que vous veniez les chercher pour leur bien-être. La livraison est facturée 50 000 Ar.',
    category: 'livraison',
  },
  {
    id: '9',
    question: 'Que faire si un œuf fécondé n\'éclot pas ?',
    answer: 'Nous garantissons un taux de fécondité supérieur à 85%. Si moins de 70% de vos œufs éclosent malgré une incubation correcte, contactez-nous avec des photos de votre installation : nous trouverons une solution ensemble (avoir ou remplacement).',
    category: 'incubation',
  },
  {
    id: '10',
    question: 'Puis-je visiter la ferme avant d\'acheter ?',
    answer: 'Bien sûr ! Nous accueillons les visiteurs du lundi au samedi, de 9h à 18h. Vous pourrez voir nos installations, nos différentes races de poules et poser toutes vos questions. Appelez-nous avant pour vous assurer de notre disponibilité.',
    category: 'general',
  },
];

export function getFAQByCategory(category: string): FAQItem[] {
  if (category === 'all') return faqItems;
  return faqItems.filter((item) => item.category === category);
}

export function getServiceBySlug(slug: string): Service | undefined {
  return services.find((s) => s.slug === slug);
}
