import type { LegacyRow } from "@tanstack/react-table/legacy"
import type { DataTableColumn } from "../types"

/**
 * Options for CSV and JSON export utilities.
 */
export interface ExportOptions {
  /** Output filename (extension is appended automatically if missing). */
  filename?: string
  /** Trigger a browser file download when `document` is available (default: `true`). */
  triggerDownload?: boolean
  /** Prefix formula-like string cells with `'` to prevent CSV/spreadsheet formula injection (default: `true`). */
  sanitizeFormulas?: boolean
}

function getExportableColumns<TData extends object>(
  columns: DataTableColumn<TData>[]
): DataTableColumn<TData>[] {
  return columns.filter(
    (col) =>
      col.exportable !== false &&
      (col.field !== undefined ||
        col.accessorFn !== undefined ||
        col.id !== undefined)
  )
}

function getColumnId<TData extends object>(col: DataTableColumn<TData>): string {
  return col.id ?? col.field ?? ""
}

function getColumnHeader<TData extends object>(col: DataTableColumn<TData>): string {
  if (typeof col.header === "string") return col.header
  return getColumnId(col)
}

function getCellValue<TData extends object>(
  row: LegacyRow<TData>,
  col: DataTableColumn<TData>
): unknown {
  const colId = getColumnId(col)
  if (colId) {
    try {
      const value = row.getValue(colId)
      if (value !== undefined) return value
    } catch {
      // Fallback to direct accessor if column is not registered on the table
    }
  }
  if (col.accessorFn) {
    return col.accessorFn(row.original, row.index)
  }
  if (col.field) {
    return (row.original as Record<string, unknown>)[col.field]
  }
  return undefined
}

function isFormulaPayload(str: string): boolean {
  if (str.length === 0) return false
  const first = str[0]
  if (
    first === "=" ||
    first === "+" ||
    first === "@" ||
    first === "\t" ||
    first === "\r"
  ) {
    return true
  }
  if (first === "-") {
    return !/^-\d+(\.\d+)?$/.test(str.trim())
  }
  return false
}

/**
 * Escapes a single cell value for RFC 4180 CSV output with optional OWASP CSV formula injection protection.
 */
export function escapeCSVCell(
  value: unknown,
  sanitizeFormulas = true
): string {
  if (value === null || value === undefined) return ""
  if (typeof value === "number") {
    return String(value)
  }
  let str = value instanceof Date ? value.toISOString() : String(value)
  if (sanitizeFormulas && isFormulaPayload(str)) {
    str = `'${str}`
  }
  if (
    str.includes('"') ||
    str.includes(",") ||
    str.includes("\n") ||
    str.includes("\r")
  ) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

function triggerBrowserDownload(
  content: string,
  mimeType: string,
  filename: string
): void {
  if (typeof document === "undefined") return
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  link.style.display = "none"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

function ensureExtension(filename: string, ext: string): string {
  return filename.toLowerCase().endsWith(`.${ext}`)
    ? filename
    : `${filename}.${ext}`
}

/**
 * Exports table rows and exportable columns to a CSV string, optionally triggering
 * a browser file download.
 */
export function exportToCSV<TData extends object>(
  rows: LegacyRow<TData>[],
  columns: DataTableColumn<TData>[],
  options?: ExportOptions
): string {
  const sanitizeFormulas = options?.sanitizeFormulas ?? true
  const exportCols = getExportableColumns(columns)
  const headers = exportCols.map((col) =>
    escapeCSVCell(getColumnHeader(col), sanitizeFormulas)
  )
  const lines = [headers.join(",")]

  for (const row of rows) {
    const cells = exportCols.map((col) =>
      escapeCSVCell(getCellValue(row, col), sanitizeFormulas)
    )
    lines.push(cells.join(","))
  }

  const csv = lines.join("\n")
  if (options?.triggerDownload !== false && typeof document !== "undefined") {
    const filename = ensureExtension(
      options?.filename ?? "datatable-export",
      "csv"
    )
    triggerBrowserDownload(csv, "text/csv;charset=utf-8;", filename)
  }

  return csv
}

/**
 * Exports table rows and exportable columns to a formatted JSON string, optionally
 * triggering a browser file download.
 */
export function exportToJSON<TData extends object>(
  rows: LegacyRow<TData>[],
  columns: DataTableColumn<TData>[],
  options?: ExportOptions
): string {
  const exportCols = getExportableColumns(columns)
  const records = rows.map((row) => {
    const record: Record<string, unknown> = {}
    for (const col of exportCols) {
      const key = col.field ?? col.id ?? ""
      if (key) {
        record[key] = getCellValue(row, col)
      }
    }
    return record
  })

  const json = JSON.stringify(records, null, 2)
  if (options?.triggerDownload !== false && typeof document !== "undefined") {
    const filename = ensureExtension(
      options?.filename ?? "datatable-export",
      "json"
    )
    triggerBrowserDownload(json, "application/json;charset=utf-8;", filename)
  }

  return json
}
