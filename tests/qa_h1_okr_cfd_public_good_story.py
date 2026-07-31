import os
from pathlib import Path

from playwright.sync_api import sync_playwright


SCREENSHOT = Path("/tmp/h1-okr-cfd-public-good-story.png")
PAGE_ID = "okr-cfd-public-good-story"
BASE_URL = os.environ.get("H1_TVC_TEST_URL", "http://127.0.0.1:4182")


with sync_playwright() as playwright:
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1920, "height": 1080})
    errors = []
    video_requests = []
    page.on("pageerror", lambda error: errors.append(str(error)))
    page.on(
        "request",
        lambda request: video_requests.append(request.url)
        if "cfd-public-good-web.mp4" in request.url
        else None,
    )
    page.goto(
        f"{BASE_URL}/index.html"
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
            inlineVideoCount: root.querySelectorAll('.h1-okr-inline-video').length,
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
        "hotspotCount": 0,
        "inlineVideoCount": 1,
    }

    report_page.screenshot(path=str(SCREENSHOT))
    wrapper = report_page.locator(".h1-okr-inline-video")
    wrapper.wait_for(state="visible")
    assert wrapper.locator(".h1-okr-inline-video-trigger").count() == 1
    assert wrapper.locator(".h1-okr-inline-video-player").count() == 0
    assert video_requests == [], video_requests
    wrapper.locator(".h1-okr-inline-video-trigger").click()
    video = wrapper.locator(".h1-okr-inline-video-player")
    video.wait_for(state="visible")
    page.wait_for_function(
        "(selector) => { const video = document.querySelector(selector);"
        " return video && video.readyState >= 3 && !video.paused && video.currentTime > 0; }",
        arg=f'[data-page-id="{PAGE_ID}"] .h1-okr-inline-video-player',
    )
    video_src = video.get_attribute("src")
    assert "tvc-library/cfd-public-good-web.mp4" in (video_src or ""), video_src
    media_state = video.evaluate(
        """video => ({
          duration: video.duration,
          width: video.videoWidth,
          height: video.videoHeight,
        })"""
    )
    assert 531.5 < media_state["duration"] < 533, media_state
    assert media_state["width"] == 1280, media_state
    assert media_state["height"] == 720, media_state
    assert len(video_requests) == 1, video_requests
    assert not errors, f"page errors: {errors}"
    browser.close()

print(f"Browser QA passed; screenshot: {SCREENSHOT}")
