#!/usr/bin/env python3
"""Remove the exported 20% black canvas matte from H1 foreground PNGs.

Figma composited these foreground groups over a uniform black layer with
alpha 51/255. Reversing that source-over operation restores a genuinely
transparent foreground without changing the visible cards, type, or imagery.
"""

from pathlib import Path

import numpy as np
from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
ASSET_DIR = ROOT / "previews" / "assets" / "figma-untitled"
SOURCE_NAMES = (
    "p25-foreground.png",
    "p26-foreground.png",
    "p28-2-foreground.png",
    "p31-foreground.png",
    "p33-34-foreground.png",
    "p36-1-foreground.png",
    "p52-foreground.png",
)
MATTE_ALPHA = 51 / 255


def remove_black_matte(source: Path, destination: Path) -> None:
    rgba = np.asarray(Image.open(source).convert("RGBA"), dtype=np.float32) / 255
    composited_alpha = rgba[..., 3]
    foreground_alpha = np.clip(
        (composited_alpha - MATTE_ALPHA) / (1 - MATTE_ALPHA),
        0,
        1,
    )

    foreground_rgb = np.zeros_like(rgba[..., :3])
    visible = foreground_alpha > 1e-6
    foreground_rgb[visible] = (
        rgba[..., :3][visible]
        * composited_alpha[visible, None]
        / foreground_alpha[visible, None]
    )

    cleaned = np.empty_like(rgba)
    cleaned[..., :3] = np.clip(foreground_rgb, 0, 1)
    cleaned[..., 3] = foreground_alpha
    Image.fromarray(np.rint(cleaned * 255).astype(np.uint8)).save(
        destination,
        optimize=True,
    )


for source_name in SOURCE_NAMES:
    source_path = ASSET_DIR / source_name
    clean_path = source_path.with_name(
        f"{source_path.stem.removesuffix('-foreground')}-foreground-clean.png"
    )
    remove_black_matte(source_path, clean_path)
    print(f"{source_path.name} -> {clean_path.name}")
