import { useEffect, useState } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { SignatureMenuSection } from './components/SignatureMenuSection';
import { FollowTheFlavourSection } from './components/FollowTheFlavourSection';
import { LocationOrderSection } from './components/LocationOrderSection';
import { Footer } from './components/Footer';
import { MobileStickyBar } from './components/MobileStickyBar';
import { KitchenAssistantModal } from './components/KitchenAssistantModal';
import { OwnerCmsModal } from './components/OwnerCmsModal';
import { type CmsState, createInitialCmsState } from './lib/cms';
import { buildRestaurantJsonLd } from './lib/structuredData';

export default function App() {
  const [cms, setCms] = useState<CmsState>(() => createInitialCmsState());
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [assistantTab, setAssistantTab] = useState<'chat' | 'photo'>('chat');
  const [ownerStudioOpen, setOwnerStudioOpen] = useState(false);

  // Sync CMS state from backend
  useEffect(() => {
    let active = true;
    fetch('/api/cms')
      .then((res) => (res.ok ? res.json() : null))
      .then((data: CmsState | null) => {
        if (active && data && Array.isArray(data.menuCategories)) {
          setCms(data);
        }
      })
      .catch(() => {
        // Keep initial verified state on offline/boot
      });
    return () => {
      active = false;
    };
  }, []);

  // Keep Schema.org JSON-LD in <head> synced with verified CMS approvals
  useEffect(() => {
    const scriptEl = document.getElementById('casa-jsonld');
    if (scriptEl) {
      scriptEl.textContent = JSON.stringify(buildRestaurantJsonLd(cms), null, 2);
    }
  }, [cms]);

  // Escape key dismissal for open modals
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setAssistantOpen(false);
        setOwnerStudioOpen(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  async function handleUpdateCms(nextState: CmsState) {
    setCms(nextState);
    try {
      const resp = await fetch('/api/cms', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nextState),
      });
      if (resp.ok) {
        const saved = (await resp.json()) as CmsState;
        setCms(saved);
      }
    } catch {
      // Optimistic local state remains active
    }
  }

  async function handleResetCms() {
    try {
      const resp = await fetch('/api/cms/reset', { method: 'POST' });
      if (resp.ok) {
        const fresh = (await resp.json()) as CmsState;
        setCms(fresh);
        return;
      }
    } catch {
      // Fallback below
    }
    setCms(createInitialCmsState());
  }

  function openConcierge(tab: 'chat' | 'photo' = 'chat') {
    setAssistantTab(tab);
    setAssistantOpen(true);
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF7] text-[#141413]">
      <Navbar
        onOpenConcierge={() => openConcierge('chat')}
        onOpenOwnerStudio={() => setOwnerStudioOpen(true)}
      />

      <main className="flex-1">
        <HeroSection
          cms={cms}
          onOpenConcierge={() => openConcierge('chat')}
        />

        <SignatureMenuSection cms={cms} />

        <FollowTheFlavourSection
          cms={cms}
          onOpenOwnerStudio={() => setOwnerStudioOpen(true)}
        />

        <LocationOrderSection
          cms={cms}
          onOpenConcierge={() => openConcierge('chat')}
          onOpenPhotoAnalyzer={() => openConcierge('photo')}
          onOpenOwnerStudio={() => setOwnerStudioOpen(true)}
        />
      </main>

      <Footer
        cms={cms}
        onOpenOwnerStudio={() => setOwnerStudioOpen(true)}
        onOpenConcierge={() => openConcierge('chat')}
      />

      <MobileStickyBar />

      <KitchenAssistantModal
        isOpen={assistantOpen}
        initialTab={assistantTab}
        cms={cms}
        onClose={() => setAssistantOpen(false)}
      />

      <OwnerCmsModal
        isOpen={ownerStudioOpen}
        cms={cms}
        onUpdateCms={handleUpdateCms}
        onResetCms={handleResetCms}
        onClose={() => setOwnerStudioOpen(false)}
      />
    </div>
  );
}
