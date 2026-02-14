const COVER_THEMES: Array<{ match: string[]; emoji: string; from: string; via: string; to: string }> = [
  { match: ['ai', 'artificial intelligence', 'rumor', 'theory'], emoji: '🤖', from: 'from-fuchsia-600/60', via: 'via-violet-600/40', to: 'to-cyan-500/40' },
  { match: ['map', 'mapping', 'leak', 'vice city'], emoji: '🗺️', from: 'from-emerald-600/60', via: 'via-teal-600/40', to: 'to-cyan-500/40' },
  { match: ['release', 'date', 'launch', 'delay'], emoji: '📅', from: 'from-orange-600/60', via: 'via-rose-600/40', to: 'to-pink-500/40' },
  { match: ['trailer', 'video', 'screenshot', 'visual'], emoji: '🎬', from: 'from-red-600/60', via: 'via-orange-500/40', to: 'to-yellow-500/40' },
  { match: ['online', 'multiplayer', 'community', 'reddit'], emoji: '🌐', from: 'from-blue-600/60', via: 'via-indigo-600/40', to: 'to-violet-500/40' },
];

const DEFAULT_THEME = {
  emoji: '🎮',
  from: 'from-pink-600/60',
  via: 'via-purple-600/40',
  to: 'to-cyan-500/40',
};

export interface CoverStyle {
  emoji: string;
  gradientClassName: string;
}

export function getCoverStyle(title: string, tags: string[] = []): CoverStyle {
  const haystack = `${title} ${tags.join(' ')}`.toLowerCase();
  const theme = COVER_THEMES.find((candidate) => candidate.match.some((keyword) => haystack.includes(keyword))) ?? DEFAULT_THEME;

  return {
    emoji: theme.emoji,
    gradientClassName: `bg-gradient-to-br ${theme.from} ${theme.via} ${theme.to}`,
  };
}
