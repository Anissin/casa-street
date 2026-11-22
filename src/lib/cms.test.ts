import test from 'node:test';
import assert from 'node:assert/strict';
import {
  VERIFIED_DELIVEROO_URL,
  VERIFIED_GOOGLE_MAPS_URL,
  VERIFIED_INSTAGRAM_URL,
  VERIFIED_UBEREATS_URL,
  confirmAndPublishCategory,
  CMS_SCHEMA_VERSION,
  createInitialCmsState,
  deleteMenuItem,
  emptyMenuItemInput,
  findCmsContentProblems,
  findTextProblem,
  isAllowedOrderUrl,
  menuItemToInput,
  moveMenuItem,
  setMenuItemHidden,
  updateCategoryText,
  upsertMenuItem,
  validateCategoryText,
  validateMenuItemInput,
  getApprovedSocialPosts,
  getHalalDisplay,
  getPublicMenuCategories,
  getPublicSocialLinks,
  hostMatches,
  isItemHalal,
  isSafeImageSource,
  normalizeCmsState,
  setHalalCertification,
  setHalalConfirmation,
  setMenuItemHalal,
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
  // The mint tea photo is held because it carries a third-party watermark.
  assert.equal(approved.length, 2);
  assert.equal(approved.some((p) => p.id === 'post-draft-tacos'), false);
  assert.equal(approved.some((p) => p.id === 'post-mint-tea-real'), false);
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

test('Deliveroo link has no tracking parameters', () => {
  assert.equal(VERIFIED_DELIVEROO_URL.includes('?'), false);
  assert.equal(VERIFIED_DELIVEROO_URL, 'https://deliveroo.co.uk/menu/london/paddington/casa-street');
});

test('Halal: owner-confirmed 100% halal messaging shows with no certification wording by default', () => {
  const state = createInitialCmsState();
  const display = getHalalDisplay(state);
  assert.equal(display.show, true);
  assert.equal(display.certified, false);
  assert.equal(display.certificationBody, '');

  // Meat dishes are tagged; sweet msemen and drinks are not.
  const items = state.menuCategories.flatMap((c) => c.items);
  const tagged = items.filter((i) => isItemHalal(state, i)).map((i) => i.id);
  assert.deepEqual(tagged, [
    'casablanca-sandwich',
    'tangier-sandwich',
    'marrakesh-sandwich',
    'rabat-sandwich',
    'fes-sandwich',
    'signature-firma-wrap',
    'chicken-tajine',
  ]);

  // Hiding halal messaging hides every tag and clears certification.
  const hidden = setHalalConfirmation(state, false);
  assert.equal(getHalalDisplay(hidden).show, false);
  assert.equal(items.some((i) => isItemHalal(hidden, i)), false);

  // Certification wording is optional and off by default; it requires confirmation,
  // and the certifying body name is optional.
  const noBody = setHalalCertification(state, { certified: true, certificationBody: ' ', certificateUrl: '' });
  assert.equal(noBody.error, undefined);
  assert.equal(getHalalDisplay(noBody.state).certified, true);
  assert.equal(getHalalDisplay(noBody.state).certificationBody, '');
  assert.ok(setHalalCertification(hidden, { certified: true, certificationBody: 'HMC', certificateUrl: '' }).error);
  assert.ok(
    setHalalCertification(state, { certified: false, certificationBody: '', certificateUrl: 'javascript:alert(1)' }).error
  );
  const certified = setHalalCertification(state, {
    certified: true,
    certificationBody: 'Example Body',
    certificateUrl: 'https://example.org/cert',
  });
  assert.equal(certified.error, undefined);
  assert.equal(getHalalDisplay(certified.state).certified, true);
  assert.equal(getHalalDisplay(certified.state).certificationBody, 'Example Body');

  // Per-dish tag toggling.
  const untagged = setMenuItemHalal(state, 'tangier-sandwich', false);
  const tangier = untagged.menuCategories[0].items.find((i) => i.id === 'tangier-sandwich')!;
  assert.equal(isItemHalal(untagged, tangier), false);
});

test('Social URL validation rejects look-alike domains', () => {
  assert.equal(hostMatches('www.tiktok.com', 'tiktok.com'), true);
  assert.equal(hostMatches('tiktok.com.evil.example', 'tiktok.com'), false);
  assert.equal(hostMatches('nottiktok.com', 'tiktok.com'), false);
  assert.equal(validateSocialInput('tiktok', 'https://tiktok.com.evil.example/@x').valid, false);
  assert.equal(validateSocialInput('instagram', 'https://evilinstagram.com/x').valid, false);
  assert.equal(validateSocialInput('facebook', 'javascript:alert(1)').valid, false);
  assert.equal(validateSocialInput('facebook', 'http://www.facebook.com/x').valid, false);
});

test('Image sources: same-origin paths and small data:image URLs only', () => {
  assert.equal(isSafeImageSource('/images/menu/tangier-960.webp'), true);
  assert.equal(isSafeImageSource('//evil.example/x.png'), false);
  assert.equal(isSafeImageSource('/images/../../etc/passwd'), false);
  assert.equal(isSafeImageSource('https://evil.example/x.png'), false);
  assert.equal(isSafeImageSource('javascript:alert(1)'), false);
  assert.equal(isSafeImageSource('data:image/svg+xml;base64,PHN2Zz4='), false);
  assert.equal(isSafeImageSource('data:image/png;base64,iVBORw0KGgo='), true);
});

test('normalizeCmsState rejects tampered content and keeps only validated owner decisions', () => {
  const base = createInitialCmsState();
  const tampered = JSON.parse(JSON.stringify(base));
  tampered.brand.name = 'Hacked';
  tampered.location.uberEatsUrl = 'https://phishing.example';
  tampered.socialLinks[0].url = 'https://phishing.example';
  tampered.menuCategories[0].items[0].verifiedPrice = '£0.01';
  tampered.socialLinks.find((l: { id: string }) => l.id === 'tiktok').verified = true;
  tampered.socialLinks.find((l: { id: string }) => l.id === 'tiktok').url = 'https://tiktok.com.evil.example/@x';
  tampered.socialPosts.unshift({
    id: 'post-1795349698219',
    title: 'Bad',
    mediaUrl: 'https://evil.example/track.png',
    approved: true,
  });
  tampered.socialPosts.unshift({
    id: 'post-1795349698220',
    title: 'Owner photo',
    mediaUrl: 'data:image/jpeg;base64,/9j/4AAQ',
    postUrl: 'javascript:alert(1)',
    approved: true,
  });
  // French Tacos cannot be published without owner confirmation.
  tampered.menuCategories.find((c: { id: string }) => c.id === 'french-tacos').published = true;

  // Injected links / phishing order links make a dish invalid → dropped.
  tampered.menuCategories[0].items[1].description = 'Great! Order at http://phish.example now';
  tampered.menuCategories[0].items[2].orderUrl = 'https://ubereats.com.evil.example/x';

  const clean = normalizeCmsState(tampered);
  assert.equal(clean.brand.name, 'Casa Street');
  assert.equal(clean.location.uberEatsUrl, VERIFIED_UBEREATS_URL);
  assert.equal(clean.socialLinks[0].url, VERIFIED_INSTAGRAM_URL);
  // Prices are owner-editable (behind the passcode) and validated as prices.
  assert.equal(clean.menuCategories[0].items[0].verifiedPrice, '£0.01');
  const ids = clean.menuCategories[0].items.map((i) => i.id);
  assert.equal(ids.includes('tangier-sandwich'), false);
  assert.equal(ids.includes('marrakesh-sandwich'), false);
  assert.equal(getPublicSocialLinks(clean, 'follow').some((l) => l.platform === 'tiktok'), false);
  assert.equal(getPublicMenuCategories(clean).some((c) => c.id === 'french-tacos'), false);
  assert.equal(clean.socialPosts.some((p) => p.id === 'post-1795349698219'), false);
  const ownerPost = clean.socialPosts.find((p) => p.id === 'post-1795349698220');
  assert.ok(ownerPost);
  assert.equal(ownerPost.postUrl, VERIFIED_INSTAGRAM_URL);

  assert.deepEqual(normalizeCmsState('garbage'), base);
  assert.deepEqual(normalizeCmsState(null), base);
});

test('normalizeCmsState carries owner decisions and migrates legacy files', () => {
  const published = confirmAndPublishCategory(createInitialCmsState(), 'french-tacos');
  const verified = verifySocialLink(published, 'tiktok', 'https://www.tiktok.com/@casastreetldn').state;
  const hiddenHalal = setHalalConfirmation(verified, false);
  const roundTrip = normalizeCmsState(JSON.parse(JSON.stringify(hiddenHalal)));
  assert.equal(getPublicMenuCategories(roundTrip).some((c) => c.id === 'french-tacos'), true);
  assert.equal(getPublicSocialLinks(roundTrip, 'follow').some((l) => l.platform === 'tiktok'), true);
  assert.equal(getHalalDisplay(roundTrip).show, false);
  assert.equal(roundTrip.schemaVersion, CMS_SCHEMA_VERSION);

  // A legacy (v1) file without schemaVersion/halal gets current defaults,
  // including the held watermarked photo, but keeps publish decisions.
  const legacy = JSON.parse(JSON.stringify(published));
  delete legacy.schemaVersion;
  delete legacy.halal;
  legacy.socialPosts.find((p: { id: string }) => p.id === 'post-mint-tea-real').approved = true;
  const migrated = normalizeCmsState(legacy);
  assert.equal(getHalalDisplay(migrated).show, true);
  assert.equal(migrated.socialPosts.find((p) => p.id === 'post-mint-tea-real')?.approved, false);
  assert.equal(getPublicMenuCategories(migrated).some((c) => c.id === 'french-tacos'), true);
});

test('Structured data marks only halal-tagged dishes with HalalDiet', () => {
  const state = createInitialCmsState();
  const jsonLd = buildRestaurantJsonLd(state, 'https://casa.example');
  const items = jsonLd.hasMenu.hasMenuSection.flatMap((s) => s.hasMenuItem) as Array<{
    name: string;
    suitableForDiet?: string;
  }>;
  assert.equal(items.find((i) => i.name === 'Casablanca')?.suitableForDiet, 'https://schema.org/HalalDiet');
  assert.equal(items.find((i) => i.name.startsWith('Msemen ('))?.suitableForDiet, undefined);
  assert.equal(jsonLd.servesCuisine.includes('Halal'), true);
  assert.equal(jsonLd.url, 'https://casa.example/');

  const noHalal = buildRestaurantJsonLd(setHalalConfirmation(state, false));
  assert.equal(noHalal.servesCuisine.includes('Halal'), false);
  assert.equal(JSON.stringify(noHalal).includes('HalalDiet'), false);
  assert.equal('url' in noHalal, false);
});

test('Link protection: text fields reject links, web addresses, scripts and HTML', () => {
  const bad = [
    'Order at https://phish.example',
    'see www.example.com',
    'visit casa-deals.co.uk today',
    'bit.ly/abc',
    'javascript:alert(1)',
    'DATA:text/html,hi',
    'mailto:x@y.z',
    '<img src=x onerror=alert(1)>',
    '[click](http://x.y)',
    'ftp://files.example',
    'evil．com', // full-width dot normalised to "."
  ];
  for (const text of bad) assert.ok(findTextProblem(text), `should reject: ${text}`);
  const good = [
    'Marinated chicken thighs, spiced mince, olives & chips.',
    'Golden msemen (Nutella, pistachio, or amlou) — £7.50 on Uber Eats / Deliveroo',
    'Sauce Algérienne, samurai sauce. Halal.',
    'Follow @casastreetldn',
  ];
  for (const text of good) assert.equal(findTextProblem(text), null, `should allow: ${text}`);
});

test('Link protection: order links only allow Uber Eats / Deliveroo over https', () => {
  assert.equal(isAllowedOrderUrl(VERIFIED_UBEREATS_URL, 'ubereats'), true);
  assert.equal(isAllowedOrderUrl('https://www.ubereats.com/gb/store/x/123', 'ubereats'), true);
  assert.equal(isAllowedOrderUrl('https://ubereats.com.evil.example/x', 'ubereats'), false);
  assert.equal(isAllowedOrderUrl('http://www.ubereats.com/x', 'ubereats'), false);
  assert.equal(isAllowedOrderUrl('https://user:pw@ubereats.com/x', 'ubereats'), false);
  assert.equal(isAllowedOrderUrl('javascript:alert(1)', 'ubereats'), false);
  assert.equal(isAllowedOrderUrl(VERIFIED_DELIVEROO_URL, 'deliveroo'), true);
  assert.equal(isAllowedOrderUrl(VERIFIED_DELIVEROO_URL, 'ubereats'), false);
});

test('Menu editor: validate, add, edit, hide, move and delete dishes', () => {
  const state = createInitialCmsState();

  const invalid = validateMenuItemInput({
    ...emptyMenuItemInput(),
    name: '',
    description: 'Best deals at www.phish.example',
    verifiedPrice: '12',
    orderUrl: 'https://evil.example/order',
    deliverooUrl: 'https://deliveroo.co.uk.evil.example',
    image: 'https://evil.example/x.png',
  });
  assert.equal(invalid.item, null);
  assert.deepEqual(Object.keys(invalid.errors).sort(), [
    'deliverooUrl',
    'description',
    'image',
    'name',
    'orderUrl',
    'verifiedPrice',
  ]);

  const valid = validateMenuItemInput({
    ...emptyMenuItemInput(),
    name: 'Agadir',
    description: 'Grilled chicken, harissa mayo and Moroccan salad.',
    verifiedPrice: '£12.00',
    image: '/uploads/abc123.jpg',
  });
  assert.ok(valid.item);
  assert.equal(valid.item.halal, true);
  assert.equal(valid.item.photoSource, 'official-casa-street');
  assert.equal(valid.item.imageAlt, 'Agadir');

  let next = upsertMenuItem(state, 'signature-sandwiches', valid.item);
  let sandwiches = getPublicMenuCategories(next).find((c) => c.id === 'signature-sandwiches')!;
  assert.equal(sandwiches.items.at(-1)?.name, 'Agadir');
  assert.equal(next.approvalLog[0].action, 'Added new dish');

  // Edit keeps the id; moving to another category removes it from the old one.
  const edited = validateMenuItemInput({ ...menuItemToInput(valid.item), name: 'Agadir Special' }, valid.item);
  next = upsertMenuItem(next, 'msemen-wraps', edited.item!);
  assert.equal(next.menuCategories[0].items.some((i) => i.id === valid.item!.id), false);
  assert.equal(next.menuCategories[1].items.at(-1)?.name, 'Agadir Special');

  next = moveMenuItem(next, valid.item.id, -1);
  assert.equal(next.menuCategories[1].items.at(-2)?.id, valid.item.id);

  next = setMenuItemHidden(next, valid.item.id, true);
  const publicWraps = getPublicMenuCategories(next).find((c) => c.id === 'msemen-wraps')!;
  assert.equal(publicWraps.items.some((i) => i.id === valid.item!.id), false);
  assert.equal(JSON.stringify(buildRestaurantJsonLd(next)).includes('Agadir Special'), false);

  next = deleteMenuItem(next, valid.item.id);
  assert.equal(next.menuCategories.flatMap((c) => c.items).some((i) => i.id === valid.item!.id), false);

  // A section with every dish hidden disappears from the public menu.
  let allHidden = state;
  for (const item of state.menuCategories[2].items) allHidden = setMenuItemHidden(allHidden, item.id, true);
  assert.equal(getPublicMenuCategories(allHidden).some((c) => c.id === 'tagines'), false);

  // Section text is validated with the same rules.
  assert.ok(validateCategoryText({ title: 'Wraps', kicker: '', description: 'see casa.com' }).errors.description);
  const text = validateCategoryText({ title: 'Wraps & Msemen', kicker: 'Fresh', description: 'Hot off the griddle.' });
  next = updateCategoryText(state, 'msemen-wraps', text.value!);
  assert.equal(getPublicMenuCategories(next).find((c) => c.id === 'msemen-wraps')?.title, 'Wraps & Msemen');
});

test('Default menu content passes link protection; edited content survives a round trip', () => {
  const state = createInitialCmsState();
  assert.deepEqual(findCmsContentProblems(state), []);
  assert.deepEqual(normalizeCmsState(JSON.parse(JSON.stringify(state))), state);

  const { item } = validateMenuItemInput({
    ...emptyMenuItemInput(),
    name: 'Agadir',
    description: 'Grilled chicken and harissa.',
  });
  const edited = upsertMenuItem(state, 'signature-sandwiches', item!);
  const roundTrip = normalizeCmsState(JSON.parse(JSON.stringify(edited)));
  assert.equal(roundTrip.menuCategories[0].items.at(-1)?.name, 'Agadir');

  const injected = JSON.parse(JSON.stringify(state));
  injected.menuCategories[0].items[0].description = '<script>alert(1)</script>';
  injected.socialPosts[0].caption = 'Deals at www.phish.example';
  const problems = findCmsContentProblems(injected);
  assert.equal(problems.length, 2);
  assert.match(problems[0], /Casablanca/);
});
