import * as React from "react"
import type {
  ColumnFiltersState,
  ColumnOrderState,
  ColumnPinningState,
  ColumnSizingState,
  ColumnVisibilityState,
  ExpandedState,
  GroupingState,
  PaginationState,
  RowSelectionState,
  SortingState,
  Updater,
} from "@tanstack/react-table"
import {
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getGroupedRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useLegacyTable,
  type LegacyColumn,
  type LegacyColumnDef,
  type LegacyReactTable,
} from "@tanstack/react-table/legacy"
import type {
  DataTableColumn,
  DataTableProps,
  DataTableRef,
  DataTableState,
  StateStorageType,
} from "../types"
import {
  createColumnFilterFn,
  DEFAULT_MATCH_MODE_BY_TYPE,
  globalContainsFilterFn,
} from "../utils/filters"
import { exportToCSV, exportToJSON } from "../utils/export"

function resolveUpdater<T>(updater: Updater<T>, previous: T): T {
  return typeof updater === "function"
    ? (updater as (old: T) => T)(previous)
    : updater
}

function getStorage(type?: StateStorageType): Storage | null {
  if (typeof window === "undefined" || !type) return null
  try {
    return type === "local" ? window.localStorage : window.sessionStorage
  } catch {
    return null
  }
}

function loadPersistedState(
  storageType?: StateStorageType,
  storageKey?: string
): Partial<DataTableState> | null {
  if (!storageType || !storageKey) return null
  const storage = getStorage(storageType)
  if (!storage) return null
  try {
    const raw = storage.getItem(storageKey)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed === "object" && parsed !== null) {
      return parsed as Partial<DataTableState>
    }
    return null
  } catch {
    return null
  }
}

function savePersistedState(
  state: DataTableState,
  storageType?: StateStorageType,
  storageKey?: string
): void {
  if (!storageType || !storageKey) return
  const storage = getStorage(storageType)
  if (!storage) return
  try {
    storage.setItem(storageKey, JSON.stringify(state))
  } catch {
    // Ignore quota / private browsing errors
  }
}

function deriveInitialVisibility<TData extends Record<string, unknown> | object>(
  columns: DataTableColumn<TData>[]
): ColumnVisibilityState {
  const visibility: ColumnVisibilityState = {}
  for (const col of columns) {
    const id = col.id ?? col.field
    if (id && col.hidden) {
      visibility[id] = false
    }
  }
  return visibility
}

function deriveInitialPinning<TData extends Record<string, unknown> | object>(
  columns: DataTableColumn<TData>[]
): ColumnPinningState {
  const start: string[] = []
  const end: string[] = []
  for (const col of columns) {
    const id = col.id ?? col.field
    if (id && col.frozen) {
      if (col.alignFrozen === "right") {
        end.push(id)
      } else {
        start.push(id)
      }
    }
  }
  return { start, end }
}

function getRowIdFromDataKey<
  TData extends Record<string, unknown> | object,
>(
  row: TData,
  index: number,
  dataKey?: DataTableProps<TData>["dataKey"]
): string {
  if (typeof dataKey === "function") {
    return dataKey(row, index)
  }
  if (typeof dataKey === "string") {
    const val = (row as Record<string, unknown>)[dataKey]
    if (val !== undefined && val !== null) return String(val)
  }
  return String(index)
}

function deriveRowSelectionFromSelection<
  TData extends Record<string, unknown> | object,
>(
  data: TData[],
  selection: TData | TData[] | null | undefined,
  dataKey?: DataTableProps<TData>["dataKey"],
  rowByIdMap?: Map<string, { row: TData; index: number }>
): RowSelectionState {
  if (!selection) return {}
  const selectedItems = Array.isArray(selection) ? selection : [selection]
  if (selectedItems.length === 0) return {}

  if (dataKey && rowByIdMap) {
    const next: RowSelectionState = {}
    selectedItems.forEach((item, idx) => {
      const id = getRowIdFromDataKey(item, idx, dataKey)
      if (rowByIdMap.has(id)) {
        next[id] = true
      }
    })
    return next
  }

  const next: RowSelectionState = {}
  data.forEach((row, index) => {
    const rowId = getRowIdFromDataKey(row, index, dataKey)
    if (selectedItems.includes(row)) {
      next[rowId] = true
    }
  })
  return next
}

