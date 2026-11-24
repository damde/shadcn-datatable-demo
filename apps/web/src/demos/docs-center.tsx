import * as React from "react"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Separator } from "@workspace/ui/components/separator"
import {
  Accessibility,
  ArrowLeftRight,
  BookOpen,
  Check,
  Columns3,
  Copy,
  Filter,
  Keyboard,
  Layers,
  ListFilter,
  Search,
  Terminal,
  X,
} from "lucide-react"

// ---------------------------------------------------------------------------
// Types & Data Definitions
// ---------------------------------------------------------------------------

type DocSectionId =
  | "getting-started"
  | "architecture"
  | "props-reference"
  | "column-contexts"
  | "imperative-hook"
  | "filters-aggregations"
  | "accessibility"
  | "migration-parity"

interface DocSectionMeta {
  id: DocSectionId
  title: string
  shortTitle: string
  description: string
  icon: React.ReactNode
  keywords: string[]
}

interface PropDocItem {
  name: string
  type: string
  defaultValue: string
  description: string
  required?: boolean
}

interface PropCategory {
  id: string
  title: string
  props: PropDocItem[]
}

interface ColumnPropDocItem {
  name: string
  type: string
  defaultValue: string
  description: string
}

interface FilterModeDoc {
  mode: string
  label: string
  appliesTo: string
  behavior: string
}

interface KeyboardShortcutDoc {
  keys: string
  context: string
  behavior: string
}

interface ParityRow {
  feature: string
  primeReact: string
  shadcnDataTable: string
  notes: string
}

const DOC_SECTIONS: DocSectionMeta[] = [
  {
    id: "getting-started",
    title: "Getting Started & Installation",
    shortTitle: "Getting Started",
    description:
      "Monorepo imports, Tailwind CSS v4 global stylesheet setup, and a complete working DataTable example.",
    icon: <BookOpen className="size-4" />,
    keywords: [
      "install",
      "import",
      "css",
      "globals.css",
      "quickstart",
      "setup",
      "basic",
    ],
  },
  {
    id: "architecture",
    title: "Architecture & Customization",
    shortTitle: "Architecture & Styling",
    description:
      "Package anatomy, headless hook composition, Tailwind v4 CSS variables, custom cell/editor/filter/group renderers, and dynamic row/cell classes.",
    icon: <Layers className="size-4" />,
    keywords: [
      "architecture",
      "subcomponents",
      "theming",
      "tailwind",
      "css variables",
      "body",
      "editor",
      "filterElement",
      "rowExpansionTemplate",
      "rowGroupHeaderTemplate",
      "rowGroupFooterTemplate",
      "rowClassName",
      "bodyClassName",
    ],
  },
  {
    id: "props-reference",
    title: "Complete Props Reference (DataTableProps)",
    shortTitle: "DataTableProps",
    description:
      "Searchable, category-filtered reference of all DataTableProps with exact TypeScript types, defaults, and descriptions.",
    icon: <ListFilter className="size-4" />,
    keywords: [
      "props",
      "DataTableProps",
      "sorting",
      "filtering",
      "pagination",
      "lazy",
      "selection",
      "expansion",
      "grouping",
      "virtual",
      "editing",
      "persistence",
      "responsive",
      "aria",
      "locale",
      "messages",
      "i18n",
    ],
  },
  {
    id: "column-contexts",
    title: "Column Definition (DataTableColumn) & Contexts",
    shortTitle: "Columns & Contexts",
    description:
      "Full DataTableColumn<TData, TValue> API, render contexts (ColumnBodyContext, ColumnEditorContext, ColumnFilterContext), and ColumnGroupRow.",
    icon: <Columns3 className="size-4" />,
    keywords: [
      "DataTableColumn",
      "ColumnBodyContext",
      "ColumnEditorContext",
      "ColumnFilterContext",
      "ColumnGroupRow",
      "ColumnGroupCell",
      "VirtualScrollerOptions",
      "ContextMenuItem",
    ],
  },
  {
    id: "imperative-hook",
    title: "Imperative API (DataTableRef) & useDataTable Hook",
    shortTitle: "Ref API & Hook",
    description:
      "Programmatic table control via ref (exportCSV, exportJSON, reset, scrollToIndex, getTable) and headless composition with useDataTable.",
    icon: <Terminal className="size-4" />,
    keywords: [
      "DataTableRef",
      "useDataTable",
      "exportCSV",
      "exportJSON",
      "sanitizeFormulas",
      "csv",
      "reset",
      "clearFilters",
      "clearSorting",
      "clearSelection",
      "expandAll",
      "collapseAll",
      "scrollToIndex",
      "getTable",
    ],
  },
  {
    id: "filters-aggregations",
    title: "Filter Match Modes & Aggregations",
    shortTitle: "Filters & Aggregations",
    description:
      "All 16 PrimeReact-compatible FilterMatchMode values, default match modes by ColumnFilterType, and built-in/custom AggregationType reducers.",
    icon: <Filter className="size-4" />,
    keywords: [
      "FilterMatchMode",
      "contains",
      "between",
      "dateIs",
      "AggregationType",
      "sum",
      "avg",
      "min",
      "max",
      "count",
    ],
  },
  {
    id: "accessibility",
    title: "Accessibility (WCAG 2.2) & Keyboard Shortcuts",
    shortTitle: "A11y & Keyboard",
    description:
      "ARIA grid contract, screen-reader attributes, focus management, and keyboard interaction bindings.",
    icon: <Accessibility className="size-4" />,
    keywords: [
      "wcag",
      "a11y",
      "accessibility",
      "aria",
      "keyboard",
      "shortcuts",
      "grid",
      "screen reader",
      "locale",
      "messages",
      "playwright",
      "axe",
      "e2e",
    ],
  },
  {
    id: "migration-parity",
    title: "PrimeReact Migration & Feature Parity Matrix",
    shortTitle: "PrimeReact Parity",
    description:
      "Side-by-side mapping of PrimeReact DataTable props and patterns to @workspace/ui/components/data-table.",
    icon: <ArrowLeftRight className="size-4" />,
    keywords: [
      "primereact",
      "migration",
      "parity",
      "comparison",
      "upgrade",
    ],
  },
]

