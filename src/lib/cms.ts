export const VERIFIED_INSTAGRAM_URL = 'https://www.instagram.com/casastreetldn/';
export const VERIFIED_GOOGLE_MAPS_URL =
  'https://www.google.com/maps/search/?api=1&query=51.5175157%2C-0.1672527&query_place_id=ChIJB92CagAbdkgR-Uo59s_L3G0';
export const VERIFIED_UBEREATS_URL =
  'https://www.ubereats.com/gb/store/casa-street/tuQa5hFpRaWpH0Ih5ZyeKA';
export const VERIFIED_DELIVEROO_URL =
  'https://deliveroo.co.uk/menu/london/paddington/casa-street?srsltid=AfmBOooePdmLDxNholMsROndcaZZx_M-bRhRXBUwlzTBNua9VA3KSn4f';
export const CASA_LOGO_URL =
  '/assets/aistudio/Capture_d__cran_2026-11-22_122445_ca205e1c.png';

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
  image: string;
  imageAlt: string;
  photoSource: 'official-casa-street' | 'editorial-kitchen';
  ownerPhotoVerified: boolean;
  orderUrl: string;
  deliverooUrl?: string;
  verifiedPrice?: string;
  priceSourceNote?: string;
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

export interface CmsState {
  brand: {
    name: string;
    logoUrl: string;
    tagline: string;
    districtNote: string;
    heroImage: string;
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
  socialLinks: SocialLink[];
  menuCategories: MenuCategory[];
  socialPosts: SocialPost[];
  approvalLog: ApprovalLogEntry[];
}

export function createInitialCmsState(): CmsState {
  return {
    brand: {
      name: 'Casa Street',
      logoUrl: CASA_LOGO_URL,
      tagline: 'Casablanca to Paddington. Built Oversized.',
      districtNote: '145–147 Edgware Road, Paddington · Inside The Food District (100% Halal)',
      heroImage: '/assets/casa-street/casa_gallery_1.webp',
      heroImageAlt:
        'Authentic Casa Street oversized Moroccan baguette sandwiches stuffed with spiced kofta, merguez, olives, harissa, tuna, egg, and fresh salad',
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
        kicker: 'Primary Street Food · Oversized Moroccan Baguettes',
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
            image: '/assets/casa-street/casa_gallery_1.webp',
            imageAlt: 'Authentic Casa Street Casablanca oversized Moroccan baguette sandwiches',
            photoSource: 'official-casa-street',
            ownerPhotoVerified: true,
            orderUrl: VERIFIED_UBEREATS_URL,
            deliverooUrl: VERIFIED_DELIVEROO_URL,
            verifiedPrice: '£11.70',
            priceSourceNote: 'Uber Eats / Deliveroo Paddington',
          },
          {
            id: 'tangier-sandwich',
            name: 'Tangier',
            cityInspiration: 'Tangier',
            breadOrVessel: 'Oversized Moroccan Baguette',
            description:
              'Beef sausage, chicken breast, chips, iceberg salad, tomatoes, grilled onions, sauce Tunisienne, and mayo.',
            image: '/src/assets/images/sandwich_tangier_1795349697634.jpg',
            imageAlt: 'Tangier Moroccan sandwich with grilled meats, peppers, and house sauce',
            photoSource: 'editorial-kitchen',
            ownerPhotoVerified: true,
            orderUrl: VERIFIED_UBEREATS_URL,
            deliverooUrl: VERIFIED_DELIVEROO_URL,
            verifiedPrice: '£11.70',
            priceSourceNote: 'Uber Eats / Deliveroo Paddington',
          },
          {
            id: 'marrakesh-sandwich',
            name: 'Marrakesh',
            cityInspiration: 'Marrakesh',
            breadOrVessel: 'Oversized Moroccan Baguette',
            description:
              'Marinated mince, olives, Moroccan salad, grilled onions, chips, Algérienne sauce, and samurai sauce.',
            image: '/src/assets/images/hero_casa_sandwich_1795349697989.jpg',
            imageAlt: 'Marrakesh Moroccan sandwich wrapped in kraft butcher paper',
            photoSource: 'editorial-kitchen',
            ownerPhotoVerified: true,
            orderUrl: VERIFIED_UBEREATS_URL,
            deliverooUrl: VERIFIED_DELIVEROO_URL,
            verifiedPrice: '£12.75',
            priceSourceNote: 'Uber Eats',
          },
          {
            id: 'rabat-sandwich',
            name: 'Rabat',
            cityInspiration: 'Rabat',
            breadOrVessel: 'Oversized Moroccan Baguette',
            description:
              'Marinated lamb cubes, Moroccan salad, chips, grilled onions, harissa, and sauce marocaine.',
            image: '/src/assets/images/sandwich_casablanca_1795349697567.jpg',
            imageAlt: 'Rabat marinated lamb Moroccan baguette sandwich with harissa',
            photoSource: 'editorial-kitchen',
            ownerPhotoVerified: true,
            orderUrl: VERIFIED_UBEREATS_URL,
            deliverooUrl: VERIFIED_DELIVEROO_URL,
            verifiedPrice: '£12.75',
            priceSourceNote: 'Uber Eats',
          },
          {
            id: 'fes-sandwich',
            name: 'Fes',
            cityInspiration: 'Fes',
            breadOrVessel: 'Oversized Moroccan Baguette',
            description:
              'Chicken thighs, lamb liver, Moroccan salad, olives, chips, samurai sauce, and mayo.',
            image: '/assets/casa-street/casa_gallery_1.webp',
            imageAlt: 'Fes Moroccan street sandwich packed with spiced grill cuts and olives',
            photoSource: 'official-casa-street',
            ownerPhotoVerified: true,
            orderUrl: VERIFIED_UBEREATS_URL,
            deliverooUrl: VERIFIED_DELIVEROO_URL,
            verifiedPrice: '£11.70',
            priceSourceNote: 'Uber Eats',
          },
        ],
      },
      {
        id: 'msemen-wraps',
        title: 'Msemen, Firma Wraps & Sweet Pancakes',
        kicker: 'Primary Street Food · Layered Msemen & Street Wraps',
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
            image: '/src/assets/images/msemen_wrap_signature_1795349697214.jpg',
            imageAlt: 'Casa Street Signature Firma Wrap sliced showing layered wrap and spiced fillings',
            photoSource: 'editorial-kitchen',
            ownerPhotoVerified: true,
            orderUrl: VERIFIED_UBEREATS_URL,
            deliverooUrl: VERIFIED_DELIVEROO_URL,
            verifiedPrice: '£11.00',
            priceSourceNote: 'Uber Eats',
          },
          {
            id: 'sweet-msemen',
            name: 'Msemen (Nutella, Pistachio, or Amlou)',
            cityInspiration: 'Moroccan Griddle Classic',
            breadOrVessel: 'Flaky Layered Msemen',
            description:
              'Golden pan-griddled Moroccan layered flatbread served with Nutella, pistachio, or traditional Moroccan amlou (also featuring signature Dubai chocolate-filled Msemen at The Food District).',
            image: '/src/assets/images/msemen_wrap_signature_1795349697214.jpg',
            imageAlt: 'Flaky layered Moroccan msemen flatbread served warm',
            photoSource: 'editorial-kitchen',
            ownerPhotoVerified: true,
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
        kicker: 'Secondary Classics · Slow-Cooked Pots & Refreshments',
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
            image: '/src/assets/images/tagine_secondary_1795349697935.jpg',
            imageAlt: 'Traditional Moroccan chicken tagine cooked in clay earthenware',
            photoSource: 'editorial-kitchen',
            ownerPhotoVerified: true,
            orderUrl: VERIFIED_UBEREATS_URL,
            deliverooUrl: VERIFIED_DELIVEROO_URL,
            verifiedPrice: '£16.75',
            priceSourceNote: 'Uber Eats',
          },
          {
            id: 'moroccan-mint-tea',
            name: 'Moroccan Mint Tea & Cold Drinks',
            cityInspiration: 'Maghrebi Refreshments',
            breadOrVessel: 'Fresh Mint Tea · Juices & Sodas',
            description:
              'Traditional hot tea infused with fresh mint leaves (£4.00 Uber Eats / £2.50 Deliveroo), plus Royal Avocado Juice (£5.50–£6.50), Poms, Slim Citron, Hammoud, and Hawai.',
            image: '/assets/casa-street/casa_gallery_2.jpg',
            imageAlt: 'Authentic Casa Street Moroccan mint tea poured in ornate glasses with silver teapot',
            photoSource: 'official-casa-street',
            ownerPhotoVerified: true,
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
            image: '/src/assets/images/french_tacos_draft_1795349698219.jpg',
            imageAlt: 'Toasted rectangular French tacos wrap sliced in half on dark kitchen tray',
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
        mediaUrl: '/assets/casa-street/casa_gallery_1.webp',
        mediaAlt: 'Real Casa Street Moroccan baguette sandwiches from The Food District',
        mediaType: 'image',
        postUrl: VERIFIED_INSTAGRAM_URL,
        approved: true,
        ownerSupplied: true,
        verifiedByAi: true,
        aspectLabel: 'Official Photo · @casastreetldn',
      },
      {
        id: 'post-mint-tea-real',
        platform: 'instagram',
        title: 'Traditional Moroccan Mint Tea',
        caption:
          'Freshly brewed Moroccan mint tea served in ornate glasses straight from our Paddington counter.',
        mediaUrl: '/assets/casa-street/casa_gallery_2.jpg',
        mediaAlt: 'Real Casa Street Moroccan mint tea glasses and silver teapot',
        mediaType: 'image',
        postUrl: VERIFIED_INSTAGRAM_URL,
        approved: true,
        ownerSupplied: true,
        verifiedByAi: true,
        aspectLabel: 'Official Photo · Paddington W2',
      },
      {
        id: 'post-msemen-fold',
        platform: 'instagram',
        title: 'Flaky Msemen & Firma Wraps',
        caption:
          'Golden laminated Moroccan msemen griddled fresh and paired with spiced street fillings or sweet Nutella, pistachio, and amlou.',
        mediaUrl: '/src/assets/images/msemen_wrap_signature_1795349697214.jpg',
        mediaAlt: 'Golden laminated Moroccan msemen wrap sliced diagonally',
        mediaType: 'video',
        videoEmbedUrl: '',
        postUrl: VERIFIED_INSTAGRAM_URL,
        approved: true,
        ownerSupplied: true,
        verifiedByAi: true,
        aspectLabel: 'Instagram Reel · Griddle Watch',
      },
      {
        id: 'post-draft-tacos',
        platform: 'instagram',
        title: 'French Tacos Test Kitchen (Draft)',
        caption: 'Unpublished test shot awaiting Casa Street owner confirmation before going live.',
        mediaUrl: '/src/assets/images/french_tacos_draft_1795349698219.jpg',
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
        id: 'log-1',
        timestamp: '2026-11-22T09:00:00Z',
        actor: 'Casa Street CMS',
        action: 'Verified primary links & logo',
        target: 'Official Logo, Instagram (@casastreetldn), Google Maps, Uber Eats, Deliveroo Paddington',
      },
      {
        id: 'log-2',
        timestamp: '2026-11-22T09:05:00Z',
        actor: 'Compliance Gate',
        action: 'Held category as unpublished draft',
        target: 'French Tacos (pending owner confirmation; separate from The Taco House)',
      },
    ],
  };
}

