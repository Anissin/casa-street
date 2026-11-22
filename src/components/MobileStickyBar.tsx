import { ArrowUpRight, MapPin } from 'lucide-react';
import { VERIFIED_GOOGLE_MAPS_URL, VERIFIED_UBEREATS_URL } from '../lib/cms';

export function MobileStickyBar() {
  return (
    <div
      role="region"
      aria-label="Quick order and directions"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 h-14 bg-[#141413]/95 backdrop-blur border-t border-white/15 px-3 flex items-center gap-2"
    >
      <a
        href={VERIFIED_UBEREATS_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 h-10 inline-flex items-center justify-center gap-1.5 bg-[#C8281E] hover:bg-[#AD2017] text-white text-xs font-semibold uppercase tracking-wider rounded-md whitespace-nowrap"
      >
        <span>Order Online</span>
        <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
      </a>

      <a
        href={VERIFIED_GOOGLE_MAPS_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 h-10 inline-flex items-center justify-center gap-1.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-semibold uppercase tracking-wider rounded-md whitespace-nowrap"
      >
        <MapPin className="w-3.5 h-3.5 text-[#F59E0B]" aria-hidden="true" />
        <span>Find Us</span>
      </a>
    </div>
  );
}
