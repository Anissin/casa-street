import test from 'node:test';
import assert from 'node:assert/strict';
import {
  VERIFIED_DELIVEROO_URL,
  VERIFIED_GOOGLE_MAPS_URL,
  VERIFIED_INSTAGRAM_URL,
  VERIFIED_UBEREATS_URL,
  confirmAndPublishCategory,
  createInitialCmsState,
  getApprovedSocialPosts,
  getPublicMenuCategories,
  getPublicSocialLinks,
  unpublishCategory,
  unverifySocialLink,
  validateSocialInput,
  verifySocialLink,
} from './cms';
import { buildRestaurantJsonLd } from './structuredData';

test('French Tacos starts unpublished while Signature Sandwiches, Msemen Wraps, and Tagines are public', () => {
  const state = createInitialCmsState();
  const publicCats = getPublicMenuCategories(state);
  const ids = publicCats.map((c) => c.id);

  assert.equal(ids.includes('signature-sandwiches'), true);
  assert.equal(ids.includes('msemen-wraps'), true);
  assert.equal(ids.includes('tagines'), true);
  assert.equal(ids.includes('french-tacos'), false);

  // Verify real Casa Street sandwich roster
  const sandwichNames = publicCats
    .find((c) => c.id === 'signature-sandwiches')
    ?.items.map((i) => i.name);
  assert.deepEqual(sandwichNames, ['Casablanca', 'Tangier', 'Marrakesh', 'Rabat', 'Fes']);

  // Primary street-food categories appear before secondary tagines
  assert.equal(ids.indexOf('signature-sandwiches') < ids.indexOf('tagines'), true);
  assert.equal(ids.indexOf('msemen-wraps') < ids.indexOf('tagines'), true);
});

test('Owner confirmation workflow publishes and unpublishes French Tacos cleanly', () => {
  const initial = createInitialCmsState();
  const published = confirmAndPublishCategory(initial, 'french-tacos', 'Owner Test');
  const publicIdsAfter = getPublicMenuCategories(published).map((c) => c.id);

  assert.equal(publicIdsAfter.includes('french-tacos'), true);
  assert.equal(published.approvalLog[0].action, 'Confirmed & published menu category');

  const reverted = unpublishCategory(published, 'french-tacos', 'Owner Test');
  assert.equal(
    getPublicMenuCategories(reverted).some((c) => c.id === 'french-tacos'),
    false
  );
});

test('Only verified social links appear publicly; TikTok/Facebook/WhatsApp stay hidden until verified', () => {
  const state = createInitialCmsState();
  const publicFollowLinks = getPublicSocialLinks(state, 'follow');
  assert.deepEqual(
    publicFollowLinks.map((l) => l.platform),
    ['instagram']
  );

  // Deliveroo & Uber Eats are both verified by default
  const publicFooterLinks = getPublicSocialLinks(state, 'footer').map((l) => l.platform);
  assert.equal(publicFooterLinks.includes('deliveroo'), true);
  assert.equal(publicFooterLinks.includes('ubereats'), true);

  // Invalid TikTok URL is rejected
  const badResult = verifySocialLink(state, 'tiktok', 'https://example.com/not-tiktok');
  assert.equal(badResult.result.valid, false);
  assert.equal(
    getPublicSocialLinks(badResult.state, 'follow').some((l) => l.platform === 'tiktok'),
    false
  );

  // Valid TikTok URL is verified and published
  const goodResult = verifySocialLink(
    state,
    'tiktok',
    'https://www.tiktok.com/@casastreetldn'
  );
  assert.equal(goodResult.result.valid, true);
  assert.deepEqual(
    getPublicSocialLinks(goodResult.state, 'follow').map((l) => l.platform),
    ['instagram', 'tiktok']
  );

  // Unverifying hides it again
  const hiddenAgain = unverifySocialLink(goodResult.state, 'tiktok');
  assert.equal(
    getPublicSocialLinks(hiddenAgain, 'follow').some((l) => l.platform === 'tiktok'),
    false
  );
});

test('WhatsApp phone validation normalizes E.164 numbers to wa.me links', () => {
  const validPhone = validateSocialInput('whatsapp', '+44 7700 900123');
  assert.equal(validPhone.valid, true);
  assert.equal(validPhone.normalizedUrl, 'https://wa.me/447700900123');

  const invalidPhone = validateSocialInput('whatsapp', '123');
  assert.equal(invalidPhone.valid, false);
});

test('Approved social posts exclude unapproved drafts', () => {
  const state = createInitialCmsState();
  const approved = getApprovedSocialPosts(state);
  assert.equal(approved.length, 3);
  assert.equal(approved.some((p) => p.id === 'post-draft-tacos'), false);
});

test('Structured data JSON-LD includes verified Maps, Uber Eats, Deliveroo, Instagram, and excludes unpublished categories', () => {
  const state = createInitialCmsState();
  const jsonLd = buildRestaurantJsonLd(state);

  assert.equal(jsonLd.hasMap, VERIFIED_GOOGLE_MAPS_URL);
  assert.deepEqual(jsonLd.sameAs, [VERIFIED_INSTAGRAM_URL]);
  assert.equal(jsonLd.address.streetAddress, '145–147 Edgware Road');
  assert.equal(jsonLd.address.postalCode, 'W2 2HR');
  assert.equal(jsonLd.potentialAction[0].target.urlTemplate, VERIFIED_UBEREATS_URL);
  assert.equal(jsonLd.potentialAction[1].target.urlTemplate, VERIFIED_DELIVEROO_URL);
  assert.equal(
    jsonLd.hasMenu.hasMenuSection.some((s) => s.name === 'French Tacos'),
    false
  );

  const published = confirmAndPublishCategory(state, 'french-tacos');
  const updatedJsonLd = buildRestaurantJsonLd(published);
  assert.equal(
    updatedJsonLd.hasMenu.hasMenuSection.some((s) => s.name === 'French Tacos'),
    true
  );
});
