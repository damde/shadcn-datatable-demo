"use client"

import * as React from "react"
import type { RowData } from "@tanstack/react-table"
import type { LegacyRow } from "@tanstack/react-table/legacy"
import { Input } from "../../input"
import type { DataTableColumn } from "../types"

/**
 * Active inline cell edit state (`editMode === "cell"`).
 */
export interface EditingCellState {
  rowId: string
  columnId: string
  value: unknown
  error?: string
}

/**
 * Active inline row edit state (`editMode === "row"`).
 */
export interface EditingRowState {
  rowId: string
  draft: Record<string, unknown>
  errors?: Record<string, string>
}

const UNSAFE_PATH_KEYS = new Set(["__proto__", "constructor", "prototype"])

/**
 * Reads a flat property or dot-separated nested path (e.g. `"meta.score"`) from an object.
 */
export function getFieldValue(obj: unknown, path: string): unknown {
  if (obj === null || obj === undefined || !path) return undefined
  if (typeof obj === "object" && path in (obj as Record<string, unknown>)) {
    return (obj as Record<string, unknown>)[path]
  }
  return path.split(".").reduce<unknown>((acc, key) => {
    if (
      acc !== null &&
      typeof acc === "object" &&
      key in (acc as Record<string, unknown>)
    ) {
      return (acc as Record<string, unknown>)[key]
    }
    return undefined
  }, obj)
}

/**
 * Immutably sets a flat property or dot-separated nested path (e.g. `"meta.score"`)
 * on a row object, cloning each ancestor object along the path.
 */
export function setNestedFieldValue<TData>(
  obj: TData,
  path: string,
  value: unknown
): TData {
  if (!path) return obj
  const keys = path.split(".")
  if (keys.some((k) => UNSAFE_PATH_KEYS.has(k))) {
    return obj
  }

  if (keys.length === 1) {
    return {
      ...(obj as Record<string, unknown>),
      [keys[0]!]: value,
    } as TData
  }

  const updateAtDepth = (current: unknown, depth: number): unknown => {
    const key = keys[depth]!
    const cloned: Record<string, unknown> =
      current !== null && typeof current === "object" && !Array.isArray(current)
        ? { ...(current as Record<string, unknown>) }
        : {}

    if (depth === keys.length - 1) {
      cloned[key] = value
      return cloned
    }

    cloned[key] = updateAtDepth(cloned[key], depth + 1)
    return cloned
  }

  return updateAtDepth(obj, 0) as TData
}

/**
 * Coerces edited string values back to finite numbers when the original field value
 * is numeric or the column has `filterType === "number"`.
 */
export function coerceEditedValue<TData extends RowData>(
  raw: unknown,
  oldValue: unknown,
  colDef?: DataTableColumn<TData>
): unknown {
  const shouldCoerceNumber =
    typeof oldValue === "number" || colDef?.filterType === "number"
  if (
    shouldCoerceNumber &&
    typeof raw === "string" &&
    raw.trim() !== "" &&
    Number.isFinite(Number(raw))
  ) {
    return Number(raw)
  }
  return raw
}

/**
 * Runs `colDef.onCellEditValidate` if defined and returns an error string when invalid,
 * or `undefined` when valid.
 */
export function validateEditedValue<TData extends RowData>(
  newValue: unknown,
  oldValue: unknown,
  rowData: TData,
  colDef?: DataTableColumn<TData>
): string | undefined {
  if (!colDef?.onCellEditValidate) return undefined
  const result = colDef.onCellEditValidate(newValue, oldValue, rowData)
  if (result === false) return "Invalid value"
  if (typeof result === "string") return result
  return undefined
}

/**
 * Props for {@link DataTableEditableCell}.
 */
export interface DataTableEditableCellProps<TData extends RowData> {
  /** Editing mode (`"cell"` commits on blur/Enter; `"row"` commits via Enter or row Save button). */
  mode: "cell" | "row"
  /** Current draft value for this cell. */
  value: unknown
  /** Validation error message if the last commit attempt failed. */
  error?: string
  /** Field identifier / label used for accessible input naming. */
  field: string
  /** TanStack row instance. */
  row: LegacyRow<TData>
  /** Zero-based row index. */
  rowIndex: number
  /** Column definition for custom `editor` or type metadata. */
  colDef?: DataTableColumn<TData>
  /** Auto-focus the input on mount (used in `"cell"` mode). */
  autoFocus?: boolean
  /** Update the draft value for this cell. */
  onChange: (nextValue: unknown) => void
  /** Attempt to validate and commit the edit; returns `true` if committed, `false` if invalid. */
  onCommit: () => boolean
  /** Cancel editing and discard changes. */
  onCancel: () => void
}

/**
 * Renders an inline cell or row editor with validation feedback and a commit/blur
 * re-entrancy guard (`isCommittingRef`) to prevent `Enter` + `onBlur` double-commits.
 */
export function DataTableEditableCell<TData extends RowData>({
  mode,
  value,
  error,
  field,
  row,
  rowIndex,
  colDef,
  autoFocus = false,
  onChange,
  onCommit,
  onCancel,
}: DataTableEditableCellProps<TData>) {
  const isCommittingRef = React.useRef(false)
  const errorId = React.useId()

  const handleSafeCommit = () => {
    if (isCommittingRef.current) return
    isCommittingRef.current = true
    const committed = onCommit()
    if (!committed) {
      isCommittingRef.current = false
    }
  }

  const handleSafeCancel = () => {
    if (isCommittingRef.current) return
    isCommittingRef.current = true
    onCancel()
  }

  if (colDef?.editor) {
    const customEditor = colDef.editor({
      value,
      row,
      data: row.original,
      rowIndex,
      column: colDef,
      onChange,
      onCommit: () => {
        onCommit()
      },
      onCancel: () => {
        onCancel()
      },
    })

    if (!error) {
      return <>{customEditor}</>
    }

    return (
      <div className="flex flex-col gap-0.5">
        {customEditor}
        <span className="text-[11px] text-destructive">{error}</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-0.5">
      <Input
        autoFocus={autoFocus}
        value={String(value ?? "")}
        aria-label={`Edit ${field}`}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        onChange={(e) => onChange(e.target.value)}
        onBlur={mode === "cell" ? () => handleSafeCommit() : undefined}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault()
            e.stopPropagation()
            handleSafeCommit()
          } else if (e.key === "Escape") {
            e.preventDefault()
            e.stopPropagation()
            handleSafeCancel()
          }
        }}
        className="h-7 text-xs"
      />
      {error && (
        <span id={errorId} className="text-[11px] text-destructive">
          {error}
        </span>
      )}
    </div>
  )
}
