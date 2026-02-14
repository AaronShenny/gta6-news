interface CoverTheme {
  match: string[];
  imageUrl: string;
  imageAlt: string;
}

const COVER_THEMES: CoverTheme[] = [
  {
    match: ['ai', 'artificial intelligence', 'rumor', 'theory'],
    imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1800&q=80',
    imageAlt: 'Futuristic AI-themed digital artwork',
  },
  {
    match: ['map', 'mapping', 'leak', 'vice city'],
    imageUrl: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1800&q=80',
    imageAlt: 'City map spread out on a desk',
  },
  {
    match: ['release', 'date', 'launch', 'delay'],
    imageUrl: 'https://images.unsplash.com/photo-1506784365847-bbad939e9335?auto=format&fit=crop&w=1800&q=80',
    imageAlt: 'Calendar and planning setup',
  },
  {
    match: ['trailer', 'video', 'screenshot', 'visual'],
    imageUrl: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1800&q=80',
    imageAlt: 'Cinema screen and film visuals',
  },
  {
    match: ['online', 'multiplayer', 'community', 'reddit'],
    imageUrl: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=1800&q=80',
    imageAlt: 'People discussing content together',
  },
];

const DEFAULT_COVER = {
  imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1800&q=80',
  imageAlt: 'Gaming setup with controller and monitor',
};

export interface CoverAsset {
  imageUrl: string;
  imageAlt: string;
}

export function getCoverAsset(title: string, tags: string[] = []): CoverAsset {
  const haystack = `${title} ${tags.join(' ')}`.toLowerCase();
  const theme = COVER_THEMES.find((candidate) => candidate.match.some((keyword) => haystack.includes(keyword)));

  return theme ?? DEFAULT_COVER;
}