const PROP_CATEGORIES: PropCategory[] = [
  {
    id: "data-core",
    title: "Data & Core",
    props: [
      {
        name: "data",
        type: "TData[]",
        defaultValue: "Required",
        required: true,
        description: "Array of row data items rendered by the table.",
      },
      {
        name: "columns",
        type: "DataTableColumn<TData>[]",
        defaultValue: "Required",
        required: true,
        description: "Column definitions describing headers, accessors, renderers, and features.",
      },
      {
        name: "dataKey",
        type: "(keyof TData & string) | ((row: TData, index: number) => string)",
        defaultValue: "Row index string",
        description: "Unique property name or function to derive stable row IDs.",
      },
    ],
  },
  {
    id: "visual-layout",
    title: "Visual & Layout",
    props: [
      {
        name: "size",
        type: 'DataTableSize ("sm" | "md" | "lg")',
        defaultValue: '"md"',
        description: "Row density size affecting cell padding and typography.",
      },
      {
        name: "stripedRows",
        type: "boolean",
        defaultValue: "false",
        description: "Alternate row background colors for easier visual scanning.",
      },
      {
        name: "showGridlines",
        type: "boolean",
        defaultValue: "false",
        description: "Render vertical and horizontal borders around all cells.",
      },
      {
        name: "hoverableRows",
        type: "boolean",
        defaultValue: "true",
        description: "Highlight table rows on pointer hover.",
      },
      {
        name: "rowClassName",
        type: "string | ((data: TData, rowIndex: number) => string)",
        defaultValue: "undefined",
        description: "Static or dynamic CSS class name applied to each body row.",
      },
      {
        name: "caption",
        type: "React.ReactNode",
        defaultValue: "undefined",
        description: "Accessible table caption rendered inside the <table> element.",
      },
      {
        name: "header",
        type: "React.ReactNode",
        defaultValue: "undefined",
        description: "Custom header slot rendered above the table (inside toolbar or standalone).",
      },
      {
        name: "footer",
        type: "React.ReactNode",
        defaultValue: "undefined",
        description: "Custom footer slot rendered below the table.",
      },
      {
        name: "emptyMessage",
        type: "React.ReactNode",
        defaultValue: "undefined",
        description: "Custom content displayed when data is empty or filtered to zero rows.",
      },
      {
        name: "loading",
        type: "boolean",
        defaultValue: "false",
        description: "Show loading indicator (skeleton rows) and set aria-busy on the grid.",
      },
      {
        name: "skeletonRows",
        type: "number",
        defaultValue: "5",
        description: "Number of skeleton rows rendered while loading is true.",
      },
      {
        name: "showToolbar",
        type: "boolean",
        defaultValue: "Auto (true if toolbar feature enabled)",
        description: "Force-show or hide the top toolbar containing global search, column toggle, and export.",
      },
      {
        name: "toolbarLeft",
        type: "React.ReactNode",
        defaultValue: "undefined",
        description: "Custom left-aligned toolbar content.",
      },
      {
        name: "toolbarRight",
        type: "React.ReactNode",
        defaultValue: "undefined",
        description: "Custom right-aligned toolbar content.",
      },
      {
        name: "className",
        type: "string",
        defaultValue: "undefined",
        description: "CSS class applied to the root DataTable wrapper.",
      },
      {
        name: "tableClassName",
        type: "string",
        defaultValue: "undefined",
        description: "CSS class applied directly to the <table> element.",
      },
    ],
  },
  {
    id: "responsive",
    title: "Responsive",
    props: [
      {
        name: "responsiveLayout",
        type: '"scroll" | "stack"',
        defaultValue: '"scroll"',
        description:
          'Responsive layout mode: horizontal scroll ("scroll") or stacked cards ("stack") on narrow viewports.',
      },
      {
        name: "breakpoint",
        type: '"sm" | "md" | "lg"',
        defaultValue: '"md"',
        description: 'Viewport breakpoint below which responsiveLayout="stack" activates.',
      },
    ],
  },
  {
    id: "accessibility",
    title: "Accessibility & Localization (WCAG 2.2)",
    props: [
      {
        name: "ariaLabel",
        type: "string",
        defaultValue: "undefined",
        description: "Accessible label for the data grid (aria-label).",
      },
      {
        name: "ariaLabelledBy",
        type: "string",
        defaultValue: "undefined",
        description: "ID of an external heading or element labelling the data grid (aria-labelledby).",
      },
      {
        name: "locale",
        type: "string",
        defaultValue: "undefined",
        description:
          'BCP-47 language tag (e.g. "en", "it") for built-in translations (DEFAULT_MESSAGES_EN / MESSAGES_IT) and root lang attribute (WCAG 3.1.2).',
      },
      {
        name: "messages",
        type: "Partial<DataTableMessages>",
        defaultValue: "undefined",
        description:
          "Custom partial overrides for UI labels, toolbar buttons, pagination text, and ARIA live announcements.",
      },
    ],
  },
  {
    id: "sorting",
    title: "Sorting",
    props: [
      {
        name: "sortable",
        type: "boolean",
        defaultValue: "false",
        description: "Enable sorting globally for all columns unless overridden per column.",
      },
      {
        name: "sortMode",
        type: 'SortMode ("single" | "multiple")',
        defaultValue: '"single"',
        description: "Allow single-column or multi-column sorting.",
      },
      {
        name: "removableSort",
        type: "boolean",
        defaultValue: "true",
        description: "Allow cycling sort state back to unsorted on third click.",
      },
      {
        name: "sorting",
        type: "SortingState",
        defaultValue: "undefined",
        description: "Controlled TanStack Table SortingState.",
      },
      {
        name: "onSortingChange",
        type: "(sorting: SortingState) => void",
        defaultValue: "undefined",
        description: "Callback invoked when sorting state changes.",
      },
    ],
  },
  {
    id: "filtering",
    title: "Filtering",
    props: [
      {
        name: "filterDisplay",
        type: 'FilterDisplay ("row" | "menu" | "none")',
        defaultValue: '"none"',
        description: "Where column filter inputs are rendered (inline filter row, header popover menu, or hidden).",
      },
      {
        name: "enableGlobalFilter",
        type: "boolean",
        defaultValue: "false",
        description: "Show the global search input in the toolbar.",
      },
      {
        name: "globalFilterPlaceholder",
        type: "string",
        defaultValue: "undefined",
        description: "Placeholder text for the global search input.",
      },
      {
        name: "globalFilter",
        type: "string",
        defaultValue: "undefined",
        description: "Controlled global search query string.",
      },
      {
        name: "onGlobalFilterChange",
        type: "(value: string) => void",
        defaultValue: "undefined",
        description: "Callback invoked when the global filter string changes.",
      },
      {
        name: "columnFilters",
        type: "ColumnFiltersState",
        defaultValue: "undefined",
        description: "Controlled TanStack Table ColumnFiltersState.",
      },
      {
        name: "onColumnFiltersChange",
        type: "(filters: ColumnFiltersState) => void",
        defaultValue: "undefined",
        description: "Callback invoked when column filters change.",
      },
    ],
  },
  {
    id: "pagination",
    title: "Pagination",
    props: [
      {
        name: "paginator",
        type: "boolean",
        defaultValue: "false",
        description: "Enable client-side or server-side pagination controls.",
      },
      {
        name: "paginatorPosition",
        type: 'PaginatorPosition ("top" | "bottom" | "both")',
        defaultValue: '"bottom"',
        description: "Placement of the paginator bar relative to the table.",
      },
      {
        name: "rows",
        type: "number",
        defaultValue: "10",
        description: "Initial or controlled number of rows per page.",
      },
      {
        name: "pageIndex",
        type: "number",
        defaultValue: "0",
        description: "Controlled 0-based active page index.",
      },
      {
        name: "rowsPerPageOptions",
        type: "number[]",
        defaultValue: "[5, 10, 20, 50]",
        description: "Page size options shown in the rows-per-page selector.",
      },
      {
        name: "currentPageReportTemplate",
        type: "string",
        defaultValue: "undefined",
        description: 'Template for page summary, e.g. "Showing {first} to {last} of {totalRecords}".',
      },
      {
        name: "showCurrentPageReport",
        type: "boolean",
        defaultValue: "true",
        description: "Toggle visibility of the current page report text.",
      },
      {
        name: "pagination",
        type: "PaginationState",
        defaultValue: "undefined",
        description: "Controlled TanStack Table PaginationState ({ pageIndex, pageSize }).",
      },
      {
        name: "onPaginationChange",
        type: "(pagination: PaginationState) => void",
        defaultValue: "undefined",
        description: "Callback invoked when page index or page size changes.",
      },
    ],
  },
  {
    id: "lazy",
    title: "Lazy / Server-Side",
    props: [
      {
        name: "lazy",
        type: "boolean",
        defaultValue: "false",
        description: "Enable manual sorting, filtering, and pagination for server-side datasets.",
      },
      {
        name: "totalRecords",
        type: "number",
        defaultValue: "undefined",
        description: "Total record count on the server (required for accurate page count in lazy mode).",
      },
      {
        name: "onLazyLoad",
        type: "(params: DataTableLazyParams) => void",
        defaultValue: "undefined",
        description: "Unified callback fired when sorting, filters, globalFilter, or pagination change in lazy mode.",
      },
    ],
  },
  {
    id: "selection",
    title: "Selection",
    props: [
      {
        name: "selectionMode",
        type: 'SelectionMode ("single" | "multiple" | "checkbox" | "radiobutton")',
        defaultValue: "undefined",
        description:
          'Enables row selection via row click, checkboxes, or radio buttons. Supports Shift+Click range selection in "multiple" and "checkbox" modes.',
      },
      {
        name: "selection",
        type: "TData | TData[] | null",
        defaultValue: "undefined",
        description: "Controlled selected item (single/radiobutton) or array of items (multiple/checkbox).",
      },
      {
        name: "onSelectionChange",
        type: "(selection: TData | TData[] | null) => void",
        defaultValue: "undefined",
        description: "Callback invoked with the updated selected item(s).",
      },
      {
        name: "rowSelection",
        type: "RowSelectionState",
        defaultValue: "undefined",
        description: "Controlled TanStack RowSelectionState (alternative to selection).",
      },
      {
        name: "onRowSelectionChange",
        type: "(rowSelection: RowSelectionState) => void",
        defaultValue: "undefined",
        description: "Callback for TanStack RowSelectionState.",
      },
      {
        name: "metaKeySelection",
        type: "boolean",
        defaultValue: "false",
        description:
          "Require Ctrl/Cmd/Shift key for multiple row click selection (Shift+Click selects contiguous ranges).",
      },
      {
        name: "isRowSelectable",
        type: "(data: TData, rowIndex: number) => boolean",
        defaultValue: "undefined",
        description: "Predicate to disable selection on specific rows.",
      },
      {
        name: "onRowSelect",
        type: "(data: TData, rowIndex: number) => void",
        defaultValue: "undefined",
        description: "Callback fired when an individual row becomes selected.",
      },
      {
        name: "onRowUnselect",
        type: "(data: TData, rowIndex: number) => void",
        defaultValue: "undefined",
        description: "Callback fired when an individual row is unselected.",
      },
    ],
  },
  {
    id: "row-expansion",
    title: "Row Expansion",
    props: [
      {
        name: "expandableRows",
        type: "boolean",
        defaultValue: "false",
        description: "Enable row expansion with a dedicated expander toggle column.",
      },
      {
        name: "expandedRows",
        type: "ExpandedState",
        defaultValue: "undefined",
        description: "Controlled TanStack Table ExpandedState.",
      },
      {
        name: "onRowToggle",
        type: "(expanded: ExpandedState) => void",
        defaultValue: "undefined",
        description: "Callback invoked when rows are expanded or collapsed.",
      },
      {
        name: "rowExpansionTemplate",
        type: "(data: TData, rowIndex: number) => React.ReactNode",
        defaultValue: "undefined",
        description: "Render function for the expanded detail panel below a row.",
      },
      {
        name: "allowRowExpansion",
        type: "(data: TData, rowIndex: number) => boolean",
        defaultValue: "undefined",
        description: "Predicate to allow or disallow expansion on specific rows.",
      },
    ],
  },
  {
    id: "row-grouping",
    title: "Row Grouping",
    props: [
      {
        name: "rowGroupMode",
        type: 'RowGroupMode ("subheader" | "rowspan")',
        defaultValue: "undefined",
        description: "Row grouping presentation mode (group subheader rows or merged rowspan cells).",
      },
      {
        name: "groupRowsBy",
        type: "string",
        defaultValue: "undefined",
        description: "Column ID / field name to group rows by.",
      },
      {
        name: "expandableRowGroups",
        type: "boolean",
        defaultValue: "false",
        description: 'Allow collapsing/expanding row groups when rowGroupMode="subheader".',
      },
      {
        name: "rowGroupHeaderTemplate",
        type: "(groupValue: unknown, rows: LegacyRow<TData>[]) => React.ReactNode",
        defaultValue: "undefined",
        description: "Custom renderer for subheader group header rows.",
      },
      {
        name: "rowGroupFooterTemplate",
        type: "(groupValue: unknown, rows: LegacyRow<TData>[]) => React.ReactNode",
        defaultValue: "undefined",
        description: "Custom renderer for subheader group footer rows.",
      },
    ],
  },
  {
    id: "column-features",
    title: "Column Features",
    props: [
      {
        name: "columnToggle",
        type: "boolean",
        defaultValue: "false",
        description: "Show column visibility toggle dropdown in the toolbar.",
      },
      {
        name: "resizableColumns",
        type: "boolean",
        defaultValue: "false",
        description: "Allow resizing columns by dragging header borders.",
      },
      {
        name: "columnResizeMode",
        type: 'ColumnResizeMode ("fit" | "expand")',
        defaultValue: '"fit"',
        description: "Fit columns within container width or expand container width on resize.",
      },
      {
        name: "reorderableColumns",
        type: "boolean",
        defaultValue: "false",
        description: "Allow reordering columns via header drag & drop.",
      },
      {
        name: "headerColumnGroup",
        type: "ColumnGroupRow[]",
        defaultValue: "undefined",
        description: "Multi-row grouped header definitions with colSpan and rowSpan.",
      },
      {
        name: "footerColumnGroup",
        type: "ColumnGroupRow[]",
        defaultValue: "undefined",
        description: "Multi-row grouped footer definitions with colSpan and rowSpan.",
      },
      {
        name: "columnVisibility",
        type: "ColumnVisibilityState",
        defaultValue: "undefined",
        description: "Controlled column visibility map.",
      },
      {
        name: "onColumnVisibilityChange",
        type: "(visibility: ColumnVisibilityState) => void",
        defaultValue: "undefined",
        description: "Callback invoked when column visibility changes.",
      },
      {
        name: "columnOrder",
        type: "ColumnOrderState",
        defaultValue: "undefined",
        description: "Controlled ordered array of column IDs.",
      },
      {
        name: "onColumnOrderChange",
        type: "(order: ColumnOrderState) => void",
        defaultValue: "undefined",
        description: "Callback invoked when column order changes.",
      },
      {
        name: "columnSizing",
        type: "ColumnSizingState",
        defaultValue: "undefined",
        description: "Controlled column widths map.",
      },
      {
        name: "onColumnSizingChange",
        type: "(sizing: ColumnSizingState) => void",
        defaultValue: "undefined",
        description: "Callback invoked when column sizes change.",
      },
      {
        name: "columnPinning",
        type: "ColumnPinningState",
        defaultValue: "undefined",
        description: "Controlled left/right column pinning state.",
      },
      {
        name: "onColumnPinningChange",
        type: "(pinning: ColumnPinningState) => void",
        defaultValue: "undefined",
        description: "Callback invoked when column pinning changes.",
      },
    ],
  },
  {
    id: "row-reordering",
    title: "Row Reordering",
    props: [
      {
        name: "reorderableRows",
        type: "boolean",
        defaultValue: "false",
        description: "Render drag handles allowing rows to be reordered via drag & drop.",
      },
      {
        name: "onRowReorder",
        type: "(event: RowReorderEvent<TData>) => void",
        defaultValue: "undefined",
        description: "Callback fired with reordered data array, dragIndex, and dropIndex.",
      },
    ],
  },
  {
    id: "inline-editing",
    title: "Inline Editing",
    props: [
      {
        name: "editMode",
        type: 'EditMode ("cell" | "row")',
        defaultValue: "undefined",
        description: "Enable inline cell-by-cell editing or full-row editing with Save/Cancel controls.",
      },
      {
        name: "onCellEditComplete",
        type: "(event: CellEditCompleteEvent<TData>) => void",
        defaultValue: "undefined",
        description: "Callback fired when a cell edit is committed.",
      },
      {
        name: "onRowEditComplete",
        type: "(event: RowEditCompleteEvent<TData>) => void",
        defaultValue: "undefined",
        description: "Callback fired when a row edit is committed.",
      },
      {
        name: "onRowEditCancel",
        type: "(data: TData, index: number) => void",
        defaultValue: "undefined",
        description: "Callback fired when a row edit is cancelled.",
      },
    ],
  },
  {
    id: "scrolling-virtualization",
    title: "Scrolling & Virtualization",
    props: [
      {
        name: "scrollable",
        type: "boolean",
        defaultValue: "false",
        description: "Enable vertical/horizontal scroll container with sticky table header.",
      },
      {
        name: "scrollHeight",
        type: "string | number",
        defaultValue: "undefined",
        description: 'Max height of scrollable table body (e.g. "400px" or 400).',
      },
      {
        name: "virtualScrollerOptions",
        type: "VirtualScrollerOptions",
        defaultValue: "undefined",
        description: "Virtual scrolling configuration powered by @tanstack/react-virtual.",
      },
      {
        name: "frozenValue",
        type: "TData[]",
        defaultValue: "undefined",
        description: "Rows pinned to the top of the table body above scrollable rows.",
      },
    ],
  },
  {
    id: "context-menu-export",
    title: "Context Menu & Export",
    props: [
      {
        name: "contextMenuItems",
        type: "ContextMenuItem<TData>[] | ((data: TData, rowIndex: number) => ContextMenuItem<TData>[])",
        defaultValue: "undefined",
        description: "Context menu items shown when right-clicking a row.",
      },
      {
        name: "onRowContextMenu",
        type: "(event: React.MouseEvent, data: TData, rowIndex: number) => void",
        defaultValue: "undefined",
        description: "Callback fired on row right-click.",
      },
      {
        name: "onRowClick",
        type: "(event: React.MouseEvent, data: TData, rowIndex: number) => void",
        defaultValue: "undefined",
        description: "Callback fired on row click.",
      },
      {
        name: "onRowDoubleClick",
        type: "(event: React.MouseEvent, data: TData, rowIndex: number) => void",
        defaultValue: "undefined",
        description: "Callback fired on row double-click.",
      },
      {
        name: "exportable",
        type: "boolean",
        defaultValue: "false",
        description: "Show export menu (CSV / JSON) in the toolbar.",
      },
      {
        name: "exportFilename",
        type: "string",
        defaultValue: '"datatable-export"',
        description: "Default filename (without extension) for downloaded exports.",
      },
    ],
  },
  {
    id: "state-persistence",
    title: "State Persistence",
    props: [
      {
        name: "stateStorage",
        type: 'StateStorageType ("session" | "local")',
        defaultValue: "undefined",
        description: "Browser storage backend for automatic table state persistence.",
      },
      {
        name: "stateKey",
        type: "string",
        defaultValue: "undefined",
        description: "Storage key used when stateStorage is configured.",
      },
      {
        name: "onStateChange",
        type: "(state: DataTableState) => void",
        defaultValue: "undefined",
        description: "Callback fired whenever resolved table state changes.",
      },
    ],
  },
]

