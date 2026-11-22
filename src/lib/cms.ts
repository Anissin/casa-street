import {
  findTextProblem,
  hostMatches,
  isAllowedOrderUrl,
  isSafeHttpsUrl,
  isValidPrice,
} from './contentSafety.ts';

export { findTextProblem, hostMatches, isAllowedOrderUrl, isSafeHttpsUrl, isValidPrice };

export const VERIFIED_INSTAGRAM_URL = 'https://www.instagram.com/casastreetldn/';
export const VERIFIED_GOOGLE_MAPS_URL =
  'https://www.google.com/maps/search/?api=1&query=51.5175157%2C-0.1672527&query_place_id=ChIJB92CagAbdkgR-Uo59s_L3G0';
export const VERIFIED_UBEREATS_URL =
  'https://www.ubereats.com/gb/store/casa-street/tuQa5hFpRaWpH0Ih5ZyeKA';
// Tracking parameters (srsltid) removed from the original Deliveroo link.
export const VERIFIED_DELIVEROO_URL =
  'https://deliveroo.co.uk/menu/london/paddington/casa-street';
export const CASA_LOGO_URL = '/images/logo-192.webp';

/** Bump when the persisted CMS shape or default content changes meaningfully. */
export const CMS_SCHEMA_VERSION = 4;

export const CASA_COORDS = {
  latitude: 51.5175157,
  longitude: -0.1672527,
  placeId: 'ChIJB92CagAbdkgR-Uo59s_L3G0',
} as const;

export type SocialPlatform =
  | 'instagram'
  | 'tiktok'
  | 'facebook'
  | 'whatsapp'
  | 'ubereats'
  | 'deliveroo'
  | 'google_maps';

export type LinkPlacement = 'nav' | 'hero' | 'follow' | 'footer' | 'sticky';

export interface SocialLink {
  id: string;
  platform: SocialPlatform;
  label: string;
  handleOrNumber: string;
  url: string;
  verified: boolean;
  enabled: boolean;
  lockedVerified?: boolean;
  placement: LinkPlacement[];
}

export type MenuCategoryId =
  | 'signature-sandwiches'
  | 'msemen-wraps'
  | 'tagines'
  | 'french-tacos';

export interface MenuItem {
  id: string;
  name: string;
  cityInspiration?: string;
  breadOrVessel: string;
  description: string;
  /** Empty string renders a designed typographic tile instead of a photo. */
  image: string;
  imageSrcSet?: string;
  imageAlt: string;
  /** True when the photo is a styled/illustrative image rather than the actual dish. */
  imageIsIllustrative?: boolean;
  photoSource: 'official-casa-street' | 'editorial-kitchen' | 'pending-owner-photo';
  ownerPhotoVerified: boolean;
  orderUrl: string;
  deliverooUrl?: string;
  verifiedPrice?: string;
  priceSourceNote?: string;
  /** Owner-confirmed halal dish. Only shown publicly while halal.ownerConfirmed is true. */
  halal?: boolean;
  /** Temporarily hidden from the public menu (e.g. sold out). */
  hidden?: boolean;
}

export interface MenuCategory {
  id: MenuCategoryId;
  title: string;
  kicker: string;
  description: string;
  priority: 'primary' | 'secondary' | 'conditional';
  published: boolean;
  ownerConfirmationRequired: boolean;
  ownerConfirmed: boolean;
  warningNote?: string;
  items: MenuItem[];
}

export interface SocialPost {
  id: string;
  platform: 'instagram' | 'tiktok';
  title: string;
  caption: string;
  mediaUrl: string;
  mediaAlt: string;
  mediaType: 'image' | 'video';
  videoEmbedUrl?: string;
  postUrl: string;
  approved: boolean;
  ownerSupplied: boolean;
  verifiedByAi: boolean;
  aspectLabel: string;
}

export interface ApprovalLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  target: string;
}

/**
 * Halal messaging is controlled by the owner. Nothing halal-related is shown
 * publicly unless `ownerConfirmed` is true. Certification wording ("Certified
 * halal") needs `certified`; the certifying body name and certificate link are
 * optional and shown only when the owner enters them.
 */
export interface HalalSettings {
  ownerConfirmed: boolean;
  certified: boolean;
  certificationBody: string;
  certificateUrl: string;
  confirmedAt?: string;
}

export interface CmsState {
  schemaVersion?: number;
  brand: {
    name: string;
    logoUrl: string;
    tagline: string;
    districtNote: string;
    heroImage: string;
    heroImageSrcSet?: string;
    heroImageAlt: string;
  };
  location: {
    streetAddress: string;
    postalCode: string;
    city: string;
    district: string;
    mapsUrl: string;
    uberEatsUrl: string;
    deliverooUrl: string;
    latitude: number;
    longitude: number;
    placeId: string;
  };
  halal: HalalSettings;
  socialLinks: SocialLink[];
  menuCategories: MenuCategory[];
  socialPosts: SocialPost[];
  approvalLog: ApprovalLogEntry[];
}

export interface PhotoAnalysisResult {
  detectedDish?: string;
  belongsToCasaStreet?: boolean;
  recommendedCategory?: string;
  qualityVerdict?: string;
  suggestedCaption?: string;
  vendorSeparationNote?: string;
}

function menuPhoto(slug: string): { image: string; imageSrcSet: string } {
  return {
    image: `/images/menu/${slug}-960.webp`,
    imageSrcSet: `/images/menu/${slug}-480.webp 480w, /images/menu/${slug}-960.webp 960w`,
  };
}