/**
 * Setters exposed by `useDataTable` for programmatic state updates.
 */
export interface UseDataTableSetters {
  setSorting: (updater: Updater<SortingState>) => void
  setColumnFilters: (updater: Updater<ColumnFiltersState>) => void
  setGlobalFilter: (updater: Updater<string>) => void
  setPagination: (updater: Updater<PaginationState>) => void
  setColumnVisibility: (updater: Updater<ColumnVisibilityState>) => void
  setColumnOrder: (updater: Updater<ColumnOrderState>) => void
  setColumnSizing: (updater: Updater<ColumnSizingState>) => void
  setColumnPinning: (updater: Updater<ColumnPinningState>) => void
  setRowSelection: (updater: Updater<RowSelectionState>) => void
  setExpanded: (updater: Updater<ExpandedState>) => void
  setGrouping: (updater: Updater<GroupingState>) => void
}

/**
 * Return value of `useDataTable`.
 */
export interface UseDataTableResult<
  TData extends Record<string, unknown> | object,
> {
  table: LegacyReactTable<TData>
  state: DataTableState
  setters: UseDataTableSetters
  actions: DataTableRef<TData>
  flatColumns: LegacyColumn<TData, unknown>[]
  hasFooter: boolean
  hasToolbar: boolean
  activeFilterCount: number
}

/**
 * Headless state, column-mapping, persistence, lazy-loading, and imperative actions hook
 * powering `DataTable` on top of `@tanstack/react-table`.
 */
export function useDataTable<
  TData extends Record<string, unknown> | object,
