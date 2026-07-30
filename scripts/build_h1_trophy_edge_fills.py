#!/usr/bin/env python3
"""Build seamless edge-fill strips from the exact Figma trophy background."""

from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
ASSET_DIR = ROOT / "previews" / "assets" / "figma-untitled"
source = Image.open(ASSET_DIR / "p68-trophy-background.png").convert("RGB")

source.crop((0, 0, 1, source.height)).save(
    ASSET_DIR / "p68-trophy-edge-left.png",
    optimize=True,
)
source.crop((source.width - 1, 0, source.width, source.height)).save(
    ASSET_DIR / "p68-trophy-edge-right.png",
    optimize=True,
)
