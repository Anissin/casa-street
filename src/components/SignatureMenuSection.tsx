import { useState } from 'react';
import { ArrowUpRight, UtensilsCrossed } from 'lucide-react';
import {
  type CmsState,
  type MenuCategory,
  type MenuCategoryId,
  type MenuItem,
  getPublicMenuCategories,
} from '../lib/cms';

interface SignatureMenuSectionProps {
  cms: CmsState;
}

function MenuCard({ item, isSecondary = false }: { item: MenuItem; isSecondary?: boolean }) {
  const [imgError, setImgError] = useState(false);

  return (
    <article
      className={`group flex flex-col rounded-xl overflow-hidden border transition-transform duration-200 hover:-translate-y-0.5 ${
        isSecondary
          ? 'bg-[#F1EFEA] border-[#E4E0D5]'
          : 'bg-white border-[#E4E0D5]'
      }`}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#1E1D1B]">
        {!imgError ? (
          <img
            src={item.image}
            alt={item.imageAlt}
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 p-4 bg-gradient-to-br from-[#26231F] to-[#141413] text-neutral-300">
            <UtensilsCrossed className="w-8 h-8 text-[#F59E0B]" aria-hidden="true" />
            <span className="font-display text-lg uppercase">{item.name}</span>
          </div>
        )}
      </div>

      <div className="p-6 flex-1 flex flex-col justify-between gap-5">
        <div className="space-y-2.5">
          <div className="text-xs font-medium text-neutral-600">
            {item.cityInspiration && (
              <>
                <span className="text-[#C8281E] font-semibold">{item.cityInspiration}</span>
                <span aria-hidden="true" className="mx-1.5 text-neutral-400">·</span>
              </>
            )}
            <span>{item.breadOrVessel}</span>
          </div>

          <div className="flex items-baseline justify-between gap-3">
            <h3 className="font-display text-2xl font-bold uppercase tracking-tight text-[#141413]">
              {item.name}
            </h3>
            {item.verifiedPrice && (
              <span className="font-mono text-base font-semibold text-[#141413] whitespace-nowrap shrink-0">
                {item.verifiedPrice}
              </span>
            )}
          </div>

          <p className="text-sm text-neutral-700 leading-relaxed">{item.description}</p>
        </div>

        <div className="pt-4 border-t border-[#E4E0D5] flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs text-neutral-600">
            {item.priceSourceNote || 'Uber Eats & Deliveroo'}
          </span>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={item.orderUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider bg-[#141413] hover:bg-[#C8281E] text-white rounded-md transition-colors whitespace-nowrap"
            >
              <span>Uber Eats</span>
              <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
            </a>

            {item.deliverooUrl && (
              <a
                href={item.deliverooUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider bg-[#00CCBC] hover:bg-[#00B3A5] text-[#141413] rounded-md transition-colors whitespace-nowrap"
              >
                <span>Deliveroo</span>
                <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
              </a>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

export function SignatureMenuSection({ cms }: SignatureMenuSectionProps) {
  const publicCategories = getPublicMenuCategories(cms);
  const [selectedFilter, setSelectedFilter] = useState<'all' | MenuCategoryId>('all');

  const visibleCategories: MenuCategory[] =
    selectedFilter === 'all'
      ? publicCategories
      : publicCategories.filter((cat) => cat.id === selectedFilter);

  const primaryCategories = visibleCategories.filter((c) => c.priority !== 'secondary');
  const secondaryCategories = visibleCategories.filter((c) => c.priority === 'secondary');

  return (
    <section id="sandwiches" className="py-16 lg:py-24 bg-[#FAFAF7] text-[#141413]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Heading & Filter Tabs */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-[#E4E0D5] pb-8">
          <div className="space-y-2 max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#C8281E]">
              145–147 Edgware Road · Paddington Menu
            </p>
            <h2 className="font-display text-4xl sm:text-5xl font-extrabold uppercase tracking-tight text-[#141413] text-balance">
              Oversized Sandwiches &amp; Msemen Wraps
            </h2>
            <p className="text-base text-neutral-700 leading-relaxed">
              Casa Street’s real Paddington street-food lineup with verified Uber Eats &amp;
              Deliveroo pricing and official kitchen photography.
            </p>
          </div>

          <div
            role="tablist"
            aria-label="Filter menu categories"
            className="flex flex-wrap items-center gap-1.5 p-1 bg-[#F1EFEA] border border-[#E4E0D5] rounded-lg shrink-0"
          >
            <button
              type="button"
              role="tab"
              aria-selected={selectedFilter === 'all'}
              onClick={() => setSelectedFilter('all')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                selectedFilter === 'all'
                  ? 'bg-[#141413] text-white'
                  : 'text-neutral-700 hover:text-[#141413]'
              }`}
            >
              All Published
            </button>
            {publicCategories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                role="tab"
                aria-selected={selectedFilter === cat.id}
                onClick={() => setSelectedFilter(cat.id)}
                className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  selectedFilter === cat.id
                    ? 'bg-[#141413] text-white'
                    : 'text-neutral-700 hover:text-[#141413]'
                }`}
              >
                {cat.id === 'signature-sandwiches'
                  ? 'Sandwiches'
                  : cat.id === 'msemen-wraps'
                    ? 'Msemen & Wraps'
                    : cat.id === 'tagines'
                      ? 'Tagines & Tea'
                      : cat.title}
              </button>
            ))}
          </div>
        </div>

        {/* Primary Street-Food Categories */}
        {primaryCategories.map((category) => (
          <div
            key={category.id}
            id={category.id === 'msemen-wraps' ? 'msemen' : category.id}
            className="space-y-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
              <div>
                <p className="text-xs font-medium text-neutral-600">{category.kicker}</p>
                <h3 className="font-display text-3xl font-bold uppercase tracking-tight text-[#141413] mt-0.5">
                  {category.title}
                </h3>
              </div>
              <p className="text-sm text-neutral-600 max-w-md">{category.description}</p>
            </div>

            <div
              className={`grid gap-6 ${
                category.items.length >= 3
                  ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                  : 'grid-cols-1 md:grid-cols-2'
              }`}
            >
              {category.items.map((item) => (
                <MenuCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        ))}

        {/* Secondary Traditional Tagines & Drinks */}
        {secondaryCategories.map((category) => (
          <div
            key={category.id}
            id={category.id}
            className="pt-8 border-t border-[#E4E0D5] space-y-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
              <div>
                <p className="text-xs font-medium text-neutral-500">{category.kicker}</p>
                <h3 className="font-display text-2xl font-bold uppercase tracking-tight text-neutral-800 mt-0.5">
                  {category.title}
                </h3>
              </div>
              <p className="text-sm text-neutral-600 max-w-md">{category.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {category.items.map((item) => (
                <MenuCard key={item.id} item={item} isSecondary />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