const COLUMN_PROPS: ColumnPropDocItem[] = [
  {
    name: "id",
    type: "string",
    defaultValue: "field",
    description: "Unique column identifier. Defaults to `field` if omitted.",
  },
  {
    name: "field",
    type: "(keyof TData & string) | (string & {})",
    defaultValue: "undefined",
    description: "Property key or dot-path on TData (mapped to TanStack accessorKey).",
  },
  {
    name: "accessorFn",
    type: "(row: TData, index: number) => TValue",
    defaultValue: "undefined",
    description: "Custom accessor function for computed cell values (mapped to TanStack accessorFn).",
  },
  {
    name: "header",
    type: "React.ReactNode | ((props: { table; columnId }) => React.ReactNode)",
    defaultValue: "undefined",
    description: "Header label or custom header render function.",
  },
  {
    name: "body",
    type: "(data: TData, context: ColumnBodyContext<TData, TValue>) => React.ReactNode",
    defaultValue: "undefined",
    description: "Custom cell renderer with PrimeReact-style row data and context.",
  },
  {
    name: "footer",
    type: "React.ReactNode | ((props: { rows; columnId; table }) => React.ReactNode)",
    defaultValue: "undefined",
    description: "Footer label or custom footer render function.",
  },
  {
    name: "aggregation",
    type: "AggregationType<TData>",
    defaultValue: "undefined",
    description: "Automatic aggregation displayed in footer / group footer when footer is omitted.",
  },
  {
    name: "aggregationFormatter",
    type: "(value: number | null) => React.ReactNode",
    defaultValue: "undefined",
    description: "Formatter applied to automatic numeric aggregation output.",
  },
  {
    name: "sortable",
    type: "boolean",
    defaultValue: "Inherits table sortable",
    description: "Enable or override sorting for this column.",
  },
  {
    name: "sortingFn",
    type: 'LegacyColumnDef<TData, TValue>["sortFn"]',
    defaultValue: "undefined",
    description: "Custom TanStack Table sorting comparator.",
  },
  {
    name: "filterable",
    type: "boolean",
    defaultValue: "false",
    description: "Enable column filtering when filterDisplay is row or menu.",
  },
  {
    name: "filterType",
    type: 'ColumnFilterType ("text" | "number" | "select" | "multi-select" | "date" | "boolean")',
    defaultValue: '"text"',
    description: "Built-in filter input control type.",
  },
  {
    name: "filterMatchMode",
    type: "FilterMatchMode",
    defaultValue: "Depends on filterType",
    description: "Default match mode for this column.",
  },
  {
    name: "filterMatchModes",
    type: "FilterMatchMode[]",
    defaultValue: "undefined",
    description: "Available match modes shown in menu filter popover.",
  },
  {
    name: "filterPlaceholder",
    type: "string",
    defaultValue: "undefined",
    description: "Placeholder text for the column filter input.",
  },
  {
    name: "filterOptions",
    type: "FilterOption[]",
    defaultValue: "undefined",
    description: "Options for select / multi-select filter types.",
  },
  {
    name: "filterElement",
    type: "(context: ColumnFilterContext<TData, TValue>) => React.ReactNode",
    defaultValue: "undefined",
    description: "Custom filter UI renderer.",
  },
  {
    name: "editable",
    type: "boolean | ((data: TData, rowIndex: number) => boolean)",
    defaultValue: "false",
    description: "Enable inline cell/row editing for this column.",
  },
  {
    name: "editor",
    type: "(context: ColumnEditorContext<TData, TValue>) => React.ReactNode",
    defaultValue: "undefined",
    description: "Custom inline editor renderer.",
  },
  {
    name: "onCellEditValidate",
    type: "(newValue: TValue, oldValue: TValue, data: TData) => boolean | string",
    defaultValue: "undefined",
    description: "Validation callback before committing cell edit. Return false or error string to reject.",
  },
  {
    name: "frozen",
    type: "boolean",
    defaultValue: "false",
    description: "Pin/freeze column to left or right edge.",
  },
  {
    name: "alignFrozen",
    type: '"left" | "right"',
    defaultValue: '"left"',
    description: "Edge to freeze the column to when frozen is true.",
  },
  {
    name: "resizable",
    type: "boolean",
    defaultValue: "Inherits resizableColumns",
    description: "Allow resizing this column.",
  },
  {
    name: "reorderable",
    type: "boolean",
    defaultValue: "Inherits reorderableColumns",
    description: "Allow reordering this column.",
  },
  {
    name: "hidden",
    type: "boolean",
    defaultValue: "false",
    description: "Initial hidden state.",
  },
  {
    name: "exportable",
    type: "boolean",
    defaultValue: "true",
    description: "Include or exclude column from CSV/JSON export.",
  },
  {
    name: "align",
    type: '"left" | "center" | "right"',
    defaultValue: '"left"',
    description: "Horizontal text alignment.",
  },
  {
    name: "width / minWidth / maxWidth",
    type: "number | string / number / number",
    defaultValue: "undefined",
    description: "Initial, minimum, and maximum column width constraints.",
  },
  {
    name: "className / headerClassName / footerClassName",
    type: "string",
    defaultValue: "undefined",
    description: "CSS classes for header, footer, or both header and body cells.",
  },
  {
    name: "bodyClassName",
    type: "string | ((data: TData, rowIndex: number) => string)",
    defaultValue: "undefined",
    description: "Static or dynamic CSS class applied to body cells.",
  },
  {
    name: "meta",
    type: "Record<string, unknown>",
    defaultValue: "undefined",
    description: "Arbitrary metadata passed through to TanStack columnDef.meta.",
  },
]