export function createInitialCmsState(): CmsState {
  return {
    schemaVersion: CMS_SCHEMA_VERSION,
    brand: {
      name: 'Casa Street',
      logoUrl: CASA_LOGO_URL,
      tagline: 'Casablanca to Paddington. Built Oversized.',
      districtNote: '145–147 Edgware Road, Paddington · Inside The Food District',
      heroImage: '/images/hero-sandwiches-749.webp',
      heroImageSrcSet:
        '/images/hero-sandwiches-480.webp 480w, /images/hero-sandwiches-749.webp 749w',
      heroImageAlt:
        'Casa Street oversized Moroccan baguette sandwiches stuffed with spiced kofta, merguez, olives, harissa, tuna, egg, and fresh salad',
    },
    location: {
      streetAddress: '145–147 Edgware Road',
      postalCode: 'W2 2HR',
      city: 'London',
      district: 'The Food District, Paddington',
      mapsUrl: VERIFIED_GOOGLE_MAPS_URL,
      uberEatsUrl: VERIFIED_UBEREATS_URL,
      deliverooUrl: VERIFIED_DELIVEROO_URL,
      latitude: CASA_COORDS.latitude,
      longitude: CASA_COORDS.longitude,
      placeId: CASA_COORDS.placeId,
    },
    // Owner confirmed (Nov 2026): the meat and chicken are 100% halal.
    // Owner prefers "100% Halal" wording, so no certification wording is shown.
    halal: {
      ownerConfirmed: true,
      certified: false,
      certificationBody: '',
      certificateUrl: '',
      confirmedAt: '2026-11-22T13:00:00Z',
    },
    socialLinks: [
      {
        id: 'instagram',
        platform: 'instagram',
        label: 'Instagram',
        handleOrNumber: '@casastreetldn',
        url: VERIFIED_INSTAGRAM_URL,
        verified: true,
        enabled: true,
        lockedVerified: true,
        placement: ['nav', 'hero', 'follow', 'footer'],
      },
      {
        id: 'ubereats',
        platform: 'ubereats',
        label: 'Uber Eats',
        handleOrNumber: 'Uber Eats UK',
        url: VERIFIED_UBEREATS_URL,
        verified: true,
        enabled: true,
        lockedVerified: true,
        placement: ['nav', 'hero', 'footer', 'sticky'],
      },
      {
        id: 'deliveroo',
        platform: 'deliveroo',
        label: 'Deliveroo',
        handleOrNumber: 'Deliveroo Paddington',
        url: VERIFIED_DELIVEROO_URL,
        verified: true,
        enabled: true,
        lockedVerified: true,
        placement: ['hero', 'footer'],
      },
      {
        id: 'google_maps',
        platform: 'google_maps',
        label: 'Find Us',
        handleOrNumber: '145–147 Edgware Road, W2 2HR',
        url: VERIFIED_GOOGLE_MAPS_URL,
        verified: true,
        enabled: true,
        lockedVerified: true,
        placement: ['hero', 'footer', 'sticky'],
      },
      {
        id: 'tiktok',
        platform: 'tiktok',
        label: 'TikTok',
        handleOrNumber: '',
        url: '',
        verified: false,
        enabled: false,
        placement: ['follow', 'footer'],
      },
      {
        id: 'facebook',
        platform: 'facebook',
        label: 'Facebook',
        handleOrNumber: '',
        url: '',
        verified: false,
        enabled: false,
        placement: ['follow', 'footer'],
      },
      {
        id: 'whatsapp',
        platform: 'whatsapp',
        label: 'WhatsApp',
        handleOrNumber: '',
        url: '',
        verified: false,
        enabled: false,
        placement: ['follow', 'footer'],
      },
    ],
    menuCategories: [
      {
        id: 'signature-sandwiches',
        title: 'Signature Moroccan Sandwiches',
        kicker: 'Oversized Moroccan Baguettes',
        description:
          'Casa Street’s headline loaded sandwiches named after Moroccan cities—packed with spiced meats, chips inside, Moroccan salad, olives, and house sauces.',
        priority: 'primary',
        published: true,
        ownerConfirmationRequired: false,
        ownerConfirmed: true,
        items: [
          {
            id: 'casablanca-sandwich',
            name: 'Casablanca',
            cityInspiration: 'Casablanca',
            breadOrVessel: 'Oversized Moroccan Baguette',
            description:
              'Marinated chicken thighs, spiced mince, olives, chips, Moroccan salad, harissa, mayo, and sauce Algérienne.',
            ...menuPhoto('casablanca'),
            imageAlt: 'Casa Street oversized Moroccan baguette sandwiches, cut open to show the fillings',
            photoSource: 'official-casa-street',
            ownerPhotoVerified: true,
            orderUrl: VERIFIED_UBEREATS_URL,
            deliverooUrl: VERIFIED_DELIVEROO_URL,
            verifiedPrice: '£11.70',
            priceSourceNote: 'Uber Eats / Deliveroo Paddington',
            halal: true,
          },
          {
            id: 'tangier-sandwich',
            name: 'Tangier',
            cityInspiration: 'Tangier',
            breadOrVessel: 'Oversized Moroccan Baguette',
            description:
              'Beef sausage, chicken breast, chips, iceberg salad, tomatoes, grilled onions, sauce Tunisienne, and mayo.',
            ...menuPhoto('tangier'),
            imageAlt: 'Illustrative image of a loaded Moroccan baguette sandwich',
            imageIsIllustrative: true,
            photoSource: 'editorial-kitchen',
            ownerPhotoVerified: true,
            orderUrl: VERIFIED_UBEREATS_URL,
            deliverooUrl: VERIFIED_DELIVEROO_URL,
            verifiedPrice: '£11.70',
            priceSourceNote: 'Uber Eats / Deliveroo Paddington',
            halal: true,
          },
          {
            id: 'marrakesh-sandwich',
            name: 'Marrakesh',
            cityInspiration: 'Marrakesh',
            breadOrVessel: 'Oversized Moroccan Baguette',
            description:
              'Marinated mince, olives, Moroccan salad, grilled onions, chips, Algérienne sauce, and samurai sauce.',
            ...menuPhoto('marrakesh'),
            imageAlt: 'Illustrative image of a Moroccan sandwich wrapped in kraft paper',
            imageIsIllustrative: true,
            photoSource: 'editorial-kitchen',
            ownerPhotoVerified: true,
            orderUrl: VERIFIED_UBEREATS_URL,
            deliverooUrl: VERIFIED_DELIVEROO_URL,
            verifiedPrice: '£12.75',
            priceSourceNote: 'Uber Eats',
            halal: true,
          },
          {
            id: 'rabat-sandwich',
            name: 'Rabat',
            cityInspiration: 'Rabat',
            breadOrVessel: 'Oversized Moroccan Baguette',
            description:
              'Marinated lamb cubes, Moroccan salad, chips, grilled onions, harissa, and sauce marocaine.',
            ...menuPhoto('rabat'),
            imageAlt: 'Illustrative image of a lamb Moroccan baguette sandwich',
            imageIsIllustrative: true,
            photoSource: 'editorial-kitchen',
            ownerPhotoVerified: true,
            orderUrl: VERIFIED_UBEREATS_URL,
            deliverooUrl: VERIFIED_DELIVEROO_URL,
            verifiedPrice: '£12.75',
            priceSourceNote: 'Uber Eats',
            halal: true,
          },
          {
            id: 'fes-sandwich',
            name: 'Fes',
            cityInspiration: 'Fes',
            breadOrVessel: 'Oversized Moroccan Baguette',
            description:
              'Chicken thighs, lamb liver, Moroccan salad, olives, chips, samurai sauce, and mayo.',
            // Previously reused the Casablanca photo; shown as a designed tile until
            // the owner supplies a real Fes photo.
            image: '',
            imageAlt: '',
            photoSource: 'pending-owner-photo',
            ownerPhotoVerified: false,
            orderUrl: VERIFIED_UBEREATS_URL,
            deliverooUrl: VERIFIED_DELIVEROO_URL,
            verifiedPrice: '£11.70',
            priceSourceNote: 'Uber Eats',
            halal: true,
          },
        ],
      },
      {
        id: 'msemen-wraps',
        title: 'Msemen, Firma Wraps & Sweet Pancakes',
        kicker: 'Layered Msemen & Street Wraps',
        description:
          'Flaky laminated Moroccan msemen flatbread reimagined into savoury wraps, paratha-style twists, and sweet Nutella, pistachio, or amlou fillings.',
        priority: 'primary',
        published: true,
        ownerConfirmationRequired: false,
        ownerConfirmed: true,
        items: [
          {
            id: 'signature-firma-wrap',
            name: 'Signature Firma Wrap',
            cityInspiration: 'Casa Street Signature',
            breadOrVessel: 'Pressed Street Wrap',
            description:
              'Marinated mince, Moroccan salad, onions, chips, mayo, and sauce Tunisienne rolled hot.',
            ...menuPhoto('firma-wrap'),
            imageAlt: 'Illustrative image of a sliced wrap with spiced fillings',
            imageIsIllustrative: true,
            photoSource: 'editorial-kitchen',
            ownerPhotoVerified: true,
            orderUrl: VERIFIED_UBEREATS_URL,
            deliverooUrl: VERIFIED_DELIVEROO_URL,
            verifiedPrice: '£11.00',
            priceSourceNote: 'Uber Eats',
            halal: true,
          },
          {
            id: 'sweet-msemen',
            name: 'Msemen (Nutella, Pistachio, or Amlou)',
            cityInspiration: 'Moroccan Griddle Classic',
            breadOrVessel: 'Flaky Layered Msemen',
            description:
              'Golden pan-griddled Moroccan layered flatbread served with Nutella, pistachio, or traditional Moroccan amlou (also featuring signature Dubai chocolate-filled Msemen at The Food District).',
            // Previously reused the savoury wrap image; tile until a real photo is supplied.
            image: '',
            imageAlt: '',
            photoSource: 'pending-owner-photo',
            ownerPhotoVerified: false,
            orderUrl: VERIFIED_UBEREATS_URL,
            deliverooUrl: VERIFIED_DELIVEROO_URL,
            verifiedPrice: '£7.50',
            priceSourceNote: 'Uber Eats / Deliveroo Paddington',
          },
        ],
      },
      {
        id: 'tagines',
        title: 'Tagines, Moroccan Mint Tea & Drinks',
        kicker: 'Slow-Cooked Classics & Refreshments',
        description:
          'Traditional Moroccan chicken tagine alongside authentic fresh mint tea, Royal Avocado Juice, and Maghrebi sodas (Poms, Slim Citron, Hammoud, Hawai).',
        priority: 'secondary',
        published: true,
        ownerConfirmationRequired: false,
        ownerConfirmed: true,
        items: [
          {
            id: 'chicken-tajine',
            name: 'Chicken Tajine',
            cityInspiration: 'Homestyle Tagine',
            breadOrVessel: 'Traditional Earthenware Tagine',
            description:
              'Slow-cooked Moroccan chicken tagine simmered with classic herbs, preserved lemon notes, and saffron aromatics.',
            ...menuPhoto('chicken-tajine'),
            imageAlt: 'Illustrative image of a Moroccan chicken tagine in a clay pot',
            imageIsIllustrative: true,
            photoSource: 'editorial-kitchen',
            ownerPhotoVerified: true,
            orderUrl: VERIFIED_UBEREATS_URL,
            deliverooUrl: VERIFIED_DELIVEROO_URL,
            verifiedPrice: '£16.75',
            priceSourceNote: 'Uber Eats',
            halal: true,
          },
          {
            id: 'moroccan-mint-tea',
            name: 'Moroccan Mint Tea & Cold Drinks',
            cityInspiration: 'Maghrebi Refreshments',
            breadOrVessel: 'Fresh Mint Tea · Juices & Sodas',
            description:
              'Traditional hot tea infused with fresh mint leaves (£4.00 Uber Eats / £2.50 Deliveroo), plus Royal Avocado Juice (£5.50–£6.50), Poms, Slim Citron, Hammoud, and Hawai.',
            // The previous photo carries a third-party watermark ("Arabesque Kitchen"),
            // so it is no longer shown publicly. Tile until the owner supplies a photo.
            image: '',
            imageAlt: '',
            photoSource: 'pending-owner-photo',
            ownerPhotoVerified: false,
            orderUrl: VERIFIED_UBEREATS_URL,
            deliverooUrl: VERIFIED_DELIVEROO_URL,
            verifiedPrice: '£2.00 – £6.50',
            priceSourceNote: 'Deliveroo & Uber Eats',
          },
        ],
      },
      {
        id: 'french-tacos',
        title: 'French Tacos',
        kicker: 'Unpublished Draft · Owner Confirmation Required',
        description:
          'Pressed rectangular street-grill wraps packed with seasoned fillings, fries inside, and creamy sauce. Kept hidden from public diners until Casa Street confirms kitchen availability.',
        priority: 'conditional',
        published: false,
        ownerConfirmationRequired: true,
        ownerConfirmed: false,
        warningNote:
          'Do not confuse Casa Street with The Taco House (a separate vendor at The Food District). Publish only after Casa Street owner confirms French Tacos are sold.',
        items: [
          {
            id: 'casa-french-tacos-draft',
            name: 'Moroccan-Style French Tacos (Draft)',
            cityInspiration: 'Casablanca-Lyon Street Grill',
            breadOrVessel: 'Pressed Tortilla Gratinée',
            description:
              'Awaiting owner menu confirmation and live Deliveroo / Uber Eats listing alignment before public release.',
            image: '/images/menu/french-tacos-draft-480.webp',
            imageAlt: 'Illustrative image of a toasted rectangular French tacos wrap',
            imageIsIllustrative: true,
            photoSource: 'editorial-kitchen',
            ownerPhotoVerified: false,
            orderUrl: VERIFIED_UBEREATS_URL,
            deliverooUrl: VERIFIED_DELIVEROO_URL,
          },
        ],
      },
    ],
    socialPosts: [
      {
        id: 'post-casablanca-real',
        platform: 'instagram',
        title: 'Real Food District Baguettes',
        caption:
          'Authentic Casa Street baguettes from 145–147 Edgware Road: kofta, merguez, olives, tomato, harissa, and Moroccan salad.',
        mediaUrl: '/images/menu/casablanca-960.webp',
        mediaAlt: 'Casa Street Moroccan baguette sandwiches from The Food District',
        mediaType: 'image',
        postUrl: VERIFIED_INSTAGRAM_URL,
        approved: true,
        ownerSupplied: true,
        verifiedByAi: true,
        aspectLabel: 'Casa Street · Edgware Road',
      },
      {
        id: 'post-mint-tea-real',
        platform: 'instagram',
        title: 'Traditional Moroccan Mint Tea',
        caption:
          'Freshly brewed Moroccan mint tea served in ornate glasses straight from our Paddington counter.',
        mediaUrl: '/assets/casa-street/casa_gallery_2.jpg',
        mediaAlt: 'Moroccan mint tea glasses and silver teapot',
        mediaType: 'image',
        postUrl: VERIFIED_INSTAGRAM_URL,
        // Held: the photo carries a third-party watermark ("Arabesque Kitchen").
        approved: false,
        ownerSupplied: true,
        verifiedByAi: false,
        aspectLabel: 'Held · Third-party watermark — replace photo',
      },
      {
        id: 'post-msemen-fold',
        platform: 'instagram',
        title: 'Flaky Msemen & Firma Wraps',
        caption:
          'Golden laminated Moroccan msemen griddled fresh and paired with spiced street fillings or sweet Nutella, pistachio, and amlou.',
        mediaUrl: '/images/menu/firma-wrap-960.webp',
        mediaAlt: 'Illustrative image of a golden msemen wrap sliced diagonally',
        mediaType: 'image',
        videoEmbedUrl: '',
        postUrl: VERIFIED_INSTAGRAM_URL,
        approved: true,
        ownerSupplied: true,
        verifiedByAi: true,
        aspectLabel: 'Illustrative image · Msemen & Wraps',
      },
      {
        id: 'post-draft-tacos',
        platform: 'instagram',
        title: 'French Tacos Test Kitchen (Draft)',
        caption: 'Unpublished test shot awaiting Casa Street owner confirmation before going live.',
        mediaUrl: '/images/menu/french-tacos-draft-480.webp',
        mediaAlt: 'Draft French tacos test kitchen preview',
        mediaType: 'image',
        postUrl: VERIFIED_INSTAGRAM_URL,
        approved: false,
        ownerSupplied: true,
        verifiedByAi: false,
        aspectLabel: 'Draft · Awaiting Approval',
      },
    ],
    approvalLog: [
      {
        id: 'log-4',
        timestamp: '2026-11-22T13:05:00Z',
        actor: 'Site Audit',
        action: 'Held third-party watermarked photo from public display',
        target: 'Moroccan mint tea photo (watermark: "Arabesque Kitchen") — please supply your own photo',
      },
      {
        id: 'log-3',
        timestamp: '2026-11-22T13:00:00Z',
        actor: 'Casa Street Owner',
        action: 'Confirmed 100% halal meat & chicken',
        target: '100% Halal badge, menu tags, About & footer copy',
      },
      {
        id: 'log-2',
        timestamp: '2026-11-22T09:05:00Z',
        actor: 'Compliance Gate',
        action: 'Held category as unpublished draft',
        target: 'French Tacos (pending owner confirmation; separate from The Taco House)',
      },
      {
        id: 'log-1',
        timestamp: '2026-11-22T09:00:00Z',
        actor: 'Casa Street CMS',
        action: 'Verified primary links & logo',
        target: 'Official Logo, Instagram (@casastreetldn), Google Maps, Uber Eats, Deliveroo Paddington',
      },
    ],
  };
}

