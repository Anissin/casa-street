#!/usr/bin/env python3
"""Generate the optimised, correctly-encoded images served by the site.

Run from the repository root:  python3 scripts/optimize-images.py
Requires Pillow (pip install pillow). Source files are never modified.

Outputs go to public/images/ and are referenced from src/lib/cms.ts.
"""
from pathlib import Path

from PIL import Image, ImageDraw, ImageOps

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "images"
MENU = OUT / "menu"
PUBLIC = ROOT / "public"

# Real Casa Street photo (note: the original file is a JPEG with a .webp name).
SANDWICHES = ROOT / "public/assets/casa-street/casa_gallery_1.webp"
# High-resolution brand emblem on cream background.
LOGO_SRC = ROOT / "public/assets/casa-street/casa_hero.jpg"
AI = ROOT / "src/assets/images"

MENU_SOURCES = {
    "tangier": AI / "sandwich_tangier_1795349697634.jpg",
    "marrakesh": AI / "hero_casa_sandwich_1795349697989.jpg",
    "rabat": AI / "sandwich_casablanca_1795349697567.jpg",
    "firma-wrap": AI / "msemen_wrap_signature_1795349697214.jpg",
    "chicken-tajine": AI / "tagine_secondary_1795349697935.jpg",
    "french-tacos-draft": AI / "french_tacos_draft_1795349698219.jpg",
}


def load(path: Path) -> Image.Image:
    return ImageOps.exif_transpose(Image.open(path)).convert("RGB")


def cover(img: Image.Image, width: int, height: int) -> Image.Image:
    """Resize + centre-crop to exactly width x height."""
    return ImageOps.fit(img, (width, height), Image.Resampling.LANCZOS, centering=(0.5, 0.5))


def save_webp(img: Image.Image, path: Path, quality: int = 78) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    img.save(path, "WEBP", quality=quality, method=6)
    print(f"{path.relative_to(ROOT)}  {img.width}x{img.height}  {path.stat().st_size // 1024} KB")


def menu_set(src: Path, slug: str, widths=(480, 960)) -> None:
    img = load(src)
    for w in widths:
        save_webp(cover(img, w, round(w * 3 / 4)), MENU / f"{slug}-{w}.webp")


def logo_disc(size: int) -> Image.Image:
    """Square crop of the emblem centred on its cream background."""
    img = load(LOGO_SRC)
    side = min(img.size)
    # The emblem sits slightly above centre; crop a generous square around it.
    box = ((img.width - side) // 2, (img.height - side) // 2)
    img = img.crop((box[0], box[1], box[0] + side, box[1] + side))
    inset = round(side * 0.12)
    img = img.crop((inset, inset, side - inset, side - inset))
    return img.resize((size, size), Image.Resampling.LANCZOS)


def main() -> None:
    # Casablanca card + hero: the real Casa Street photo.
    sandwiches = load(SANDWICHES)
    for w in (480, 960):
        save_webp(cover(sandwiches, w, round(w * 3 / 4)), MENU / f"casablanca-{w}.webp")
    # Portrait 4:5 crops for the arch-framed hero (source height limits the max width).
    max_w = min(sandwiches.width, round(sandwiches.height * 4 / 5))
    for w in (480, max_w):
        save_webp(cover(sandwiches, w, round(w * 5 / 4)), OUT / f"hero-sandwiches-{w}.webp", quality=80)

    for slug, src in MENU_SOURCES.items():
        menu_set(src, slug, (480,) if slug == "french-tacos-draft" else (480, 960))

    # Logo + favicons.
    for size in (96, 192):
        save_webp(logo_disc(size), OUT / f"logo-{size}.webp", quality=90)
    logo_disc(180).save(PUBLIC / "apple-touch-icon.png", optimize=True)
    logo_disc(512).save(OUT / "icon-512.png", optimize=True)
    logo_disc(192).save(OUT / "icon-192.png", optimize=True)
    logo_disc(48).save(PUBLIC / "favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)])
    print("favicons written")

    # Open Graph share image (1200x630): real photo + emblem badge.
    og = cover(sandwiches, 1200, 630)
    badge = logo_disc(220)
    mask = Image.new("L", badge.size, 0)
    ImageDraw.Draw(mask).ellipse((0, 0, badge.width - 1, badge.height - 1), fill=255)
    ring = Image.new("RGB", (badge.width + 16, badge.height + 16), (255, 255, 255))
    ring_mask = Image.new("L", ring.size, 0)
    ImageDraw.Draw(ring_mask).ellipse((0, 0, ring.width - 1, ring.height - 1), fill=255)
    og.paste(ring, (48, 630 - ring.height - 48), ring_mask)
    og.paste(badge, (56, 630 - badge.height - 56), mask)
    og.save(OUT / "og-casa-street.jpg", "JPEG", quality=82, optimize=True, progressive=True)
    print(f"og image {(OUT / 'og-casa-street.jpg').stat().st_size // 1024} KB")


if __name__ == "__main__":
    main()
