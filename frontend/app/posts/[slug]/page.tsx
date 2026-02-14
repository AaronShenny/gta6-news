import { getPostData, getAllPostIds } from '@/lib/posts';
import Image from 'next/image';
import { getCoverAsset } from '@/lib/covers';
import Link from 'next/link';
import { notFound } from 'next/navigation';

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
    return {
        title: `${postData.title} | GTA VI Hub`,
        description: postData.description,
        openGraph: {
            title: postData.title,
            description: postData.description,
            type: 'article',
            publishedTime: postData.date,
            tags: postData.tags,
        },
        twitter: {
            card: 'summary_large_image',
            title: postData.title,
            description: postData.description,
        }
    };
}

export default async function Post({ params }: { params: { slug: string } }) {
    const postData = await getPostData(params.slug);

    if (!postData) {
        notFound();
    }

    const cover = getCoverAsset(postData.title, postData.tags);

    return (
        <article className="min-h-screen bg-black text-white selection:bg-pink-500 selection:text-white">
            <div className="relative h-[40vh] w-full">
                <Image
                    src={cover.imageUrl}
                    alt={cover.imageAlt}
                    fill
                    priority
                    sizes="100vw"
                    className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent z-10"></div>
            </div>

            <div className="container mx-auto px-4 relative z-20 -mt-20">
                <Link href="/" className="inline-block mb-6 text-pink-500 hover:text-white transition-colors font-bold uppercase tracking-wider text-sm">&larr; Back to Hub</Link>

                <header className="mb-8">
                    <h1 className="text-4xl md:text-6xl font-black uppercase leading-tight mb-4">{postData.title}</h1>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-400 font-mono">
                        <span>{postData.date}</span>
                        {postData.tags && postData.tags.map(tag => (
                            <span key={tag} className="text-pink-500">#{tag}</span>
                        ))}
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2 prose prose-invert prose-lg prose-pink max-w-none">
                        <div dangerouslySetInnerHTML={{ __html: postData.contentHtml }} />
                    </div>

                    <aside className="space-y-8">
                        <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800">
                            <h3 className="text-xl font-bold mb-4 text-white uppercase">Source</h3>
                            <p className="text-gray-400 text-sm mb-4">
                                Read the original article for more details.
                            </p>
                            <a href={postData.source} target="_blank" rel="noopener noreferrer" className="block w-full py-3 text-center bg-white text-black font-bold uppercase tracking-wide hover:bg-gray-200 transition-colors rounded-lg">
                                Visit Source &rarr;
                            </a>
                        </div>

                        <div className="bg-gradient-to-br from-pink-600 to-purple-700 p-6 rounded-2xl text-white">
                            <h3 className="text-xl font-bold mb-2 uppercase">Don&apos;t Miss Out</h3>
                            <p className="text-sm opacity-90 mb-4">Join our newsletter for weekly GTA VI updates directly to your inbox.</p>
                            <input type="email" placeholder="Email address" className="w-full p-2 rounded bg-black/20 border border-white/20 placeholder:text-white/50 mb-2 focus:outline-none focus:border-white" />
                            <button className="w-full py-2 bg-white text-pink-600 font-bold uppercase text-sm hover:bg-gray-100 rounded">
                                Subscribe
                            </button>
                        </div>
                    </aside>
                </div>
            </div>
        </article>
    );
}
