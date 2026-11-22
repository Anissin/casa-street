import { ArrowUpRight, MapPin } from 'lucide-react';
import { VERIFIED_GOOGLE_MAPS_URL, VERIFIED_UBEREATS_URL } from '../lib/cms';

/** Thumb-reachable ordering bar on phones (hidden from md, where the header CTA shows). */
export function MobileStickyBar() {
  return (
    <div
      role="region"
      aria-label="Quick order and directions"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-white/15 bg-ink/95 px-3 pb-[max(0.625rem,env(safe-area-inset-bottom))] pt-2.5 backdrop-blur md:hidden"
    >
      <div className="flex items-center gap-2">
        <a
          href={VERIFIED_UBEREATS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-12 flex-[1.4] items-center justify-center gap-1.5 whitespace-nowrap rounded-full bg-casa text-sm font-bold uppercase tracking-wider text-white shadow-lg shadow-casa/30 active:scale-[0.98]"
        >
          <span>Order Online</span>
          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </a>
        <a
          href={VERIFIED_GOOGLE_MAPS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-12 flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-full border border-white/20 bg-white/10 text-sm font-bold uppercase tracking-wider text-white active:scale-[0.98]"
        >
          <MapPin className="h-4 w-4 text-saffron" aria-hidden="true" />
          <span>Find Us</span>
        </a>
      </div>
    </div>
  );
}
