import type { FilterFn } from "@tanstack/react-table"
import type { LegacyFeatures, LegacyRow } from "@tanstack/react-table/legacy"
import type {
  ColumnFilterType,
  ColumnFilterValue,
  FilterMatchMode,
} from "../types"

/**
 * Default filter match mode for each column filter input type.
 */
export const DEFAULT_MATCH_MODE_BY_TYPE: Record<
  ColumnFilterType,
  FilterMatchMode
> = {
  text: "contains",
  number: "equals",
  select: "equals",
  "multi-select": "in",
  date: "dateIs",
  boolean: "equals",
}

/**
 * Human-readable labels for all supported filter match modes.
 */
export const MATCH_MODE_LABELS: Record<FilterMatchMode, string> = {
  contains: "Contains",
  notContains: "Does not contain",
  startsWith: "Starts with",
  endsWith: "Ends with",
  equals: "Equals",
  notEquals: "Not equals",
  gt: "Greater than",
  gte: "Greater than or equal",
  lt: "Less than",
  lte: "Less than or equal",
  between: "Between",
  in: "In",
  notIn: "Not in",
  dateIs: "Date is",
  dateBefore: "Date before",
  dateAfter: "Date after",
}

function isColumnFilterValue(value: unknown): value is ColumnFilterValue {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    !(value instanceof Date) &&
    "value" in value
  )
}

function isEmptyPrimitive(value: unknown): boolean {
  return value === undefined || value === null || value === ""
}

function isEmptyFilterValue(value: unknown): boolean {
  if (isColumnFilterValue(value)) {
    return isEmptyFilterValue(value.value)
  }
  if (Array.isArray(value)) {
    return value.length === 0 || value.every(isEmptyPrimitive)
  }
  return isEmptyPrimitive(value)
}

function toValidDate(value: unknown): Date | null {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value
  }
  if (typeof value === "string") {
    const trimmed = value.trim()
    if (!trimmed) return null
    // Parse date-only ISO strings (YYYY-MM-DD) as local midnight to avoid UTC/local off-by-one day shifts
    const isoDateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed)
    if (isoDateOnly) {
      const year = Number(isoDateOnly[1])
      const month = Number(isoDateOnly[2]) - 1
      const day = Number(isoDateOnly[3])
      const parsed = new Date(year, month, day)
      return Number.isNaN(parsed.getTime()) ? null : parsed
    }
    const parsed = new Date(trimmed)
    return Number.isNaN(parsed.getTime()) ? null : parsed
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    const parsed = new Date(value)
    return Number.isNaN(parsed.getTime()) ? null : parsed
  }
  return null
}

function startOfDayTime(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
}

function toComparableNumber(value: unknown): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null
  }
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value.getTime()
  }
  if (typeof value === "string") {
    const trimmed = value.trim()
    if (!trimmed) return null
    const num = Number(trimmed)
    if (Number.isFinite(num)) return num
    const date = toValidDate(trimmed)
    return date ? date.getTime() : null
  }
  return null
}

function valuesEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true
  if (a == null || b == null) return false

  if (typeof a === "boolean" || typeof b === "boolean") {
    return String(a).toLowerCase() === String(b).toLowerCase()
  }

  if (a instanceof Date || b instanceof Date) {
    const da = toValidDate(a)
    const db = toValidDate(b)
    if (!da || !db) return false
    return da.getTime() === db.getTime()
  }

  if (typeof a === "number" && typeof b === "number") {
    return a === b
  }

  return String(a).toLowerCase() === String(b).toLowerCase()
}

/**
 * Evaluates whether a cell value satisfies a filter value under the given `FilterMatchMode`.
 */
