import { useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { ArrowUpRight, ChevronRight, Instagram, MapPin, Menu, X } from 'lucide-react';
import {
  type CmsState,
  CASA_LOGO_URL,
  VERIFIED_DELIVEROO_URL,
  VERIFIED_GOOGLE_MAPS_URL,
  VERIFIED_INSTAGRAM_URL,
  VERIFIED_UBEREATS_URL,
  getHalalDisplay,
} from '../lib/cms';
import { useDialog } from '../lib/useDialog';
import { HalalBadge } from './HalalBadge';

const NAV_LINKS = [
  { href: '#sandwiches', label: 'Sandwiches' },
  { href: '#msemen', label: 'Msemen & Wraps' },
  { href: '#about', label: 'About' },
  { href: '#follow-the-flavour', label: 'Follow' },
  { href: '#find-us', label: 'Find Us' },
];

export function Navbar({ cms }: { cms: CmsState }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const halal = getHalalDisplay(cms);

  useDialog(mobileMenuOpen, () => setMobileMenuOpen(false), drawerRef);

  // Close the drawer if the viewport grows to the desktop layout.
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const mq = window.matchMedia('(min-width: 1024px)');
    const onChange = () => mq.matches && setMobileMenuOpen(false);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [mobileMenuOpen]);

  return (
    <>
    <header className="sticky top-0 z-50 border-b border-white/10 bg-ink/95 text-white backdrop-blur supports-[backdrop-filter]:bg-ink/85">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <a
          href="#top"
          className="inline-flex min-h-11 shrink-0 items-center gap-2.5 whitespace-nowrap font-display text-2xl font-extrabold uppercase tracking-tight text-white"
        >
          <img
            src={cms.brand.logoUrl || CASA_LOGO_URL}
            alt=""
            width={36}
            height={36}
            className="h-9 w-9 shrink-0 rounded-full object-cover ring-1 ring-white/20"
          />
          <span>Casa Street</span>
        </a>

        <nav aria-label="Primary" className="hidden items-center gap-0.5 lg:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="inline-flex min-h-11 items-center whitespace-nowrap rounded-md px-3 text-sm font-medium text-neutral-300 transition-colors hover:bg-white/5 hover:text-white"
            >
              {link.label}
            </a>
          ))}
          <a
            href={VERIFIED_INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Casa Street on Instagram (opens in a new tab)"
            className="ml-1 inline-flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded-md px-2 text-sm font-medium text-white transition-colors hover:bg-white/5 hover:text-saffron"
          >
            <Instagram className="h-4 w-4" aria-hidden="true" />
            <span className="hidden xl:inline">Instagram</span>
          </a>
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <a
            href={VERIFIED_UBEREATS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden min-h-11 items-center gap-2 whitespace-nowrap rounded-full bg-casa px-5 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-casa/25 transition hover:-translate-y-px hover:bg-casa-dark md:inline-flex"
          >
            <span>Order Online</span>
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </a>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full text-neutral-100 transition-colors hover:bg-white/10 lg:hidden"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" aria-hidden="true" />
            ) : (
              <Menu className="h-6 w-6" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>
    </header>

      {/* Rendered outside <header>: its backdrop-filter would otherwise become the
          containing block for this fixed overlay and collapse it. */}
      {mobileMenuOpen && (
        <div
          id="mobile-menu"
          ref={drawerRef}
          role="dialog"
          aria-modal="true"
          aria-label="Site menu"
          className="fixed inset-x-0 bottom-0 top-16 z-40 overflow-y-auto bg-ink bg-zellige lg:hidden"
        >
          <div className="mx-auto flex min-h-full max-w-xl flex-col gap-8 px-5 pb-10 pt-6">
            <nav aria-label="Mobile">
              <ul className="divide-y divide-white/10 border-y border-white/10">
                {NAV_LINKS.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      // Close synchronously so the page is unlocked before the
                      // browser performs the default anchor scroll.
                      onClick={() => flushSync(() => setMobileMenuOpen(false))}
                      className="flex min-h-14 items-center justify-between py-3 font-display text-3xl font-bold uppercase tracking-tight text-white transition-colors hover:text-saffron"
                    >
                      <span>{link.label}</span>
                      <ChevronRight className="h-6 w-6 text-white/40" aria-hidden="true" />
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="grid gap-3">
              <a
                href={VERIFIED_UBEREATS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-13 items-center justify-center gap-2 rounded-full bg-casa px-6 text-sm font-bold uppercase tracking-wider text-white"
              >
                <span>Order on Uber Eats</span>
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </a>
              <a
                href={VERIFIED_DELIVEROO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-13 items-center justify-center gap-2 rounded-full bg-roo px-6 text-sm font-bold uppercase tracking-wider text-ink"
              >
                <span>Order on Deliveroo</span>
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </a>
              <div className="grid grid-cols-2 gap-3">
                <a
                  href={VERIFIED_GOOGLE_MAPS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 text-xs font-bold uppercase tracking-wider text-white"
                >
                  <MapPin className="h-4 w-4 text-saffron" aria-hidden="true" />
                  <span>Directions</span>
                </a>
                <a
                  href={VERIFIED_INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 text-xs font-bold uppercase tracking-wider text-white"
                >
                  <Instagram className="h-4 w-4 text-saffron" aria-hidden="true" />
                  <span>Instagram</span>
                </a>
              </div>
            </div>

            <div className="mt-auto flex flex-col items-start gap-3 text-sm text-neutral-400">
              {halal.show && <HalalBadge />}
              <p>145–147 Edgware Road, London W2 2HR · Inside The Food District</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
