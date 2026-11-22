import { useRef, useState } from 'react';
import { ArrowUpRight, Instagram, MessageCircle, Play, Share2, X } from 'lucide-react';
import {
  type CmsState,
  type SocialPost,
  VERIFIED_INSTAGRAM_URL,
  getApprovedSocialPosts,
  getPublicSocialLinks,
} from '../lib/cms';
import { useDialog } from '../lib/useDialog';

function ReelDialog({ post, onClose }: { post: SocialPost; onClose: () => void }) {
  const dialogRef = useRef<HTMLDivElement>(null);
  useDialog(true, onClose, dialogRef);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="reel-title"
        className="w-full max-w-xl overflow-hidden rounded-2xl border border-white/20 bg-ink-2 text-white"
      >
        <div className="flex items-center justify-between gap-4 border-b border-white/10 px-5 py-4">
          <div>
            <p className="text-xs font-medium text-saffron">{post.aspectLabel}</p>
            <h3 id="reel-title" className="font-display text-2xl font-bold uppercase">
              {post.title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close video"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full text-neutral-300 hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <div className="relative aspect-[4/3] bg-black">
          <video
            src={post.videoEmbedUrl}
            controls
            playsInline
            preload="metadata"
            className="h-full w-full object-cover"
          />
        </div>
        <div className="flex items-center justify-between gap-4 border-t border-white/10 px-5 py-4">
          <p className="text-sm text-neutral-300">{post.caption}</p>
          <a
            href={post.postUrl || VERIFIED_INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full bg-casa px-4 text-xs font-bold uppercase tracking-wider text-white hover:bg-casa-dark"
          >
            <span>Instagram</span>
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        </div>
      </div>
    </div>
  );
}

export function FollowTheFlavourSection({ cms }: { cms: CmsState }) {
  const approvedPosts = getApprovedSocialPosts(cms);
  const followLinks = getPublicSocialLinks(cms, 'follow');
  const [activeVideoPost, setActiveVideoPost] = useState<SocialPost | null>(null);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  return (
    <section
      id="follow-the-flavour"
      aria-labelledby="follow-heading"
      className="bg-ink py-16 text-white lg:py-24"
    >
      <div className="mx-auto max-w-7xl space-y-10 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-2xl space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-saffron">
              @casastreetldn on Instagram
            </p>
            <h2
              id="follow-heading"
              className="font-display text-5xl font-extrabold uppercase leading-[0.92] tracking-tight sm:text-6xl"
            >
              Follow the Flavour
            </h2>
            <p className="text-base leading-relaxed text-neutral-300">
              See what&apos;s coming off the grill at Casa Street and follow us on Instagram for
              the latest from Edgware Road.
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
                  className={`inline-flex min-h-12 shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-6 text-xs font-bold uppercase tracking-wider transition ${
                    isInstagram
                      ? 'bg-casa text-white shadow-lg shadow-casa/30 hover:-translate-y-0.5 hover:bg-casa-dark'
                      : 'border border-white/20 bg-white/5 text-white hover:bg-white/10'
                  }`}
                >
                  {link.platform === 'instagram' && <Instagram className="h-4 w-4" aria-hidden="true" />}
                  {link.platform === 'whatsapp' && (
                    <MessageCircle className="h-4 w-4 text-saffron" aria-hidden="true" />
                  )}
                  {(link.platform === 'tiktok' || link.platform === 'facebook') && (
                    <Share2 className="h-4 w-4 text-saffron" aria-hidden="true" />
                  )}
                  <span>{isInstagram ? 'Follow @casastreetldn' : link.label}</span>
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {approvedPosts.map((post) => {
            const hasVideo = post.mediaType === 'video' && Boolean(post.videoEmbedUrl);
            return (
              <article
                key={post.id}
                className="group relative flex flex-col overflow-hidden rounded-2xl bg-ink-2 ring-1 ring-white/10 transition duration-300 hover:-translate-y-1 hover:ring-white/25"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-ink-3">
                  {!failedImages[post.id] ? (
                    <img
                      src={post.mediaUrl}
                      alt={post.mediaAlt}
                      width={960}
                      height={720}
                      loading="lazy"
                      decoding="async"
                      sizes="(min-width: 1024px) 400px, (min-width: 768px) 46vw, 92vw"
                      onError={() => setFailedImages((prev) => ({ ...prev, [post.id]: true }))}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-zellige text-sm text-neutral-400">
                      {post.title}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

                  {hasVideo && (
                    <button
                      type="button"
                      onClick={() => setActiveVideoPost(post)}
                      aria-label={`Play video: ${post.title}`}
                      className="absolute right-4 top-4 inline-flex min-h-11 items-center gap-1.5 rounded-full border border-white/20 bg-black/70 px-4 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-casa"
                    >
                      <Play className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
                      <span>Watch</span>
                    </button>
                  )}

                  <div className="absolute inset-x-0 bottom-0 space-y-1 p-5">
                    <p className="text-xs text-neutral-300">{post.aspectLabel}</p>
                    <h3 className="font-display text-2xl font-bold uppercase leading-tight tracking-tight text-white">
                      {post.title}
                    </h3>
                  </div>
                </div>

                <div className="flex flex-1 flex-col justify-between gap-4 p-5">
                  <p className="text-sm leading-relaxed text-neutral-300">{post.caption}</p>
                  <a
                    href={post.postUrl || VERIFIED_INSTAGRAM_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-11 items-center gap-1.5 self-start text-sm font-semibold text-white transition-colors hover:text-saffron"
                  >
                    <Instagram className="h-4 w-4" aria-hidden="true" />
                    <span>View on Instagram</span>
                    <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                </div>
              </article>
            );
          })}

          <a
            href={VERIFIED_INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex min-h-72 flex-col items-start justify-end gap-4 overflow-hidden rounded-2xl bg-casa p-7 text-white transition duration-300 hover:-translate-y-1 md:col-span-2 lg:col-span-1"
          >
            <span aria-hidden="true" className="absolute inset-0 bg-zellige opacity-50" />
            <Instagram className="relative h-10 w-10" aria-hidden="true" />
            <span className="relative font-display text-4xl font-extrabold uppercase leading-[0.95]">
              More on @casastreetldn
            </span>
            <span className="relative inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-5 text-xs font-bold uppercase tracking-wider text-casa transition group-hover:gap-3">
              Open Instagram
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            </span>
          </a>
        </div>
      </div>

      {activeVideoPost && (
        <ReelDialog post={activeVideoPost} onClose={() => setActiveVideoPost(null)} />
      )}
    </section>
  );
}