const FILTER_MATCH_MODES: FilterModeDoc[] = [
  { mode: "contains", label: "Contains", appliesTo: "text", behavior: "Case-insensitive substring match." },
  { mode: "notContains", label: "Does not contain", appliesTo: "text", behavior: "Negated case-insensitive substring match." },
  { mode: "startsWith", label: "Starts with", appliesTo: "text", behavior: "Case-insensitive prefix match." },
  { mode: "endsWith", label: "Ends with", appliesTo: "text", behavior: "Case-insensitive suffix match." },
  { mode: "equals", label: "Equals", appliesTo: "text, number, select, boolean", behavior: "Equality check (case-insensitive for strings)." },
  { mode: "notEquals", label: "Not equals", appliesTo: "text, number, select, boolean", behavior: "Negated equality check." },
  { mode: "gt", label: "Greater than", appliesTo: "number, date", behavior: "Numeric or timestamp > comparison." },
  { mode: "gte", label: "Greater than or equal", appliesTo: "number, date", behavior: "Numeric or timestamp >= comparison." },
  { mode: "lt", label: "Less than", appliesTo: "number, date", behavior: "Numeric or timestamp < comparison." },
  { mode: "lte", label: "Less than or equal", appliesTo: "number, date", behavior: "Numeric or timestamp <= comparison." },
  { mode: "between", label: "Between", appliesTo: "number, date", behavior: "Inclusive [min, max] range comparison." },
  { mode: "in", label: "In", appliesTo: "multi-select", behavior: "Matches if cell value equals any item in filter array." },
  { mode: "notIn", label: "Not in", appliesTo: "multi-select", behavior: "Matches if cell value equals none of the items in array." },
  { mode: "dateIs", label: "Date is", appliesTo: "date", behavior: "Same calendar day (local start-of-day comparison)." },
  { mode: "dateBefore", label: "Date before", appliesTo: "date", behavior: "Calendar day strictly before filter date." },
  { mode: "dateAfter", label: "Date after", appliesTo: "date", behavior: "Calendar day strictly after filter date." },
]

const KEYBOARD_SHORTCUTS: KeyboardShortcutDoc[] = [
  {
    keys: "Tab / Shift + Tab",
    context: "Grid & Toolbar",
    behavior: "Move focus sequentially across toolbar inputs, sortable column headers, checkboxes, row actions, and pagination buttons.",
  },
  {
    keys: "ArrowUp / ArrowDown",
    context: "Grid Rows & Cells",
    behavior: "Move focus vertically to the previous or next row (maintaining column position during 2D cell navigation).",
  },
  {
    keys: "ArrowLeft / ArrowRight",
    context: "Grid Cells (2D Navigation)",
    behavior: "Move focus horizontally across cells within the current row.",
  },
  {
    keys: "Home / End",
    context: "Grid Rows & Cells",
    behavior: "Jump focus to the first or last visible row (or cell).",
  },
  {
    keys: "ArrowLeft / ArrowRight",
    context: "Column Resize Handle",
    behavior: "Adjust column width incrementally via keyboard on role=\"separator\" when resizableColumns is enabled.",
  },
  {
    keys: "Alt + ArrowLeft / ArrowRight",
    context: "Column Header (reorderableColumns)",
    behavior: "Reorder the focused column left or right.",
  },
  {
    keys: "Alt + ArrowUp / ArrowDown",
    context: "Grid Row (reorderableRows)",
    behavior: "Reorder the focused row up or down.",
  },
  {
    keys: "Shift + Click",
    context: "Row Selection (multiple / checkbox)",
    behavior: "Select a contiguous range of rows between the last anchor row and the clicked row.",
  },
  {
    keys: "Enter / Space",
    context: "Sortable Column Header",
    behavior: "Cycle column sort direction (ascending → descending → unsorted when removableSort is enabled).",
  },
  {
    keys: "Enter",
    context: "Inline Cell / Row Editor",
    behavior: "Validate (onCellEditValidate) and commit the active cell or row edit.",
  },
  {
    keys: "Escape",
    context: "Inline Cell / Row Editor",
    behavior: "Cancel active edit, discard draft changes, and exit edit mode.",
  },
  {
    keys: "Space / Enter",
    context: "Selection Checkbox / Radio / Expander",
    behavior: "Toggle row selection, select-all header checkbox, or expand/collapse row detail & subheader group.",
  },
]

const PARITY_MATRIX: ParityRow[] = [
  {
    feature: "Data & Row Key",
    primeReact: "value, dataKey",
    shadcnDataTable: "data, dataKey",
    notes: "Supports property key or custom (row, index) => string.",
  },
  {
    feature: "Column Definition",
    primeReact: "<Column field header body />",
    shadcnDataTable: "DataTableColumn<TData>[]",
    notes: "Declarative typed array with full TanStack Table backing.",
  },
  {
    feature: "Density & Gridlines",
    primeReact: "size, stripedRows, showGridlines",
    shadcnDataTable: 'size ("sm"|"md"|"lg"), stripedRows, showGridlines, hoverableRows',
    notes: "Styled with Tailwind v4 semantic tokens.",
  },
  {
    feature: "Sorting",
    primeReact: "sortable, sortMode, removableSort",
    shadcnDataTable: "sortable, sortMode, removableSort, sorting, onSortingChange",
    notes: "Supports single and multi-column sorting.",
  },
  {
    feature: "Filtering",
    primeReact: 'filterDisplay="row"|"menu", globalFilter',
    shadcnDataTable: "filterDisplay, enableGlobalFilter, 16 FilterMatchModes",
    notes: "Includes text, number, select, multi-select, date, and boolean filters.",
  },
  {
    feature: "Pagination",
    primeReact: "paginator, rows, rowsPerPageOptions, paginatorPosition",
    shadcnDataTable: "paginator, rows, rowsPerPageOptions, paginatorPosition, pageIndex",
    notes: "Custom currentPageReportTemplate supported.",
  },
  {
    feature: "Lazy / Server-Side",
    primeReact: "lazy, totalRecords, onPage / onSort / onFilter",
    shadcnDataTable: "lazy, totalRecords, onLazyLoad",
    notes: "Unified DataTableLazyParams payload.",
  },
  {
    feature: "Selection",
    primeReact: "selectionMode, selection, onSelectionChange, metaKeySelection",
    shadcnDataTable: "selectionMode, selection, onSelectionChange, metaKeySelection, isRowSelectable",
    notes: "Supports single, multiple, checkbox, and radiobutton modes.",
  },
  {
    feature: "Row Expansion",
    primeReact: "expandedRows, onRowToggle, rowExpansionTemplate",
    shadcnDataTable: "expandableRows, expandedRows, onRowToggle, rowExpansionTemplate, allowRowExpansion",
    notes: "Imperative expandAll() / collapseAll() via DataTableRef.",
  },
  {
    feature: "Row Grouping",
    primeReact: 'rowGroupMode="subheader"|"rowspan", groupRowsBy',
    shadcnDataTable: "rowGroupMode, groupRowsBy, expandableRowGroups, rowGroupHeaderTemplate, rowGroupFooterTemplate",
    notes: "Automatic footer & group-footer aggregations.",
  },
  {
    feature: "Column Groups",
    primeReact: "<ColumnGroup> with <Row> and <Column>",
    shadcnDataTable: "headerColumnGroup, footerColumnGroup",
    notes: "Supports colSpan, rowSpan, align, and sortable group cells.",
  },
  {
    feature: "Frozen Columns & Rows",
    primeReact: "frozen, alignFrozen, frozenValue",
    shadcnDataTable: "column.frozen, column.alignFrozen, frozenValue",
    notes: "Sticky left/right column pinning and pinned top rows.",
  },
  {
    feature: "Resize & Reorder",
    primeReact: "resizableColumns, columnResizeMode, reorderableColumns, reorderableRows",
    shadcnDataTable: "resizableColumns, columnResizeMode, reorderableColumns, reorderableRows, onRowReorder",
    notes: "Drag-and-drop column and row reordering.",
  },
  {
    feature: "Inline Editing",
    primeReact: 'editMode="cell"|"row", editor, onCellEditComplete',
    shadcnDataTable: "editMode, column.editable, column.editor, onCellEditValidate, onCellEditComplete, onRowEditComplete",
    notes: "Keyboard Enter/Escape commit & cancel built in.",
  },
  {
    feature: "Virtual Scrolling",
    primeReact: "scrollable, scrollHeight, virtualScrollerOptions",
    shadcnDataTable: "scrollable, scrollHeight, virtualScrollerOptions",
    notes: "Powered by @tanstack/react-virtual with ref.scrollToIndex().",
  },
  {
    feature: "Context Menu & Export",
    primeReact: "contextMenuSelection, exportCSV",
    shadcnDataTable: "contextMenuItems, exportable, ref.exportCSV(), ref.exportJSON()",
    notes: "Built-in CSV and JSON export utilities.",
  },
  {
    feature: "State Persistence",
    primeReact: "stateStorage, stateKey",
    shadcnDataTable: 'stateStorage ("session"|"local"), stateKey, onStateChange',
    notes: "Persists sorting, filters, pagination, columns, selection, and expansion.",
  },
]

