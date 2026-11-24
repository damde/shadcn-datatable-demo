"use client"

import * as React from "react"
import { flexRender, type RowData } from "@tanstack/react-table"
import type { LegacyColumn, LegacyReactTable } from "@tanstack/react-table/legacy"
import { cn } from "cn"
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronDown,
  ChevronRight,
  Filter,
  X,
} from "lucide-react"
import { Button } from "../../button"
import { Checkbox } from "../../checkbox"
import { Input } from "../../input"
import { Popover, PopoverContent, PopoverTrigger } from "../../popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../select"
import { TableHead, TableHeader, TableRow } from "../../table"
import type {
  ColumnFilterType,
  ColumnFilterValue,
  ColumnGroupRow,
  DataTableColumn,
  DataTableSize,
  EditMode,
  FilterDisplay,
  FilterMatchMode,
  SelectionMode,
  SortMode,
} from "../types"
import { DEFAULT_MESSAGES_EN, type DataTableMessages } from "../utils/locale"

/**
 * Props for {@link DataTableHeader}.
 */
export interface DataTableHeaderProps<TData extends RowData> {
  /** TanStack Table instance. */
  table: LegacyReactTable<TData>
  /** DataTable column definitions for filter/sort/pinning metadata. */
  columns: DataTableColumn<TData>[]
  /** Multi-row grouped header definitions. */
  headerColumnGroup?: ColumnGroupRow[]
  /** Global sortable default. */
  sortable?: boolean
  /** Single or multiple column sorting. */
  sortMode?: SortMode
  /** Allow cycling sort back to unsorted. */
  removableSort?: boolean
  /** Where column filters are displayed. */
  filterDisplay?: FilterDisplay
  /** Row selection mode. */
  selectionMode?: SelectionMode
  /** Whether row expansion is enabled. */
  expandableRows?: boolean
  /** Whether row reordering is enabled. */
  reorderableRows?: boolean
  /** Whether columns can be resized. */
  resizableColumns?: boolean
  /** Whether columns can be reordered via drag & drop. */
  reorderableColumns?: boolean
  /** Inline edit mode (to align row-edit action column). */
  editMode?: EditMode
  /** Stick header to top of scrollable container. */
  scrollable?: boolean
  /** Render borders around all cells. */
  showGridlines?: boolean
  /** Row density size. */
  size?: DataTableSize
  /** Callback when column order changes via drag & drop. */
  onColumnOrderChange?: (order: string[]) => void
  /** Localized UI and ARIA strings. */
  messages?: DataTableMessages
}

const SIZE_HEAD_CLASSES: Record<DataTableSize, string> = {
  sm: "h-8 px-2 text-xs",
  md: "h-10 px-3 text-sm",
  lg: "h-12 px-4 text-base",
}

const ALIGN_CLASSES: Record<"left" | "center" | "right", string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
}

const DEFAULT_MATCH_MODE: Record<ColumnFilterType, FilterMatchMode> = {
  text: "contains",
  number: "equals",
  select: "equals",
  "multi-select": "in",
  date: "dateIs",
  boolean: "equals",
}

const MATCH_MODES_BY_TYPE: Record<ColumnFilterType, FilterMatchMode[]> = {
  text: [
    "contains",
    "notContains",
    "startsWith",
    "endsWith",
    "equals",
    "notEquals",
  ],
  number: ["equals", "notEquals", "gt", "gte", "lt", "lte", "between"],
  select: ["equals", "notEquals"],
  "multi-select": ["in", "notIn"],
  date: ["dateIs", "dateBefore", "dateAfter", "between"],
  boolean: ["equals"],
}

const MATCH_MODE_LABELS: Record<FilterMatchMode, string> = {
  contains: "Contains",
  notContains: "Not contains",
  startsWith: "Starts with",
  endsWith: "Ends with",
  equals: "Equals",
  notEquals: "Not equals",
  gt: "Greater than",
  gte: "Greater or equal",
  lt: "Less than",
  lte: "Less or equal",
  between: "Between",
  in: "In",
  notIn: "Not in",
  dateIs: "Date is",
  dateBefore: "Date before",
  dateAfter: "Date after",
}

/**
 * Extracts normalized `{ value, matchMode }` from a TanStack column filter value.
 */
