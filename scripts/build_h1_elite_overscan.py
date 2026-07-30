#!/usr/bin/env python3
"""Build a 2280×1346 full-bleed Elite Client background.

The original 1920×1080 Figma composition remains pixel-perfect in the centre.
Only the letterbox area is extended from the source image's edge pixels, so the
three Elite Client pages no longer reveal the trophy chapter behind them.
"""

from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "previews/assets/figma-untitled/elite-client-background.png"
OUTPUT = ROOT / "previews/assets/figma-untitled/elite-client-background-overscan.png"

DESIGN_WIDTH = 1920
DESIGN_HEIGHT = 1080
OVERSCAN_WIDTH = 2280
OVERSCAN_HEIGHT = 1346
OFFSET_X = (OVERSCAN_WIDTH - DESIGN_WIDTH) // 2
OFFSET_Y = (OVERSCAN_HEIGHT - DESIGN_HEIGHT) // 2


def main() -> None:
    source = Image.open(SOURCE).convert("RGBA")
    if source.size != (DESIGN_WIDTH, DESIGN_HEIGHT):
        raise ValueError(
            f"Expected {DESIGN_WIDTH}×{DESIGN_HEIGHT}, got {source.size}"
        )

    output = Image.new("RGBA", (OVERSCAN_WIDTH, OVERSCAN_HEIGHT))

    # Extend each border without scaling the authored Figma composition.
    output.paste(
        source.crop((0, 0, 1, DESIGN_HEIGHT)).resize((OFFSET_X, DESIGN_HEIGHT)),
        (0, OFFSET_Y),
    )
    output.paste(
        source.crop((DESIGN_WIDTH - 1, 0, DESIGN_WIDTH, DESIGN_HEIGHT)).resize(
            (OFFSET_X, DESIGN_HEIGHT)
        ),
        (OFFSET_X + DESIGN_WIDTH, OFFSET_Y),
    )
    output.paste(
        source.crop((0, 0, DESIGN_WIDTH, 1)).resize((DESIGN_WIDTH, OFFSET_Y)),
        (OFFSET_X, 0),
    )
    output.paste(
        source.crop((0, DESIGN_HEIGHT - 1, DESIGN_WIDTH, DESIGN_HEIGHT)).resize(
            (DESIGN_WIDTH, OFFSET_Y)
        ),
        (OFFSET_X, OFFSET_Y + DESIGN_HEIGHT),
    )

    corners = (
        ((0, 0), source.getpixel((0, 0))),
        ((OFFSET_X + DESIGN_WIDTH, 0), source.getpixel((DESIGN_WIDTH - 1, 0))),
        ((0, OFFSET_Y + DESIGN_HEIGHT), source.getpixel((0, DESIGN_HEIGHT - 1))),
        (
            (OFFSET_X + DESIGN_WIDTH, OFFSET_Y + DESIGN_HEIGHT),
            source.getpixel((DESIGN_WIDTH - 1, DESIGN_HEIGHT - 1)),
        ),
    )
    for (left, top), colour in corners:
        width = OFFSET_X
        height = OFFSET_Y
        output.paste(Image.new("RGBA", (width, height), colour), (left, top))

    output.paste(source, (OFFSET_X, OFFSET_Y), source)
    output.save(OUTPUT, optimize=True)
    print(f"Wrote {OUTPUT.relative_to(ROOT)} ({OVERSCAN_WIDTH}×{OVERSCAN_HEIGHT})")


if __name__ == "__main__":
    main()
