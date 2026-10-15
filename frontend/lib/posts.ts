import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

const postsDirectory = path.join(process.cwd(), 'content/posts');

export interface PostSummary {
    slug: string;
    title: string;
    date: string;
    description: string;
    tags: string[];
    source?: string;
    classification?: string;
}

export interface PostData extends PostSummary {
    contentHtml: string;
}

function stripWrappingQuotes(value: string): string {
    const trimmed = value.trim();
    if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
        return trimmed.slice(1, -1);
    }
    return trimmed;
}

function parseFrontmatterFallback(fileContents: string): { data: Record<string, unknown>; content: string } {
    const lines = fileContents.split('\n');
    if (lines[0]?.trim() !== '---') {
        return { data: {}, content: fileContents };
    }

    const data: Record<string, unknown> = {};
    let separatorIndex = -1;

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (line.trim() === '---') {
            separatorIndex = i;
            break;
        }

        const match = line.match(/^([a-zA-Z0-9_-]+):\s*(.*)$/);
        if (!match) {
            continue;
        }

        const [, key, rawValue] = match;
        const value = rawValue.trim();
        if (key === 'tags') {
            try {
                data.tags = JSON.parse(value);
            } catch {
                data.tags = [];
            }
            continue;
        }

        data[key] = stripWrappingQuotes(value);
    }

    const content = separatorIndex >= 0 ? lines.slice(separatorIndex + 1).join('\n') : fileContents;
    return { data, content };
}

function safeParseMatter(fileContents: string): { data: Record<string, unknown>; content: string } {
    try {
        const parsed = matter(fileContents);
        return { data: parsed.data as Record<string, unknown>, content: parsed.content };
    } catch {
        return parseFrontmatterFallback(fileContents);
    }
}

function getStringValue(value: unknown, fallback = ''): string {
    return typeof value === 'string' ? value : fallback;
}

function getTagsValue(value: unknown): string[] {
    return Array.isArray(value) ? value.filter((tag): tag is string => typeof tag === 'string') : [];
}

export function getSortedPostsData(): PostSummary[] {
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

            const matterResult = safeParseMatter(fileContents);

            return {
                slug,
                title: getStringValue(matterResult.data.title),
                date: getStringValue(matterResult.data.date),
                description: getStringValue(matterResult.data.description),
                tags: getTagsValue(matterResult.data.tags),
                source: getStringValue(matterResult.data.source),
                classification: getStringValue(matterResult.data.classification, 'UNKNOWN'),
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
            classification: 'UNKNOWN',
            contentHtml: '',
        };
    }

    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const matterResult = safeParseMatter(fileContents);

    const processedContent = await remark()
        .use(html)
        .process(matterResult.content);
    
    const contentHtml = processedContent.toString();

    return {
        slug,
        contentHtml,
        title: getStringValue(matterResult.data.title),
        date: getStringValue(matterResult.data.date),
        description: getStringValue(matterResult.data.description),
        tags: getTagsValue(matterResult.data.tags),
        source: getStringValue(matterResult.data.source),
        classification: getStringValue(matterResult.data.classification, 'UNKNOWN'),
    };
}
