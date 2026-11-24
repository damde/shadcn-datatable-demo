import type * as React from "react"
import type {
  ColumnFiltersState,
  ColumnOrderState,
  ColumnPinningState,
  ColumnSizingState,
  ColumnVisibilityState,
  ExpandedState,
  GroupingState,
  PaginationState,
  RowData,
  RowSelectionState,
  SortingState,
} from "@tanstack/react-table"
import type {
  LegacyColumnDef,
  LegacyReactTable,
  LegacyRow,
} from "@tanstack/react-table/legacy"
import type { DataTableMessages } from "./utils/locale"

export type { ColumnVisibilityState as VisibilityState }

/**
 * Density / size variants for the DataTable rows and cells.
 */
export type DataTableSize = "sm" | "md" | "lg"

/**
 * Sorting behavior mode: single column or multiple columns.
 */
export type SortMode = "single" | "multiple"

/**
 * Row selection mode.
 */
export type SelectionMode = "single" | "multiple" | "checkbox" | "radiobutton"

/**
 * Inline editing mode.
 */
export type EditMode = "cell" | "row"

/**
 * Column filter display mode.
 */
export type FilterDisplay = "row" | "menu" | "none"

/**
 * Paginator placement relative to the table.
 */
export type PaginatorPosition = "top" | "bottom" | "both"

/**
 * Row grouping presentation mode.
 */
export type RowGroupMode = "subheader" | "rowspan"

/**
 * Browser storage backend for persisting table state.
 */
export type StateStorageType = "session" | "local"

/**
 * Column resize mode: fit columns within container or expand container width.
 */
export type ColumnResizeMode = "fit" | "expand"

/**
 * Supported filter match modes (PrimeReact-compatible).
 */
export type FilterMatchMode =
  | "contains"
  | "notContains"
  | "startsWith"
  | "endsWith"
  | "equals"
  | "notEquals"
  | "gt"
  | "gte"
  | "lt"
  | "lte"
  | "between"
  | "in"
  | "notIn"
  | "dateIs"
  | "dateBefore"
  | "dateAfter"

/**
 * Column filter input type.
 */
export type ColumnFilterType =
  | "text"
  | "number"
  | "select"
  | "multi-select"
  | "date"
  | "boolean"

/**
 * Built-in footer / group-footer aggregation types or custom reducer.
 */
export type AggregationType<TData extends RowData = RowData> =
  | "sum"
  | "avg"
  | "min"
  | "max"
  | "count"
  | ((rows: LegacyRow<TData>[], columnId: string) => React.ReactNode)

/**
 * Option item for select / multi-select column filters or cell editors.
 */
export interface FilterOption<TValue = string> {
  label: string
  value: TValue
}

/**
 * Stored filter value including optional matchMode override.
 */
export interface ColumnFilterValue {
  value: unknown
  matchMode?: FilterMatchMode
}

/**
 * Context passed to custom cell `body` renderers.
 */
export interface ColumnBodyContext<TData extends RowData, TValue = unknown> {
  row: LegacyRow<TData>
  data: TData
  value: TValue
  rowIndex: number
  column: DataTableColumn<TData, TValue>
  table: LegacyReactTable<TData>
}

/**
 * Context passed to custom inline `editor` renderers.
 */
export interface ColumnEditorContext<TData extends RowData, TValue = unknown> {
  value: TValue
  row: LegacyRow<TData>
  data: TData
  rowIndex: number
  column: DataTableColumn<TData, TValue>
  onChange: (newValue: TValue) => void
  onCommit: () => void
  onCancel: () => void
}

/**
 * Context passed to custom `filterElement` renderers.
 */
export interface ColumnFilterContext<TData extends RowData, TValue = unknown> {
  value: unknown
  matchMode: FilterMatchMode
  onChange: (value: unknown, matchMode?: FilterMatchMode) => void
  onClear: () => void
  column: DataTableColumn<TData, TValue>
  table: LegacyReactTable<TData>
}

/**
 * PrimeReact-inspired column definition that also supports full TanStack ColumnDef options.
 */
