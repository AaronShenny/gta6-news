const repoName = 'gta6-news';

function normalizeSiteUrl(url: string): string {
  return url.endsWith('/') ? url.slice(0, -1) : url;
}

export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) {
    return normalizeSiteUrl(explicit);
  }

  const owner = process.env.GITHUB_REPOSITORY_OWNER;
  if (owner) {
    return `https://${owner}.github.io/${repoName}`;
  }

  return 'http://localhost:3000';
}
