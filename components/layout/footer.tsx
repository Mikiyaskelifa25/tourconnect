import Image from 'next/image'
import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 sm:gap-8">
          {/* Brand */}
          <Link href="/" className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <Image src="/websitelogo.svg" alt="Ethio Tour Guider Portal" width={40} height={40} className="w-9 h-9 brightness-0 invert" unoptimized />
              <span className="text-base font-black text-white tracking-tight font-sans">
                Ethio <span className="text-white">TGP</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
              The premier digital gateway connecting verified tour operators with elite licensed guides across Ethiopia.
            </p>
          </Link>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-4">Platform</h4>
            <ul className="space-y-2.5">
              {['For Guides', 'For Operators', 'How It Works', 'Safety'].map((link) => (
                <li key={link}>
                  <a href="#" className="text-sm text-slate-400 hover:text-white transition-colors duration-200">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-4">Support</h4>
            <ul className="space-y-2.5">
              {['Help Center', 'Contact Us', 'Privacy Policy', 'Terms of Service'].map((link) => (
                <li key={link}>
                  <a href="#" className="text-sm text-slate-400 hover:text-white transition-colors duration-200">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Flag Stripe + Copyright */}
          <div className="sm:col-span-2 lg:col-span-1 flex flex-col justify-between">
            <div className="flex gap-1 mb-4">
              <div className="h-1 flex-1 rounded-full bg-[#2563eb]" />
              <div className="h-1 flex-1 rounded-full bg-[#ffd100]" />
              <div className="h-1 flex-1 rounded-full bg-[#ef3340]" />
            </div>
            <div>
              <p className="text-xs text-slate-500 leading-relaxed">
                &copy; {new Date().getFullYear()} Ethio Tour Guider Portal.
                <br />
                All rights reserved.
              </p>
              <p className="text-[10px] text-slate-600 mt-2">
                Built with pride in Ethiopia.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
