import { BlogPost, Author } from '@/types';

const authors: Record<string, Author> = {
  pierre: {
    name: 'Varombo Fitoky',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    bio: 'Fondateur de la Ferme du Vardier, passionné d\'aviculture depuis 20 ans.',
  },
  marie: {
    name: 'Marie Martin',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    bio: 'Responsable de l\'élevage et experte en bien-être animal.',
  },
};

export const blogPosts: BlogPost[] = [
  {
    id: '1',
    title: 'Comment bien démarrer son poulailler : le guide complet',
    slug: 'comment-bien-demarrer-son-poulailler',
    excerpt: 'Vous rêvez d\'avoir vos propres poules et de déguster des œufs frais chaque matin ? Voici notre guide complet pour bien démarrer votre aventure avicole.',
    content: `# Comment bien démarrer son poulailler : le guide complet

Vous rêvez d'avoir vos propres poules et de déguster des œufs frais chaque matin ? Vous êtes au bon endroit ! Dans ce guide, nous allons vous accompagner pas à pas dans la création de votre premier poulailler.

## 1. Choisir le bon emplacement

L'emplacement de votre poulailler est crucial pour le bien-être de vos poules. Voici les critères à respecter :

- **Un terrain plat et drainé** : évitez les zones humides où l'eau stagne
- **Une orientation sud/sud-est** : pour profiter du soleil du matin
- **À l'abri du vent** : les poules craignent les courants d'air
- **Proche de votre maison** : pour faciliter les soins quotidiens

## 2. Calculer l'espace nécessaire

Pour le bien-être de vos poules, prévoyez :
- **4 m² de parcours minimum par poule** (idéalement 10 m²)
- **1 m² de poulailler pour 3-4 poules**
- **1 pondoir pour 3-4 poules**
- **20 cm de perchoir par poule**

## 3. Choisir ses premières poules

Pour débuter, nous recommandons :
- **La poule rousse** : championne de ponte, facile à vivre
- **La Sussex** : docile, parfaite avec les enfants
- **La Marans** : rustique, œufs chocolat magnifiques

Commencez avec 3-4 poules, c'est l'idéal pour débuter !

## 4. L'équipement de base

Voici la liste du matériel indispensable :
- Un poulailler adapté à votre nombre de poules
- Une mangeoire anti-gaspillage
- Un abreuvoir (5L minimum)
- De la litière (paille ou chanvre)
- De l'aliment pour pondeuses
- Des coquilles d'huîtres (calcium)

## 5. Les soins quotidiens

Chaque jour, vous devrez :
- Ouvrir le poulailler le matin
- Vérifier eau et nourriture
- Ramasser les œufs
- Fermer le poulailler le soir

Une fois par semaine : nettoyage de la litière du pondoir.
Une fois par mois : grand nettoyage du poulailler.

## Conclusion

Élever des poules est accessible à tous ! Avec un minimum de préparation et d'attention, vous profiterez bientôt d'œufs frais au quotidien et de la compagnie attachante de ces charmantes volailles.

Besoin de conseils personnalisés ? N'hésitez pas à nous contacter ou à visiter notre ferme !`,
    coverImage: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800',
    category: 'conseils',
    publishedAt: '2024-03-01',
    author: authors.pierre,
    tags: ['débutant', 'poulailler', 'conseils', 'installation'],
    readingTime: 8,
  },
  {
    id: '2',
    title: '5 recettes faciles avec des œufs frais de la ferme',
    slug: '5-recettes-faciles-oeufs-frais',
    excerpt: 'Découvrez comment sublimer vos œufs frais avec ces 5 recettes simples et délicieuses. Du petit-déjeuner au dîner, l\'œuf est roi !',
    content: `# 5 recettes faciles avec des œufs frais de la ferme

Les œufs frais de la ferme ont un goût incomparable. Voici 5 recettes pour les mettre en valeur !

## 1. L'œuf à la coque parfait

Rien de tel qu'un œuf à la coque pour apprécier la qualité d'un œuf frais.

**Ingrédients :**
- 1 œuf très frais (moins de 9 jours)
- Sel, poivre
- Mouillettes de pain frais

**Préparation :**
1. Sortez l'œuf du réfrigérateur 30 min avant
2. Plongez-le dans l'eau bouillante
3. Comptez 3 min pour un jaune coulant
4. Dégustez immédiatement avec des mouillettes !

## 2. L'omelette baveuse aux herbes

**Ingrédients (2 pers.) :**
- 4 œufs frais
- 20g de beurre
- Ciboulette, persil, estragon
- Sel, poivre

**Préparation :**
1. Battez les œufs légèrement avec les herbes
2. Faites fondre le beurre dans une poêle
3. Versez les œufs et remuez doucement
4. Arrêtez la cuisson quand l'omelette est encore baveuse
5. Pliez et servez immédiatement

## 3. Les œufs cocotte au saumon

**Ingrédients (2 pers.) :**
- 2 œufs
- 50g de saumon fumé
- 2 c.à.s de crème fraîche
- Aneth frais

**Préparation :**
1. Préchauffez le four à 180°C
2. Disposez le saumon et la crème dans des ramequins
3. Cassez un œuf dans chaque ramequin
4. Enfournez 10-12 min au bain-marie
5. Décorez d'aneth et servez

## 4. La quiche lorraine traditionnelle

**Ingrédients (6 pers.) :**
- 1 pâte brisée
- 200g de lardons
- 3 œufs + 1 jaune
- 20cl de crème + 10cl de lait
- Muscade, sel, poivre

**Préparation :**
1. Préchauffez le four à 180°C
2. Faites revenir les lardons
3. Battez les œufs avec la crème et le lait
4. Garnissez le fond de tarte avec les lardons
5. Versez l'appareil et enfournez 35-40 min

## 5. Le gâteau au yaourt moelleux

**Ingrédients :**
- 1 pot de yaourt nature
- 3 œufs
- 2 pots de sucre
- 3 pots de farine
- 1/2 pot d'huile
- 1 sachet de levure

**Préparation :**
1. Préchauffez le four à 180°C
2. Mélangez tous les ingrédients
3. Versez dans un moule beurré
4. Enfournez 35 min

## L'astuce du chef

Pour vérifier la fraîcheur d'un œuf, plongez-le dans l'eau :
- Il coule et reste au fond : extra-frais
- Il se redresse légèrement : frais (idéal pour la pâtisserie)
- Il flotte : trop vieux, ne le consommez pas

Bonne dégustation !`,
    coverImage: 'https://images.unsplash.com/photo-1510693206972-df098062cb71?w=800',
    category: 'recettes',
    publishedAt: '2024-02-15',
    author: authors.marie,
    tags: ['recettes', 'cuisine', 'œufs', 'gastronomie'],
    readingTime: 6,
  },
  {
    id: '3',
    title: 'Arrivée des poussins de printemps !',
    slug: 'arrivee-poussins-printemps-2024',
    excerpt: 'Le printemps est là et avec lui, nos premiers poussins de l\'année ! Découvrez les naissances à la ferme et les races disponibles.',
    content: `# Arrivée des poussins de printemps !

Le printemps s'installe à la Ferme du Vardier et nous avons le plaisir de vous annoncer les premières naissances de l'année !

## Un début de saison prometteur

Cette semaine, nous avons eu le bonheur de voir éclore :
- **15 poussins Marans** noire cuivrée
- **12 poussins Sussex** herminée
- **8 poussins Araucana**
- **6 adorables poussins Soie** blancs

Les couveuses ont tourné à plein régime et le taux d'éclosion est excellent cette année : 92% en moyenne !

## Les stars de la saison

### Les Marans
Nos Marans noire cuivrée sont particulièrement beaux cette année. Les parents ont été sélectionnés pour la qualité de leur plumage et la couleur intense de leurs œufs. Ces poussins seront disponibles à la vente dès fin avril.

### Les Araucana
Grande nouveauté cette saison : nous avons développé notre lignée d'Araucana ! Ces poules aux œufs bleus sont très demandées. Les premiers poussins seront disponibles début mai.

## Réservez dès maintenant !

Les poussins sont disponibles à la réservation dès maintenant :
- **Poussins d'un jour** : sur commande uniquement
- **Poulettes de 8 semaines** : disponibles mi-mai
- **Poulettes prêtes à pondre (18-20 sem.)** : disponibles fin juin

Les stocks sont limités, ne tardez pas à réserver vos préférées !

## Visite de l'élevage

Vous souhaitez voir nos poussins ? Nous organisons des visites tous les samedis après-midi de 14h à 17h. Les enfants adorent voir les poussins !

Réservation conseillée au 038 01 001 01.

À très bientôt à la ferme !`,
    coverImage: 'https://images.unsplash.com/photo-1569428034239-f9565e32e224?w=800',
    category: 'actualites',
    publishedAt: '2024-03-15',
    author: authors.pierre,
    tags: ['actualités', 'poussins', 'printemps', 'naissances'],
    readingTime: 4,
  },
  {
    id: '4',
    title: 'Comment protéger vos poules en hiver ?',
    slug: 'proteger-poules-hiver',
    excerpt: 'L\'hiver arrive et vous vous demandez comment prendre soin de vos poules pendant la saison froide ? Voici nos conseils d\'expert.',
    content: `# Comment protéger vos poules en hiver ?

L'hiver peut être une période délicate pour vos poules. Voici nos conseils pour les aider à traverser la saison froide en pleine forme.

## Les poules et le froid

Bonne nouvelle : les poules supportent bien le froid ! Leur plumage est un excellent isolant et elles peuvent résister à des températures négatives sans problème. Ce qu'elles craignent davantage, ce sont :
- L'humidité
- Les courants d'air
- Le gel de l'eau

## Adapter le poulailler

### Isolation et ventilation
- Vérifiez l'étanchéité du toit
- Bouchez les trous source de courants d'air
- Mais conservez une ventilation haute pour éviter l'humidité
- Ajoutez une couche supplémentaire de litière

### Protection contre le gel
- Isolez l'abreuvoir ou utilisez un modèle antigel
- Changez l'eau deux fois par jour si elle gèle
- Vérifiez que les pondoirs sont bien isolés

## L'alimentation hivernale

En hiver, les poules ont besoin de plus d'énergie :
- Augmentez légèrement les rations
- Distribuez des céréales le soir (digestion = chaleur)
- Ajoutez du maïs concassé à l'alimentation
- Proposez des restes de cuisine (épluchures, pain...)

## La baisse de ponte

Il est normal que la ponte diminue en hiver :
- Les jours raccourcissent (moins de 14h de lumière)
- L'énergie est utilisée pour se réchauffer

Pour maintenir la ponte, vous pouvez installer un éclairage artificiel pour atteindre 14h de lumière par jour. Mais nous conseillons de laisser vos poules suivre leur rythme naturel.

## Vigilance santé

En hiver, surveillez :
- Les pattes : risque de gelures sur les races à grandes crêtes
- Le plumage : doit rester gonflé et en bon état
- Le comportement : une poule prostrée doit alerter

## Conclusion

Avec quelques aménagements simples, vos poules passeront l'hiver sans encombre. N'hésitez pas à nous contacter si vous avez des questions spécifiques !`,
    coverImage: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=800',
    category: 'conseils',
    publishedAt: '2024-01-10',
    author: authors.marie,
    tags: ['conseils', 'hiver', 'soins', 'poulailler'],
    readingTime: 5,
  },
  {
    id: '5',
    title: 'Journée portes ouvertes le 20 avril !',
    slug: 'journee-portes-ouvertes-avril-2024',
    excerpt: 'Venez découvrir notre ferme lors de notre journée portes ouvertes annuelle. Au programme : visites, animations et dégustations !',
    content: `# Journée portes ouvertes le 20 avril !

Nous avons le plaisir de vous inviter à notre journée portes ouvertes annuelle !

## Informations pratiques

**Date :** Samedi 20 avril 2024
**Horaires :** 10h - 18h
**Entrée :** Gratuite
**Adresse :** Ferme du Vardier, [adresse complète]

## Programme de la journée

### Visites guidées (toutes les heures)
- Découverte de l'élevage
- Présentation des différentes races
- Visite de la couveuse
- Explication de notre démarche bio

### Animations pour les enfants
- Nourrissage des poules (11h et 15h)
- Câlins avec les poules Soie
- Chasse aux œufs dans le jardin
- Atelier coloriage

### Stands et expositions
- Exposition de nos plus beaux spécimens
- Stand alimentation bio
- Démonstration de matériel d'élevage
- Présentation des poulaillers

### Dégustations
- Œufs brouillés fermiers
- Gâteaux maison aux œufs frais
- Boissons chaudes et fraîches

## Vente à la ferme

Profitez de cette journée pour :
- Acheter vos œufs frais (-10% sur les plateaux)
- Réserver vos poules pondeuses
- Découvrir notre gamme d'accessoires
- Repartir avec des conseils personnalisés

## Comment venir ?

**En voiture :** [Indications GPS]
Parking gratuit sur place (100 places)

**En transports :** [Indications transports]

## Inscription

L'entrée est libre mais l'inscription nous aide à organiser la journée :
- Par téléphone : 038 01 001 01
- Par email : contact@fermeduvardier.mg

Nous avons hâte de vous accueillir !`,
    coverImage: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=800',
    category: 'evenements',
    publishedAt: '2024-03-20',
    author: authors.pierre,
    tags: ['événement', 'portes ouvertes', 'visite', 'animation'],
    readingTime: 3,
  },
];

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}

export function getBlogPostsByCategory(category: string): BlogPost[] {
  if (category === 'all') return blogPosts;
  return blogPosts.filter((p) => p.category === category);
}

export function getRecentBlogPosts(limit = 3): BlogPost[] {
  return blogPosts
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, limit);
}

export function getRelatedPosts(postId: string, limit = 3): BlogPost[] {
  const post = blogPosts.find((p) => p.id === postId);
  if (!post) return [];

  return blogPosts
    .filter((p) => p.id !== postId && p.category === post.category)
    .slice(0, limit);
}
