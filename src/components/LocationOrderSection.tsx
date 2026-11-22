import { ArrowUpRight, Clock, MapPin, Navigation } from 'lucide-react';
import {
  type CmsState,
  CASA_LOGO_URL,
  VERIFIED_DELIVEROO_URL,
  VERIFIED_GOOGLE_MAPS_URL,
  VERIFIED_UBEREATS_URL,
  getHalalDisplay,
} from '../lib/cms';

export function LocationOrderSection({ cms }: { cms: CmsState }) {
  const halal = getHalalDisplay(cms);

  return (
    <section id="find-us" aria-labelledby="find-us-heading" className="bg-cream py-16 text-ink lg:py-24">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-stretch gap-6 px-4 sm:px-6 lg:grid-cols-12 lg:gap-8 lg:px-8">
        <div className="flex flex-col justify-between gap-8 rounded-3xl bg-white p-7 ring-1 ring-line sm:p-10 lg:col-span-7">
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-casa">
              Visit or order
            </p>
            <h2
              id="find-us-heading"
              className="font-display text-5xl font-extrabold uppercase leading-[0.92] tracking-tight sm:text-6xl"
            >
              Find Casa Street
            </h2>
            <p className="max-w-xl text-base leading-relaxed text-neutral-700">
              {halal.show ? 'Our 100% halal Moroccan street-food counter' : 'Our Moroccan street-food counter'}{' '}
              is inside The Food District on Edgware Road, Paddington. Or order Casablanca,
              Tangier, Marrakesh, Rabat and Fes sandwiches to your door with Uber Eats or Deliveroo.
            </p>
          </div>

          <dl className="grid grid-cols-1 gap-5 border-t border-line pt-6 sm:grid-cols-2">
            <div className="flex gap-3">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-casa" aria-hidden="true" />
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Address</dt>
                <dd className="mt-1 text-sm font-semibold text-ink">
                  <address className="not-italic">
                    Casa Street, The Food District
                    <br />
                    {cms.location.streetAddress}
                    <br />
                    {cms.location.city} {cms.location.postalCode}
                  </address>
                </dd>
              </div>
            </div>
            <div className="flex gap-3">
              <Clock className="mt-0.5 h-5 w-5 shrink-0 text-casa" aria-hidden="true" />
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                  Opening hours
                </dt>
                <dd className="mt-1 text-sm text-ink">
                  <a
                    href={VERIFIED_GOOGLE_MAPS_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-11 items-center gap-1 font-semibold underline decoration-casa/40 underline-offset-4 hover:decoration-casa"
                  >
                    See today&apos;s hours on Google Maps
                    <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                </dd>
              </div>
            </div>
          </dl>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <a
              href={VERIFIED_UBEREATS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-casa px-6 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-casa/25 transition hover:-translate-y-0.5 hover:bg-casa-dark"
            >
              <span>Order on Uber Eats</span>
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </a>
            <a
              href={VERIFIED_DELIVEROO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-roo px-6 text-xs font-bold uppercase tracking-wider text-ink transition hover:-translate-y-0.5 hover:bg-roo-dark"
            >
              <span>Order on Deliveroo</span>
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </a>
            <a
              href={VERIFIED_GOOGLE_MAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-ink px-6 text-xs font-bold uppercase tracking-wider text-white transition hover:-translate-y-0.5 hover:bg-ink-3"
            >
              <Navigation className="h-4 w-4 text-saffron" aria-hidden="true" />
              <span>Get directions</span>
            </a>
          </div>
        </div>

        <a
          href={VERIFIED_GOOGLE_MAPS_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Open Casa Street, 145–147 Edgware Road, in Google Maps (opens in a new tab)"
          className="group relative flex min-h-80 flex-col items-center justify-center gap-5 overflow-hidden rounded-3xl bg-ink p-10 text-center text-white lg:col-span-5"
        >
          <span aria-hidden="true" className="absolute inset-0 bg-zellige transition-opacity duration-500 group-hover:opacity-70" />
          <span
            aria-hidden="true"
            className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-casa/20 blur-3xl"
          />
          <img
            src={cms.brand.logoUrl || CASA_LOGO_URL}
            alt=""
            width={112}
            height={112}
            loading="lazy"
            className="relative h-28 w-28 rounded-full ring-4 ring-white/15 transition-transform duration-500 group-hover:scale-105"
          />
          <span className="relative space-y-1">
            <span className="block font-display text-4xl font-extrabold uppercase tracking-tight">
              Edgware Road
            </span>
            <span className="block text-sm text-neutral-300">
              The Food District · Paddington · {cms.location.postalCode}
            </span>
          </span>
          <span className="relative inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-5 text-xs font-bold uppercase tracking-wider text-ink transition group-hover:gap-3">
            <MapPin className="h-4 w-4 text-casa" aria-hidden="true" />
            Open in Google Maps
          </span>
        </a>
      </div>
    </section>
  );
}
