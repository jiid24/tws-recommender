"""Baseline visual QA for the main TWS Recommender routes.

Run with the frontend and backend already available:
    python scripts/visual_qa.py
"""

from __future__ import annotations

import argparse
import sys

from playwright.sync_api import Error as PlaywrightError
from playwright.sync_api import sync_playwright


VIEWPORTS = (
    (375, 812),
    (768, 1024),
    (1024, 768),
    (1440, 900),
)
STATIC_ROUTES = ("/", "/recommend", "/product", "/faq")


def assert_layout(page, route: str, width: int, height: int) -> None:
    page.set_viewport_size({"width": width, "height": height})
    page.goto(route, wait_until="commit", timeout=10_000)
    page.locator("body").wait_for(state="visible", timeout=10_000)
    page.locator("h1").first.wait_for(state="visible", timeout=10_000)
    overflow = page.evaluate("document.documentElement.scrollWidth > window.innerWidth + 1")
    heading_count = page.locator("h1").count()
    title = page.title()

    if overflow:
        raise AssertionError(f"horizontal overflow at {width}x{height}")
    if heading_count != 1:
        raise AssertionError(f"expected one h1, found {heading_count}")
    if "TWS Recommender" not in title:
        raise AssertionError(f"missing site title in metadata: {title!r}")


def main() -> int:
    parser = argparse.ArgumentParser(description="Run visual baseline checks for TWS Recommender.")
    parser.add_argument("--base-url", default="http://localhost:3000", help="Frontend base URL")
    args = parser.parse_args()

    failures: list[str] = []
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            for route in STATIC_ROUTES:
                for width, height in VIEWPORTS:
                    try:
                        assert_layout(page, f"{args.base_url}{route}", width, height)
                        print(f"PASS {route} at {width}x{height}", flush=True)
                        if route == "/product":
                            product_links = page.locator('a[href^="/product/"]')
                            detail_path = (
                                product_links.first.get_attribute("href")
                                if product_links.count() > 0
                                else None
                            )
                            if detail_path:
                                assert_layout(page, f"{args.base_url}{detail_path}", width, height)
                                print(f"PASS {detail_path} at {width}x{height}", flush=True)
                            else:
                                print(
                                    f"SKIP product detail at {width}x{height}: catalog API has no available product",
                                    flush=True,
                                )
                    except (AssertionError, PlaywrightError) as error:
                        failures.append(f"FAIL {route} at {width}x{height}: {error}")
        finally:
            browser.close()

    if failures:
        print("\n".join(failures), file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
