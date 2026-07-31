import os
from pathlib import Path

from playwright.sync_api import sync_playwright


BASE_URL = os.environ.get("H1_O1_MARKER_TEST_URL", "http://127.0.0.1:4182")
SCREENSHOT = Path("/tmp/h1-okr-o1-marker.png")


with sync_playwright() as playwright:
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context(viewport={"width": 1920, "height": 1080})
    page = context.new_page()
    errors = []
    page.on("pageerror", lambda error: errors.append(str(error)))
    page.goto(
        f"{BASE_URL}/previews/vantage-h1-immersive.html"
        "?v=20260731-ai-frame58-lightbox-v1",
        wait_until="domcontentloaded",
    )
    if page.locator("#loginGate").is_visible():
        page.locator("#loginUsername").fill("vantage")
        page.locator("#loginPassword").fill("vantage")
        page.locator("#loginSubmit").click()
        page.locator("#loginGate").wait_for(state="hidden")

    report = page.frame_locator("#reportFrame")
    first_page = report.locator('[data-objective-index="O1"]')
    first_page.scroll_into_view_if_needed()
    first_page.wait_for(state="visible")
    marker = first_page.locator(".h1-okr-objective-marker")
    marker_style = marker.evaluate(
        "(node) => { const style = getComputedStyle(node); "
        "return { fontSize: style.fontSize, height: style.height, "
        "top: style.top, left: style.left }; }"
    )
    assert marker_style == {
        "fontSize": "68px",
        "height": "72px",
        "top": "160px",
        "left": "250px",
    }

    marker_box = marker.bounding_box()
    assert marker_box is not None and marker_box["width"] >= 70
    first_page.screenshot(path=str(SCREENSHOT))
    assert not errors, f"page errors: {errors}"
    browser.close()

print(f"Browser QA passed; O1 marker enlarged and aligned: {SCREENSHOT}")
