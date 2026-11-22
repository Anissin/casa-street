import { ArrowUpRight, Instagram, MapPin } from 'lucide-react';
import {
  type CmsState,
  CASA_LOGO_URL,
  VERIFIED_DELIVEROO_URL,
  VERIFIED_GOOGLE_MAPS_URL,
  VERIFIED_INSTAGRAM_URL,
  VERIFIED_UBEREATS_URL,
  getHalalDisplay,
  getPublicSocialLinks,
} from '../lib/cms';
import { HalalBadge } from './HalalBadge';

interface FooterProps {
  cms: CmsState;
}

const EXPLORE_LINKS = [
  { href: '#sandwiches', label: 'Sandwiches' },
  { href: '#msemen', label: 'Msemen & Wraps' },
  { href: '#tagines', label: 'Tagine & Drinks' },
  { href: '#about', label: 'About' },
  { href: '#find-us', label: 'Find Us' },
];

export function Footer({ cms }: FooterProps) {
  const halal = getHalalDisplay(cms);
  const extraSocials = getPublicSocialLinks(cms, 'footer').filter((l) =>
    ['tiktok', 'facebook', 'whatsapp'].includes(l.platform)
  );

  const orderLinks = [
    { href: VERIFIED_UBEREATS_URL, label: 'Order on Uber Eats' },
    { href: VERIFIED_DELIVEROO_URL, label: 'Order on Deliveroo' },
    { href: VERIFIED_GOOGLE_MAPS_URL, label: 'Google Maps' },
    { href: VERIFIED_INSTAGRAM_URL, label: 'Instagram @casastreetldn' },
    ...extraSocials.map((l) => ({ href: l.url, label: l.label })),
  ];

  return (
    <footer className="bg-ink pb-24 text-neutral-300 md:pb-10">
      <div className="mx-auto max-w-7xl px-4 pt-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 border-b border-white/10 pb-10 md:grid-cols-12">
          <div className="space-y-5 md:col-span-5">
            <div className="flex items-center gap-4">
              <img
                src={cms.brand.logoUrl || CASA_LOGO_URL}
                alt="Casa Street logo"
                width={56}
                height={56}
                loading="lazy"
                className="h-14 w-14 shrink-0 rounded-full ring-1 ring-white/15"
              />
              <div>
                <p className="font-display text-3xl font-extrabold uppercase tracking-tight text-white">
                  Casa Street
                </p>
                <p className="text-sm text-neutral-400">
                  {halal.show ? 'Halal Moroccan Street Food' : 'Moroccan Street Food'}
                </p>
              </div>
            </div>
            {halal.show && (
              <div className="space-y-2">
                <HalalBadge />
                <p className="text-xs text-neutral-400">
                  100% halal meat &amp; chicken
                  {halal.certified
                    ? halal.certificationBody
                      ? ` · Certified by ${halal.certificationBody}`
                      : ' · Certified'
                    : ''}
                </p>
              </div>
            )}
            <address className="flex items-start gap-2 text-sm not-italic leading-relaxed text-neutral-400">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-saffron" aria-hidden="true" />
              <span>
                The Food District, {cms.location.streetAddress}, Paddington, {cms.location.city}{' '}
                {cms.location.postalCode}
              </span>
            </address>
          </div>

          <nav aria-label="Footer" className="md:col-span-3">
            <h2 className="font-display text-lg font-bold uppercase tracking-wider text-white">Explore</h2>
            <ul className="mt-3 space-y-0.5">
              {EXPLORE_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="inline-flex min-h-11 min-w-11 items-center text-sm text-neutral-400 transition-colors hover:text-white"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="md:col-span-4">
            <h2 className="font-display text-lg font-bold uppercase tracking-wider text-white">
              Order &amp; Follow
            </h2>
            <ul className="mt-3 space-y-0.5">
              {orderLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-11 items-center gap-1.5 text-sm text-neutral-400 transition-colors hover:text-white"
                  >
                    {link.href === VERIFIED_INSTAGRAM_URL && (
                      <Instagram className="h-4 w-4 text-saffron" aria-hidden="true" />
                    )}
                    <span>{link.label}</span>
                    <ArrowUpRight className="h-3.5 w-3.5 opacity-60" aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col justify-between gap-2 py-6 text-xs text-neutral-400 sm:flex-row sm:items-center">
          <p>
            © {new Date().getFullYear()} Casa Street London · 145–147 Edgware Road, W2 2HR
          </p>
          <p>{halal.show ? 'Halal Moroccan Street Food' : 'Moroccan Street Food'} · Edgware Road</p>
        </div>
      </div>
    </footer>
  );
}
