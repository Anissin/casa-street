import { useState, useRef, useEffect, type ChangeEvent, type FormEvent } from 'react';
import { Camera, Loader2, MessageSquare, Send, Upload, X, CheckCircle2, AlertTriangle } from 'lucide-react';
import { type CmsState } from '../lib/cms';

export interface ChatTurn {
  id: string;
  role: 'user' | 'model';
  text: string;
}

export interface PhotoAnalysisResult {
  detectedDish?: string;
  belongsToCasaStreet?: boolean;
  recommendedCategory?: string;
  qualityVerdict?: string;
  suggestedCaption?: string;
  vendorSeparationNote?: string;
}

interface KitchenAssistantModalProps {
  isOpen: boolean;
  initialTab: 'chat' | 'photo';
  cms: CmsState;
  onClose: () => void;
}

const STARTER_QUESTIONS = [
  'Compare Casablanca vs Tangier signature sandwiches',
  'Tell me about your flaky msemen wraps',
  'Do you serve traditional tagines too?',
];

export function KitchenAssistantModal({
  isOpen,
  initialTab,
  cms,
  onClose,
}: KitchenAssistantModalProps) {
  const [activeTab, setActiveTab] = useState<'chat' | 'photo'>(initialTab);
  const [messages, setMessages] = useState<ChatTurn[]>([
    {
      id: 'welcome-1',
      role: 'model',
      text: 'Marhaba! Welcome to Casa Street at The Food District (145–147 Edgware Road). Ask me about our oversized Casablanca, Tangier, Marrakesh, Rabat, and Fes sandwiches (£11.70–£12.75), Signature Firma Wrap, flaky Msemen, or ordering via Uber Eats & Deliveroo Paddington.',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const threadEndRef = useRef<HTMLDivElement>(null);

  // Photo analyzer state
  const [selectedPreview, setSelectedPreview] = useState<string | null>(null);
  const [selectedMimeType, setSelectedMimeType] = useState<string>('image/jpeg');
  const [contextNote, setContextNote] = useState('');
  const [photoLoading, setPhotoLoading] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [photoResult, setPhotoResult] = useState<PhotoAnalysisResult | null>(null);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab, isOpen]);

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, chatLoading]);

  if (!isOpen) return null;

  async function sendChatPrompt(prompt: string) {
    const trimmed = prompt.trim();
    if (!trimmed || chatLoading) return;

    const userTurn: ChatTurn = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: trimmed,
    };
    const nextHistory = [...messages, userTurn];
    setMessages(nextHistory);
    setInputText('');
    setChatError(null);
    setChatLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: nextHistory.map((m) => ({ role: m.role, text: m.text })),
        }),
      });
      const data = (await response.json()) as { reply?: string; error?: string };
      if (!response.ok) {
        throw new Error(data.error || 'Could not reach the Casa Street Kitchen Concierge.');
      }
      setMessages((prev) => [
        ...prev,
        {
          id: `model-${Date.now()}`,
          role: 'model',
          text: data.reply || 'Thanks for asking! Check our Uber Eats page for live menu items.',
        },
      ]);
    } catch (err) {
      setChatError(
        err instanceof Error ? err.message : 'Unable to get a response right now.'
      );
    } finally {
      setChatLoading(false);
    }
  }

  function handleChatSubmit(e: FormEvent) {
    e.preventDefault();
    void sendChatPrompt(inputText);
  }

  function handleFileUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoResult(null);
    setPhotoError(null);
    setSelectedMimeType(file.type || 'image/jpeg');

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setSelectedPreview(reader.result);
      }
    };
    reader.readAsDataURL(file);
  }

  async function useKitchenAssetForCheck(assetUrl: string, label: string) {
    setPhotoResult(null);
    setPhotoError(null);
    setContextNote(`Sample check: ${label}`);
    try {
      const resp = await fetch(assetUrl);
      const blob = await resp.blob();
      setSelectedMimeType(blob.type || 'image/jpeg');
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setSelectedPreview(reader.result);
        }
      };
      reader.readAsDataURL(blob);
    } catch {
      setPhotoError('Could not load sample image for analysis.');
    }
  }

  async function runPhotoAnalysis() {
    if (!selectedPreview || photoLoading) return;
    setPhotoLoading(true);
    setPhotoError(null);
    setPhotoResult(null);

    try {
      const response = await fetch('/api/analyze-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: selectedPreview,
          mimeType: selectedMimeType,
          contextNote,
        }),
      });
      const data = (await response.json()) as PhotoAnalysisResult & { error?: string };
      if (!response.ok) {
        throw new Error(data.error || 'Photo analysis failed.');
      }
      setPhotoResult(data);
    } catch (err) {
      setPhotoError(err instanceof Error ? err.message : 'Photo analysis failed.');
    } finally {
      setPhotoLoading(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Casa Street Kitchen Assistant"
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div className="w-full max-w-2xl bg-[#FAFAF7] text-[#141413] rounded-xl border border-[#D4CFC2] shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="bg-[#141413] text-white px-6 py-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs text-[#F59E0B] font-medium">Casa Street London</p>
            <h2 className="font-display text-2xl font-bold uppercase tracking-tight">
              Kitchen Concierge &amp; Dish Analyzer
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Kitchen Assistant"
            className="w-9 h-9 inline-flex items-center justify-center rounded-md text-neutral-300 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switcher */}
        <div className="px-6 py-3 bg-[#F1EFEA] border-b border-[#E4E0D5] flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('chat')}
            className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-md transition-colors ${
              activeTab === 'chat'
                ? 'bg-[#141413] text-white'
                : 'bg-white text-neutral-700 border border-[#D4CFC2] hover:text-[#141413]'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Kitchen Chat</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('photo')}
            className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-md transition-colors ${
              activeTab === 'photo'
                ? 'bg-[#141413] text-white'
                : 'bg-white text-neutral-700 border border-[#D4CFC2] hover:text-[#141413]'
            }`}
          >
            <Camera className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Dish Photo Check</span>
          </button>
        </div>

        {/* Tab 1: Multi-Turn Chat */}
        {activeTab === 'chat' && (
          <div className="flex-1 flex flex-col min-h-0">
            <div
              className="flex-1 overflow-y-auto p-6 space-y-4"
              aria-live="polite"
            >
              {messages.map((turn) => (
                <div
                  key={turn.id}
                  className={`flex ${turn.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-xl px-4 py-3 text-sm leading-relaxed ${
                      turn.role === 'user'
                        ? 'bg-[#C8281E] text-white'
                        : 'bg-white border border-[#E4E0D5] text-[#141413]'
                    }`}
                  >
                    {turn.text}
                  </div>
                </div>
              ))}

              {chatLoading && (
                <div className="flex justify-start">
                  <div className="inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm bg-white border border-[#E4E0D5] text-neutral-600">
                    <Loader2 className="w-4 h-4 animate-spin text-[#C8281E]" aria-hidden="true" />
                    <span>Checking the kitchen board...</span>
                  </div>
                </div>
              )}

              {chatError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-800">
                  {chatError}
                </div>
              )}

              <div ref={threadEndRef} />
            </div>

            <div className="px-6 py-3 bg-[#F1EFEA] border-t border-[#E4E0D5] space-y-3">
              <div className="flex flex-wrap gap-1.5">
                {STARTER_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => void sendChatPrompt(q)}
                    disabled={chatLoading}
                    className="px-2.5 py-1 text-xs bg-white hover:bg-[#141413] hover:text-white border border-[#D4CFC2] text-neutral-700 rounded-md transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>

              <form onSubmit={handleChatSubmit} className="flex items-center gap-2">
                <label htmlFor="casa-chat-input" className="sr-only">
                  Ask Casa Street a question
                </label>
                <input
                  id="casa-chat-input"
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Ask about Casablanca sandwiches, msemen wraps, or Uber Eats / Deliveroo..."
                  className="flex-1 min-h-11 px-3.5 py-2 text-sm bg-white border border-[#D4CFC2] rounded-md text-[#141413] placeholder:text-neutral-500"
                />
                <button
                  type="submit"
                  disabled={chatLoading || !inputText.trim()}
                  className="inline-flex items-center justify-center gap-1.5 min-h-11 px-4 py-2 bg-[#C8281E] hover:bg-[#AD2017] disabled:opacity-50 text-white text-xs font-semibold uppercase tracking-wider rounded-md transition-colors"
                >
                  <span>Send</span>
                  <Send className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Tab 2: Photo Understanding */}
        {activeTab === 'photo' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            <p className="text-sm text-neutral-700 leading-relaxed">
              Upload a dish photo (or pick a Casa Street kitchen sample below) to identify the
              sandwich or msemen wrap, confirm it belongs to Casa Street rather than another vendor,
              and generate an authentic social caption.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <label className="inline-flex items-center gap-2 min-h-11 px-4 py-2.5 bg-[#141413] hover:bg-[#C8281E] text-white text-xs font-semibold uppercase tracking-wider rounded-md cursor-pointer transition-colors">
                <Upload className="w-4 h-4" aria-hidden="true" />
                <span>Upload Dish Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="sr-only"
                />
              </label>

              <button
                type="button"
                onClick={() =>
                  void useKitchenAssetForCheck(
                    cms.brand.heroImage,
                    'Oversized Casablanca/Marrakesh Sandwich'
                  )
                }
                className="min-h-11 px-3.5 py-2 text-xs font-medium bg-white border border-[#D4CFC2] hover:border-[#141413] rounded-md"
              >
                Try Sample: Sandwich
              </button>

              <button
                type="button"
                onClick={() =>
                  void useKitchenAssetForCheck(
                    '/src/assets/images/msemen_wrap_signature_1795349697214.jpg',
                    'Flaky Msemen Wrap'
                  )
                }
                className="min-h-11 px-3.5 py-2 text-xs font-medium bg-white border border-[#D4CFC2] hover:border-[#141413] rounded-md"
              >
                Try Sample: Msemen
              </button>
            </div>

            {selectedPreview && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start bg-white border border-[#E4E0D5] rounded-xl p-4">
                <div className="aspect-[4/3] rounded-lg overflow-hidden bg-[#141413]">
                  <img
                    src={selectedPreview}
                    alt="Uploaded dish preview for Gemini analysis"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-3">
                  <div>
                    <label
                      htmlFor="photo-context-note"
                      className="block text-xs font-semibold text-neutral-700 mb-1"
                    >
                      Optional Kitchen Note
                    </label>
                    <input
                      id="photo-context-note"
                      type="text"
                      value={contextNote}
                      onChange={(e) => setContextNote(e.target.value)}
                      placeholder="e.g. Fresh khobz grill shot from pass"
                      className="w-full px-3 py-2 text-sm border border-[#D4CFC2] rounded-md"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => void runPhotoAnalysis()}
                    disabled={photoLoading}
                    className="w-full inline-flex items-center justify-center gap-2 min-h-11 px-4 py-2.5 bg-[#C8281E] hover:bg-[#AD2017] disabled:opacity-50 text-white text-xs font-semibold uppercase tracking-wider rounded-md"
                  >
                    {photoLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                        <span>Analyzing Image...</span>
                      </>
                    ) : (
                      <>
                        <Camera className="w-4 h-4" aria-hidden="true" />
                        <span>Analyze Dish Photo</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {photoError && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-800">
                {photoError}
              </div>
            )}

            {photoResult && (
              <div className="rounded-xl border border-[#E4E0D5] bg-white p-5 space-y-3">
                <div className="flex items-center justify-between gap-4 border-b border-[#E4E0D5] pb-3">
                  <div>
                    <p className="text-xs text-neutral-500">Detected Dish</p>
                    <h3 className="font-display text-2xl font-bold uppercase">
                      {photoResult.detectedDish || 'Moroccan Street Dish'}
                    </h3>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
                      photoResult.belongsToCasaStreet ? 'text-emerald-700' : 'text-amber-700'
                    }`}
                  >
                    {photoResult.belongsToCasaStreet ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                        <span>Casa Street Match</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-4 h-4" aria-hidden="true" />
                        <span>Hold / Vendor Check</span>
                      </>
                    )}
                  </span>
                </div>

                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div>
                    <dt className="text-xs text-neutral-500">Recommended Category</dt>
                    <dd className="font-medium text-[#141413] mt-0.5">
                      {photoResult.recommendedCategory || 'signature-sandwiches'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-neutral-500">Quality Verdict</dt>
                    <dd className="font-medium text-[#141413] mt-0.5">
                      {photoResult.qualityVerdict || 'Sharp street-food lighting'}
                    </dd>
                  </div>
                </dl>

                {photoResult.suggestedCaption && (
                  <div className="pt-2 border-t border-[#E4E0D5]">
                    <p className="text-xs text-neutral-500">Suggested Social Caption</p>
                    <p className="text-sm text-neutral-800 mt-1">{photoResult.suggestedCaption}</p>
                  </div>
                )}

                {photoResult.vendorSeparationNote && (
                  <p className="text-xs text-neutral-600">{photoResult.vendorSeparationNote}</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
