import { useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  RotateCcw,
  ShieldCheck,
  Upload,
  X,
} from 'lucide-react';
import {
  type CmsState,
  type PhotoAnalysisResult,
  VERIFIED_INSTAGRAM_URL,
  addOwnerSocialPost,
  confirmAndPublishCategory,
  getHalalDisplay,
  setHalalCertification,
  setHalalConfirmation,
  setMenuItemHalal,
  toggleSocialPostApproval,
  unpublishCategory,
  unverifySocialLink,
  verifySocialLink,
} from '../lib/cms';
import { buildRestaurantJsonLd } from '../lib/structuredData';
import { useDialog } from '../lib/useDialog';
import type { SaveResult } from '../App';
import { checkPhotoFile, downscaleImage, uploadOwnerPhoto } from '../lib/imageUpload';
import { HalalBadge } from './HalalBadge';
import { MenuEditor } from './MenuEditor';

interface OwnerCmsModalProps {
  cms: CmsState;
  ownerToken: string;
  onUnlock: (token: string) => void;
  onLock: () => void;
  onUpdateCms: (nextState: CmsState) => Promise<SaveResult>;
  onResetCms: () => Promise<SaveResult>;
  onClose: () => void;
}

type StudioTab = 'menuEditor' | 'categories' | 'halal' | 'socialLinks' | 'socialFeed' | 'schema';

const STATIC_HOSTING_MESSAGE =
  'Editing is not available on this hosting yet: the admin needs the Casa Street server (npm start), which static hosting such as Vercel does not run. The public website is not affected.';

