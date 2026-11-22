import { useState } from 'react';
import { ArrowUpRight, Instagram, Play, X, Share2, MessageCircle } from 'lucide-react';
import {
  type CmsState,
  type SocialPost,
  VERIFIED_INSTAGRAM_URL,
  getApprovedSocialPosts,
  getPublicSocialLinks,
} from '../lib/cms';

interface FollowTheFlavourSectionProps {
  cms: CmsState;
  onOpenOwnerStudio: () => void;
}

export function FollowTheFlavourSection({
  cms,
  onOpenOwnerStudio,
}: FollowTheFlavourSectionProps) {
  const approvedPosts = getApprovedSocialPosts(cms);
  const followLinks = getPublicSocialLinks(cms, 'follow');
  const [activeVideoPost, setActiveVideoPost] = useState<SocialPost | null>(null);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  return (
    <section
      id="follow-the-flavour"
      className="py-16 lg:py-24 bg-[#141413] text-white border-y border-white/10"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header & Verified Social Links */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#F59E0B]">
              Approved Kitchen Feed · @casastreetldn
            </p>
            <h2 className="font-display text-4xl sm:text-5xl font-extrabold uppercase tracking-tight text-white">
              FOLLOW THE FLAVOUR
            </h2>
            <p className="text-base text-neutral-300 leading-relaxed">
              Only owner-approved Casa Street sandwiches, msemen wraps, and verified social channels
              appear here—never unverified profiles or external vendor shots.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {followLinks.map((link) => {
              const isInstagram = link.platform === 'instagram';
              return (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-2 min-h-11 px-4 py-2.5 rounded-md text-xs font-semibold uppercase tracking-wider transition-colors whitespace-nowrap shrink-0 ${
                    isInstagram
                      ? 'bg-[#C8281E] hover:bg-[#AD2017] text-white'
                      : 'bg-white/10 hover:bg-white/15 border border-white/20 text-white'
                  }`}
                >
                  {link.platform === 'instagram' && (
                    <Instagram className="w-4 h-4" aria-hidden="true" />
                  )}
                  {link.platform === 'whatsapp' && (
                    <MessageCircle className="w-4 h-4 text-[#F59E0B]" aria-hidden="true" />
                  )}
                  {(link.platform === 'tiktok' || link.platform === 'facebook') && (
                    <Share2 className="w-4 h-4 text-[#F59E0B]" aria-hidden="true" />
                  )}
                  <span>{link.label}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                </a>
              );
            })}
          </div>
        </div>

        {/* Approved Social Grid */}
        {approvedPosts.length === 0 ? (
          <div className="rounded-xl border border-white/15 bg-[#1E1D1B] p-8 text-center space-y-3">
            <p className="text-neutral-300">No approved social features are currently published.</p>
            <button
              type="button"
              onClick={onOpenOwnerStudio}
              className="px-4 py-2 text-xs font-semibold uppercase tracking-wider bg-white/10 hover:bg-white/20 text-white rounded-md"
            >
              Review Drafts in Owner CMS
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {approvedPosts.map((post) => (
              <article
                key={post.id}
                className="group relative rounded-xl overflow-hidden border border-white/15 bg-[#1E1D1B] flex flex-col justify-between transition-transform duration-200 hover:-translate-y-1"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-[#181715]">
                  {!failedImages[post.id] ? (
                    <img
                      src={post.mediaUrl}
                      alt={post.mediaAlt}
                      referrerPolicy="no-referrer"
                      onError={() =>
                        setFailedImages((prev) => ({ ...prev, [post.id]: true }))
                      }
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#24221F] text-neutral-400 text-sm">
                      {post.title}
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

                  {post.mediaType === 'video' && (
                    <button
                      type="button"
                      onClick={() => setActiveVideoPost(post)}
                      aria-label={`Play kitchen reel preview for ${post.title}`}
                      className="absolute top-4 right-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-black/75 hover:bg-[#C8281E] text-white text-xs font-semibold uppercase tracking-wider border border-white/20 transition-colors"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
                      <span>Watch Reel</span>
                    </button>
                  )}

                  <div className="absolute inset-x-0 bottom-0 p-5 space-y-1">
                    <p className="text-xs text-neutral-300">{post.aspectLabel}</p>
                    <h3 className="font-display text-2xl font-bold uppercase tracking-tight text-white">
                      {post.title}
                    </h3>
                  </div>
                </div>

                <div className="p-5 flex flex-col justify-between gap-4 flex-1">
                  <p className="text-sm text-neutral-300 leading-relaxed">{post.caption}</p>

                  <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                    <span className="text-neutral-400">
                      Owner Supplied · Approved
                    </span>
                    <a
                      href={post.postUrl || VERIFIED_INSTAGRAM_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-white hover:text-[#F59E0B] font-semibold transition-colors whitespace-nowrap"
                    >
                      <span>View on Instagram</span>
                      <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* Video / Reel Preview Lightbox */}
      {activeVideoPost && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Reel preview: ${activeVideoPost.title}`}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div className="w-full max-w-xl bg-[#1A1917] border border-white/20 rounded-xl overflow-hidden text-white">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <div>
                <p className="text-xs text-[#F59E0B] font-medium">{activeVideoPost.aspectLabel}</p>
                <h4 className="font-display text-2xl font-bold uppercase">{activeVideoPost.title}</h4>
              </div>
              <button
                type="button"
                onClick={() => setActiveVideoPost(null)}
                aria-label="Close reel preview"
                className="w-9 h-9 inline-flex items-center justify-center rounded-md hover:bg-white/10 text-neutral-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative aspect-[4/3] bg-black overflow-hidden">
              {activeVideoPost.videoEmbedUrl ? (
                <video
                  src={activeVideoPost.videoEmbedUrl}
                  controls
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="relative w-full h-full">
                  <img
                    src={activeVideoPost.mediaUrl}
                    alt={activeVideoPost.mediaAlt}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover scale-105 animate-[pulse_4s_ease-in-out_infinite]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 flex flex-col justify-end p-6">
                    <p className="text-sm text-neutral-200">{activeVideoPost.caption}</p>
                    <p className="text-xs text-neutral-400 mt-1">
                      Watch full kitchen reels directly on @casastreetldn.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="px-5 py-4 flex items-center justify-between gap-4 border-t border-white/10">
              <span className="text-xs text-neutral-400">Casa Street Verified Channel</span>
              <a
                href={activeVideoPost.postUrl || VERIFIED_INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-[#C8281E] hover:bg-[#AD2017] text-white text-xs font-semibold uppercase tracking-wider"
              >
                <span>Open @casastreetldn</span>
                <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