export interface DataTableColumn<TData extends RowData, TValue = unknown> {
  /** Unique column identifier. Defaults to `field` if omitted. */
  id?: string
  /** Property key or dot-path on `TData` (mapped to TanStack `accessorKey`). */
  field?: keyof TData & string | (string & {})
  /** Custom accessor function for computed values (mapped to TanStack `accessorFn`). */
  accessorFn?: (row: TData, index: number) => TValue
  /** Header label or custom render function. */
  header?:
    | React.ReactNode
    | ((props: { table: LegacyReactTable<TData>; columnId: string }) => React.ReactNode)
  /** Custom cell renderer (alias for TanStack cell, with PrimeReact-style context). */
  body?: (data: TData, context: ColumnBodyContext<TData, TValue>) => React.ReactNode
  /** Footer label or custom render function. */
  footer?:
    | React.ReactNode
    | ((props: {
        rows: LegacyRow<TData>[]
        columnId: string
        table: LegacyReactTable<TData>
      }) => React.ReactNode)
  /** Automatic aggregation displayed in footer / group footer when `footer` is not provided. */
  aggregation?: AggregationType<TData>
  /** Prefix/formatter for automatic aggregation output. */
  aggregationFormatter?: (value: number | null) => React.ReactNode

  /** Enable sorting for this column (default: false unless table `sortable` is true). */
  sortable?: boolean
  /** Custom sorting function. */
  sortingFn?: LegacyColumnDef<TData, TValue>["sortFn"]

  /** Enable filtering for this column. */
  filterable?: boolean
  /** Filter input type (default: "text"). */
  filterType?: ColumnFilterType
  /** Default filter match mode (default depends on `filterType`). */
  filterMatchMode?: FilterMatchMode
  /** Available match modes shown in menu filter popover. */
  filterMatchModes?: FilterMatchMode[]
  /** Placeholder text for filter input. */
  filterPlaceholder?: string
  /** Options for `select` / `multi-select` filter types. */
  filterOptions?: FilterOption[]
  /** Custom filter UI renderer. */
  filterElement?: (context: ColumnFilterContext<TData, TValue>) => React.ReactNode

  /** Enable inline cell/row editing for this column. */
  editable?: boolean | ((data: TData, rowIndex: number) => boolean)
  /** Custom inline editor renderer. */
  editor?: (context: ColumnEditorContext<TData, TValue>) => React.ReactNode
  /** Validation callback before committing cell edit. Return `false` or error string to reject. */
  onCellEditValidate?: (newValue: TValue, oldValue: TValue, data: TData) => boolean | string

  /** Pin/freeze column to left or right edge. */
  frozen?: boolean
  /** Edge to freeze the column to (default: "left"). */
  alignFrozen?: "left" | "right"

  /** Allow resizing this column (default: inherits table `resizableColumns`). */
  resizable?: boolean
  /** Allow reordering this column (default: inherits table `reorderableColumns`). */
  reorderable?: boolean
  /** Initial hidden state. */
  hidden?: boolean
  /** Exclude column from CSV/JSON export (default: true). */
  exportable?: boolean

  /** Horizontal text alignment. */
  align?: "left" | "center" | "right"
  /** Fixed or initial column width in px or CSS string. */
  width?: number | string
  /** Minimum column width in px. */
  minWidth?: number
  /** Maximum column width in px. */
  maxWidth?: number

  /** CSS class applied to both header and body cells. */
  className?: string
  /** CSS class applied to header cell. */
  headerClassName?: string
  /** CSS class applied to body cell (can be dynamic per row). */
  bodyClassName?: string | ((data: TData, rowIndex: number) => string)
  /** CSS class applied to footer cell. */
  footerClassName?: string

  /** Arbitrary metadata passed through to TanStack `columnDef.meta`. */
  meta?: Record<string, unknown>
}

/**
 * Cell definition for multi-row grouped headers (`headerColumnGroup`) and footers (`footerColumnGroup`).
 */
export interface ColumnGroupCell {
  header?: React.ReactNode
  footer?: React.ReactNode
  colSpan?: number
  rowSpan?: number
  className?: string
  align?: "left" | "center" | "right"
  sortable?: boolean
  field?: string
}

/**
 * Row definition for multi-row grouped headers and footers.
 */
export interface ColumnGroupRow {
  cells: ColumnGroupCell[]
  className?: string
}

/**
 * Virtual scroller configuration powered by `@tanstack/react-virtual`.
 */
export interface VirtualScrollerOptions {
  /** Estimated height of each row in pixels (default: 40). */
  itemSize?: number
  /** Number of extra rows rendered above/below viewport (default: 10). */
  overscan?: number
  /** Enable virtual scrolling (default: true when `virtualScrollerOptions` is provided). */
  enabled?: boolean
}

/**
 * Context menu item definition for row right-click actions.
 */