// ---------------------------------------------------------------------------
// Code Snippets
// ---------------------------------------------------------------------------

const SNIPPET_INSTALL_CSS = `// apps/web/src/main.tsx
import "@workspace/ui/globals.css"`

const SNIPPET_BASIC = `import { DataTable, type DataTableColumn } from "@workspace/ui/components/data-table"

interface User {
  id: string
  name: string
  email: string
  role: "admin" | "editor" | "viewer"
  status: "active" | "inactive"
}

const columns: DataTableColumn<User>[] = [
  { field: "name", header: "Name", sortable: true, filterable: true },
  { field: "email", header: "Email", sortable: true },
  {
    field: "role",
    header: "Role",
    filterable: true,
    filterType: "select",
    filterOptions: [
      { label: "Admin", value: "admin" },
      { label: "Editor", value: "editor" },
      { label: "Viewer", value: "viewer" },
    ],
  },
  {
    field: "status",
    header: "Status",
    body: (user) => <span className="capitalize">{user.status}</span>,
  },
]

export function UsersTable({ users }: { users: User[] }) {
  return (
    <DataTable
      data={users}
      columns={columns}
      dataKey="id"
      sortable
      paginator
      rows={10}
      enableGlobalFilter
      columnToggle
      exportable
    />
  )
}`

const SNIPPET_CUSTOM_RENDERERS = `const columns: DataTableColumn<Employee>[] = [
  {
    field: "name",
    header: "Employee",
    body: (row, { rowIndex }) => (
      <div className="flex items-center gap-2">
        <span className="font-medium">{row.name}</span>
        <span className="text-xs text-muted-foreground">#{rowIndex + 1}</span>
      </div>
    ),
    bodyClassName: (row) =>
      row.status === "On Leave" ? "bg-amber-500/10 text-amber-700 dark:text-amber-300" : "",
  },
  {
    field: "salary",
    header: "Salary",
    editable: true,
    editor: ({ value, onChange, onCommit, onCancel }) => (
      <input
        type="number"
        className="w-full rounded border bg-background px-2 py-1 text-xs"
        value={Number(value)}
        onChange={(e) => onChange(Number(e.target.value))}
        onKeyDown={(e) => {
          if (e.key === "Enter") onCommit()
          if (e.key === "Escape") onCancel()
        }}
        autoFocus
      />
    ),
  },
  {
    field: "department",
    header: "Department",
    filterable: true,
    filterElement: ({ value, onChange, onClear }) => (
      <div className="flex gap-1">
        <Input
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Custom filter..."
          className="h-7 text-xs"
        />
        {Boolean(value) && (
          <Button size="xs" variant="ghost" onClick={onClear}>Clear</Button>
        )}
      </div>
    ),
  },
]

<DataTable
  data={employees}
  columns={columns}
  dataKey="id"
  rowClassName={(row) => (row.archived ? "opacity-60" : "")}
  expandableRows
  rowExpansionTemplate={(row) => (
    <div className="p-3 text-sm">Details for {row.name}</div>
  )}
  rowGroupMode="subheader"
  groupRowsBy="department"
  rowGroupHeaderTemplate={(dept, rows) => (
    <span className="font-semibold">{String(dept)} ({rows.length})</span>
  )}
  rowGroupFooterTemplate={(_dept, rows) => (
    <span className="text-xs text-muted-foreground">Subtotal: {rows.length} members</span>
  )}
/>`

const SNIPPET_REF_API = `import * as React from "react"
import { DataTable, type DataTableRef } from "@workspace/ui/components/data-table"

export function ControlledActionsExample({ data, columns }: Props) {
  const tableRef = React.useRef<DataTableRef<Employee> | null>(null)

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={() => tableRef.current?.exportCSV({ filename: "employees" })}>
          Export CSV
        </Button>
        <Button size="sm" onClick={() => tableRef.current?.exportJSON({ selectionOnly: true })}>
          Export Selected JSON
        </Button>
        <Button size="sm" variant="outline" onClick={() => tableRef.current?.clearFilters()}>
          Clear Filters
        </Button>
        <Button size="sm" variant="outline" onClick={() => tableRef.current?.clearSorting()}>
          Clear Sorting
        </Button>
        <Button size="sm" variant="outline" onClick={() => tableRef.current?.clearSelection()}>
          Clear Selection
        </Button>
        <Button size="sm" variant="outline" onClick={() => tableRef.current?.expandAll()}>
          Expand All
        </Button>
        <Button size="sm" variant="outline" onClick={() => tableRef.current?.collapseAll()}>
          Collapse All
        </Button>
        <Button size="sm" variant="outline" onClick={() => tableRef.current?.scrollToIndex(500)}>
          Scroll to #500
        </Button>
        <Button size="sm" variant="destructive" onClick={() => tableRef.current?.reset()}>
          Reset All
        </Button>
      </div>

      <DataTable
        ref={tableRef}
        data={data}
        columns={columns}
        dataKey="id"
        sortable
        paginator
        expandableRows
        selectionMode="checkbox"
        scrollable
        scrollHeight={420}
      />
    </div>
  )
}`

const SNIPPET_USE_DATA_TABLE = `import * as React from "react"
import { useDataTable, type DataTableProps } from "@workspace/ui/components/data-table"

export function CustomHeadlessTable<TData extends Record<string, unknown>>(
  props: DataTableProps<TData>
) {
  const scrollRef = React.useRef<HTMLDivElement | null>(null)
  const { table, state, setters, actions, activeFilterCount } = useDataTable(
    props,
    scrollRef
  )

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Active filters: {activeFilterCount}</span>
        <span>Page {state.pagination.pageIndex + 1}</span>
        <button type="button" onClick={() => actions.reset()}>
          Reset ({table.getRowModel().rows.length} rows)
        </button>
      </div>
      {/* Render custom markup using \`table\` and \`setters\` */}
    </div>
  )
}`

const SNIPPET_AGGREGATION = `const columns: DataTableColumn<Invoice>[] = [
  {
    field: "amount",
    header: "Amount",
    align: "right",
    aggregation: "sum",
    aggregationFormatter: (val) =>
      val !== null ? \`Total: $\${val.toLocaleString()}\` : "—",
  },
  {
    field: "margin",
    header: "Avg Margin",
    align: "right",
    aggregation: "avg",
    aggregationFormatter: (val) => (val !== null ? \`\${val.toFixed(1)}%\` : "—"),
  },
  {
    field: "status",
    header: "Paid Count",
    aggregation: (rows) =>
      \`\${rows.filter((r) => r.original.status === "paid").length} paid\`,
  },
]`

const SNIPPET_A11Y = `import { DataTable, MESSAGES_IT, type DataTableMessages } from "@workspace/ui/components/data-table"

const customMessages: Partial<DataTableMessages> = {
  ...MESSAGES_IT,
  emptyMessage: "Nessun dipendente trovato.",
}

<DataTable
  data={employees}
  columns={columns}
  dataKey="id"
  ariaLabel="Employee directory"
  caption="Q4 active engineering roster"
  locale="it"
  messages={customMessages}
  loading={isLoading}
  sortable
  paginator
/>`

const SNIPPET_E2E_COMMAND = `npm run build --workspace=web
npm run test:e2e --workspace=web`

// ---------------------------------------------------------------------------
// Helper Components
// ---------------------------------------------------------------------------

interface CodeBlockProps {
  code: string
  language?: string
  title?: string
}

