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

            const matterResult = matter(fileContents);

            return {
                slug,
                title: matterResult.data.title || '',
                date: matterResult.data.date || '',
                description: matterResult.data.description || '',
                tags: matterResult.data.tags || [],
                source: matterResult.data.source || '',
                classification: matterResult.data.classification || 'UNKNOWN',
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
    const matterResult = matter(fileContents);

    const processedContent = await remark()
        .use(html)
        .process(matterResult.content);
    
    const contentHtml = processedContent.toString();

    return {
        slug,
        contentHtml,
        title: matterResult.data.title || '',
        date: matterResult.data.date || '',
        description: matterResult.data.description || '',
        tags: matterResult.data.tags || [],
        source: matterResult.data.source || '',
        classification: matterResult.data.classification || 'UNKNOWN',
    };
}
