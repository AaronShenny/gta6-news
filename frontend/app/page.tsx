import Link from 'next/link';
import { getSortedPostsData } from '@/lib/posts';
import Image from 'next/image';
import { getCoverAsset } from '@/lib/covers';
import Header from '@/components/Header';
import { ArrowRight, Flame } from 'lucide-react';

export default function Home() {
  const allPostsData = getSortedPostsData();
  const heroPost = allPostsData.length > 0 ? allPostsData[0] : null;
  const otherPosts = allPostsData.length > 1 ? allPostsData.slice(1) : [];

  const getClassificationColor = (classification?: string) => {
    switch (classification) {
      case 'CONFIRMED': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50';
      case 'LEAK': return 'bg-amber-500/20 text-amber-400 border-amber-500/50';
      case 'RUMOR': return 'bg-purple-500/20 text-purple-400 border-purple-500/50';
      default: return 'bg-zinc-500/20 text-zinc-400 border-zinc-500/50';
    }
  };

  return (
    <main className="min-h-screen selection:bg-vice-pink selection:text-white pb-20">
      <Header />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-24 mb-16 overflow-hidden min-h-[70vh] flex items-center mt-0">
        <div className="absolute inset-0 z-0">
          <Image
            src="/hero-bg.png"
            alt="Vice City Hero Cover"
            fill
            className="object-cover opacity-50 mix-blend-screen"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/80 to-transparent"></div>
        </div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="max-w-2xl relative z-10">
              <h1 className="text-6xl md:text-8xl font-display font-black uppercase tracking-tighter leading-none mb-6 text-white drop-shadow-2xl">
                RETURN TO <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-vice-pink via-vice-purple to-vice-blue">VICE CITY</span>
              </h1>
              <p className="text-xl text-zinc-300 mb-8 max-w-lg font-light leading-relaxed drop-shadow-md">
                Your premier automated source for the latest Grand Theft Auto VI news, leaks, rumors, and confirmed updates.
              </p>
              <div className="flex items-center gap-4">
                <Link href="#news" className="group flex items-center gap-2 bg-white text-black px-8 py-4 rounded-full font-bold hover:bg-zinc-200 transition-all duration-300">
                  Latest News <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
              
              {/* Newsletter Placeholder */}
              <div className="mt-10 p-1 rounded-full bg-black/50 backdrop-blur-md border border-white/10 flex items-center max-w-md shadow-xl">
                <input type="email" placeholder="Enter email for weekly digest..." className="bg-transparent border-none outline-none px-6 py-3 flex-1 text-sm text-white placeholder:text-zinc-300" />
                <button className="bg-vice-purple hover:bg-vice-pink transition-colors text-white px-6 py-3 rounded-full text-sm font-bold shadow-[0_0_20px_rgba(138,43,226,0.4)]">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic News Feed */}
      <section id="news" className="container mx-auto px-6 relative z-10">
        <div className="flex items-center gap-3 mb-10">
          <Flame className="text-vice-pink w-8 h-8" />
          <h2 className="text-4xl font-display font-bold uppercase tracking-tight">
            Breaking Updates
          </h2>
        </div>

        {heroPost ? (
          <div className="mb-16">
            <Link href={`/posts/${heroPost.slug}`} className="group relative block bg-zinc-900/40 rounded-[2rem] overflow-hidden border border-zinc-800/50 hover:border-vice-pink/50 transition-all duration-500 hover:shadow-[0_0_40px_rgba(255,0,127,0.15)] backdrop-blur-sm">
              <div className="flex flex-col lg:flex-row">
                <div className="relative w-full lg:w-3/5 aspect-video lg:aspect-auto overflow-hidden">
                  <Image
                    src={getCoverAsset(heroPost.title, heroPost.tags).imageUrl}
                    alt={getCoverAsset(heroPost.title, heroPost.tags).imageAlt}
                    fill
                    sizes="(min-width: 1024px) 60vw, 100vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-zinc-950 via-zinc-950/40 to-transparent"></div>
                  
                  <div className="absolute top-6 left-6 flex gap-2">
                     <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border backdrop-blur-md ${getClassificationColor(heroPost.classification)}`}>
                        {heroPost.classification || 'UNKNOWN'}
                      </span>
                  </div>
                </div>
                
                <div className="w-full lg:w-2/5 p-8 lg:p-12 flex flex-col justify-center">
                  <div className="flex gap-2 mb-4 flex-wrap">
                    {heroPost.tags && heroPost.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="text-xs font-bold text-vice-blue bg-vice-blue/10 px-3 py-1 rounded-full uppercase tracking-wide">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h3 className="text-3xl lg:text-5xl font-display font-bold mb-6 group-hover:text-vice-pink transition-colors leading-tight">
                    {heroPost.title}
                  </h3>
                  <p className="text-zinc-400 text-lg line-clamp-3 mb-8">
                    {heroPost.description}
                  </p>
                  <div className="flex items-center justify-between text-sm text-zinc-500 font-medium uppercase tracking-wider mt-auto">
                    <span>{heroPost.date}</span>
                    <span className="group-hover:translate-x-2 transition-transform flex items-center gap-2 text-white">Read More <ArrowRight className="w-4 h-4" /></span>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        ) : (
          <div className="text-center py-32 bg-zinc-900/30 rounded-[3rem] border border-zinc-800 border-dashed">
            <h3 className="text-3xl font-display font-bold text-zinc-500">Awaiting Intelligence...</h3>
          </div>
        )}

        {/* Older Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {otherPosts.map(({ slug, date, title, description, tags, classification }) => {
            const cover = getCoverAsset(title, tags);
            return (
              <Link href={`/posts/${slug}`} key={slug} className="group relative block bg-zinc-900/40 rounded-3xl overflow-hidden border border-zinc-800/50 hover:border-vice-blue/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_10px_30px_rgba(0,229,255,0.1)] backdrop-blur-sm">
                <div className="aspect-[4/3] w-full relative overflow-hidden">
                  <Image
                    src={cover.imageUrl}
                    alt={cover.imageAlt}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                    className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent"></div>
                  
                  <div className="absolute top-4 left-4 flex gap-2">
                     <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase border backdrop-blur-md shadow-lg ${getClassificationColor(classification)}`}>
                        {classification || 'UNKNOWN'}
                      </span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-display font-bold mb-3 group-hover:text-vice-blue transition-colors line-clamp-2 leading-tight">
                    {title}
                  </h3>
                  <p className="text-zinc-400 text-sm line-clamp-2 mb-6">
                    {description}
                  </p>
                  <div className="flex items-center justify-between text-xs text-zinc-500 font-medium uppercase tracking-wider">
                    <span>{date}</span>
                    <ArrowRight className="w-4 h-4 group-hover:text-white transition-colors" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