/* -------------------------------------------------------------------------- */
/*  Validation helpers                                                         */
/* -------------------------------------------------------------------------- */

export interface ValidationResult {
  valid: boolean;
  normalizedUrl: string;
  displayHandle: string;
  error?: string;
}

const MAX_DATA_URL_LENGTH = 1_600_000; // ≈1.2 MB of image data
const SAME_ORIGIN_PATH = /^\/(?!\/)[\w\-./%]+$/;
const DATA_IMAGE_URL = /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/]+={0,2}$/;

/** Allows same-origin paths and small base64 JPEG/PNG/WebP data URLs only. */
export function isSafeImageSource(src: string): boolean {
  if (SAME_ORIGIN_PATH.test(src)) return !src.includes('..');
  return src.length <= MAX_DATA_URL_LENGTH && DATA_IMAGE_URL.test(src);
}

export function validateSocialInput(
  platform: SocialPlatform,
  rawInput: string
): ValidationResult {
  const trimmed = rawInput.trim();
  if (!trimmed) {
    return {
      valid: false,
      normalizedUrl: '',
      displayHandle: '',
      error: 'Enter an official profile URL or phone number before verifying.',
    };
  }

  if (platform === 'whatsapp') {
    const cleaned = trimmed.replace(/[\s()-]/g, '');
    const waLinkMatch = cleaned.match(/^https:\/\/wa\.me\/(\d{8,15})$/i);
    if (waLinkMatch) {
      return {
        valid: true,
        normalizedUrl: `https://wa.me/${waLinkMatch[1]}`,
        displayHandle: `+${waLinkMatch[1]}`,
      };
    }
    const phoneDigits = cleaned.replace(/^\+/, '');
    if (/^\d{8,15}$/.test(phoneDigits)) {
      return {
        valid: true,
        normalizedUrl: `https://wa.me/${phoneDigits}`,
        displayHandle: `+${phoneDigits}`,
      };
    }
    return {
      valid: false,
      normalizedUrl: '',
      displayHandle: '',
      error: 'Enter a valid WhatsApp phone number (with country code) or https://wa.me/... link.',
    };
  }

  let parsed: URL;
  try {
    parsed = new URL(/^[a-z][a-z0-9+.-]*:/i.test(trimmed) ? trimmed : `https://${trimmed}`);
  } catch {
    return {
      valid: false,
      normalizedUrl: '',
      displayHandle: '',
      error: 'Enter a valid HTTPS URL (for example https://www.tiktok.com/@casastreetldn).',
    };
  }

  if (parsed.protocol !== 'https:' || parsed.username || parsed.password) {
    return {
      valid: false,
      normalizedUrl: '',
      displayHandle: '',
      error: 'Official social profile URLs must use HTTPS.',
    };
  }

  const host = parsed.hostname.toLowerCase();
  if (platform === 'tiktok' && !hostMatches(host, 'tiktok.com')) {
    return {
      valid: false,
      normalizedUrl: '',
      displayHandle: '',
      error: 'TikTok URL must be on tiktok.com.',
    };
  }
  if (platform === 'facebook' && !hostMatches(host, 'facebook.com') && !hostMatches(host, 'fb.com')) {
    return {
      valid: false,
      normalizedUrl: '',
      displayHandle: '',
      error: 'Facebook URL must be on facebook.com or fb.com.',
    };
  }
  if (platform === 'instagram' && !hostMatches(host, 'instagram.com')) {
    return {
      valid: false,
      normalizedUrl: '',
      displayHandle: '',
      error: 'Instagram URL must be on instagram.com.',
    };
  }

  const pathPart = parsed.pathname.replace(/\/+$/, '');
  const handle = pathPart.split('/').filter(Boolean).pop() || parsed.hostname;
  return {
    valid: true,
    normalizedUrl: parsed.toString(),
    displayHandle: handle,
  };
}