function parseFilterValue(
  raw: unknown,
  defaultMatchMode: FilterMatchMode
): { value: unknown; matchMode: FilterMatchMode } {
  if (
    raw !== null &&
    typeof raw === "object" &&
    !Array.isArray(raw) &&
    "value" in raw
  ) {
    const typed = raw as ColumnFilterValue
    return {
      value: typed.value,
      matchMode: typed.matchMode ?? defaultMatchMode,
    }
  }
  return { value: raw, matchMode: defaultMatchMode }
}

/**
 * Checks whether a filter value is considered empty/inactive.
 */
function isEmptyFilterValue(value: unknown): boolean {
  if (value === undefined || value === null || value === "") {
    return true
  }
  if (Array.isArray(value)) {
    return (
      value.length === 0 ||
      value.every((v) => v === undefined || v === null || v === "")
    )
  }
  return false
}

interface FilterInputRendererProps<TData extends RowData> {
  column: LegacyColumn<TData, unknown>
  colDef?: DataTableColumn<TData>
  table: LegacyReactTable<TData>
  value: unknown
  matchMode: FilterMatchMode
  onChange: (value: unknown, matchMode?: FilterMatchMode) => void
  onClear: () => void
  messages: DataTableMessages
  compact?: boolean
}

/**
 * Renders the appropriate filter input control for a column's `filterType`.
 */
