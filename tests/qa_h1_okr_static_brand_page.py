from playwright.sync_api import sync_playwright


URL = "http://127.0.0.1:4180/index.html?report=h1&embedded=1"
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"


def main() -> None:
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(
            headless=True,
            executable_path=CHROME,
        )
        page = browser.new_page(viewport={"width": 1920, "height": 1080})
        page.goto(URL)
        page.wait_for_load_state("networkidle")

        review = page.locator('[data-page-id="okr-review"]')
        operating_system = page.locator(
            '[data-page-id="okr-brand-operating-system"]'
        )
        assert review.locator("button").count() == 0
        assert operating_system.locator("button").count() == 0

        operating_system.scroll_into_view_if_needed()
        box = operating_system.bounding_box()
        assert box
        for x_ratio, y_ratio in (
            (0.53, 0.45),
            (0.35, 0.68),
            (0.72, 0.68),
        ):
            page.mouse.click(
                box["x"] + box["width"] * x_ratio,
                box["y"] + box["height"] * y_ratio,
            )
            assert page.locator(".h1-okr-exact-modal").count() == 0
            assert page.locator(".h1-okr-video-modal").count() == 0

        browser.close()
        print("05/31 has no hotspots and stayed static after three pointer clicks.")


if __name__ == "__main__":
    main()