/* -------------------------------------------------------------------------- */
/*  Public selectors                                                           */
/* -------------------------------------------------------------------------- */

export function getPublicSocialLinks(
  state: CmsState,
  placement?: LinkPlacement
): SocialLink[] {
  return state.socialLinks.filter((link) => {
    const isVerifiedActive = link.verified && link.enabled && link.url.trim().length > 0;
    if (!isVerifiedActive) return false;
    if (!placement) return true;
    return link.placement.includes(placement);
  });
}

export function getPublicMenuCategories(state: CmsState): MenuCategory[] {
  const priorityOrder: Record<MenuCategory['priority'], number> = {
    primary: 0,
    conditional: 1,
    secondary: 2,
  };

  return state.menuCategories
    .filter((cat) => {
      if (!cat.published) return false;
      if (cat.ownerConfirmationRequired && !cat.ownerConfirmed) return false;
      return true;
    })
    .map((cat) => ({ ...cat, items: cat.items.filter((item) => !item.hidden) }))
    .filter((cat) => cat.items.length > 0)
    .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
}

export function getApprovedSocialPosts(state: CmsState): SocialPost[] {
  return state.socialPosts.filter((post) => post.approved && post.ownerSupplied);
}

export interface HalalDisplay {
  /** Show halal badge, copy and menu tags. */
  show: boolean;
  /** Show "Certified halal" wording; `certificationBody` is optional. */
  certified: boolean;
  certificationBody: string;
  certificateUrl: string;
}

export function getHalalDisplay(state: CmsState): HalalDisplay {
  const halal = state.halal;
  const show = Boolean(halal?.ownerConfirmed);
  const certified = show && Boolean(halal.certified);
  return {
    show,
    certified,
    certificationBody: certified ? halal.certificationBody.trim() : '',
    certificateUrl:
      certified && isSafeHttpsUrl(halal.certificateUrl) ? halal.certificateUrl : '',
  };
}