>(
  props: DataTableProps<TData>,
  scrollContainerRef?: React.RefObject<HTMLDivElement | null>,
  virtualScrollToIndexRef?: React.RefObject<((index: number) => void) | null>
): UseDataTableResult<TData> {
  const [persisted] = React.useState<Partial<DataTableState> | null>(() =>
    loadPersistedState(props.stateStorage, props.stateKey)
  )

  const initialPagination: PaginationState = {
    pageIndex: props.pageIndex ?? persisted?.pagination?.pageIndex ?? 0,
    pageSize: props.rows ?? persisted?.pagination?.pageSize ?? 10,
  }

  const [internalSorting, setInternalSorting] = React.useState<SortingState>(
    () => persisted?.sorting ?? []
  )
  const [internalColumnFilters, setInternalColumnFilters] =
    React.useState<ColumnFiltersState>(() => persisted?.columnFilters ?? [])
  const [internalGlobalFilter, setInternalGlobalFilter] =
    React.useState<string>(() => persisted?.globalFilter ?? "")
  const [internalPagination, setInternalPagination] =
    React.useState<PaginationState>(initialPagination)
  const [internalColumnVisibility, setInternalColumnVisibility] =
    React.useState<ColumnVisibilityState>(
      () =>
        persisted?.columnVisibility ?? deriveInitialVisibility(props.columns)
    )
  const [internalColumnOrder, setInternalColumnOrder] =
    React.useState<ColumnOrderState>(() => persisted?.columnOrder ?? [])
  const [internalColumnSizing, setInternalColumnSizing] =
    React.useState<ColumnSizingState>(() => persisted?.columnSizing ?? {})
  const [internalColumnPinning, setInternalColumnPinning] =
    React.useState<ColumnPinningState>(
      () => persisted?.columnPinning ?? deriveInitialPinning(props.columns)
    )
  const [internalRowSelection, setInternalRowSelection] =
    React.useState<RowSelectionState>(() => persisted?.rowSelection ?? {})
  const [internalExpanded, setInternalExpanded] = React.useState<ExpandedState>(
    () => persisted?.expanded ?? {}
  )
  const useTanStackGrouping = Boolean(props.groupRowsBy && !props.rowGroupMode)
  const [internalGrouping, setInternalGrouping] = React.useState<GroupingState>(
    () =>
      useTanStackGrouping && props.groupRowsBy
        ? [props.groupRowsBy]
        : (persisted?.grouping ?? [])
  )

  const [prevGroupKey, setPrevGroupKey] = React.useState(
    useTanStackGrouping ? props.groupRowsBy : undefined
  )
  const nextGroupKey = useTanStackGrouping ? props.groupRowsBy : undefined
  if (nextGroupKey !== prevGroupKey) {
    setPrevGroupKey(nextGroupKey)
    setInternalGrouping(nextGroupKey ? [nextGroupKey] : [])
  }

  const [prevRowsProp, setPrevRowsProp] = React.useState(props.rows)
  const [prevPageIndexProp, setPrevPageIndexProp] = React.useState(
    props.pageIndex
  )
  if (props.rows !== prevRowsProp || props.pageIndex !== prevPageIndexProp) {
    setPrevRowsProp(props.rows)
    setPrevPageIndexProp(props.pageIndex)
    if (props.pagination === undefined) {
      setInternalPagination((prev) => ({
        pageIndex: props.pageIndex ?? prev.pageIndex,
        pageSize: props.rows ?? prev.pageSize,
      }))
    }
  }

  const sorting = props.sorting ?? internalSorting
  const columnFilters = props.columnFilters ?? internalColumnFilters
  const globalFilter = props.globalFilter ?? internalGlobalFilter
  const pagination = props.pagination ?? internalPagination
  const columnVisibility = props.columnVisibility ?? internalColumnVisibility
  const columnOrder = props.columnOrder ?? internalColumnOrder
  const columnSizing = props.columnSizing ?? internalColumnSizing
  const columnPinning = props.columnPinning ?? internalColumnPinning
  const expanded = props.expandedRows ?? internalExpanded
  const grouping = internalGrouping

  const rowByIdMap = React.useMemo(() => {
    const map = new Map<string, { row: TData; index: number }>()
    props.data.forEach((row, index) => {
      map.set(getRowIdFromDataKey(row, index, props.dataKey), { row, index })
    })
    return map
  }, [props.data, props.dataKey])

  const rowSelection = React.useMemo<RowSelectionState>(() => {
    if (props.rowSelection !== undefined) return props.rowSelection
    if (props.selection !== undefined) {
      return deriveRowSelectionFromSelection(
        props.data,
        props.selection,
        props.dataKey,
        rowByIdMap
      )
    }
    return internalRowSelection
  }, [
    props.rowSelection,
    props.selection,
    props.data,
    props.dataKey,
    rowByIdMap,
    internalRowSelection,
  ])

  const latestPropsRef = React.useRef(props)
  const rowByIdMapRef = React.useRef(rowByIdMap)
  const latestStateRef = React.useRef({
    sorting,
    columnFilters,
    globalFilter,
    pagination,
    columnVisibility,
    columnOrder,
    columnSizing,
    columnPinning,
    rowSelection,
    expanded,
  })

  React.useLayoutEffect(() => {
    latestPropsRef.current = props
    rowByIdMapRef.current = rowByIdMap
    latestStateRef.current = {
      sorting,
      columnFilters,
      globalFilter,
      pagination,
      columnVisibility,
      columnOrder,
      columnSizing,
      columnPinning,
      rowSelection,
      expanded,
    }
  })

  const setSorting = React.useCallback((updater: Updater<SortingState>) => {
    const currentProps = latestPropsRef.current
    const prev = currentProps.sorting ?? latestStateRef.current.sorting
    const next = resolveUpdater(updater, prev)
    if (currentProps.sorting === undefined) {
      latestStateRef.current.sorting = next
      setInternalSorting(next)
    }
    currentProps.onSortingChange?.(next)
  }, [])

  const setColumnFilters = React.useCallback(
    (updater: Updater<ColumnFiltersState>) => {
      const currentProps = latestPropsRef.current
      const prev =
        currentProps.columnFilters ?? latestStateRef.current.columnFilters
      const next = resolveUpdater(updater, prev)
      if (currentProps.columnFilters === undefined) {
        latestStateRef.current.columnFilters = next
        setInternalColumnFilters(next)
      }
      currentProps.onColumnFiltersChange?.(next)
    },
    []
  )

  const setGlobalFilter = React.useCallback((updater: Updater<string>) => {
    const currentProps = latestPropsRef.current
    const prev =
      currentProps.globalFilter ?? latestStateRef.current.globalFilter
    const next = resolveUpdater(updater, prev)
    if (currentProps.globalFilter === undefined) {
      latestStateRef.current.globalFilter = next
      setInternalGlobalFilter(next)
    }
    currentProps.onGlobalFilterChange?.(next)
  }, [])

  const setPagination = React.useCallback(
    (updater: Updater<PaginationState>) => {
      const currentProps = latestPropsRef.current
      const prev =
        currentProps.pagination ?? latestStateRef.current.pagination
      const next = resolveUpdater(updater, prev)
      if (currentProps.pagination === undefined) {
        latestStateRef.current.pagination = next
        setInternalPagination(next)
      }
      currentProps.onPaginationChange?.(next)
    },
    []
  )

  const setColumnVisibility = React.useCallback(
    (updater: Updater<ColumnVisibilityState>) => {
      const currentProps = latestPropsRef.current
      const prev =
        currentProps.columnVisibility ??
        latestStateRef.current.columnVisibility
      const next = resolveUpdater(updater, prev)
      if (currentProps.columnVisibility === undefined) {
        latestStateRef.current.columnVisibility = next
        setInternalColumnVisibility(next)
      }
      currentProps.onColumnVisibilityChange?.(next)
    },
    []
  )

  const setColumnOrder = React.useCallback(
    (updater: Updater<ColumnOrderState>) => {
      const currentProps = latestPropsRef.current
      const prev =
        currentProps.columnOrder ?? latestStateRef.current.columnOrder
      const next = resolveUpdater(updater, prev)
      if (currentProps.columnOrder === undefined) {
        latestStateRef.current.columnOrder = next
        setInternalColumnOrder(next)
      }
      currentProps.onColumnOrderChange?.(next)
    },
    []
  )

  const setColumnSizing = React.useCallback(
    (updater: Updater<ColumnSizingState>) => {
      const currentProps = latestPropsRef.current
      const prev =
        currentProps.columnSizing ?? latestStateRef.current.columnSizing
      const next = resolveUpdater(updater, prev)
      if (currentProps.columnSizing === undefined) {
        latestStateRef.current.columnSizing = next
        setInternalColumnSizing(next)
      }
      currentProps.onColumnSizingChange?.(next)
    },
    []
  )

  const setColumnPinning = React.useCallback(
    (updater: Updater<ColumnPinningState>) => {
      const currentProps = latestPropsRef.current
      const prev =
        currentProps.columnPinning ?? latestStateRef.current.columnPinning
      const next = resolveUpdater(updater, prev)
      if (currentProps.columnPinning === undefined) {
        latestStateRef.current.columnPinning = next
        setInternalColumnPinning(next)
      }
      currentProps.onColumnPinningChange?.(next)
    },
    []
  )

  const setRowSelection = React.useCallback(
    (updater: Updater<RowSelectionState>) => {
      const currentProps = latestPropsRef.current
      const prev = latestStateRef.current.rowSelection
      const next = resolveUpdater(updater, prev)
      if (
        currentProps.rowSelection === undefined &&
        currentProps.selection === undefined
      ) {
        latestStateRef.current.rowSelection = next
        setInternalRowSelection(next)
      }
      currentProps.onRowSelectionChange?.(next)

      if (
        currentProps.onSelectionChange ||
        currentProps.onRowSelect ||
        currentProps.onRowUnselect
      ) {
        const map = rowByIdMapRef.current
        const candidateIds = new Set<string>([
          ...Object.keys(prev),
          ...Object.keys(next),
        ])
        const selectedEntries: Array<{ row: TData; index: number }> = []

        for (const id of candidateIds) {
          const entry = map.get(id)
          if (!entry) continue
          const wasSelected = Boolean(prev[id])
          const isNowSelected = Boolean(next[id])
          if (isNowSelected) {
            selectedEntries.push(entry)
          }
          if (!wasSelected && isNowSelected) {
            currentProps.onRowSelect?.(entry.row, entry.index)
          } else if (wasSelected && !isNowSelected) {
            currentProps.onRowUnselect?.(entry.row, entry.index)
          }
        }

        if (currentProps.onSelectionChange) {
          if (selectedEntries.length > 1) {
            selectedEntries.sort((a, b) => a.index - b.index)
          }
          const selectedRows = selectedEntries.map((entry) => entry.row)
          const isSingleSelection =
            currentProps.selectionMode === "single" ||
            currentProps.selectionMode === "radiobutton"
          currentProps.onSelectionChange(
            isSingleSelection ? (selectedRows[0] ?? null) : selectedRows
          )
        }
      }
    },
    []
  )

  const setExpanded = React.useCallback((updater: Updater<ExpandedState>) => {
    const currentProps = latestPropsRef.current
    const prev = currentProps.expandedRows ?? latestStateRef.current.expanded
    const next = resolveUpdater(updater, prev)
    if (currentProps.expandedRows === undefined) {
      latestStateRef.current.expanded = next
      setInternalExpanded(next)
    }
    currentProps.onRowToggle?.(next)
  }, [])

  const setGrouping = React.useCallback((updater: Updater<GroupingState>) => {
    setInternalGrouping((prev) => resolveUpdater(updater, prev))
  }, [])

  const mappedColumns = React.useMemo<LegacyColumnDef<TData>[]>(() => {
    return props.columns.map((col) => {
      const id = col.id ?? col.field
      const defaultMatchMode =
        col.filterMatchMode ??
        (col.filterType
          ? DEFAULT_MATCH_MODE_BY_TYPE[col.filterType]
          : "contains")

      const baseDef = {
        id,
        header:
          typeof col.header === "function"
            ? (ctx: { table: unknown; column: { id: string } }) =>
                (
                  col.header as (p: {
                    table: unknown
                    columnId: string
                  }) => React.ReactNode
                )({
                  table: ctx.table,
                  columnId: ctx.column.id,
                })
            : typeof col.header === "string" || col.header === undefined
              ? col.header
              : () => col.header,
        ...(col.body
          ? {
              cell: (ctx: {
                row: { original: TData; index: number }
                getValue: () => unknown
                table: unknown
              }) =>
                col.body!(ctx.row.original, {
                  row: ctx.row as never,
                  data: ctx.row.original,
                  value: ctx.getValue(),
                  rowIndex: ctx.row.index,
                  column: col,
                  table: ctx.table as never,
                }),
            }
          : {}),
        footer:
          typeof col.footer === "function"
            ? (ctx: {
                table: { getFilteredRowModel: () => { rows: unknown[] } }
                column: { id: string }
              }) =>
                (
                  col.footer as (p: {
                    rows: unknown[]
                    columnId: string
                    table: unknown
                  }) => React.ReactNode
                )({
                  rows: ctx.table.getFilteredRowModel().rows,
                  columnId: ctx.column.id,
                  table: ctx.table,
                })
            : typeof col.footer === "string" || col.footer === undefined
              ? col.footer
              : () => col.footer,
        enableSorting: col.sortable ?? props.sortable ?? false,
        sortFn: col.sortingFn as LegacyColumnDef<TData>["sortFn"],
        enableColumnFilter: col.filterable ?? false,
        filterFn: createColumnFilterFn<TData>(defaultMatchMode),
        enableResizing: col.resizable ?? props.resizableColumns ?? false,
        size: typeof col.width === "number" ? col.width : undefined,
        minSize: col.minWidth,
        maxSize: col.maxWidth,
        meta: {
          ...(col.meta ?? {}),
          columnDef: col,
        },
      }

      if (col.accessorFn) {
        return {
          ...baseDef,
          accessorFn: col.accessorFn,
        } as LegacyColumnDef<TData>
      }
      if (col.field) {
        return {
          ...baseDef,
          accessorKey: col.field,
        } as LegacyColumnDef<TData>
      }
      return baseDef as LegacyColumnDef<TData>
    })
  }, [props.columns, props.sortable, props.resizableColumns])

  const table = useLegacyTable<TData>({
    data: props.data,
    columns: mappedColumns,
    getRowId: (row, index) => getRowIdFromDataKey(row, index, props.dataKey),
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: props.lazy ? undefined : getFilteredRowModel(),
    getSortedRowModel: props.lazy ? undefined : getSortedRowModel(),
    getPaginationRowModel:
      props.paginator && !props.lazy ? getPaginationRowModel() : undefined,
    getExpandedRowModel:
      props.expandableRows || useTanStackGrouping
        ? getExpandedRowModel()
        : undefined,
    getGroupedRowModel: useTanStackGrouping ? getGroupedRowModel() : undefined,
    manualSorting: props.lazy,
    manualFiltering: props.lazy,
    manualPagination: props.lazy,
    rowCount: props.lazy ? props.totalRecords : undefined,
    enableMultiSort: props.sortMode === "multiple",
    enableSortingRemoval: props.removableSort ?? true,
    enableColumnResizing: props.resizableColumns ?? false,
    columnResizeMode: "onChange",
    enableRowSelection: props.isRowSelectable
      ? (row) => props.isRowSelectable!(row.original, row.index)
      : Boolean(props.selectionMode),
    enableMultiRowSelection:
      props.selectionMode === "multiple" || props.selectionMode === "checkbox",
    getRowCanExpand: props.allowRowExpansion
      ? (row) => props.allowRowExpansion!(row.original, row.index)
      : () => Boolean(props.expandableRows),
    globalFilterFn: globalContainsFilterFn<TData>(),
    state: {
      sorting,
      columnFilters,
      globalFilter,
      pagination,
      columnVisibility,
      columnOrder,
      columnSizing,
      columnPinning,
      rowSelection,
      expanded,
      grouping,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnOrderChange: setColumnOrder,
    onColumnSizingChange: setColumnSizing,
    onColumnPinningChange: setColumnPinning,
    onRowSelectionChange: setRowSelection,
    onExpandedChange: setExpanded,
    onGroupingChange: setGrouping,
  })

  const state = React.useMemo<DataTableState>(
    () => ({
      sorting,
      columnFilters,
      globalFilter,
      pagination,
      columnVisibility,
      columnOrder,
      columnSizing,
      columnPinning,
      rowSelection,
      expanded,
      grouping,
    }),
    [
      sorting,
      columnFilters,
      globalFilter,
      pagination,
      columnVisibility,
      columnOrder,
      columnSizing,
      columnPinning,
      rowSelection,
      expanded,
      grouping,
    ]
  )

  // Persist state & notify `onStateChange`
  const didMountPersistRef = React.useRef(false)
  React.useEffect(() => {
    if (!didMountPersistRef.current) {
      didMountPersistRef.current = true
      return
    }
    const currentProps = latestPropsRef.current
    savePersistedState(state, currentProps.stateStorage, currentProps.stateKey)
    currentProps.onStateChange?.(state)
  }, [state, props.stateStorage, props.stateKey])

  // Fire `onLazyLoad` when lazy mode is enabled and query state changes
  React.useEffect(() => {
    if (!props.lazy) return
    latestPropsRef.current.onLazyLoad?.({
      first: pagination.pageIndex * pagination.pageSize,
      rows: pagination.pageSize,
      page: pagination.pageIndex,
      sorting,
      columnFilters,
      globalFilter,
    })
  }, [props.lazy, sorting, columnFilters, globalFilter, pagination])

  const setters = React.useMemo<UseDataTableSetters>(
    () => ({
      setSorting,
      setColumnFilters,
      setGlobalFilter,
      setPagination,
      setColumnVisibility,
      setColumnOrder,
      setColumnSizing,
      setColumnPinning,
      setRowSelection,
      setExpanded,
      setGrouping,
    }),
    [
      setSorting,
      setColumnFilters,
      setGlobalFilter,
      setPagination,
      setColumnVisibility,
      setColumnOrder,
      setColumnSizing,
      setColumnPinning,
      setRowSelection,
      setExpanded,
      setGrouping,
    ]
  )

  const actions = React.useMemo<DataTableRef<TData>>(
    () => ({
      exportCSV: (options) => {
        const currentProps = latestPropsRef.current
        const rows = options?.selectionOnly
          ? table.getSelectedRowModel().rows
          : table.getFilteredRowModel().rows
        return exportToCSV(rows, currentProps.columns, {
          filename: options?.filename ?? currentProps.exportFilename,
        })
      },
      exportJSON: (options) => {
        const currentProps = latestPropsRef.current
        const rows = options?.selectionOnly
          ? table.getSelectedRowModel().rows
          : table.getFilteredRowModel().rows
        return exportToJSON(rows, currentProps.columns, {
          filename: options?.filename ?? currentProps.exportFilename,
        })
      },
      reset: () => {
        const currentProps = latestPropsRef.current
        setSorting([])
        setColumnFilters([])
        setGlobalFilter("")
        setPagination({
          pageIndex: currentProps.pageIndex ?? 0,
          pageSize: currentProps.rows ?? 10,
        })
        setRowSelection({})
        setExpanded({})
      },
      clearFilters: () => {
        setColumnFilters([])
        setGlobalFilter("")
      },
      clearSorting: () => {
        setSorting([])
      },
      clearSelection: () => {
        setRowSelection({})
      },
      expandAll: () => {
        table.toggleAllRowsExpanded(true)
      },
      collapseAll: () => {
        table.toggleAllRowsExpanded(false)
      },
      scrollToIndex: (index: number) => {
        if (virtualScrollToIndexRef?.current) {
          virtualScrollToIndexRef.current(index)
          return
        }
        const container = scrollContainerRef?.current
        if (!container) return
        const rowEl = container.querySelector<HTMLElement>(
          `[data-row-index="${index}"]`
        )
        if (rowEl && typeof rowEl.scrollIntoView === "function") {
          rowEl.scrollIntoView({ block: "nearest" })
        }
      },
      getTable: () => table,
    }),
    [
      table,
      setSorting,
      setColumnFilters,
      setGlobalFilter,
      setPagination,
      setRowSelection,
      setExpanded,
      scrollContainerRef,
      virtualScrollToIndexRef,
    ]
  )

  const flatColumns = table.getAllLeafColumns()
  const hasFooter = React.useMemo(
    () =>
      props.columns.some(
        (c) => c.footer !== undefined || c.aggregation !== undefined
      ) || Boolean(props.footerColumnGroup?.length),
    [props.columns, props.footerColumnGroup]
  )
  const hasToolbar =
    props.showToolbar ??
    Boolean(
      props.enableGlobalFilter ||
        props.columnToggle ||
        props.exportable ||
        props.toolbarLeft ||
        props.toolbarRight
    )
  const activeFilterCount = columnFilters.length + (globalFilter ? 1 : 0)

  return {
    table,
    state,
    setters,
    actions,
    flatColumns,
    hasFooter,
    hasToolbar,
    activeFilterCount,
  }
}
