import os

from playwright.sync_api import sync_playwright


BASE_URL = os.environ.get("H1_STATIC_PAGES_TEST_URL", "http://127.0.0.1:4182")
STATIC_PAGE_IDS = ("okr-brand-experience-audit", "okr-awards")


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

    for page_id in STATIC_PAGE_IDS:
        report_page = page.locator(f'[data-page-id="{page_id}"]')
        report_page.scroll_into_view_if_needed()
        report_page.wait_for(state="visible")
        assert report_page.locator(".h1-okr-image-hotspot").count() == 0
        assert report_page.get_by_role(
            "button", name="放大查看", exact=False
        ).count() == 0

    assert page.locator(
        '[data-page-id="okr-ai-recommendation"] .h1-okr-image-hotspot'
    ).count() == 9
    assert page.get_by_role("dialog").count() == 0
    assert not errors, f"page errors: {errors}"

    browser.close()

print(
    "Browser QA passed; brand-experience audit and awards are fully static, "
    "while the AI recommendation page retains all nine lightbox hotspots."
)
