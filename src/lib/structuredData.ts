import {
  type CmsState,
  getPublicMenuCategories,
  getPublicSocialLinks,
} from './cms';

function extractNumericPrice(verifiedPrice?: string): string | undefined {
  if (!verifiedPrice) return undefined;
  const singleMatch = verifiedPrice.match(/^£?(\d+(?:\.\d{1,2})?)$/);
  return singleMatch ? singleMatch[1] : undefined;
}

export function buildRestaurantJsonLd(state: CmsState) {
  const publicCategories = getPublicMenuCategories(state);
  const verifiedSocialUrls = getPublicSocialLinks(state)
    .filter((link) => ['instagram', 'tiktok', 'facebook'].includes(link.platform))
    .map((link) => link.url);

  return {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: state.brand.name,
    description:
      'Bold Moroccan street food at 145-147 Edgware Road, Paddington, London featuring oversized Casablanca, Tangier, Marrakesh, Rabat, and Fes sandwiches, Signature Firma Wraps, flaky msemen, and secondary tagines.',
    servesCuisine: ['Moroccan', 'Street Food', 'Halal'],
    address: {
      '@type': 'PostalAddress',
      streetAddress: state.location.streetAddress,
      addressLocality: state.location.city,
      postalCode: state.location.postalCode,
      addressCountry: 'GB',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: state.location.latitude,
      longitude: state.location.longitude,
    },
    hasMap: state.location.mapsUrl,
    sameAs: verifiedSocialUrls,
    potentialAction: [
      {
        '@type': 'OrderAction',
        name: 'Order on Uber Eats',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: state.location.uberEatsUrl,
        },
      },
      {
        '@type': 'OrderAction',
        name: 'Order on Deliveroo',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: state.location.deliverooUrl,
        },
      },
    ],
    hasMenu: {
      '@type': 'Menu',
      name: `${state.brand.name} Street Menu`,
      hasMenuSection: publicCategories.map((category) => ({
        '@type': 'MenuSection',
        name: category.title,
        description: category.description,
        hasMenuItem: category.items.map((item) => {
          const numericPrice = extractNumericPrice(item.verifiedPrice);
          return {
            '@type': 'MenuItem',
            name: item.name,
            description: item.description,
            ...(numericPrice
              ? {
                  offers: {
                    '@type': 'Offer',
                    price: numericPrice,
                    priceCurrency: 'GBP',
                  },
                }
              : {}),
          };
        }),
      })),
    },
  };
}