export function isItemHalal(state: CmsState, item: MenuItem): boolean {
  return getHalalDisplay(state).show && item.halal === true;
}

/* -------------------------------------------------------------------------- */
/*  Owner actions (pure state transitions)                                     */
/* -------------------------------------------------------------------------- */

function logEntry(actor: string, action: string, target: string): ApprovalLogEntry {
  return {
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    timestamp: new Date().toISOString(),
    actor,
    action,
    target,
  };
}

export function confirmAndPublishCategory(
  state: CmsState,
  categoryId: MenuCategoryId,
  actor = 'Casa Street Owner'
): CmsState {
  const nextCategories = state.menuCategories.map((cat) => {
    if (cat.id !== categoryId) return cat;
    return {
      ...cat,
      ownerConfirmed: true,
      published: true,
      items: cat.items.map((item) => ({ ...item, ownerPhotoVerified: true })),
    };
  });

  const targetCat = nextCategories.find((c) => c.id === categoryId);
  return {
    ...state,
    menuCategories: nextCategories,
    approvalLog: [
      logEntry(actor, 'Confirmed & published menu category', targetCat?.title ?? categoryId),
      ...state.approvalLog,
    ],
  };
}

export function unpublishCategory(
  state: CmsState,
  categoryId: MenuCategoryId,
  actor = 'Casa Street Owner'
): CmsState {
  const nextCategories = state.menuCategories.map((cat) => {
    if (cat.id !== categoryId) return cat;
    return {
      ...cat,
      ownerConfirmed: cat.ownerConfirmationRequired ? false : cat.ownerConfirmed,
      published: false,
    };
  });

  const targetCat = nextCategories.find((c) => c.id === categoryId);
  return {
    ...state,
    menuCategories: nextCategories,
    approvalLog: [
      logEntry(actor, 'Returned category to unpublished draft', targetCat?.title ?? categoryId),
      ...state.approvalLog,
    ],
  };
}

export function verifySocialLink(
  state: CmsState,
  linkId: string,
  rawInput: string,
  actor = 'Casa Street Owner'
): { state: CmsState; result: ValidationResult } {
  const target = state.socialLinks.find((l) => l.id === linkId);
  if (!target) {
    return {
      state,
      result: { valid: false, normalizedUrl: '', displayHandle: '', error: 'Social link not found.' },
    };
  }

  const validation = validateSocialInput(target.platform, rawInput);
  if (!validation.valid) {
    return { state, result: validation };
  }

  const nextLinks = state.socialLinks.map((link) => {
    if (link.id !== linkId) return link;
    return {
      ...link,
      url: validation.normalizedUrl,
      handleOrNumber: validation.displayHandle,
      verified: true,
      enabled: true,
    };
  });

  return {
    state: {
      ...state,
      socialLinks: nextLinks,
      approvalLog: [
        logEntry(actor, 'Verified social channel', `${target.label} (${validation.displayHandle})`),
        ...state.approvalLog,
      ],
    },
    result: validation,
  };
}

export function unverifySocialLink(
  state: CmsState,
  linkId: string,
  actor = 'Casa Street Owner'
): CmsState {
  const target = state.socialLinks.find((l) => l.id === linkId);
  if (!target || target.lockedVerified) return state;

  const nextLinks = state.socialLinks.map((link) => {
    if (link.id !== linkId) return link;
    return {
      ...link,
      verified: false,
      enabled: false,
    };
  });

  return {
    ...state,
    socialLinks: nextLinks,
    approvalLog: [
      logEntry(actor, 'Hid unverified social channel', target.label),
      ...state.approvalLog,
    ],
  };
}

export function toggleSocialPostApproval(
  state: CmsState,
  postId: string,
  approved: boolean,
  actor = 'Casa Street Owner'
): CmsState {
  const nextPosts = state.socialPosts.map((post) =>
    post.id === postId ? { ...post, approved } : post
  );
  const target = nextPosts.find((p) => p.id === postId);

  return {
    ...state,
    socialPosts: nextPosts,
    approvalLog: [
      logEntry(
        actor,
        approved ? 'Approved social feature' : 'Moved social feature to draft',
        target?.title ?? postId
      ),
      ...state.approvalLog,
    ],
  };
}

export function addOwnerSocialPost(
  state: CmsState,
  post: Omit<SocialPost, 'id'>
): CmsState {
  const newPost: SocialPost = {
    ...post,
    id: `post-${Date.now()}`,
  };
  return {
    ...state,
    socialPosts: [newPost, ...state.socialPosts],
    approvalLog: [
      logEntry(
        'Casa Street Owner',
        newPost.approved ? 'Published owner-verified photo' : 'Saved owner photo as draft',
        newPost.title
      ),
      ...state.approvalLog,
    ],
  };
}

export function setHalalConfirmation(
  state: CmsState,
  confirmed: boolean,
  actor = 'Casa Street Owner'
): CmsState {
  return {
    ...state,
    halal: {
      ...state.halal,
      ownerConfirmed: confirmed,
      // Certification can never be shown without the base confirmation.
      certified: confirmed ? state.halal.certified : false,
      confirmedAt: confirmed ? new Date().toISOString() : state.halal.confirmedAt,
    },
    approvalLog: [
      logEntry(
        actor,
        confirmed ? 'Confirmed halal food messaging' : 'Hid halal food messaging',
        'Halal badge, menu tags, About & footer copy'
      ),
      ...state.approvalLog,
    ],
  };
}

export function setHalalCertification(
  state: CmsState,
  input: { certified: boolean; certificationBody: string; certificateUrl: string },
  actor = 'Casa Street Owner'
): { state: CmsState; error?: string } {
  const body = input.certificationBody.trim().slice(0, 80);
  const url = input.certificateUrl.trim();
  if (input.certified) {
    if (!state.halal.ownerConfirmed) {
      return { state, error: 'Confirm halal food messaging first.' };
    }
  }
  if (url && !isSafeHttpsUrl(url)) {
    return { state, error: 'Certificate link must be a valid https:// URL.' };
  }
  return {
    state: {
      ...state,
      halal: {
        ...state.halal,
        certified: input.certified,
        certificationBody: body,
        certificateUrl: url,
      },
      approvalLog: [
        logEntry(
          actor,
          input.certified ? 'Updated halal certification details' : 'Removed halal certification claim',
          input.certified ? body || 'Certified halal (body not named)' : 'Halal certification'
        ),
        ...state.approvalLog,
      ],
    },
  };
}

export function setMenuItemHalal(
  state: CmsState,
  itemId: string,
  halal: boolean,
  actor = 'Casa Street Owner'
): CmsState {
  let itemName = itemId;
  const nextCategories = state.menuCategories.map((cat) => ({
    ...cat,
    items: cat.items.map((item) => {
      if (item.id !== itemId) return item;
      itemName = item.name;
      return { ...item, halal };
    }),
  }));
  return {
    ...state,
    menuCategories: nextCategories,
    approvalLog: [
      logEntry(actor, halal ? 'Tagged dish as halal' : 'Removed halal tag from dish', itemName),
      ...state.approvalLog,
    ],
  };
}

/* -------------------------------------------------------------------------- */
/*  Menu editing (admin): validation shared by the editor and the server       */
/* -------------------------------------------------------------------------- */

