import { useState } from 'react';
import { Instagram, Menu, X, ExternalLink } from 'lucide-react';
import {
  CASA_LOGO_URL,
  VERIFIED_INSTAGRAM_URL,
  VERIFIED_UBEREATS_URL,
} from '../lib/cms';

interface NavbarProps {
  onOpenConcierge: () => void;
  onOpenOwnerStudio: () => void;
}

export function Navbar({ onOpenConcierge, onOpenOwnerStudio }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 h-14 md:h-16 bg-[#141413]/95 backdrop-blur border-b border-white/10 text-white">
      <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-8">
        {/* Zone 1: Single-line Brand Wordmark + Official Crest */}
        <a
          href="#top"
          className="inline-flex items-center gap-2.5 font-display text-2xl font-extrabold tracking-tight uppercase text-white whitespace-nowrap shrink-0"
        >
          <img
            src={CASA_LOGO_URL}
            alt="Casa Street official emblem"
            className="w-8 h-8 md:w-9 md:h-9 rounded-full object-cover border border-white/20 shrink-0"
          />
          <span>Casa Street</span>
        </a>

        {/* Zone 2: 5 concise single-line nav links */}
        <nav
          aria-label="Primary"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-neutral-300"
        >
          <a
            href="#sandwiches"
            className="hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            Sandwiches
          </a>
          <a
            href="#msemen"
            className="hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            Msemen
          </a>
          <a
            href="#follow-the-flavour"
            className="hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            Follow Us
          </a>
          <a
            href="#find-us"
            className="hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            Find Us
          </a>
          <a
            href={VERIFIED_INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-white hover:text-[#F59E0B] transition-colors whitespace-nowrap shrink-0"
          >
            <Instagram className="w-4 h-4" aria-hidden="true" />
            <span>Instagram</span>
          </a>
        </nav>

        {/* Zone 3: 1 Primary CTA + Mobile drawer toggle */}
        <div className="flex items-center gap-3 shrink-0">
          <a
            href={VERIFIED_UBEREATS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider bg-[#C8281E] hover:bg-[#AD2017] text-white rounded-md transition-colors whitespace-nowrap shrink-0"
          >
            <span>Order Online</span>
            <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
          </a>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-md text-neutral-200 hover:text-white hover:bg-white/10 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#141413] border-b border-white/15 px-4 py-4 space-y-3">
          <nav aria-label="Mobile" className="flex flex-col gap-2 text-base font-medium">
            <a
              href="#sandwiches"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 text-neutral-200 hover:text-white border-b border-white/10"
            >
              Sandwiches
            </a>
            <a
              href="#msemen"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 text-neutral-200 hover:text-white border-b border-white/10"
            >
              Msemen Wraps
            </a>
            <a
              href="#follow-the-flavour"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 text-neutral-200 hover:text-white border-b border-white/10"
            >
              Follow The Flavour
            </a>
            <a
              href="#find-us"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 text-neutral-200 hover:text-white border-b border-white/10"
            >
              Find Us
            </a>
            <a
              href={VERIFIED_INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2 inline-flex items-center gap-2 text-white border-b border-white/10"
            >
              <Instagram className="w-4 h-4 text-[#F59E0B]" aria-hidden="true" />
              <span>Instagram (@casastreetldn)</span>
            </a>
          </nav>
          <div className="pt-2 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenConcierge();
              }}
              className="flex-1 min-h-11 px-3 py-2 text-xs font-semibold uppercase tracking-wider bg-white/10 hover:bg-white/15 text-white rounded-md"
            >
              Ask Kitchen
            </button>
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenOwnerStudio();
              }}
              className="flex-1 min-h-11 px-3 py-2 text-xs font-semibold uppercase tracking-wider border border-white/20 hover:bg-white/10 text-neutral-200 rounded-md"
            >
              Owner CMS
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
