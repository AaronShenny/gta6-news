import { getPostData, getAllPostIds } from '@/lib/posts';
import Image from 'next/image';
import { getCoverAsset } from '@/lib/covers';
import { getSiteUrl } from '@/lib/site';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import { Twitter, ArrowLeft, ExternalLink } from 'lucide-react';

export async function generateStaticParams() {
    const paths = getAllPostIds();
    return paths.map((path) => ({
        slug: path.params.slug,
    }));
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
    const postData = await getPostData(params.slug);
    if (!postData) {
        return {
            title: 'Post Not Found',
        };
    }
    const siteUrl = getSiteUrl();
    const postUrl = `${siteUrl}/posts/${params.slug}`;
    const cover = getCoverAsset(postData.title, postData.tags);

    return {
        title: `${postData.title} | GTA VI Hub`,
        description: postData.description,
        alternates: {
            canonical: `/posts/${params.slug}`,
        },
        openGraph: {
            title: postData.title,
            description: postData.description,
            type: 'article',
            publishedTime: postData.date,
            tags: postData.tags,
            url: postUrl,
            images: [
                {
                    url: cover.imageUrl,
                    alt: cover.imageAlt,
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title: postData.title,
            description: postData.description,
            images: [cover.imageUrl],
        }
    };
}

export default async function Post({ params }: { params: { slug: string } }) {
    const postData = await getPostData(params.slug);

    if (!postData) {
        notFound();
    }

    const cover = getCoverAsset(postData.title, postData.tags);

    const getClassificationColor = (classification?: string) => {
        switch (classification) {
            case 'CONFIRMED': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50';
            case 'LEAK': return 'bg-amber-500/20 text-amber-400 border-amber-500/50';
            case 'RUMOR': return 'bg-purple-500/20 text-purple-400 border-purple-500/50';
            default: return 'bg-zinc-500/20 text-zinc-400 border-zinc-500/50';
        }
    };

    const shareUrl = `${getSiteUrl()}/posts/${params.slug}`;
    const shareText = `Check out this GTA 6 ${postData.classification || 'news'}: ${postData.title}`;

    return (
        <article className="min-h-screen selection:bg-vice-pink selection:text-white pb-20">
            <Header />

            <div className="relative h-[60vh] w-full">
                <Image
                    src={cover.imageUrl}
                    alt={cover.imageAlt}
                    fill
                    priority
                    sizes="100vw"
                    className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent z-10"></div>
            </div>

            <div className="container mx-auto px-6 relative z-20 -mt-32">
                <Link href="/#news" className="inline-flex items-center gap-2 mb-8 text-vice-blue hover:text-white transition-colors font-bold uppercase tracking-wider text-sm">
                    <ArrowLeft className="w-4 h-4" /> Back to News
                </Link>

                <header className="mb-12 max-w-4xl">
                    <div className="flex gap-3 mb-6 flex-wrap">
                        <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase border backdrop-blur-md shadow-lg ${getClassificationColor(postData.classification)}`}>
                            {postData.classification || 'UNKNOWN'}
                        </span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-display font-black uppercase leading-tight mb-6">{postData.title}</h1>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-400 font-medium tracking-wide uppercase">
                        <span>{postData.date}</span>
                        <span className="w-1 h-1 bg-zinc-600 rounded-full"></span>
                        <div className="flex gap-2">
                            {postData.tags && postData.tags.map(tag => (
                                <span key={tag} className="text-vice-pink">#{tag}</span>
                            ))}
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    <div className="lg:col-span-8 prose prose-invert prose-lg prose-headings:font-display prose-headings:font-bold prose-a:text-vice-blue hover:prose-a:text-vice-pink prose-img:rounded-2xl max-w-none">
                        {/* We use remark-html which outputs an HTML string */}
                        <div dangerouslySetInnerHTML={{ __html: postData.contentHtml }} />
                    </div>

                    <aside className="lg:col-span-4 space-y-8">
                        <div className="bg-zinc-900/50 p-8 rounded-[2rem] border border-zinc-800 backdrop-blur-sm">
                            <h3 className="text-xl font-display font-bold mb-4 text-white uppercase flex items-center gap-2">
                                <ExternalLink className="w-5 h-5 text-vice-blue" /> Original Source
                            </h3>
                            <p className="text-zinc-400 text-sm mb-6">
                                Want to read the full context? Visit the original article source below.
                            </p>
                            <a href={postData.source} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-full py-4 bg-white text-black font-bold uppercase tracking-wide hover:bg-zinc-200 transition-colors rounded-xl gap-2">
                                Visit Source
                            </a>
                        </div>

                        <div className="bg-zinc-900/50 p-8 rounded-[2rem] border border-zinc-800 backdrop-blur-sm">
                            <h3 className="text-xl font-display font-bold mb-4 text-white uppercase">Share News</h3>
                            <a 
                              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center justify-center gap-2 w-full py-4 bg-[#1DA1F2]/10 text-[#1DA1F2] border border-[#1DA1F2]/30 hover:bg-[#1DA1F2]/20 font-bold uppercase tracking-wide transition-colors rounded-xl"
                            >
                                <Twitter className="w-5 h-5" /> Share on X
                            </a>
                        </div>
                    </aside>
                </div>
            </div>
        </article>
    );
}
