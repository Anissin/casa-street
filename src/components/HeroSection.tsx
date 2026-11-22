import { useState } from 'react';
import {
  ArrowUpRight,
  Coffee,
  Instagram,
  Layers,
  MapPin,
  Sandwich,
  UtensilsCrossed,
  type LucideIcon,
} from 'lucide-react';
import {
  type CmsState,
  VERIFIED_DELIVEROO_URL,
  VERIFIED_GOOGLE_MAPS_URL,
  VERIFIED_INSTAGRAM_URL,
  VERIFIED_UBEREATS_URL,
  getHalalDisplay,
} from '../lib/cms';
import { HalalBadge } from './HalalBadge';

export function HeroSection({ cms }: { cms: CmsState }) {
  const [heroImageError, setHeroImageError] = useState(false);
  const halal = getHalalDisplay(cms);

  const highlights: Array<{ title: string; body: string; icon?: LucideIcon }> = [
    {
      icon: Sandwich,
      title: '5 City Sandwiches',
      body: 'Casablanca, Tangier, Marrakesh, Rabat & Fes',
    },
    ...(halal.show
      ? [
          {
            title: '100% Halal',
            body: halal.certified
              ? `100% halal meat & chicken${halal.certificationBody ? `, certified by ${halal.certificationBody}` : ', certified'}`
              : '100% halal meat & chicken, confirmed by Casa Street',
          },
        ]
      : []),
    {
      icon: Layers,
      title: 'Firma Wrap & Msemen',
      body: 'Savoury Firma Wrap & Nutella, pistachio or amlou msemen',
    },
    {
      icon: Coffee,
      title: 'Tajine & Mint Tea',
      body: 'Chicken tajine, fresh mint tea & Moroccan sodas',
    },
  ];

  return (
    <section
      id="top"
      aria-labelledby="hero-heading"
      className="relative isolate overflow-hidden bg-ink text-white"
    >
      {/* Ambient brand glow + zellige texture (decorative) */}
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-zellige opacity-60" />
      <div
        aria-hidden="true"
        className="absolute -left-40 -top-40 -z-10 h-[32rem] w-[32rem] rounded-full bg-casa/25 blur-3xl"
      />

      <div className="mx-auto max-w-7xl px-4 pb-12 pt-10 sm:px-6 sm:pt-14 lg:px-8 lg:pb-16 lg:pt-20">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="flex flex-col gap-7 lg:col-span-7">
            {halal.show && (
              <div className="flex flex-wrap items-center gap-3">
                <HalalBadge size="lg" />
              </div>
            )}

            <div className="space-y-4">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-saffron">
                <span className="block sm:inline">
                  {halal.show ? 'Halal Moroccan Street Food' : 'Moroccan Street Food'}
                </span>
                <span aria-hidden="true" className="mx-2 hidden text-white/30 sm:inline">
                  ·
                </span>
                <span className="mt-1 block text-neutral-300 sm:mt-0 sm:inline">
                  Edgware Road, London
                </span>
              </p>
              <h1
                id="hero-heading"
                className="font-display text-[3.25rem] font-extrabold uppercase leading-[0.9] tracking-tight text-balance sm:text-7xl lg:text-[5.5rem]"
              >
                Casablanca to Paddington.{' '}
                <span className="text-saffron">Built Oversized.</span>
              </h1>
            </div>

            <p className="max-w-xl text-base leading-relaxed text-neutral-300 sm:text-lg">
              Loaded Moroccan baguettes named after Moroccan cities, stuffed with spiced meats,
              chips inside, olives and house sauces. Plus Signature Firma Wraps, flaky msemen and
              chicken tajine.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <a
                href={VERIFIED_UBEREATS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex min-h-13 items-center justify-center gap-2 rounded-full bg-casa px-7 text-sm font-bold uppercase tracking-wider text-white shadow-xl shadow-casa/30 transition hover:-translate-y-0.5 hover:bg-casa-dark"
              >
                <span>Order on Uber Eats</span>
                <ArrowUpRight
                  className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </a>
              <div className="grid grid-cols-2 gap-3 sm:flex">
                <a
                  href={VERIFIED_DELIVEROO_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-13 items-center justify-center gap-2 rounded-full bg-roo px-6 text-sm font-bold uppercase tracking-wider text-ink transition hover:-translate-y-0.5 hover:bg-roo-dark"
                >
                  <span>Deliveroo</span>
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </a>
                <a
                  href={VERIFIED_GOOGLE_MAPS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-13 items-center justify-center gap-2 rounded-full border border-white/25 bg-white/5 px-6 text-sm font-bold uppercase tracking-wider text-white transition hover:border-white/50 hover:bg-white/10"
                >
                  <MapPin className="h-4 w-4 text-saffron" aria-hidden="true" />
                  <span>Find Us</span>
                </a>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-white/10 pt-5 text-sm text-neutral-400">
              <span className="inline-flex items-center gap-2">
                <MapPin className="h-4 w-4 text-saffron" aria-hidden="true" />
                Inside The Food District · 145–147 Edgware Rd, W2 2HR
              </span>
              <a
                href={VERIFIED_INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center gap-2 text-neutral-200 transition-colors hover:text-saffron"
              >
                <Instagram className="h-4 w-4" aria-hidden="true" />
                <span>@casastreetldn</span>
              </a>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              <div className="arch relative aspect-[4/5] overflow-hidden bg-ink-2 ring-1 ring-white/15 shadow-2xl shadow-black/50">
                {!heroImageError ? (
                  <img
                    src={cms.brand.heroImage}
                    srcSet={cms.brand.heroImageSrcSet}
                    sizes="(min-width: 1280px) 480px, (min-width: 1024px) 38vw, (min-width: 640px) 448px, 92vw"
                    alt={cms.brand.heroImageAlt}
                    width={749}
                    height={936}
                    fetchPriority="high"
                    decoding="async"
                    onError={() => setHeroImageError(true)}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-zellige p-6 text-neutral-300">
                    <UtensilsCrossed className="h-10 w-10 text-saffron" aria-hidden="true" />
                    <p className="font-display text-2xl uppercase tracking-wide">Casa Street Kitchen</p>
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent px-6 pb-6 pt-24">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-saffron">
                    The Food District · Edgware Road
                  </p>
                  <p className="mt-1 font-display text-2xl font-bold uppercase leading-tight tracking-tight text-white sm:text-3xl">
                    Casablanca, Tangier, Marrakesh, Rabat &amp; Fes
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <ul
          className={`mt-12 grid grid-cols-1 gap-x-8 gap-y-6 border-t border-white/10 pt-8 sm:grid-cols-2 ${
            highlights.length === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'
          }`}
        >
          {highlights.map((item) => (
            <li key={item.title} className="flex items-start gap-3">
              {!item.icon ? (
                <span
                  aria-hidden="true"
                  lang="ar"
                  dir="rtl"
                  className="mt-0.5 inline-flex h-8 shrink-0 items-center justify-center rounded-full bg-halal px-2 text-xs font-bold leading-none text-white"
                >
                  حلال
                </span>
              ) : (
                <item.icon className="mt-1 h-6 w-6 shrink-0 text-saffron" aria-hidden="true" />
              )}
              <div>
                <p className="font-display text-xl font-bold uppercase tracking-wide text-white">
                  {item.title}
                </p>
                <p className="mt-0.5 text-sm text-neutral-400">{item.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