export const MAX_ITEMS_PER_CATEGORY = 40;
const ITEM_ID = /^[a-z0-9][a-z0-9-]{1,59}$/;
const SRCSET = /^\/(?!\/)[\w\-./%]+ \d+w(?:, \/(?!\/)[\w\-./%]+ \d+w)*$/;

/** Editable fields of a dish, as entered in the admin editor. */
export interface MenuItemInput {
  id?: string;
  name: string;
  description: string;
  cityInspiration: string;
  breadOrVessel: string;
  verifiedPrice: string;
  priceSourceNote: string;
  image: string;
  imageSrcSet?: string;
  imageAlt: string;
  imageIsIllustrative: boolean;
  halal: boolean;
  hidden: boolean;
  orderUrl: string;
  deliverooUrl: string;
}

export type MenuItemErrors = Partial<Record<keyof MenuItemInput, string>>;

export function menuItemToInput(item: MenuItem): MenuItemInput {
  return {
    id: item.id,
    name: item.name,
    description: item.description,
    cityInspiration: item.cityInspiration ?? '',
    breadOrVessel: item.breadOrVessel,
    verifiedPrice: item.verifiedPrice ?? '',
    priceSourceNote: item.priceSourceNote ?? '',
    image: item.image,
    imageSrcSet: item.imageSrcSet,
    imageAlt: item.imageAlt,
    imageIsIllustrative: Boolean(item.imageIsIllustrative),
    halal: Boolean(item.halal),
    hidden: Boolean(item.hidden),
    orderUrl: item.orderUrl,
    deliverooUrl: item.deliverooUrl ?? '',
  };
}

export function emptyMenuItemInput(): MenuItemInput {
  return {
    name: '',
    description: '',
    cityInspiration: '',
    breadOrVessel: '',
    verifiedPrice: '',
    priceSourceNote: 'Uber Eats',
    image: '',
    imageAlt: '',
    imageIsIllustrative: false,
    halal: true,
    hidden: false,
    orderUrl: VERIFIED_UBEREATS_URL,
    deliverooUrl: VERIFIED_DELIVEROO_URL,
  };
}

function checkText(
  errors: Record<string, string>,
  field: string,
  value: string,
  { label, max, required = false }: { label: string; max: number; required?: boolean }
): string {
  // eslint-disable-next-line no-control-regex
  const clean = value.replace(/[\u0000-\u001F\u007F]/g, ' ').replace(/\s+/g, ' ').trim();
  if (required && !clean) {
    errors[field] = `${label} is required.`;
  } else if (clean.length > max) {
    errors[field] = `${label} must be ${max} characters or fewer.`;
  } else {
    const problem = findTextProblem(clean);
    if (problem) errors[field] = problem;
  }
  return clean;
}

/**
 * Validates and normalises a dish. Returns the MenuItem when valid, otherwise
 * per-field errors. Used by the admin editor and enforced again by the server.
 */
