import * as React from "react"
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { DataTable } from "../data-table"
import type {
  ColumnGroupRow,
  ContextMenuItem,
  DataTableColumn,
  DataTableRef,
} from "../types"

interface Product {
  id: string
  name: string
  category: string
  price: number
}

const sampleProducts: Product[] = [
  { id: "1", name: "Laptop", category: "Electronics", price: 1200 },
  { id: "2", name: "Headphones", category: "Electronics", price: 150 },
  { id: "3", name: "Monitor", category: "Electronics", price: 400 },
  { id: "4", name: "Desk Chair", category: "Furniture", price: 300 },
  { id: "5", name: "Standing Desk", category: "Furniture", price: 650 },
]

const baseColumns: DataTableColumn<Product>[] = [
  { field: "name", header: "Name", sortable: true, filterable: true },
  { field: "category", header: "Category", sortable: true, filterable: true },
  {
    field: "price",
    header: "Price",
    sortable: true,
    filterable: true,
    filterType: "number",
  },
]

describe("DataTable Advanced Features", () => {
  beforeEach(() => {
    window.localStorage.clear()
    window.sessionStorage.clear()
  })

  describe("Virtual Scroll", () => {
    it("renders a virtualized subset of 1,000 rows and supports scrollToIndex", () => {
      const largeData: Product[] = Array.from({ length: 1000 }, (_, i) => ({
        id: String(i + 1),
        name: `Product ${i + 1}`,
        category: i % 2 === 0 ? "Electronics" : "Furniture",
        price: (i + 1) * 10,
      }))

      const ref = React.createRef<DataTableRef<Product>>()

      const { container } = render(
        <DataTable
          ref={ref}
          data={largeData}
          columns={baseColumns}
          dataKey="id"
          scrollHeight="400px"
          virtualScrollerOptions={{ itemSize: 40, overscan: 5 }}
        />
      )

      const scrollContainer = container.querySelector<HTMLElement>(
        '[data-slot="data-table-container"]'
      )
      expect(scrollContainer).not.toBeNull()

      if (scrollContainer) {
        Object.defineProperty(scrollContainer, "clientHeight", {
          configurable: true,
          value: 400,
        })
        Object.defineProperty(scrollContainer, "scrollHeight", {
          configurable: true,
          value: 40000,
        })
        scrollContainer.getBoundingClientRect = () =>
          ({
            width: 800,
            height: 400,
            top: 0,
            left: 0,
            bottom: 400,
            right: 800,
            x: 0,
            y: 0,
            toJSON: () => {},
          }) as DOMRect
      }

      const renderedRows = container.querySelectorAll("tbody tr")
      // Virtualized rendering renders far fewer than 1,000 rows in the DOM
      expect(renderedRows.length).toBeLessThan(100)

      expect(() => {
        React.act(() => {
          ref.current?.scrollToIndex(500)
        })
      }).not.toThrow()
    })
  })

  describe("filterDisplay='menu'", () => {
    it("opens popover, selects matchMode, applies filter, and clears filter", async () => {
      const user = userEvent.setup()
      render(
        <DataTable
          data={sampleProducts}
          columns={baseColumns}
          dataKey="id"
          filterDisplay="menu"
        />
      )

      expect(screen.getByText("Laptop")).toBeInTheDocument()
      expect(screen.getByText("Headphones")).toBeInTheDocument()

      // Open the Price column filter menu
      await user.click(screen.getByRole("button", { name: "Filter price" }))

      // Select match mode "Greater than" (gt)
      const matchModeTrigger = await screen.findByRole("combobox")
      await user.click(matchModeTrigger)
      await user.click(await screen.findByRole("option", { name: "Greater than" }))

      // Enter numeric threshold
      const filterInput = screen.getByPlaceholderText("Filter...")
      await user.clear(filterInput)
      await user.type(filterInput, "500")

      // Click Apply
      await user.click(screen.getByRole("button", { name: "Apply" }))

      await waitFor(() => {
        expect(screen.getByText("Laptop")).toBeInTheDocument()
        expect(screen.getByText("Standing Desk")).toBeInTheDocument()
        expect(screen.queryByText("Headphones")).not.toBeInTheDocument()
        expect(screen.queryByText("Desk Chair")).not.toBeInTheDocument()
      })

      // Re-open menu and click Clear
      await user.click(screen.getByRole("button", { name: "Filter price" }))
      await user.click(await screen.findByRole("button", { name: "Clear" }))

      await waitFor(() => {
        expect(screen.getByText("Headphones")).toBeInTheDocument()
        expect(screen.getByText("Desk Chair")).toBeInTheDocument()
      })
    })
  })

  describe("headerColumnGroup & footerColumnGroup", () => {
    it("renders multi-row grouped headers with colSpan and grouped footers", () => {
      const headerColumnGroup: ColumnGroupRow[] = [
        {
          cells: [
            { header: "Product Info", colSpan: 2, align: "center" },
            { header: "Pricing", colSpan: 1, align: "right" },
          ],
        },
      ]

      const footerColumnGroup: ColumnGroupRow[] = [
        {
          cells: [
            { footer: "Summary", colSpan: 2 },
            { footer: "$2,700", align: "right" },
          ],
        },
      ]

      const { container } = render(
        <DataTable
          data={sampleProducts}
          columns={baseColumns}
          dataKey="id"
          headerColumnGroup={headerColumnGroup}
          footerColumnGroup={footerColumnGroup}
        />
      )

      const productInfoHeader = screen.getByRole("columnheader", {
        name: "Product Info",
      })
      expect(productInfoHeader).toHaveAttribute("colspan", "2")
      expect(
        screen.getByRole("columnheader", { name: "Pricing" })
      ).toHaveAttribute("colspan", "1")

      const tfoot = container.querySelector("tfoot")
      expect(tfoot).not.toBeNull()
      const summaryCell = within(tfoot!).getByText("Summary").closest("td")
      expect(summaryCell).toHaveAttribute("colspan", "2")
      expect(within(tfoot!).getByText("$2,700")).toBeInTheDocument()
    })
  })

  describe("frozen columns & frozenValue pinned rows", () => {
    it("applies sticky positioning to frozen columns and keeps frozenValue rows pinned at the top", () => {
      const frozenCols: DataTableColumn<Product>[] = [
        { field: "name", header: "Name", frozen: true, alignFrozen: "left" },
        { field: "category", header: "Category" },
        { field: "price", header: "Price", frozen: true, alignFrozen: "right" },
      ]

      const pinnedTop: Product[] = [
        { id: "pinned-1", name: "Pinned Flagship", category: "VIP", price: 9999 },
      ]

      const { container } = render(
        <DataTable
          data={sampleProducts}
          columns={frozenCols}
          dataKey="id"
          scrollable
          frozenValue={pinnedTop}
        />
      )

      const nameHeader = screen.getByRole("columnheader", { name: "Name" })
      const priceHeader = screen.getByRole("columnheader", { name: "Price" })
      expect(nameHeader).toHaveStyle({ position: "sticky" })
      expect(priceHeader).toHaveStyle({ position: "sticky" })

      const tbodyRows = Array.from(container.querySelectorAll("tbody tr"))
      expect(tbodyRows[0]).toHaveTextContent("Pinned Flagship")
      expect(tbodyRows[0]).toHaveClass("bg-muted/60")
      const pinnedRowFirstCell = tbodyRows[0]?.querySelector("td")
      expect(pinnedRowFirstCell).toHaveStyle({ position: "sticky" })
    })
  })

  describe("contextMenuItems", () => {
    it("opens context menu on row right-click and triggers onSelect", async () => {
      const user = userEvent.setup()
      const onInspect = vi.fn()
      const menuItems: ContextMenuItem<Product>[] = [
        {
          id: "inspect",
          label: "Inspect Product",
          onSelect: onInspect,
        },
      ]

      render(
        <DataTable
          data={sampleProducts.slice(0, 3)}
          columns={baseColumns}
          dataKey="id"
          contextMenuItems={menuItems}
        />
      )

      const laptopRow = screen.getByText("Laptop").closest("tr")
      expect(laptopRow).not.toBeNull()

      fireEvent.contextMenu(laptopRow!)

      const menuItem = await screen.findByText("Inspect Product")
      expect(menuItem).toBeInTheDocument()

      await user.click(menuItem)
      expect(onInspect).toHaveBeenCalledWith(sampleProducts[0], 0)
    })
  })

  describe("rowGroupMode='rowspan'", () => {
    it("merges adjacent identical group cells using rowSpan", () => {
      const { container } = render(
        <DataTable
          data={sampleProducts}
          columns={baseColumns}
          dataKey="id"
          rowGroupMode="rowspan"
          groupRowsBy="category"
        />
      )

      // Electronics has 3 consecutive rows, Furniture has 2 consecutive rows
      const electronicsCell = screen.getByText("Electronics").closest("td")
      const furnitureCell = screen.getByText("Furniture").closest("td")

      expect(electronicsCell).toHaveAttribute("rowspan", "3")
      expect(furnitureCell).toHaveAttribute("rowspan", "2")

      // Total rendered "Electronics" cells should be 1 (merged), not 3
      expect(screen.getAllByText("Electronics")).toHaveLength(1)
      expect(screen.getAllByText("Furniture")).toHaveLength(1)
      expect(container.querySelectorAll("tbody tr")).toHaveLength(5)
    })
  })

  describe("responsiveLayout='stack'", () => {
    it("sets data-responsive-stack on table and data-label on body cells", () => {
      const { container } = render(
        <DataTable
          data={sampleProducts.slice(0, 2)}
          columns={baseColumns}
          dataKey="id"
          responsiveLayout="stack"
          breakpoint="md"
        />
      )

      const stackContainer = container.querySelector(
        '[data-slot="data-table-container"]'
      )
      expect(stackContainer).toHaveAttribute("data-responsive-stack", "md")

      const firstRowCells = container.querySelectorAll("tbody tr:first-child td")
      expect(firstRowCells[0]).toHaveAttribute("data-label", "Name")
      expect(firstRowCells[1]).toHaveAttribute("data-label", "Category")
      expect(firstRowCells[2]).toHaveAttribute("data-label", "Price")
    })
  })

  describe("stateStorage='session'", () => {
    it("persists and restores table state in sessionStorage", async () => {
      const user = userEvent.setup()
      const stateKey = "test-session-datatable"

      const { unmount } = render(
        <DataTable
          data={sampleProducts}
          columns={baseColumns}
          dataKey="id"
          stateStorage="session"
          stateKey={stateKey}
          enableGlobalFilter
        />
      )

      const searchInput = screen.getByLabelText("Global search")
      await user.type(searchInput, "Laptop")

      await waitFor(() => {
        const stored = window.sessionStorage.getItem(stateKey)
        expect(stored).not.toBeNull()
        expect(JSON.parse(stored!).globalFilter).toBe("Laptop")
      })

      unmount()

      render(
        <DataTable
          data={sampleProducts}
          columns={baseColumns}
          dataKey="id"
          stateStorage="session"
          stateKey={stateKey}
          enableGlobalFilter
        />
      )

      expect(screen.getByLabelText("Global search")).toHaveValue("Laptop")
      expect(screen.getByText("Laptop")).toBeInTheDocument()
      expect(screen.queryByText("Headphones")).not.toBeInTheDocument()
    })
  })
})
