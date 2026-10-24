import Image from 'next/image';

interface AuthorAvatarProps {
  name: string;
  avatar?: string;
  // Taille affichée en pixels (le conteneur parent fixe déjà la taille)
  size: number;
}

// Photo de l'auteur, ou son initiale quand il n'a pas de photo
export function AuthorAvatar({ name, avatar, size }: AuthorAvatarProps) {
  if (!avatar) {
    return (
      <span
        className="flex h-full w-full items-center justify-center bg-prairie-600 font-semibold text-white"
        style={{ fontSize: Math.max(10, Math.round(size * 0.45)) }}
        aria-label={name}
      >
        {name.charAt(0).toUpperCase()}
      </span>
    );
  }
  return <Image src={avatar} alt={name} fill sizes={`${size}px`} className="object-cover" />;
}