export function validateMenuItemInput(
  input: MenuItemInput,
  existing?: Pick<MenuItem, 'photoSource' | 'ownerPhotoVerified' | 'image'>
): { item: MenuItem | null; errors: MenuItemErrors } {
  const errors: Record<string, string> = {};
  const name = checkText(errors, 'name', input.name, { label: 'Dish name', max: 60, required: true });
  const description = checkText(errors, 'description', input.description, {
    label: 'Description',
    max: 400,
    required: true,
  });
  const cityInspiration = checkText(errors, 'cityInspiration', input.cityInspiration, {
    label: 'Small label',
    max: 40,
  });
  const breadOrVessel = checkText(errors, 'breadOrVessel', input.breadOrVessel, {
    label: 'Bread / style',
    max: 60,
  });
  const priceSourceNote = checkText(errors, 'priceSourceNote', input.priceSourceNote, {
    label: 'Price note',
    max: 60,
  });
  const imageAlt = checkText(errors, 'imageAlt', input.imageAlt, { label: 'Photo description', max: 160 });

  const verifiedPrice = input.verifiedPrice.trim();
  if (verifiedPrice && !isValidPrice(verifiedPrice)) {
    errors.verifiedPrice = 'Use a price like £11.70, or a range like £2.00 – £6.50.';
  }

  const orderUrl = input.orderUrl.trim() || VERIFIED_UBEREATS_URL;
  if (!isAllowedOrderUrl(orderUrl, 'ubereats')) {
    errors.orderUrl = 'Must be an https:// link on ubereats.com.';
  }
  const deliverooUrl = input.deliverooUrl.trim();
  if (deliverooUrl && !isAllowedOrderUrl(deliverooUrl, 'deliveroo')) {
    errors.deliverooUrl = 'Must be an https:// link on deliveroo.co.uk (or leave empty).';
  }

  const image = input.image.trim();
  if (image && !isSafeImageSource(image)) {
    errors.image = 'Upload the photo again (only photos uploaded here are allowed).';
  }
  const imageSrcSet = input.imageSrcSet && SRCSET.test(input.imageSrcSet) ? input.imageSrcSet : undefined;

  const id = input.id && ITEM_ID.test(input.id) ? input.id : '';

  if (Object.keys(errors).length > 0) return { item: null, errors };

  const photoChanged = !existing || existing.image !== image;
  return {
    errors: {},
    item: {
      id: id || `item-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
      name,
      description,
      ...(cityInspiration ? { cityInspiration } : {}),
      breadOrVessel,
      image,
      ...(image && imageSrcSet && !photoChanged ? { imageSrcSet } : {}),
      imageAlt: image ? imageAlt || name : '',
      ...(image && input.imageIsIllustrative ? { imageIsIllustrative: true } : {}),
      photoSource: !image
        ? 'pending-owner-photo'
        : photoChanged
          ? 'official-casa-street'
          : (existing?.photoSource ?? 'official-casa-street'),
      ownerPhotoVerified: image ? (photoChanged ? true : (existing?.ownerPhotoVerified ?? true)) : false,
      orderUrl,
      ...(deliverooUrl ? { deliverooUrl } : {}),
      ...(verifiedPrice ? { verifiedPrice } : {}),
      ...(priceSourceNote ? { priceSourceNote } : {}),
      ...(input.halal ? { halal: true } : {}),
      ...(input.hidden ? { hidden: true } : {}),
    },
  };
}

export interface CategoryTextInput {
  title: string;
  kicker: string;
  description: string;
}

export function validateCategoryText(input: CategoryTextInput): {
  value: CategoryTextInput | null;
  errors: Partial<Record<keyof CategoryTextInput, string>>;
} {
  const errors: Record<string, string> = {};
  const title = checkText(errors, 'title', input.title, { label: 'Section title', max: 60, required: true });
  const kicker = checkText(errors, 'kicker', input.kicker, { label: 'Small label', max: 60 });
  const description = checkText(errors, 'description', input.description, {
    label: 'Section description',
    max: 300,
  });
  return Object.keys(errors).length
    ? { value: null, errors }
    : { value: { title, kicker, description }, errors: {} };
}

function findItem(state: CmsState, itemId: string) {
  for (const cat of state.menuCategories) {
    const item = cat.items.find((i) => i.id === itemId);
    if (item) return { cat, item };
  }
  return null;
}

/** Adds a new dish (or replaces one with the same id) in a category. */
export function upsertMenuItem(
  state: CmsState,
  categoryId: MenuCategoryId,
  item: MenuItem,
  actor = 'Casa Street Owner'
): CmsState {
  const existing = findItem(state, item.id);
  const nextCategories = state.menuCategories.map((cat) => {
    if (cat.id === categoryId) {
      const index = cat.items.findIndex((i) => i.id === item.id);
      const items =
        index >= 0
          ? cat.items.map((i) => (i.id === item.id ? item : i))
          : [...cat.items, item].slice(0, MAX_ITEMS_PER_CATEGORY);
      return { ...cat, items };
    }
    // Moving a dish to another category removes it from the old one.
    return { ...cat, items: cat.items.filter((i) => i.id !== item.id) };
  });
  return {
    ...state,
    menuCategories: nextCategories,
    approvalLog: [logEntry(actor, existing ? 'Edited dish' : 'Added new dish', item.name), ...state.approvalLog],
  };
}

export function deleteMenuItem(state: CmsState, itemId: string, actor = 'Casa Street Owner'): CmsState {
  const found = findItem(state, itemId);
  if (!found) return state;
  return {
    ...state,
    menuCategories: state.menuCategories.map((cat) => ({
      ...cat,
      items: cat.items.filter((i) => i.id !== itemId),
    })),
    approvalLog: [logEntry(actor, 'Deleted dish', found.item.name), ...state.approvalLog],
  };
}

export function moveMenuItem(state: CmsState, itemId: string, direction: -1 | 1): CmsState {
  return {
    ...state,
    menuCategories: state.menuCategories.map((cat) => {
      const index = cat.items.findIndex((i) => i.id === itemId);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= cat.items.length) return cat;
      const items = cat.items.slice();
      [items[index], items[target]] = [items[target], items[index]];
      return { ...cat, items };
    }),
  };
}

export function setMenuItemHidden(
  state: CmsState,
  itemId: string,
  hidden: boolean,
  actor = 'Casa Street Owner'
): CmsState {
  const found = findItem(state, itemId);
  if (!found) return state;
  return {
    ...state,
    menuCategories: state.menuCategories.map((cat) => ({
      ...cat,
      items: cat.items.map((i) => {
        if (i.id !== itemId) return i;
        const { hidden: _omit, ...rest } = i;
        return hidden ? { ...rest, hidden: true } : rest;
      }),
    })),
    approvalLog: [
      logEntry(actor, hidden ? 'Hid dish from menu' : 'Showed dish on menu', found.item.name),
      ...state.approvalLog,
    ],
  };
}

export function updateCategoryText(
  state: CmsState,
  categoryId: MenuCategoryId,
  text: CategoryTextInput,
  actor = 'Casa Street Owner'
): CmsState {
  return {
    ...state,
    menuCategories: state.menuCategories.map((cat) => (cat.id === categoryId ? { ...cat, ...text } : cat)),
    approvalLog: [logEntry(actor, 'Edited menu section', text.title), ...state.approvalLog],
  };
}

function rawToMenuItemInput(raw: Record<string, unknown>): MenuItemInput {
  return {
    id: str(raw.id),
    name: str(raw.name),
    description: str(raw.description),
    cityInspiration: str(raw.cityInspiration),
    breadOrVessel: str(raw.breadOrVessel),
    verifiedPrice: str(raw.verifiedPrice),
    priceSourceNote: str(raw.priceSourceNote),
    image: str(raw.image),
    imageSrcSet: typeof raw.imageSrcSet === 'string' ? raw.imageSrcSet : undefined,
    imageAlt: str(raw.imageAlt),
    imageIsIllustrative: raw.imageIsIllustrative === true,
    halal: raw.halal === true,
    hidden: raw.hidden === true,
    orderUrl: str(raw.orderUrl),
    deliverooUrl: str(raw.deliverooUrl),
  };
}

const PHOTO_SOURCES: MenuItem['photoSource'][] = ['official-casa-street', 'editorial-kitchen', 'pending-owner-photo'];

/** Rebuilds a stored dish; invalid or link-injected dishes are dropped. */
function sanitizeStoredMenuItem(raw: Record<string, unknown>): MenuItem | null {
  const input = rawToMenuItemInput(raw);
  if (!input.id || !ITEM_ID.test(input.id)) return null;
  const photoSource = PHOTO_SOURCES.includes(raw.photoSource as MenuItem['photoSource'])
    ? (raw.photoSource as MenuItem['photoSource'])
    : 'official-casa-street';
  const { item } = validateMenuItemInput(input, {
    image: input.image,
    photoSource,
    ownerPhotoVerified: raw.ownerPhotoVerified === true,
  });
  return item;
}

/**
 * Lists every piece of submitted content that would be rejected, so the
 * server can refuse the whole save with a clear message instead of silently
 * dropping the owner's work.
 */
export function findCmsContentProblems(input: unknown): string[] {
  if (!isRecord(input)) return ['Invalid content.'];
  const problems: string[] = [];
  for (const cat of records(input.menuCategories)) {
    const text = validateCategoryText({
      title: str(cat.title),
      kicker: str(cat.kicker),
      description: str(cat.description),
    });
    for (const msg of Object.values(text.errors)) problems.push(`Section "${str(cat.title) || str(cat.id)}": ${msg}`);
    const items = records(cat.items);
    if (items.length > MAX_ITEMS_PER_CATEGORY) {
      problems.push(`Section "${str(cat.title)}": at most ${MAX_ITEMS_PER_CATEGORY} dishes.`);
    }
    for (const raw of items) {
      const inputItem = rawToMenuItemInput(raw);
      if (!inputItem.id || !ITEM_ID.test(inputItem.id)) {
        problems.push(`Dish "${inputItem.name || '(unnamed)'}": invalid id.`);
        continue;
      }
      const { errors } = validateMenuItemInput(inputItem, { image: inputItem.image, photoSource: 'official-casa-street', ownerPhotoVerified: true });
      for (const msg of Object.values(errors)) problems.push(`Dish "${inputItem.name || inputItem.id}": ${msg}`);
    }
  }
  for (const post of records(input.socialPosts)) {
    for (const field of ['title', 'caption'] as const) {
      const problem = findTextProblem(str(post[field]));
      if (problem) problems.push(`Photo post "${str(post.title)}": ${problem}`);
    }
  }
  return problems;
}

/* -------------------------------------------------------------------------- */
/*  Normalisation: the single gate for any CMS state from disk or the network  */
/* -------------------------------------------------------------------------- */

const MAX_OWNER_POSTS = 12;
const MAX_LOG_ENTRIES = 60;
const OWNER_POST_ID = /^post-\d{10,16}$/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function cleanText(value: unknown, max: number): string | undefined {
  if (typeof value !== 'string') return undefined;
  // Strip control characters; React escapes the rest on render.
  // eslint-disable-next-line no-control-regex
  return value.replace(/[\u0000-\u001F\u007F]/g, ' ').trim().slice(0, max);
}

function str(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function records(value: unknown): Record<string, unknown>[] {
  return Array.isArray(value) ? value.filter(isRecord) : [];
}

function sanitizeOwnerPost(raw: Record<string, unknown>): SocialPost | null {
  const id = typeof raw.id === 'string' ? raw.id : '';
  const title = cleanText(raw.title, 80);
  const caption = cleanText(raw.caption, 280) ?? '';
  const mediaUrl = typeof raw.mediaUrl === 'string' ? raw.mediaUrl : '';
  if (!OWNER_POST_ID.test(id) || !title || !isSafeImageSource(mediaUrl)) return null;
  if (findTextProblem(title) || findTextProblem(caption)) return null;

  const videoRaw = typeof raw.videoEmbedUrl === 'string' ? raw.videoEmbedUrl : '';
  const videoEmbedUrl =
    videoRaw && (isSafeHttpsUrl(videoRaw) || (SAME_ORIGIN_PATH.test(videoRaw) && !videoRaw.includes('..')))
      ? videoRaw
      : '';
  const postUrlRaw = typeof raw.postUrl === 'string' ? raw.postUrl : '';
  const postUrl = isSafeHttpsUrl(postUrlRaw, ['instagram.com', 'tiktok.com'])
    ? postUrlRaw
    : VERIFIED_INSTAGRAM_URL;

  return {
    id,
    platform: raw.platform === 'tiktok' ? 'tiktok' : 'instagram',
    title,
    caption: caption || 'Fresh from Casa Street London.',
    mediaUrl,
    mediaAlt: cleanText(raw.mediaAlt, 160) || `${title} — Casa Street photograph`,
    mediaType: raw.mediaType === 'video' && videoEmbedUrl ? 'video' : 'image',
    ...(videoEmbedUrl ? { videoEmbedUrl } : {}),
    postUrl,
    approved: raw.approved === true,
    ownerSupplied: true,
    verifiedByAi: raw.verifiedByAi === true,
    aspectLabel: cleanText(raw.aspectLabel, 60) || 'Instagram · Owner Approved',
  };
}

function sanitizeLogEntry(raw: Record<string, unknown>): ApprovalLogEntry | null {
  const id = cleanText(raw.id, 60);
  const timestamp = cleanText(raw.timestamp, 40);
  const action = cleanText(raw.action, 120);
  if (!id || !timestamp || !action || Number.isNaN(Date.parse(timestamp))) return null;
  return {
    id,
    timestamp,
    action,
    actor: cleanText(raw.actor, 60) || 'Casa Street Owner',
    target: cleanText(raw.target, 200) || '',
  };
}

/**
 * Rebuilds a trustworthy CmsState from untrusted input (persisted file, API
 * payload or API response). Content such as prices, descriptions, addresses and
 * the locked official links always comes from the code defaults; only the
 * owner's decisions (publish flags, halal settings, verified optional links,
 * approvals and owner photos) are carried over, each validated.
 */
export function normalizeCmsState(input: unknown): CmsState {
  const base = createInitialCmsState();
  if (!isRecord(input)) return base;

  const version = typeof input.schemaVersion === 'number' ? input.schemaVersion : 1;
  // v3+: halal settings and post approvals are owner decisions worth keeping.
  const isCurrentSchema = version >= 3;
  // v4+: menu text, prices, photos and dishes are owner-editable (validated).
  const hasEditableMenu = version >= 4;

  // Halal settings (legacy files predate the owner confirmation → keep defaults).
  const halal: HalalSettings = { ...base.halal };
  if (isCurrentSchema && isRecord(input.halal)) {
    const h = input.halal;
    if (typeof h.ownerConfirmed === 'boolean') halal.ownerConfirmed = h.ownerConfirmed;
    halal.certificationBody = cleanText(h.certificationBody, 80) ?? '';
    const url = cleanText(h.certificateUrl, 300) ?? '';
    halal.certificateUrl = url && isSafeHttpsUrl(url) ? url : '';
    halal.certified = h.certified === true && halal.ownerConfirmed;
    const at = cleanText(h.confirmedAt, 40);
    if (at && !Number.isNaN(Date.parse(at))) halal.confirmedAt = at;
  }

  // Optional social links: re-validate anything the owner verified.
  const linksIn = records(input.socialLinks);
  const socialLinks = base.socialLinks.map((link) => {
    if (link.lockedVerified) return link;
    const incoming = linksIn.find((l) => l.id === link.id);
    if (!incoming || incoming.verified !== true || typeof incoming.url !== 'string') return link;
    const result = validateSocialInput(link.platform, incoming.url);
    if (!result.valid) return link;
    return {
      ...link,
      url: result.normalizedUrl,
      handleOrNumber: result.displayHandle,
      verified: true,
      enabled: incoming.enabled !== false,
    };
  });

  // Menu: publish flags always; edited text/dishes from v4 (each field validated).
  const catsIn = records(input.menuCategories);
  const seenItemIds = new Set<string>();
  const menuCategories = base.menuCategories.map((cat) => {
    const incoming = catsIn.find((c) => c.id === cat.id);
    if (!incoming) return cat;
    const ownerConfirmed =
      typeof incoming.ownerConfirmed === 'boolean' ? incoming.ownerConfirmed : cat.ownerConfirmed;
    let published = typeof incoming.published === 'boolean' ? incoming.published : cat.published;
    if (cat.ownerConfirmationRequired && !ownerConfirmed) published = false;

    if (hasEditableMenu) {
      const text = validateCategoryText({
        title: str(incoming.title),
        kicker: str(incoming.kicker),
        description: str(incoming.description),
      });
      const items = records(incoming.items)
        .slice(0, MAX_ITEMS_PER_CATEGORY)
        .map(sanitizeStoredMenuItem)
        .filter((item): item is MenuItem => {
          if (!item || seenItemIds.has(item.id)) return false;
          seenItemIds.add(item.id);
          return true;
        });
      return { ...cat, ...(text.value ?? {}), ownerConfirmed, published, items };
    }

    const itemsIn = records(incoming.items);
    const items = cat.items.map((item) => {
      const inc = itemsIn.find((i) => i.id === item.id);
      if (!inc) return item;
      return {
        ...item,
        halal: isCurrentSchema && typeof inc.halal === 'boolean' ? inc.halal : item.halal,
        ownerPhotoVerified:
          typeof inc.ownerPhotoVerified === 'boolean' ? inc.ownerPhotoVerified : item.ownerPhotoVerified,
      };
    });
    return { ...cat, ownerConfirmed, published, items };
  });

  // Social posts: default posts keep code content; owner uploads are sanitised.
  const postsIn = records(input.socialPosts);
  const basePosts = base.socialPosts.map((post) => {
    const incoming = postsIn.find((p) => p.id === post.id);
    return isCurrentSchema && incoming && typeof incoming.approved === 'boolean'
      ? { ...post, approved: incoming.approved }
      : post;
  });
  const ownerPosts = postsIn
    .filter((p) => !base.socialPosts.some((b) => b.id === p.id))
    .map(sanitizeOwnerPost)
    .filter((p): p is SocialPost => p !== null)
    .slice(0, MAX_OWNER_POSTS);

  // Approval log: sanitised entries plus any new default entries.
  const logIn = records(input.approvalLog)
    .map(sanitizeLogEntry)
    .filter((e): e is ApprovalLogEntry => e !== null);
  const seen = new Set(logIn.map((e) => e.id));
  const approvalLog = [...logIn, ...base.approvalLog.filter((e) => !seen.has(e.id))]
    .sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp))
    .slice(0, MAX_LOG_ENTRIES);

  return {
    ...base,
    schemaVersion: CMS_SCHEMA_VERSION,
    halal,
    socialLinks,
    menuCategories,
    socialPosts: [...ownerPosts, ...basePosts],
    approvalLog,
  };
}
