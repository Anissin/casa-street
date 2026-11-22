import { ArrowUpRight, Camera, MapPin, MessageSquare, ShieldCheck } from 'lucide-react';
import {
  type CmsState,
  VERIFIED_DELIVEROO_URL,
  VERIFIED_GOOGLE_MAPS_URL,
  VERIFIED_UBEREATS_URL,
} from '../lib/cms';

interface LocationOrderSectionProps {
  cms: CmsState;
  onOpenConcierge: () => void;
  onOpenPhotoAnalyzer: () => void;
  onOpenOwnerStudio: () => void;
}

export function LocationOrderSection({
  cms,
  onOpenConcierge,
  onOpenPhotoAnalyzer,
  onOpenOwnerStudio,
}: LocationOrderSectionProps) {
  return (
    <section id="find-us" className="py-16 lg:py-24 bg-[#FAFAF7] text-[#141413]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Verified Location & Ordering Card */}
          <div className="lg:col-span-7 rounded-xl border border-[#E4E0D5] bg-[#F1EFEA] p-8 flex flex-col justify-between gap-8">
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#C8281E]">
                The Food District · 145–147 Edgware Road, Paddington W2 2HR
              </p>
              <h2 className="font-display text-4xl sm:text-5xl font-extrabold uppercase tracking-tight text-[#141413]">
                Find Casa Street or Order Direct
              </h2>
              <p className="text-base text-neutral-700 leading-relaxed max-w-xl">
                Visit our 100% Halal Moroccan street-food counter inside The Food District on Edgware
                Road, or order Casablanca, Tangier, Marrakesh, Rabat, and Fes sandwiches directly
                via Uber Eats or Deliveroo Paddington.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#E4E0D5]">
              <div>
                <p className="text-xs text-neutral-500">Verified Address &amp; Coordinates</p>
                <p className="text-sm font-semibold text-[#141413] mt-1">
                  {cms.location.streetAddress}, {cms.location.postalCode}
                </p>
                <p className="font-mono text-xs text-neutral-600 mt-0.5">
                  {cms.location.latitude.toFixed(6)}, {cms.location.longitude.toFixed(6)}
                </p>
              </div>
              <div>
                <p className="text-xs text-neutral-500">District Separation</p>
                <p className="text-sm font-medium text-[#141413] mt-1">
                  Casa Street Kitchen · Separate from The Taco House
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <a
                href={VERIFIED_UBEREATS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 min-h-11 px-5 py-3 bg-[#C8281E] hover:bg-[#AD2017] text-white text-xs font-semibold uppercase tracking-wider rounded-md transition-colors whitespace-nowrap shrink-0"
              >
                <span>Order on Uber Eats</span>
                <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
              </a>

              <a
                href={VERIFIED_DELIVEROO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 min-h-11 px-5 py-3 bg-[#00CCBC] hover:bg-[#00B3A5] text-[#141413] text-xs font-semibold uppercase tracking-wider rounded-md transition-colors whitespace-nowrap shrink-0"
              >
                <span>Order on Deliveroo</span>
                <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
              </a>

              <a
                href={VERIFIED_GOOGLE_MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 min-h-11 px-5 py-3 bg-[#141413] hover:bg-neutral-800 text-white text-xs font-semibold uppercase tracking-wider rounded-md transition-colors whitespace-nowrap shrink-0"
              >
                <MapPin className="w-4 h-4 text-[#F59E0B]" aria-hidden="true" />
                <span>Google Maps</span>
              </a>
            </div>
          </div>

          {/* Kitchen Concierge & Owner Approval Tools */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="flex-1 rounded-xl border border-[#E4E0D5] bg-white p-6 flex flex-col justify-between gap-4">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                  Kitchen Concierge &amp; Dish Photo Check
                </p>
                <h3 className="font-display text-2xl font-bold uppercase tracking-tight text-[#141413]">
                  Ask About Sandwiches or Analyze a Dish Photo
                </h3>
                <p className="text-sm text-neutral-700 leading-relaxed">
                  Chat with our kitchen guide about Casablanca, Tangier, Fes, Rabat, and Marrakesh
                  sandwiches or upload a photo to verify Casa Street kitchen shots.
                </p>
              </div>

              <div className="flex flex-wrap gap-2.5">
                <button
                  type="button"
                  onClick={onOpenConcierge}
                  className="inline-flex items-center gap-2 min-h-11 px-4 py-2.5 bg-[#141413] hover:bg-[#C8281E] text-white text-xs font-semibold uppercase tracking-wider rounded-md transition-colors whitespace-nowrap"
                >
                  <MessageSquare className="w-4 h-4" aria-hidden="true" />
                  <span>Ask Kitchen Chat</span>
                </button>
                <button
                  type="button"
                  onClick={onOpenPhotoAnalyzer}
                  className="inline-flex items-center gap-2 min-h-11 px-4 py-2.5 border border-[#D4CFC2] hover:border-[#141413] text-[#141413] text-xs font-semibold uppercase tracking-wider rounded-md transition-colors whitespace-nowrap"
                >
                  <Camera className="w-4 h-4" aria-hidden="true" />
                  <span>Analyze Dish Photo</span>
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-[#E4E0D5] bg-white p-6 flex flex-col justify-between gap-4">
              <div className="space-y-1.5">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#C8281E]">
                  Owner Approval Workflow
                </p>
                <h3 className="font-display text-2xl font-bold uppercase tracking-tight text-[#141413]">
                  CMS, Social Verification &amp; Drafts
                </h3>
                <p className="text-sm text-neutral-700 leading-relaxed">
                  Verify TikTok, Facebook, or WhatsApp links, review the unpublished French Tacos
                  draft, approve Follow The Flavour media, and inspect live Schema.org JSON-LD.
                </p>
              </div>

              <button
                type="button"
                onClick={onOpenOwnerStudio}
                className="inline-flex items-center justify-center gap-2 min-h-11 px-4 py-2.5 bg-[#F1EFEA] hover:bg-[#E4E0D5] border border-[#D4CFC2] text-[#141413] text-xs font-semibold uppercase tracking-wider rounded-md transition-colors whitespace-nowrap self-start"
              >
                <ShieldCheck className="w-4 h-4 text-[#C8281E]" aria-hidden="true" />
                <span>Open Owner Studio</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
