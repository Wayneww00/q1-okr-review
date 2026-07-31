import os
from pathlib import Path

from playwright.sync_api import sync_playwright


PAGE_ID = "okr-elite-endorsement-resources"
BASE_URL = os.environ.get("H1_ENDORSEMENT_TEST_URL", "http://127.0.0.1:4182")
SCREENSHOT = Path("/tmp/h1-okr-elite-endorsement-frame45.png")
SHELL_SCREENSHOT = Path("/tmp/h1-shell-elite-endorsement-frame45.png")


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

    assert report_page.get_attribute("data-figma-node-id") == "150:1072"
    assert report_page.locator(".h1-okr-elite-client-background").count() == 1
    assert report_page.locator(".h1-elite-copy--endorsement").count() == 0

    foreground = report_page.locator(".h1-okr-elite-endorsement-foreground")
    assert foreground.count() == 1
    assert foreground.get_attribute("src").endswith(
        "p45-elite-endorsement-resources-figma-150-1072.png"
    )
    assert foreground.get_attribute("width") == "1716"
    assert foreground.get_attribute("height") == "904"
    assert foreground.evaluate(
        "(node) => ({left: node.style.left, top: node.style.top, "
        "width: node.style.width, height: node.style.height})"
    ) == {
        "left": "102px",
        "top": "72px",
        "width": "1716px",
        "height": "904px",
    }

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
    assert shell_page.locator(".h1-okr-elite-endorsement-foreground").count() == 1
    shell.screenshot(path=str(SHELL_SCREENSHOT))
    assert not shell_errors, f"shell page errors: {shell_errors}"
    browser.close()

print(
    "Browser QA passed; Frame 45 foreground is aligned over the existing "
    f"Elite Client background; screenshots: {SCREENSHOT}, {SHELL_SCREENSHOT}"
)
