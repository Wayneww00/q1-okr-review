from pathlib import Path

from playwright.sync_api import sync_playwright


SCREENSHOT = Path("/tmp/h1-okr-cfd-public-good-story.png")
PAGE_ID = "okr-cfd-public-good-story"


with sync_playwright() as playwright:
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1920, "height": 1080})
    errors = []
    page.on("pageerror", lambda error: errors.append(str(error)))
    page.goto(
        "http://127.0.0.1:4183/index.html"
        "?report=h1&embedded=1&v=20260730-frame73-story",
        wait_until="networkidle",
    )

    report_page = page.locator(f'[data-page-id="{PAGE_ID}"]')
    report_page.scroll_into_view_if_needed()
    foreground = report_page.locator(".h1-okr-figma-foreground-layer")
    foreground.wait_for(state="visible")
    page.wait_for_function(
        "(selector) => { const image = document.querySelector(selector);"
        " return image && image.complete && image.naturalWidth > 0; }",
        arg=f'[data-page-id="{PAGE_ID}"] .h1-okr-figma-foreground-layer',
    )

    state = report_page.evaluate(
        """(root) => {
          const image = root.querySelector('.h1-okr-figma-foreground-layer');
          const stage = document.querySelector('.h1-okr-fixed-trophy-stage');
          return {
            source: new URL(image.currentSrc).pathname,
            naturalWidth: image.naturalWidth,
            naturalHeight: image.naturalHeight,
            pageNumber: root.querySelector('.h1-okr-page-number')
              .textContent.replace(/\\s+/g, ''),
            stageCount: document.querySelectorAll('.h1-okr-fixed-trophy-stage').length,
            stagePosition: getComputedStyle(stage).position,
            exactFrameCount: root.querySelectorAll('.h1-okr-exact-frame').length,
            hotspotCount: root.querySelectorAll('.h1-okr-video-hotspot').length,
          };
        }"""
    )
    assert state == {
        "source": "/previews/assets/figma-untitled/p73-cfd-public-good-video-foreground.png",
        "naturalWidth": 1920,
        "naturalHeight": 1080,
        "pageNumber": "23/31",
        "stageCount": 1,
        "stagePosition": "sticky",
        "exactFrameCount": 0,
        "hotspotCount": 1,
    }

    report_page.screenshot(path=str(SCREENSHOT))
    report_page.locator(".h1-okr-video-hotspot").click()
    modal = page.locator(".h1-okr-video-modal")
    modal.wait_for(state="visible")
    video_src = page.locator(".h1-okr-video-player").get_attribute("src")
    assert "tvc-library/public-good.mp4" in (video_src or ""), video_src
    page.keyboard.press("Escape")
    modal.wait_for(state="detached")
    assert not errors, f"page errors: {errors}"
    browser.close()

print(f"Browser QA passed; screenshot: {SCREENSHOT}")
