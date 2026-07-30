from pathlib import Path

from playwright.sync_api import sync_playwright


SCREENSHOT = Path("/tmp/h1-okr-omnichannel-replacement.png")
PAGE_ID = "okr-omnichannel-amplification"
EXPECTED_SOURCE = "p59-foreground-v2.png"


with sync_playwright() as playwright:
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1920, "height": 1080})
    errors = []
    page.on("pageerror", lambda error: errors.append(str(error)))
    page.goto(
        "http://127.0.0.1:4183/index.html"
        "?report=h1&embedded=1&v=20260730-p59-foreground-v2",
        wait_until="networkidle",
    )

    report_page = page.locator(f'[data-page-id="{PAGE_ID}"]')
    report_page.scroll_into_view_if_needed()
    page.wait_for_timeout(400)

    foreground = report_page.locator(".h1-okr-figma-foreground-layer")
    assert foreground.count() == 1
    page.wait_for_function(
        "(selector) => { const image = document.querySelector(selector);"
        " return image && image.complete && image.naturalWidth > 0; }",
        arg=f'[data-page-id="{PAGE_ID}"] .h1-okr-figma-foreground-layer',
    )

    image_state = foreground.evaluate(
        """(image) => ({
          source: new URL(image.currentSrc).pathname,
          naturalWidth: image.naturalWidth,
          naturalHeight: image.naturalHeight,
          left: image.style.left,
          top: image.style.top,
          width: image.style.width,
          height: image.style.height,
        })"""
    )
    assert image_state == {
        "source": f"/previews/assets/figma-untitled/{EXPECTED_SOURCE}",
        "naturalWidth": 1707,
        "naturalHeight": 976,
        "left": "106px",
        "top": "75px",
        "width": "1707px",
        "height": "976px",
    }

    page_number = report_page.locator(".h1-okr-page-number").inner_text()
    assert "28" in page_number and "31" in page_number
    report_page.screenshot(path=str(SCREENSHOT))
    assert not errors, f"page errors: {errors}"
    browser.close()

print(f"Browser QA passed; screenshot: {SCREENSHOT}")
