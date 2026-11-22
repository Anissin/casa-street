import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { SignatureMenuSection } from './components/SignatureMenuSection';
import { AboutSection } from './components/AboutSection';
import { FollowTheFlavourSection } from './components/FollowTheFlavourSection';
import { LocationOrderSection } from './components/LocationOrderSection';
import { Footer } from './components/Footer';
import { MobileStickyBar } from './components/MobileStickyBar';
import { type CmsState, createInitialCmsState, normalizeCmsState } from './lib/cms';
import { buildRestaurantJsonLd } from './lib/structuredData';

// Owner-only tooling is code-split so visitors never download it.
const OwnerCmsModal = lazy(() =>
  import('./components/OwnerCmsModal').then((m) => ({ default: m.OwnerCmsModal }))
);

export interface SaveResult {
  ok: boolean;
  error?: string;
}

const OWNER_TOKEN_KEY = 'casa-owner-token';

function readStoredToken(): string {
  try {
    return sessionStorage.getItem(OWNER_TOKEN_KEY) ?? '';
  } catch {
    return '';
  }
}

function storeToken(token: string) {
  try {
    if (token) sessionStorage.setItem(OWNER_TOKEN_KEY, token);
    else sessionStorage.removeItem(OWNER_TOKEN_KEY);
  } catch {
    // Storage unavailable (private mode): the token lives in memory only.
  }
}

async function readError(resp: Response): Promise<string> {
  try {
    const data = (await resp.json()) as { error?: string };
    return data.error || `Request failed (${resp.status}).`;
  } catch {
    return `Request failed (${resp.status}).`;
  }
}

export default function App() {
  const [cms, setCms] = useState<CmsState>(() => createInitialCmsState());
  const [ownerStudioOpen, setOwnerStudioOpen] = useState(false);
  const [ownerToken, setOwnerToken] = useState<string>(readStoredToken);

  // Sync owner-approved CMS state from the backend (validated client-side too).
  useEffect(() => {
    let active = true;
    fetch('/api/cms')
      .then((res) => (res.ok ? res.json() : null))
      .then((data: unknown) => {
        if (active && data) setCms(normalizeCmsState(data));
      })
      .catch(() => {
        // Keep the verified defaults when offline.
      });
    return () => {
      active = false;
    };
  }, []);

  // Keep Schema.org JSON-LD in <head> in sync with owner approvals.
  useEffect(() => {
    const scriptEl = document.getElementById('casa-jsonld');
    if (scriptEl) {
      scriptEl.textContent = JSON.stringify(buildRestaurantJsonLd(cms, window.location.origin));
    }
  }, [cms]);

  // Admin shortcut: Ctrl+Shift+C (Cmd+Shift+C on Mac). It only opens the
  // passcode screen — the passcode is what protects the admin.
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && !e.altKey && e.code === 'KeyC') {
        e.preventDefault();
        setOwnerStudioOpen(true);
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // Fallback for phones/tablets without a keyboard: open /#owner.
  useEffect(() => {
    const syncFromHash = () => {
      if (window.location.hash === '#owner') setOwnerStudioOpen(true);
    };
    syncFromHash();
    window.addEventListener('hashchange', syncFromHash);
    return () => window.removeEventListener('hashchange', syncFromHash);
  }, []);

  const closeOwnerStudio = useCallback(() => {
    setOwnerStudioOpen(false);
    if (window.location.hash === '#owner') {
      history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  }, []);

  function handleUnlock(token: string) {
    setOwnerToken(token);
    storeToken(token);
  }

  function handleLock() {
    setOwnerToken('');
    storeToken('');
  }

  async function handleUpdateCms(nextState: CmsState): Promise<SaveResult> {
    try {
      const resp = await fetch('/api/cms', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${ownerToken}` },
        body: JSON.stringify(nextState),
      });
      if (!resp.ok) {
        if (resp.status === 401) handleLock();
        return { ok: false, error: await readError(resp) };
      }
      setCms(normalizeCmsState(await resp.json()));
      return { ok: true };
    } catch {
      return { ok: false, error: 'Could not reach the server. Your change was not saved.' };
    }
  }

  async function handleResetCms(): Promise<SaveResult> {
    try {
      const resp = await fetch('/api/cms/reset', {
        method: 'POST',
        headers: { Authorization: `Bearer ${ownerToken}` },
      });
      if (!resp.ok) {
        if (resp.status === 401) handleLock();
        return { ok: false, error: await readError(resp) };
      }
      setCms(normalizeCmsState(await resp.json()));
      return { ok: true };
    } catch {
      return { ok: false, error: 'Could not reach the server. Nothing was reset.' };
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-cream text-ink">
      <a
        href="#menu"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-full focus:bg-saffron focus:px-5 focus:py-3 focus:text-sm focus:font-bold focus:text-ink"
      >
        Skip to menu
      </a>

      <Navbar cms={cms} />

      <main className="flex-1">
        <HeroSection cms={cms} />
        <SignatureMenuSection cms={cms} />
        <AboutSection cms={cms} />
        <FollowTheFlavourSection cms={cms} />
        <LocationOrderSection cms={cms} />
      </main>

      <Footer cms={cms} />

      <MobileStickyBar />

      {ownerStudioOpen && (
        <Suspense fallback={null}>
          <OwnerCmsModal
            cms={cms}
            ownerToken={ownerToken}
            onUnlock={handleUnlock}
            onLock={handleLock}
            onUpdateCms={handleUpdateCms}
            onResetCms={handleResetCms}
            onClose={closeOwnerStudio}
          />
        </Suspense>
      )}
    </div>
  );
}
