import { describe, expect, it } from "vitest"
import type { LegacyRow } from "@tanstack/react-table/legacy"
import {
  applyFilterMatchMode,
  createColumnFilterFn,
  globalContainsFilterFn,
} from "../utils/filters"

function createMockRow<TData extends object>(
  original: TData,
  index = 0
): LegacyRow<TData> {
  return {
    original,
    index,
    getValue: (columnId: string) =>
      (original as Record<string, unknown>)[columnId],
  } as unknown as LegacyRow<TData>
}

describe("applyFilterMatchMode", () => {
  it("handles empty primitive filter values by returning true", () => {
    expect(applyFilterMatchMode("hello", "", "contains")).toBe(true)
    expect(applyFilterMatchMode("hello", null, "equals")).toBe(true)
    expect(applyFilterMatchMode(null, undefined, "gt")).toBe(true)
  })

  it("evaluates contains and notContains (case-insensitive + null handling)", () => {
    expect(applyFilterMatchMode("Alice Johnson", "alice", "contains")).toBe(true)
    expect(applyFilterMatchMode("Alice Johnson", "bob", "contains")).toBe(false)
    expect(applyFilterMatchMode(null, "a", "contains")).toBe(false)
    expect(applyFilterMatchMode(undefined, "a", "contains")).toBe(false)

    expect(applyFilterMatchMode("Alice Johnson", "bob", "notContains")).toBe(true)
    expect(applyFilterMatchMode("Alice Johnson", "JOHN", "notContains")).toBe(false)
    expect(applyFilterMatchMode(null, "a", "notContains")).toBe(true)
    expect(applyFilterMatchMode(undefined, "a", "notContains")).toBe(true)
  })

  it("evaluates startsWith and endsWith", () => {
    expect(applyFilterMatchMode("TypeScript", "type", "startsWith")).toBe(true)
    expect(applyFilterMatchMode("TypeScript", "script", "startsWith")).toBe(false)
    expect(applyFilterMatchMode(null, "type", "startsWith")).toBe(false)

    expect(applyFilterMatchMode("TypeScript", "SCRIPT", "endsWith")).toBe(true)
    expect(applyFilterMatchMode("TypeScript", "type", "endsWith")).toBe(false)
    expect(applyFilterMatchMode(undefined, "script", "endsWith")).toBe(false)
  })

  it("evaluates equals and notEquals", () => {
    expect(applyFilterMatchMode("Admin", "admin", "equals")).toBe(true)
    expect(applyFilterMatchMode(42, 42, "equals")).toBe(true)
    expect(applyFilterMatchMode(42, 43, "equals")).toBe(false)
    expect(applyFilterMatchMode(true, "true", "equals")).toBe(true)
    expect(
      applyFilterMatchMode(
        new Date("2025-03-10T00:00:00.000Z"),
        new Date("2025-03-10T00:00:00.000Z"),
        "equals"
      )
    ).toBe(true)
    expect(applyFilterMatchMode(null, "admin", "equals")).toBe(false)

    expect(applyFilterMatchMode("Admin", "user", "notEquals")).toBe(true)
    expect(applyFilterMatchMode("Admin", "admin", "notEquals")).toBe(false)
    expect(applyFilterMatchMode(null, "admin", "notEquals")).toBe(true)
    expect(applyFilterMatchMode(undefined, 10, "notEquals")).toBe(true)
  })

  it("evaluates numeric comparisons gt, gte, lt, lte", () => {
    expect(applyFilterMatchMode(20, 10, "gt")).toBe(true)
    expect(applyFilterMatchMode(10, 10, "gt")).toBe(false)
    expect(applyFilterMatchMode("25", "10", "gt")).toBe(true)
    expect(applyFilterMatchMode(null, 10, "gt")).toBe(false)
    expect(applyFilterMatchMode("abc", 10, "gt")).toBe(false)

    expect(applyFilterMatchMode(10, 10, "gte")).toBe(true)
    expect(applyFilterMatchMode(9, 10, "gte")).toBe(false)

    expect(applyFilterMatchMode(5, 10, "lt")).toBe(true)
    expect(applyFilterMatchMode(10, 10, "lt")).toBe(false)
    expect(applyFilterMatchMode(undefined, 10, "lt")).toBe(false)

    expect(applyFilterMatchMode(10, 10, "lte")).toBe(true)
    expect(applyFilterMatchMode(11, 10, "lte")).toBe(false)
  })

  it("evaluates between for closed, open-ended, empty, and null cases", () => {
    expect(applyFilterMatchMode(15, [10, 20], "between")).toBe(true)
    expect(applyFilterMatchMode(10, [10, 20], "between")).toBe(true)
    expect(applyFilterMatchMode(20, [10, 20], "between")).toBe(true)
    expect(applyFilterMatchMode(9, [10, 20], "between")).toBe(false)
    expect(applyFilterMatchMode(21, [10, 20], "between")).toBe(false)

    // Open-ended bounds
    expect(applyFilterMatchMode(25, [10, null], "between")).toBe(true)
    expect(applyFilterMatchMode(5, [10, ""], "between")).toBe(false)
    expect(applyFilterMatchMode(5, [null, 10], "between")).toBe(true)
    expect(applyFilterMatchMode(15, ["", 10], "between")).toBe(false)

    // Empty / invalid filter array
    expect(applyFilterMatchMode(15, [null, null], "between")).toBe(true)
    expect(applyFilterMatchMode(15, [], "between")).toBe(true)

    // Null cell value
    expect(applyFilterMatchMode(null, [10, 20], "between")).toBe(false)
  })

  it("evaluates in and notIn", () => {
    expect(applyFilterMatchMode("Active", ["active", "pending"], "in")).toBe(true)
    expect(applyFilterMatchMode("Archived", ["active", "pending"], "in")).toBe(false)
    expect(applyFilterMatchMode(null, ["active"], "in")).toBe(false)
    expect(applyFilterMatchMode("Active", [], "in")).toBe(true)

    expect(applyFilterMatchMode("Archived", ["active", "pending"], "notIn")).toBe(true)
    expect(applyFilterMatchMode("Active", ["active", "pending"], "notIn")).toBe(false)
    expect(applyFilterMatchMode(null, ["active"], "notIn")).toBe(true)
    expect(applyFilterMatchMode("Active", [], "notIn")).toBe(true)
  })

  it("evaluates dateIs, dateBefore, and dateAfter", () => {
    expect(applyFilterMatchMode("2025-05-15", "2025-05-15", "dateIs")).toBe(true)
    expect(
      applyFilterMatchMode(new Date(2025, 4, 15, 14, 30), "2025-05-15", "dateIs")
    ).toBe(true)
    expect(applyFilterMatchMode("2025-05-16", "2025-05-15", "dateIs")).toBe(false)
    expect(applyFilterMatchMode(null, "2025-05-15", "dateIs")).toBe(false)

    expect(applyFilterMatchMode("2025-05-14", "2025-05-15", "dateBefore")).toBe(true)
    expect(applyFilterMatchMode("2025-05-15", "2025-05-15", "dateBefore")).toBe(false)
    expect(applyFilterMatchMode(undefined, "2025-05-15", "dateBefore")).toBe(false)

    expect(applyFilterMatchMode("2025-05-16", "2025-05-15", "dateAfter")).toBe(true)
    expect(applyFilterMatchMode("2025-05-15", "2025-05-15", "dateAfter")).toBe(false)
    expect(applyFilterMatchMode("not-a-date", "2025-05-15", "dateAfter")).toBe(false)
  })
})

