"use client"

import * as React from "react"
import type { RowData } from "@tanstack/react-table"
import type { LegacyReactTable } from "@tanstack/react-table/legacy"
import { cn } from "cn"
import { TableCell, TableFooter, TableRow } from "../../table"
import type {
  ColumnGroupRow,
  DataTableColumn,
  DataTableSize,
  EditMode,
  SelectionMode,
} from "../types"
import { computeAggregation } from "../utils/aggregation"

/**
 * Props for {@link DataTableFooter}.
 */
export interface DataTableFooterProps<TData extends RowData> {
  /** TanStack Table instance. */
  table: LegacyReactTable<TData>
  /** DataTable column definitions for footer/aggregation metadata. */
  columns: DataTableColumn<TData>[]
  /** Multi-row grouped footer definitions. */
  footerColumnGroup?: ColumnGroupRow[]
  /** Selection mode (to align utility column). */
  selectionMode?: SelectionMode
  /** Whether row expansion is enabled (to align utility column). */
  expandableRows?: boolean
  /** Whether row reordering is enabled (to align utility column). */
  reorderableRows?: boolean
  /** Inline edit mode (to align row-edit action column). */
  editMode?: EditMode
  /** Render borders around all cells. */
  showGridlines?: boolean
  /** Row density size. */
  size?: DataTableSize
}

const SIZE_CELL_CLASSES: Record<DataTableSize, string> = {
  sm: "px-2 py-1 text-xs",
  md: "px-3 py-2 text-sm",
  lg: "px-4 py-3 text-base",
}

const ALIGN_CLASSES: Record<"left" | "center" | "right", string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
}

/**
 * Footer for the DataTable supporting multi-row `footerColumnGroup`,
 * per-column custom footers, and automatic aggregations via `computeAggregation`.
 */
export function DataTableFooter<TData extends RowData>({
  table,
  columns,
  footerColumnGroup,
  selectionMode,
  expandableRows = false,
  reorderableRows = false,
  editMode,
  showGridlines = false,
  size = "md",
}: DataTableFooterProps<TData>) {
  const colMap = React.useMemo(() => {
    const map = new Map<string, DataTableColumn<TData>>()
    for (const col of columns) {
      const id = col.id ?? col.field
      if (id) {
        map.set(id, col)
      }
    }
    return map
  }, [columns])

  const cellPadding = SIZE_CELL_CLASSES[size]
  const gridClass = showGridlines ? "border-r last:border-r-0" : ""

  if (footerColumnGroup && footerColumnGroup.length > 0) {
    return (
      <TableFooter>
        {footerColumnGroup.map((groupRow, rowIdx) => (
          <TableRow key={rowIdx} className={groupRow.className}>
            {groupRow.cells.map((cell, cellIdx) => (
              <TableCell
                key={cellIdx}
                colSpan={cell.colSpan}
                rowSpan={cell.rowSpan}
                className={cn(
                  cellPadding,
                  gridClass,
                  cell.align && ALIGN_CLASSES[cell.align],
                  cell.className
                )}
              >
                {cell.footer}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableFooter>
    )
  }

  const visibleColumns = table.getVisibleLeafColumns()
  const hasAnyFooter = visibleColumns.some((column) => {
    const colDef = colMap.get(column.id)
    return colDef?.footer !== undefined || colDef?.aggregation !== undefined
  })

  if (!hasAnyFooter) {
    return null
  }

  const rows = table.getFilteredRowModel().rows
  const hasSelectionCol =
    selectionMode === "checkbox" || selectionMode === "radiobutton"

  return (
    <TableFooter>
      <TableRow className="hover:bg-transparent">
        {reorderableRows && (
          <TableCell className={cn("w-10", cellPadding, gridClass)} />
        )}
        {expandableRows && (
          <TableCell className={cn("w-10", cellPadding, gridClass)} />
        )}
        {hasSelectionCol && (
          <TableCell className={cn("w-10", cellPadding, gridClass)} />
        )}

        {visibleColumns.map((column) => {
          const colDef = colMap.get(column.id)
          const isPinned = column.getIsPinned()

          const stickyStyle: React.CSSProperties = {
            ...(isPinned === "start"
              ? {
                  position: "sticky",
                  left: `${column.getStart("start")}px`,
                  zIndex: 10,
                }
              : {}),
            ...(isPinned === "end"
              ? {
                  position: "sticky",
                  right: `${column.getAfter("end")}px`,
                  zIndex: 10,
                }
              : {}),
          }

          let content: React.ReactNode = null
          if (colDef?.footer !== undefined) {
            content =
              typeof colDef.footer === "function"
                ? colDef.footer({ rows, columnId: column.id, table })
                : colDef.footer
          } else if (colDef?.aggregation !== undefined) {
            const aggregated = computeAggregation(
              rows,
              column.id,
              colDef.aggregation
            )
            if (colDef.aggregationFormatter && typeof aggregated === "number") {
              content = colDef.aggregationFormatter(aggregated)
            } else {
              content = aggregated
            }
          }

          return (
            <TableCell
              key={column.id}
              style={stickyStyle}
              className={cn(
                cellPadding,
                gridClass,
                colDef?.align && ALIGN_CLASSES[colDef.align],
                isPinned && "bg-muted/80 backdrop-blur-xs",
                isPinned === "start" &&
                  "shadow-[2px_0_5px_-2px_rgba(0,0,0,0.08)]",
                isPinned === "end" &&
                  "shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.08)]",
                colDef?.className,
                colDef?.footerClassName
              )}
            >
              {content}
            </TableCell>
          )
        })}

        {editMode === "row" && (
          <TableCell className={cn("w-20", cellPadding, gridClass)} />
        )}
      </TableRow>
    </TableFooter>
  )
}
