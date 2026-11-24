import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { axe } from "vitest-axe"
import { describe, expect, it, vi } from "vitest"
import { DataTable } from "../data-table"
import type { CellEditCompleteEvent, DataTableColumn } from "../types"

interface Product {
  id: string
  name: string
  category: string
  price: number
  meta: {
    score: number
  }
}

const sampleProducts: Product[] = [
  { id: "1", name: "Laptop", category: "Electronics", price: 1200, meta: { score: 85 } },
  { id: "2", name: "Desk Chair", category: "Furniture", price: 300, meta: { score: 78 } },
  { id: "3", name: "Headphones", category: "Electronics", price: 150, meta: { score: 92 } },
  { id: "4", name: "Monitor", category: "Electronics", price: 400, meta: { score: 88 } },
  { id: "5", name: "Standing Desk", category: "Furniture", price: 650, meta: { score: 90 } },
]

const baseColumns: DataTableColumn<Product>[] = [
  { field: "name", header: "Name", sortable: true },
  { field: "category", header: "Category", sortable: true },
  { field: "price", header: "Price", sortable: true },
]

describe("DataTable Code Review Fixes", () => {
  describe("Single-fire onRowSelect / onRowUnselect", () => {
    it("fires onRowSelect and onRowUnselect exactly once per checkbox or row toggle in checkbox mode", async () => {
      const user = userEvent.setup()
      const onRowSelect = vi.fn()
      const onRowUnselect = vi.fn()

      render(
        <DataTable
          data={sampleProducts.slice(0, 3)}
          columns={baseColumns}
          dataKey="id"
          ariaLabel="Checkbox single-fire table"
          selectionMode="checkbox"
          onRowSelect={onRowSelect}
          onRowUnselect={onRowUnselect}
        />
      )

      const row1Checkbox = screen.getByRole("checkbox", { name: "Select row 1" })
      await user.click(row1Checkbox)

      expect(onRowSelect).toHaveBeenCalledTimes(1)
      expect(onRowSelect).toHaveBeenCalledWith(sampleProducts[0], 0)
      expect(onRowUnselect).not.toHaveBeenCalled()

      onRowSelect.mockClear()
      await user.click(row1Checkbox)

      expect(onRowUnselect).toHaveBeenCalledTimes(1)
      expect(onRowUnselect).toHaveBeenCalledWith(sampleProducts[0], 0)
      expect(onRowSelect).not.toHaveBeenCalled()

      onRowSelect.mockClear()
      onRowUnselect.mockClear()

      await user.click(screen.getByText("Desk Chair"))
      expect(onRowSelect).toHaveBeenCalledTimes(1)
      expect(onRowSelect).toHaveBeenCalledWith(sampleProducts[1], 1)

      onRowSelect.mockClear()
      await user.click(screen.getByText("Desk Chair"))
      expect(onRowUnselect).toHaveBeenCalledTimes(1)
      expect(onRowUnselect).toHaveBeenCalledWith(sampleProducts[1], 1)
    })

    it("fires onRowSelect exactly once in radiobutton mode and single mode", async () => {
      const user = userEvent.setup()
      const onRowSelect = vi.fn()
      const onRowUnselect = vi.fn()

      const { unmount } = render(
        <DataTable
          data={sampleProducts.slice(0, 3)}
          columns={baseColumns}
          dataKey="id"
          ariaLabel="Radio single-fire table"
          selectionMode="radiobutton"
          onRowSelect={onRowSelect}
          onRowUnselect={onRowUnselect}
        />
      )

      await user.click(screen.getByRole("radio", { name: "Select row 1" }))
      expect(onRowSelect).toHaveBeenCalledTimes(1)
      expect(onRowSelect).toHaveBeenCalledWith(sampleProducts[0], 0)

      unmount()
      onRowSelect.mockClear()
      onRowUnselect.mockClear()

      render(
        <DataTable
          data={sampleProducts.slice(0, 3)}
          columns={baseColumns}
          dataKey="id"
          ariaLabel="Single row click table"
          selectionMode="single"
          onRowSelect={onRowSelect}
          onRowUnselect={onRowUnselect}
        />
      )

      await user.click(screen.getByText("Headphones"))
      expect(onRowSelect).toHaveBeenCalledTimes(1)
      expect(onRowSelect).toHaveBeenCalledWith(sampleProducts[2], 2)
      expect(onRowUnselect).not.toHaveBeenCalled()

      onRowSelect.mockClear()
      await user.click(screen.getByText("Headphones"))
      expect(onRowUnselect).toHaveBeenCalledTimes(1)
      expect(onRowUnselect).toHaveBeenCalledWith(sampleProducts[2], 2)
      expect(onRowSelect).not.toHaveBeenCalled()
    })
  })

  describe("Shift+Click range selection", () => {
    it("selects rows 1..4 on Shift+Click in multiple selection mode", async () => {
      const user = userEvent.setup()
      const onSelectionChange = vi.fn()

      render(
        <DataTable
          data={sampleProducts}
          columns={baseColumns}
          dataKey="id"
          ariaLabel="Multiple range selection table"
          selectionMode="multiple"
          onSelectionChange={onSelectionChange}
        />
      )

      await user.click(screen.getByText("Laptop"))
      await user.keyboard("{Shift>}")
      await user.click(screen.getByText("Monitor"))
      await user.keyboard("{/Shift}")

      expect(onSelectionChange).toHaveBeenLastCalledWith(
        sampleProducts.slice(0, 4)
      )

      const rows = screen.getAllByRole("row")
      expect(rows[1]).toHaveAttribute("aria-selected", "true")
      expect(rows[2]).toHaveAttribute("aria-selected", "true")
      expect(rows[3]).toHaveAttribute("aria-selected", "true")
      expect(rows[4]).toHaveAttribute("aria-selected", "true")
      expect(rows[5]).not.toHaveAttribute("aria-selected", "true")
    })

    it("selects rows 1..4 on Shift+Click in checkbox selection mode", async () => {
      const user = userEvent.setup()
      const onSelectionChange = vi.fn()

      render(
        <DataTable
          data={sampleProducts}
          columns={baseColumns}
          dataKey="id"
          ariaLabel="Checkbox range selection table"
          selectionMode="checkbox"
          onSelectionChange={onSelectionChange}
        />
      )

      await user.click(screen.getByText("Laptop"))
      await user.keyboard("{Shift>}")
      await user.click(screen.getByText("Monitor"))
      await user.keyboard("{/Shift}")

      expect(onSelectionChange).toHaveBeenLastCalledWith(
        sampleProducts.slice(0, 4)
      )
    })
  })

  describe("Inline editing improvements", () => {
    it("preserves numeric type when editing a numeric column in editMode='cell'", async () => {
      const user = userEvent.setup()
      const onCellEditComplete = vi.fn()

      const editableCols: DataTableColumn<Product>[] = [
        { field: "name", header: "Name" },
        { field: "price", header: "Price", editable: true },
      ]

      render(
        <DataTable
          data={sampleProducts.slice(0, 2)}
          columns={editableCols}
          dataKey="id"
          ariaLabel="Numeric edit table"
          editMode="cell"
          onCellEditComplete={onCellEditComplete}
        />
      )

      await user.click(screen.getByText("1200"))
      const input = screen.getByDisplayValue("1200")
      await user.clear(input)
      await user.type(input, "1500{Enter}")

      expect(onCellEditComplete).toHaveBeenCalledTimes(1)
      const event = onCellEditComplete.mock
        .calls[0]![0] as CellEditCompleteEvent<Product, number>
      expect(typeof event.newValue).toBe("number")
      expect(event.newValue).toBe(1500)
      expect(event.newRowData.price).toBe(1500)
    })

    it("immutably updates nested dot-path columns without adding a flat dotted key", async () => {
      const user = userEvent.setup()
      const onCellEditComplete = vi.fn()

      const nestedCols: DataTableColumn<Product>[] = [
        { field: "name", header: "Name" },
        { field: "meta.score", header: "Score", editable: true },
      ]

      render(
        <DataTable
          data={sampleProducts.slice(0, 2)}
          columns={nestedCols}
          dataKey="id"
          ariaLabel="Nested edit table"
          editMode="cell"
          onCellEditComplete={onCellEditComplete}
        />
      )

      await user.click(screen.getByText("85"))
      const input = screen.getByDisplayValue("85")
      await user.clear(input)
      await user.type(input, "95{Enter}")

      expect(onCellEditComplete).toHaveBeenCalledTimes(1)
      const event = onCellEditComplete.mock
        .calls[0]![0] as CellEditCompleteEvent<Product, number>

      expect(event.field).toBe("meta.score")
      expect(event.newValue).toBe(95)
      expect(event.newRowData.meta.score).toBe(95)
      expect(event.rowData.meta.score).toBe(85)
      expect(
        Object.prototype.hasOwnProperty.call(event.newRowData, "meta.score")
      ).toBe(false)
    })

    it("enforces onCellEditValidate in editMode='row', marks aria-invalid, blocks commit, and passes axe", async () => {
      const user = userEvent.setup()
      const onRowEditComplete = vi.fn()

      const validatedCols: DataTableColumn<Product>[] = [
        { field: "name", header: "Name", editable: true },
        {
          field: "price",
          header: "Price",
          editable: true,
          onCellEditValidate: (newValue) =>
            Number(newValue) > 0 ? true : "Price must be positive",
        },
      ]

      const { container } = render(
        <DataTable
          data={sampleProducts.slice(0, 2)}
          columns={validatedCols}
          dataKey="id"
          ariaLabel="Validated row edit table"
          editMode="row"
          onRowEditComplete={onRowEditComplete}
        />
      )

      const editButtons = screen.getAllByRole("button", { name: "Edit row" })
      await user.click(editButtons[0]!)

      const priceInput = screen.getByLabelText("Edit price")
      await user.clear(priceInput)
      await user.type(priceInput, "-5")

      await user.click(screen.getByRole("button", { name: "Save row" }))

      expect(onRowEditComplete).not.toHaveBeenCalled()
      expect(priceInput).toHaveAttribute("aria-invalid", "true")
      expect(screen.getByText("Price must be positive")).toBeInTheDocument()
      expect(await axe(container)).toHaveNoViolations()

      await user.clear(priceInput)
      await user.type(priceInput, "1350")
      await user.click(screen.getByRole("button", { name: "Save row" }))

      expect(onRowEditComplete).toHaveBeenCalledTimes(1)
      expect(onRowEditComplete).toHaveBeenCalledWith(
        expect.objectContaining({
          index: 0,
          newData: expect.objectContaining({ price: 1350 }),
        })
      )
    })
  })

  describe("Keyboard Column Resize & Reorder & Row Reorder", () => {
    it("resizes column via keyboard ArrowRight on role='separator' and passes axe audit", async () => {
      const user = userEvent.setup()
      const onColumnSizingChange = vi.fn()

      const { container } = render(
        <DataTable
          data={sampleProducts.slice(0, 3)}
          columns={baseColumns}
          dataKey="id"
          ariaLabel="Resizable columns table"
          resizableColumns
          onColumnSizingChange={onColumnSizingChange}
        />
      )

      const separators = screen.getAllByRole("separator")
      expect(separators.length).toBeGreaterThan(0)

      const firstSeparator = separators[0]!
      const initialNow = Number(firstSeparator.getAttribute("aria-valuenow"))

      firstSeparator.focus()
      await user.keyboard("{ArrowRight}")

      expect(onColumnSizingChange).toHaveBeenCalled()
      const nextNow = Number(firstSeparator.getAttribute("aria-valuenow"))
      expect(nextNow).toBeGreaterThan(initialNow)
      expect(await axe(container)).toHaveNoViolations()
    })

    it("reorders columns with Alt+ArrowRight and rows with Alt+ArrowDown", async () => {
      const user = userEvent.setup()
      const onColumnOrderChange = vi.fn()
      const onRowReorder = vi.fn()

      const { container } = render(
        <DataTable
          data={sampleProducts.slice(0, 3)}
          columns={baseColumns}
          dataKey="id"
          ariaLabel="Reorderable columns and rows table"
          reorderableColumns
          onColumnOrderChange={onColumnOrderChange}
          reorderableRows
          onRowReorder={onRowReorder}
        />
      )

      const nameHeader = screen.getByRole("columnheader", { name: /Name/i })
      const focusableHeader =
        nameHeader.querySelector<HTMLElement>('[tabindex="0"]') ?? nameHeader
      focusableHeader.focus()
      await user.keyboard("{Alt>}{ArrowRight}{/Alt}")

      expect(onColumnOrderChange).toHaveBeenCalledWith([
        "category",
        "name",
        "price",
      ])

      const firstRow = container.querySelector<HTMLElement>(
        'tbody tr[data-row-index="0"]'
      )
      expect(firstRow).not.toBeNull()
      firstRow!.focus()
      await user.keyboard("{Alt>}{ArrowDown}{/Alt}")

      expect(onRowReorder).toHaveBeenCalledTimes(1)
      expect(onRowReorder).toHaveBeenCalledWith(
        expect.objectContaining({
          dragIndex: 0,
          dropIndex: 1,
        })
      )
    })
  })

  describe("2D Grid Keyboard Navigation", () => {
    it("moves focus into [data-col-index] cells on ArrowRight and navigates back on ArrowLeft", async () => {
      const user = userEvent.setup()

      const { container } = render(
        <DataTable
          data={sampleProducts.slice(0, 3)}
          columns={baseColumns}
          dataKey="id"
          ariaLabel="2D keyboard navigation table"
        />
      )

      const firstRow = container.querySelector<HTMLElement>(
        'tbody tr[data-row-index="0"]'
      )
      expect(firstRow).not.toBeNull()
      firstRow!.focus()

      await user.keyboard("{ArrowRight}")
      expect(document.activeElement).toHaveAttribute("data-col-index", "0")
      expect(firstRow!.contains(document.activeElement)).toBe(true)

      await user.keyboard("{ArrowRight}")
      expect(document.activeElement).toHaveAttribute("data-col-index", "1")
      expect(firstRow!.contains(document.activeElement)).toBe(true)

      await user.keyboard("{ArrowLeft}")
      expect(document.activeElement).toHaveAttribute("data-col-index", "0")
      expect(firstRow!.contains(document.activeElement)).toBe(true)
    })
  })

  describe("Localization (locale='it' & custom messages)", () => {
    it("sets lang='it', renders Italian UI/ARIA labels, supports custom message overrides, and passes axe audit", async () => {
      const { container, rerender } = render(
        <DataTable
          data={sampleProducts}
          columns={baseColumns}
          dataKey="id"
          locale="it"
          enableGlobalFilter
          paginator
          rows={2}
          selectionMode="checkbox"
        />
      )

      const root = container.querySelector<HTMLElement>(
        '[data-slot="data-table-root"]'
      )
      expect(root).toHaveAttribute("lang", "it")

      expect(
        screen.getByRole("grid", { name: "Tabella dati" })
      ).toBeInTheDocument()
      expect(screen.getByLabelText("Ricerca globale")).toBeInTheDocument()
      expect(
        screen.getByRole("checkbox", { name: "Seleziona tutte le righe" })
      ).toBeInTheDocument()
      expect(
        screen.getByRole("button", { name: "Prima pagina" })
      ).toBeInTheDocument()

      expect(await axe(container)).toHaveNoViolations()

      rerender(
        <DataTable
          data={sampleProducts}
          columns={baseColumns}
          dataKey="id"
          locale="it"
          enableGlobalFilter
          paginator
          rows={2}
          selectionMode="checkbox"
          messages={{
            dataTableLabel: "Catalogo prodotti",
            globalSearchAriaLabel: "Cerca nel catalogo",
          }}
        />
      )

      expect(
        screen.getByRole("grid", { name: "Catalogo prodotti" })
      ).toBeInTheDocument()
      expect(screen.getByLabelText("Cerca nel catalogo")).toBeInTheDocument()
      expect(
        screen.getByRole("button", { name: "Prima pagina" })
      ).toBeInTheDocument()
    })
  })

  describe("frozenValue safety", () => {
    it("renders frozenValue with custom col.body reading ctx.row.id and ctx.row.original without throwing", () => {
      const frozenItem: Product = {
        id: "pinned-1",
        name: "Pinned Flagship",
        category: "Special",
        price: 9999,
        meta: { score: 100 },
      }

      const customBodyCols: DataTableColumn<Product>[] = [
        {
          field: "name",
          header: "Name",
          body: (_data, ctx) => (
            <span>{`${ctx.row.id}:${ctx.row.original.name}`}</span>
          ),
        },
        { field: "category", header: "Category" },
        { field: "price", header: "Price" },
      ]

      render(
        <DataTable
          data={sampleProducts.slice(0, 2)}
          frozenValue={[frozenItem]}
          columns={customBodyCols}
          dataKey="id"
          ariaLabel="Frozen value safety table"
        />
      )

      expect(screen.getByText(/Pinned Flagship/)).toBeInTheDocument()
      expect(screen.getByText("Special")).toBeInTheDocument()
      expect(screen.getByText("9999")).toBeInTheDocument()
    })
  })
})
