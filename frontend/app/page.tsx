import Link from 'next/link';
import { getSortedPostsData } from '@/lib/posts';
import Image from 'next/image';
import { getCoverAsset } from '@/lib/covers';

export default function Home() {
  const allPostsData = getSortedPostsData();

  return (
    <main className="min-h-screen bg-black text-white font-sans selection:bg-pink-500 selection:text-white">
      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center justify-center bg-[url('https://images.unsplash.com/photo-1605901309584-818e25960b8f?q=80&w=2600&auto=format&fit=crop')] bg-cover bg-center">
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
        <div className="relative z-10 text-center px-4">
          <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 drop-shadow-2xl">
            GTA VI HUB
          </h1>
          <p className="mt-4 text-xl md:text-2xl text-gray-300 font-light max-w-2xl mx-auto">
            Your destination for the latest Grand Theft Auto VI news, leaks, and updates.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link href="#news" className="px-8 py-3 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-full transition-all transform hover:scale-105 shadow-lg shadow-pink-500/30">
              Latest News
            </Link>
            <button className="px-8 py-3 bg-gray-800/80 hover:bg-gray-700 text-white font-bold rounded-full backdrop-blur-sm border border-gray-600 transition-all">
              Join Newsletter
            </button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-12 bg-zinc-900/50 border-y border-zinc-800">
        <div className="container mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { icon: "📰", label: "Daily News" },
            { icon: "🗺️", label: "Map Leaks" },
            { icon: "✅", label: "Verified Info" },
            { icon: "📅", label: "Release Date" },
          ].map((item, idx) => (
            <div key={idx} className="flex flex-col items-center text-center group cursor-pointer">
              <div className="p-4 bg-zinc-800 rounded-2xl group-hover:bg-pink-500/20 group-hover:text-pink-500 transition-colors">
                <span className="text-3xl" aria-hidden="true">{item.icon}</span>
              </div>
              <span className="mt-3 font-medium text-gray-300 group-hover:text-white">{item.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* News Feed */}
      <section id="news" className="py-20 container mx-auto px-4">
        <div className="flex items-end justify-between mb-12">
          <h2 className="text-4xl md:text-5xl font-bold uppercase tracking-tight">
            Latest <span className="text-pink-500">Updates</span>
          </h2>
          <Link href="/archive" className="hidden md:block text-gray-400 hover:text-white transition-colors">
            View Archive &rarr;
          </Link>
        </div>

        {allPostsData.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {allPostsData.map(({ slug, date, title, description, tags }) => {
              const cover = getCoverAsset(title, tags);

              return (
                <Link href={`/posts/${slug}`} key={slug} className="group relative block bg-zinc-900 rounded-3xl overflow-hidden hover:-translate-y-2 transition-transform duration-300 border border-zinc-800 hover:border-pink-500/50">
                  <div className="aspect-video w-full group-hover:scale-105 transition-transform duration-500 relative">
                    <Image
                      src={cover.imageUrl}
                      alt={cover.imageAlt}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                  </div>
                  <div className="p-6">
                    <div className="flex gap-2 mb-3">
                      {tags && tags.slice(0, 2).map(tag => (
                        <span key={tag} className="text-xs font-bold text-pink-400 bg-pink-400/10 px-2 py-1 rounded-md uppercase tracking-wide">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <h3 className="text-xl font-bold mb-2 group-hover:text-pink-400 transition-colors line-clamp-2">
                      {title}
                    </h3>
                    <p className="text-gray-400 text-sm line-clamp-3 mb-4">
                      {description}
                    </p>
                    <div className="flex items-center justify-between text-xs text-zinc-500">
                      <span>{date}</span>
                      <span className="group-hover:translate-x-1 transition-transform">Read Article &rarr;</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 bg-zinc-900/50 rounded-3xl border border-zinc-800/50 border-dashed">
            <h3 className="text-2xl font-bold text-gray-400">No news yet either...</h3>
            <p className="text-gray-500 mt-2">Check back later or run the fetch script!</p>
          </div>
        )}
      </section>

      <footer className="py-12 border-t border-zinc-800 text-center text-zinc-500">
        <p>&copy; {new Date().getFullYear()} GTA VI Hub. Not affiliated with Rockstar Games.</p>
      </footer>
    </main>
  );
}
