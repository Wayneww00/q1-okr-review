import os
from pathlib import Path

from playwright.sync_api import sync_playwright


PUBLIC_GOOD_PAGE = "okr-public-good-video"
TVC_PAGE = "okr-tvc-localization"
SCREENSHOT = Path("/tmp/h1-okr-tvc-video-slots.png")
SHELL_SCREENSHOT = Path("/tmp/h1-okr-tvc-video-slots-shell.png")
BASE_URL = os.environ.get("H1_TVC_TEST_URL", "http://127.0.0.1:4182")


with sync_playwright() as playwright:
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1920, "height": 1080})
    errors = []
    page.on("pageerror", lambda error: errors.append(str(error)))
    page.goto(
        f"{BASE_URL}/index.html"
        "?report=h1&embedded=1&v=20260731-endorsement-frame45-v1",
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
    assert tvc.locator("text=UAE").count() == 0
    assert tvc.locator(".h1-okr-tvc-localization-panel").count() == 2
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

    shell = browser.new_page(viewport={"width": 1920, "height": 1080})
    shell_errors = []
    shell.on("pageerror", lambda error: shell_errors.append(str(error)))
    shell.goto(
        f"{BASE_URL}/previews/vantage-h1-immersive.html"
        "?audit=tvc-four-videos",
        wait_until="domcontentloaded",
    )
    shell.locator("#loginSubmit").click()
    shell_frame = shell.frame_locator("#reportFrame")
    shell_frame.locator('body[data-h1-prepared="true"]').wait_for()
    shell_tvc = shell_frame.locator(f'[data-page-id="{TVC_PAGE}"]')
    shell_tvc.evaluate(
        "target => window.scrollTo({"
        "top: target.getBoundingClientRect().top + window.scrollY,"
        "behavior: 'instant'"
        "})"
    )
    shell.wait_for_timeout(500)
    assert shell_tvc.locator(".h1-okr-inline-video").count() == 4
    assert shell_tvc.locator("text=UAE").count() == 0
    assert (
        shell_tvc.locator(".h1-okr-page-number").inner_text().replace(" ", "").replace("\n", "")
        == "29/31"
    )
    assert (
        shell_frame.locator('[data-page-id="okr-omnichannel-amplification"] img')
        .get_attribute("src")
        .endswith("omnichannel-amplification-figma-145-716.png")
    )
    assert (
        shell_frame.locator('[data-page-id="okr-superapp-activation"] img')
        .get_attribute("src")
        .endswith("p61-foreground.png")
    )
    shell_tvc.screenshot(path=str(SHELL_SCREENSHOT))
    assert not errors, f"page errors: {errors}"
    assert not shell_errors, f"shell page errors: {shell_errors}"
    browser.close()

print(f"Browser QA passed; screenshots: {SCREENSHOT}, {SHELL_SCREENSHOT}")
