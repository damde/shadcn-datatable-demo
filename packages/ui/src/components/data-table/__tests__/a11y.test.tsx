import * as React from "react"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { axe } from "vitest-axe"
import { describe, expect, it, vi } from "vitest"
import { DataTable } from "../data-table"
import type { DataTableColumn } from "../types"

interface Product {
  id: string
  name: string
  category: string
  price: number
}

const sampleProducts: Product[] = [
  { id: "1", name: "Laptop", category: "Electronics", price: 1200 },
  { id: "2", name: "Desk Chair", category: "Furniture", price: 300 },
  { id: "3", name: "Headphones", category: "Electronics", price: 150 },
  { id: "4", name: "Monitor", category: "Electronics", price: 400 },
  { id: "5", name: "Standing Desk", category: "Furniture", price: 650 },
  { id: "6", name: "Keyboard", category: "Electronics", price: 100 },
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

describe("DataTable Accessibility (WCAG 2.2)", () => {
  describe("axe-core automated audits", () => {
    it("passes axe audit on basic DataTable with ariaLabel", async () => {
      const { container } = render(
        <DataTable
          data={sampleProducts.slice(0, 3)}
          columns={baseColumns}
          dataKey="id"
          ariaLabel="Products table"
        />
      )

      const grid = screen.getByRole("grid", { name: "Products table" })
      expect(grid).toBeInTheDocument()
      expect(await axe(container)).toHaveNoViolations()
    })

    it("passes axe audit on sortable DataTable and updates aria-sort states", async () => {
      const user = userEvent.setup()
      const { container } = render(
        <DataTable
          data={sampleProducts.slice(0, 3)}
          columns={baseColumns}
          dataKey="id"
          ariaLabel="Sortable products"
          removableSort
        />
      )

      const nameHeader = screen.getByRole("columnheader", { name: /Name/i })
      expect(nameHeader).toHaveAttribute("aria-sort", "none")

      const sortButton = screen.getByRole("button", { name: /Name/i })
      await user.click(sortButton)
      expect(nameHeader).toHaveAttribute("aria-sort", "ascending")

      await user.click(sortButton)
      expect(nameHeader).toHaveAttribute("aria-sort", "descending")

      expect(await axe(container)).toHaveNoViolations()

      await user.click(sortButton)
      expect(nameHeader).toHaveAttribute("aria-sort", "none")
    })

    it("passes axe audit on filterable DataTable (filterDisplay='row' and enableGlobalFilter)", async () => {
      const { container } = render(
        <DataTable
          data={sampleProducts}
          columns={baseColumns}
          dataKey="id"
          ariaLabel="Filterable products"
          filterDisplay="row"
          enableGlobalFilter
        />
      )

      expect(screen.getByLabelText("Global search")).toBeInTheDocument()
      expect(await axe(container)).toHaveNoViolations()
    })

    it("passes axe audit on paginated DataTable with aria-current='page'", async () => {
      const { container } = render(
        <DataTable
          data={sampleProducts}
          columns={baseColumns}
          dataKey="id"
          ariaLabel="Paginated products"
          paginator
          rows={2}
        />
      )

      expect(
        screen.getByRole("navigation", { name: "Pagination" })
      ).toBeInTheDocument()
      const page1Button = screen.getByRole("button", { name: "Page 1" })
      expect(page1Button).toHaveAttribute("aria-current", "page")

      expect(await axe(container)).toHaveNoViolations()
    })

    it("passes axe audit on checkbox and radiobutton selection modes with aria-selected", async () => {
      const user = userEvent.setup()
      const { container, rerender } = render(
        <DataTable
          data={sampleProducts.slice(0, 3)}
          columns={baseColumns}
          dataKey="id"
          ariaLabel="Checkbox selection products"
          selectionMode="checkbox"
        />
      )

      const firstCheckbox = screen.getByRole("checkbox", {
        name: "Select row 1",
      })
      await user.click(firstCheckbox)

      const rows = screen.getAllByRole("row")
      // rows[0] is header row, rows[1] is first data row
      expect(rows[1]).toHaveAttribute("aria-selected", "true")
      expect(await axe(container)).toHaveNoViolations()

      rerender(
        <DataTable
          data={sampleProducts.slice(0, 3)}
          columns={baseColumns}
          dataKey="id"
          ariaLabel="Radio selection products"
          selectionMode="radiobutton"
        />
      )

      const firstRadio = screen.getByRole("radio", { name: "Select row 1" })
      await user.click(firstRadio)
      expect(screen.getAllByRole("row")[1]).toHaveAttribute(
        "aria-selected",
        "true"
      )
      expect(await axe(container)).toHaveNoViolations()
    })

    it("passes axe audit on expandable rows with aria-expanded", async () => {
      const user = userEvent.setup()
      const { container } = render(
        <DataTable
          data={sampleProducts.slice(0, 3)}
          columns={baseColumns}
          dataKey="id"
          ariaLabel="Expandable products"
          expandableRows
          rowExpansionTemplate={(row) => <div>Details for {row.name}</div>}
        />
      )

      const expandButtons = screen.getAllByRole("button", {
        name: "Expand row",
      })
      expect(expandButtons[0]).toHaveAttribute("aria-expanded", "false")

      await user.click(expandButtons[0]!)
      expect(
        screen.getByRole("button", { name: "Collapse row" })
      ).toHaveAttribute("aria-expanded", "true")
      expect(screen.getByText("Details for Laptop")).toBeInTheDocument()

      expect(await axe(container)).toHaveNoViolations()
    })

    it("passes axe audit on inline editing (cell and row modes) with aria-invalid on validation error", async () => {
      const user = userEvent.setup()
      const editableColumns: DataTableColumn<Product>[] = [
        {
          field: "name",
          header: "Name",
          editable: true,
          onCellEditValidate: (val) =>
            String(val).trim().length >= 3 || "Name too short",
        },
        { field: "category", header: "Category", editable: true },
        { field: "price", header: "Price" },
      ]

      const { container, rerender } = render(
        <DataTable
          data={sampleProducts.slice(0, 2)}
          columns={editableColumns}
          dataKey="id"
          ariaLabel="Cell editable products"
          editMode="cell"
        />
      )

      await user.click(screen.getByText("Laptop"))
      const input = screen.getByDisplayValue("Laptop")
      await user.clear(input)
      await user.type(input, "Ab{Enter}")

      const invalidInput = screen.getByDisplayValue("Ab")
      expect(invalidInput).toHaveAttribute("aria-invalid", "true")
      expect(await axe(container)).toHaveNoViolations()

      rerender(
        <DataTable
          data={sampleProducts.slice(0, 2)}
          columns={editableColumns}
          dataKey="id"
          ariaLabel="Row editable products"
          editMode="row"
        />
      )

      const editButtons = screen.getAllByRole("button", { name: "Edit row" })
      await user.click(editButtons[0]!)
      expect(await axe(container)).toHaveNoViolations()
    })

    it("passes axe audit on loading skeleton and empty state", async () => {
      const { container, rerender } = render(
        <DataTable
          data={sampleProducts}
          columns={baseColumns}
          ariaLabel="Loading products"
          loading
          skeletonRows={3}
        />
      )

      expect(screen.getByRole("grid")).toHaveAttribute("aria-busy", "true")
      expect(await axe(container)).toHaveNoViolations()

      rerender(
        <DataTable
          data={[]}
          columns={baseColumns}
          ariaLabel="Empty products"
          emptyMessage="No products found"
        />
      )

      expect(screen.getByText("No products found")).toBeInTheDocument()
      expect(await axe(container)).toHaveNoViolations()
    })

    it("passes axe audit on responsive stack layout", async () => {
      const { container } = render(
        <DataTable
          data={sampleProducts.slice(0, 3)}
          columns={baseColumns}
          dataKey="id"
          ariaLabel="Stacked products"
          responsiveLayout="stack"
          breakpoint="md"
        />
      )

      expect(await axe(container)).toHaveNoViolations()
    })
  })

  describe("Keyboard Navigation & ARIA Grid Attributes", () => {
    it("supports sorting via Enter and Space keys on sortable column header", async () => {
      const user = userEvent.setup()
      render(
        <DataTable
          data={sampleProducts.slice(0, 3)}
          columns={baseColumns}
          dataKey="id"
          ariaLabel="Keyboard sortable"
          removableSort
        />
      )

      const nameHeader = screen.getByRole("columnheader", { name: /Name/i })
      const sortButton = screen.getByRole("button", { name: /Name/i })
      sortButton.focus()
      expect(sortButton).toHaveFocus()

      await user.keyboard("{Enter}")
      expect(nameHeader).toHaveAttribute("aria-sort", "ascending")

      await user.keyboard(" ")
      expect(nameHeader).toHaveAttribute("aria-sort", "descending")
    })

    it("moves focus between [data-row-index] rows with ArrowDown, ArrowUp, Home, and End", async () => {
      const user = userEvent.setup()
      const { container } = render(
        <DataTable
          data={sampleProducts.slice(0, 4)}
          columns={baseColumns}
          dataKey="id"
          ariaLabel="Keyboard navigable grid"
        />
      )

      const rows = Array.from(
        container.querySelectorAll<HTMLElement>("tbody tr[data-row-index]")
      )
      expect(rows).toHaveLength(4)

      rows[0]!.focus()
      expect(rows[0]).toHaveFocus()

      await user.keyboard("{ArrowDown}")
      expect(rows[1]).toHaveFocus()

      await user.keyboard("{ArrowDown}")
      expect(rows[2]).toHaveFocus()

      await user.keyboard("{ArrowUp}")
      expect(rows[1]).toHaveFocus()

      await user.keyboard("{End}")
      expect(rows[3]).toHaveFocus()

      await user.keyboard("{Home}")
      expect(rows[0]).toHaveFocus()
    })

    it("selects a focused row via Enter and Space keys", async () => {
      const user = userEvent.setup()
      const onSelectionChange = vi.fn()
      const { container } = render(
        <DataTable
          data={sampleProducts.slice(0, 3)}
          columns={baseColumns}
          dataKey="id"
          ariaLabel="Keyboard selectable grid"
          selectionMode="single"
          onSelectionChange={onSelectionChange}
        />
      )

      const rows = Array.from(
        container.querySelectorAll<HTMLElement>("tbody tr[data-row-index]")
      )
      expect(rows).toHaveLength(3)

      rows[0]!.focus()
      await user.keyboard("{Enter}")
      expect(rows[0]).toHaveAttribute("aria-selected", "true")
      expect(onSelectionChange).toHaveBeenCalledWith(sampleProducts[0])

      rows[1]!.focus()
      await user.keyboard(" ")
      expect(rows[1]).toHaveAttribute("aria-selected", "true")
      expect(onSelectionChange).toHaveBeenCalledWith(sampleProducts[1])
    })

    it("exposes aria-rowcount, aria-colcount, aria-rowindex, and aria-live='polite' status announcements", async () => {
      const user = userEvent.setup()
      const { container } = render(
        <DataTable
          data={sampleProducts.slice(0, 4)}
          columns={baseColumns}
          dataKey="id"
          ariaLabel="ARIA grid"
          ariaLabelledBy="table-heading"
        />
      )

      const grid = screen.getByRole("grid")
      expect(grid).toHaveAttribute("aria-rowcount", "5")
      expect(grid).toHaveAttribute("aria-colcount", "3")
      expect(grid).toHaveAttribute("aria-labelledby", "table-heading")

      const dataRows = Array.from(
        container.querySelectorAll<HTMLElement>("tbody tr[data-row-index]")
      )
      expect(dataRows[0]).toHaveAttribute("aria-rowindex", "2")
      expect(dataRows[1]).toHaveAttribute("aria-rowindex", "3")

      const liveRegion = container.querySelector('[aria-live="polite"]')
      expect(liveRegion).toBeInTheDocument()

      const sortButton = screen.getByRole("button", { name: /Name/i })
      await user.click(sortButton)

      await waitFor(() => {
        expect(liveRegion?.textContent).toMatch(/sorted|ascending|Name/i)
      })
    })
  })
})
