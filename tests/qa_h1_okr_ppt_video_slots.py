import os
from pathlib import Path

from playwright.sync_api import sync_playwright


PUBLIC_GOOD_PAGE = "okr-public-good-video"
FERRARI_PAGE = "okr-elite-ferrari-experience"
TVC_PAGE = "okr-tvc-localization"
SCREENSHOT = Path("/tmp/h1-okr-tvc-video-slots.png")
SHELL_SCREENSHOT = Path("/tmp/h1-okr-tvc-video-slots-shell.png")
BASE_URL = os.environ.get("H1_TVC_TEST_URL", "http://127.0.0.1:4182")


with sync_playwright() as playwright:
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1920, "height": 1080})
    errors = []
    inline_video_requests = []
    page.on("pageerror", lambda error: errors.append(str(error)))
    page.on(
        "request",
        lambda request: inline_video_requests.append(request.url)
        if any(
            name in request.url
            for name in (
                "cfd-h1-summary-web.mp4",
                "ferrari-personal-moment-web.mp4",
                "tvc-brand-main-web.mp4",
                "tvc-global-web.mp4",
                "tvc-vietnam-web.mp4",
                "tvc-thailand-web.mp4",
            )
        )
        else None,
    )
    page.goto(
        f"{BASE_URL}/index.html"
        "?report=h1&embedded=1&v=20260731-ai-frame58-lightbox-v1",
        wait_until="networkidle",
    )

    public_good = page.locator(f'[data-page-id="{PUBLIC_GOOD_PAGE}"]')
    public_good.scroll_into_view_if_needed()
    public_video = public_good.locator(".h1-okr-inline-video")
    public_video.wait_for(state="visible")
    assert public_video.count() == 1
    assert public_video.locator(".h1-okr-inline-video-player").count() == 0
    assert inline_video_requests == [], inline_video_requests
    public_video.locator(".h1-okr-inline-video-trigger").click()
    public_modal = page.locator(".h1-okr-video-modal")
    public_modal.wait_for(state="visible")
    public_player = public_modal.locator(".h1-okr-video-player")
    public_player.wait_for(state="visible")
    assert public_video.locator(".h1-okr-inline-video-player").count() == 0
    assert "tvc-library/cfd-h1-summary-web.mp4" in (public_player.get_attribute("src") or "")
    page.wait_for_function(
        "(selector) => { const video = document.querySelector(selector);"
        " return video && video.readyState >= 3 && !video.paused && video.currentTime > 0; }",
        arg=".h1-okr-video-modal .h1-okr-video-player",
    )
    page.keyboard.press("Escape")
    public_modal.wait_for(state="detached")

    ferrari = page.locator(f'[data-page-id="{FERRARI_PAGE}"]')
    ferrari.scroll_into_view_if_needed()
    ferrari_trigger = ferrari.locator(".h1-okr-modal-video-trigger")
    ferrari_trigger.wait_for(state="visible")
    assert ferrari_trigger.count() == 1
    assert page.locator(".h1-okr-video-modal").count() == 0
    assert not any(
        "ferrari-personal-moment-web.mp4" in url for url in inline_video_requests
    ), inline_video_requests
    ferrari_trigger.locator(".h1-okr-inline-video-trigger").click()
    ferrari_modal = page.locator(".h1-okr-video-modal")
    ferrari_modal.wait_for(state="visible")
    ferrari_player = ferrari_modal.locator(".h1-okr-video-player")
    assert "ferrari-personal-moment-web.mp4" in (
        ferrari_player.get_attribute("src") or ""
    )
    page.wait_for_function(
        "(selector) => { const video = document.querySelector(selector);"
        " return video && video.readyState >= 3 && !video.paused && video.currentTime > 0; }",
        arg=".h1-okr-video-modal .h1-okr-video-player",
    )
    assert any(
        "ferrari-personal-moment-web.mp4" in url for url in inline_video_requests
    ), inline_video_requests
    page.keyboard.press("Escape")
    ferrari_modal.wait_for(state="detached")

    tvc = page.locator(f'[data-page-id="{TVC_PAGE}"]')
    tvc.scroll_into_view_if_needed()
    videos = tvc.locator(".h1-okr-inline-video")
    assert videos.count() == 4
    assert tvc.locator("text=UAE").count() == 0
    assert tvc.locator(".h1-okr-tvc-localization-panel").count() == 2
    assert not any(
        any(
            name in url
            for name in (
                "tvc-brand-main-web.mp4",
                "tvc-global-web.mp4",
                "tvc-vietnam-web.mp4",
                "tvc-thailand-web.mp4",
            )
        )
        for url in inline_video_requests
    ), inline_video_requests
    expected_sources = [
        "tvc-brand-main-web.mp4",
        "tvc-global-web.mp4",
        "tvc-vietnam-web.mp4",
        "tvc-thailand-web.mp4",
    ]
    for index, source in enumerate(expected_sources):
        wrapper = videos.nth(index)
        wrapper.wait_for(state="visible")
        wrapper.locator(".h1-okr-inline-video-trigger").click()
        modal = page.locator(".h1-okr-video-modal")
        modal.wait_for(state="visible")
        video = modal.locator(".h1-okr-video-player")
        video.wait_for(state="visible")
        assert source in (video.get_attribute("src") or "")
        assert tvc.locator(".h1-okr-inline-video-player").count() == 0
        assert page.locator(".h1-okr-video-modal").count() == 1
        page.wait_for_function(
            "(selector) => { const video = document.querySelector(selector);"
            " return video && video.readyState >= 3 && !video.paused && video.currentTime > 0; }",
            arg=".h1-okr-video-modal .h1-okr-video-player",
        )
        page.keyboard.press("Escape")
        modal.wait_for(state="detached")

    tvc.screenshot(path=str(SCREENSHOT))
    next_page = page.locator('[data-page-id="okr-superapp-activation"]')
    next_page.scroll_into_view_if_needed()
    page.wait_for_timeout(250)
    assert tvc.locator(".h1-okr-inline-video-player").count() == 0
    assert tvc.locator(".h1-okr-inline-video-trigger").count() == 4
    assert page.locator(".h1-okr-video-modal").count() == 0

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
    assert shell_tvc.locator(".h1-okr-inline-video-trigger").count() == 4
    assert shell_tvc.locator(".h1-okr-inline-video-player").count() == 0
    assert shell_tvc.locator("text=UAE").count() == 0
    shell_tvc.locator(".h1-okr-inline-video-trigger").first.click()
    shell_modal = shell_frame.locator(".h1-okr-video-modal")
    shell_modal.wait_for(state="visible")
    assert "tvc-brand-main-web.mp4" in (
        shell_modal.locator(".h1-okr-video-player").get_attribute("src") or ""
    )
    shell_modal.locator(".h1-okr-video-modal-close").click()
    shell_modal.wait_for(state="detached")
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
