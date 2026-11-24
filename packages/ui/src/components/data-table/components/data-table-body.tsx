"use client"

import * as React from "react"
import { flexRender, type RowData } from "@tanstack/react-table"
import type { LegacyReactTable, LegacyRow } from "@tanstack/react-table/legacy"
import { cn } from "cn"
import {
  Check,
  ChevronDown,
  ChevronRight,
  GripVertical,
  Pencil,
  X,
} from "lucide-react"
import { Button } from "../../button"
import { Checkbox } from "../../checkbox"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "../../context-menu"
import { RadioGroup, RadioGroupItem } from "../../radio-group"
import { Skeleton } from "../../skeleton"
import { TableBody, TableCell, TableRow } from "../../table"
import type {
  CellEditCompleteEvent,
  ContextMenuItem as DataTableContextMenuItem,
  DataTableColumn,
  DataTableSize,
  EditMode,
  RowEditCompleteEvent,
  RowGroupMode,
  RowReorderEvent,
  SelectionMode,
  VirtualScrollerOptions,
} from "../types"
import { DEFAULT_MESSAGES_EN, type DataTableMessages } from "../utils/locale"
import {
  coerceEditedValue,
  DataTableEditableCell,
  getFieldValue,
  setNestedFieldValue,
  validateEditedValue,
  type EditingCellState,
  type EditingRowState,
} from "./data-table-editable-cell"
import { DataTableVirtualBody } from "./data-table-virtual-body"

/**
 * Props for {@link DataTableBody}.
 */
