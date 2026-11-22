import { useEffect, useState } from 'react';
import { flushSync } from 'react-dom';
import { ArrowUpRight } from 'lucide-react';
import {
  type CmsState,
  type MenuCategory,
  type MenuCategoryId,
  type MenuItem,
  getHalalDisplay,
  getPublicMenuCategories,
  isItemHalal,
} from '../lib/cms';
import { HalalTag } from './HalalBadge';

/** Stable anchors used by the navigation (must exist whenever "All" is shown). */
const CATEGORY_ANCHORS: Record<MenuCategoryId, string> = {
  'signature-sandwiches': 'sandwiches',
  'msemen-wraps': 'msemen',
  tagines: 'tagines',
  'french-tacos': 'french-tacos',
};

const FILTER_LABELS: Record<MenuCategoryId, string> = {
  'signature-sandwiches': 'Sandwiches',
  'msemen-wraps': 'Msemen & Wraps',
  tagines: 'Tagine & Drinks',
  'french-tacos': 'French Tacos',
};

/** Designed placeholder used where no genuine photo of the dish exists yet. */
function DishTile({ item }: { item: MenuItem }) {
  const shortName = item.name.replace(/\s*\(.*\)\s*/, '');
  return (
    <div
      aria-hidden="true"
      className="relative flex h-full w-full flex-col items-center justify-center gap-2 bg-ink-2 bg-zellige p-6 text-center"
    >
      <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-saffron">
        Casa Street
      </span>
      <span className="font-display text-4xl font-extrabold uppercase leading-[0.95] text-white text-balance sm:text-5xl">
        {shortName}
      </span>
      <span className="text-xs text-white/60">{item.breadOrVessel}</span>
    </div>
  );
}

