/**
 * Link-injection protection shared by the admin editor (instant feedback) and
 * the server (enforcement). Always on — there is deliberately no switch.
 *
 * - Text fields (dish names, descriptions, captions…) may not contain links,
 *   web addresses, script/data URLs or HTML.
 * - Link fields only accept https URLs on an explicit allowlist of domains.
 */

/** True when `host` is `domain` itself or a subdomain of it (never a look-alike). */
export function hostMatches(host: string, domain: string): boolean {
  const h = host.toLowerCase().replace(/\.$/, '');
  return h === domain || h.endsWith(`.${domain}`);
}

export function isSafeHttpsUrl(raw: string, allowedDomains?: readonly string[]): boolean {
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    return false;
  }
  if (parsed.protocol !== 'https:' || parsed.username || parsed.password) return false;
  if (!allowedDomains) return true;
  return allowedDomains.some((d) => hostMatches(parsed.hostname, d));
}

/** Only these delivery platforms may be linked from a dish. */
export const ORDER_LINK_DOMAINS = {
  ubereats: ['ubereats.com'],
  deliveroo: ['deliveroo.co.uk'],
} as const;

export function isAllowedOrderUrl(raw: string, platform: keyof typeof ORDER_LINK_DOMAINS): boolean {
  return raw.length <= 300 && isSafeHttpsUrl(raw.trim(), ORDER_LINK_DOMAINS[platform]);
}

const LINK_PATTERN = new RegExp(
  [
    // any scheme://  (http, https, ftp, …)
    String.raw`[a-z][a-z0-9+.-]*:\/\/`,
    // dangerous or link-like schemes without //
    String.raw`\b(?:javascript|vbscript|data|file|mailto|tel|sms|intent|blob):`,
    // www.anything
    String.raw`\bwww\.`,
    // bare domains such as example.com / bit.ly / casa.co.uk
    String.raw`\b[a-z0-9-]+(?:\.[a-z0-9-]+)*\.(?:com|net|org|info|biz|io|co|uk|me|app|dev|xyz|online|site|shop|store|link|click|top|ru|cn|ly|gl|gg|tv|to|be|fr|de|es|it|nl|ma|ae|sa|tk|ml|ga|cf|gq|zip|mov)\b`,
  ].join('|'),
  'i'
);

/**
 * Returns a human-readable problem if `value` could inject a link or markup,
 * otherwise null. Unicode look-alikes (e.g. full-width dots) are normalised first.
 */
export function findTextProblem(value: string): string | null {
  const text = value.normalize('NFKC');
  if (/[<>]/.test(text)) {
    return 'Remove the < and > characters.';
  }
  if (LINK_PATTERN.test(text)) {
    return 'Links and web addresses are not allowed here. Use the Uber Eats / Deliveroo link fields instead.';
  }
  return null;
}

/** £11.70, £7.50, or a range such as £2.00 – £6.50. */
const PRICE_PATTERN = /^£\d{1,3}(?:\.\d{2})?(?:\s?[–-]\s?£\d{1,3}(?:\.\d{2})?)?$/;

export function isValidPrice(value: string): boolean {
  return PRICE_PATTERN.test(value.trim());
}
