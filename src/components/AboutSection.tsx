import { ExternalLink, MapPin, Sandwich } from 'lucide-react';
import { type CmsState, getHalalDisplay } from '../lib/cms';
import { HalalBadge } from './HalalBadge';

/**
 * About Casa Street. Copy is limited to facts already verified in the CMS
 * (location, menu, naming) — no invented history, founders or awards.
 */
export function AboutSection({ cms }: { cms: CmsState }) {
  const halal = getHalalDisplay(cms);

  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className="relative overflow-hidden bg-sand py-16 text-ink lg:py-24"
    >
      <div aria-hidden="true" className="absolute inset-0 bg-zellige-casa opacity-70" />
      <div className="relative mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 sm:px-6 lg:grid-cols-12 lg:gap-14 lg:px-8">
        <div className="space-y-5 lg:col-span-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-casa">
            About Casa Street
          </p>
          <h2
            id="about-heading"
            className="font-display text-5xl font-extrabold uppercase leading-[0.92] tracking-tight text-balance sm:text-6xl"
          >
            {halal.show ? 'Halal Moroccan Street Food' : 'Moroccan Street Food'}, Built Oversized
          </h2>
          <p className="text-base leading-relaxed text-neutral-700 sm:text-lg">
            Casa Street brings Moroccan street food to Edgware Road. Our sandwiches carry the names
            of Moroccan cities and come in oversized Moroccan baguettes, loaded with spiced meats,
            chips inside, Moroccan salad, olives and house sauces.
          </p>
          <p className="text-base leading-relaxed text-neutral-700">
            Alongside them you&apos;ll find the Signature Firma Wrap, flaky griddled msemen with
            Nutella, pistachio or amlou, chicken tajine and fresh Moroccan mint tea.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:col-span-7">
          {halal.show && (
            <article className="relative overflow-hidden rounded-2xl bg-halal p-7 text-white shadow-xl shadow-halal/20 sm:col-span-2">
              <div aria-hidden="true" className="absolute inset-0 bg-zellige opacity-40" />
              <div className="relative space-y-4">
                <HalalBadge className="bg-halal-dark" />
                <h3 className="font-display text-3xl font-extrabold uppercase tracking-tight">
                  100% halal meat &amp; chicken
                </h3>
                <p className="max-w-xl leading-relaxed text-white/90">
                  All the meat and chicken we serve is 100% halal
                  {halal.certified ? (
                    halal.certificationBody ? (
                      <>
                        , certified by{' '}
                        <strong className="font-semibold">{halal.certificationBody}</strong>
                      </>
                    ) : (
                      <> and certified</>
                    )
                  ) : null}
                  , as confirmed by Casa Street&apos;s owner. Look for the halal tag on the menu.
                  Questions about a specific dish or ingredient? Just ask our team at the counter.
                </p>
                {halal.certificateUrl && (
                  <a
                    href={halal.certificateUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-5 text-xs font-bold uppercase tracking-wider text-halal"
                  >
                    <span>View halal certificate</span>
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                )}
              </div>
            </article>
          )}

          <article className="rounded-2xl bg-white p-7 ring-1 ring-line">
            <Sandwich className="h-8 w-8 text-casa" aria-hidden="true" />
            <h3 className="mt-4 font-display text-2xl font-extrabold uppercase tracking-tight">
              Named after Moroccan cities
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-neutral-700">
              Casablanca, Tangier, Marrakesh, Rabat and Fes. Five sandwiches, each with its own
              fillings and house sauces.
            </p>
          </article>

          <article className="rounded-2xl bg-ink p-7 text-white">
            <MapPin className="h-8 w-8 text-saffron" aria-hidden="true" />
            <h3 className="mt-4 font-display text-2xl font-extrabold uppercase tracking-tight">
              Inside The Food District
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-neutral-300">
              Find our counter at 145–147 Edgware Road, Paddington, or order through Uber Eats and
              Deliveroo.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}
