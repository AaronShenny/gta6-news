import Link from 'next/link';
import { Map, Newspaper } from 'lucide-react';
import Countdown from './Countdown';

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="group flex items-center space-x-3">
          <img src="https://upload.wikimedia.org/wikipedia/commons/6/64/Grand_Theft_Auto_VI_logo.svg" alt="GTA VI Logo" className="h-10 w-auto group-hover:scale-105 transition-transform" />
        </Link>
        
        <div className="hidden md:block">
          <Countdown />
        </div>

        <nav className="flex items-center space-x-6 bg-black/40 backdrop-blur-md px-6 py-3 rounded-full border border-white/10">
          <Link href="/#news" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">News</Link>
          <Link href="/map" className="text-sm font-medium text-gray-300 hover:text-white transition-colors flex items-center gap-2">
            <Map className="w-4 h-4" /> Map
          </Link>
        </nav>
      </div>
    </header>
  );
}
