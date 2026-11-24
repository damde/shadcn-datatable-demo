import AxeBuilder from "@axe-core/playwright"
import { expect, test, type Page } from "@playwright/test"

const WCAG_22_AA_TAGS = [
  "wcag2a",
  "wcag2aa",
  "wcag21a",
  "wcag21aa",
  "wcag22aa",
]

async function runWcag22Audit(page: Page) {
  return new AxeBuilder({ page }).withTags(WCAG_22_AA_TAGS).analyze()
}

test.describe("DataTable Real-Browser E2E & WCAG 2.2 AA", () => {
  test("passes WCAG 2.2 AA automated audit on Playground in light and dark mode", async ({
    page,
  }) => {
    await page.goto("/")
    await expect(page.getByRole("grid")).toBeVisible()

    // Ensure initial light mode
    await expect(page.locator("html")).not.toHaveClass(/dark/)
    const lightScan = await runWcag22Audit(page)
    expect(lightScan.violations).toEqual([])

    // Switch to dark mode and verify WCAG 2.2 AA compliance
    await page.getByRole("button", { name: /Switch to Dark mode/i }).click()
    await expect(page.locator("html")).toHaveClass(/dark/)

    const darkScan = await runWcag22Audit(page)
    expect(darkScan.violations).toEqual([])
  })

  test("virtualizes 10,000 rows in real DOM, jumps to #5,000, and passes WCAG 2.2 AA", async ({
    page,
  }) => {
    await page.goto("/")
    await page.getByRole("button", { name: "Virtual Scroll (10k)" }).click()

    const container = page.locator('[data-slot="data-table-container"]')
    await expect(container).toBeVisible()

    // Initial row at index 0 should be visible
    await expect(
      page.locator('tbody tr[data-row-index="0"]')
    ).toContainText("EMP-00001")

    // Jump to row #5,000 (0-based index 4999 -> EMP-05000)
    await page.getByRole("button", { name: /Row #5,000/i }).click()

    const row5000 = page.locator('tbody tr[data-row-index="4999"]')
    await expect(row5000).toBeVisible()
    await expect(row5000).toContainText("EMP-05000")

    // Verify virtualization keeps rendered DOM row count well below total dataset size
    const renderedRows = await page.locator("tbody tr[data-row-index]").count()
    expect(renderedRows).toBeGreaterThan(0)
    expect(renderedRows).toBeLessThan(60)

    const virtualScan = await runWcag22Audit(page)
    expect(virtualScan.violations).toEqual([])
  })

  test("renders responsive mobile stack cards with flex cells and passes WCAG 2.2 AA", async ({
    page,
  }, testInfo) => {
    // Ensure mobile viewport (375x667) so responsiveLayout="stack" media query (<768px) activates
    if (testInfo.project.name !== "mobile") {
      await page.setViewportSize({ width: 375, height: 667 })
    }

    await page.goto("/")
    await expect(page.getByRole("grid")).toBeVisible()

    // Switch Playground Layout select to Stack
    const layoutTrigger = page.locator("#pg-responsive")
    await expect(layoutTrigger).toBeVisible()
    await layoutTrigger.click()
    await page.getByRole("option", { name: "Stack" }).click()

    await expect(
      page.locator('[data-slot="data-table-container"]')
    ).toHaveAttribute("data-responsive-stack", "md")

    const firstLabeledCell = page.locator("tbody td[data-label]").first()
    await expect(firstLabeledCell).toBeVisible()

    const displayValue = await firstLabeledCell.evaluate(
      (el) => window.getComputedStyle(el).display
    )
    expect(displayValue).toBe("flex")

    const mobileStackScan = await runWcag22Audit(page)
    expect(mobileStackScan.violations).toEqual([])
  })
})
