from pathlib import Path

from playwright.sync_api import sync_playwright


PUBLIC_GOOD_PAGE = "okr-public-good-video"
TVC_PAGE = "okr-tvc-localization"
SCREENSHOT = Path("/tmp/h1-okr-tvc-video-slots.png")


with sync_playwright() as playwright:
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1920, "height": 1080})
    errors = []
    page.on("pageerror", lambda error: errors.append(str(error)))
    page.goto(
        "http://127.0.0.1:4183/index.html"
        "?report=h1&embedded=1&v=20260730-ppt-video-slots",
        wait_until="networkidle",
    )

    public_good = page.locator(f'[data-page-id="{PUBLIC_GOOD_PAGE}"]')
    public_good.scroll_into_view_if_needed()
    public_video = public_good.locator(".h1-okr-inline-video")
    public_video.wait_for(state="visible")
    assert public_video.count() == 1
    assert "tvc-library/cfd-h1-summary.mp4" in (public_video.get_attribute("src") or "")
    public_video.click(position={"x": 24, "y": 24})
    page.wait_for_function(
        "(selector) => { const video = document.querySelector(selector);"
        " return video && video.readyState >= 3 && !video.paused && video.currentTime > 0; }",
        arg=f'[data-page-id="{PUBLIC_GOOD_PAGE}"] .h1-okr-inline-video',
    )
    public_video.evaluate("video => video.pause()")

    tvc = page.locator(f'[data-page-id="{TVC_PAGE}"]')
    tvc.scroll_into_view_if_needed()
    videos = tvc.locator(".h1-okr-inline-video")
    assert videos.count() == 4
    expected_sources = [
        "tvc-brand-main.mp4",
        "tvc-global.mp4",
        "tvc-vietnam.mp4",
        "tvc-thailand.mp4",
    ]
    for index, source in enumerate(expected_sources):
        video = videos.nth(index)
        video.wait_for(state="visible")
        assert source in (video.get_attribute("src") or "")
        video.click(position={"x": 24, "y": 24})
        page.wait_for_function(
            "([selector, index]) => { const video = document.querySelectorAll(selector)[index];"
            " return video && video.readyState >= 3 && !video.paused && video.currentTime > 0; }",
            arg=[f'[data-page-id="{TVC_PAGE}"] .h1-okr-inline-video', index],
        )
        video.evaluate("video => video.pause()")

    tvc.screenshot(path=str(SCREENSHOT))
    assert not errors, f"page errors: {errors}"
    browser.close()

print(f"Browser QA passed; screenshot: {SCREENSHOT}")