function CodeBlock({ code, language = "tsx", title }: CodeBlockProps) {
  const [copied, setCopied] = React.useState(false)
  const timerRef = React.useRef<number | null>(null)

  React.useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current)
      }
    }
  }, [])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current)
      }
      timerRef.current = window.setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard API may be unavailable in restricted contexts
    }
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-zinc-950 text-zinc-100">
      <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/80 px-3.5 py-2">
        <div className="flex items-center gap-2">
          {title && (
            <span className="font-mono text-xs font-medium text-zinc-300">
              {title}
            </span>
          )}
          <Badge
            variant="secondary"
            className="bg-zinc-800 font-mono text-[10px] text-zinc-300 hover:bg-zinc-800"
          >
            {language}
          </Badge>
        </div>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={handleCopy}
          aria-label={copied ? "Copied to clipboard" : "Copy code snippet"}
          className="h-7 gap-1.5 px-2.5 text-xs text-zinc-300 hover:bg-zinc-800 hover:text-white"
        >
          {copied ? (
            <>
              <Check className="size-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="size-3.5" />
              <span>Copy</span>
            </>
          )}
        </Button>
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-xs leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  )
}

function SectionHeader({
  icon,
  title,
  description,
  badge,
}: {
  icon: React.ReactNode
  title: string
  description: string
  badge?: string
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="flex size-8 items-center justify-center rounded-md border bg-muted/60 text-foreground">
          {icon}
        </div>
        <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
        {badge && (
          <Badge variant="secondary" className="font-mono text-[11px]">
            {badge}
          </Badge>
        )}
      </div>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main DocsCenter Component
// ---------------------------------------------------------------------------

/**
 * Interactive Documentation & API Reference Portal for `@workspace/ui/components/data-table`.
 */
export function DocsCenter() {
  const [navSearch, setNavSearch] = React.useState("")
  const [activeSection, setActiveSection] = React.useState<DocSectionId | "all">("all")
  const [propSearch, setPropSearch] = React.useState("")
  const [propCategoryFilter, setPropCategoryFilter] = React.useState<string>("all")

  const normalizedNav = navSearch.trim().toLowerCase()

  const visibleSections = React.useMemo(() => {
    return DOC_SECTIONS.filter((sec) => {
      if (!normalizedNav) return true
      return (
        sec.title.toLowerCase().includes(normalizedNav) ||
        sec.description.toLowerCase().includes(normalizedNav) ||
        sec.keywords.some((kw) => kw.toLowerCase().includes(normalizedNav))
      )
    })
  }, [normalizedNav])

  const shouldRenderSection = (id: DocSectionId): boolean => {
    const matchesNav = visibleSections.some((s) => s.id === id)
    if (!matchesNav) return false
    return activeSection === "all" || activeSection === id
  }

  const normalizedPropSearch = propSearch.trim().toLowerCase()

  const filteredPropCategories = React.useMemo(() => {
    return PROP_CATEGORIES.filter(
      (cat) => propCategoryFilter === "all" || cat.id === propCategoryFilter
    )
      .map((cat) => ({
        ...cat,
        props: cat.props.filter((p) => {
          if (!normalizedPropSearch) return true
          return (
            p.name.toLowerCase().includes(normalizedPropSearch) ||
            p.type.toLowerCase().includes(normalizedPropSearch) ||
            p.description.toLowerCase().includes(normalizedPropSearch) ||
            cat.title.toLowerCase().includes(normalizedPropSearch)
          )
        }),
      }))
      .filter((cat) => cat.props.length > 0)
  }, [propCategoryFilter, normalizedPropSearch])

  const totalPropsCount = React.useMemo(
    () => PROP_CATEGORIES.reduce((acc, cat) => acc + cat.props.length, 0),
    []
  )

  const filteredPropsCount = React.useMemo(
    () => filteredPropCategories.reduce((acc, cat) => acc + cat.props.length, 0),
    [filteredPropCategories]
  )

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      {/* Searchable Documentation Sidebar */}
      <aside className="w-full shrink-0 lg:w-64">
        <div className="space-y-3 rounded-xl border bg-card p-3 lg:sticky lg:top-20">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={navSearch}
              onChange={(e) => setNavSearch(e.target.value)}
              placeholder="Filter topics..."
              aria-label="Filter documentation topics"
              className="h-8 pr-7 pl-8 text-xs"
            />
            {navSearch && (
              <button
                type="button"
                onClick={() => setNavSearch("")}
                aria-label="Clear topic filter"
                className="absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          <nav aria-label="Documentation sections" className="space-y-1">
            <button
              type="button"
              onClick={() => setActiveSection("all")}
              className={`flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-left text-xs font-medium transition-colors ${
                activeSection === "all"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <span>All Topics</span>
              <Badge
                variant={activeSection === "all" ? "secondary" : "outline"}
                className="h-4 px-1.5 font-mono text-[10px]"
              >
                {visibleSections.length}
              </Badge>
            </button>

            <Separator className="my-1.5" />

            {visibleSections.length === 0 ? (
              <p className="px-2 py-3 text-center text-xs text-muted-foreground">
                No topics match &ldquo;{navSearch}&rdquo;
              </p>
            ) : (
              visibleSections.map((sec) => {
                const isActive = activeSection === sec.id
                return (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => setActiveSection(sec.id)}
                    className={`flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-xs font-medium transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <span className="shrink-0">{sec.icon}</span>
                    <span className="truncate">{sec.shortTitle}</span>
                  </button>
                )
              })
            )}
          </nav>
        </div>
      </aside>

      {/* Main Documentation Content */}
      <div className="min-w-0 flex-1 space-y-10">
        {visibleSections.length === 0 && (
          <div className="rounded-xl border border-dashed p-10 text-center">
            <p className="text-sm font-medium">No documentation topics matched your search.</p>
            <Button
              size="sm"
              variant="outline"
              className="mt-3"
              onClick={() => {
                setNavSearch("")
                setActiveSection("all")
              }}
            >
              Reset Filter
            </Button>
          </div>
        )}

        {/* 1. Getting Started & Installation */}
        {shouldRenderSection("getting-started") && (
          <section id="getting-started" className="space-y-4">
            <SectionHeader
              icon={<BookOpen className="size-4" />}
              title="Getting Started & Installation"
              description="Import DataTable from @workspace/ui/components/data-table, include the Tailwind CSS v4 globals stylesheet, and render your first interactive table."
              badge="Quick Start"
            />

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border bg-card p-4">
                <h4 className="text-sm font-semibold">1. Monorepo Package Import</h4>
                <p className="mt-1 text-xs text-muted-foreground">
                  The component, headless hook, subcomponents, and TypeScript types are exported from{" "}
                  <code className="rounded bg-muted px-1 py-0.5 font-mono text-[11px]">
                    @workspace/ui/components/data-table
                  </code>
                  .
                </p>
              </div>
              <div className="rounded-lg border bg-card p-4">
                <h4 className="text-sm font-semibold">2. Tailwind CSS v4 Stylesheet</h4>
                <p className="mt-1 text-xs text-muted-foreground">
                  Ensure{" "}
                  <code className="rounded bg-muted px-1 py-0.5 font-mono text-[11px]">
                    @workspace/ui/globals.css
                  </code>{" "}
                  is imported once in your application entry point so semantic theme tokens apply.
                </p>
              </div>
            </div>

            <CodeBlock
              title="Entry Stylesheet Setup"
              language="tsx"
              code={SNIPPET_INSTALL_CSS}
            />

            <CodeBlock
              title="Basic DataTable Example"
              language="tsx"
              code={SNIPPET_BASIC}
            />
          </section>
        )}

        {/* 2. Architecture & Customization */}
        {shouldRenderSection("architecture") && (
          <>
            <Separator />
            <section id="architecture" className="space-y-4">
              <SectionHeader
                icon={<Layers className="size-4" />}
                title="Architecture & Customization"
                description="Layered architecture built on TanStack Table v9, TanStack Virtual, Base UI primitives, and Tailwind CSS v4 tokens."
                badge="Architecture"
              />

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  {
                    name: "DataTable",
                    role: "Main component orchestrating toolbar, table grid, and paginator.",
                  },
                  {
                    name: "useDataTable",
                    role: "Headless hook managing TanStack Table state, persistence, lazy mode, and imperative actions.",
                  },
                  {
                    name: "DataTableToolbar",
                    role: "Global search input, column visibility popover, and CSV/JSON export menu.",
                  },
                  {
                    name: "DataTableHeader",
                    role: "Multi-row grouped headers, sort indicators, resize handles, drag-reorder, and row/menu filters.",
                  },
                  {
                    name: "DataTableBody",
                    role: "Frozen rows, virtualized or standard rows, subheader/rowspan grouping, inline editors, and expansion panels.",
                  },
                  {
                    name: "DataTableFooter & Pagination",
                    role: "Grouped footers, automatic aggregations, page size selector, and page navigation.",
                  },
                ].map((item) => (
                  <div key={item.name} className="rounded-lg border bg-card p-3.5">
                    <div className="font-mono text-xs font-semibold text-primary">
                      {item.name}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{item.role}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-lg border bg-muted/30 p-4 text-xs leading-relaxed">
                <span className="font-semibold">Theming with Tailwind CSS v4 Tokens: </span>
                DataTable styles rely exclusively on semantic tokens (
                <code className="font-mono">--background</code>,{" "}
                <code className="font-mono">--foreground</code>,{" "}
                <code className="font-mono">--muted</code>,{" "}
                <code className="font-mono">--border</code>,{" "}
                <code className="font-mono">--primary</code>,{" "}
                <code className="font-mono">--ring</code>,{" "}
                <code className="font-mono">--destructive</code>). Override these CSS variables in{" "}
                <code className="font-mono">globals.css</code> or scope them per container to customize light/dark themes without editing component code.
              </div>

              <CodeBlock
                title="Custom Renderers & Dynamic Row/Cell Styling"
                language="tsx"
                code={SNIPPET_CUSTOM_RENDERERS}
              />
            </section>
          </>
        )}

        {/* 3. Complete Props Reference (DataTableProps) */}
        {shouldRenderSection("props-reference") && (
          <>
            <Separator />
            <section id="props-reference" className="space-y-4">
              <SectionHeader
                icon={<ListFilter className="size-4" />}
                title="Complete Props Reference (DataTableProps)"
                description="All DataTableProps grouped by feature category. Filter by prop name, type, or description."
                badge={`${filteredPropsCount} / ${totalPropsCount} Props`}
              />

              {/* Filter Bar */}
              <div className="space-y-3 rounded-lg border bg-card p-3.5">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <div className="relative flex-1">
                    <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={propSearch}
                      onChange={(e) => setPropSearch(e.target.value)}
                      placeholder="Search props by name, type, or description (e.g. lazy, virtual, ariaLabel)..."
                      aria-label="Search DataTableProps"
                      className="h-8 pr-7 pl-8 text-xs"
                    />
                    {propSearch && (
                      <button
                        type="button"
                        onClick={() => setPropSearch("")}
                        aria-label="Clear prop search"
                        className="absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        <X className="size-3.5" />
                      </button>
                    )}
                  </div>
                  {(propSearch || propCategoryFilter !== "all") && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 text-xs"
                      onClick={() => {
                        setPropSearch("")
                        setPropCategoryFilter("all")
                      }}
                    >
                      Reset Filters
                    </Button>
                  )}
                </div>

                <div className="flex flex-wrap gap-1.5">
                  <Button
                    size="sm"
                    variant={propCategoryFilter === "all" ? "default" : "outline"}
                    className="h-6 px-2 text-[11px]"
                    onClick={() => setPropCategoryFilter("all")}
                  >
                    All Categories
                  </Button>
                  {PROP_CATEGORIES.map((cat) => (
                    <Button
                      key={cat.id}
                      size="sm"
                      variant={propCategoryFilter === cat.id ? "default" : "outline"}
                      className="h-6 px-2 text-[11px]"
                      onClick={() => setPropCategoryFilter(cat.id)}
                    >
                      {cat.title}
                    </Button>
                  ))}
                </div>
              </div>

              {filteredPropCategories.length === 0 ? (
                <div className="rounded-lg border border-dashed p-8 text-center text-xs text-muted-foreground">
                  No props matched &ldquo;{propSearch}&rdquo;.
                </div>
              ) : (
                <div className="space-y-6">
                  {filteredPropCategories.map((cat) => (
                    <div key={cat.id} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold">{cat.title}</h4>
                        <Badge variant="outline" className="font-mono text-[10px]">
                          {cat.props.length}
                        </Badge>
                      </div>
                      <div className="overflow-x-auto rounded-lg border">
                        <table className="w-full border-collapse text-left text-xs">
                          <thead>
                            <tr className="border-b bg-muted/50 text-muted-foreground">
                              <th className="px-3 py-2 font-medium">Prop</th>
                              <th className="px-3 py-2 font-medium">Type</th>
                              <th className="px-3 py-2 font-medium">Default</th>
                              <th className="px-3 py-2 font-medium">Description</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y">
                            {cat.props.map((prop) => (
                              <tr key={prop.name} className="hover:bg-muted/30">
                                <td className="px-3 py-2 align-top font-mono font-medium whitespace-nowrap text-foreground">
                                  {prop.name}
                                  {prop.required && (
                                    <Badge
                                      variant="destructive"
                                      className="ml-1.5 px-1 py-0 text-[9px]"
                                    >
                                      required
                                    </Badge>
                                  )}
                                </td>
                                <td className="px-3 py-2 align-top font-mono text-[11px] text-primary">
                                  {prop.type}
                                </td>
                                <td className="px-3 py-2 align-top font-mono text-[11px] whitespace-nowrap text-muted-foreground">
                                  {prop.defaultValue}
                                </td>
                                <td className="px-3 py-2 align-top text-muted-foreground">
                                  {prop.description}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}

        {/* 4. Column Definition (DataTableColumn) & Contexts */}
        {shouldRenderSection("column-contexts") && (
          <>
            <Separator />
            <section id="column-contexts" className="space-y-5">
              <SectionHeader
                icon={<Columns3 className="size-4" />}
                title="Column Definition (DataTableColumn) & Contexts"
                description="Column configuration schema, typed render contexts passed to body/editor/filterElement, and ColumnGroupRow for multi-row headers/footers."
                badge="DataTableColumn"
              />

              <div className="overflow-x-auto rounded-lg border">
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="border-b bg-muted/50 text-muted-foreground">
                      <th className="px-3 py-2 font-medium">Property</th>
                      <th className="px-3 py-2 font-medium">Type</th>
                      <th className="px-3 py-2 font-medium">Default</th>
                      <th className="px-3 py-2 font-medium">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {COLUMN_PROPS.map((col) => (
                      <tr key={col.name} className="hover:bg-muted/30">
                        <td className="px-3 py-2 align-top font-mono font-medium whitespace-nowrap">
                          {col.name}
                        </td>
                        <td className="px-3 py-2 align-top font-mono text-[11px] text-primary">
                          {col.type}
                        </td>
                        <td className="px-3 py-2 align-top font-mono text-[11px] whitespace-nowrap text-muted-foreground">
                          {col.defaultValue}
                        </td>
                        <td className="px-3 py-2 align-top text-muted-foreground">
                          {col.description}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border bg-card p-4">
                  <h4 className="font-mono text-xs font-semibold text-primary">
                    ColumnBodyContext&lt;TData, TValue&gt;
                  </h4>
                  <ul className="mt-2 space-y-1 font-mono text-[11px] text-muted-foreground">
                    <li><span className="text-foreground">row</span>: LegacyRow&lt;TData&gt;</li>
                    <li><span className="text-foreground">data</span>: TData</li>
                    <li><span className="text-foreground">value</span>: TValue</li>
                    <li><span className="text-foreground">rowIndex</span>: number</li>
                    <li><span className="text-foreground">column</span>: DataTableColumn&lt;TData, TValue&gt;</li>
                    <li><span className="text-foreground">table</span>: LegacyReactTable&lt;TData&gt;</li>
                  </ul>
                </div>

                <div className="rounded-lg border bg-card p-4">
                  <h4 className="font-mono text-xs font-semibold text-primary">
                    ColumnEditorContext&lt;TData, TValue&gt;
                  </h4>
                  <ul className="mt-2 space-y-1 font-mono text-[11px] text-muted-foreground">
                    <li><span className="text-foreground">value</span>: TValue</li>
                    <li><span className="text-foreground">row / data / rowIndex / column</span></li>
                    <li><span className="text-foreground">onChange</span>: (newValue: TValue) =&gt; void</li>
                    <li><span className="text-foreground">onCommit</span>: () =&gt; void</li>
                    <li><span className="text-foreground">onCancel</span>: () =&gt; void</li>
                  </ul>
                </div>

                <div className="rounded-lg border bg-card p-4">
                  <h4 className="font-mono text-xs font-semibold text-primary">
                    ColumnFilterContext&lt;TData, TValue&gt;
                  </h4>
                  <ul className="mt-2 space-y-1 font-mono text-[11px] text-muted-foreground">
                    <li><span className="text-foreground">value</span>: unknown</li>
                    <li><span className="text-foreground">matchMode</span>: FilterMatchMode</li>
                    <li><span className="text-foreground">onChange</span>: (value: unknown, matchMode?: FilterMatchMode) =&gt; void</li>
                    <li><span className="text-foreground">onClear</span>: () =&gt; void</li>
                    <li><span className="text-foreground">column / table</span></li>
                  </ul>
                </div>

                <div className="rounded-lg border bg-card p-4">
                  <h4 className="font-mono text-xs font-semibold text-primary">
                    ColumnGroupRow &amp; ColumnGroupCell
                  </h4>
                  <ul className="mt-2 space-y-1 font-mono text-[11px] text-muted-foreground">
                    <li><span className="text-foreground">ColumnGroupRow</span>: &#123; cells: ColumnGroupCell[]; className?: string &#125;</li>
                    <li><span className="text-foreground">ColumnGroupCell</span>: &#123; header?, footer?, colSpan?, rowSpan?, className?, align?, sortable?, field? &#125;</li>
                  </ul>
                </div>
              </div>
            </section>
          </>
        )}

        {/* 5. Imperative API (DataTableRef) & useDataTable Hook */}
        {shouldRenderSection("imperative-hook") && (
          <>
            <Separator />
            <section id="imperative-hook" className="space-y-4">
              <SectionHeader
                icon={<Terminal className="size-4" />}
                title="Imperative API (DataTableRef) & useDataTable Hook"
                description="Invoke imperative actions via React ref or build completely custom table layouts with the headless useDataTable hook."
                badge="Imperative & Headless"
              />

              <div className="overflow-x-auto rounded-lg border">
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="border-b bg-muted/50 text-muted-foreground">
                      <th className="px-3 py-2 font-medium">Method</th>
                      <th className="px-3 py-2 font-medium">Signature</th>
                      <th className="px-3 py-2 font-medium">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {[
                      ["exportCSV", "(options?: { selectionOnly?: boolean; filename?: string; sanitizeFormulas?: boolean }) => string", "Export current or selected rows to CSV with formula-injection protection (sanitizeFormulas=true by default) and trigger browser download."],
                      ["exportJSON", "(options?: { selectionOnly?: boolean; filename?: string }) => string", "Export current or selected rows to pretty-printed JSON."],
                      ["reset", "() => void", "Reset sorting, filters, pagination, selection, and expansion to defaults."],
                      ["clearFilters", "() => void", "Clear all column filters and global filter."],
                      ["clearSorting", "() => void", "Clear all sorting."],
                      ["clearSelection", "() => void", "Clear row selection."],
                      ["expandAll", "() => void", "Expand all expandable rows."],
                      ["collapseAll", "() => void", "Collapse all expanded rows."],
                      ["scrollToIndex", "(index: number) => void", "Scroll to a specific row index (scrollable or virtualized)."],
                      ["getTable", "() => LegacyReactTable<TData>", "Access the underlying TanStack Table instance."],
                    ].map(([method, sig, desc]) => (
                      <tr key={method} className="hover:bg-muted/30">
                        <td className="px-3 py-2 font-mono font-medium whitespace-nowrap">{method}</td>
                        <td className="px-3 py-2 font-mono text-[11px] text-primary">{sig}</td>
                        <td className="px-3 py-2 text-muted-foreground">{desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="rounded-lg border bg-muted/30 p-4 text-xs leading-relaxed">
                <span className="font-semibold">CSV Formula Injection Protection (<code className="font-mono">sanitizeFormulas</code>): </span>
                Both <code className="font-mono">exportToCSV</code> and{" "}
                <code className="font-mono">tableRef.current?.exportCSV()</code> protect against spreadsheet formula injection by default (<code className="font-mono">sanitizeFormulas: true</code>), prefixing values starting with{" "}
                <code className="font-mono">=</code>, <code className="font-mono">+</code>,{" "}
                <code className="font-mono">-</code>, <code className="font-mono">@</code>,{" "}
                <code className="font-mono">\t</code>, or <code className="font-mono">\r</code> with a single quote (<code className="font-mono">&apos;</code>). Pass{" "}
                <code className="font-mono">&#123; sanitizeFormulas: false &#125;</code> to opt out when raw formula strings are explicitly required.
              </div>

              <CodeBlock
                title="Using DataTableRef Imperative Methods"
                language="tsx"
                code={SNIPPET_REF_API}
              />

              <CodeBlock
                title="Headless Composition with useDataTable"
                language="tsx"
                code={SNIPPET_USE_DATA_TABLE}
              />
            </section>
          </>
        )}

        {/* 6. Filter Match Modes & Aggregations */}
        {shouldRenderSection("filters-aggregations") && (
          <>
            <Separator />
            <section id="filters-aggregations" className="space-y-4">
              <SectionHeader
                icon={<Filter className="size-4" />}
                title="Filter Match Modes & Aggregations"
                description="All 16 PrimeReact-compatible FilterMatchMode values and built-in/custom AggregationType reducers."
                badge="16 Match Modes"
              />

              <div className="overflow-x-auto rounded-lg border">
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="border-b bg-muted/50 text-muted-foreground">
                      <th className="px-3 py-2 font-medium">Match Mode</th>
                      <th className="px-3 py-2 font-medium">Label</th>
                      <th className="px-3 py-2 font-medium">Typical Types</th>
                      <th className="px-3 py-2 font-medium">Behavior</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {FILTER_MATCH_MODES.map((fm) => (
                      <tr key={fm.mode} className="hover:bg-muted/30">
                        <td className="px-3 py-2 font-mono font-medium whitespace-nowrap text-primary">
                          &quot;{fm.mode}&quot;
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">{fm.label}</td>
                        <td className="px-3 py-2 font-mono text-[11px] text-muted-foreground">
                          {fm.appliesTo}
                        </td>
                        <td className="px-3 py-2 text-muted-foreground">{fm.behavior}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  { name: '"sum"', desc: "Sum of finite numeric values in the column." },
                  { name: '"avg"', desc: "Arithmetic mean of finite numeric values." },
                  { name: '"min"', desc: "Minimum finite numeric value." },
                  { name: '"max"', desc: "Maximum finite numeric value." },
                  { name: '"count"', desc: "Total row count (rows.length)." },
                  { name: "(rows, columnId) => ReactNode", desc: "Custom reducer function for arbitrary calculations." },
                ].map((agg) => (
                  <div key={agg.name} className="rounded-lg border bg-card p-3">
                    <div className="font-mono text-xs font-semibold text-primary">{agg.name}</div>
                    <p className="mt-1 text-xs text-muted-foreground">{agg.desc}</p>
                  </div>
                ))}
              </div>

              <CodeBlock
                title="Built-in & Custom Aggregations"
                language="tsx"
                code={SNIPPET_AGGREGATION}
              />
            </section>
          </>
        )}

        {/* 7. Accessibility (WCAG 2.2) & Keyboard Shortcuts */}
        {shouldRenderSection("accessibility") && (
          <>
            <Separator />
            <section id="accessibility" className="space-y-4">
              <SectionHeader
                icon={<Accessibility className="size-4" />}
                title="Accessibility (WCAG 2.2) & Keyboard Shortcuts"
                description="Semantic ARIA grid contract, screen reader announcements, validation states, and keyboard bindings."
                badge="WCAG 2.2"
              />

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border bg-card p-4">
                  <h4 className="text-sm font-semibold">ARIA Grid Contract</h4>
                  <ul className="mt-2 space-y-1.5 text-xs text-muted-foreground">
                    <li>
                      <code className="font-mono text-foreground">role=&quot;grid&quot;</code> on{" "}
                      <code className="font-mono">&lt;table&gt;</code> with{" "}
                      <code className="font-mono">aria-label</code> /{" "}
                      <code className="font-mono">aria-labelledby</code> and{" "}
                      <code className="font-mono">aria-busy</code> during loading.
                    </li>
                    <li>
                      <code className="font-mono text-foreground">aria-sort</code> on sortable{" "}
                      <code className="font-mono">&lt;th&gt;</code> headers and{" "}
                      <code className="font-mono">role=&quot;separator&quot;</code> on resize handles.
                    </li>
                    <li>
                      <code className="font-mono text-foreground">aria-selected</code> on rows,{" "}
                      <code className="font-mono">aria-expanded</code> on row expanders and group headers, and{" "}
                      <code className="font-mono">aria-invalid</code> on invalid inline cell editors.
                    </li>
                    <li>
                      <code className="font-mono text-foreground">aria-current=&quot;page&quot;</code> on active pagination button.
                    </li>
                  </ul>
                </div>

                <div className="rounded-lg border bg-card p-4">
                  <h4 className="flex items-center gap-1.5 text-sm font-semibold">
                    <Keyboard className="size-4" />
                    Focus &amp; Contrast
                  </h4>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                    Interactive sort headers, checkboxes, radio buttons, pagination controls, and toolbar actions use visible{" "}
                    <code className="font-mono">focus-visible:ring-2 focus-visible:ring-ring</code> outlines and WCAG-compliant semantic contrast tokens across light and dark modes.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto rounded-lg border">
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="border-b bg-muted/50 text-muted-foreground">
                      <th className="px-3 py-2 font-medium">Shortcut</th>
                      <th className="px-3 py-2 font-medium">Context</th>
                      <th className="px-3 py-2 font-medium">Behavior</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {KEYBOARD_SHORTCUTS.map((kb) => (
                      <tr key={`${kb.keys}-${kb.context}`} className="hover:bg-muted/30">
                        <td className="px-3 py-2 font-mono font-medium whitespace-nowrap">
                          <kbd className="rounded border bg-muted px-1.5 py-0.5 text-[11px]">
                            {kb.keys}
                          </kbd>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-primary">{kb.context}</td>
                        <td className="px-3 py-2 text-muted-foreground">{kb.behavior}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <CodeBlock
                title="Accessible & Localized DataTable Configuration (locale + messages)"
                language="tsx"
                code={SNIPPET_A11Y}
              />

              <div className="rounded-lg border bg-muted/30 p-4 text-xs leading-relaxed">
                <span className="font-semibold">Localization &amp; Real-Browser WCAG 2.2 Verification: </span>
                Use <code className="font-mono">locale</code> (<code className="font-mono">&quot;en&quot;</code> | <code className="font-mono">&quot;it&quot;</code>) and{" "}
                <code className="font-mono">messages</code> (<code className="font-mono">Partial&lt;DataTableMessages&gt;</code>) with exported{" "}
                <code className="font-mono">DEFAULT_MESSAGES_EN</code> and <code className="font-mono">MESSAGES_IT</code> dictionaries. Automated real-browser WCAG 2.2 AA audits run via Playwright +{" "}
                <code className="font-mono">@axe-core/playwright</code> across desktop, tablet, and mobile viewports:
              </div>

              <CodeBlock
                title="Run Playwright + @axe-core/playwright E2E & WCAG 2.2 Suite"
                language="bash"
                code={SNIPPET_E2E_COMMAND}
              />
            </section>
          </>
        )}

        {/* 8. PrimeReact Migration & Feature Parity Matrix */}
        {shouldRenderSection("migration-parity") && (
          <>
            <Separator />
            <section id="migration-parity" className="space-y-4">
              <SectionHeader
                icon={<ArrowLeftRight className="size-4" />}
                title="PrimeReact Migration & Feature Parity Matrix"
                description="Side-by-side comparison of PrimeReact DataTable props vs @workspace/ui/components/data-table."
                badge="17 Feature Areas"
              />

              <div className="overflow-x-auto rounded-lg border">
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="border-b bg-muted/50 text-muted-foreground">
                      <th className="px-3 py-2 font-medium">Feature</th>
                      <th className="px-3 py-2 font-medium">PrimeReact DataTable</th>
                      <th className="px-3 py-2 font-medium">@workspace/ui DataTable</th>
                      <th className="px-3 py-2 font-medium">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {PARITY_MATRIX.map((row) => (
                      <tr key={row.feature} className="hover:bg-muted/30">
                        <td className="px-3 py-2 font-medium whitespace-nowrap">
                          {row.feature}
                        </td>
                        <td className="px-3 py-2 font-mono text-[11px] text-muted-foreground">
                          {row.primeReact}
                        </td>
                        <td className="px-3 py-2 font-mono text-[11px] text-primary">
                          {row.shadcnDataTable}
                        </td>
                        <td className="px-3 py-2 text-muted-foreground">{row.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  )
}
