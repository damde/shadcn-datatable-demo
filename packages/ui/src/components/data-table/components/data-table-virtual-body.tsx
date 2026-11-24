"use client"

import * as React from "react"
import type { RowData } from "@tanstack/react-table"
import type { LegacyRow } from "@tanstack/react-table/legacy"
import { useVirtualizer } from "@tanstack/react-virtual"
import { TableBody } from "../../table"
import type { VirtualScrollerOptions } from "../types"

/**
 * Props for {@link DataTableVirtualBody}.
 */
export interface DataTableVirtualBodyProps<TData extends RowData> {
  /** Rows to virtualize inside the scroll container. */
  rows: LegacyRow<TData>[]
  /** Total visible column span used for top/bottom virtual spacer rows. */
  totalColSpan: number
  /** Scroll container ref for virtual scrolling. */
  scrollContainerRef?: React.RefObject<HTMLDivElement | null>
  /** Scroll container DOM element (triggers re-render on mount for virtualizer). */
  scrollContainerEl?: HTMLDivElement | null
  /** External imperative ref populated with virtualizer's `scrollToIndex` callback. */
  virtualScrollToIndexRef?: React.RefObject<((index: number) => void) | null>
  /** Internal ref used by `DataTableBody` keyboard navigation to scroll offscreen rows into view. */
  internalScrollToIndexRef?: React.RefObject<((index: number) => void) | null>
  /** Virtual scroller options (`itemSize`, `overscan`). */
  virtualScrollerOptions?: VirtualScrollerOptions
  /** Optional pinned top rows rendered above the virtualized window. */
  frozenRows?: React.ReactNode
  /** Renders an individual virtualized data row and attaches `measureElement` ref. */
  renderRow: (
    row: LegacyRow<TData>,
    rowIndex: number,
    measureRef: (node: HTMLTableRowElement | null) => void
  ) => React.ReactNode
}

/**
 * Isolated virtualized `<TableBody>` powered by `@tanstack/react-virtual`.
 * Extracted from `DataTableBody` so non-virtualized tables never invoke `useVirtualizer`
 * or trigger React Compiler's `react-hooks/incompatible-library` bailout.
 */
export function DataTableVirtualBody<TData extends RowData>({
  rows,
  totalColSpan,
  scrollContainerRef,
  scrollContainerEl,
  virtualScrollToIndexRef,
  internalScrollToIndexRef,
  virtualScrollerOptions,
  frozenRows,
  renderRow,
}: DataTableVirtualBodyProps<TData>) {
  "use no memo"

  const estimatedItemSize = virtualScrollerOptions?.itemSize ?? 40
  const overscan = virtualScrollerOptions?.overscan ?? 10

  // eslint-disable-next-line react-hooks/incompatible-library
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () =>
      scrollContainerEl ?? scrollContainerRef?.current ?? null,
    estimateSize: () => estimatedItemSize,
    overscan,
    indexAttribute: "data-row-index",
    measureElement: (element) => {
      const measuredHeight = element.getBoundingClientRect().height
      return measuredHeight > 0 ? measuredHeight : estimatedItemSize
    },
  })

  React.useEffect(() => {
    if (virtualScrollToIndexRef) {
      virtualScrollToIndexRef.current = (index: number) => {
        virtualizer.scrollToIndex(index, { align: "start" })
      }
    }
    if (internalScrollToIndexRef) {
      internalScrollToIndexRef.current = (index: number) => {
        virtualizer.scrollToIndex(index, { align: "auto" })
      }
    }
    return () => {
      if (virtualScrollToIndexRef) {
        virtualScrollToIndexRef.current = null
      }
      if (internalScrollToIndexRef) {
        internalScrollToIndexRef.current = null
      }
    }
  }, [virtualizer, virtualScrollToIndexRef, internalScrollToIndexRef])

  const virtualItems = virtualizer.getVirtualItems()
  const totalSize = virtualizer.getTotalSize()
  const paddingTop =
    virtualItems.length > 0 ? (virtualItems[0]?.start ?? 0) : 0
  const paddingBottom =
    virtualItems.length > 0
      ? Math.max(
          0,
          totalSize - (virtualItems[virtualItems.length - 1]?.end ?? 0)
        )
      : 0

  return (
    <TableBody>
      {frozenRows}
      {paddingTop > 0 && (
        <tr aria-hidden="true" className="border-0">
          <td
            colSpan={totalColSpan}
            className="border-0 p-0"
            style={{ height: `${paddingTop}px`, padding: 0, border: 0 }}
          />
        </tr>
      )}
      {virtualItems.map((virtualRow) => {
        const row = rows[virtualRow.index]
        if (!row) return null
        return renderRow(row, virtualRow.index, virtualizer.measureElement)
      })}
      {paddingBottom > 0 && (
        <tr aria-hidden="true" className="border-0">
          <td
            colSpan={totalColSpan}
            className="border-0 p-0"
            style={{ height: `${paddingBottom}px`, padding: 0, border: 0 }}
          />
        </tr>
      )}
    </TableBody>
  )
}