export interface ContextMenuItem<TData> {
  id: string
  label: React.ReactNode
  icon?: React.ReactNode
  disabled?: boolean | ((data: TData) => boolean)
  destructive?: boolean
  separatorBefore?: boolean
  onSelect: (data: TData, rowIndex: number) => void
}

/**
 * Event payload emitted when a cell edit is completed.
 */
export interface CellEditCompleteEvent<TData, TValue = unknown> {
  rowData: TData
  newRowData: TData
  field: string
  value: TValue
  newValue: TValue
  rowIndex: number
}

/**
 * Event payload emitted when a row edit is completed.
 */
export interface RowEditCompleteEvent<TData> {
  data: TData
  newData: TData
  index: number
}

/**
 * Event payload emitted when rows are reordered via drag & drop.
 */
export interface RowReorderEvent<TData> {
  value: TData[]
  dragIndex: number
  dropIndex: number
}

/**
 * Parameters emitted in `onLazyLoad` / `onStateChange` for server-side operations.
 */
export interface DataTableLazyParams {
  first: number
  rows: number
  page: number
  sorting: SortingState
  columnFilters: ColumnFiltersState
  globalFilter: string
}

/**
 * Full serializable state of the DataTable (used for persistence & controlled state).
 */
export interface DataTableState {
  sorting: SortingState
  columnFilters: ColumnFiltersState
  globalFilter: string
  pagination: PaginationState
  columnVisibility: ColumnVisibilityState
  columnOrder: ColumnOrderState
  columnSizing: ColumnSizingState
  columnPinning: ColumnPinningState
  rowSelection: RowSelectionState
  expanded: ExpandedState
  grouping: GroupingState
}

/**
 * Imperative ref handle exposed by `DataTable`.
 */
export interface DataTableRef<TData extends RowData> {
  /** Export current or selected data to a CSV file download (also returns CSV string). */
  exportCSV: (options?: { selectionOnly?: boolean; filename?: string }) => string
  /** Export current or selected data to a JSON file download (also returns JSON string). */
  exportJSON: (options?: { selectionOnly?: boolean; filename?: string }) => string
  /** Reset sorting, filters, pagination, selection, and expansion to defaults. */
  reset: () => void
  /** Clear all column filters and global filter. */
  clearFilters: () => void
  /** Clear all sorting. */
  clearSorting: () => void
  /** Clear row selection. */
  clearSelection: () => void
  /** Expand all expandable rows. */
  expandAll: () => void
  /** Collapse all expanded rows. */
  collapseAll: () => void
  /** Scroll to a specific row index (when `scrollable` or virtualized). */
  scrollToIndex: (index: number) => void
  /** Access underlying TanStack Table instance. */
  getTable: () => LegacyReactTable<TData>
}

/**
 * Main props for the `DataTable` component.
 */
export interface DataTableProps<TData extends Record<string, unknown> | object> {
  /** Array of row data items. */
  data: TData[]
  /** Column definitions. */
  columns: DataTableColumn<TData>[]
  /** Unique property name or function to derive stable row IDs. */
  dataKey?: (keyof TData & string) | ((row: TData, index: number) => string)

  // --- Visual & Layout ---
  /** Row density size (default: "md"). */
  size?: DataTableSize
  /** Alternate row background colors. */
  stripedRows?: boolean
  /** Render borders around all cells. */
  showGridlines?: boolean
  /** Highlight row on hover (default: true). */
  hoverableRows?: boolean
  /** Dynamic class name per row. */
  rowClassName?: string | ((data: TData, rowIndex: number) => string)
  /** Custom table caption. */
  caption?: React.ReactNode
  /** Custom header slot rendered above the table (inside toolbar or standalone). */
  header?: React.ReactNode
  /** Custom footer slot rendered below the table. */
  footer?: React.ReactNode
  /** Custom content when `data` is empty or filtered to zero rows. */
  emptyMessage?: React.ReactNode
  /** Show loading indicator (skeleton rows by default). */
  loading?: boolean
  /** Number of skeleton rows when `loading` is true (default: 5). */
  skeletonRows?: number
  /** Show toolbar with global search, column toggle, export, etc. (default: true when any toolbar feature is enabled). */
  showToolbar?: boolean
  /** Custom left-aligned toolbar content. */
  toolbarLeft?: React.ReactNode
  /** Custom right-aligned toolbar content. */
  toolbarRight?: React.ReactNode
  /** Root container className. */
  className?: string
  /** Table wrapper className. */
  tableClassName?: string
  /** Responsive layout mode: "scroll" (horizontal scroll) or "stack" (stacked cards on small screens). */
  responsiveLayout?: "scroll" | "stack"
  /** Breakpoint below which `responsiveLayout="stack"` activates (default: "md"). */
  breakpoint?: "sm" | "md" | "lg"
  /** Accessible label for the data grid (`aria-label`). */
  ariaLabel?: string
  /** ID of element labelling the data grid (`aria-labelledby`). */
  ariaLabelledBy?: string
  /** BCP-47 language tag (e.g. "en", "it") for built-in translations and `lang` attribute (WCAG 3.1.2). */
  locale?: string
  /** Custom partial overrides for UI and ARIA messages. */
  messages?: Partial<DataTableMessages>