export interface ValidationResult {
  valid: boolean;
  normalizedUrl: string;
  displayHandle: string;
  error?: string;
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
    parsed = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
  } catch {
    return {
      valid: false,
      normalizedUrl: '',
      displayHandle: '',
      error: 'Enter a valid HTTPS URL (for example https://www.tiktok.com/@casastreetldn).',
    };
  }

  if (parsed.protocol !== 'https:') {
    return {
      valid: false,
      normalizedUrl: '',
      displayHandle: '',
      error: 'Official social profile URLs must use HTTPS.',
    };
  }

  const host = parsed.hostname.toLowerCase();
  if (platform === 'tiktok' && !host.includes('tiktok.com')) {
    return {
      valid: false,
      normalizedUrl: '',
      displayHandle: '',
      error: 'TikTok URL must be on tiktok.com.',
    };
  }
  if (platform === 'facebook' && !host.includes('facebook.com') && !host.includes('fb.com')) {
    return {
      valid: false,
      normalizedUrl: '',
      displayHandle: '',
      error: 'Facebook URL must be on facebook.com or fb.com.',
    };
  }
  if (platform === 'instagram' && !host.includes('instagram.com')) {
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
    .slice()
    .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
}

export function getApprovedSocialPosts(state: CmsState): SocialPost[] {
  return state.socialPosts.filter((post) => post.approved && post.ownerSupplied);
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
      {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        actor,
        action: 'Confirmed & published menu category',
        target: targetCat?.title ?? categoryId,
      },
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
      {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        actor,
        action: 'Returned category to unpublished draft',
        target: targetCat?.title ?? categoryId,
      },
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
        {
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actor,
          action: 'Verified social channel',
          target: `${target.label} (${validation.displayHandle})`,
        },
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
      {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        actor,
        action: 'Hid unverified social channel',
        target: target.label,
      },
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
      {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        actor,
        action: approved ? 'Approved social feature' : 'Moved social feature to draft',
        target: target?.title ?? postId,
      },
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
      {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        actor: 'Casa Street Owner',
        action: newPost.approved ? 'Published owner-verified photo' : 'Saved owner photo as draft',
        target: newPost.title,
      },
      ...state.approvalLog,
    ],
  };
}
