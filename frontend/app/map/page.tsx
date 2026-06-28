import dynamic from 'next/dynamic';
import Header from '@/components/Header';
import { MapPin } from 'lucide-react';
import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/site";

// Dynamically import the map component with SSR disabled
const SpeculationMap = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => <div className="w-full h-[70vh] rounded-[2rem] bg-zinc-900 animate-pulse flex items-center justify-center text-zinc-500 font-display">Loading Map Interface...</div>
});

export const metadata: Metadata = {
  title: "Interactive Leonida Map | GTA VI Hub",
  description: "Explore the speculated map of Leonida and Vice City with our interactive map featuring confirmed and rumored locations.",
  alternates: {
      canonical: "/map",
  },
  openGraph: {
      title: "Interactive Leonida Map | GTA VI Hub",
      description: "Explore the speculated map of Leonida and Vice City with our interactive map featuring confirmed and rumored locations.",
      url: `${getSiteUrl()}/map`,
  }
};

export default function MapPage() {
  return (
    <main className="min-h-screen selection:bg-vice-pink selection:text-white pb-20 pt-32">
      <Header />
      
      <div className="container mx-auto px-6">
        <header className="mb-12 max-w-3xl">
          <div className="flex items-center gap-3 mb-4">
            <MapPin className="text-vice-blue w-8 h-8" />
            <h1 className="text-4xl md:text-5xl font-display font-black uppercase tracking-tight text-white">
              Leonida <span className="text-transparent bg-clip-text bg-gradient-to-r from-vice-blue to-vice-purple">Tracker</span>
            </h1>
          </div>
          <p className="text-lg text-zinc-400 font-light leading-relaxed">
            An interactive, community-driven map of the state of Leonida. We track leaks, rumors, and confirmed footage to estimate the geography of Vice City and its surrounding counties.
          </p>
        </header>

        <div className="relative">
          {/* Decorative glow */}
          <div className="absolute -inset-4 bg-vice-blue/20 blur-[60px] rounded-full pointer-events-none z-0"></div>
          
          <SpeculationMap />
        </div>
      </div>
    </main>
  );
}