function FilterInputRenderer<TData extends RowData>({
  column,
  colDef,
  table,
  value,
  matchMode,
  onChange,
  onClear,
  messages,
  compact = false,
}: FilterInputRendererProps<TData>) {
  if (colDef?.filterElement) {
    return (
      <>
        {colDef.filterElement({
          value,
          matchMode,
          onChange,
          onClear,
          column: colDef,
          table,
        })}
      </>
    )
  }

  const filterType: ColumnFilterType = colDef?.filterType ?? "text"
  const placeholder = colDef?.filterPlaceholder ?? "Filter..."
  const inputHeight = compact ? "h-7 text-xs" : "h-8 text-sm"

  if (filterType === "number") {
    if (matchMode === "between") {
      const tuple = Array.isArray(value) ? value : [undefined, undefined]
      return (
        <div className="flex items-center gap-1.5">
          <Input
            type="number"
            aria-label={`Minimum ${column.id}`}
            value={tuple[0] !== undefined && tuple[0] !== null ? String(tuple[0]) : ""}
            onChange={(e) => {
              const min = e.target.value === "" ? undefined : Number(e.target.value)
              onChange([min, tuple[1]], matchMode)
            }}
            placeholder="Min"
            className={inputHeight}
          />
          <span className="text-xs text-muted-foreground">-</span>
          <Input
            type="number"
            aria-label={`Maximum ${column.id}`}
            value={tuple[1] !== undefined && tuple[1] !== null ? String(tuple[1]) : ""}
            onChange={(e) => {
              const max = e.target.value === "" ? undefined : Number(e.target.value)
              onChange([tuple[0], max], matchMode)
            }}
            placeholder="Max"
            className={inputHeight}
          />
        </div>
      )
    }

    return (
      <Input
        type="number"
        aria-label={messages.filterColumn(column.id)}
        value={value !== undefined && value !== null ? String(value) : ""}
        onChange={(e) =>
          onChange(
            e.target.value === "" ? undefined : Number(e.target.value),
            matchMode
          )
        }
        placeholder={placeholder}
        className={inputHeight}
      />
    )
  }

  if (filterType === "date") {
    if (matchMode === "between") {
      const tuple = Array.isArray(value) ? value : ["", ""]
      return (
        <div className="flex items-center gap-1.5">
          <Input
            type="date"
            aria-label={`Start date ${column.id}`}
            value={String(tuple[0] ?? "")}
            onChange={(e) =>
              onChange([e.target.value || undefined, tuple[1]], matchMode)
            }
            className={inputHeight}
          />
          <span className="text-xs text-muted-foreground">-</span>
          <Input
            type="date"
            aria-label={`End date ${column.id}`}
            value={String(tuple[1] ?? "")}
            onChange={(e) =>
              onChange([tuple[0], e.target.value || undefined], matchMode)
            }
            className={inputHeight}
          />
        </div>
      )
    }

    return (
      <Input
        type="date"
        aria-label={messages.filterColumn(column.id)}
        value={String(value ?? "")}
        onChange={(e) => onChange(e.target.value || undefined, matchMode)}
        className={inputHeight}
      />
    )
  }

  if (filterType === "select") {
    const options = colDef?.filterOptions ?? []
    const selectValue =
      value !== undefined && value !== null && value !== ""
        ? String(value)
        : "__all__"

    return (
      <Select
        value={selectValue}
        onValueChange={(next) => {
          if (!next || next === "__all__") {
            onChange(undefined, matchMode)
          } else {
            const matched = options.find((opt) => String(opt.value) === next)
            onChange(matched ? matched.value : next, matchMode)
          }
        }}
      >
        <SelectTrigger
          size={compact ? "sm" : "default"}
          aria-label={messages.filterColumn(column.id)}
          className="w-full"
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">All</SelectItem>
          {options.map((opt) => (
            <SelectItem key={String(opt.value)} value={String(opt.value)}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    )
  }

  if (filterType === "multi-select") {
    const options = colDef?.filterOptions ?? []
    const selected = Array.isArray(value) ? value : []

    if (compact) {
      return (
        <Popover>
          <PopoverTrigger
            render={
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 w-full justify-between px-2 text-xs font-normal"
              >
                <span className="truncate">
                  {selected.length > 0 ? `${selected.length} selected` : placeholder}
                </span>
              </Button>
            }
          />
          <PopoverContent align="start" className="w-52 p-2">
            <div className="flex max-h-48 flex-col gap-1.5 overflow-y-auto">
              {options.map((opt) => {
                const isChecked = selected.includes(opt.value)
                return (
                  <label
                    key={String(opt.value)}
                    className="flex cursor-pointer items-center gap-2 text-sm"
                  >
                    <Checkbox
                      checked={isChecked}
                      onCheckedChange={(checked) => {
                        const next = checked
                          ? [...selected, opt.value]
                          : selected.filter((item) => item !== opt.value)
                        onChange(next.length > 0 ? next : undefined, matchMode)
                      }}
                    />
                    <span>{opt.label}</span>
                  </label>
                )
              })}
            </div>
          </PopoverContent>
        </Popover>
      )
    }

    return (
      <div className="flex max-h-40 flex-col gap-1.5 overflow-y-auto rounded-md border border-input p-2">
        {options.map((opt) => {
          const isChecked = selected.includes(opt.value)
          return (
            <label
              key={String(opt.value)}
              className="flex cursor-pointer items-center gap-2 text-sm"
            >
              <Checkbox
                checked={isChecked}
                onCheckedChange={(checked) => {
                  const next = checked
                    ? [...selected, opt.value]
                    : selected.filter((item) => item !== opt.value)
                  onChange(next.length > 0 ? next : undefined, matchMode)
                }}
              />
              <span>{opt.label}</span>
            </label>
          )
        })}
      </div>
    )
  }

  if (filterType === "boolean") {
    const boolStr =
      value === true ? "true" : value === false ? "false" : "__all__"

    return (
      <Select
        value={boolStr}
        onValueChange={(next) => {
          if (!next || next === "__all__") {
            onChange(undefined, matchMode)
          } else {
            onChange(next === "true", matchMode)
          }
        }}
      >
        <SelectTrigger
          size={compact ? "sm" : "default"}
          aria-label={messages.filterColumn(column.id)}
          className="w-full"
        >
          <SelectValue placeholder="All" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">All</SelectItem>
          <SelectItem value="true">True</SelectItem>
          <SelectItem value="false">False</SelectItem>
        </SelectContent>
      </Select>
    )
  }

  return (
    <Input
      type="text"
      aria-label={messages.filterColumn(column.id)}
      value={String(value ?? "")}
      onChange={(e) => onChange(e.target.value || undefined, matchMode)}
      placeholder={placeholder}
      className={inputHeight}
    />
  )
}

interface ColumnFilterMenuProps<TData extends RowData> {
  column: LegacyColumn<TData, unknown>
  colDef?: DataTableColumn<TData>
  table: LegacyReactTable<TData>
  messages: DataTableMessages
}

/**
 * Popover-based column filter menu (`filterDisplay === "menu"`).
 */
function ColumnFilterMenu<TData extends RowData>({
  column,
  colDef,
  table,
  messages,
}: ColumnFilterMenuProps<TData>) {
  const filterType: ColumnFilterType = colDef?.filterType ?? "text"
  const defaultMatchMode =
    colDef?.filterMatchMode ?? DEFAULT_MATCH_MODE[filterType]
  const matchModes = colDef?.filterMatchModes ?? MATCH_MODES_BY_TYPE[filterType]

  const currentRaw = column.getFilterValue()
  const parsed = parseFilterValue(currentRaw, defaultMatchMode)
  const isActive = !isEmptyFilterValue(parsed.value)

  const [open, setOpen] = React.useState(false)
  const [draftValue, setDraftValue] = React.useState<unknown>(parsed.value)
  const [draftMatchMode, setDraftMatchMode] = React.useState<FilterMatchMode>(
    parsed.matchMode
  )

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      const latest = parseFilterValue(column.getFilterValue(), defaultMatchMode)
      setDraftValue(latest.value)
      setDraftMatchMode(latest.matchMode)
    }
    setOpen(nextOpen)
  }

  const handleApply = () => {
    if (isEmptyFilterValue(draftValue)) {
      column.setFilterValue(undefined)
    } else {
      column.setFilterValue({
        value: draftValue,
        matchMode: draftMatchMode,
      } satisfies ColumnFilterValue)
    }
    setOpen(false)
  }

  const handleClear = () => {
    setDraftValue(undefined)
    setDraftMatchMode(defaultMatchMode)
    column.setFilterValue(undefined)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            aria-label={messages.filterColumn(column.id)}
            onClick={(e) => e.stopPropagation()}
            className={cn(
              "ml-1 shrink-0",
              isActive
                ? "text-primary hover:text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Filter className="size-3.5" />
          </Button>
        }
      />
      <PopoverContent
        align="start"
        className="w-64 gap-3 p-3"
        onClick={(e) => e.stopPropagation()}
      >
        {matchModes.length > 1 && (
          <Select
            value={draftMatchMode}
            onValueChange={(val) => {
              if (val) {
                setDraftMatchMode(val as FilterMatchMode)
              }
            }}
          >
            <SelectTrigger size="sm" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {matchModes.map((mode) => (
                <SelectItem key={mode} value={mode}>
                  {MATCH_MODE_LABELS[mode]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <FilterInputRenderer
          column={column}
          colDef={colDef}
          table={table}
          value={draftValue}
          matchMode={draftMatchMode}
          messages={messages}
          onChange={(val, mode) => {
            setDraftValue(val)
            if (mode) setDraftMatchMode(mode)
          }}
          onClear={handleClear}
        />

        <div className="flex items-center justify-between gap-2 pt-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClear}
          >
            {messages.clearFilter}
          </Button>
          <Button type="button" size="sm" onClick={handleApply}>
            {messages.applyFilter}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

/**
 * Toggles sorting on a column respecting `sortMode` and `removableSort`.
 */
function toggleColumnSort<TData extends RowData>(
  column: LegacyColumn<TData, unknown>,
  sortMode: SortMode,
  removableSort: boolean
) {
  const isMulti = sortMode === "multiple"
  const sorted = column.getIsSorted()
  if (!removableSort && sorted === "desc") {
    column.toggleSorting(false, isMulti)
  } else {
    column.toggleSorting(undefined, isMulti)
  }
}

/**
 * Renders sort direction icon and optional multi-sort priority badge.
 */
function SortIndicator({
  sorted,
  sortMode,
  sortIndex,
  showBadge,
}: {
  sorted: false | "asc" | "desc"
  sortMode: SortMode
  sortIndex: number
  showBadge: boolean
}) {
  return (
    <span className="inline-flex items-center text-muted-foreground">
      {sorted === "asc" ? (
        <ArrowUp className="size-3.5 text-foreground" />
      ) : sorted === "desc" ? (
        <ArrowDown className="size-3.5 text-foreground" />
      ) : (
        <ArrowUpDown className="size-3.5" />
      )}
      {sortMode === "multiple" && sorted && showBadge && (
        <span className="ml-0.5 inline-flex size-4 items-center justify-center rounded-full bg-primary/15 text-[10px] font-semibold text-primary">
          {sortIndex + 1}
        </span>
      )}
    </span>
  )
}

/**
 * Header for the DataTable supporting multi-row `headerColumnGroup`,
 * single/multi sorting, row/menu filtering, column resizing, column drag-and-drop
 * reordering, frozen/pinned columns, and selection/expander/reorder utility headers.
 */
export function DataTableHeader<TData extends RowData>({
  table,
  columns,
  headerColumnGroup,
  sortable = false,
  sortMode = "single",
  removableSort = true,
  filterDisplay = "none",
  selectionMode,
  expandableRows = false,
  reorderableRows = false,
  resizableColumns = false,
  reorderableColumns = false,
  editMode,
  scrollable = false,
  showGridlines = false,
  size = "md",
  onColumnOrderChange,
  messages = DEFAULT_MESSAGES_EN,
}: DataTableHeaderProps<TData>) {
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

  const headPadding = SIZE_HEAD_CLASSES[size]
  const gridClass = showGridlines ? "border-r last:border-r-0" : ""
  const headerGroups = table.getHeaderGroups()
  const hasSelectionCol =
    selectionMode === "checkbox" || selectionMode === "radiobutton"
  const showSelectAll =
    selectionMode === "checkbox" || selectionMode === "multiple"

  const sortingState = table.getState().sorting

  const handleColumnDrop = (targetColumnId: string, draggedColumnId: string) => {
    if (!draggedColumnId || draggedColumnId === targetColumnId) {
      return
    }
    const currentOrder =
      table.getState().columnOrder.length > 0
        ? [...table.getState().columnOrder]
        : table.getAllLeafColumns().map((c) => c.id)

    const fromIndex = currentOrder.indexOf(draggedColumnId)
    const toIndex = currentOrder.indexOf(targetColumnId)
    if (fromIndex === -1 || toIndex === -1) {
      return
    }

    const [moved] = currentOrder.splice(fromIndex, 1)
    if (moved !== undefined) {
      currentOrder.splice(toIndex, 0, moved)
      if (onColumnOrderChange) {
        onColumnOrderChange(currentOrder)
      } else {
        table.setColumnOrder(currentOrder)
      }
    }
  }

  return (
    <TableHeader
      className={cn(scrollable && "sticky top-0 z-30 bg-background")}
    >
      {headerColumnGroup &&
        headerColumnGroup.map((groupRow, rowIdx) => (
          <TableRow key={`group-${rowIdx}`} className={groupRow.className}>
            {groupRow.cells.map((cell, cellIdx) => {
              const targetCol =
                cell.sortable && cell.field
                  ? table.getColumn(cell.field)
                  : undefined
              const sorted = targetCol?.getIsSorted() ?? false
              const sortIndex = targetCol?.getSortIndex() ?? -1
              const ariaSort: React.AriaAttributes["aria-sort"] = targetCol
                ? sorted === "asc"
                  ? "ascending"
                  : sorted === "desc"
                    ? "descending"
                    : "none"
                : undefined

              const handleGroupSort = () => {
                if (targetCol) {
                  toggleColumnSort(targetCol, sortMode, removableSort)
                }
              }

              return (
                <TableHead
                  key={cellIdx}
                  colSpan={cell.colSpan}
                  rowSpan={cell.rowSpan}
                  aria-sort={ariaSort}
                  className={cn(
                    headPadding,
                    gridClass,
                    cell.align && ALIGN_CLASSES[cell.align],
                    cell.className
                  )}
                >
                  {targetCol ? (
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={handleGroupSort}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault()
                          handleGroupSort()
                        }
                      }}
                      className="inline-flex cursor-pointer items-center gap-1.5 rounded-sm hover:text-foreground/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <span>{cell.header}</span>
                      <SortIndicator
                        sorted={sorted}
                        sortMode={sortMode}
                        sortIndex={sortIndex}
                        showBadge={sortingState.length > 1}
                      />
                    </div>
                  ) : (
                    cell.header
                  )}
                </TableHead>
              )
            })}
          </TableRow>
        ))}

      {headerGroups.map((headerGroup, groupIndex) => {
        let currentColIndex =
          groupIndex === 0
            ? 1
            : 1 +
              (reorderableRows ? 1 : 0) +
              (expandableRows ? 1 : 0) +
              (hasSelectionCol ? 1 : 0)

        return (
          <TableRow key={headerGroup.id} className="hover:bg-transparent">
            {groupIndex === 0 && reorderableRows && (
              <TableHead
                rowSpan={headerGroups.length}
                aria-colindex={currentColIndex++}
                className={cn("w-10", headPadding, gridClass)}
                aria-label={messages.rowReorderHeader}
              />
            )}

            {groupIndex === 0 && expandableRows && (
              <TableHead
                rowSpan={headerGroups.length}
                aria-colindex={currentColIndex++}
                className={cn("w-10", headPadding, gridClass)}
              >
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => table.toggleAllRowsExpanded()}
                  aria-label={
                    table.getIsAllRowsExpanded()
                      ? messages.collapseAllRows
                      : messages.expandAllRows
                  }
                >
                  {table.getIsAllRowsExpanded() ? (
                    <ChevronDown className="size-4" />
                  ) : (
                    <ChevronRight className="size-4" />
                  )}
                </Button>
              </TableHead>
            )}

            {groupIndex === 0 && hasSelectionCol && (
              <TableHead
                rowSpan={headerGroups.length}
                aria-colindex={currentColIndex++}
                className={cn("w-10", headPadding, gridClass)}
              >
                {showSelectAll ? (
                  <Checkbox
                    checked={table.getIsAllPageRowsSelected()}
                    indeterminate={
                      table.getIsSomePageRowsSelected() &&
                      !table.getIsAllPageRowsSelected()
                    }
                    onCheckedChange={(checked) =>
                      table.toggleAllPageRowsSelected(Boolean(checked))
                    }
                    aria-label={messages.selectAllRows}
                  />
                ) : (
                  <span className="sr-only">{messages.selectAllRows}</span>
                )}
              </TableHead>
            )}

            {headerGroup.headers.map((header) => {
              const ariaColIndex = currentColIndex
              currentColIndex += header.colSpan
              const column = header.column
            const colDef = colMap.get(column.id)
            const isPinned = column.getIsPinned()
            const canSort =
              !header.isPlaceholder &&
              column.getCanSort() &&
              (colDef?.sortable ?? sortable ?? true)
            const sorted = column.getIsSorted()
            const sortIndex = column.getSortIndex()
            const canFilter =
              !header.isPlaceholder &&
              column.getCanFilter() &&
              (colDef?.filterable ?? false)
            const canResize =
              !header.isPlaceholder &&
              resizableColumns &&
              (colDef?.resizable ?? true) &&
              column.getCanResize()
            const canReorder =
              !header.isPlaceholder &&
              reorderableColumns &&
              (colDef?.reorderable ?? true)

            const ariaSort: React.AriaAttributes["aria-sort"] = canSort
              ? sorted === "asc"
                ? "ascending"
                : sorted === "desc"
                  ? "descending"
                  : "none"
              : undefined

            const stickyStyle: React.CSSProperties = {
              width: header.getSize(),
              ...(isPinned === "start"
                ? {
                    position: "sticky",
                    left: `${column.getStart("start")}px`,
                    zIndex: 20,
                  }
                : {}),
              ...(isPinned === "end"
                ? {
                    position: "sticky",
                    right: `${column.getAfter("end")}px`,
                    zIndex: 20,
                  }
                : {}),
            }

            const handleSortClick = () => {
              if (!canSort) return
              toggleColumnSort(column, sortMode, removableSort)
            }

            return (
              <TableHead
                key={header.id}
                colSpan={header.colSpan}
                aria-colindex={ariaColIndex}
                style={stickyStyle}
                aria-sort={ariaSort}
                draggable={canReorder}
                onDragStart={(e) => {
                  if (!canReorder) return
                  e.dataTransfer.setData("text/plain", column.id)
                  e.dataTransfer.effectAllowed = "move"
                }}
                onDragOver={(e) => {
                  if (!canReorder) return
                  e.preventDefault()
                  e.dataTransfer.dropEffect = "move"
                }}
                onDrop={(e) => {
                  if (!canReorder) return
                  e.preventDefault()
                  const draggedId = e.dataTransfer.getData("text/plain")
                  handleColumnDrop(column.id, draggedId)
                }}
                className={cn(
                  "relative select-none",
                  headPadding,
                  gridClass,
                  colDef?.align && ALIGN_CLASSES[colDef.align],
                  isPinned && "bg-background",
                  isPinned === "start" &&
                    "shadow-[2px_0_5px_-2px_rgba(0,0,0,0.08)]",
                  isPinned === "end" &&
                    "shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.08)]",
                  canReorder && "cursor-grab active:cursor-grabbing",
                  colDef?.className,
                  colDef?.headerClassName
                )}
              >
                {header.isPlaceholder ? null : (
                  <div
                    className={cn(
                      "flex items-center gap-1",
                      colDef?.align === "right" && "justify-end",
                      colDef?.align === "center" && "justify-center"
                    )}
                  >
                    <div
                      role={canSort ? "button" : undefined}
                      tabIndex={canSort || canReorder ? 0 : undefined}
                      onClick={handleSortClick}
                      onKeyDown={(e) => {
                        if (
                          canReorder &&
                          e.altKey &&
                          (e.key === "ArrowLeft" || e.key === "ArrowRight")
                        ) {
                          e.preventDefault()
                          const currentOrder =
                            table.getState().columnOrder.length > 0
                              ? [...table.getState().columnOrder]
                              : table.getAllLeafColumns().map((c) => c.id)
                          const idx = currentOrder.indexOf(column.id)
                          if (idx === -1) return
                          const targetIdx =
                            e.key === "ArrowLeft" ? idx - 1 : idx + 1
                          if (
                            targetIdx < 0 ||
                            targetIdx >= currentOrder.length
                          ) {
                            return
                          }
                          const [moved] = currentOrder.splice(idx, 1)
                          if (moved !== undefined) {
                            currentOrder.splice(targetIdx, 0, moved)
                            if (onColumnOrderChange) {
                              onColumnOrderChange(currentOrder)
                            } else {
                              table.setColumnOrder(currentOrder)
                            }
                          }
                          return
                        }
                        if (canSort && (e.key === "Enter" || e.key === " ")) {
                          e.preventDefault()
                          handleSortClick()
                        }
                      }}
                      className={cn(
                        "inline-flex items-center gap-1.5",
                        (canSort || canReorder) &&
                          "rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        canSort && "cursor-pointer hover:text-foreground/80"
                      )}
                    >
                      <span>
                        {flexRender(
                          column.columnDef.header,
                          header.getContext()
                        )}
                      </span>
                      {canSort && (
                        <SortIndicator
                          sorted={sorted}
                          sortMode={sortMode}
                          sortIndex={sortIndex}
                          showBadge={sortingState.length > 1}
                        />
                      )}
                    </div>

                    {filterDisplay === "menu" && canFilter && (
                      <ColumnFilterMenu
                        column={column}
                        colDef={colDef}
                        table={table}
                        messages={messages}
                      />
                    )}
                  </div>
                )}

                {canResize && (
                  <div
                    role="separator"
                    tabIndex={0}
                    aria-orientation="vertical"
                    aria-label={messages.resizeColumn(column.id)}
                    aria-valuenow={Math.round(header.getSize())}
                    aria-valuemin={colDef?.minWidth ?? 40}
                    aria-valuemax={colDef?.maxWidth ?? 1000}
                    onMouseDown={(e) => {
                      e.stopPropagation()
                      header.getResizeHandler()(e)
                    }}
                    onTouchStart={(e) => {
                      e.stopPropagation()
                      header.getResizeHandler()(e)
                    }}
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => {
                      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
                        e.preventDefault()
                        e.stopPropagation()
                        const step = e.shiftKey ? 25 : 10
                        const delta = e.key === "ArrowRight" ? step : -step
                        const minWidth = colDef?.minWidth ?? 40
                        const maxWidth = colDef?.maxWidth ?? 1000
                        table.setColumnSizing((old) => {
                          const currentSize =
                            old[column.id] ?? header.getSize()
                          const nextSize = Math.min(
                            maxWidth,
                            Math.max(minWidth, Math.round(currentSize + delta))
                          )
                          return {
                            ...old,
                            [column.id]: nextSize,
                          }
                        })
                      }
                    }}
                    className="group/resizer absolute top-0 -right-3 z-10 flex h-full w-6 cursor-col-resize touch-none items-center justify-center select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span
                      aria-hidden="true"
                      className={cn(
                        "h-full w-0.5 transition-colors hover:bg-primary/60 group-hover/resizer:bg-primary/60",
                        column.getIsResizing() && "bg-primary"
                      )}
                    />
                  </div>
                )}
              </TableHead>
            )
          })}

          {groupIndex === 0 && editMode === "row" && (
            <TableHead
              rowSpan={headerGroups.length}
              aria-colindex={currentColIndex++}
              className={cn("w-20", headPadding, gridClass)}
            >
              <span className="sr-only">{messages.rowActions}</span>
            </TableHead>
          )}
        </TableRow>
        )
      })}

      {filterDisplay === "row" && (() => {
        let filterColIndex = 1
        return (
        <TableRow className="hover:bg-transparent">
          {reorderableRows && (
            <TableHead
              aria-colindex={filterColIndex++}
              className={cn("w-10", headPadding, gridClass)}
            />
          )}
          {expandableRows && (
            <TableHead
              aria-colindex={filterColIndex++}
              className={cn("w-10", headPadding, gridClass)}
            />
          )}
          {hasSelectionCol && (
            <TableHead
              aria-colindex={filterColIndex++}
              className={cn("w-10", headPadding, gridClass)}
            />
          )}

          {table.getVisibleLeafColumns().map((column) => {
            const ariaColIndex = filterColIndex++
            const colDef = colMap.get(column.id)
            const canFilter = column.getCanFilter() && (colDef?.filterable ?? false)
            const filterType: ColumnFilterType = colDef?.filterType ?? "text"
            const defaultMatchMode =
              colDef?.filterMatchMode ?? DEFAULT_MATCH_MODE[filterType]
            const parsed = parseFilterValue(
              column.getFilterValue(),
              defaultMatchMode
            )
            const isActive = !isEmptyFilterValue(parsed.value)
            const isPinned = column.getIsPinned()

            const stickyStyle: React.CSSProperties = {
              ...(isPinned === "start"
                ? {
                    position: "sticky",
                    left: `${column.getStart("start")}px`,
                    zIndex: 20,
                  }
                : {}),
              ...(isPinned === "end"
                ? {
                    position: "sticky",
                    right: `${column.getAfter("end")}px`,
                    zIndex: 20,
                  }
                : {}),
            }

            return (
              <TableHead
                key={`filter-${column.id}`}
                aria-colindex={ariaColIndex}
                style={stickyStyle}
                className={cn(
                  "py-1.5",
                  headPadding,
                  gridClass,
                  isPinned && "bg-background",
                  isPinned === "start" &&
                    "shadow-[2px_0_5px_-2px_rgba(0,0,0,0.08)]",
                  isPinned === "end" &&
                    "shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.08)]"
                )}
              >
                {canFilter ? (
                  <div className="flex items-center gap-1">
                    <div className="min-w-0 flex-1">
                      <FilterInputRenderer
                        column={column}
                        colDef={colDef}
                        table={table}
                        value={parsed.value}
                        matchMode={parsed.matchMode}
                        messages={messages}
                        compact
                        onChange={(val, mode) => {
                          if (isEmptyFilterValue(val)) {
                            column.setFilterValue(undefined)
                          } else {
                            column.setFilterValue({
                              value: val,
                              matchMode: mode ?? parsed.matchMode,
                            } satisfies ColumnFilterValue)
                          }
                        }}
                        onClear={() => column.setFilterValue(undefined)}
                      />
                    </div>
                    {isActive && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => column.setFilterValue(undefined)}
                        aria-label={messages.clearColumnFilter(column.id)}
                        className="shrink-0 text-muted-foreground hover:text-foreground"
                      >
                        <X className="size-3" />
                      </Button>
                    )}
                  </div>
                ) : null}
              </TableHead>
            )
          })}

          {editMode === "row" && (
            <TableHead
              aria-colindex={filterColIndex++}
              className={cn("w-20", headPadding, gridClass)}
            />
          )}
        </TableRow>
        )
      })()}
    </TableHeader>
  )
}
