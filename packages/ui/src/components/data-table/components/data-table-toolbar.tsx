"use client"

import * as React from "react"
import type { RowData } from "@tanstack/react-table"
import type { LegacyColumn, LegacyReactTable } from "@tanstack/react-table/legacy"
import { cn } from "cn"
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Columns3,
  Download,
  FilterX,
  Search,
  X,
} from "lucide-react"
import { Badge } from "../../badge"
import { Button } from "../../button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../dropdown-menu"
import { Input } from "../../input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../select"
import { DEFAULT_MESSAGES_EN, type DataTableMessages } from "../utils/locale"

const MOBILE_ONLY_CLASS: Record<"sm" | "md" | "lg", string> = {
  sm: "sm:hidden",
  md: "md:hidden",
  lg: "lg:hidden",
}

/**
 * Resolves a human-readable column label from string header, `meta.label`, or `column.id`.
 */
function getColumnLabel<TData extends RowData>(
  column: LegacyColumn<TData, unknown>
): string {
  const meta = column.columnDef.meta as { label?: string } | undefined
  return typeof column.columnDef.header === "string"
    ? column.columnDef.header
    : (meta?.label ?? column.id)
}

/**
 * Props for {@link DataTableToolbar}.
 */
export interface DataTableToolbarProps<TData extends RowData> {
  /** TanStack Table instance. */
  table: LegacyReactTable<TData>
  /** Custom header content rendered above or at the start of the toolbar. */
  header?: React.ReactNode
  /** Custom content rendered on the left side of the toolbar. */
  toolbarLeft?: React.ReactNode
  /** Custom content rendered on the right side of the toolbar. */
  toolbarRight?: React.ReactNode
  /** Show debounced global search input. */
  enableGlobalFilter?: boolean
  /** Current global filter string. */
  globalFilter?: string
  /** Placeholder text for global search input. */
  globalFilterPlaceholder?: string
  /** Callback invoked when global filter changes (debounced). */
  onGlobalFilterChange?: (value: string) => void
  /** Callback to clear all column and global filters. */
  onClearFilters?: () => void
  /** Show column visibility toggle dropdown. */
  columnToggle?: boolean
  /** Show CSV / JSON export dropdown. */
  exportable?: boolean
  /** Callback to export data as CSV. */
  onExportCSV?: (options?: { selectionOnly?: boolean }) => void
  /** Callback to export data as JSON. */
  onExportJSON?: (options?: { selectionOnly?: boolean }) => void
  /** Responsive layout mode (renders mobile sort control when `"stack"`). */
  responsiveLayout?: "scroll" | "stack"
  /** Breakpoint below which `responsiveLayout="stack"` activates (default: `"md"`). */
  breakpoint?: "sm" | "md" | "lg"
  /** Localized UI and ARIA strings. */
  messages?: DataTableMessages
  /** Additional CSS class for the toolbar container. */
  className?: string
}

/**
 * Toolbar for the DataTable providing global search, active filter clearing,
 * column visibility toggling, data export, mobile stack sorting, and custom left/right slots.
 */
