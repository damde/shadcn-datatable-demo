# DataTable Component Guide

A feature-rich, PrimeReact-inspired `DataTable` component built on **TanStack Table v9**, **TanStack Virtual**, **shadcn/ui**, **Base UI (`@base-ui/react`)**, and **Tailwind CSS v4**.

For the full TypeScript API, see [DATATABLE_API.md](../../../../docs/DATATABLE_API.md).

---

## Quick Start

```tsx
import { DataTable, type DataTableColumn } from "@workspace/ui/components/data-table"

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
    body: (user) => (
      <span className="capitalize">{user.status}</span>
    ),
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
}
```

---

## PrimeReact-to-shadcn Feature Parity Matrix

| Feature | PrimeReact Prop / Pattern | `@workspace/ui` DataTable |
| :--- | :--- | :--- |
| Data & Row Key | `value`, `dataKey` | `data`, `dataKey` |
| Column Definition | `<Column field header body />` | `DataTableColumn<TData>` (`field`, `header`, `body`) |
| Density & Styling | `size`, `stripedRows`, `showGridlines` | `size` (`"sm" \| "md" \| "lg"`), `stripedRows`, `showGridlines`, `hoverableRows` |
| Sorting | `sortable`, `sortMode`, `removableSort` | `sortable`, `sortMode` (`"single" \| "multiple"`), `removableSort` |
| Filtering | `filterDisplay="row" \| "menu"`, `globalFilter` | `filterDisplay`, `enableGlobalFilter`, 16 `FilterMatchMode`s |
| Pagination | `paginator`, `rows`, `rowsPerPageOptions`, `paginatorPosition` | `paginator`, `rows`, `rowsPerPageOptions`, `paginatorPosition` |
| Lazy / Server-Side | `lazy`, `totalRecords`, `onPage` / `onSort` / `onFilter` | `lazy`, `totalRecords`, `onLazyLoad` |
| Selection | `selectionMode`, `selection`, `onSelectionChange`, `metaKeySelection` | `selectionMode` (`single`, `multiple`, `checkbox`, `radiobutton`), `selection`, `onSelectionChange`, `metaKeySelection` |
| Row Expansion | `expandedRows`, `onRowToggle`, `rowExpansionTemplate` | `expandableRows`, `expandedRows`, `onRowToggle`, `rowExpansionTemplate` |
| Row Grouping | `rowGroupMode="subheader" \| "rowspan"`, `groupRowsBy` | `rowGroupMode`, `groupRowsBy`, `expandableRowGroups`, `rowGroupHeaderTemplate`, `rowGroupFooterTemplate` |
| Column Groups | `<ColumnGroup>` | `headerColumnGroup`, `footerColumnGroup` |
| Frozen Columns / Rows | `frozen`, `alignFrozen`, `frozenValue` | `column.frozen`, `column.alignFrozen`, `frozenValue` |
| Column Resize & Reorder | `resizableColumns`, `columnResizeMode`, `reorderableColumns` | `resizableColumns`, `columnResizeMode`, `reorderableColumns` |
| Row Reordering | `reorderableRows`, `onRowReorder` | `reorderableRows`, `onRowReorder` |
| Inline Editing | `editMode="cell" \| "row"`, `editor`, `onCellEditComplete` | `editMode`, `column.editable`, `column.editor`, `onCellEditComplete`, `onRowEditComplete` |
| Virtual Scrolling | `scrollable`, `scrollHeight`, `virtualScrollerOptions` | `scrollable`, `scrollHeight`, `virtualScrollerOptions` (TanStack Virtual) |
| Context Menu & Export | `contextMenuSelection`, `exportCSV` | `contextMenuItems`, `exportable`, `ref.exportCSV()`, `ref.exportJSON()` |
| State Persistence | `stateStorage`, `stateKey` | `stateStorage` (`"session" \| "local"`), `stateKey`, `onStateChange` |
| Responsive Layout | `responsiveLayout="scroll" \| "stack"`, `breakpoint` | `responsiveLayout` (`"scroll" \| "stack"`), `breakpoint` (`"sm" \| "md" \| "lg"`) |

---

## Recipes

### 1. Sorting & Filtering

Enable global search, multi-column sorting, and per-column filters (`"row"` or `"menu"`):

```tsx
const columns: DataTableColumn<Product>[] = [
  { field: "name", header: "Product", sortable: true, filterable: true },
  {
    field: "price",
    header: "Price",
    sortable: true,
    filterable: true,
    filterType: "number",
    filterMatchMode: "gte",
    filterMatchModes: ["equals", "gt", "gte", "lt", "lte", "between"],
  },
  {
    field: "category",
    header: "Category",
    filterable: true,
    filterType: "multi-select",
    filterOptions: [
      { label: "Electronics", value: "electronics" },
      { label: "Apparel", value: "apparel" },
    ],
  },
]

<DataTable
  data={products}
  columns={columns}
  dataKey="id"
  sortable
  sortMode="multiple"
  filterDisplay="menu"
  enableGlobalFilter
/>
```

### 2. Row Selection

Supports `"single"`, `"multiple"`, `"checkbox"`, and `"radiobutton"` modes with controlled `selection`:

