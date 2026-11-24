import { describe, expect, it } from "vitest"
import type { LegacyRow } from "@tanstack/react-table/legacy"
import type { DataTableColumn } from "../types"
import { exportToCSV, exportToJSON } from "../utils/export"

interface SampleRow {
  id: number
  name: string
  notes: string
  secret: string
  createdAt?: Date
  amount?: number | string
}

function createMockRows(items: SampleRow[]): LegacyRow<SampleRow>[] {
  return items.map(
    (item, index) =>
      ({
        original: item,
        index,
        getValue: (colId: string) =>
          (item as unknown as Record<string, unknown>)[colId],
      }) as unknown as LegacyRow<SampleRow>
  )
}

describe("exportToCSV", () => {
  it("exports header names, escapes commas/quotes/newlines, and excludes exportable: false columns", () => {
    const columns: DataTableColumn<SampleRow>[] = [
      { field: "id", header: "ID" },
      { field: "name", header: "Full Name" },
      { field: "notes", header: "Notes, & Comments" },
      { field: "secret", header: "Secret", exportable: false },
    ]

    const rows = createMockRows([
      {
        id: 1,
        name: "Alice, Jr.",
        notes: 'Said "Hello"\nLine 2',
        secret: "hidden-1",
      },
      {
        id: 2,
        name: "Bob",
        notes: "Plain text",
        secret: "hidden-2",
      },
    ])

    const csv = exportToCSV(rows, columns, { triggerDownload: false })
    const expected = [
      'ID,Full Name,"Notes, & Comments"',
      '1,"Alice, Jr.","Said ""Hello""\nLine 2"',
      "2,Bob,Plain text",
    ].join("\n")

    expect(csv).toBe(expected)
    expect(csv).not.toContain("Secret")
    expect(csv).not.toContain("hidden-1")
  })

  it("handles Date values, null/undefined, and accessorFn columns", () => {
    const columns: DataTableColumn<SampleRow>[] = [
      {
        id: "label",
        header: "Label",
        accessorFn: (row) => `${row.id}-${row.name}`,
      },
      { field: "createdAt", header: "Created" },
    ]

    const date = new Date("2025-01-15T10:30:00.000Z")
    const rows = createMockRows([
      { id: 1, name: "Item", notes: "", secret: "", createdAt: date },
      { id: 2, name: "Empty", notes: "", secret: "" },
    ])

    const csv = exportToCSV(rows, columns, { triggerDownload: false })
    expect(csv).toBe(
      `Label,Created\n1-Item,${date.toISOString()}\n2-Empty,`
    )
  })

  it("sanitizes OWASP CSV formula injection payloads by default while preserving plain negative numbers", () => {
    const columns: DataTableColumn<SampleRow>[] = [
      { field: "id", header: "ID" },
      { field: "notes", header: "Notes" },
      { field: "amount", header: "Amount" },
    ]

    const rows = createMockRows([
      { id: 1, name: "A", notes: "=SUM(A1:A2)", secret: "", amount: -42.5 },
      {
        id: 2,
        name: "B",
        notes: "+cmd|' /C calc'!A0",
        secret: "",
        amount: "-42.5",
      },
      { id: 3, name: "C", notes: "@evil", secret: "", amount: 100 },
      { id: 4, name: "D", notes: "\tcmd", secret: "", amount: -0.01 },
    ])

    const csv = exportToCSV(rows, columns, { triggerDownload: false })
    expect(csv).toBe(
      [
        "ID,Notes,Amount",
        "1,'=SUM(A1:A2),-42.5",
        "2,'+cmd|' /C calc'!A0,-42.5",
        "3,'@evil,100",
        "4,'\tcmd,-0.01",
      ].join("\n")
    )
  })

  it("allows disabling formula sanitization via sanitizeFormulas: false", () => {
    const columns: DataTableColumn<SampleRow>[] = [
      { field: "id", header: "ID" },
      { field: "notes", header: "Notes" },
      { field: "amount", header: "Amount" },
    ]

    const rows = createMockRows([
      { id: 1, name: "A", notes: "=SUM(A1:A2)", secret: "", amount: -42.5 },
      { id: 2, name: "B", notes: "+cmd|' /C calc'!A0", secret: "", amount: 0 },
      { id: 3, name: "C", notes: "@evil", secret: "", amount: 0 },
      { id: 4, name: "D", notes: "\tcmd", secret: "", amount: 0 },
    ])

    const csv = exportToCSV(rows, columns, {
      triggerDownload: false,
      sanitizeFormulas: false,
    })
    expect(csv).toBe(
      [
        "ID,Notes,Amount",
        "1,=SUM(A1:A2),-42.5",
        "2,+cmd|' /C calc'!A0,0",
        "3,@evil,0",
        "4,\tcmd,0",
      ].join("\n")
    )
  })
})

describe("exportToJSON", () => {
  it("exports formatted JSON records and excludes exportable: false columns", () => {
    const columns: DataTableColumn<SampleRow>[] = [
      { field: "id", header: "ID" },
      { field: "name", header: "Name" },
      { field: "secret", header: "Secret", exportable: false },
      {
        id: "summary",
        header: "Summary",
        accessorFn: (row) => `${row.name} (#${row.id})`,
      },
    ]

    const rows = createMockRows([
      { id: 1, name: "Alice", notes: "n1", secret: "s1" },
      { id: 2, name: "Bob", notes: "n2", secret: "s2" },
    ])

    const json = exportToJSON(rows, columns, { triggerDownload: false })
    const parsed = JSON.parse(json) as Array<Record<string, unknown>>

    expect(parsed).toEqual([
      { id: 1, name: "Alice", summary: "Alice (#1)" },
      { id: 2, name: "Bob", summary: "Bob (#2)" },
    ])
    expect(json).toBe(JSON.stringify(parsed, null, 2))
  })
})
