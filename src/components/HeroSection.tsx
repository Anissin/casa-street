import { useState } from 'react';
import { ArrowUpRight, MapPin, MessageSquare, Instagram, UtensilsCrossed } from 'lucide-react';
import {
  type CmsState,
  CASA_LOGO_URL,
  VERIFIED_DELIVEROO_URL,
  VERIFIED_GOOGLE_MAPS_URL,
  VERIFIED_INSTAGRAM_URL,
  VERIFIED_UBEREATS_URL,
} from '../lib/cms';

interface HeroSectionProps {
  cms: CmsState;
  onOpenConcierge: () => void;
}

export function HeroSection({ cms, onOpenConcierge }: HeroSectionProps) {
  const [heroImageError, setHeroImageError] = useState(false);

  return (
    <section id="top" className="bg-[#141413] text-white border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
          {/* Left Copy Column */}
          <div className="lg:col-span-6 flex flex-col justify-between gap-8">
            <div className="space-y-6">
              <div className="flex items-center gap-3.5">
                <img
                  src={cms.brand.logoUrl || CASA_LOGO_URL}
                  alt="Casa Street Moroccan Street Food logo"
                  className="w-14 h-14 rounded-full object-cover border border-white/20 shrink-0"
                />
                <p className="text-xs sm:text-sm font-medium tracking-wide text-neutral-300">
                  <span>145–147 Edgware Rd, Paddington W2</span>
                  <span aria-hidden="true" className="mx-2 text-neutral-500">·</span>
                  <span>100% Halal Moroccan Street Food</span>
                </p>
              </div>

              <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-extrabold uppercase leading-[0.94] tracking-tight text-white text-balance">
                Casablanca to Paddington. Built Oversized.
              </h1>

              <p className="text-base sm:text-lg text-neutral-300 leading-relaxed max-w-xl">
                Loaded Moroccan baguettes—Casablanca, Tangier, Marrakesh, Rabat, and Fes—stuffed
                with spiced grilled meats, chips inside, olives, and house sauces, alongside
                Signature Firma Wraps and flaky Msemen. Chicken Tajine &amp; fresh Moroccan mint tea
                sit beside our street-grill mains.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <a
                  href={VERIFIED_UBEREATS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 min-h-11 px-5 py-3 bg-[#C8281E] hover:bg-[#AD2017] text-white font-semibold text-sm uppercase tracking-wider rounded-md transition-colors whitespace-nowrap shrink-0"
                >
                  <span>Uber Eats</span>
                  <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
                </a>

                <a
                  href={VERIFIED_DELIVEROO_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 min-h-11 px-5 py-3 bg-[#00CCBC] hover:bg-[#00B3A5] text-[#141413] font-semibold text-sm uppercase tracking-wider rounded-md transition-colors whitespace-nowrap shrink-0"
                >
                  <span>Deliveroo</span>
                  <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
                </a>

                <a
                  href={VERIFIED_GOOGLE_MAPS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 min-h-11 px-4 py-3 bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold text-sm uppercase tracking-wider rounded-md transition-colors whitespace-nowrap shrink-0"
                >
                  <MapPin className="w-4 h-4 text-[#F59E0B]" aria-hidden="true" />
                  <span>Find Us</span>
                </a>

                <button
                  type="button"
                  onClick={onOpenConcierge}
                  className="inline-flex items-center justify-center gap-2 min-h-11 px-4 py-3 text-neutral-200 hover:text-white border border-white/15 hover:border-white/35 text-sm font-medium rounded-md transition-colors whitespace-nowrap shrink-0"
                >
                  <MessageSquare className="w-4 h-4 text-[#F59E0B]" aria-hidden="true" />
                  <span>Ask Kitchen</span>
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs text-neutral-400">
              <span>Inside The Food District · Order on Uber Eats or Deliveroo Paddington</span>
              <a
                href={VERIFIED_INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-neutral-200 hover:text-[#F59E0B] transition-colors whitespace-nowrap"
              >
                <Instagram className="w-3.5 h-3.5" aria-hidden="true" />
                <span>@casastreetldn</span>
              </a>
            </div>
          </div>

          {/* Right Media Column */}
          <div className="lg:col-span-6">
            <div className="relative h-72 sm:h-96 lg:h-full min-h-[340px] rounded-xl overflow-hidden bg-[#1E1D1B] border border-white/10">
              {!heroImageError ? (
                <img
                  src={cms.brand.heroImage}
                  alt={cms.brand.heroImageAlt}
                  referrerPolicy="no-referrer"
                  onError={() => setHeroImageError(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-3 p-6 bg-gradient-to-br from-[#24211D] to-[#141413] text-neutral-300">
                  <UtensilsCrossed className="w-10 h-10 text-[#F59E0B]" aria-hidden="true" />
                  <p className="font-display text-2xl uppercase tracking-wide">Casa Street Kitchen</p>
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent p-6">
                <p className="text-xs text-neutral-300">
                  <span>Official Kitchen Photography</span>
                  <span aria-hidden="true" className="mx-2 text-neutral-500">·</span>
                  <span>The Food District, Edgware Road</span>
                </p>
                <p className="font-display text-2xl sm:text-3xl font-bold uppercase tracking-tight text-white mt-1">
                  Casablanca, Tangier, Marrakesh, Rabat &amp; Fes
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Full-Width 4-Column Kitchen Strip */}
        <div className="mt-10 pt-8 border-t border-white/10 grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <p className="font-display text-xl font-bold uppercase tracking-wide text-white">
              5 City Sandwiches
            </p>
            <p className="text-sm text-neutral-400 mt-1">
              Casablanca, Tangier, Fes, Rabat &amp; Marrakesh
            </p>
          </div>
          <div>
            <p className="font-display text-xl font-bold uppercase tracking-wide text-white">
              Firma Wrap &amp; Msemen
            </p>
            <p className="text-sm text-neutral-400 mt-1">
              Savoury Firma Wrap &amp; Nutella / Pistachio / Amlou Msemen
            </p>
          </div>
          <div>
            <p className="font-display text-xl font-bold uppercase tracking-wide text-white">
              Tajine &amp; Mint Tea
            </p>
            <p className="text-sm text-neutral-400 mt-1">
              Chicken Tajine, fresh mint tea &amp; Moroccan sodas
            </p>
          </div>
          <div>
            <p className="font-display text-xl font-bold uppercase tracking-wide text-white">
              Uber Eats &amp; Deliveroo
            </p>
            <p className="text-sm text-neutral-400 mt-1">
              Verified ordering across Paddington &amp; West London
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
