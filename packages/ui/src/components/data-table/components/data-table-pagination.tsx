"use client"

import type { RowData } from "@tanstack/react-table"
import type { LegacyReactTable } from "@tanstack/react-table/legacy"
import { cn } from "cn"
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react"
import { Button } from "../../button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../select"
import { DEFAULT_MESSAGES_EN, type DataTableMessages } from "../utils/locale"

/**
 * Props for {@link DataTablePagination}.
 */
export interface DataTablePaginationProps<TData extends RowData> {
  /** TanStack Table instance. */
  table: LegacyReactTable<TData>
  /** Total record count (used in lazy/server-side mode). */
  totalRecords?: number
  /** Available page size options. */
  rowsPerPageOptions?: number[]
  /** Template string supporting `{first}`, `{last}`, `{totalRecords}`, `{currentPage}`, `{totalPages}`. */
  currentPageReportTemplate?: string
  /** Whether to display the current page report text. */
  showCurrentPageReport?: boolean
  /** Localized UI and ARIA strings. */
  messages?: DataTableMessages
  /** Additional CSS class for the pagination container. */
  className?: string
}

/**
 * Computes the list of page numbers and ellipsis markers to display.
 */
function getPageNumbers(
  currentPage: number,
  totalPages: number
): Array<number | "ellipsis"> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }

  const pages: Array<number | "ellipsis"> = [1]

  if (currentPage > 3) {
    pages.push("ellipsis")
  }

  const start = Math.max(2, currentPage - 1)
  const end = Math.min(totalPages - 1, currentPage + 1)

  for (let p = start; p <= end; p++) {
    pages.push(p)
  }

  if (currentPage < totalPages - 2) {
    pages.push("ellipsis")
  }

  pages.push(totalPages)
  return pages
}

/**
 * Formats the page report template with current pagination metrics.
 */
function formatPageReport(
  template: string,
  values: {
    first: number
    last: number
    totalRecords: number
    currentPage: number
    totalPages: number
  }
): string {
  return template
    .replace(/\{first\}/g, String(values.first))
    .replace(/\{last\}/g, String(values.last))
    .replace(/\{totalRecords\}/g, String(values.totalRecords))
    .replace(/\{currentPage\}/g, String(values.currentPage))
    .replace(/\{totalPages\}/g, String(values.totalPages))
}

/**
 * Pagination controls for the DataTable with first/prev/numbered/next/last buttons,
 * rows-per-page selector, and customizable page report.
 */
export function DataTablePagination<TData extends RowData>({
  table,
  totalRecords,
  rowsPerPageOptions = [5, 10, 20, 50],
  currentPageReportTemplate = "Showing {first} to {last} of {totalRecords} entries",
  showCurrentPageReport = true,
  messages = DEFAULT_MESSAGES_EN,
  className,
}: DataTablePaginationProps<TData>) {
  const { pageIndex, pageSize } = table.getState().pagination
  const total = totalRecords ?? table.getFilteredRowModel().rows.length
  const totalPages = Math.max(1, table.getPageCount())
  const currentPage = Math.min(pageIndex + 1, totalPages)
  const first = total === 0 ? 0 : pageIndex * pageSize + 1
  const last = Math.min(total, (pageIndex + 1) * pageSize)

  const canPrevious = table.getCanPreviousPage()
  const canNext = table.getCanNextPage()
  const pageNumbers = getPageNumbers(currentPage, totalPages)

  const reportText = formatPageReport(currentPageReportTemplate, {
    first,
    last,
    totalRecords: total,
    currentPage,
    totalPages,
  })

  return (
    <div
      className={cn(
        "flex flex-col gap-3 px-1 py-2 text-sm sm:flex-row sm:flex-wrap sm:items-center sm:justify-between",
        className
      )}
    >
      {showCurrentPageReport ? (
        <div className="text-muted-foreground">{reportText}</div>
      ) : (
        <div />
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 sm:justify-end sm:gap-3">
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground">
            {messages.rowsPerPage}
          </span>
          <Select
            value={String(pageSize)}
            onValueChange={(val) => {
              if (val) {
                table.setPageSize(Number(val))
              }
            }}
          >
            <SelectTrigger
              size="sm"
              aria-label={messages.rowsPerPage}
              className="w-18"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end">
              {rowsPerPageOptions.map((option) => (
                <SelectItem key={option} value={String(option)}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <nav
          aria-label={messages.paginationNav}
          className="flex items-center gap-1"
        >
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            onClick={() => table.setPageIndex(0)}
            disabled={!canPrevious}
            aria-label={messages.firstPage}
          >
            <ChevronsLeft className="size-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            onClick={() => table.previousPage()}
            disabled={!canPrevious}
            aria-label={messages.previousPage}
          >
            <ChevronLeft className="size-4" />
          </Button>

          {pageNumbers.map((item, idx) =>
            item === "ellipsis" ? (
              <span
                key={`ellipsis-${idx}`}
                className="hidden px-1.5 text-xs text-muted-foreground select-none sm:inline"
                aria-hidden="true"
              >
                ...
              </span>
            ) : (
              <Button
                key={item}
                type="button"
                variant={item === currentPage ? "default" : "outline"}
                size="icon-sm"
                onClick={() => table.setPageIndex(item - 1)}
                aria-label={messages.pageLabel(item)}
                aria-current={item === currentPage ? "page" : undefined}
                className={cn(item !== currentPage && "hidden sm:inline-flex")}
              >
                {item}
              </Button>
            )
          )}

          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            onClick={() => table.nextPage()}
            disabled={!canNext}
            aria-label={messages.nextPage}
          >
            <ChevronRight className="size-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            onClick={() => table.setPageIndex(totalPages - 1)}
            disabled={!canNext}
            aria-label={messages.lastPage}
          >
            <ChevronsRight className="size-4" />
          </Button>
        </nav>
      </div>
    </div>
  )
}