```tsx
const [selectedUsers, setSelectedUsers] = React.useState<User[]>([])

<DataTable
  data={users}
  columns={columns}
  dataKey="id"
  selectionMode="checkbox"
  selection={selectedUsers}
  onSelectionChange={(next) => setSelectedUsers(next as User[])}
  isRowSelectable={(user) => user.status === "active"}
/>
```

### 3. Inline Editing

Enable `"cell"` or `"row"` editing with built-in or custom `editor` renderers and validation:

```tsx
const [rows, setRows] = React.useState(initialRows)

const columns: DataTableColumn<Product>[] = [
  {
    field: "name",
    header: "Name",
    editable: true,
    onCellEditValidate: (newValue) =>
      String(newValue).trim().length > 0 || "Name is required",
  },
  {
    field: "price",
    header: "Price",
    editable: true,
    editor: ({ value, onChange, onCommit, onCancel }) => (
      <input
        type="number"
        className="w-full rounded border px-2 py-1 text-sm"
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
]

<DataTable
  data={rows}
  columns={columns}
  dataKey="id"
  editMode="cell"
  onCellEditComplete={({ rowIndex, newRowData }) => {
    setRows((prev) => prev.map((r, i) => (i === rowIndex ? newRowData : r)))
  }}
/>
```

### 4. Virtual Scrolling

Render tens of thousands of rows smoothly with `scrollable`, `scrollHeight`, and `virtualScrollerOptions`:

```tsx
<DataTable
  data={largeDataset}
  columns={columns}
  dataKey="id"
  scrollable
  scrollHeight={480}
  virtualScrollerOptions={{
    itemSize: 40,
    overscan: 10,
  }}
/>
```

### 5. Server-Side Lazy Loading

Set `lazy`, `totalRecords`, and `onLazyLoad` to delegate sorting, filtering, and pagination to your backend:

```tsx
const [data, setData] = React.useState<Order[]>([])
const [totalRecords, setTotalRecords] = React.useState(0)
const [loading, setLoading] = React.useState(false)

const handleLazyLoad = React.useCallback(async (params: DataTableLazyParams) => {
  setLoading(true)
  try {
    const res = await fetchOrders({
      page: params.page,
      pageSize: params.rows,
      sorting: params.sorting,
      filters: params.columnFilters,
      search: params.globalFilter,
    })
    setData(res.items)
    setTotalRecords(res.total)
  } finally {
    setLoading(false)
  }
}, [])

<DataTable
  data={data}
  columns={columns}
  dataKey="id"
  lazy
  loading={loading}
  totalRecords={totalRecords}
  paginator
  rows={20}
  sortable
  filterDisplay="row"
  enableGlobalFilter
  onLazyLoad={handleLazyLoad}
/>
```

### 6. State Persistence

Persist sorting, filters, pagination, column visibility/order/sizing/pinning, selection, and expansion automatically:

```tsx
<DataTable
  data={users}
  columns={columns}
  dataKey="id"
  stateStorage="local"
  stateKey="users-table-v1"
  sortable
  paginator
  columnToggle
  resizableColumns
/>
```

---

## Accessibility (WCAG 2.2)

`DataTable` implements WAI-ARIA Grid and WCAG 2.2 AA accessibility support:

- **ARIA Grid Attributes**: Renders `role="grid"`, `aria-rowcount`, `aria-colcount`, and `aria-rowindex` for accurate screen reader navigation across paginated and virtualized datasets.
- **Accessible Naming**: Pass `ariaLabel` (`aria-label`) or `ariaLabelledBy` (`aria-labelledby`) to label the grid.
- **Live Announcements**: Includes an `aria-live="polite"` status region announcing sorting, filtering, selection, and pagination updates.
- **Keyboard Shortcuts**:
  - `ArrowUp` / `ArrowDown`: Navigate between rows.
  - `Home` / `End`: Jump to the first or last visible row.
  - `Enter` / `Space`: Toggle row selection, expansion, or inline editing.
  - `Alt + ArrowLeft` / `Alt + ArrowRight`: Reorder columns when `reorderableColumns` is enabled.
  - `Alt + ArrowUp` / `Alt + ArrowDown`: Reorder rows when `reorderableRows` is enabled.

---

## Responsive Design (Mobile & Tablet)

Configure mobile and tablet rendering with `responsiveLayout` and `breakpoint`:

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `responsiveLayout` | `"scroll" \| "stack"` | `"scroll"` | `"scroll"` keeps a horizontally scrollable table; `"stack"` renders rows as stacked cards with column labels below `breakpoint`. |
| `breakpoint` | `"sm" \| "md" \| "lg"` | `"md"` | Breakpoint below which `responsiveLayout="stack"` activates. |
| `ariaLabel` | `string` | `undefined` | Accessible label for the data grid (`aria-label`). |
| `ariaLabelledBy` | `string` | `undefined` | ID of an element labelling the data grid (`aria-labelledby`). |

```tsx
<DataTable
  data={users}
  columns={columns}
  dataKey="id"
  responsiveLayout="stack"
  breakpoint="md"
  paginator
  sortable
  enableGlobalFilter
/>
```