export interface DataTableBodyProps<TData extends RowData> {
  /** TanStack Table instance. */
  table: LegacyReactTable<TData>
  /** DataTable column definitions. */
  columns: DataTableColumn<TData>[]
  /** Row density size. */
  size?: DataTableSize
  /** Alternate row background colors. */
  stripedRows?: boolean
  /** Render borders around all cells. */
  showGridlines?: boolean
  /** Highlight row on hover. */
  hoverableRows?: boolean
  /** Dynamic class name per row. */
  rowClassName?: string | ((data: TData, rowIndex: number) => string)
  /** Show skeleton loading rows. */
  loading?: boolean
  /** Number of skeleton rows when loading. */
  skeletonRows?: number
  /** Custom content when no rows are available. */
  emptyMessage?: React.ReactNode
  /** Rows pinned to the top of the table body. */
  frozenValue?: TData[]
  /** Whether the table container is scrollable (enables sticky frozen top rows). */
  scrollable?: boolean
  /** Scroll container ref for virtual scrolling. */
  scrollContainerRef?: React.RefObject<HTMLDivElement | null>
  /** Scroll container DOM element (triggers re-render on mount for virtualizer). */
  scrollContainerEl?: HTMLDivElement | null
  /** Ref populated with virtualizer's `scrollToIndex` callback when virtualized. */
  virtualScrollToIndexRef?: React.RefObject<((index: number) => void) | null>
  /** Virtual scroller configuration. */
  virtualScrollerOptions?: VirtualScrollerOptions
  /** Offset added to 0-based `rowIndex + 1` for accurate 1-based `aria-rowindex` (default: 1). */
  rowIndexOffset?: number
  /** Localized UI and ARIA strings. */
  messages?: DataTableMessages
  /** Row grouping mode. */
  rowGroupMode?: RowGroupMode
  /** Column ID / field name to group rows by. */
  groupRowsBy?: string
  /** Allow collapsing/expanding row groups in subheader mode. */
  expandableRowGroups?: boolean
  /** Custom renderer for subheader group header row. */
  rowGroupHeaderTemplate?: (
    groupValue: unknown,
    rows: LegacyRow<TData>[]
  ) => React.ReactNode
  /** Custom renderer for subheader group footer row. */
  rowGroupFooterTemplate?: (
    groupValue: unknown,
    rows: LegacyRow<TData>[]
  ) => React.ReactNode
  /** Row selection mode. */
  selectionMode?: SelectionMode
  /** Require Ctrl/Cmd/Shift key for multiple row click selection. */
  metaKeySelection?: boolean
  /** Predicate to disable selection on specific rows. */
  isRowSelectable?: (data: TData, rowIndex: number) => boolean
  /** Callback fired when a row is selected (handled via `useDataTable` state diff). */
  onRowSelect?: (data: TData, rowIndex: number) => void
  /** Callback fired when a row is unselected (handled via `useDataTable` state diff). */
  onRowUnselect?: (data: TData, rowIndex: number) => void
  /** Enable row expansion. */
  expandableRows?: boolean
  /** Render function for expanded row content. */
  rowExpansionTemplate?: (data: TData, rowIndex: number) => React.ReactNode
  /** Predicate to allow/disallow expansion on specific rows. */
  allowRowExpansion?: (data: TData, rowIndex: number) => boolean
  /** Enable row drag & drop reordering. */
  reorderableRows?: boolean
  /** Callback when rows are reordered. */
  onRowReorder?: (event: RowReorderEvent<TData>) => void
  /** Inline editing mode. */
  editMode?: EditMode
  /** Callback when a cell edit is committed. */
  onCellEditComplete?: (event: CellEditCompleteEvent<TData>) => void
  /** Callback when a row edit is committed. */
  onRowEditComplete?: (event: RowEditCompleteEvent<TData>) => void
  /** Callback when a row edit is cancelled. */
  onRowEditCancel?: (data: TData, index: number) => void
  /** Context menu items shown on row right-click. */
  contextMenuItems?:
    | DataTableContextMenuItem<TData>[]
    | ((data: TData, rowIndex: number) => DataTableContextMenuItem<TData>[])
  /** Callback fired on row right-click. */
  onRowContextMenu?: (
    event: React.MouseEvent,
    data: TData,
    rowIndex: number
  ) => void
  /** Callback fired on row click. */
  onRowClick?: (
    event: React.MouseEvent,
    data: TData,
    rowIndex: number
  ) => void
  /** Callback fired on row double-click. */
  onRowDoubleClick?: (
    event: React.MouseEvent,
    data: TData,
    rowIndex: number
  ) => void
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

const CELL_FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"

function isInteractiveElement(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  return Boolean(
    target.closest(
      'button, a, input, select, textarea, [role="checkbox"], [role="radio"]'
    )
  )
}

function isEditableFormControl(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  return Boolean(
    target.closest('input, textarea, select, [contenteditable="true"]')
  )
}

function focusAndScrollIntoView(el: HTMLElement | null | undefined): void {
  if (!el) return
  el.focus()
  if (typeof el.scrollIntoView === "function") {
    el.scrollIntoView({ block: "nearest", inline: "nearest" })
  }
}

/**
 * Body for the DataTable supporting loading skeletons, empty state, frozen top rows,
 * virtualization via `DataTableVirtualBody`, subheader & rowspan row grouping,
 * single/multiple/shift-range selection, expansion, row drag-and-drop reordering,
 * validated inline cell/row editing, 2D keyboard grid navigation, context menus,
 * and pinned columns.
 */
export function DataTableBody<TData extends RowData>({
  table,
  columns,
  size = "md",
  stripedRows = false,
  showGridlines = false,
  hoverableRows = true,
  rowClassName,
  loading = false,
  skeletonRows = 5,
  emptyMessage,
  frozenValue,
  scrollable = false,
  scrollContainerRef,
  scrollContainerEl,
  virtualScrollToIndexRef,
  virtualScrollerOptions,
  rowIndexOffset = 1,
  messages = DEFAULT_MESSAGES_EN,
  rowGroupMode,
  groupRowsBy,
  expandableRowGroups = true,
  rowGroupHeaderTemplate,
  rowGroupFooterTemplate,
  selectionMode,
  metaKeySelection = false,
  isRowSelectable,
  expandableRows = false,
  rowExpansionTemplate,
  allowRowExpansion,
  reorderableRows = false,
  onRowReorder,
  editMode,
  onCellEditComplete,
  onRowEditComplete,
  onRowEditCancel,
  contextMenuItems,
  onRowContextMenu,
  onRowClick,
  onRowDoubleClick,
}: DataTableBodyProps<TData>) {
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

  const [collapsedGroups, setCollapsedGroups] = React.useState<
    Record<string, boolean>
  >({})
  const [editingCell, setEditingCell] = React.useState<EditingCellState | null>(
    null
  )
  const [editingRow, setEditingRow] = React.useState<EditingRowState | null>(
    null
  )
  const [dragRowIndex, setDragRowIndex] = React.useState<number | null>(null)
  const [focusedRowIndex, setFocusedRowIndex] = React.useState(0)

  const lastSelectedRowIndexRef = React.useRef<number | null>(null)
  const checkboxShiftKeyRef = React.useRef(false)
  const isCommittingCellRef = React.useRef(false)
  const internalVirtualScrollRef = React.useRef<
    ((index: number) => void) | null
  >(null)

  const rows = table.getRowModel().rows
  const effectiveFocusedRowIndex =
    rows.length > 0 ? Math.min(focusedRowIndex, rows.length - 1) : 0
  const visibleColumns = table.getVisibleLeafColumns()
  const hasSelectionCol =
    selectionMode === "checkbox" || selectionMode === "radiobutton"

  const totalColSpan =
    visibleColumns.length +
    (hasSelectionCol ? 1 : 0) +
    (expandableRows ? 1 : 0) +
    (reorderableRows ? 1 : 0) +
    (editMode === "row" ? 1 : 0)

  const cellPadding = SIZE_CELL_CLASSES[size]
  const gridClass = showGridlines ? "border-r last:border-r-0" : ""
  const resolvedEmptyMessage = emptyMessage ?? messages.emptyMessage

  const isVirtualized =
    Boolean(virtualScrollerOptions) &&
    virtualScrollerOptions?.enabled !== false &&
    rowGroupMode !== "subheader"

  React.useEffect(() => {
    if (!isVirtualized) {
      if (virtualScrollToIndexRef) {
        virtualScrollToIndexRef.current = null
      }
      internalVirtualScrollRef.current = null
    }
  }, [isVirtualized, virtualScrollToIndexRef])

  // Precompute rowspan map for `rowGroupMode === "rowspan"`
  const rowSpanMap = React.useMemo(() => {
    const spans = new Map<number, number>()
    if (rowGroupMode !== "rowspan" || !groupRowsBy || rows.length === 0) {
      return spans
    }

    let startIdx = 0
    let currentVal = rows[0]?.getValue(groupRowsBy)
    for (let i = 1; i <= rows.length; i++) {
      const nextVal =
        i < rows.length ? rows[i]?.getValue(groupRowsBy) : Symbol("end")
      if (!Object.is(nextVal, currentVal)) {
        spans.set(startIdx, i - startIdx)
        for (let j = startIdx + 1; j < i; j++) {
          spans.set(j, 0)
        }
        startIdx = i
        currentVal = nextVal
      }
    }
    return spans
  }, [rowGroupMode, groupRowsBy, rows])

  // Group rows for `rowGroupMode === "subheader"`
  const groupedRows = React.useMemo(() => {
    if (rowGroupMode !== "subheader" || !groupRowsBy) {
      return null
    }
    const rawGroups: Array<{
      key: string
      value: unknown
      rows: LegacyRow<TData>[]
    }> = []
    const groupIndexByKey = new Map<string, number>()

    for (const row of rows) {
      const value = row.getValue(groupRowsBy)
      const key = String(value ?? "__empty__")
      const existingIdx = groupIndexByKey.get(key)
      if (existingIdx !== undefined) {
        rawGroups[existingIdx]!.rows.push(row)
      } else {
        groupIndexByKey.set(key, rawGroups.length)
        rawGroups.push({ key, value, rows: [row] })
      }
    }

    let offset = 0
    return rawGroups.map((group) => {
      const startIndex = offset
      offset += group.rows.length
      return { ...group, startIndex }
    })
  }, [rowGroupMode, groupRowsBy, rows])

  const selectRowRange = (targetRowIndex: number): boolean => {
    const lastIdx = lastSelectedRowIndexRef.current
    if (lastIdx === null) return false
    const start = Math.min(lastIdx, targetRowIndex)
    const end = Math.max(lastIdx, targetRowIndex)

    table.setRowSelection((prev) => {
      const next = { ...prev }
      for (let idx = start; idx <= end; idx++) {
        const candidate = rows[idx]
        if (!candidate) continue
        const canSelect = isRowSelectable
          ? isRowSelectable(candidate.original, idx)
          : true
        if (canSelect) {
          next[candidate.id] = true
        }
      }
      return next
    })
    return true
  }

  const toggleRowSelection = (
    row: LegacyRow<TData>,
    rowIndex: number,
    modifiers?: { ctrlOrMeta?: boolean; shift?: boolean }
  ) => {
    if (!selectionMode) return
    const selectable = isRowSelectable
      ? isRowSelectable(row.original, rowIndex)
      : true
    if (!selectable) return

    const wasSelected = row.getIsSelected()
    const ctrlOrMeta = Boolean(modifiers?.ctrlOrMeta)
    const shift = Boolean(modifiers?.shift)

    if (
      (selectionMode === "multiple" || selectionMode === "checkbox") &&
      shift &&
      lastSelectedRowIndexRef.current !== null
    ) {
      selectRowRange(rowIndex)
      return
    }

    if (selectionMode === "single") {
      lastSelectedRowIndexRef.current = rowIndex
      if (wasSelected && (!metaKeySelection || ctrlOrMeta)) {
        table.setRowSelection({})
      } else if (!wasSelected) {
        table.setRowSelection({ [row.id]: true })
      }
      return
    }

    if (selectionMode === "radiobutton") {
      lastSelectedRowIndexRef.current = rowIndex
      if (wasSelected && ctrlOrMeta) {
        table.setRowSelection({})
      } else if (!wasSelected) {
        table.setRowSelection({ [row.id]: true })
      }
      return
    }

    if (selectionMode === "multiple") {
      if (metaKeySelection && !ctrlOrMeta && !shift) {
        lastSelectedRowIndexRef.current = rowIndex
        table.setRowSelection({ [row.id]: true })
        return
      }
    }

    lastSelectedRowIndexRef.current = rowIndex
    row.toggleSelected(!wasSelected)
  }

  const handleRowSelectionClick = (
    e: React.MouseEvent,
    row: LegacyRow<TData>,
    rowIndex: number
  ) => {
    toggleRowSelection(row, rowIndex, {
      ctrlOrMeta: e.ctrlKey || e.metaKey,
      shift: e.shiftKey,
    })
  }

  const commitCellEdit = (
    row: LegacyRow<TData>,
    rowIndex: number,
    colDef: DataTableColumn<TData> | undefined,
    columnId: string
  ): boolean => {
    if (!editingCell || isCommittingCellRef.current) return false
    isCommittingCellRef.current = true

    const field = colDef?.field ?? columnId
    const oldValue = getFieldValue(row.original, field)
    const coercedValue = coerceEditedValue(editingCell.value, oldValue, colDef)
    const validationError = validateEditedValue(
      coercedValue,
      oldValue,
      row.original,
      colDef
    )

    if (validationError) {
      isCommittingCellRef.current = false
      setEditingCell((prev) =>
        prev
          ? {
              ...prev,
              error: validationError,
            }
          : null
      )
      return false
    }

    if (!Object.is(coercedValue, oldValue)) {
      const newRowData = setNestedFieldValue(row.original, field, coercedValue)
      onCellEditComplete?.({
        rowData: row.original,
        newRowData,
        field,
        value: oldValue,
        newValue: coercedValue,
        rowIndex,
      })
    }

    setEditingCell(null)
    isCommittingCellRef.current = false
    return true
  }

  const startRowEdit = (row: LegacyRow<TData>) => {
    const draft: Record<string, unknown> = {}
    for (const col of visibleColumns) {
      const colDef = colMap.get(col.id)
      const field = colDef?.field ?? col.id
      draft[field] = getFieldValue(row.original, field)
    }
    setEditingRow({ rowId: row.id, draft })
  }

  const commitRowEdit = (row: LegacyRow<TData>, rowIndex: number): boolean => {
    if (!editingRow) return false

    const errors: Record<string, string> = {}
    let nextData = row.original

    for (const col of visibleColumns) {
      const colDef = colMap.get(col.id)
      const isColEditable =
        typeof colDef?.editable === "function"
          ? colDef.editable(row.original, rowIndex)
          : Boolean(colDef?.editable)
      if (!isColEditable) continue

      const field = colDef?.field ?? col.id
      const oldValue = getFieldValue(row.original, field)
      const rawDraft = editingRow.draft[field]
      const coercedValue = coerceEditedValue(rawDraft, oldValue, colDef)
      const validationError = validateEditedValue(
        coercedValue,
        oldValue,
        row.original,
        colDef
      )

      if (validationError) {
        errors[field] = validationError
        continue
      }

      nextData = setNestedFieldValue(nextData, field, coercedValue)
    }

    if (Object.keys(errors).length > 0) {
      setEditingRow((prev) => (prev ? { ...prev, errors } : null))
      return false
    }

    onRowEditComplete?.({
      data: row.original,
      newData: nextData,
      index: rowIndex,
    })
    setEditingRow(null)
    return true
  }

  const cancelRowEdit = (row: LegacyRow<TData>, rowIndex: number) => {
    setEditingRow(null)
    onRowEditCancel?.(row.original, rowIndex)
  }

  if (loading) {
    return (
      <TableBody>
        {Array.from({ length: skeletonRows }).map((_, rIdx) => (
          <TableRow key={`skeleton-${rIdx}`} className="hover:bg-transparent">
            {Array.from({ length: totalColSpan }).map((__, cIdx) => (
              <TableCell
                key={`skeleton-${rIdx}-${cIdx}`}
                className={cn(cellPadding, gridClass)}
              >
                <Skeleton className="h-4 w-full" />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    )
  }

  if (rows.length === 0 && (!frozenValue || frozenValue.length === 0)) {
    return (
      <TableBody>
        <TableRow className="hover:bg-transparent">
          <TableCell
            colSpan={totalColSpan}
            className="h-24 text-center text-muted-foreground"
          >
            {resolvedEmptyMessage}
          </TableCell>
        </TableRow>
      </TableBody>
    )
  }

  const renderFrozenRows = () => {
    if (!frozenValue || frozenValue.length === 0) return null
    return frozenValue.map((item, fIdx) => {
      const syntheticRow = {
        id: `frozen-${fIdx}`,
        index: fIdx,
        original: item,
        getValue: (colId: string) => {
          const cDef = colMap.get(colId)
          if (cDef?.accessorFn) {
            return cDef.accessorFn(item, fIdx)
          }
          return getFieldValue(item, cDef?.field ?? colId)
        },
        getIsSelected: () => false,
        getIsExpanded: () => false,
      } as unknown as LegacyRow<TData>

      return (
        <TableRow
          key={`frozen-${fIdx}`}
          className={cn(
            "bg-muted/60 font-medium hover:bg-muted/70",
            (scrollable || isVirtualized) && "sticky top-10 z-15"
          )}
        >
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
            const field = colDef?.field ?? column.id
            const rawValue = colDef?.accessorFn
              ? colDef.accessorFn(item, fIdx)
              : getFieldValue(item, field)
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

            const dynamicBodyClass =
              typeof colDef?.bodyClassName === "function"
                ? colDef.bodyClassName(item, fIdx)
                : colDef?.bodyClassName

            return (
              <TableCell
                key={`frozen-${fIdx}-${column.id}`}
                style={stickyStyle}
                className={cn(
                  cellPadding,
                  gridClass,
                  colDef?.align && ALIGN_CLASSES[colDef.align],
                  isPinned && "bg-muted/80",
                  colDef?.className,
                  dynamicBodyClass
                )}
              >
                {colDef?.body
                  ? colDef.body(item, {
                      row: syntheticRow,
                      data: item,
                      value: rawValue,
                      rowIndex: fIdx,
                      column: colDef,
                      table,
                    })
                  : String(rawValue ?? "")}
              </TableCell>
            )
          })}
          {editMode === "row" && (
            <TableCell className={cn("w-20", cellPadding, gridClass)} />
          )}
        </TableRow>
      )
    })
  }

  const renderDataRow = (
    row: LegacyRow<TData>,
    rowIndex: number,
    measureRef?: (node: HTMLTableRowElement | null) => void
  ) => {
    const isSelected = row.getIsSelected()
    const isExpanded = row.getIsExpanded()
    const selectable = isRowSelectable
      ? isRowSelectable(row.original, rowIndex)
      : true
    const canExpand =
      expandableRows &&
      (allowRowExpansion ? allowRowExpansion(row.original, rowIndex) : true)
    const isRowEditing = editMode === "row" && editingRow?.rowId === row.id

    const computedRowClass =
      typeof rowClassName === "function"
        ? rowClassName(row.original, rowIndex)
        : rowClassName

    let currentColIndex = 1
    const reorderColIndex = reorderableRows ? currentColIndex++ : undefined
    const expandColIndex = expandableRows ? currentColIndex++ : undefined
    const selectionColIndex = hasSelectionCol ? currentColIndex++ : undefined
    const dataColStartIndex = currentColIndex
    const rowEditColIndex =
      editMode === "row" ? dataColStartIndex + visibleColumns.length : undefined

    const rowElement = (
      <TableRow
        key={row.id}
        ref={measureRef}
        data-row-index={rowIndex}
        aria-rowindex={rowIndexOffset + rowIndex + 1}
        tabIndex={rowIndex === effectiveFocusedRowIndex ? 0 : -1}
        data-state={isSelected ? "selected" : undefined}
        aria-selected={selectionMode ? isSelected : undefined}
        onFocus={(e) => {
          if (
            e.target === e.currentTarget ||
            (e.target instanceof HTMLElement &&
              e.target.hasAttribute("data-col-index"))
          ) {
            setFocusedRowIndex(rowIndex)
          }
        }}
        onKeyDown={(e) => {
          if (isEditableFormControl(e.target)) return

          const rowNode = e.currentTarget
          const isRowTarget = e.target === rowNode
          const cellTarget =
            !isRowTarget &&
            e.target instanceof HTMLElement &&
            e.target.hasAttribute("data-col-index")
              ? e.target
              : null

          if (!isRowTarget && !cellTarget) return

          const tbody = rowNode.closest("tbody")
          const activeColIndex = cellTarget?.getAttribute("data-col-index") ?? null

          const applyFocusToRowAt = (
            targetRowEl: HTMLElement | null | undefined,
            colIdxAttr: string | null
          ): boolean => {
            if (!targetRowEl) return false
            if (colIdxAttr !== null) {
              const targetCell = Array.from(targetRowEl.children).find(
                (child): child is HTMLElement =>
                  child instanceof HTMLElement &&
                  child.getAttribute("data-col-index") === colIdxAttr
              )
              focusAndScrollIntoView(targetCell ?? targetRowEl)
            } else {
              focusAndScrollIntoView(targetRowEl)
            }
            return true
          }

          const focusRowOrCellByIndex = (
            targetIdx: number,
            colIdxAttr: string | null
          ) => {
            setFocusedRowIndex(targetIdx)
            const targetRow = tbody?.querySelector<HTMLElement>(
              `[data-row-index="${targetIdx}"]`
            )
            if (applyFocusToRowAt(targetRow, colIdxAttr)) {
              return
            }
            if (isVirtualized && internalVirtualScrollRef.current) {
              internalVirtualScrollRef.current(targetIdx)
              requestAnimationFrame(() => {
                applyFocusToRowAt(
                  tbody?.querySelector<HTMLElement>(
                    `[data-row-index="${targetIdx}"]`
                  ),
                  colIdxAttr
                )
              })
            }
          }

          if (e.altKey && (e.key === "ArrowUp" || e.key === "ArrowDown")) {
            if (reorderableRows && onRowReorder) {
              e.preventDefault()
              const targetIdx =
                e.key === "ArrowUp" ? rowIndex - 1 : rowIndex + 1
              if (targetIdx >= 0 && targetIdx < rows.length) {
                const fromDataIndex = row.index
                const toDataIndex = rows[targetIdx]!.index
                if (fromDataIndex !== toDataIndex) {
                  const nextData = [...table.options.data]
                  const [moved] = nextData.splice(fromDataIndex, 1)
                  if (moved !== undefined) {
                    nextData.splice(toDataIndex, 0, moved)
                    onRowReorder({
                      value: nextData,
                      dragIndex: fromDataIndex,
                      dropIndex: toDataIndex,
                    })
                    focusRowOrCellByIndex(targetIdx, activeColIndex)
                  }
                }
              }
            }
            return
          }

          const cellsInRow = Array.from(rowNode.children).filter(
            (child): child is HTMLElement =>
              child instanceof HTMLElement &&
              child.hasAttribute("data-col-index")
          )

          if (e.key === "ArrowRight") {
            e.preventDefault()
            if (isRowTarget) {
              focusAndScrollIntoView(cellsInRow[0])
            } else if (cellTarget) {
              const idx = cellsInRow.indexOf(cellTarget)
              if (idx !== -1 && idx + 1 < cellsInRow.length) {
                focusAndScrollIntoView(cellsInRow[idx + 1])
              }
            }
            return
          }

          if (e.key === "ArrowLeft") {
            e.preventDefault()
            if (cellTarget) {
              const idx = cellsInRow.indexOf(cellTarget)
              if (idx > 0) {
                focusAndScrollIntoView(cellsInRow[idx - 1])
              } else if (idx === 0) {
                focusAndScrollIntoView(rowNode)
              }
            }
            return
          }

          if (e.key === "ArrowDown") {
            e.preventDefault()
            focusRowOrCellByIndex(
              Math.min(rowIndex + 1, rows.length - 1),
              activeColIndex
            )
          } else if (e.key === "ArrowUp") {
            e.preventDefault()
            focusRowOrCellByIndex(Math.max(rowIndex - 1, 0), activeColIndex)
          } else if (e.key === "Home") {
            e.preventDefault()
            if (cellTarget && !e.ctrlKey && !e.metaKey) {
              focusAndScrollIntoView(cellsInRow[0])
            } else {
              focusRowOrCellByIndex(0, activeColIndex)
            }
          } else if (e.key === "End") {
            e.preventDefault()
            if (cellTarget && !e.ctrlKey && !e.metaKey) {
              focusAndScrollIntoView(cellsInRow[cellsInRow.length - 1])
            } else {
              focusRowOrCellByIndex(rows.length - 1, activeColIndex)
            }
          } else if (isRowTarget && (e.key === "Enter" || e.key === " ")) {
            if (selectionMode) {
              e.preventDefault()
              toggleRowSelection(row, rowIndex, {
                ctrlOrMeta: e.ctrlKey || e.metaKey,
                shift: e.shiftKey,
              })
            } else if (canExpand) {
              e.preventDefault()
              row.toggleExpanded()
            }
          }
        }}
        onDragOver={(e) => {
          if (!reorderableRows || dragRowIndex === null) return
          e.preventDefault()
          e.dataTransfer.dropEffect = "move"
        }}
        onDrop={(e) => {
          if (!reorderableRows || dragRowIndex === null) return
          e.preventDefault()
          const dropIndex = row.index
          if (dragRowIndex !== dropIndex) {
            const nextData = [...table.options.data]
            const [moved] = nextData.splice(dragRowIndex, 1)
            if (moved !== undefined) {
              nextData.splice(dropIndex, 0, moved)
              onRowReorder?.({
                value: nextData,
                dragIndex: dragRowIndex,
                dropIndex,
              })
            }
          }
          setDragRowIndex(null)
        }}
        onClick={(e) => {
          onRowClick?.(e, row.original, rowIndex)
          if (!isInteractiveElement(e.target)) {
            handleRowSelectionClick(e, row, rowIndex)
          }
        }}
        onDoubleClick={(e) => onRowDoubleClick?.(e, row.original, rowIndex)}
        onContextMenu={(e) => onRowContextMenu?.(e, row.original, rowIndex)}
        className={cn(
          CELL_FOCUS_RING,
          !hoverableRows && "hover:bg-transparent",
          stripedRows && rowIndex % 2 === 1 && "bg-muted/30",
          selectionMode && selectable && "cursor-pointer",
          computedRowClass
        )}
      >
        {reorderableRows && reorderColIndex !== undefined && (
          <TableCell
            tabIndex={-1}
            aria-colindex={reorderColIndex}
            data-col-index={reorderColIndex - 1}
            className={cn("w-10", CELL_FOCUS_RING, cellPadding, gridClass)}
          >
            <div
              role="img"
              draggable
              onDragStart={(e) => {
                setDragRowIndex(row.index)
                e.dataTransfer.effectAllowed = "move"
                e.dataTransfer.setData("text/plain", String(row.index))
              }}
              onDragEnd={() => setDragRowIndex(null)}
              className="inline-flex cursor-grab items-center justify-center text-muted-foreground hover:text-foreground active:cursor-grabbing"
              aria-label={messages.dragToReorderRow}
            >
              <GripVertical className="size-4" />
            </div>
          </TableCell>
        )}

        {expandableRows && expandColIndex !== undefined && (
          <TableCell
            tabIndex={-1}
            aria-colindex={expandColIndex}
            data-col-index={expandColIndex - 1}
            className={cn("w-10", CELL_FOCUS_RING, cellPadding, gridClass)}
          >
            {canExpand ? (
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={(e) => {
                  e.stopPropagation()
                  row.toggleExpanded()
                }}
                aria-label={
                  isExpanded ? messages.collapseRow : messages.expandRow
                }
                aria-expanded={isExpanded}
              >
                {isExpanded ? (
                  <ChevronDown className="size-4" />
                ) : (
                  <ChevronRight className="size-4" />
                )}
              </Button>
            ) : null}
          </TableCell>
        )}

        {selectionMode === "checkbox" && selectionColIndex !== undefined && (
          <TableCell
            tabIndex={-1}
            aria-colindex={selectionColIndex}
            data-col-index={selectionColIndex - 1}
            className={cn("w-10", CELL_FOCUS_RING, cellPadding, gridClass)}
            onClickCapture={(e) => {
              checkboxShiftKeyRef.current = e.shiftKey
            }}
            onClick={(e) => {
              checkboxShiftKeyRef.current = false
              e.stopPropagation()
            }}
          >
            <Checkbox
              checked={isSelected}
              disabled={!selectable}
              onCheckedChange={(checked, eventDetails) => {
                const nativeEvent = eventDetails?.event
                const isShift =
                  checkboxShiftKeyRef.current ||
                  Boolean(
                    nativeEvent &&
                      "shiftKey" in nativeEvent &&
                      (nativeEvent as MouseEvent | KeyboardEvent).shiftKey
                  )
                checkboxShiftKeyRef.current = false

                if (!selectable) return
                if (isShift && lastSelectedRowIndexRef.current !== null) {
                  selectRowRange(rowIndex)
                  return
                }
                lastSelectedRowIndexRef.current = rowIndex
                row.toggleSelected(Boolean(checked))
              }}
              aria-label={messages.selectRow(rowIndex + 1)}
            />
          </TableCell>
        )}

        {selectionMode === "radiobutton" && selectionColIndex !== undefined && (
          <TableCell
            tabIndex={-1}
            aria-colindex={selectionColIndex}
            data-col-index={selectionColIndex - 1}
            className={cn("w-10", CELL_FOCUS_RING, cellPadding, gridClass)}
            onClick={(e) => e.stopPropagation()}
          >
            <RadioGroup
              value={isSelected ? row.id : ""}
              onValueChange={() => {
                if (!selectable) return
                lastSelectedRowIndexRef.current = rowIndex
                table.setRowSelection({ [row.id]: true })
              }}
              className="w-auto gap-0"
            >
              <RadioGroupItem
                value={row.id}
                disabled={!selectable}
                aria-label={messages.selectRow(rowIndex + 1)}
              />
            </RadioGroup>
          </TableCell>
        )}

        {row.getVisibleCells().map((cell, cellIdx) => {
          const column = cell.column
          const colDef = colMap.get(column.id)
          const ariaColIndex = dataColStartIndex + cellIdx
          const headerLabel =
            typeof colDef?.header === "string"
              ? colDef.header
              : typeof column.columnDef.header === "string"
                ? column.columnDef.header
                : (colDef?.field ?? column.id)

          // Handle `rowGroupMode === "rowspan"` merging
          if (rowGroupMode === "rowspan" && groupRowsBy === column.id) {
            const span = rowSpanMap.get(rowIndex)
            if (span === 0) {
              return null
            }
          }

          const rowSpanAttr =
            rowGroupMode === "rowspan" && groupRowsBy === column.id
              ? rowSpanMap.get(rowIndex)
              : undefined

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

          const isColEditable =
            typeof colDef?.editable === "function"
              ? colDef.editable(row.original, rowIndex)
              : Boolean(colDef?.editable)

          const isCellEditing =
            editMode === "cell" &&
            isColEditable &&
            editingCell?.rowId === row.id &&
            editingCell?.columnId === column.id

          const field = colDef?.field ?? column.id

          const dynamicBodyClass =
            typeof colDef?.bodyClassName === "function"
              ? colDef.bodyClassName(row.original, rowIndex)
              : colDef?.bodyClassName

          let cellContent: React.ReactNode
          if (isCellEditing && editingCell) {
            cellContent = (
              <DataTableEditableCell
                mode="cell"
                autoFocus
                value={editingCell.value}
                error={editingCell.error}
                field={field}
                row={row}
                rowIndex={rowIndex}
                colDef={colDef}
                onChange={(nextVal) =>
                  setEditingCell((prev) =>
                    prev ? { ...prev, value: nextVal, error: undefined } : null
                  )
                }
                onCommit={() => commitCellEdit(row, rowIndex, colDef, column.id)}
                onCancel={() => {
                  isCommittingCellRef.current = false
                  setEditingCell(null)
                }}
              />
            )
          } else if (isRowEditing && isColEditable && editingRow) {
            const draftVal = editingRow.draft[field]
            const fieldError = editingRow.errors?.[field]
            cellContent = (
              <DataTableEditableCell
                mode="row"
                value={draftVal}
                error={fieldError}
                field={field}
                row={row}
                rowIndex={rowIndex}
                colDef={colDef}
                onChange={(nextVal) =>
                  setEditingRow((prev) => {
                    if (!prev) return null
                    const nextErrors = prev.errors
                      ? { ...prev.errors }
                      : undefined
                    if (nextErrors) {
                      delete nextErrors[field]
                    }
                    return {
                      ...prev,
                      draft: { ...prev.draft, [field]: nextVal },
                      errors:
                        nextErrors && Object.keys(nextErrors).length > 0
                          ? nextErrors
                          : undefined,
                    }
                  })
                }
                onCommit={() => commitRowEdit(row, rowIndex)}
                onCancel={() => cancelRowEdit(row, rowIndex)}
              />
            )
          } else if (colDef?.body) {
            cellContent = colDef.body(row.original, {
              row,
              data: row.original,
              value: cell.getValue(),
              rowIndex,
              column: colDef,
              table,
            })
          } else {
            cellContent = flexRender(
              column.columnDef.cell,
              cell.getContext()
            )
          }

          return (
            <TableCell
              key={cell.id}
              tabIndex={-1}
              aria-colindex={ariaColIndex}
              data-col-index={ariaColIndex - 1}
              data-label={headerLabel}
              rowSpan={rowSpanAttr && rowSpanAttr > 1 ? rowSpanAttr : undefined}
              style={stickyStyle}
              onClick={(e) => {
                if (editMode === "cell" && isColEditable && !isCellEditing) {
                  e.stopPropagation()
                  isCommittingCellRef.current = false
                  setEditingCell({
                    rowId: row.id,
                    columnId: column.id,
                    value: getFieldValue(row.original, field),
                  })
                }
              }}
              onKeyDown={(e) => {
                if (
                  e.target === e.currentTarget &&
                  editMode === "cell" &&
                  isColEditable &&
                  !isCellEditing &&
                  (e.key === "Enter" || e.key === "F2")
                ) {
                  e.preventDefault()
                  e.stopPropagation()
                  isCommittingCellRef.current = false
                  setEditingCell({
                    rowId: row.id,
                    columnId: column.id,
                    value: getFieldValue(row.original, field),
                  })
                }
              }}
              className={cn(
                CELL_FOCUS_RING,
                cellPadding,
                gridClass,
                colDef?.align && ALIGN_CLASSES[colDef.align],
                isPinned && "bg-background",
                isPinned === "start" &&
                  "shadow-[2px_0_5px_-2px_rgba(0,0,0,0.08)]",
                isPinned === "end" &&
                  "shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.08)]",
                editMode === "cell" && isColEditable && "cursor-text",
                rowSpanAttr && rowSpanAttr > 1 && "align-top",
                colDef?.className,
                dynamicBodyClass
              )}
            >
              {cellContent}
            </TableCell>
          )
        })}

        {editMode === "row" && rowEditColIndex !== undefined && (
          <TableCell
            tabIndex={-1}
            aria-colindex={rowEditColIndex}
            data-col-index={rowEditColIndex - 1}
            data-label={messages.rowActions}
            className={cn("w-20", CELL_FOCUS_RING, cellPadding, gridClass)}
            onClick={(e) => e.stopPropagation()}
          >
            {isRowEditing ? (
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => commitRowEdit(row, rowIndex)}
                  aria-label={messages.saveRow}
                  className="text-primary hover:text-primary"
                >
                  <Check className="size-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => cancelRowEdit(row, rowIndex)}
                  aria-label={messages.cancelRowEdit}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="size-3.5" />
                </Button>
              </div>
            ) : (
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={() => startRowEdit(row)}
                aria-label={messages.editRow}
              >
                <Pencil className="size-3.5" />
              </Button>
            )}
          </TableCell>
        )}
      </TableRow>
    )

    const resolvedMenuItems = contextMenuItems
      ? typeof contextMenuItems === "function"
        ? contextMenuItems(row.original, rowIndex)
        : contextMenuItems
      : null

    const wrappedRow =
      resolvedMenuItems && resolvedMenuItems.length > 0 ? (
        <ContextMenu key={row.id}>
          <ContextMenuTrigger render={rowElement} />
          <ContextMenuContent>
            {resolvedMenuItems.map((item) => {
              const isDisabled =
                typeof item.disabled === "function"
                  ? item.disabled(row.original)
                  : Boolean(item.disabled)
              return (
                <React.Fragment key={item.id}>
                  {item.separatorBefore && <ContextMenuSeparator />}
                  <ContextMenuItem
                    disabled={isDisabled}
                    variant={item.destructive ? "destructive" : "default"}
                    onClick={() => item.onSelect(row.original, rowIndex)}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </ContextMenuItem>
                </React.Fragment>
              )
            })}
          </ContextMenuContent>
        </ContextMenu>
      ) : (
        rowElement
      )

    if (isExpanded && rowExpansionTemplate) {
      return (
        <React.Fragment key={`${row.id}-fragment`}>
          {wrappedRow}
          <TableRow
            key={`${row.id}-expanded`}
            className="bg-muted/20 hover:bg-muted/20"
          >
            <TableCell
              colSpan={totalColSpan}
              className={cn(cellPadding, gridClass)}
            >
              {rowExpansionTemplate(row.original, rowIndex)}
            </TableCell>
          </TableRow>
        </React.Fragment>
      )
    }

    return wrappedRow
  }

  if (groupedRows) {
    return (
      <TableBody>
        {renderFrozenRows()}
        {groupedRows.map((group) => {
          const isCollapsed = Boolean(collapsedGroups[group.key])

          return (
            <React.Fragment key={`group-${group.key}`}>
              <TableRow className="bg-muted/50 font-medium hover:bg-muted/60">
                <TableCell
                  colSpan={totalColSpan}
                  className={cn(cellPadding, gridClass)}
                >
                  <div className="flex items-center gap-2">
                    {expandableRowGroups && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        onClick={() =>
                          setCollapsedGroups((prev) => ({
                            ...prev,
                            [group.key]: !prev[group.key],
                          }))
                        }
                        aria-label={
                          isCollapsed ? "Expand group" : "Collapse group"
                        }
                        aria-expanded={!isCollapsed}
                      >
                        {isCollapsed ? (
                          <ChevronRight className="size-4" />
                        ) : (
                          <ChevronDown className="size-4" />
                        )}
                      </Button>
                    )}
                    <div className="flex-1">
                      {rowGroupHeaderTemplate
                        ? rowGroupHeaderTemplate(group.value, group.rows)
                        : String(group.value ?? "")}
                    </div>
                  </div>
                </TableCell>
              </TableRow>

              {!isCollapsed &&
                group.rows.map((row, idx) =>
                  renderDataRow(row, group.startIndex + idx)
                )}

              {!isCollapsed && rowGroupFooterTemplate && (
                <TableRow className="bg-muted/30 font-medium hover:bg-muted/30">
                  <TableCell
                    colSpan={totalColSpan}
                    className={cn(cellPadding, gridClass)}
                  >
                    {rowGroupFooterTemplate(group.value, group.rows)}
                  </TableCell>
                </TableRow>
              )}
            </React.Fragment>
          )
        })}
      </TableBody>
    )
  }

  if (isVirtualized) {
    return (
      <DataTableVirtualBody
        rows={rows}
        totalColSpan={totalColSpan}
        scrollContainerRef={scrollContainerRef}
        scrollContainerEl={scrollContainerEl}
        virtualScrollToIndexRef={virtualScrollToIndexRef}
        internalScrollToIndexRef={internalVirtualScrollRef}
        virtualScrollerOptions={virtualScrollerOptions}
        frozenRows={renderFrozenRows()}
        renderRow={(row, rowIndex, measureRef) =>
          renderDataRow(row, rowIndex, measureRef)
        }
      />
    )
  }

  return (
    <TableBody>
      {renderFrozenRows()}
      {rows.map((row, rowIndex) => renderDataRow(row, rowIndex))}
    </TableBody>
  )
}
