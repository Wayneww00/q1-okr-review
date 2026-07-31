import os
from pathlib import Path

from playwright.sync_api import sync_playwright


PAGE_ID = "okr-ai-recommendation"
BASE_URL = os.environ.get("H1_AI_FRAME58_TEST_URL", "http://127.0.0.1:4182")
SCREENSHOT = Path("/tmp/h1-okr-ai-recommendation-frame58.png")
SHELL_SCREENSHOT = Path("/tmp/h1-shell-ai-recommendation-frame58.png")
LIGHTBOX_SCREENSHOT = Path("/tmp/h1-ai-recommendation-lightbox.png")

LIGHTBOXES = [
    ("GPT No.1 · Best broker", "gpt-best-broker.png"),
    ("GPT No.1 · Weekend trading", "gpt-weekend-trading.png"),
    ("GPT No.1 · Broker list", "gpt-broker-list.png"),
    ("Gemini No.1 · Best broker", "gemini-best-broker.png"),
    ("Gemini No.1 · Weekend trading", "gemini-weekend-trading.png"),
    ("Gemini No.1 · Broker list", "gemini-broker-list.png"),
    ("Claude No.1 · Best broker", "claude-best-broker.png"),
    ("Claude No.1 · Weekend trading", "claude-weekend-trading.png"),
    ("Claude No.1 · Broker list", "claude-broker-list.png"),
]


with sync_playwright() as playwright:
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context(viewport={"width": 1920, "height": 1080})
    page = context.new_page()
    errors = []
    page.on("pageerror", lambda error: errors.append(str(error)))
    page.goto(
        f"{BASE_URL}/index.html"
        "?report=h1&embedded=1&v=20260731-ai-frame58-lightbox-v1",
        wait_until="networkidle",
    )

    report_page = page.locator(f'[data-page-id="{PAGE_ID}"]')
    report_page.scroll_into_view_if_needed()
    report_page.wait_for(state="visible")
    assert report_page.get_attribute("data-figma-node-id") == "152:1299"

    foreground = report_page.locator(".h1-okr-figma-foreground-layer")
    assert foreground.count() == 1
    assert foreground.get_attribute("src").endswith(
        "p58-ai-recommendation-figma-152-1299.png"
    )
    assert foreground.get_attribute("width") == "1608"
    assert foreground.get_attribute("height") == "1042"
    assert foreground.evaluate(
        "(node) => ({left: node.style.left, top: node.style.top, "
        "width: node.style.width, height: node.style.height})"
    ) == {
        "left": "160px",
        "top": "19px",
        "width": "1608px",
        "height": "1042px",
    }

    hotspots = report_page.locator(".h1-okr-image-hotspot")
    assert hotspots.count() == 9
    for index, (label, file_name) in enumerate(LIGHTBOXES):
        hotspot = report_page.get_by_role(
            "button", name=f"放大查看：{label}", exact=True
        )
        assert hotspot.count() == 1
        hotspot.click()

        dialog = page.get_by_role("dialog", name=f"图片预览：{label}", exact=True)
        dialog.wait_for(state="visible")
        modal_image = dialog.locator(".h1-okr-image-modal-frame")
        assert modal_image.get_attribute("src").endswith(file_name)
        assert modal_image.evaluate("(image) => image.naturalWidth") >= 1103
        if index == 0:
            page.screenshot(path=str(LIGHTBOX_SCREENSHOT))
            dialog.locator(".h1-okr-image-modal-close").click()
        elif index == 1:
            dialog.click(position={"x": 8, "y": 8})
        elif index == 2:
            page.keyboard.press("Escape")
        else:
            dialog.locator(".h1-okr-image-modal-close").click()
        dialog.wait_for(state="detached")

    report_page.screenshot(path=str(SCREENSHOT))
    assert not errors, f"page errors: {errors}"

    shell = context.new_page()
    shell_errors = []
    shell.on("pageerror", lambda error: shell_errors.append(str(error)))
    shell.goto(
        f"{BASE_URL}/previews/vantage-h1-immersive.html"
        "?v=20260731-ai-frame58-lightbox-v1",
        wait_until="domcontentloaded",
    )
    if shell.locator("#loginGate").is_visible():
        shell.locator("#loginUsername").fill("vantage")
        shell.locator("#loginPassword").fill("vantage")
        shell.locator("#loginSubmit").click()
        shell.locator("#loginGate").wait_for(state="hidden")
    shell_page = shell.frame_locator("#reportFrame").locator(
        f'[data-page-id="{PAGE_ID}"]'
    )
    shell_page.scroll_into_view_if_needed()
    shell_page.wait_for(state="visible")
    assert shell_page.locator(
        'img[src$="p58-ai-recommendation-figma-152-1299.png"]'
    ).count() == 1
    assert shell_page.locator(".h1-okr-image-hotspot").count() == 9
    shell_page.get_by_role(
        "button", name="放大查看：Gemini No.1 · Best broker", exact=True
    ).click()
    shell_dialog = shell.frame_locator("#reportFrame").get_by_role(
        "dialog", name="图片预览：Gemini No.1 · Best broker", exact=True
    )
    shell_dialog.wait_for(state="visible")
    assert shell_dialog.locator(".h1-okr-image-modal-frame").get_attribute(
        "src"
    ).endswith("gemini-best-broker.png")
    shell_dialog.locator(".h1-okr-image-modal-close").click()
    shell.screenshot(path=str(SHELL_SCREENSHOT))
    assert not shell_errors, f"shell page errors: {shell_errors}"
    browser.close()

print(
    "Browser QA passed; current Figma Frame 58 is aligned over the shared "
    "trophy background and all nine answer screenshots open independently; "
    f"screenshots: {SCREENSHOT}, {LIGHTBOX_SCREENSHOT}, {SHELL_SCREENSHOT}"
)