function MenuCard({
  item,
  halal,
  featured = false,
  muted = false,
}: {
  item: MenuItem;
  halal: boolean;
  featured?: boolean;
  muted?: boolean;
}) {
  const [imgError, setImgError] = useState(false);
  const hasPhoto = Boolean(item.image) && !imgError;

  return (
    <article
      className={`group relative flex flex-col overflow-hidden rounded-2xl ring-1 ring-line transition duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-ink/10 ${
        muted ? 'bg-sand' : 'bg-white shadow-sm'
      } ${featured ? 'md:col-span-2 md:flex-row' : ''}`}
    >
      <div
        className={`relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-ink-2 ${
          featured ? 'md:aspect-auto md:w-[55%]' : ''
        }`}
      >
        {hasPhoto ? (
          <img
            src={item.image}
            srcSet={item.imageSrcSet}
            sizes={
              featured
                ? '(min-width: 1280px) 780px, (min-width: 768px) 60vw, 92vw'
                : '(min-width: 1280px) 400px, (min-width: 768px) 46vw, 92vw'
            }
            alt={item.imageAlt}
            width={960}
            height={720}
            loading="lazy"
            decoding="async"
            onError={() => setImgError(true)}
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        ) : (
          <DishTile item={item} />
        )}

        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3">
          {halal ? <HalalTag /> : <span />}
          {hasPhoto && item.imageIsIllustrative && (
            <span className="rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-medium text-white/90 backdrop-blur-sm">
              Illustrative image
            </span>
          )}
        </div>
      </div>

      <div className={`flex flex-1 flex-col gap-4 p-5 sm:p-6 ${featured ? 'md:justify-center md:p-8 lg:p-10' : ''}`}>
        <p className="text-xs font-medium text-neutral-600">
          {item.cityInspiration && (
            <>
              <span className="font-semibold text-casa">{item.cityInspiration}</span>
              <span aria-hidden="true" className="mx-1.5 text-neutral-400">
                ·
              </span>
            </>
          )}
          <span>{item.breadOrVessel}</span>
        </p>

        <div className="flex items-start justify-between gap-4">
          <h4
            className={`font-display font-extrabold uppercase leading-[0.95] tracking-tight text-ink ${
              featured ? 'text-4xl lg:text-5xl' : 'text-[1.75rem]'
            }`}
          >
            {item.name}
          </h4>
          {item.verifiedPrice && (
            <p
              className={`shrink-0 whitespace-nowrap font-display font-bold tabular-nums text-ink ${
                featured ? 'text-3xl' : 'text-2xl'
              }`}
            >
              {item.verifiedPrice}
            </p>
          )}
        </div>

        <p className={`leading-relaxed text-neutral-700 ${featured ? 'text-base' : 'text-sm'}`}>
          {item.description}
        </p>

        <div className="mt-auto space-y-2 pt-2">
          {item.verifiedPrice && (
            <p className="text-[11px] text-neutral-500">
              Price on {item.priceSourceNote || 'Uber Eats & Deliveroo'}
            </p>
          )}
          <div className={`grid gap-2 ${item.deliverooUrl ? 'grid-cols-2' : 'grid-cols-1'}`}>
            <a
              href={item.orderUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Order ${item.name} on Uber Eats (opens in a new tab)`}
              className="inline-flex min-h-11 items-center justify-center gap-1.5 whitespace-nowrap rounded-full bg-ink px-4 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-casa"
            >
              <span>Uber Eats</span>
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
            {item.deliverooUrl && (
              <a
                href={item.deliverooUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Order ${item.name} on Deliveroo (opens in a new tab)`}
                className="inline-flex min-h-11 items-center justify-center gap-1.5 whitespace-nowrap rounded-full bg-roo px-4 text-xs font-bold uppercase tracking-wider text-ink transition-colors hover:bg-roo-dark"
              >
                <span>Deliveroo</span>
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

function CategoryBlock({
  category,
  cms,
  secondary = false,
}: {
  category: MenuCategory;
  cms: CmsState;
  secondary?: boolean;
}) {
  const isSandwiches = category.id === 'signature-sandwiches';
  const headingId = `menu-${CATEGORY_ANCHORS[category.id]}-heading`;
  return (
    <div
      id={CATEGORY_ANCHORS[category.id]}
      aria-labelledby={headingId}
      role="region"
      className={`space-y-6 ${secondary ? 'border-t border-line pt-10' : ''}`}
    >
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-casa">
            {category.kicker}
          </p>
          <h3
            id={headingId}
            className={`mt-1 font-display font-extrabold uppercase tracking-tight text-ink ${
              secondary ? 'text-3xl' : 'text-4xl'
            }`}
          >
            {category.title}
          </h3>
        </div>
        <p className="max-w-md text-sm leading-relaxed text-neutral-600">{category.description}</p>
      </div>

      <div
        className={`grid gap-5 lg:gap-6 ${
          category.items.length >= 3
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
            : 'grid-cols-1 md:grid-cols-2'
        }`}
      >
        {category.items.map((item, index) => (
          <MenuCard
            key={item.id}
            item={item}
            halal={isItemHalal(cms, item)}
            featured={isSandwiches && index === 0 && category.items.length >= 3}
            muted={secondary}
          />
        ))}
      </div>
    </div>
  );
}

export function SignatureMenuSection({ cms }: { cms: CmsState }) {
  const publicCategories = getPublicMenuCategories(cms);
  const halal = getHalalDisplay(cms);
  const [selectedFilter, setSelectedFilter] = useState<'all' | MenuCategoryId>('all');

  // Nav links (#sandwiches, #msemen, …) must always land on their section, even
  // when a filter has hidden it: reset the filter synchronously before the
  // browser performs the default anchor scroll.
  useEffect(() => {
    if (selectedFilter === 'all') return;
    const anchors = new Set(['menu', ...Object.values(CATEGORY_ANCHORS)]);
    function onClick(e: MouseEvent) {
      const link = (e.target as Element | null)?.closest?.('a[href^="#"]');
      const id = link?.getAttribute('href')?.slice(1);
      if (id && anchors.has(id)) {
        flushSync(() => setSelectedFilter('all'));
      }
    }
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [selectedFilter]);

  const visibleCategories =
    selectedFilter === 'all'
      ? publicCategories
      : publicCategories.filter((cat) => cat.id === selectedFilter);
  const primaryCategories = visibleCategories.filter((c) => c.priority !== 'secondary');
  const secondaryCategories = visibleCategories.filter((c) => c.priority === 'secondary');

  const filters: Array<{ id: 'all' | MenuCategoryId; label: string }> = [
    { id: 'all', label: 'Full Menu' },
    ...publicCategories.map((cat) => ({ id: cat.id, label: FILTER_LABELS[cat.id] ?? cat.title })),
  ];

  return (
    <section
      id="menu"
      aria-labelledby="menu-heading"
      className="relative bg-cream py-16 text-ink lg:py-24"
    >
      <div className="mx-auto max-w-7xl space-y-12 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-8 border-b border-line pb-8 lg:flex-row lg:items-end">
          <div className="max-w-xl space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-casa">
              The Menu · 145–147 Edgware Road
            </p>
            <h2
              id="menu-heading"
              className="font-display text-5xl font-extrabold uppercase leading-[0.92] tracking-tight text-balance sm:text-6xl"
            >
              Oversized Sandwiches &amp; Msemen Wraps
            </h2>
            <p className="text-base leading-relaxed text-neutral-700">
              {halal.show ? 'Halal Moroccan street food' : 'Moroccan street food'}, built big and
              loaded. Prices are as listed on Uber Eats and Deliveroo.
            </p>
            {halal.show && (
              <p className="flex items-center gap-2.5 pt-1 text-sm text-neutral-700">
                <HalalTag />
                <span>
                  100% halal meat &amp; chicken
                  {halal.certified
                    ? halal.certificationBody
                      ? `, certified by ${halal.certificationBody}.`
                      : ', certified.'
                    : '.'}{' '}
                  Halal dishes are tagged.
                </span>
              </p>
            )}
          </div>

          <div
            role="group"
            aria-label="Filter the menu"
            className="no-scrollbar -mx-4 flex snap-x gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 lg:shrink-0 lg:flex-nowrap lg:justify-end"
          >
            {filters.map((filter) => {
              const active = selectedFilter === filter.id;
              return (
                <button
                  key={filter.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setSelectedFilter(filter.id)}
                  className={`min-h-11 shrink-0 snap-start whitespace-nowrap rounded-full px-4 text-sm font-semibold transition-colors xl:px-5 ${
                    active
                      ? 'bg-ink text-white'
                      : 'bg-white text-neutral-700 ring-1 ring-line hover:text-ink hover:ring-ink/30'
                  }`}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>
        </div>

        <p role="status" className="sr-only">
          {selectedFilter === 'all'
            ? 'Showing the full menu'
            : `Showing ${filters.find((f) => f.id === selectedFilter)?.label ?? 'selected'} only`}
        </p>

        <div className="space-y-16">
          {primaryCategories.map((category) => (
            <CategoryBlock key={category.id} category={category} cms={cms} />
          ))}
          {secondaryCategories.map((category) => (
            <CategoryBlock key={category.id} category={category} cms={cms} secondary />
          ))}
        </div>
      </div>
    </section>
  );
}
