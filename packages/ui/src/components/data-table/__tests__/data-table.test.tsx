import * as React from "react"
import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { DataTable } from "../data-table"
import type { DataTableColumn, DataTableRef } from "../types"

interface Product {
  id: string
  name: string
  category: string
  price: number
  inStock: boolean
}

const sampleProducts: Product[] = [
  { id: "1", name: "Laptop", category: "Electronics", price: 1200, inStock: true },
  { id: "2", name: "Desk Chair", category: "Furniture", price: 300, inStock: true },
  { id: "3", name: "Headphones", category: "Electronics", price: 150, inStock: false },
  { id: "4", name: "Monitor", category: "Electronics", price: 400, inStock: true },
  { id: "5", name: "Standing Desk", category: "Furniture", price: 650, inStock: true },
  { id: "6", name: "Keyboard", category: "Electronics", price: 100, inStock: true },
]

const baseColumns: DataTableColumn<Product>[] = [
  { field: "name", header: "Name", sortable: true, filterable: true },
  { field: "category", header: "Category", sortable: true, filterable: true },
  { field: "price", header: "Price", sortable: true, filterType: "number" },
]

function getBodyDataRows(container: HTMLElement): HTMLElement[] {
  const tbody = container.querySelector("tbody")
  if (!tbody) return []
  return Array.from(tbody.querySelectorAll("tr"))
}