  // --- Sorting ---
  /** Enable sorting globally for all columns unless overridden per column. */
  sortable?: boolean
  /** Single or multiple column sorting (default: "single"). */
  sortMode?: SortMode
  /** Allow cycling sort back to unsorted (default: true). */
  removableSort?: boolean
  /** Controlled sorting state. */
  sorting?: SortingState
  /** Callback when sorting changes. */
  onSortingChange?: (sorting: SortingState) => void

  // --- Filtering ---
  /** Where column filters are displayed: "row", "menu", or "none" (default: "none"). */
  filterDisplay?: FilterDisplay
  /** Enable global search input in the toolbar. */
  enableGlobalFilter?: boolean
  /** Global search placeholder text. */
  globalFilterPlaceholder?: string
  /** Controlled global filter string. */
  globalFilter?: string
  /** Callback when global filter changes. */
  onGlobalFilterChange?: (value: string) => void
  /** Controlled column filters state. */
  columnFilters?: ColumnFiltersState
  /** Callback when column filters change. */
  onColumnFiltersChange?: (filters: ColumnFiltersState) => void

  // --- Pagination ---
  /** Enable pagination. */
  paginator?: boolean
  /** Position of paginator (default: "bottom"). */
  paginatorPosition?: PaginatorPosition
  /** Initial or controlled page size (default: 10). */
  rows?: number
  /** Controlled 0-based page index. */
  pageIndex?: number
  /** Available page size options (default: [5, 10, 20, 50]). */
  rowsPerPageOptions?: number[]
  /** Template for page report, e.g. "Showing {first} to {last} of {totalRecords}". */
  currentPageReportTemplate?: string
  /** Show current page report text (default: true). */
  showCurrentPageReport?: boolean
  /** Controlled pagination state. */
  pagination?: PaginationState
  /** Callback when pagination changes. */
  onPaginationChange?: (pagination: PaginationState) => void

  // --- Server-Side / Lazy Mode ---
  /** Enable manual sorting, filtering, and pagination for server-side data. */
  lazy?: boolean
  /** Total record count on server (required for accurate pagination in `lazy` mode). */
  totalRecords?: number
  /** Unified callback fired when sorting, filters, globalFilter, or pagination change in lazy mode. */
  onLazyLoad?: (params: DataTableLazyParams) => void

  // --- Selection ---
  /** Selection mode: "single", "multiple", "checkbox", or "radiobutton". */
  selectionMode?: SelectionMode
  /** Selected item(s): single `TData | null` or array `TData[]` depending on mode. */
  selection?: TData | TData[] | null
  /** Callback when selection changes. */
  onSelectionChange?: (selection: TData | TData[] | null) => void
  /** Controlled TanStack RowSelectionState (alternative to `selection`). */
  rowSelection?: RowSelectionState
  /** Callback for TanStack RowSelectionState. */
  onRowSelectionChange?: (rowSelection: RowSelectionState) => void
  /** Require Ctrl/Cmd/Shift key for multiple row click selection (default: false). */
  metaKeySelection?: boolean
  /** Predicate to disable selection on specific rows. */
  isRowSelectable?: (data: TData, rowIndex: number) => boolean
  /** Callback fired when a row is selected. */
  onRowSelect?: (data: TData, rowIndex: number) => void
  /** Callback fired when a row is unselected. */
  onRowUnselect?: (data: TData, rowIndex: number) => void

  // --- Row Expansion ---
  /** Enable row expansion with expander column. */
  expandableRows?: boolean
  /** Controlled expanded state. */
  expandedRows?: ExpandedState
  /** Callback when expanded state changes. */
  onRowToggle?: (expanded: ExpandedState) => void
  /** Render function for expanded row content. */
  rowExpansionTemplate?: (data: TData, rowIndex: number) => React.ReactNode
  /** Predicate to allow/disallow expansion on specific rows. */
  allowRowExpansion?: (data: TData, rowIndex: number) => boolean

