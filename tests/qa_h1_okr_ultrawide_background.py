import os
from pathlib import Path

from playwright.sync_api import sync_playwright


BASE_URL = os.environ.get(
    "H1_ULTRAWIDE_BACKGROUND_TEST_URL", "http://127.0.0.1:4182"
)
SCREENSHOT = Path("/tmp/h1-okr-ultrawide-background.png")


def inspect_viewport(browser, width, height, screenshot=None):
    context = browser.new_context(viewport={"width": width, "height": height})
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
    stage = report.locator(".h1-okr-fixed-trophy-stage")
    state = stage.evaluate(
        """node => {
          const stage = node.getBoundingClientRect();
          const canvas = node.querySelector(
            '.h1-okr-fixed-stage-canvas'
          ).getBoundingClientRect();
          const before = getComputedStyle(node, '::before');
          const after = getComputedStyle(node, '::after');
          return {
            leftGap: canvas.left - stage.left,
            rightGap: stage.right - canvas.right,
            leftFill: parseFloat(before.width),
            rightFill: parseFloat(after.width),
            leftImage: before.backgroundImage,
            rightImage: after.backgroundImage,
            canvasRatio: canvas.width / canvas.height,
          };
        }"""
    )

    assert abs(state["canvasRatio"] - (16 / 9)) < 0.001
    assert state["leftFill"] >= state["leftGap"]
    assert state["rightFill"] >= state["rightGap"]
    assert "p68-trophy-edge-left.png" in state["leftImage"]
    assert "p68-trophy-edge-right.png" in state["rightImage"]
    assert not errors, f"page errors at {width}×{height}: {errors}"
    if screenshot:
        page.screenshot(path=str(screenshot))
    context.close()
    return state


with sync_playwright() as playwright:
    browser = playwright.chromium.launch(headless=True)
    standard = inspect_viewport(browser, 1920, 1080)
    ultrawide = inspect_viewport(browser, 2560, 1080, SCREENSHOT)
    assert ultrawide["leftGap"] > standard["leftGap"]
    assert ultrawide["leftFill"] > standard["leftFill"]
    browser.close()

print(
    "Browser QA passed; responsive edge fills cover standard and ultra-wide "
    f"gaps without changing the 16:9 trophy canvas: {SCREENSHOT}"
)