export function OwnerCmsModal({
  cms,
  ownerToken,
  onUnlock,
  onLock,
  onUpdateCms,
  onResetCms,
  onClose,
}: OwnerCmsModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  useDialog(true, onClose, dialogRef);

  const [activeTab, setActiveTab] = useState<StudioTab>('menuEditor');
  const [saveError, setSaveError] = useState<string | null>(null);
  const [passcode, setPasscode] = useState('');
  const [unlockError, setUnlockError] = useState<string | null>(null);
  const [unlocking, setUnlocking] = useState(false);
  const [halalAck, setHalalAck] = useState(false);
  const [certForm, setCertForm] = useState({
    certified: cms.halal.certified,
    certificationBody: cms.halal.certificationBody,
    certificateUrl: cms.halal.certificateUrl,
  });
  const [certError, setCertError] = useState<string | null>(null);
  const [frenchTacosAck, setFrenchTacosAck] = useState(false);
  const [linkInputs, setLinkInputs] = useState<Record<string, string>>({});
  const [linkErrors, setLinkErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  // Owner photo upload + AI verification state
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCaption, setUploadCaption] = useState('');
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [uploadMime, setUploadMime] = useState('image/jpeg');
  const [aiResult, setAiResult] = useState<PhotoAnalysisResult | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const halalDisplay = getHalalDisplay(cms);
  const frenchTacosCategory = cms.menuCategories.find((c) => c.id === 'french-tacos');
  const jsonLdPreview = JSON.stringify(buildRestaurantJsonLd(cms), null, 2);

  async function applyCmsUpdate(nextState: CmsState): Promise<boolean> {
    setSaving(true);
    setSaveError(null);
    try {
      const result = await onUpdateCms(nextState);
      if (!result.ok) {
        setSaveError(result.error || 'Your change was not saved.');
        return false;
      }
      return true;
    } finally {
      setSaving(false);
    }
  }

  async function handleUnlock(e: FormEvent) {
    e.preventDefault();
    const token = passcode.trim();
    if (!token || unlocking) return;
    setUnlocking(true);
    setUnlockError(null);
    try {
      const resp = await fetch('/api/owner/session', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resp.ok) {
        setPasscode('');
        onUnlock(token);
        return;
      }
      const isJson = (resp.headers.get('content-type') ?? '').includes('json');
      if (!isJson || resp.status === 404 || resp.status === 405) {
        setUnlockError(STATIC_HOSTING_MESSAGE);
        return;
      }
      const data = (await resp.json().catch(() => ({}))) as { error?: string };
      setUnlockError(data.error || 'Could not unlock the Owner Studio.');
    } catch {
      setUnlockError('Could not reach the server.');
    } finally {
      setUnlocking(false);
    }
  }

  async function handleReset() {
    if (!window.confirm('Reset all owner settings to the defaults? This cannot be undone.')) return;
    setSaving(true);
    setSaveError(null);
    try {
      const result = await onResetCms();
      if (!result.ok) setSaveError(result.error || 'Nothing was reset.');
    } finally {
      setSaving(false);
    }
  }

  function handleSaveCertification() {
    const { state, error } = setHalalCertification(cms, certForm);
    setCertError(error ?? null);
    if (!error) void applyCmsUpdate(state);
  }

  function handleVerifySocial(linkId: string) {
    const raw = linkInputs[linkId] ?? '';
    const { state, result } = verifySocialLink(cms, linkId, raw);
    if (!result.valid) {
      setLinkErrors((prev) => ({
        ...prev,
        [linkId]: result.error || 'Invalid URL or phone number.',
      }));
      return;
    }
    setLinkErrors((prev) => {
      const next = { ...prev };
      delete next[linkId];
      return next;
    });
    void applyCmsUpdate(state);
  }

  function handleOwnerPhotoSelect(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setAiResult(null);
    setAiError(null);
    const problem = checkPhotoFile(file);
    if (problem) {
      setAiError(problem);
      return;
    }
    downscaleImage(file)
      .then((dataUrl) => {
        setUploadMime('image/jpeg');
        setUploadPreview(dataUrl);
      })
      .catch(() => setAiError('Could not read that photo. Please try another.'));
  }

  async function handleVerifyPhotoWithAi() {
    if (!uploadPreview || aiLoading) return;
    setAiLoading(true);
    setAiError(null);
    setAiResult(null);
    try {
      const resp = await fetch('/api/analyze-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${ownerToken}` },
        body: JSON.stringify({
          imageBase64: uploadPreview,
          mimeType: uploadMime,
          contextNote: uploadTitle || 'Owner gallery submission for FOLLOW THE FLAVOUR',
        }),
      });
      const data = (await resp.json()) as PhotoAnalysisResult & { error?: string };
      if (!resp.ok) {
        throw new Error(data.error || 'Could not analyze uploaded photo.');
      }
      setAiResult(data);
      if (!uploadCaption && data.suggestedCaption) {
        setUploadCaption(data.suggestedCaption);
      }
    } catch (err) {
      setAiError(err instanceof Error ? err.message : 'Photo verification failed.');
    } finally {
      setAiLoading(false);
    }
  }

  async function handlePublishOwnerPost(approved: boolean) {
    if (!uploadPreview || !uploadTitle.trim()) return;
    let mediaUrl: string;
    try {
      // Stored as a file on the server, not inside the menu data.
      mediaUrl = await uploadOwnerPhoto(ownerToken, uploadPreview);
    } catch (err) {
      setAiError(err instanceof Error ? err.message : 'Could not upload the photo.');
      return;
    }
    const next = addOwnerSocialPost(cms, {
      platform: 'instagram',
      title: uploadTitle.trim(),
      caption: uploadCaption.trim() || 'Fresh from Casa Street London.',
      mediaUrl,
      mediaAlt: `${uploadTitle.trim()} — owner-supplied Casa Street photograph`,
      mediaType: 'image',
      postUrl: VERIFIED_INSTAGRAM_URL,
      approved,
      ownerSupplied: true,
      verifiedByAi: Boolean(aiResult?.belongsToCasaStreet),
      aspectLabel: approved ? 'Instagram · Owner Approved' : 'Draft · Awaiting Approval',
    });
    if (await applyCmsUpdate(next)) {
      setUploadTitle('');
      setUploadCaption('');
      setUploadPreview(null);
      setAiResult(null);
    }
  }

  return (
    <div className="fixed inset-0 z-[60] bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="owner-studio-title"
        tabIndex={-1}
        className="w-full max-w-5xl bg-[#FAFAF7] text-[#141413] rounded-xl border border-[#D4CFC2] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="bg-[#141413] text-white px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-[#F59E0B] shrink-0" aria-hidden="true" />
            <div>
              <p className="text-xs text-neutral-400">Casa Street CMS · Approval Workflow</p>
              <h2
                id="owner-studio-title"
                className="font-display text-xl sm:text-2xl font-bold uppercase tracking-tight"
              >
                Owner Publishing &amp; Verification Studio
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {ownerToken && (
              <button
                type="button"
                onClick={onLock}
                className="inline-flex items-center gap-1.5 min-h-11 px-3 rounded-md text-xs font-semibold uppercase tracking-wider text-neutral-300 hover:text-white hover:bg-white/10"
              >
                <Lock className="w-4 h-4" aria-hidden="true" />
                <span className="hidden sm:inline">Lock</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close Owner Studio"
              className="w-11 h-11 inline-flex items-center justify-center rounded-md text-neutral-300 hover:text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {__CASA_STATIC_HOSTING__ ? (
          <div className="p-6 sm:p-10 space-y-4 overflow-y-auto">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-1" aria-hidden="true" />
              <div className="space-y-2 max-w-2xl">
                <h3 className="font-display text-2xl font-bold uppercase">Admin not available on this hosting</h3>
                <p className="text-sm text-neutral-700">{STATIC_HOSTING_MESSAGE}</p>
                <p className="text-sm text-neutral-700">
                  To edit dishes, prices and photos from here, the site needs a server with storage.
                  See &ldquo;Hosting&rdquo; in the README for the options.
                </p>
              </div>
            </div>
          </div>
        ) : !ownerToken ? (
          <form onSubmit={handleUnlock} className="p-6 sm:p-10 space-y-5 overflow-y-auto">
            <div className="flex items-start gap-3">
              <KeyRound className="w-6 h-6 text-[#C8281E] shrink-0 mt-1" aria-hidden="true" />
              <div className="space-y-1">
                <h3 className="font-display text-2xl font-bold uppercase">Owner passcode required</h3>
                <p className="text-sm text-neutral-700 max-w-lg">
                  Enter the passcode set in the server&apos;s <code>OWNER_CMS_TOKEN</code> secret to
                  review drafts and publish changes. Visitors cannot change anything on the site.
                </p>
              </div>
            </div>
            <div className="max-w-md space-y-2">
              <label htmlFor="owner-passcode" className="block text-xs font-semibold">
                Passcode
              </label>
              <input
                id="owner-passcode"
                type="password"
                autoComplete="current-password"
                data-autofocus
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className="w-full min-h-11 px-3 py-2 text-sm border border-[#D4CFC2] rounded-md bg-white"
              />
              {unlockError && (
                <p role="alert" className="text-sm text-red-700">
                  {unlockError}
                </p>
              )}
            </div>
            <button
              type="submit"
              disabled={unlocking || !passcode.trim()}
              className="inline-flex items-center gap-2 min-h-11 px-5 bg-[#141413] hover:bg-[#C8281E] disabled:opacity-45 text-white text-xs font-semibold uppercase tracking-wider rounded-md"
            >
              {unlocking ? (
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
              ) : (
                <KeyRound className="w-4 h-4" aria-hidden="true" />
              )}
              <span>Unlock Owner Studio</span>
            </button>
          </form>
        ) : (
        <>
        {saveError && (
          <div role="alert" className="px-6 py-3 bg-red-50 border-b border-red-200 text-sm text-red-800 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
            <span>{saveError}</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="px-6 py-3 bg-[#F1EFEA] border-b border-[#E4E0D5] flex items-center gap-2 overflow-x-auto">
          {[
            { id: 'menuEditor', label: 'Edit Menu' },
            { id: 'halal', label: 'Halal' },
            { id: 'categories', label: 'Drafts' },
            { id: 'socialLinks', label: 'Social Links' },
            { id: 'socialFeed', label: 'Follow Feed' },
            { id: 'schema', label: 'Structured Data' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as StudioTab)}
              aria-pressed={activeTab === tab.id}
              className={`min-h-10 px-3.5 py-2 text-xs font-semibold uppercase tracking-wider rounded-md transition-colors whitespace-nowrap shrink-0 ${
                activeTab === tab.id
                  ? 'bg-[#141413] text-white'
                  : 'bg-white border border-[#D4CFC2] text-neutral-700 hover:text-[#141413]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB: Menu editor (add / edit / hide / delete dishes) */}
          {activeTab === 'menuEditor' && (
            <MenuEditor
              cms={cms}
              ownerToken={ownerToken}
              saving={saving}
              applyCmsUpdate={applyCmsUpdate}
            />
          )}

          {/* TAB 1: Menu Categories & French Tacos Confirmation Gate */}
          {activeTab === 'categories' && (
            <div className="space-y-6">
              {frenchTacosCategory && (
                <div className="rounded-xl border border-[#D4CFC2] bg-white p-6 space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-[#E4E0D5] pb-4">
                    <div className="space-y-1">
                      <p className="text-xs font-semibold uppercase tracking-wider text-[#C8281E]">
                        {frenchTacosCategory.published
                          ? 'Published Live on Menu'
                          : 'Unpublished Draft · Held Until Owner Confirms'}
                      </p>
                      <h3 className="font-display text-3xl font-bold uppercase">
                        French Tacos Product Section Preview
                      </h3>
                    </div>

                    <span
                      className={`text-xs font-mono font-semibold uppercase tracking-wider ${
                        frenchTacosCategory.published ? 'text-emerald-700' : 'text-amber-800'
                      }`}
                    >
                      {frenchTacosCategory.published ? 'Published' : 'Unpublished Draft'}
                    </span>
                  </div>

                  <div className="rounded-lg bg-[#F1EFEA] border border-[#E4E0D5] p-4 flex items-start gap-3 text-sm text-neutral-800">
                    <AlertTriangle
                      className="w-5 h-5 text-[#C8281E] shrink-0 mt-0.5"
                      aria-hidden="true"
                    />
                    <p>{frenchTacosCategory.warningNote}</p>
                  </div>

                  {/* Visually compelling French Tacos preview card */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center bg-[#141413] text-white rounded-xl overflow-hidden p-4">
                    <div className="md:col-span-5 aspect-[4/3] rounded-lg overflow-hidden bg-black">
                      <img
                        src={frenchTacosCategory.items[0].image}
                        alt={frenchTacosCategory.items[0].imageAlt}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="md:col-span-7 space-y-2 p-2">
                      <p className="text-xs text-[#F59E0B]">
                        Draft Preview · {frenchTacosCategory.items[0].breadOrVessel}
                      </p>
                      <h4 className="font-display text-3xl font-bold uppercase">
                        {frenchTacosCategory.items[0].name}
                      </h4>
                      <p className="text-sm text-neutral-300 leading-relaxed">
                        {frenchTacosCategory.description}
                      </p>
                    </div>
                  </div>

                  {/* Approval Action */}
                  {!frenchTacosCategory.published ? (
                    <div className="space-y-3 pt-2">
                      <label className="flex items-start gap-2.5 text-sm text-neutral-800 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={frenchTacosAck}
                          onChange={(e) => setFrenchTacosAck(e.target.checked)}
                          className="mt-1 w-4 h-4 accent-[#C8281E]"
                        />
                        <span>
                          I confirm as Casa Street&apos;s owner that Casa Street prepares and sells
                          French Tacos (distinct from The Taco House) and approve publishing this
                          section.
                        </span>
                      </label>
                      <button
                        type="button"
                        disabled={!frenchTacosAck || saving}
                        onClick={() =>
                          void applyCmsUpdate(
                            confirmAndPublishCategory(cms, 'french-tacos', 'Casa Street Owner')
                          )
                        }
                        className="inline-flex items-center gap-2 min-h-11 px-5 py-2.5 bg-[#C8281E] hover:bg-[#AD2017] disabled:opacity-45 text-white text-xs font-semibold uppercase tracking-wider rounded-md"
                      >
                        <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                        <span>Confirm &amp; Publish French Tacos</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => {
                        setFrenchTacosAck(false);
                        void applyCmsUpdate(
                          unpublishCategory(cms, 'french-tacos', 'Casa Street Owner')
                        );
                      }}
                      className="inline-flex items-center gap-2 min-h-11 px-5 py-2.5 bg-[#141413] hover:bg-neutral-800 text-white text-xs font-semibold uppercase tracking-wider rounded-md"
                    >
                      <EyeOff className="w-4 h-4" aria-hidden="true" />
                      <span>Return French Tacos to Unpublished Draft</span>
                    </button>
                  )}
                </div>
              )}

              {/* All Menu Categories Summary */}
              <div className="space-y-3">
                <h4 className="font-display text-xl font-bold uppercase">
                  Published Menu Hierarchy
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {cms.menuCategories.map((cat) => (
                    <div
                      key={cat.id}
                      className="rounded-lg border border-[#E4E0D5] bg-white p-4 flex items-center justify-between gap-3"
                    >
                      <div>
                        <p className="text-xs text-neutral-500">
                          {cat.priority.toUpperCase()} · {cat.items.length} item(s)
                        </p>
                        <p className="font-semibold text-sm text-[#141413]">{cat.title}</p>
                      </div>
                      <span className="text-xs font-mono text-neutral-700">
                        {cat.published ? 'Live' : 'Draft'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: Halal messaging (owner-controlled) */}
          {activeTab === 'halal' && (
            <div className="space-y-6">
              <div className="rounded-xl border border-[#D4CFC2] bg-white p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-1">
                    <p
                      className={`text-xs font-semibold uppercase tracking-wider ${
                        halalDisplay.show ? 'text-emerald-700' : 'text-amber-800'
                      }`}
                    >
                      {halalDisplay.show ? 'Live on the website' : 'Hidden from the website'}
                    </p>
                    <h3 className="font-display text-3xl font-bold uppercase">Halal food messaging</h3>
                    <p className="text-sm text-neutral-700 max-w-xl">
                      Controls the 100% HALAL badge in the hero, the &ldquo;Halal Moroccan Street
                      Food&rdquo; and &ldquo;100% halal meat &amp; chicken&rdquo; wording, halal tags
                      on dishes, the About and footer copy, and halal details in Google structured
                      data. No certification wording is shown unless you turn it on below.
                    </p>
                  </div>
                  {halalDisplay.show && <HalalBadge />}
                </div>

                {!halalDisplay.show ? (
                  <div className="space-y-3 pt-2">
                    <label className="flex items-start gap-2.5 text-sm text-neutral-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={halalAck}
                        onChange={(e) => setHalalAck(e.target.checked)}
                        className="mt-1 w-4 h-4 accent-[#1f6b45]"
                      />
                      <span>
                        I confirm as Casa Street&apos;s owner that the meat and chicken Casa Street
                        serves are 100% halal and approve showing this on the website.
                      </span>
                    </label>
                    <button
                      type="button"
                      disabled={!halalAck || saving}
                      onClick={() => void applyCmsUpdate(setHalalConfirmation(cms, true))}
                      className="inline-flex items-center gap-2 min-h-11 px-5 bg-[#1f6b45] hover:bg-[#17553a] disabled:opacity-45 text-white text-xs font-semibold uppercase tracking-wider rounded-md"
                    >
                      <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                      <span>Show halal messaging</span>
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => {
                      setHalalAck(false);
                      void applyCmsUpdate(setHalalConfirmation(cms, false));
                    }}
                    className="inline-flex items-center gap-2 min-h-11 px-5 bg-[#141413] hover:bg-neutral-800 text-white text-xs font-semibold uppercase tracking-wider rounded-md"
                  >
                    <EyeOff className="w-4 h-4" aria-hidden="true" />
                    <span>Hide halal messaging</span>
                  </button>
                )}
              </div>

              <div className="rounded-xl border border-[#E4E0D5] bg-white p-6 space-y-4">
                <h4 className="font-display text-xl font-bold uppercase">Halal certificate (optional)</h4>
                <p className="text-sm text-neutral-700">
                  Off by default. Only tick this if you want certification mentioned on the site
                  (it then says &ldquo;certified&rdquo;, or &ldquo;certified by &hellip;&rdquo; if
                  you name the body) and optionally link to the certificate.
                </p>
                <label className="flex items-center gap-2.5 text-sm text-neutral-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={certForm.certified}
                    disabled={!halalDisplay.show}
                    onChange={(e) => setCertForm((f) => ({ ...f, certified: e.target.checked }))}
                    className="w-4 h-4 accent-[#1f6b45]"
                  />
                  <span>Casa Street holds a halal certificate</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="halal-body" className="block text-xs font-semibold mb-1">
                      Certifying body (optional)
                    </label>
                    <input
                      id="halal-body"
                      type="text"
                      maxLength={80}
                      value={certForm.certificationBody}
                      onChange={(e) => setCertForm((f) => ({ ...f, certificationBody: e.target.value }))}
                      className="w-full min-h-11 px-3 py-2 text-sm border border-[#D4CFC2] rounded-md"
                    />
                  </div>
                  <div>
                    <label htmlFor="halal-url" className="block text-xs font-semibold mb-1">
                      Certificate link (https://, optional)
                    </label>
                    <input
                      id="halal-url"
                      type="url"
                      value={certForm.certificateUrl}
                      onChange={(e) => setCertForm((f) => ({ ...f, certificateUrl: e.target.value }))}
                      className="w-full min-h-11 px-3 py-2 text-sm border border-[#D4CFC2] rounded-md"
                    />
                  </div>
                </div>
                {certError && <p className="text-xs text-red-700">{certError}</p>}
                <button
                  type="button"
                  disabled={saving}
                  onClick={handleSaveCertification}
                  className="inline-flex items-center gap-2 min-h-11 px-5 bg-[#141413] hover:bg-[#1f6b45] disabled:opacity-45 text-white text-xs font-semibold uppercase tracking-wider rounded-md"
                >
                  Save certificate details
                </button>
              </div>

              <div className="space-y-3">
                <h4 className="font-display text-xl font-bold uppercase">Halal tags on dishes</h4>
                <p className="text-sm text-neutral-700">
                  Tagged dishes show a halal label on the menu while halal messaging is live.
                </p>
                <div className="divide-y divide-[#E4E0D5] border border-[#E4E0D5] rounded-xl bg-white">
                  {cms.menuCategories.flatMap((cat) =>
                    cat.items.map((item) => (
                      <label
                        key={item.id}
                        className="flex items-center justify-between gap-4 px-4 py-3 text-sm cursor-pointer"
                      >
                        <span>
                          <span className="font-semibold text-[#141413]">{item.name}</span>
                          <span className="block text-xs text-neutral-500">
                            {cat.title}
                            {!cat.published ? ' · draft' : ''}
                          </span>
                        </span>
                        <input
                          type="checkbox"
                          checked={item.halal === true}
                          disabled={saving}
                          onChange={(e) =>
                            void applyCmsUpdate(setMenuItemHalal(cms, item.id, e.target.checked))
                          }
                          className="w-5 h-5 accent-[#1f6b45] shrink-0"
                        />
                      </label>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Social Links CMS Array */}
          {activeTab === 'socialLinks' && (
            <div className="space-y-4">
              <p className="text-sm text-neutral-700">
                TikTok, Facebook, and WhatsApp remain hidden from public navigation, footer, and
                FOLLOW THE FLAVOUR until an official Casa Street URL or phone number is verified
                below.
              </p>

              <div className="space-y-3">
                {cms.socialLinks.map((link) => (
                  <div
                    key={link.id}
                    className="rounded-xl border border-[#E4E0D5] bg-white p-5 space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-xs text-neutral-500">
                          Placement: {link.placement.join(' · ')}
                        </p>
                        <h3 className="font-display text-2xl font-bold uppercase">
                          {link.label}
                        </h3>
                      </div>

                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider ${
                          link.verified ? 'text-emerald-700' : 'text-neutral-600'
                        }`}
                      >
                        {link.verified ? (
                          <>
                            <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>Verified &amp; Public</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>Hidden Until Verified</span>
                          </>
                        )}
                      </span>
                    </div>

                    {link.lockedVerified ? (
                      <p className="text-xs font-mono text-neutral-600 break-all">{link.url}</p>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex flex-col sm:flex-row gap-2">
                          <label htmlFor={`social-input-${link.id}`} className="sr-only">
                            Official {link.label} URL or number
                          </label>
                          <input
                            id={`social-input-${link.id}`}
                            type="text"
                            value={linkInputs[link.id] ?? link.url}
                            onChange={(e) =>
                              setLinkInputs((prev) => ({ ...prev, [link.id]: e.target.value }))
                            }
                            placeholder={
                              link.platform === 'whatsapp'
                                ? '+44 7700 900123 or https://wa.me/447700900123'
                                : link.platform === 'tiktok'
                                  ? 'https://www.tiktok.com/@casastreetldn'
                                  : 'https://www.facebook.com/casastreetldn'
                            }
                            className="flex-1 min-h-10 px-3 py-2 text-sm border border-[#D4CFC2] rounded-md"
                          />

                          <button
                            type="button"
                            disabled={saving}
                            aria-label={`Verify and publish ${link.label}`}
                            onClick={() => handleVerifySocial(link.id)}
                            className="min-h-10 px-4 py-2 bg-[#141413] hover:bg-[#C8281E] text-white text-xs font-semibold uppercase tracking-wider rounded-md whitespace-nowrap"
                          >
                            Verify &amp; Publish
                          </button>

                          {link.verified && (
                            <button
                              type="button"
                              disabled={saving}
                              aria-label={`Hide ${link.label}`}
                              onClick={() =>
                                void applyCmsUpdate(unverifySocialLink(cms, link.id))
                              }
                              className="min-h-10 px-3 py-2 border border-[#D4CFC2] hover:border-[#141413] text-xs font-semibold uppercase tracking-wider rounded-md whitespace-nowrap"
                            >
                              Hide
                            </button>
                          )}
                        </div>

                        {linkErrors[link.id] && (
                          <p className="text-xs text-red-700">{linkErrors[link.id]}</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: FOLLOW THE FLAVOUR Queue + Owner Photo Verifier */}
          {activeTab === 'socialFeed' && (
            <div className="space-y-6">
              {/* Upload & Verify New Owner Photo */}
              <div className="rounded-xl border border-[#E4E0D5] bg-white p-5 space-y-4">
                <h3 className="font-display text-2xl font-bold uppercase">
                  Upload &amp; Verify Owner Product Photo
                </h3>
                <p className="text-sm text-neutral-700">
                  Submit authentic Casa Street photography and run our Gemini Photo Verifier to
                  ensure no external vendor photos enter the gallery.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="owner-post-title" className="block text-xs font-semibold mb-1">
                      Post Title
                    </label>
                    <input
                      id="owner-post-title"
                      type="text"
                      value={uploadTitle}
                      onChange={(e) => setUploadTitle(e.target.value)}
                      placeholder="e.g. Marrakesh Charcoal Khobz"
                      className="w-full px-3 py-2 text-sm border border-[#D4CFC2] rounded-md"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="owner-post-caption"
                      className="block text-xs font-semibold mb-1"
                    >
                      Caption
                    </label>
                    <input
                      id="owner-post-caption"
                      type="text"
                      value={uploadCaption}
                      onChange={(e) => setUploadCaption(e.target.value)}
                      placeholder="Freshly pulled off the grill"
                      className="w-full px-3 py-2 text-sm border border-[#D4CFC2] rounded-md"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <label className="inline-flex items-center gap-2 min-h-10 px-4 py-2 bg-[#141413] hover:bg-[#C8281E] text-white text-xs font-semibold uppercase tracking-wider rounded-md cursor-pointer">
                    <Upload className="w-4 h-4" aria-hidden="true" />
                    <span>Select Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleOwnerPhotoSelect}
                      className="sr-only"
                    />
                  </label>

                  {uploadPreview && (
                    <button
                      type="button"
                      disabled={aiLoading}
                      onClick={() => void handleVerifyPhotoWithAi()}
                      className="inline-flex items-center gap-2 min-h-10 px-4 py-2 border border-[#141413] text-xs font-semibold uppercase tracking-wider rounded-md"
                    >
                      {aiLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                      ) : (
                        <Camera className="w-4 h-4" aria-hidden="true" />
                      )}
                      <span>Verify Photo with Gemini</span>
                    </button>
                  )}
                </div>

                {uploadPreview && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <img
                      src={uploadPreview}
                      alt="Owner upload preview"
                      className="aspect-[4/3] w-full object-cover rounded-lg border border-[#E4E0D5]"
                    />
                    <div className="space-y-3">
                      {aiError && <p className="text-xs text-red-700">{aiError}</p>}
                      {aiResult && (
                        <div className="text-xs space-y-1 bg-[#F1EFEA] p-3 rounded-lg border border-[#E4E0D5]">
                          <p className="font-semibold">
                            Dish: {aiResult.detectedDish} ({aiResult.recommendedCategory})
                          </p>
                          <p>
                            Casa Street Verified:{' '}
                            <strong>{aiResult.belongsToCasaStreet ? 'Yes' : 'Needs Review'}</strong>
                          </p>
                          <p>{aiResult.qualityVerdict}</p>
                        </div>
                      )}
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          disabled={!uploadTitle.trim() || saving}
                          onClick={() => void handlePublishOwnerPost(true)}
                          className="px-4 py-2 bg-[#C8281E] hover:bg-[#AD2017] disabled:opacity-45 text-white text-xs font-semibold uppercase tracking-wider rounded-md"
                        >
                          Approve &amp; Publish
                        </button>
                        <button
                          type="button"
                          disabled={!uploadTitle.trim() || saving}
                          onClick={() => void handlePublishOwnerPost(false)}
                          className="px-4 py-2 border border-[#D4CFC2] text-xs font-semibold uppercase tracking-wider rounded-md"
                        >
                          Save as Draft
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Existing Posts Approval Queue */}
              <div className="space-y-3">
                <h4 className="font-display text-xl font-bold uppercase">
                  Social Content Queue ({cms.socialPosts.length})
                </h4>
                {cms.socialPosts.map((post) => (
                  <div
                    key={post.id}
                    className="rounded-xl border border-[#E4E0D5] bg-white p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={post.mediaUrl}
                        alt={post.mediaAlt}
                        referrerPolicy="no-referrer"
                        className="w-20 h-16 object-cover rounded-md shrink-0 bg-neutral-200"
                      />
                      <div>
                        <p className="text-xs text-neutral-500">
                          {post.aspectLabel} · {post.approved ? 'Approved' : 'Draft'}
                        </p>
                        <p className="font-semibold text-sm text-[#141413]">{post.title}</p>
                        <p className="text-xs text-neutral-600 line-clamp-1">{post.caption}</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={saving}
                      onClick={() =>
                        void applyCmsUpdate(
                          toggleSocialPostApproval(cms, post.id, !post.approved)
                        )
                      }
                      className={`px-3.5 py-2 text-xs font-semibold uppercase tracking-wider rounded-md whitespace-nowrap shrink-0 ${
                        post.approved
                          ? 'border border-[#D4CFC2] text-neutral-800 hover:border-[#141413]'
                          : 'bg-[#C8281E] hover:bg-[#AD2017] text-white'
                      }`}
                    >
                      {post.approved ? 'Move to Draft' : 'Approve & Show'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: Verified Structured Data & Audit Log */}
          {activeTab === 'schema' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-display text-2xl font-bold uppercase">
                    Live Verified Schema.org JSON-LD
                  </h3>
                  <p className="text-sm text-neutral-600">
                    Automatically excludes unpublished categories and unverified social URLs.
                  </p>
                </div>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => void handleReset()}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-[#D4CFC2] hover:border-[#141413] text-xs font-semibold uppercase tracking-wider rounded-md"
                >
                  <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Reset Defaults</span>
                </button>
              </div>

              <pre className="p-4 rounded-xl bg-[#141413] text-neutral-200 text-xs font-mono overflow-x-auto max-h-72">
                {jsonLdPreview}
              </pre>

              <div className="space-y-2">
                <h4 className="font-display text-xl font-bold uppercase">Approval Audit Log</h4>
                <div className="divide-y divide-[#E4E0D5] border border-[#E4E0D5] rounded-xl bg-white">
                  {cms.approvalLog.map((entry) => (
                    <div
                      key={entry.id}
                      className="px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs"
                    >
                      <div>
                        <span className="font-semibold text-[#141413]">{entry.action}</span>
                        <span aria-hidden="true" className="mx-1.5 text-neutral-400">·</span>
                        <span className="text-neutral-700">{entry.target}</span>
                      </div>
                      <span className="font-mono text-neutral-500">
                        {entry.actor} · {entry.timestamp.slice(0, 10)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
        </>
        )}
      </div>
    </div>
  );
}