describe("createColumnFilterFn", () => {
  it("supports raw primitive values with default match mode", () => {
    const filterFn = createColumnFilterFn<{ name: string }>("startsWith")
    const row = createMockRow({ name: "Alice" })

    expect(filterFn(row, "name", "ali", () => {})).toBe(true)
    expect(filterFn(row, "name", "lice", () => {})).toBe(false)
  })

  it("supports ColumnFilterValue objects overriding matchMode", () => {
    const filterFn = createColumnFilterFn<{ score: number }>("equals")
    const row = createMockRow({ score: 85 })

    expect(
      filterFn(row, "score", { value: 80, matchMode: "gt" }, () => {})
    ).toBe(true)
    expect(
      filterFn(row, "score", { value: 90, matchMode: "gt" }, () => {})
    ).toBe(false)
  })

  it("infers 'in' or 'between' for raw array filter values", () => {
    const inFilterFn = createColumnFilterFn<{ status: string }>("equals")
    const statusRow = createMockRow({ status: "active" })
    expect(inFilterFn(statusRow, "status", ["active", "pending"], () => {})).toBe(
      true
    )
    expect(inFilterFn(statusRow, "status", ["archived"], () => {})).toBe(false)

    const betweenFilterFn = createColumnFilterFn<{ age: number }>("between")
    const ageRow = createMockRow({ age: 30 })
    expect(betweenFilterFn(ageRow, "age", [20, 40], () => {})).toBe(true)
    expect(betweenFilterFn(ageRow, "age", [35, 40], () => {})).toBe(false)
  })

  it("implements autoRemove for empty filter values", () => {
    const filterFn = createColumnFilterFn()
    expect(filterFn.autoRemove?.(undefined, {} as never)).toBe(true)
    expect(filterFn.autoRemove?.(null, {} as never)).toBe(true)
    expect(filterFn.autoRemove?.("", {} as never)).toBe(true)
    expect(filterFn.autoRemove?.([], {} as never)).toBe(true)
    expect(filterFn.autoRemove?.([null, ""], {} as never)).toBe(true)
    expect(filterFn.autoRemove?.({ value: "" }, {} as never)).toBe(true)
    expect(filterFn.autoRemove?.({ value: [] }, {} as never)).toBe(true)

    expect(filterFn.autoRemove?.("alice", {} as never)).toBe(false)
    expect(filterFn.autoRemove?.([10, null], {} as never)).toBe(false)
    expect(filterFn.autoRemove?.({ value: "alice" }, {} as never)).toBe(false)
  })
})

