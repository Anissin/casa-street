import { ArrowUpRight, Instagram, MapPin, ShieldCheck } from 'lucide-react';
import {
  type CmsState,
  CASA_LOGO_URL,
  VERIFIED_DELIVEROO_URL,
  VERIFIED_GOOGLE_MAPS_URL,
  VERIFIED_INSTAGRAM_URL,
  VERIFIED_UBEREATS_URL,
  getPublicSocialLinks,
} from '../lib/cms';

interface FooterProps {
  cms: CmsState;
  onOpenOwnerStudio: () => void;
  onOpenConcierge: () => void;
}

export function Footer({ cms, onOpenOwnerStudio, onOpenConcierge }: FooterProps) {
  const verifiedFooterSocials = getPublicSocialLinks(cms, 'footer').filter((l) =>
    ['instagram', 'tiktok', 'facebook', 'whatsapp'].includes(l.platform)
  );

  return (
    <footer className="bg-[#141413] text-neutral-300 border-t border-white/10 pb-20 md:pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="flex items-start gap-4 max-w-md">
            <img
              src={cms.brand.logoUrl || CASA_LOGO_URL}
              alt="Casa Street official crest"
              className="w-14 h-14 rounded-full object-cover border border-white/15 shrink-0"
            />
            <div className="space-y-1.5">
              <span className="font-display text-3xl font-extrabold uppercase tracking-tight text-white">
                Casa Street
              </span>
              <p className="text-sm text-neutral-400">
                145–147 Edgware Road, Paddington, London W2 2HR (The Food District). Oversized
                Moroccan sandwiches, Signature Firma Wrap, flaky Msemen &amp; Tagines. Separate from
                The Taco House.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href={VERIFIED_UBEREATS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#C8281E] hover:bg-[#AD2017] text-white text-xs font-semibold uppercase tracking-wider rounded-md whitespace-nowrap"
            >
              <span>Uber Eats</span>
              <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
            </a>

            <a
              href={VERIFIED_DELIVEROO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#00CCBC] hover:bg-[#00B3A5] text-[#141413] text-xs font-semibold uppercase tracking-wider rounded-md whitespace-nowrap"
            >
              <span>Deliveroo</span>
              <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
            </a>

            <a
              href={VERIFIED_GOOGLE_MAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs font-semibold uppercase tracking-wider rounded-md whitespace-nowrap"
            >
              <MapPin className="w-3.5 h-3.5 text-[#F59E0B]" aria-hidden="true" />
              <span>Find Us</span>
            </a>

            {verifiedFooterSocials.map((link) => (
              <a
                key={link.id}
                href={link.url || VERIFIED_INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs font-semibold uppercase tracking-wider rounded-md whitespace-nowrap"
              >
                {link.platform === 'instagram' && (
                  <Instagram className="w-3.5 h-3.5 text-[#F59E0B]" aria-hidden="true" />
                )}
                <span>{link.label}</span>
              </a>
            ))}
          </div>
        </div>

        <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-neutral-400">
          <p>© {new Date().getFullYear()} Casa Street London · Edgware Road W2 2HR.</p>

          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={onOpenConcierge}
              className="hover:text-white transition-colors"
            >
              Kitchen Concierge
            </button>
            <button
              type="button"
              onClick={onOpenOwnerStudio}
              className="inline-flex items-center gap-1.5 hover:text-white transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#F59E0B]" aria-hidden="true" />
              <span>Owner CMS &amp; Approvals</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
