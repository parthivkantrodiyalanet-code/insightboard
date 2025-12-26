'use client'; 
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function MarketingNavbar() {
  const pathname = usePathname();
  
  const isActive = (path: string) => pathname === path ? 'text-white' : 'text-slate-400 hover:text-white';

  return (
    <nav className="relative z-10 container mx-auto px-6 py-6 flex justify-between items-center">
      <Link href="/" className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
        InsightBoard
      </Link>
      
      <div className="hidden md:flex items-center gap-8">
         <Link href="/about" className={`${isActive('/about')} transition-colors`}>About</Link>
         <Link href="/testimonials" className={`${isActive('/testimonials')} transition-colors`}>Testimonials</Link>
         <Link href="/contact" className={`${isActive('/contact')} transition-colors`}>Contact</Link>
         <Link href="/pricing" className={`${isActive('/pricing')} transition-colors`}>Pricing</Link>
      </div>

      <div className="flex items-center gap-4">
        <Link href="/login" className="text-slate-300 hover:text-white transition-colors">Login</Link>
        <Link href="/register" className="px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 transition-all font-medium text-white">
          Sign Up
        </Link>
      </div>
    </nav>
  );
}
