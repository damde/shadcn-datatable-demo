import type * as React from "react"
import type { LegacyRow } from "@tanstack/react-table/legacy"
import type { AggregationType } from "../types"

/**
 * Built-in numeric aggregation type names.
 */
export type NumericAggregationType = "sum" | "avg" | "min" | "max" | "count"

function extractNumericValues<TData extends object>(
  rows: LegacyRow<TData>[],
  columnId: string
): number[] {
  const values: number[] = []
  for (const row of rows) {
    const raw = row.getValue(columnId)
    if (typeof raw === "number") {
      if (Number.isFinite(raw)) values.push(raw)
    } else if (typeof raw === "string") {
      const trimmed = raw.trim()
      if (trimmed !== "") {
        const parsed = Number(trimmed)
        if (Number.isFinite(parsed)) values.push(parsed)
      }
    }
  }
  return values
}

/**
 * Computes a numeric aggregation (`sum`, `avg`, `min`, `max`, or `count`) for a column
 * across the given rows. Returns `null` when no numeric values are present (except `count`).
 */
export function computeNumericAggregation<TData extends object>(
  rows: LegacyRow<TData>[],
  columnId: string,
  type: NumericAggregationType
): number | null {
  if (type === "count") {
    return rows.length
  }

  const values = extractNumericValues(rows, columnId)
  if (values.length === 0) {
    return null
  }

  switch (type) {
    case "sum": {
      let total = 0
      for (const v of values) total += v
      return total
    }
    case "avg": {
      let total = 0
      for (const v of values) total += v
      return total / values.length
    }
    case "min": {
      let min = values[0]!
      for (let i = 1; i < values.length; i++) {
        if (values[i]! < min) min = values[i]!
      }
      return min
    }
    case "max": {
      let max = values[0]!
      for (let i = 1; i < values.length; i++) {
        if (values[i]! > max) max = values[i]!
      }
      return max
    }
  }
}

/**
 * Computes a column aggregation value (built-in or custom reducer function) as a `React.ReactNode`.
 */
export function computeAggregation<TData extends object>(
  rows: LegacyRow<TData>[],
  columnId: string,
  aggregation: AggregationType<TData>
): React.ReactNode {
  if (typeof aggregation === "function") {
    return aggregation(rows as never, columnId)
  }
  return computeNumericAggregation(rows, columnId, aggregation)
}