  // --- Row Grouping ---
  /** Row grouping presentation mode. */
  rowGroupMode?: RowGroupMode
  /** Column ID / field name to group rows by. */
  groupRowsBy?: string
  /** Allow collapsing/expanding row groups in `subheader` mode. */
  expandableRowGroups?: boolean
  /** Custom renderer for subheader group header row. */
  rowGroupHeaderTemplate?: (groupValue: unknown, rows: LegacyRow<TData>[]) => React.ReactNode
  /** Custom renderer for subheader group footer row. */
  rowGroupFooterTemplate?: (groupValue: unknown, rows: LegacyRow<TData>[]) => React.ReactNode

  // --- Column Features ---
  /** Show column visibility toggle menu in toolbar. */
  columnToggle?: boolean
  /** Allow resizing columns by dragging header borders. */
  resizableColumns?: boolean
  /** Column resize mode (default: "fit"). */
  columnResizeMode?: ColumnResizeMode
  /** Allow reordering columns via header drag & drop. */
  reorderableColumns?: boolean
  /** Multi-row grouped header definitions. */
  headerColumnGroup?: ColumnGroupRow[]
  /** Multi-row grouped footer definitions. */
  footerColumnGroup?: ColumnGroupRow[]
  /** Controlled column visibility state. */
  columnVisibility?: ColumnVisibilityState
  /** Callback when column visibility changes. */
  onColumnVisibilityChange?: (visibility: ColumnVisibilityState) => void
  /** Controlled column order state. */
  columnOrder?: ColumnOrderState
  /** Callback when column order changes. */
  onColumnOrderChange?: (order: ColumnOrderState) => void
  /** Controlled column sizing state. */
  columnSizing?: ColumnSizingState
  /** Callback when column sizing changes. */
  onColumnSizingChange?: (sizing: ColumnSizingState) => void
  /** Controlled column pinning state. */
  columnPinning?: ColumnPinningState
  /** Callback when column pinning changes. */
  onColumnPinningChange?: (pinning: ColumnPinningState) => void

  // --- Row Reordering ---
  /** Allow dragging rows to reorder them. */
  reorderableRows?: boolean
  /** Callback when rows are reordered. */
  onRowReorder?: (event: RowReorderEvent<TData>) => void

  // --- Inline Editing ---
  /** Enable inline cell or row editing. */
  editMode?: EditMode
  /** Callback when a cell edit is committed. */
  onCellEditComplete?: (event: CellEditCompleteEvent<TData>) => void
  /** Callback when a row edit is committed. */
  onRowEditComplete?: (event: RowEditCompleteEvent<TData>) => void
  /** Callback when a row edit is cancelled. */
  onRowEditCancel?: (data: TData, index: number) => void

  // --- Scrolling & Virtualization ---
  /** Enable vertical/horizontal scrolling container with sticky header. */
  scrollable?: boolean
  /** Max height of scrollable table body (e.g. "400px" or 400). */
  scrollHeight?: string | number
  /** Virtual scrolling options for large datasets. */
  virtualScrollerOptions?: VirtualScrollerOptions
  /** Rows pinned to the top of the table body. */
  frozenValue?: TData[]

  // --- Context Menu & Export ---
  /** Context menu items shown on row right-click. */
  contextMenuItems?: ContextMenuItem<TData>[] | ((data: TData, rowIndex: number) => ContextMenuItem<TData>[])
  /** Callback fired on row right-click. */
  onRowContextMenu?: (event: React.MouseEvent, data: TData, rowIndex: number) => void
  /** Callback fired on row click. */
  onRowClick?: (event: React.MouseEvent, data: TData, rowIndex: number) => void
  /** Callback fired on row double-click. */
  onRowDoubleClick?: (event: React.MouseEvent, data: TData, rowIndex: number) => void
  /** Show export menu (CSV / JSON) in toolbar. */
  exportable?: boolean
  /** Default filename (without extension) for exports (default: "datatable-export"). */
  exportFilename?: string

  // --- State Persistence ---
  /** Storage backend for automatic state persistence. */
  stateStorage?: StateStorageType
  /** Storage key used when `stateStorage` is set. */
  stateKey?: string
  /** Callback fired when persisted/internal state changes. */
  onStateChange?: (state: DataTableState) => void
}