describe("DataTable", () => {
  beforeEach(() => {
    window.localStorage.clear()
    window.sessionStorage.clear()
  })

  describe("basic rendering & visual variants", () => {
    it("renders rows, size variants, stripedRows, and showGridlines", () => {
      const { container, rerender } = render(
        <DataTable
          data={sampleProducts.slice(0, 3)}
          columns={baseColumns}
          dataKey="id"
          size="sm"
          stripedRows
          showGridlines
        />
      )

      const rows = getBodyDataRows(container)
      expect(rows).toHaveLength(3)
      expect(screen.getByText("Laptop")).toBeInTheDocument()
      expect(screen.getByText("Desk Chair")).toBeInTheDocument()

      // size="sm" applies px-2 py-1 text-xs to body cells
      const firstCell = rows[0]!.querySelector("td")
      expect(firstCell).toHaveClass("px-2", "py-1", "text-xs")
      // showGridlines applies border-r
      expect(firstCell).toHaveClass("border-r")
      // stripedRows applies bg-muted/30 on odd-indexed rows
      expect(rows[1]).toHaveClass("bg-muted/30")

      rerender(
        <DataTable
          data={sampleProducts.slice(0, 3)}
          columns={baseColumns}
          dataKey="id"
          size="lg"
        />
      )
      const lgCell = getBodyDataRows(container)[0]!.querySelector("td")
      expect(lgCell).toHaveClass("px-4", "py-3", "text-base")
    })

    it("renders loading skeletons and custom emptyMessage", () => {
      const { container, rerender } = render(
        <DataTable
          data={sampleProducts}
          columns={baseColumns}
          loading
          skeletonRows={4}
        />
      )

      expect(screen.getByRole("grid")).toHaveAttribute("aria-busy", "true")
      expect(getBodyDataRows(container)).toHaveLength(4)
      expect(screen.queryByText("Laptop")).not.toBeInTheDocument()

      rerender(
        <DataTable
          data={[]}
          columns={baseColumns}
          emptyMessage="Nothing to display here"
        />
      )
      expect(screen.getByText("Nothing to display here")).toBeInTheDocument()
    })
  })

  describe("sorting", () => {
    it("cycles single column sorting asc -> desc -> none with removableSort", async () => {
      const user = userEvent.setup()
      const { container } = render(
        <DataTable
          data={sampleProducts.slice(0, 3)}
          columns={baseColumns}
          dataKey="id"
          removableSort
        />
      )

      const nameSortBtn = screen.getByRole("button", { name: /Name/i })

      // Initial order: Laptop, Desk Chair, Headphones
      expect(getBodyDataRows(container)[0]).toHaveTextContent("Laptop")

      // Click 1: ascending -> Desk Chair, Headphones, Laptop
      await user.click(nameSortBtn)
      expect(getBodyDataRows(container)[0]).toHaveTextContent("Desk Chair")
      expect(getBodyDataRows(container)[2]).toHaveTextContent("Laptop")

      // Click 2: descending -> Laptop, Headphones, Desk Chair
      await user.click(nameSortBtn)
      expect(getBodyDataRows(container)[0]).toHaveTextContent("Laptop")
      expect(getBodyDataRows(container)[2]).toHaveTextContent("Desk Chair")

      // Click 3: cleared -> original order (Laptop, Desk Chair, Headphones)
      await user.click(nameSortBtn)
      expect(getBodyDataRows(container)[0]).toHaveTextContent("Laptop")
      expect(getBodyDataRows(container)[1]).toHaveTextContent("Desk Chair")
    })

    it("supports multi-column sorting when sortMode='multiple'", async () => {
      const user = userEvent.setup()
      const { container } = render(
        <DataTable
          data={sampleProducts.slice(0, 4)}
          columns={baseColumns}
          dataKey="id"
          sortMode="multiple"
        />
      )

      const categoryBtn = screen.getByRole("button", { name: /Category/i })
      const priceBtn = screen.getByRole("button", { name: /Price/i })

      await user.click(categoryBtn)
      await user.click(priceBtn)

      // Category asc (Electronics then Furniture); numeric Price defaults to desc on first click (1200, 400, 150)
      const rows = getBodyDataRows(container)
      expect(rows[0]).toHaveTextContent("Laptop")
      expect(rows[1]).toHaveTextContent("Monitor")
      expect(rows[2]).toHaveTextContent("Headphones")
      expect(rows[3]).toHaveTextContent("Desk Chair")
    })
  })

  describe("filtering", () => {
    it("filters with enableGlobalFilter and clears with Clear Filters button", async () => {
      const user = userEvent.setup()
      render(
        <DataTable
          data={sampleProducts}
          columns={baseColumns}
          dataKey="id"
          enableGlobalFilter
          globalFilterPlaceholder="Search products..."
        />
      )

      const searchInput = screen.getByPlaceholderText("Search products...")
      await user.type(searchInput, "Desk")

      await waitFor(
        () => {
          expect(screen.getByText("Desk Chair")).toBeInTheDocument()
          expect(screen.getByText("Standing Desk")).toBeInTheDocument()
          expect(screen.queryByText("Laptop")).not.toBeInTheDocument()
        },
        { timeout: 1000 }
      )

      const clearBtn = screen.getByRole("button", { name: /Clear Filters/i })
      await user.click(clearBtn)

      await waitFor(() => {
        expect(screen.getByText("Laptop")).toBeInTheDocument()
        expect(screen.getByText("Headphones")).toBeInTheDocument()
      })
    })

    it("filters inline with filterDisplay='row'", async () => {
      const user = userEvent.setup()
      render(
        <DataTable
          data={sampleProducts}
          columns={baseColumns}
          dataKey="id"
          filterDisplay="row"
        />
      )

      const filterInputs = screen.getAllByPlaceholderText("Filter...")
      await user.type(filterInputs[1]!, "Furniture")

      expect(screen.getByText("Desk Chair")).toBeInTheDocument()
      expect(screen.getByText("Standing Desk")).toBeInTheDocument()
      expect(screen.queryByText("Laptop")).not.toBeInTheDocument()
    })
  })

  describe("pagination", () => {
    it("paginates rows, navigates pages, changes rowsPerPageOptions, and formats report", async () => {
      const user = userEvent.setup()
      render(
        <DataTable
          data={sampleProducts}
          columns={baseColumns}
          dataKey="id"
          paginator
          rows={2}
          rowsPerPageOptions={[2, 4, 6]}
          currentPageReportTemplate="{first}-{last} of {totalRecords}"
        />
      )

      expect(screen.getByText("1-2 of 6")).toBeInTheDocument()
      expect(screen.getByText("Laptop")).toBeInTheDocument()
      expect(screen.queryByText("Headphones")).not.toBeInTheDocument()

      await user.click(screen.getByRole("button", { name: "Next page" }))
      expect(screen.getByText("3-4 of 6")).toBeInTheDocument()
      expect(screen.getByText("Headphones")).toBeInTheDocument()
      expect(screen.queryByText("Laptop")).not.toBeInTheDocument()

      await user.click(screen.getByRole("button", { name: "Previous page" }))
      expect(screen.getByText("1-2 of 6")).toBeInTheDocument()

      // Change page size via Select
      const rowsPerPageTrigger = screen.getByLabelText("Rows per page")
      await user.click(rowsPerPageTrigger)
      const option4 = await screen.findByRole("option", { name: "4" })
      await user.click(option4)

      expect(screen.getByText("1-4 of 6")).toBeInTheDocument()
      expect(screen.getByText("Monitor")).toBeInTheDocument()
    })
  })

  describe("selection", () => {
    it("supports checkbox selection, select all, and isRowSelectable", async () => {
      const user = userEvent.setup()
      const onSelectionChange = vi.fn()
      render(
        <DataTable
          data={sampleProducts.slice(0, 3)}
          columns={baseColumns}
          dataKey="id"
          selectionMode="checkbox"
          isRowSelectable={(row) => row.inStock}
          onSelectionChange={onSelectionChange}
        />
      )

      const row3Checkbox = screen.getByRole("checkbox", { name: "Select row 3" })
      expect(row3Checkbox).toHaveAttribute("aria-disabled", "true")

      const row1Checkbox = screen.getByRole("checkbox", { name: "Select row 1" })
      await user.click(row1Checkbox)
      expect(onSelectionChange).toHaveBeenLastCalledWith([sampleProducts[0]])

      const selectAll = screen.getByRole("checkbox", { name: "Select all rows" })
      await user.click(selectAll)
      // Only selectable rows (1 and 2) are selected
      expect(onSelectionChange).toHaveBeenLastCalledWith([
        sampleProducts[0],
        sampleProducts[1],
      ])
    })

    it("supports radiobutton and single row click selection", async () => {
      const user = userEvent.setup()
      const onSelectionChange = vi.fn()
      const { rerender } = render(
        <DataTable
          data={sampleProducts.slice(0, 3)}
          columns={baseColumns}
          dataKey="id"
          selectionMode="radiobutton"
          onSelectionChange={onSelectionChange}
        />
      )

      const radio2 = screen.getByRole("radio", { name: "Select row 2" })
      await user.click(radio2)
      expect(onSelectionChange).toHaveBeenLastCalledWith(sampleProducts[1])

      onSelectionChange.mockClear()
      rerender(
        <DataTable
          data={sampleProducts.slice(0, 3)}
          columns={baseColumns}
          dataKey="id"
          selectionMode="single"
          onSelectionChange={onSelectionChange}
        />
      )

      await user.click(screen.getByText("Headphones"))
      expect(onSelectionChange).toHaveBeenLastCalledWith(sampleProducts[2])
    })
  })

  describe("row expansion", () => {
    it("expands and collapses rows with rowExpansionTemplate", async () => {
      const user = userEvent.setup()
      render(
        <DataTable
          data={sampleProducts.slice(0, 2)}
          columns={baseColumns}
          dataKey="id"
          expandableRows
          rowExpansionTemplate={(row) => (
            <div>Details for {row.name}</div>
          )}
        />
      )

      expect(screen.queryByText("Details for Laptop")).not.toBeInTheDocument()

      const expandButtons = screen.getAllByRole("button", { name: "Expand row" })
      await user.click(expandButtons[0]!)
      expect(screen.getByText("Details for Laptop")).toBeInTheDocument()

      const collapseBtn = screen.getByRole("button", { name: "Collapse row" })
      await user.click(collapseBtn)
      expect(screen.queryByText("Details for Laptop")).not.toBeInTheDocument()
    })
  })

  describe("row grouping & footer aggregation", () => {
    it("renders subheader row grouping, expandableRowGroups, group footers, and table footer aggregation", async () => {
      const user = userEvent.setup()
      const columnsWithAgg: DataTableColumn<Product>[] = [
        { field: "name", header: "Name", footer: "Totals" },
        { field: "category", header: "Category" },
        { field: "price", header: "Price", aggregation: "sum" },
      ]

      render(
        <DataTable
          data={sampleProducts.slice(0, 4)}
          columns={columnsWithAgg}
          dataKey="id"
          rowGroupMode="subheader"
          groupRowsBy="category"
          expandableRowGroups
          rowGroupHeaderTemplate={(groupVal, groupRows) => (
            <span>
              Group: {String(groupVal)} ({groupRows.length})
            </span>
          )}
          rowGroupFooterTemplate={(groupVal, groupRows) => (
            <span>
              End of {String(groupVal)} ({groupRows.length})
            </span>
          )}
        />
      )

      expect(screen.getByText("Group: Electronics (3)")).toBeInTheDocument()
      expect(screen.getByText("Group: Furniture (1)")).toBeInTheDocument()
      expect(screen.getByText("End of Electronics (3)")).toBeInTheDocument()

      // Footer aggregation sum: 1200 + 300 + 150 + 400 = 2050
      expect(screen.getByText("Totals")).toBeInTheDocument()
      expect(screen.getByText("2050")).toBeInTheDocument()

      // Collapse first group (Electronics)
      const collapseGroupButtons = screen.getAllByRole("button", {
        name: "Collapse group",
      })
      await user.click(collapseGroupButtons[0]!)

      expect(screen.queryByText("Laptop")).not.toBeInTheDocument()
      expect(screen.getByText("Desk Chair")).toBeInTheDocument()
    })
  })

  describe("inline editing", () => {
    it("commits cell edit in editMode='cell'", async () => {
      const user = userEvent.setup()
      const onCellEditComplete = vi.fn()
      const editableCols: DataTableColumn<Product>[] = [
        { field: "name", header: "Name", editable: true },
        { field: "price", header: "Price" },
      ]

      render(
        <DataTable
          data={sampleProducts.slice(0, 2)}
          columns={editableCols}
          dataKey="id"
          editMode="cell"
          onCellEditComplete={onCellEditComplete}
        />
      )

      await user.click(screen.getByText("Laptop"))
      const input = screen.getByDisplayValue("Laptop")
      await user.clear(input)
      await user.type(input, "Gaming Laptop{Enter}")

      expect(onCellEditComplete).toHaveBeenCalledWith(
        expect.objectContaining({
          field: "name",
          value: "Laptop",
          newValue: "Gaming Laptop",
          rowIndex: 0,
        })
      )
    })

    it("commits and cancels row edit in editMode='row'", async () => {
      const user = userEvent.setup()
      const onRowEditComplete = vi.fn()
      const onRowEditCancel = vi.fn()
      const editableCols: DataTableColumn<Product>[] = [
        { field: "name", header: "Name", editable: true },
        { field: "category", header: "Category", editable: true },
      ]

      render(
        <DataTable
          data={sampleProducts.slice(0, 2)}
          columns={editableCols}
          dataKey="id"
          editMode="row"
          onRowEditComplete={onRowEditComplete}
          onRowEditCancel={onRowEditCancel}
        />
      )

      const editButtons = screen.getAllByRole("button", { name: "Edit row" })
      await user.click(editButtons[0]!)

      const nameInput = screen.getByDisplayValue("Laptop")
      await user.clear(nameInput)
      await user.type(nameInput, "Ultrabook")

      await user.click(screen.getByRole("button", { name: "Save row" }))
      expect(onRowEditComplete).toHaveBeenCalledWith(
        expect.objectContaining({
          index: 0,
          newData: expect.objectContaining({ name: "Ultrabook" }),
        })
      )

      // Now test cancel on second row
      const editButtonsAfter = screen.getAllByRole("button", { name: "Edit row" })
      await user.click(editButtonsAfter[1]!)
      await user.click(screen.getByRole("button", { name: "Cancel row edit" }))
      expect(onRowEditCancel).toHaveBeenCalledWith(sampleProducts[1], 1)
    })
  })

  describe("columnToggle & DataTableRef", () => {
    it("toggles column visibility via columnToggle menu", async () => {
      const user = userEvent.setup()
      render(
        <DataTable
          data={sampleProducts.slice(0, 2)}
          columns={baseColumns}
          dataKey="id"
          columnToggle
        />
      )

      expect(screen.getByText("Price")).toBeInTheDocument()

      await user.click(screen.getByRole("button", { name: /Columns/i }))
      const menu = await screen.findByRole("menu")
      const priceToggle = within(menu).getByRole("menuitemcheckbox", {
        name: "Price",
      })
      await user.click(priceToggle)

      await waitFor(() => {
        expect(screen.queryByText("1200")).not.toBeInTheDocument()
      })
    })

    it("exposes imperative DataTableRef methods", async () => {
      const createObjectURL = vi.fn(() => "blob:mock")
      const revokeObjectURL = vi.fn()
      Object.defineProperty(URL, "createObjectURL", {
        value: createObjectURL,
        writable: true,
      })
      Object.defineProperty(URL, "revokeObjectURL", {
        value: revokeObjectURL,
        writable: true,
      })

      const ref = React.createRef<DataTableRef<Product>>()
      const user = userEvent.setup()

      render(
        <DataTable
          ref={ref}
          data={sampleProducts.slice(0, 3)}
          columns={baseColumns}
          dataKey="id"
          selectionMode="checkbox"
          expandableRows
          rowExpansionTemplate={(row) => <div>Expanded {row.name}</div>}
          filterDisplay="row"
        />
      )

      expect(ref.current).not.toBeNull()

      // exportCSV & exportJSON
      const csv = ref.current!.exportCSV()
      expect(csv).toContain("Name,Category,Price")
      expect(csv).toContain("Laptop,Electronics,1200")

      const json = ref.current!.exportJSON()
      expect(JSON.parse(json)).toHaveLength(3)

      // expandAll / collapseAll
      React.act(() => {
        ref.current!.expandAll()
      })
      expect(screen.getByText("Expanded Laptop")).toBeInTheDocument()
      expect(screen.getByText("Expanded Desk Chair")).toBeInTheDocument()

      React.act(() => {
        ref.current!.collapseAll()
      })
      expect(screen.queryByText("Expanded Laptop")).not.toBeInTheDocument()

      // clearFilters
      const filterInputs = screen.getAllByPlaceholderText("Filter...")
      await user.type(filterInputs[0]!, "Laptop")
      expect(screen.queryByText("Desk Chair")).not.toBeInTheDocument()
      React.act(() => {
        ref.current!.clearFilters()
      })
      expect(screen.getByText("Desk Chair")).toBeInTheDocument()

      // clearSorting
      await user.click(screen.getByRole("button", { name: /Name/i }))
      expect(ref.current!.getTable().getState().sorting).toHaveLength(1)
      React.act(() => {
        ref.current!.clearSorting()
      })
      expect(ref.current!.getTable().getState().sorting).toHaveLength(0)

      // clearSelection
      await user.click(screen.getByRole("checkbox", { name: "Select row 1" }))
      expect(
        Object.keys(ref.current!.getTable().getState().rowSelection)
      ).toHaveLength(1)
      React.act(() => {
        ref.current!.clearSelection()
      })
      expect(
        Object.keys(ref.current!.getTable().getState().rowSelection)
      ).toHaveLength(0)

      // reset
      React.act(() => {
        ref.current!.expandAll()
        ref.current!.reset()
      })
      expect(screen.queryByText("Expanded Laptop")).not.toBeInTheDocument()
    })
  })

  describe("lazy mode & state persistence", () => {
    it("fires onLazyLoad when sorting or pagination changes in lazy mode", async () => {
      const user = userEvent.setup()
      const onLazyLoad = vi.fn()

      render(
        <DataTable
          data={sampleProducts.slice(0, 2)}
          columns={baseColumns}
          dataKey="id"
          lazy
          paginator
          rows={2}
          totalRecords={6}
          onLazyLoad={onLazyLoad}
        />
      )

      expect(onLazyLoad).toHaveBeenCalledWith(
        expect.objectContaining({
          first: 0,
          rows: 2,
          page: 0,
          sorting: [],
        })
      )

      await user.click(screen.getByRole("button", { name: /Name/i }))
      expect(onLazyLoad).toHaveBeenLastCalledWith(
        expect.objectContaining({
          sorting: [{ id: "name", desc: false }],
        })
      )

      await user.click(screen.getByRole("button", { name: "Next page" }))
      expect(onLazyLoad).toHaveBeenLastCalledWith(
        expect.objectContaining({
          first: 2,
          rows: 2,
          page: 1,
        })
      )
    })

    it("persists and restores state with stateStorage='local'", async () => {
      const user = userEvent.setup()
      const storageKey = "dt-test-local-state"

      const { unmount } = render(
        <DataTable
          data={sampleProducts}
          columns={baseColumns}
          dataKey="id"
          stateStorage="local"
          stateKey={storageKey}
        />
      )

      await user.click(screen.getByRole("button", { name: /Name/i }))

      const rawSaved = window.localStorage.getItem(storageKey)
      expect(rawSaved).not.toBeNull()
      const saved = JSON.parse(rawSaved!) as { sorting: Array<{ id: string; desc: boolean }> }
      expect(saved.sorting).toEqual([{ id: "name", desc: false }])

      unmount()

      const ref = React.createRef<DataTableRef<Product>>()
      render(
        <DataTable
          ref={ref}
          data={sampleProducts}
          columns={baseColumns}
          dataKey="id"
          stateStorage="local"
          stateKey={storageKey}
        />
      )

      expect(ref.current!.getTable().getState().sorting).toEqual([
        { id: "name", desc: false },
      ])
    })
  })
})
