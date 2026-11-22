interface HalalBadgeProps {
  size?: 'md' | 'lg';
  className?: string;
}

/**
 * Prominent "100% HALAL" badge. Only render when the owner has confirmed
 * halal messaging (see getHalalDisplay). It makes no certification claim.
 */
export function HalalBadge({ size = 'md', className = '' }: HalalBadgeProps) {
  const large = size === 'lg';
  return (
    <span
      className={`inline-flex items-center rounded-full bg-halal text-white ring-1 ring-white/20 shadow-lg shadow-black/25 ${
        large ? 'gap-3 py-1.5 pl-1.5 pr-5' : 'gap-2 py-1 pl-1 pr-3.5'
      } ${className}`}
    >
      <span
        aria-hidden="true"
        lang="ar"
        dir="rtl"
        className={`inline-flex items-center justify-center rounded-full bg-cream font-bold leading-none text-halal ${
          large ? 'h-9 px-3 text-lg' : 'h-7 px-2.5 text-sm'
        }`}
      >
        حلال
      </span>
      <span
        className={`font-display font-bold uppercase leading-none tracking-[0.18em] ${
          large ? 'text-xl' : 'text-base'
        }`}
      >
        100% Halal
      </span>
    </span>
  );
}

/** Compact tag for individual menu items the owner has marked halal. */
export function HalalTag({ className = '' }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full bg-halal px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow-md shadow-black/20 ${className}`}
    >
      <span aria-hidden="true" lang="ar" dir="rtl" className="text-xs font-bold leading-none normal-case">
        حلال
      </span>
      <span>Halal</span>
    </span>
  );
}
