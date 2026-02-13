import fs from 'fs';
import path from 'path';

const postsDirectory = path.join(process.cwd(), 'content/posts');

export interface PostData {
    slug: string;
    title: string;
    date: string;
    description: string;
    tags: string[];
    source?: string;
    contentHtml: string;
}

interface ParsedPost {
    data: {
        date: string;
        title: string;
        description: string;
        tags: string[];
        source?: string;
    };
    content: string;
}

function escapeHtml(value: string): string {
    return value
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}

function parseFrontMatter(fileContents: string): ParsedPost {
    if (!fileContents.startsWith('---\n')) {
        return {
            data: { date: '', title: '', description: '', tags: [] },
            content: fileContents,
        };
    }

    const endIndex = fileContents.indexOf('\n---\n', 4);
    if (endIndex === -1) {
        return {
            data: { date: '', title: '', description: '', tags: [] },
            content: fileContents,
        };
    }

    const frontMatter = fileContents.slice(4, endIndex);
    const content = fileContents.slice(endIndex + 5);

    const metadata: Record<string, string | string[]> = {};
    let currentListKey: string | null = null;

    for (const rawLine of frontMatter.split('\n')) {
        const line = rawLine.trimEnd();
        if (!line.trim()) {
            continue;
        }

        if (line.startsWith('- ') && currentListKey) {
            const listValue = line.slice(2).trim().replace(/^['"]|['"]$/g, '');
            const existing = metadata[currentListKey];
            if (Array.isArray(existing)) {
                existing.push(listValue);
            } else {
                metadata[currentListKey] = [listValue];
            }
            continue;
        }

        const colonIndex = line.indexOf(':');
        if (colonIndex === -1) {
            continue;
        }

        const key = line.slice(0, colonIndex).trim();
        const value = line.slice(colonIndex + 1).trim();

        if (!value) {
            metadata[key] = [];
            currentListKey = key;
            continue;
        }

        currentListKey = null;

        if (value.startsWith('[') && value.endsWith(']')) {
            metadata[key] = value
                .slice(1, -1)
                .split(',')
                .map((entry) => entry.trim().replace(/^['"]|['"]$/g, ''))
                .filter(Boolean);
        } else {
            metadata[key] = value.replace(/^['"]|['"]$/g, '');
        }
    }

    return {
        data: {
            date: String(metadata.date ?? ''),
            title: String(metadata.title ?? ''),
            description: String(metadata.description ?? ''),
            tags: Array.isArray(metadata.tags) ? metadata.tags : [],
            source: metadata.source ? String(metadata.source) : undefined,
        },
        content,
    };
}

function markdownToHtml(markdown: string): string {
    const lines = markdown.split('\n');
    const htmlParts: string[] = [];
    let inList = false;

    for (const line of lines) {
        const trimmed = line.trim();

        if (!trimmed) {
            if (inList) {
                htmlParts.push('</ul>');
                inList = false;
            }
            continue;
        }

        if (trimmed.startsWith('### ')) {
            if (inList) {
                htmlParts.push('</ul>');
                inList = false;
            }
            htmlParts.push(`<h3>${escapeHtml(trimmed.slice(4))}</h3>`);
            continue;
        }

        if (trimmed.startsWith('## ')) {
            if (inList) {
                htmlParts.push('</ul>');
                inList = false;
            }
            htmlParts.push(`<h2>${escapeHtml(trimmed.slice(3))}</h2>`);
            continue;
        }

        if (trimmed.startsWith('# ')) {
            if (inList) {
                htmlParts.push('</ul>');
                inList = false;
            }
            htmlParts.push(`<h1>${escapeHtml(trimmed.slice(2))}</h1>`);
            continue;
        }

        if (trimmed.startsWith('- ')) {
            if (!inList) {
                htmlParts.push('<ul>');
                inList = true;
            }
            htmlParts.push(`<li>${escapeHtml(trimmed.slice(2))}</li>`);
            continue;
        }

        if (inList) {
            htmlParts.push('</ul>');
            inList = false;
        }

        htmlParts.push(`<p>${escapeHtml(trimmed)}</p>`);
    }

    if (inList) {
        htmlParts.push('</ul>');
    }

    return htmlParts.join('\n');
}

export function getSortedPostsData() {
    if (!fs.existsSync(postsDirectory)) {
        fs.mkdirSync(postsDirectory, { recursive: true });
        return [];
    }

    const fileNames = fs.readdirSync(postsDirectory);
    const allPostsData = fileNames
        .filter((fileName) => fileName.endsWith('.md'))
        .map((fileName) => {
            const slug = fileName.replace(/\.md$/, '');
            const fullPath = path.join(postsDirectory, fileName);
            const fileContents = fs.readFileSync(fullPath, 'utf8');
            const parsed = parseFrontMatter(fileContents);

            return {
                slug,
                ...parsed.data,
            };
        });

    return allPostsData.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getAllPostIds() {
    if (!fs.existsSync(postsDirectory)) {
        return [];
    }

    const fileNames = fs.readdirSync(postsDirectory).filter((fileName) => fileName.endsWith('.md'));
    return fileNames.map((fileName) => ({
        params: {
            slug: fileName.replace(/\.md$/, ''),
        },
    }));
}

export async function getPostData(slug: string): Promise<PostData> {
    const fullPath = path.join(postsDirectory, `${slug}.md`);
    if (!fs.existsSync(fullPath)) {
        return {
            slug,
            title: '',
            date: '',
            description: '',
            tags: [],
            contentHtml: '',
        };
    }

    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const parsed = parseFrontMatter(fileContents);

    return {
        slug,
        contentHtml: markdownToHtml(parsed.content),
        ...parsed.data,
    };
}