export function DataTableToolbar<TData extends RowData>({
  table,
  header,
  toolbarLeft,
  toolbarRight,
  enableGlobalFilter = false,
  globalFilter = "",
  globalFilterPlaceholder,
  onGlobalFilterChange,
  onClearFilters,
  columnToggle = false,
  exportable = false,
  onExportCSV,
  onExportJSON,
  responsiveLayout = "scroll",
  breakpoint = "md",
  messages = DEFAULT_MESSAGES_EN,
  className,
}: DataTableToolbarProps<TData>) {
  const [searchValue, setSearchValue] = React.useState(globalFilter)
  const [prevGlobalFilter, setPrevGlobalFilter] = React.useState(globalFilter)
  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  if (globalFilter !== prevGlobalFilter) {
    setPrevGlobalFilter(globalFilter)
    setSearchValue(globalFilter)
  }

  React.useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value
    setSearchValue(next)
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }
    debounceRef.current = setTimeout(() => {
      onGlobalFilterChange?.(next)
    }, 300)
  }

  const handleClearSearch = () => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }
    setSearchValue("")
    onGlobalFilterChange?.("")
  }

  const columnFiltersCount = table.getState().columnFilters.length
  const hasGlobalFilter = Boolean(globalFilter.trim())
  const activeFilterCount = columnFiltersCount + (hasGlobalFilter ? 1 : 0)

  const handleClearAllFilters = () => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }
    setSearchValue("")
    if (onClearFilters) {
      onClearFilters()
    } else {
      table.resetColumnFilters()
      onGlobalFilterChange?.("")
    }
  }

  const toggleableColumns = table
    .getAllLeafColumns()
    .filter((column) => column.getCanHide())

  const sortableColumns = table
    .getAllLeafColumns()
    .filter((column) => column.getCanSort())

  const showMobileSort =
    responsiveLayout === "stack" && sortableColumns.length > 0

  const activeSort = table.getState().sorting[0]
  const activeSortCol = activeSort
    ? sortableColumns.find((col) => col.id === activeSort.id)
    : undefined

  const selectedCount = table.getFilteredSelectedRowModel().rows.length

  const hasDesktopControls =
    Boolean(toolbarLeft) ||
    Boolean(toolbarRight) ||
    enableGlobalFilter ||
    activeFilterCount > 0 ||
    columnToggle ||
    exportable

  const hasControls = hasDesktopControls || showMobileSort

  if (!header && !hasControls) {
    return null
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {header && <div className="flex items-center">{header}</div>}
      {hasControls && (
        <div
          className={cn(
            "flex flex-wrap items-center justify-between gap-2",
            !hasDesktopControls && showMobileSort && MOBILE_ONLY_CLASS[breakpoint]
          )}
        >
          <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
            {toolbarLeft}
            {enableGlobalFilter && (
              <div className="relative flex w-full items-center sm:w-auto">
                <Search className="pointer-events-none absolute left-2.5 size-4 text-muted-foreground" />
                <Input
                  type="search"
                  value={searchValue}
                  onChange={handleSearchChange}
                  placeholder={
                    globalFilterPlaceholder ?? messages.globalSearchPlaceholder
                  }
                  aria-label={messages.globalSearchAriaLabel}
                  className="h-8 w-full pl-8 pr-8 sm:w-64"
                />
                {searchValue && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    onClick={handleClearSearch}
                    aria-label={messages.clearSearchAriaLabel}
                    className="absolute right-1 text-muted-foreground hover:text-foreground"
                  >
                    <X className="size-3.5" />
                  </Button>
                )}
              </div>
            )}
            {activeFilterCount > 0 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleClearAllFilters}
                className="gap-1.5"
              >
                <FilterX className="size-3.5" />
                <span>{messages.clearFilters}</span>
                <Badge variant="secondary" className="ml-0.5 px-1.5">
                  {activeFilterCount}
                </Badge>
              </Button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {toolbarRight}
            {showMobileSort && (
              <div
                className={cn(
                  "flex items-center gap-1",
                  MOBILE_ONLY_CLASS[breakpoint]
                )}
              >
                <Select
                  value={activeSort?.id ?? "__none__"}
                  onValueChange={(val) => {
                    if (!val || val === "__none__") {
                      table.setSorting([])
                    } else {
                      table.setSorting([
                        {
                          id: val,
                          desc:
                            activeSort?.id === val ? activeSort.desc : false,
                        },
                      ])
                    }
                  }}
                >
                  <SelectTrigger
                    size="sm"
                    aria-label={messages.mobileSortLabel}
                    className="w-auto min-w-32 gap-1.5"
                  >
                    <ArrowUpDown className="size-3.5 text-muted-foreground" />
                    <SelectValue placeholder={messages.mobileSortLabel} />
                  </SelectTrigger>
                  <SelectContent align="end">
                    <SelectItem value="__none__">
                      {messages.mobileSortNone}
                    </SelectItem>
                    {sortableColumns.map((column) => (
                      <SelectItem key={column.id} value={column.id}>
                        {getColumnLabel(column)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {activeSort && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon-sm"
                    onClick={() =>
                      table.setSorting([
                        { id: activeSort.id, desc: !activeSort.desc },
                      ])
                    }
                    aria-label={`${activeSortCol ? getColumnLabel(activeSortCol) : activeSort.id}: ${activeSort.desc ? messages.descending : messages.ascending}`}
                  >
                    {activeSort.desc ? (
                      <ArrowDown className="size-3.5" />
                    ) : (
                      <ArrowUp className="size-3.5" />
                    )}
                  </Button>
                )}
              </div>
            )}

            {columnToggle && toggleableColumns.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button type="button" variant="outline" size="sm">
                      <Columns3 className="size-3.5" />
                      <span>{messages.columnsButton}</span>
                    </Button>
                  }
                />
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>
                      {messages.toggleColumnsLabel}
                    </DropdownMenuLabel>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  {toggleableColumns.map((column) => (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      checked={column.getIsVisible()}
                      onCheckedChange={(checked) =>
                        column.toggleVisibility(Boolean(checked))
                      }
                    >
                      {getColumnLabel(column)}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {exportable && (
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button type="button" variant="outline" size="sm">
                      <Download className="size-3.5" />
                      <span>{messages.exportButton}</span>
                    </Button>
                  }
                />
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuItem onClick={() => onExportCSV?.()}>
                    {messages.exportCSV}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onExportJSON?.()}>
                    {messages.exportJSON}
                  </DropdownMenuItem>
                  {selectedCount > 0 && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => onExportCSV?.({ selectionOnly: true })}
                      >
                        {messages.exportSelectedCSV(selectedCount)}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onExportJSON?.({ selectionOnly: true })}
                      >
                        {messages.exportSelectedJSON(selectedCount)}
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