describe("globalContainsFilterFn", () => {
  it("matches strings, numbers, booleans, and Dates case-insensitively", () => {
    interface GlobalRow {
      name: string
      age: number
      active: boolean
      joined: Date
      empty: null
      meta: Record<string, unknown>
    }
    const filterFn = globalContainsFilterFn<GlobalRow>()

    const row = createMockRow<GlobalRow>({
      name: "Bob Builder",
      age: 42,
      active: true,
      joined: new Date("2025-07-04T12:00:00.000Z"),
      empty: null,
      meta: { role: "admin" },
    })

    expect(filterFn(row, "name", "bob", () => {})).toBe(true)
    expect(filterFn(row, "age", "42", () => {})).toBe(true)
    expect(filterFn(row, "active", "TRUE", () => {})).toBe(true)
    expect(filterFn(row, "joined", "2025-07-04", () => {})).toBe(true)
    expect(filterFn(row, "empty", "null", () => {})).toBe(false)
    expect(filterFn(row, "meta", "admin", () => {})).toBe(false)
    expect(filterFn(row, "name", "", () => {})).toBe(true)
  })

  it("implements autoRemove for empty primitive filter values", () => {
    const filterFn = globalContainsFilterFn()
    expect(filterFn.autoRemove?.("", {} as never)).toBe(true)
    expect(filterFn.autoRemove?.(null, {} as never)).toBe(true)
    expect(filterFn.autoRemove?.(undefined, {} as never)).toBe(true)
    expect(filterFn.autoRemove?.("query", {} as never)).toBe(false)
  })
})
