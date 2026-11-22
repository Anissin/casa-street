import {
  type CmsState,
  getHalalDisplay,
  getPublicMenuCategories,
  getPublicSocialLinks,
  isItemHalal,
} from './cms';

function extractNumericPrice(verifiedPrice?: string): string | undefined {
  if (!verifiedPrice) return undefined;
  const singleMatch = verifiedPrice.match(/^£?(\d+(?:\.\d{1,2})?)$/);
  return singleMatch ? singleMatch[1] : undefined;
}

/**
 * Schema.org Restaurant JSON-LD built only from verified, published CMS data.
 * `siteUrl` (e.g. window.location.origin) makes image/logo/url absolute.
 */
export function buildRestaurantJsonLd(state: CmsState, siteUrl = '') {
  const publicCategories = getPublicMenuCategories(state);
  const halal = getHalalDisplay(state);
  const verifiedSocialUrls = getPublicSocialLinks(state)
    .filter((link) => ['instagram', 'tiktok', 'facebook'].includes(link.platform))
    .map((link) => link.url);
  const origin = siteUrl.replace(/\/+$/, '');

  const description = `${
    halal.show ? '100% halal Moroccan street food' : 'Moroccan street food'
  } at 145-147 Edgware Road, Paddington, London: oversized Casablanca, Tangier, Marrakesh, Rabat and Fes sandwiches, Signature Firma Wraps, flaky msemen and chicken tajine.`;

  return {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: state.brand.name,
    description,
    ...(origin
      ? {
          url: `${origin}/`,
          image: `${origin}/images/og-casa-street.jpg`,
          logo: `${origin}/images/icon-512.png`,
        }
      : {}),
    servesCuisine: halal.show ? ['Moroccan', 'Street Food', 'Halal'] : ['Moroccan', 'Street Food'],
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
    containedInPlace: {
      '@type': 'Place',
      name: 'The Food District',
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
            ...(isItemHalal(state, item)
              ? { suitableForDiet: 'https://schema.org/HalalDiet' }
              : {}),
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
