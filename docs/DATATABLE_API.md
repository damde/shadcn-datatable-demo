# DataTable API Reference

Complete TypeScript API reference for `@workspace/ui/components/data-table`.

## Table of Contents

- [DataTable Props](#datatable-props)
  - [Data & Core](#data--core)
  - [Visual & Layout](#visual--layout)
  - [Sorting](#sorting)
  - [Filtering](#filtering)
  - [Pagination](#pagination)
  - [Lazy / Server-Side](#lazy--server-side)
  - [Selection](#selection)
  - [Row Expansion](#row-expansion)
  - [Row Grouping](#row-grouping)
  - [Column Features](#column-features)
  - [Row Reordering](#row-reordering)
  - [Inline Editing](#inline-editing)
  - [Scrolling & Virtualization](#scrolling--virtualization)
  - [Context Menu & Export](#context-menu--export)
  - [State Persistence](#state-persistence)
- [DataTableColumn & Render Contexts](#datatablecolumn--render-contexts)
  - [`DataTableColumn<TData, TValue>`](#datatablecolumntdata-tvalue)
  - [`ColumnBodyContext<TData, TValue>`](#columnbodycontexttdata-tvalue)
  - [`ColumnEditorContext<TData, TValue>`](#columneditorcontexttdata-tvalue)
  - [`ColumnFilterContext<TData, TValue>`](#columnfiltercontexttdata-tvalue)
  - [Supporting Types](#supporting-types)
- [DataTableRef Imperative Methods](#datatableref-imperative-methods)
- [`useDataTable` Hook API](#usedatatable-hook-api)
- [`FilterMatchMode` & `AggregationType` Reference](#filtermatchmode--aggregationtype-reference)
  - [`FilterMatchMode` (16 Modes)](#filtermatchmode-16-modes)
  - [`AggregationType`](#aggregationtype)
- [Utility Functions](#utility-functions)
- [Localization (`locale` & `messages`)](#localization-locale--messages)
- [Accessibility (WCAG 2.2)](#accessibility-wcag-22)
- [Responsive Design (Mobile & Tablet)](#responsive-design-mobile--tablet)

---

## DataTable Props

`DataTable<TData extends Record<string, unknown> | object>(props: DataTableProps<TData>)`

### Data & Core

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `data` | `TData[]` | **Required** | Array of row data items. |
| `columns` | `DataTableColumn<TData>[]` | **Required** | Column definitions. |
| `dataKey` | `(keyof TData & string) \| ((row: TData, index: number) => string)` | Row index string | Unique property name or function to derive stable row IDs. |

### Visual & Layout

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `size` | `DataTableSize` (`"sm" \| "md" \| "lg"`) | `"md"` | Row density size. |
| `stripedRows` | `boolean` | `false` | Alternate row background colors. |
| `showGridlines` | `boolean` | `false` | Render borders around all cells. |
| `hoverableRows` | `boolean` | `true` | Highlight row on hover. |
| `rowClassName` | `string \| ((data: TData, rowIndex: number) => string)` | `undefined` | Dynamic class name per row. |
| `caption` | `React.ReactNode` | `undefined` | Custom table caption. |
| `header` | `React.ReactNode` | `undefined` | Custom header slot rendered above the table (inside toolbar or standalone). |
| `footer` | `React.ReactNode` | `undefined` | Custom footer slot rendered below the table. |
| `emptyMessage` | `React.ReactNode` | `undefined` | Custom content when `data` is empty or filtered to zero rows. |
| `loading` | `boolean` | `false` | Show loading indicator (skeleton rows by default). |
| `skeletonRows` | `number` | `5` | Number of skeleton rows when `loading` is `true`. |
| `showToolbar` | `boolean` | `true` when any toolbar feature is enabled | Show toolbar with global search, column toggle, export, etc. |
| `toolbarLeft` | `React.ReactNode` | `undefined` | Custom left-aligned toolbar content. |
| `toolbarRight` | `React.ReactNode` | `undefined` | Custom right-aligned toolbar content. |
| `className` | `string` | `undefined` | Root container `className`. |
| `tableClassName` | `string` | `undefined` | Table wrapper `className`. |
| `responsiveLayout` | `"scroll" \| "stack"` | `"scroll"` | Responsive layout mode: `"scroll"` (horizontal scroll) or `"stack"` (stacked cards below `breakpoint`). |
| `breakpoint` | `"sm" \| "md" \| "lg"` | `"md"` | Breakpoint below which `responsiveLayout="stack"` activates. |
| `ariaLabel` | `string` | `undefined` | Accessible label for the data grid (`aria-label`). |
| `ariaLabelledBy` | `string` | `undefined` | ID of an element labelling the data grid (`aria-labelledby`). |
| `locale` | `string` | `undefined` | BCP-47 language tag (e.g. `"en"`, `"it"`) for built-in translations and root `lang` attribute (WCAG 3.1.2). |
| `messages` | `Partial<DataTableMessages>` | `undefined` | Custom partial overrides for UI and ARIA messages. |

### Sorting

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `sortable` | `boolean` | `false` | Enable sorting globally for all columns unless overridden per column. |
| `sortMode` | `SortMode` (`"single" \| "multiple"`) | `"single"` | Single or multiple column sorting. |
| `removableSort` | `boolean` | `true` | Allow cycling sort back to unsorted. |
| `sorting` | `SortingState` | `undefined` | Controlled sorting state (`@tanstack/react-table`). |
| `onSortingChange` | `(sorting: SortingState) => void` | `undefined` | Callback when sorting changes. |

### Filtering

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `filterDisplay` | `FilterDisplay` (`"row" \| "menu" \| "none"`) | `"none"` | Where column filters are displayed. |
| `enableGlobalFilter` | `boolean` | `false` | Enable global search input in the toolbar. |
| `globalFilterPlaceholder` | `string` | `undefined` | Global search placeholder text. |
| `globalFilter` | `string` | `undefined` | Controlled global filter string. |
| `onGlobalFilterChange` | `(value: string) => void` | `undefined` | Callback when global filter changes. |
| `columnFilters` | `ColumnFiltersState` | `undefined` | Controlled column filters state (`@tanstack/react-table`). |
| `onColumnFiltersChange` | `(filters: ColumnFiltersState) => void` | `undefined` | Callback when column filters change. |

### Pagination

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `paginator` | `boolean` | `false` | Enable pagination. |
| `paginatorPosition` | `PaginatorPosition` (`"top" \| "bottom" \| "both"`) | `"bottom"` | Position of paginator relative to the table. |
| `rows` | `number` | `10` | Initial or controlled page size. |
| `pageIndex` | `number` | `0` | Controlled 0-based page index. |
| `rowsPerPageOptions` | `number[]` | `[5, 10, 20, 50]` | Available page size options. |
| `currentPageReportTemplate` | `string` | `undefined` | Template for page report, e.g. `"Showing {first} to {last} of {totalRecords}"`. |
| `showCurrentPageReport` | `boolean` | `true` | Show current page report text. |
| `pagination` | `PaginationState` | `undefined` | Controlled pagination state (`@tanstack/react-table`). |
| `onPaginationChange` | `(pagination: PaginationState) => void` | `undefined` | Callback when pagination changes. |

### Lazy / Server-Side

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `lazy` | `boolean` | `false` | Enable manual sorting, filtering, and pagination for server-side data. |
| `totalRecords` | `number` | `undefined` | Total record count on server (required for accurate pagination in `lazy` mode). |
| `onLazyLoad` | `(params: DataTableLazyParams) => void` | `undefined` | Unified callback fired when sorting, filters, globalFilter, or pagination change in `lazy` mode. |

### Selection

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `selectionMode` | `SelectionMode` (`"single" \| "multiple" \| "checkbox" \| "radiobutton"`) | `undefined` | Row selection mode. Supports `Shift+Click` range selection in `"multiple"` and `"checkbox"` modes. |
| `selection` | `TData \| TData[] \| null` | `undefined` | Selected item(s): single `TData \| null` or array `TData[]` depending on mode. |
| `onSelectionChange` | `(selection: TData \| TData[] \| null) => void` | `undefined` | Callback when selection changes. |
| `rowSelection` | `RowSelectionState` | `undefined` | Controlled TanStack `RowSelectionState` (alternative to `selection`). |
| `onRowSelectionChange` | `(rowSelection: RowSelectionState) => void` | `undefined` | Callback for TanStack `RowSelectionState`. |
| `metaKeySelection` | `boolean` | `false` | Require Ctrl/Cmd/Shift key for multiple row click selection (`Shift+Click` selects contiguous ranges). |
| `isRowSelectable` | `(data: TData, rowIndex: number) => boolean` | `undefined` | Predicate to disable selection on specific rows. |
| `onRowSelect` | `(data: TData, rowIndex: number) => void` | `undefined` | Callback fired when a row is selected. |
| `onRowUnselect` | `(data: TData, rowIndex: number) => void` | `undefined` | Callback fired when a row is unselected. |

### Row Expansion

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `expandableRows` | `boolean` | `false` | Enable row expansion with expander column. |
| `expandedRows` | `ExpandedState` | `undefined` | Controlled expanded state (`@tanstack/react-table`). |
| `onRowToggle` | `(expanded: ExpandedState) => void` | `undefined` | Callback when expanded state changes. |
| `rowExpansionTemplate` | `(data: TData, rowIndex: number) => React.ReactNode` | `undefined` | Render function for expanded row content. |
| `allowRowExpansion` | `(data: TData, rowIndex: number) => boolean` | `undefined` | Predicate to allow/disallow expansion on specific rows. |

### Row Grouping

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `rowGroupMode` | `RowGroupMode` (`"subheader" \| "rowspan"`) | `undefined` | Row grouping presentation mode. |
| `groupRowsBy` | `string` | `undefined` | Column ID / field name to group rows by. |
| `expandableRowGroups` | `boolean` | `false` | Allow collapsing/expanding row groups in `subheader` mode. |
| `rowGroupHeaderTemplate` | `(groupValue: unknown, rows: LegacyRow<TData>[]) => React.ReactNode` | `undefined` | Custom renderer for subheader group header row. |
| `rowGroupFooterTemplate` | `(groupValue: unknown, rows: LegacyRow<TData>[]) => React.ReactNode` | `undefined` | Custom renderer for subheader group footer row. |

### Column Features

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `columnToggle` | `boolean` | `false` | Show column visibility toggle menu in toolbar. |
| `resizableColumns` | `boolean` | `false` | Allow resizing columns by dragging header borders. |
| `columnResizeMode` | `ColumnResizeMode` (`"fit" \| "expand"`) | `"fit"` | Column resize mode. |
| `reorderableColumns` | `boolean` | `false` | Allow reordering columns via header drag & drop. |
| `headerColumnGroup` | `ColumnGroupRow[]` | `undefined` | Multi-row grouped header definitions. |
| `footerColumnGroup` | `ColumnGroupRow[]` | `undefined` | Multi-row grouped footer definitions. |
| `columnVisibility` | `ColumnVisibilityState` | `undefined` | Controlled column visibility state. |
| `onColumnVisibilityChange` | `(visibility: ColumnVisibilityState) => void` | `undefined` | Callback when column visibility changes. |
| `columnOrder` | `ColumnOrderState` | `undefined` | Controlled column order state. |
| `onColumnOrderChange` | `(order: ColumnOrderState) => void` | `undefined` | Callback when column order changes. |
| `columnSizing` | `ColumnSizingState` | `undefined` | Controlled column sizing state. |
| `onColumnSizingChange` | `(sizing: ColumnSizingState) => void` | `undefined` | Callback when column sizing changes. |
| `columnPinning` | `ColumnPinningState` | `undefined` | Controlled column pinning state. |
| `onColumnPinningChange` | `(pinning: ColumnPinningState) => void` | `undefined` | Callback when column pinning changes. |

### Row Reordering

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `reorderableRows` | `boolean` | `false` | Allow dragging rows to reorder them. |
| `onRowReorder` | `(event: RowReorderEvent<TData>) => void` | `undefined` | Callback when rows are reordered. |

### Inline Editing

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `editMode` | `EditMode` (`"cell" \| "row"`) | `undefined` | Enable inline cell or row editing. |
| `onCellEditComplete` | `(event: CellEditCompleteEvent<TData>) => void` | `undefined` | Callback when a cell edit is committed. |
| `onRowEditComplete` | `(event: RowEditCompleteEvent<TData>) => void` | `undefined` | Callback when a row edit is committed. |
| `onRowEditCancel` | `(data: TData, index: number) => void` | `undefined` | Callback when a row edit is cancelled. |

### Scrolling & Virtualization

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `scrollable` | `boolean` | `false` | Enable vertical/horizontal scrolling container with sticky header. |
| `scrollHeight` | `string \| number` | `undefined` | Max height of scrollable table body (e.g. `"400px"` or `400`). |
| `virtualScrollerOptions` | `VirtualScrollerOptions` | `undefined` | Virtual scrolling options powered by `@tanstack/react-virtual`. |
| `frozenValue` | `TData[]` | `undefined` | Rows pinned to the top of the table body. |

### Context Menu & Export

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `contextMenuItems` | `ContextMenuItem<TData>[] \| ((data: TData, rowIndex: number) => ContextMenuItem<TData>[])` | `undefined` | Context menu items shown on row right-click. |
| `onRowContextMenu` | `(event: React.MouseEvent, data: TData, rowIndex: number) => void` | `undefined` | Callback fired on row right-click. |
| `onRowClick` | `(event: React.MouseEvent, data: TData, rowIndex: number) => void` | `undefined` | Callback fired on row click. |
| `onRowDoubleClick` | `(event: React.MouseEvent, data: TData, rowIndex: number) => void` | `undefined` | Callback fired on row double-click. |
| `exportable` | `boolean` | `false` | Show export menu (CSV / JSON) in toolbar. |
| `exportFilename` | `string` | `"datatable-export"` | Default filename (without extension) for exports. |

### State Persistence

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `stateStorage` | `StateStorageType` (`"session" \| "local"`) | `undefined` | Storage backend for automatic state persistence. |
| `stateKey` | `string` | `undefined` | Storage key used when `stateStorage` is set. |
| `onStateChange` | `(state: DataTableState) => void` | `undefined` | Callback fired when persisted/internal state changes. |

---

## DataTableColumn & Render Contexts

### `DataTableColumn<TData, TValue>`

| Property | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string` | `field` | Unique column identifier. Defaults to `field` if omitted. |
| `field` | `(keyof TData & string) \| (string & {})` | `undefined` | Property key or dot-path on `TData` (mapped to TanStack `accessorKey`). |
| `accessorFn` | `(row: TData, index: number) => TValue` | `undefined` | Custom accessor function for computed values (mapped to TanStack `accessorFn`). |
| `header` | `React.ReactNode \| ((props: { table: LegacyReactTable<TData>; columnId: string }) => React.ReactNode)` | `undefined` | Header label or custom render function. |
| `body` | `(data: TData, context: ColumnBodyContext<TData, TValue>) => React.ReactNode` | `undefined` | Custom cell renderer with PrimeReact-style context. |
| `footer` | `React.ReactNode \| ((props: { rows: LegacyRow<TData>[]; columnId: string; table: LegacyReactTable<TData> }) => React.ReactNode)` | `undefined` | Footer label or custom render function. |
| `aggregation` | `AggregationType<TData>` | `undefined` | Automatic aggregation displayed in footer / group footer when `footer` is not provided. |
| `aggregationFormatter` | `(value: number \| null) => React.ReactNode` | `undefined` | Prefix/formatter for automatic aggregation output. |
| `sortable` | `boolean` | `false` (unless table `sortable` is `true`) | Enable sorting for this column. |
| `sortingFn` | `LegacyColumnDef<TData, TValue>["sortFn"]` | `undefined` | Custom sorting function. |
| `filterable` | `boolean` | `false` | Enable filtering for this column. |
| `filterType` | `ColumnFilterType` (`"text" \| "number" \| "select" \| "multi-select" \| "date" \| "boolean"`) | `"text"` | Filter input type. |
| `filterMatchMode` | `FilterMatchMode` | Depends on `filterType` | Default filter match mode. |
| `filterMatchModes` | `FilterMatchMode[]` | `undefined` | Available match modes shown in menu filter popover. |
| `filterPlaceholder` | `string` | `undefined` | Placeholder text for filter input. |
| `filterOptions` | `FilterOption[]` | `undefined` | Options for `select` / `multi-select` filter types. |
| `filterElement` | `(context: ColumnFilterContext<TData, TValue>) => React.ReactNode` | `undefined` | Custom filter UI renderer. |
| `editable` | `boolean \| ((data: TData, rowIndex: number) => boolean)` | `false` | Enable inline cell/row editing for this column. |
| `editor` | `(context: ColumnEditorContext<TData, TValue>) => React.ReactNode` | `undefined` | Custom inline editor renderer. |
| `onCellEditValidate` | `(newValue: TValue, oldValue: TValue, data: TData) => boolean \| string` | `undefined` | Validation callback before committing cell edit. Return `false` or an error string to reject. |
| `frozen` | `boolean` | `false` | Pin/freeze column to left or right edge. |
| `alignFrozen` | `"left" \| "right"` | `"left"` | Edge to freeze the column to. |
| `resizable` | `boolean` | Inherits `resizableColumns` | Allow resizing this column. |
| `reorderable` | `boolean` | Inherits `reorderableColumns` | Allow reordering this column. |
| `hidden` | `boolean` | `false` | Initial hidden state. |
| `exportable` | `boolean` | `true` | Include/exclude column from CSV/JSON export. |
| `align` | `"left" \| "center" \| "right"` | `"left"` | Horizontal text alignment. |
| `width` | `number \| string` | `undefined` | Fixed or initial column width in px or CSS string. |
| `minWidth` | `number` | `undefined` | Minimum column width in px. |
| `maxWidth` | `number` | `undefined` | Maximum column width in px. |
| `className` | `string` | `undefined` | CSS class applied to both header and body cells. |
| `headerClassName` | `string` | `undefined` | CSS class applied to header cell. |
| `bodyClassName` | `string \| ((data: TData, rowIndex: number) => string)` | `undefined` | CSS class applied to body cell (can be dynamic per row). |
| `footerClassName` | `string` | `undefined` | CSS class applied to footer cell. |
| `meta` | `Record<string, unknown>` | `undefined` | Arbitrary metadata passed through to TanStack `columnDef.meta`. |

### `ColumnBodyContext<TData, TValue>`

Passed as the second argument to `column.body(data, context)`:

| Property | Type | Description |
| :--- | :--- | :--- |
| `row` | `LegacyRow<TData>` | TanStack row instance. |
| `data` | `TData` | Row original data object. |
| `value` | `TValue` | Resolved cell value. |
| `rowIndex` | `number` | 0-based row index. |
| `column` | `DataTableColumn<TData, TValue>` | Current column definition. |
| `table` | `LegacyReactTable<TData>` | Underlying TanStack Table instance. |

### `ColumnEditorContext<TData, TValue>`

Passed to `column.editor(context)` during inline editing:

| Property | Type | Description |
| :--- | :--- | :--- |
| `value` | `TValue` | Current draft value. |
| `row` | `LegacyRow<TData>` | TanStack row instance. |
| `data` | `TData` | Row original data object. |
| `rowIndex` | `number` | 0-based row index. |
| `column` | `DataTableColumn<TData, TValue>` | Current column definition. |
| `onChange` | `(newValue: TValue) => void` | Update draft value. |
| `onCommit` | `() => void` | Commit the edit. |
| `onCancel` | `() => void` | Cancel and discard the edit. |

### `ColumnFilterContext<TData, TValue>`

Passed to `column.filterElement(context)` for custom filter UIs:

| Property | Type | Description |
| :--- | :--- | :--- |
| `value` | `unknown` | Current filter value. |
| `matchMode` | `FilterMatchMode` | Active match mode for the column. |
| `onChange` | `(value: unknown, matchMode?: FilterMatchMode) => void` | Update filter value and optional match mode. |
| `onClear` | `() => void` | Clear the column filter. |
| `column` | `DataTableColumn<TData, TValue>` | Current column definition. |
| `table` | `LegacyReactTable<TData>` | Underlying TanStack Table instance. |

### Supporting Types

- **`VirtualScrollerOptions`**: `{ itemSize?: number; overscan?: number; enabled?: boolean }` (defaults: `itemSize = 40`, `overscan = 10`, `enabled = true` when provided).
- **`ContextMenuItem<TData>`**: `{ id: string; label: React.ReactNode; icon?: React.ReactNode; disabled?: boolean | ((data: TData) => boolean); destructive?: boolean; separatorBefore?: boolean; onSelect: (data: TData, rowIndex: number) => void }`.
- **`ColumnGroupRow` / `ColumnGroupCell`**: Multi-row grouped header/footer definitions supporting `colSpan`, `rowSpan`, `align`, `sortable`, `field`, `header`, `footer`, and `className`.
- **`CellEditCompleteEvent<TData, TValue>`**: `{ rowData: TData; newRowData: TData; field: string; value: TValue; newValue: TValue; rowIndex: number }`.
- **`RowEditCompleteEvent<TData>`**: `{ data: TData; newData: TData; index: number }`.
- **`RowReorderEvent<TData>`**: `{ value: TData[]; dragIndex: number; dropIndex: number }`.
- **`DataTableLazyParams`**: `{ first: number; rows: number; page: number; sorting: SortingState; columnFilters: ColumnFiltersState; globalFilter: string }`.
- **`DataTableState`**: `{ sorting, columnFilters, globalFilter, pagination, columnVisibility, columnOrder, columnSizing, columnPinning, rowSelection, expanded, grouping }`.

---

## DataTableRef Imperative Methods

Attach a `ref` of type `React.RefObject<DataTableRef<TData> | null>` to `<DataTable />` to invoke imperative actions:

| Method | Signature | Description |
| :--- | :--- | :--- |
| `exportCSV` | `(options?: { selectionOnly?: boolean; filename?: string; sanitizeFormulas?: boolean }) => string` | Export current or selected rows to CSV (with formula-injection protection enabled by default) and trigger download in browser. |
| `exportJSON` | `(options?: { selectionOnly?: boolean; filename?: string }) => string` | Export current or selected rows to JSON (triggers download in browser and returns the JSON string). |
| `reset` | `() => void` | Reset sorting, filters, pagination, selection, and expansion to defaults. |
| `clearFilters` | `() => void` | Clear all column filters and the global filter. |
| `clearSorting` | `() => void` | Clear all sorting. |
| `clearSelection` | `() => void` | Clear row selection. |
| `expandAll` | `() => void` | Expand all expandable rows. |
| `collapseAll` | `() => void` | Collapse all expanded rows. |
| `scrollToIndex` | `(index: number) => void` | Scroll to a specific row index (when `scrollable` or virtualized). |
| `getTable` | `() => LegacyReactTable<TData>` | Access the underlying TanStack Table instance. |

---

## `useDataTable` Hook API

`useDataTable<TData extends Record<string, unknown> | object>(props: DataTableProps<TData>, scrollContainerRef?: React.RefObject<HTMLDivElement | null>): UseDataTableResult<TData>`

Headless hook powering `DataTable` on top of `@tanstack/react-table`. Useful for building custom table layouts while reusing state management, column mapping, persistence, lazy-loading, and imperative actions.

### `UseDataTableResult<TData>`

| Property | Type | Description |
| :--- | :--- | :--- |
| `table` | `LegacyReactTable<TData>` | Configured TanStack Table instance. |
| `state` | `DataTableState` | Current resolved table state (controlled + internal). |
| `setters` | `UseDataTableSetters` | Programmatic state updaters. |
| `actions` | `DataTableRef<TData>` | Imperative action methods. |
| `flatColumns` | `LegacyColumn<TData, unknown>[]` | Flattened TanStack column list. |
| `hasFooter` | `boolean` | Whether any column or group defines a footer/aggregation. |
| `hasToolbar` | `boolean` | Whether the toolbar should be rendered. |
| `activeFilterCount` | `number` | Number of active column filters + global filter. |

### `UseDataTableSetters`

- `setSorting: (updater: Updater<SortingState>) => void`
- `setColumnFilters: (updater: Updater<ColumnFiltersState>) => void`
- `setGlobalFilter: (updater: Updater<string>) => void`
- `setPagination: (updater: Updater<PaginationState>) => void`
- `setColumnVisibility: (updater: Updater<ColumnVisibilityState>) => void`
- `setColumnOrder: (updater: Updater<ColumnOrderState>) => void`
- `setColumnSizing: (updater: Updater<ColumnSizingState>) => void`
- `setColumnPinning: (updater: Updater<ColumnPinningState>) => void`
- `setRowSelection: (updater: Updater<RowSelectionState>) => void`
- `setExpanded: (updater: Updater<ExpandedState>) => void`
- `setGrouping: (updater: Updater<GroupingState>) => void`

---

## `FilterMatchMode` & `AggregationType` Reference

### `FilterMatchMode` (16 Modes)

| Match Mode | Label (`MATCH_MODE_LABELS`) | Behavior |
| :--- | :--- | :--- |
| `"contains"` | `Contains` | Case-insensitive substring match (`String(cell).includes(filter)`). |
| `"notContains"` | `Does not contain` | Negated case-insensitive substring match. |
| `"startsWith"` | `Starts with` | Case-insensitive prefix match. |
| `"endsWith"` | `Ends with` | Case-insensitive suffix match. |
| `"equals"` | `Equals` | Equality check (handles primitives, booleans, Dates, and case-insensitive strings). |
| `"notEquals"` | `Not equals` | Negated equality check. |
| `"gt"` | `Greater than` | Numeric or timestamp `>` comparison. |
| `"gte"` | `Greater than or equal` | Numeric or timestamp `>=` comparison. |
| `"lt"` | `Less than` | Numeric or timestamp `<` comparison. |
| `"lte"` | `Less than or equal` | Numeric or timestamp `<=` comparison. |
| `"between"` | `Between` | Inclusive `[min, max]` range comparison for numbers or timestamps. |
| `"in"` | `In` | Matches if cell value equals any item in the filter array. |
| `"notIn"` | `Not in` | Matches if cell value equals none of the items in the filter array. |
| `"dateIs"` | `Date is` | Same calendar day (local start-of-day comparison). |
| `"dateBefore"` | `Date before` | Calendar day strictly before filter date. |
| `"dateAfter"` | `Date after` | Calendar day strictly after filter date. |

Default match mode by `ColumnFilterType` (`DEFAULT_MATCH_MODE_BY_TYPE`):
- `text`: `"contains"`
- `number`: `"equals"`
- `select`: `"equals"`
- `multi-select`: `"in"`
- `date`: `"dateIs"`
- `boolean`: `"equals"`

### `AggregationType`

`AggregationType<TData> = "sum" | "avg" | "min" | "max" | "count" | ((rows: LegacyRow<TData>[], columnId: string) => React.ReactNode)`

- `"sum"`: Sum of finite numeric values in the column.
- `"avg"`: Arithmetic mean of finite numeric values in the column.
- `"min"`: Minimum finite numeric value in the column.
- `"max"`: Maximum finite numeric value in the column.
- `"count"`: Total row count (`rows.length`).
- Custom reducer function: `(rows, columnId) => React.ReactNode` for arbitrary footer or group-footer calculations.

---

## Utility Functions

All utilities are exported from `@workspace/ui/components/data-table`.

### `exportToCSV`

```ts
function exportToCSV<TData extends object>(
  rows: LegacyRow<TData>[],
  columns: DataTableColumn<TData>[],
  options?: ExportOptions
): string
```

Exports table rows and exportable columns (`col.exportable !== false`) to a CSV string. Properly escapes quotes, commas, and newlines, formats `Date` values as ISO strings, and protects against **CSV Formula Injection** by prefixing values starting with `=`, `+`, `-`, `@`, `\t`, or `\r` with a single quote (`'`) when `options.sanitizeFormulas !== false`. Triggers a browser download unless `options.triggerDownload === false`.

### `exportToJSON`

```ts
function exportToJSON<TData extends object>(
  rows: LegacyRow<TData>[],
  columns: DataTableColumn<TData>[],
  options?: ExportOptions
): string
```

Exports table rows and exportable columns to a pretty-printed JSON string (`JSON.stringify(records, null, 2)`). Triggers a browser download unless `options.triggerDownload === false`.

**`ExportOptions`**: `{ filename?: string; triggerDownload?: boolean; sanitizeFormulas?: boolean }` (`sanitizeFormulas` defaults to `true` for CSV exports).

### `computeAggregation`

```ts
function computeAggregation<TData extends object>(
  rows: LegacyRow<TData>[],
  columnId: string,
  aggregation: AggregationType<TData>
): React.ReactNode
```

Computes either a built-in numeric aggregation (`computeNumericAggregation`) or invokes a custom reducer function. Returns `null` when no numeric values exist (except for `"count"`).

### `applyFilterMatchMode`

```ts
function applyFilterMatchMode(
  cellValue: unknown,
  filterValue: unknown,
  matchMode: FilterMatchMode
): boolean
```

Evaluates whether `cellValue` satisfies `filterValue` under the specified `FilterMatchMode`. Also exported alongside `createColumnFilterFn`, `globalContainsFilterFn`, `DEFAULT_MATCH_MODE_BY_TYPE`, and `MATCH_MODE_LABELS`.

---

## Localization (`locale` & `messages`)

`DataTable` supports built-in i18n and WCAG 3.1.2 Language of Parts via `locale`, `messages`, and exported message dictionaries:

- **`locale` (`string`)**: Sets the `lang` attribute on the `DataTable` root container and selects a built-in dictionary (`"it"` loads `MESSAGES_IT`; all other locales default to `DEFAULT_MESSAGES_EN`).
- **`messages` (`Partial<DataTableMessages>`)**: Overrides any subset of toolbar, pagination, filter, selection, and screen-reader announcement strings (`DataTableMessages` interface).
- **`DEFAULT_MESSAGES_EN` / `MESSAGES_IT`**: Built-in English and Italian `DataTableMessages` dictionaries exported from `@workspace/ui/components/data-table`.
- **`resolveDataTableMessages(locale?, overrides?)`**: Helper to merge a locale preset with partial `DataTableMessages` overrides.

---

## Accessibility (WCAG 2.2)

`DataTable` follows WAI-ARIA Grid and WCAG 2.2 AA patterns for semantic structure, screen reader announcements, and full keyboard operation:

### ARIA Roles, Properties & Live Announcements

- **Grid Semantics**: The underlying `<table>` uses `role="grid"`, along with `aria-rowcount`, `aria-colcount`, and `aria-rowindex` on rows so assistive technologies can announce total and current positions even with pagination or virtual scrolling.
- **Accessible Naming**: Use `ariaLabel` (`aria-label`) or `ariaLabelledBy` (`aria-labelledby`) to provide a descriptive name for the data grid.
- **Live Status Region**: An `aria-live="polite"` region announces dynamic table updates such as sorting changes, active filter counts, selection updates, and page changes (localized via `locale` / `messages`).
- **Loading State**: Sets `aria-busy="true"` on the grid while `loading` is active.

### Keyboard Navigation & Shortcuts

| Shortcut | Context | Action |
| :--- | :--- | :--- |
| `ArrowUp` / `ArrowDown` | Grid rows & cells | Move focus vertically to the previous or next row (or same column cell during 2D cell navigation). |
| `ArrowLeft` / `ArrowRight` | Grid cells (2D navigation) | Move focus horizontally across cells within the current row. |
| `Home` / `End` | Grid rows & cells | Jump focus to the first or last visible row (or cell). |
| `Enter` / `Space` | Selectable / expandable / editable row or cell | Toggle row selection, toggle row expansion, or activate cell/row editing. |
| `Shift + Click` | Selectable rows (`multiple` / `checkbox`) | Select a contiguous range of rows between the anchor row and clicked row. |
| `ArrowLeft` / `ArrowRight` | Column resize handle (`role="separator"`) | Resize the column width incrementally via keyboard when `resizableColumns` is enabled. |
| `Alt + ArrowLeft` / `Alt + ArrowRight` | Column header (`reorderableColumns`) | Reorder the focused column left or right. |
| `Alt + ArrowUp` / `Alt + ArrowDown` | Row / drag handle (`reorderableRows`) | Reorder the focused row up or down. |

### Real-Browser E2E & WCAG 2.2 Automated Verification

The demo workspace (`apps/web`) includes a real-browser Playwright + `@axe-core/playwright` suite (`apps/web/e2e/datatable.spec.ts`) auditing `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, and `wcag22aa` across desktop (`1440×900`), tablet (`768×1024`), and mobile (`375×667`) viewports, plus 10,000-row virtual scrolling and mobile stack layout:

```bash
npm run build --workspace=web
npm run test:e2e --workspace=web
```

---

## Responsive Design (Mobile & Tablet)

`DataTable` supports two responsive strategies via `responsiveLayout` and `breakpoint`:

- **`responsiveLayout="scroll"`** *(default)*: Wraps the table in a horizontally scrollable container (`overflow-x-auto`) so wide tables remain usable on narrow viewports without breaking page layout.
- **`responsiveLayout="stack"`**: Below the configured `breakpoint` (`"sm"` | `"md"` | `"lg"`, default `"md"`), table rows automatically transform into stacked cards where each cell displays its column header label alongside its value.
- **Combining with Toolbar & Paginator**: Toolbar controls and pagination wrap cleanly on mobile and tablet viewports alongside either `"scroll"` or `"stack"` mode.
