import os
from pathlib import Path

from playwright.sync_api import sync_playwright


PAGE_ID = "okr-merchandise"
DESTINATION = "https://vantage-objects-452443727878.asia-southeast1.run.app/"
BASE_URL = os.environ.get("H1_MERCHANDISE_TEST_URL", "http://127.0.0.1:4182")
SCREENSHOT = Path("/tmp/h1-okr-merchandise-gold-cta.png")


with sync_playwright() as playwright:
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context(viewport={"width": 1920, "height": 1080})
    page = context.new_page()
    errors = []
    page.on("pageerror", lambda error: errors.append(str(error)))
    page.goto(
        f"{BASE_URL}/index.html"
        "?report=h1&embedded=1&v=20260731-endorsement-frame45-v1",
        wait_until="networkidle",
    )

    report_page = page.locator(f'[data-page-id="{PAGE_ID}"]')
    report_page.scroll_into_view_if_needed()
    link = report_page.locator(".h1-okr-external-link")
    link.wait_for(state="visible")
    assert link.count() == 1
    assert link.get_attribute("href") == DESTINATION
    assert link.get_attribute("target") == "_blank"
    assert link.get_attribute("rel") == "noopener noreferrer"
    assert link.locator("span").inner_text() == "即刻触及"
    assert "is-gold" in (link.get_attribute("class") or "")
    report_page.screenshot(path=str(SCREENSHOT))

    with page.expect_popup() as popup_info:
        link.click()
    popup = popup_info.value
    popup.wait_for_timeout(100)
    assert popup.url.startswith(DESTINATION), popup.url
    assert page.url.startswith(BASE_URL), page.url
    assert not errors, f"page errors: {errors}"
    browser.close()

print(f"Browser QA passed; merchandise CTA opens externally; screenshot: {SCREENSHOT}")
