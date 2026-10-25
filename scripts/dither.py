"""Turn a photo on a plain light background into the 1-bit dithered mascot.

usage: python scripts/dither.py me.jpg public/me-dither.png
"""
import sys
from collections import deque

import numpy as np
from PIL import Image, ImageFilter

INK, PAPER = (11, 11, 12), (251, 251, 248)
GAMMA = float(sys.argv[3]) if len(sys.argv) > 3 else 0.4
OUT = 200            # output size in art pixels (rendered scaled up, pixelated)
CROP = (235, 0, 995, 760)  # head-and-shoulders square in the source photo
BAYER = (np.array([[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]]) + 0.5) / 16


def shift_all(m, r, op):
    """Erode (logical_and) or dilate (logical_or) a boolean mask by a square of radius r."""
    out = m.copy()
    for dy in range(-r, r + 1):
        for dx in range(-r, r + 1):
            out = op(out, np.roll(np.roll(m, dy, 0), dx, 1))
    return out


def background_mask(rgb):
    """Near-white pixels connected to the top/left/right border (flood fill), True = background.
    The bottom edge is skipped: a white shirt touches it and is not background."""
    h, w, _ = rgb.shape
    raw = (rgb > 205).all(axis=2)  # low enough to swallow the anti-aliased halo around hair
    light = shift_all(raw, 3, np.logical_and)  # erode: cut thin light bridges (neck edge -> white shirt)
    bg = np.zeros((h, w), bool)
    q = deque((y, x) for y in range(h) for x in (0, w - 1)) + deque((0, x) for x in range(w))
    while q:
        y, x = q.popleft()
        if 0 <= y < h and 0 <= x < w and light[y, x] and not bg[y, x]:
            bg[y, x] = True
            q.extend(((y + 1, x), (y - 1, x), (y, x + 1), (y, x - 1)))
    return shift_all(bg, 3, np.logical_or) & raw  # grow back to the true edge


def main(src, dst):
    img = Image.open(src).convert('RGB').crop(CROP)
    work = np.asarray(img.resize((OUT * 4, OUT * 4), Image.LANCZOS))
    bg = background_mask(work)
    # downsample the mask: an art pixel is background if most of its 4x4 block is
    bg = bg.reshape(OUT, 4, OUT, 4).mean(axis=(1, 3)) > 0.5

    small = img.convert('L').resize((OUT, OUT), Image.LANCZOS).filter(ImageFilter.UnsharpMask(2, 160, 2))
    g = np.asarray(small, float) / 255
    fg = g[~bg]
    g = np.clip((g - np.percentile(fg, 2)) / (np.percentile(fg, 98) - np.percentile(fg, 2)), 0, 1)
    g = 0.08 + 0.92 * g ** GAMMA  # brighten skin so features read; keeps a little texture in the suit

    thresh = np.tile(BAYER, (OUT // 4, OUT // 4))
    ink = g < thresh
    out = np.zeros((OUT, OUT, 4), np.uint8)
    out[ink] = (*INK, 255)
    out[~ink] = (*PAPER, 255)
    out[bg] = 0
    Image.fromarray(out, 'RGBA').save(dst, optimize=True)
    print(f'saved {dst} ({OUT}x{OUT}), background {bg.mean():.0%}')


if __name__ == '__main__':
    main(*sys.argv[1:3])