export function applyFilterMatchMode(
  cellValue: unknown,
  filterValue: unknown,
  matchMode: FilterMatchMode
): boolean {
  if (matchMode === "between") {
    if (!Array.isArray(filterValue) || filterValue.length < 2) return true
    const [rawMin, rawMax] = filterValue
    const hasMin = !isEmptyPrimitive(rawMin)
    const hasMax = !isEmptyPrimitive(rawMax)
    if (!hasMin && !hasMax) return true
    if (cellValue == null) return false

    const cellNum = toComparableNumber(cellValue)
    if (cellNum === null) return false

    if (hasMin) {
      const minNum = toComparableNumber(rawMin)
      if (minNum !== null && cellNum < minNum) return false
    }
    if (hasMax) {
      const maxNum = toComparableNumber(rawMax)
      if (maxNum !== null && cellNum > maxNum) return false
    }
    return true
  }

  if (matchMode === "in" || matchMode === "notIn") {
    if (!Array.isArray(filterValue) || filterValue.length === 0) return true
    if (cellValue == null) return matchMode === "notIn"
    const matched = filterValue.some((item) => valuesEqual(cellValue, item))
    return matchMode === "in" ? matched : !matched
  }

  if (isEmptyPrimitive(filterValue)) return true

  switch (matchMode) {
    case "contains": {
      if (cellValue == null) return false
      return String(cellValue)
        .toLowerCase()
        .includes(String(filterValue).toLowerCase())
    }
    case "notContains": {
      if (cellValue == null) return true
      return !String(cellValue)
        .toLowerCase()
        .includes(String(filterValue).toLowerCase())
    }
    case "startsWith": {
      if (cellValue == null) return false
      return String(cellValue)
        .toLowerCase()
        .startsWith(String(filterValue).toLowerCase())
    }
    case "endsWith": {
      if (cellValue == null) return false
      return String(cellValue)
        .toLowerCase()
        .endsWith(String(filterValue).toLowerCase())
    }
    case "equals": {
      if (cellValue == null) return false
      return valuesEqual(cellValue, filterValue)
    }
    case "notEquals": {
      if (cellValue == null) return true
      return !valuesEqual(cellValue, filterValue)
    }
    case "gt":
    case "gte":
    case "lt":
    case "lte": {
      if (cellValue == null) return false
      const cellNum = toComparableNumber(cellValue)
      const filterNum = toComparableNumber(filterValue)
      if (cellNum === null || filterNum === null) return false
      if (matchMode === "gt") return cellNum > filterNum
      if (matchMode === "gte") return cellNum >= filterNum
      if (matchMode === "lt") return cellNum < filterNum
      return cellNum <= filterNum
    }
    case "dateIs":
    case "dateBefore":
    case "dateAfter": {
      if (cellValue == null) return false
      const cellDate = toValidDate(cellValue)
      const filterDate = toValidDate(filterValue)
      if (!cellDate || !filterDate) return false
      const cellDay = startOfDayTime(cellDate)
      const filterDay = startOfDayTime(filterDate)
      if (matchMode === "dateIs") return cellDay === filterDay
      if (matchMode === "dateBefore") return cellDay < filterDay
      return cellDay > filterDay
    }
    default:
      return true
  }
}

/**
 * Creates a TanStack Table column `FilterFn` that supports both `{ value, matchMode }`
 * (`ColumnFilterValue`) objects and raw primitive/array filter values.
 */
export function createColumnFilterFn<TData extends object>(
  defaultMatchMode: FilterMatchMode = "contains"
): FilterFn<LegacyFeatures, TData> {
  const filterFn: FilterFn<LegacyFeatures, TData> = (
    row: LegacyRow<TData>,
    columnId: string,
    filterValue: unknown
  ): boolean => {
    if (isEmptyFilterValue(filterValue)) return true

    const cellValue = row.getValue(columnId)
    if (isColumnFilterValue(filterValue)) {
      const mode = filterValue.matchMode ?? defaultMatchMode
      return applyFilterMatchMode(cellValue, filterValue.value, mode)
    }

    const inferredMode: FilterMatchMode = Array.isArray(filterValue)
      ? defaultMatchMode === "between"
        ? "between"
        : "in"
      : defaultMatchMode
    return applyFilterMatchMode(cellValue, filterValue, inferredMode)
  }

  filterFn.autoRemove = (filterValue: unknown) =>
    isEmptyFilterValue(filterValue)

  return filterFn
}

/**
 * Creates a TanStack Table global `FilterFn` that performs a case-insensitive
 * substring search across string, number, boolean, and Date cell values.
 */
export function globalContainsFilterFn<TData extends object>(): FilterFn<
  LegacyFeatures,
  TData
> {
  const filterFn: FilterFn<LegacyFeatures, TData> = (
    row: LegacyRow<TData>,
    columnId: string,
    filterValue: unknown
  ): boolean => {
    if (isEmptyPrimitive(filterValue)) return true

    const cellValue = row.getValue(columnId)
    if (cellValue === null || cellValue === undefined) return false

    const needle = String(filterValue).toLowerCase()
    if (
      typeof cellValue === "string" ||
      typeof cellValue === "number" ||
      typeof cellValue === "boolean"
    ) {
      return String(cellValue).toLowerCase().includes(needle)
    }
    if (cellValue instanceof Date) {
      return Number.isNaN(cellValue.getTime())
        ? false
        : cellValue.toISOString().toLowerCase().includes(needle)
    }
    return false
  }

  filterFn.autoRemove = (filterValue: unknown) =>
    isEmptyPrimitive(filterValue)

  return filterFn
}
