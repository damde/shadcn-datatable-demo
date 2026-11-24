import { describe, expect, it, vi } from "vitest"
import type { LegacyRow } from "@tanstack/react-table/legacy"
import { computeAggregation, computeNumericAggregation } from "../utils/aggregation"

function createMockRows(
  values: Array<Record<string, unknown>>
): LegacyRow<Record<string, unknown>>[] {
  return values.map(
    (item, index) =>
      ({
        original: item,
        index,
        getValue: (colId: string) => item[colId],
      }) as unknown as LegacyRow<Record<string, unknown>>
  )
}

describe("computeNumericAggregation", () => {
  const rows = createMockRows([
    { price: 10 },
    { price: 20 },
    { price: "30" },
    { price: null },
    { price: "not-a-number" },
    { price: 40 },
  ])

  it("computes sum, avg, min, max, and count", () => {
    expect(computeNumericAggregation(rows, "price", "sum")).toBe(100)
    expect(computeNumericAggregation(rows, "price", "avg")).toBe(25)
    expect(computeNumericAggregation(rows, "price", "min")).toBe(10)
    expect(computeNumericAggregation(rows, "price", "max")).toBe(40)
    expect(computeNumericAggregation(rows, "price", "count")).toBe(6)
  })

  it("handles empty rows", () => {
    const empty: LegacyRow<Record<string, unknown>>[] = []
    expect(computeNumericAggregation(empty, "price", "sum")).toBeNull()
    expect(computeNumericAggregation(empty, "price", "avg")).toBeNull()
    expect(computeNumericAggregation(empty, "price", "min")).toBeNull()
    expect(computeNumericAggregation(empty, "price", "max")).toBeNull()
    expect(computeNumericAggregation(empty, "price", "count")).toBe(0)
  })

  it("returns null when no valid numeric values exist (except count)", () => {
    const nonNumeric = createMockRows([{ price: "abc" }, { price: undefined }])
    expect(computeNumericAggregation(nonNumeric, "price", "sum")).toBeNull()
    expect(computeNumericAggregation(nonNumeric, "price", "avg")).toBeNull()
    expect(computeNumericAggregation(nonNumeric, "price", "min")).toBeNull()
    expect(computeNumericAggregation(nonNumeric, "price", "max")).toBeNull()
    expect(computeNumericAggregation(nonNumeric, "price", "count")).toBe(2)
  })
})

describe("computeAggregation", () => {
  it("delegates built-in aggregation types", () => {
    const rows = createMockRows([{ amount: 5 }, { amount: 15 }])
    expect(computeAggregation(rows, "amount", "sum")).toBe(20)
    expect(computeAggregation(rows, "amount", "avg")).toBe(10)
    expect(computeAggregation(rows, "amount", "min")).toBe(5)
    expect(computeAggregation(rows, "amount", "max")).toBe(15)
    expect(computeAggregation(rows, "amount", "count")).toBe(2)
  })

  it("invokes custom aggregation reducer function", () => {
    const rows = createMockRows([{ amount: 5 }, { amount: 15 }])
    const customReducer = vi.fn(
      (r: LegacyRow<Record<string, unknown>>[], colId: string) =>
        `${colId}:${r.length}`
    )

    const result = computeAggregation(rows, "amount", customReducer)
    expect(result).toBe("amount:2")
    expect(customReducer).toHaveBeenCalledWith(rows, "amount")
  })
})
