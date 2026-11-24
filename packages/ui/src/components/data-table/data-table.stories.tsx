import * as React from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"
import {
  Building2Icon,
  CalendarIcon,
  CheckCircle2Icon,
  CopyIcon,
  DollarSignIcon,
  InboxIcon,
  MailIcon,
  MapPinIcon,
  RefreshCwIcon,
  Trash2Icon,
  TrendingUpIcon,
  UserCheckIcon,
  XCircleIcon,
} from "lucide-react"
import { Badge } from "../badge"
import { Button } from "../button"
import { DataTable } from "./data-table"
import type {
  ColumnGroupRow,
  ContextMenuItem,
  DataTableColumn,
  DataTableProps,
  FilterOption,
  SelectionMode,
} from "./types"

// ---------------------------------------------------------------------------
// Dataset & Helpers
// ---------------------------------------------------------------------------

type Department =
  | "Engineering"
  | "Design"
  | "Product"
  | "Marketing"
  | "Sales"
  | "Operations"

type EmploymentStatus = "Active" | "Remote" | "On Leave" | "Contract"

interface Employee extends Record<string, unknown> {
  id: number
  name: string
  email: string
  department: Department
  role: string
  salary: number
  status: EmploymentStatus
  hireDate: string
  active: boolean
  performance: number
  location: string
}

const DEPARTMENTS: Department[] = [
  "Engineering",
  "Design",
  "Product",
  "Marketing",
  "Sales",
  "Operations",
]

const STATUSES: EmploymentStatus[] = [
  "Active",
  "Remote",
  "On Leave",
  "Contract",
]

const DEPARTMENT_OPTIONS: FilterOption[] = DEPARTMENTS.map((d) => ({
  label: d,
  value: d,
}))

const STATUS_OPTIONS: FilterOption[] = STATUSES.map((s) => ({
  label: s,
  value: s,
}))

const EMPLOYEES: Employee[] = [
  {
    id: 1001,
    name: "Elena Rostova",
    email: "elena.rostova@acme.io",
    department: "Engineering",
    role: "Staff Software Engineer",
    salary: 168000,
    status: "Active",
    hireDate: "2020-03-15",
    active: true,
    performance: 96,
    location: "San Francisco, CA",
  },
  {
    id: 1002,
    name: "Marcus Vance",
    email: "marcus.vance@acme.io",
    department: "Design",
    role: "Principal Product Designer",
    salary: 152000,
    status: "Remote",
    hireDate: "2021-07-01",
    active: true,
    performance: 92,
    location: "Austin, TX",
  },
  {
    id: 1003,
    name: "Priya Patel",
    email: "priya.patel@acme.io",
    department: "Product",
    role: "Senior Product Manager",
    salary: 158000,
    status: "Active",
    hireDate: "2019-11-12",
    active: true,
    performance: 94,
    location: "New York, NY",
  },
  {
    id: 1004,
    name: "Liam O'Connor",
    email: "liam.oconnor@acme.io",
    department: "Engineering",
    role: "Frontend Architect",
    salary: 162000,
    status: "Remote",
    hireDate: "2020-09-20",
    active: true,
    performance: 91,
    location: "Seattle, WA",
  },
  {
    id: 1005,
    name: "Sofia Chen",
    email: "sofia.chen@acme.io",
    department: "Marketing",
    role: "Growth Marketing Lead",
    salary: 124000,
    status: "Active",
    hireDate: "2022-01-10",
    active: true,
    performance: 88,
    location: "Chicago, IL",
  },
  {
    id: 1006,
    name: "David Kim",
    email: "david.kim@acme.io",
    department: "Sales",
    role: "Enterprise Account Executive",
    salary: 142000,
    status: "Active",
    hireDate: "2021-04-05",
    active: true,
    performance: 95,
    location: "Boston, MA",
  },
  {
    id: 1007,
    name: "Amara Okafor",
    email: "amara.okafor@acme.io",
    department: "Engineering",
    role: "Backend Engineer",
    salary: 138000,
    status: "On Leave",
    hireDate: "2022-06-18",
    active: false,
    performance: 85,
    location: "Denver, CO",
  },
  {
    id: 1008,
    name: "Noah Lindqvist",
    email: "noah.lindqvist@acme.io",
    department: "Operations",
    role: "DevOps Specialist",
    salary: 145000,
    status: "Remote",
    hireDate: "2020-12-01",
    active: true,
    performance: 90,
    location: "Portland, OR",
  },
  {
    id: 1009,
    name: "Hannah Abbott",
    email: "hannah.abbott@acme.io",
    department: "Design",
    role: "UX Researcher",
    salary: 118000,
    status: "Active",
    hireDate: "2023-02-14",
    active: true,
    performance: 87,
    location: "New York, NY",
  },
  {
    id: 1010,
    name: "Carlos Mendez",
    email: "carlos.mendez@acme.io",
    department: "Sales",
    role: "Sales Operations Manager",
    salary: 129000,
    status: "Contract",
    hireDate: "2023-05-22",
    active: false,
    performance: 82,
    location: "Miami, FL",
  },
  {
    id: 1011,
    name: "Mei-Ling Wu",
    email: "meiling.wu@acme.io",
    department: "Product",
    role: "Product Analyst",
    salary: 115000,
    status: "Active",
    hireDate: "2022-08-30",
    active: true,
    performance: 89,
    location: "San Francisco, CA",
  },
  {
    id: 1012,
    name: "Lucas Berg",
    email: "lucas.berg@acme.io",
    department: "Engineering",
    role: "Security Engineer",
    salary: 156000,
    status: "Remote",
    hireDate: "2021-01-19",
    active: true,
    performance: 93,
    location: "Minneapolis, MN",
  },
  {
    id: 1013,
    name: "Zoe Gallagher",
    email: "zoe.gallagher@acme.io",
    department: "Marketing",
    role: "Content Strategist",
    salary: 98000,
    status: "On Leave",
    hireDate: "2023-07-11",
    active: false,
    performance: 80,
    location: "Austin, TX",
  },
  {
    id: 1014,
    name: "Ethan Brooks",
    email: "ethan.brooks@acme.io",
    department: "Operations",
    role: "IT Systems Administrator",
    salary: 108000,
    status: "Active",
    hireDate: "2021-10-04",
    active: true,
    performance: 86,
    location: "Atlanta, GA",
  },
  {
    id: 1015,
    name: "Isabella Rossi",
    email: "isabella.rossi@acme.io",
    department: "Design",
    role: "Design Systems Lead",
    salary: 148000,
    status: "Remote",
    hireDate: "2020-05-25",
    active: true,
    performance: 97,
    location: "Seattle, WA",
  },
  {
    id: 1016,
    name: "Tariq Al-Mansoor",
    email: "tariq.almansoor@acme.io",
    department: "Sales",
    role: "Regional Sales Director",
    salary: 175000,
    status: "Active",
    hireDate: "2019-06-10",
    active: true,
    performance: 94,
    location: "New York, NY",
  },
  {
    id: 1017,
    name: "Claire Dubois",
    email: "claire.dubois@acme.io",
    department: "Product",
    role: "Technical Product Manager",
    salary: 149000,
    status: "Remote",
    hireDate: "2021-11-15",
    active: true,
    performance: 91,
    location: "Boston, MA",
  },
  {
    id: 1018,
    name: "Owen Wright",
    email: "owen.wright@acme.io",
    department: "Operations",
    role: "People Operations Partner",
    salary: 104000,
    status: "Contract",
    hireDate: "2023-09-01",
    active: false,
    performance: 83,
    location: "Chicago, IL",
  },
]

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
})

function formatCurrency(value: number): string {
  return currencyFormatter.format(value)
}

function StatusBadge({ status }: { status: EmploymentStatus }) {
  const variant =
    status === "Active"
      ? "default"
      : status === "Remote"
        ? "secondary"
        : status === "On Leave"
          ? "outline"
          : "destructive"

  return <Badge variant={variant}>{status}</Badge>
}

function generateEmployees(count: number): Employee[] {
  const firstNames = [
    "Elena",
    "Marcus",
    "Priya",
    "Liam",
    "Sofia",
    "David",
    "Amara",
    "Noah",
    "Hannah",
    "Carlos",
    "Mei-Ling",
    "Lucas",
    "Zoe",
    "Ethan",
    "Isabella",
    "Tariq",
  ]
  const lastNames = [
    "Rostova",
    "Vance",
    "Patel",
    "O'Connor",
    "Chen",
    "Kim",
    "Okafor",
    "Lindqvist",
    "Abbott",
    "Mendez",
    "Wu",
    "Berg",
    "Gallagher",
    "Brooks",
    "Rossi",
    "Wright",
  ]
  const roles = [
    "Software Engineer",
    "Product Designer",
    "Product Manager",
    "Account Executive",
    "Growth Lead",
    "Operations Specialist",
  ]
  const locations = [
    "San Francisco, CA",
    "New York, NY",
    "Austin, TX",
    "Seattle, WA",
    "Chicago, IL",
    "Boston, MA",
  ]

  return Array.from({ length: count }, (_, i) => {
    const first = firstNames[i % firstNames.length]!
    const last = lastNames[Math.floor(i / firstNames.length) % lastNames.length]!
    const dept = DEPARTMENTS[i % DEPARTMENTS.length]!
    const status = STATUSES[i % STATUSES.length]!
    const year = 2019 + (i % 6)
    const month = String((i % 12) + 1).padStart(2, "0")
    const day = String((i % 28) + 1).padStart(2, "0")

    return {
      id: 10000 + i,
      name: `${first} ${last} #${i + 1}`,
      email: `${first.toLowerCase()}.${last.toLowerCase().replace(/[^a-z]/g, "")}.${i + 1}@acme.io`,
      department: dept,
      role: roles[i % roles.length]!,
      salary: 85000 + ((i * 3750) % 105000),
      status,
      hireDate: `${year}-${month}-${day}`,
      active: status !== "On Leave" && status !== "Contract",
      performance: 72 + (i % 28),
      location: locations[i % locations.length]!,
    }
  })
}

const baseColumns: DataTableColumn<Employee>[] = [
  {
    field: "name",
    header: "Employee",
    minWidth: 180,
    body: (row) => (
      <div className="flex flex-col">
        <span className="font-medium text-foreground">{row.name}</span>
        <span className="text-xs text-muted-foreground">{row.email}</span>
      </div>
    ),
  },
  {
    field: "department",
    header: "Department",
    minWidth: 130,
  },
  {
    field: "role",
    header: "Role",
    minWidth: 190,
  },
  {
    field: "status",
    header: "Status",
    minWidth: 110,
    body: (row) => <StatusBadge status={row.status} />,
  },
  {
    field: "salary",
    header: "Salary",
    align: "right",
    minWidth: 120,
    body: (row) => (
      <span className="font-mono tabular-nums">
        {formatCurrency(row.salary)}
      </span>
    ),
  },
  {
    field: "hireDate",
    header: "Hire Date",
    minWidth: 120,
  },
]

// ---------------------------------------------------------------------------
// Storybook Meta
// ---------------------------------------------------------------------------

const meta = {
  title: "Components/DataTable",
  component: DataTable,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  argTypes: {
    size: {
      control: "inline-radio",
      options: ["sm", "md", "lg"],
      description: "Row density size",
    },
    showGridlines: {
      control: "boolean",
      description: "Render borders around all cells",
    },
    stripedRows: {
      control: "boolean",
      description: "Alternate row background colors",
    },
    hoverableRows: {
      control: "boolean",
      description: "Highlight row on hover",
    },
  },
} satisfies Meta<DataTableProps<Employee>>

export default meta
type Story = StoryObj<DataTableProps<Employee>>

// ---------------------------------------------------------------------------
// 1. Basic
// ---------------------------------------------------------------------------

export const Basic: Story = {
  args: {
    data: EMPLOYEES.slice(0, 8),
    columns: baseColumns,
    dataKey: "id",
    size: "md",
    showGridlines: false,
    stripedRows: false,
    hoverableRows: true,
    caption: "Q4 Engineering & Operations Directory",
  },
}

// ---------------------------------------------------------------------------
// 2. SortingSingleAndMultiple
// ---------------------------------------------------------------------------

function SortingSingleAndMultipleDemo() {
  const [sortMode, setSortMode] = React.useState<"single" | "multiple">(
    "multiple"
  )
  const [removableSort, setRemovableSort] = React.useState(true)

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-muted/30 px-3 py-2 text-sm">
        <span className="text-muted-foreground">
          {sortMode === "multiple"
            ? "Click column headers (or Shift+Click) to sort by multiple columns."
            : "Single column sort mode active."}
        </span>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={sortMode === "single" ? "default" : "outline"}
            onClick={() => setSortMode("single")}
          >
            Single Sort
          </Button>
          <Button
            size="sm"
            variant={sortMode === "multiple" ? "default" : "outline"}
            onClick={() => setSortMode("multiple")}
          >
            Multiple Sort
          </Button>
          <Button
            size="sm"
            variant={removableSort ? "secondary" : "outline"}
            onClick={() => setRemovableSort((v) => !v)}
          >
            Removable: {removableSort ? "On" : "Off"}
          </Button>
        </div>
      </div>

      <DataTable<Employee>
        data={EMPLOYEES}
        columns={baseColumns}
        dataKey="id"
        sortable
        sortMode={sortMode}
        removableSort={removableSort}
        sorting={[
          { id: "department", desc: false },
          { id: "salary", desc: true },
        ]}
      />
    </div>
  )
}

export const SortingSingleAndMultiple: Story = {
  render: () => <SortingSingleAndMultipleDemo />,
}

// ---------------------------------------------------------------------------
// 3. FilteringRowAndGlobal
// ---------------------------------------------------------------------------

export const FilteringRowAndGlobal: Story = {
  args: {
    data: EMPLOYEES,
    dataKey: "id",
    filterDisplay: "row",
    enableGlobalFilter: true,
    globalFilterPlaceholder: "Search all employee fields...",
    sortable: true,
    columns: [
      {
        field: "name",
        header: "Name",
        filterable: true,
        filterType: "text",
        filterPlaceholder: "Filter name...",
        minWidth: 160,
      },
      {
        field: "department",
        header: "Department",
        filterable: true,
        filterType: "select",
        filterOptions: DEPARTMENT_OPTIONS,
        filterPlaceholder: "All depts",
        minWidth: 150,
      },
      {
        field: "salary",
        header: "Salary",
        align: "right",
        filterable: true,
        filterType: "number",
        filterMatchMode: "gte",
        filterPlaceholder: "Min salary...",
        minWidth: 140,
        body: (row) => (
          <span className="font-mono tabular-nums">
            {formatCurrency(row.salary)}
          </span>
        ),
      },
      {
        field: "active",
        header: "Active",
        align: "center",
        filterable: true,
        filterType: "boolean",
        minWidth: 120,
        body: (row) =>
          row.active ? (
            <CheckCircle2Icon className="mx-auto size-4 text-emerald-600" />
          ) : (
            <XCircleIcon className="mx-auto size-4 text-muted-foreground" />
          ),
      },
      {
        field: "hireDate",
        header: "Hire Date",
        filterable: true,
        filterType: "date",
        minWidth: 150,
      },
    ],
  },
}

// ---------------------------------------------------------------------------
// 4. FilteringMenuPopover
// ---------------------------------------------------------------------------

export const FilteringMenuPopover: Story = {
  args: {
    data: EMPLOYEES,
    dataKey: "id",
    filterDisplay: "menu",
    enableGlobalFilter: true,
    sortable: true,
    columns: [
      {
        field: "name",
        header: "Name",
        filterable: true,
        filterType: "text",
        filterMatchMode: "contains",
        filterMatchModes: [
          "contains",
          "notContains",
          "startsWith",
          "endsWith",
          "equals",
        ],
        minWidth: 170,
      },
      {
        field: "department",
        header: "Department",
        filterable: true,
        filterType: "select",
        filterOptions: DEPARTMENT_OPTIONS,
        filterMatchMode: "equals",
        filterMatchModes: ["equals", "notEquals"],
        minWidth: 140,
      },
      {
        field: "status",
        header: "Status",
        filterable: true,
        filterType: "select",
        filterOptions: STATUS_OPTIONS,
        minWidth: 120,
        body: (row) => <StatusBadge status={row.status} />,
      },
      {
        field: "salary",
        header: "Salary",
        align: "right",
        filterable: true,
        filterType: "number",
        filterMatchMode: "gte",
        filterMatchModes: ["equals", "gt", "gte", "lt", "lte", "between"],
        minWidth: 130,
        body: (row) => (
          <span className="font-mono tabular-nums">
            {formatCurrency(row.salary)}
          </span>
        ),
      },
      {
        field: "hireDate",
        header: "Hire Date",
        filterable: true,
        filterType: "date",
        filterMatchMode: "dateAfter",
        filterMatchModes: ["dateIs", "dateBefore", "dateAfter"],
        minWidth: 140,
      },
    ],
  },
}

// ---------------------------------------------------------------------------
// 5. Pagination
// ---------------------------------------------------------------------------

export const Pagination: Story = {
  args: {
    data: EMPLOYEES,
    columns: baseColumns,
    dataKey: "id",
    sortable: true,
    paginator: true,
    paginatorPosition: "both",
    rows: 5,
    rowsPerPageOptions: [5, 10, 15, 25],
    currentPageReportTemplate:
      "Showing {first} to {last} of {totalRecords} employees",
    showCurrentPageReport: true,
  },
}

// ---------------------------------------------------------------------------
// 6. SelectionModes
// ---------------------------------------------------------------------------

function SelectionModesDemo() {
  const [mode, setMode] = React.useState<SelectionMode>("checkbox")
  const [selection, setSelection] = React.useState<
    Employee | Employee[] | null
  >([EMPLOYEES[0]!, EMPLOYEES[2]!])

  const selectedList = React.useMemo<Employee[]>(() => {
    if (!selection) return []
    return Array.isArray(selection) ? selection : [selection]
  }, [selection])

  const handleModeChange = (nextMode: SelectionMode) => {
    setMode(nextMode)
    setSelection(
      nextMode === "single" || nextMode === "radiobutton" ? null : []
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-muted/30 px-3 py-2">
        <div className="flex flex-wrap items-center gap-1.5">
          {(
            ["checkbox", "radiobutton", "single", "multiple"] as SelectionMode[]
          ).map((item) => (
            <Button
              key={item}
              size="sm"
              variant={mode === item ? "default" : "outline"}
              onClick={() => handleModeChange(item)}
            >
              {item}
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Badge variant="secondary">
            {selectedList.length} selected
          </Badge>
          {selectedList.length > 0 && (
            <Button
              size="xs"
              variant="ghost"
              onClick={() =>
                setSelection(
                  mode === "single" || mode === "radiobutton" ? null : []
                )
              }
            >
              Clear
            </Button>
          )}
        </div>
      </div>

      {selectedList.length > 0 && (
        <div className="rounded-md border bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">Selected: </span>
          {selectedList.map((emp) => emp.name).join(", ")}
        </div>
      )}

      <DataTable<Employee>
        data={EMPLOYEES.slice(0, 10)}
        columns={baseColumns}
        dataKey="id"
        selectionMode={mode}
        selection={selection}
        onSelectionChange={setSelection}
      />
    </div>
  )
}

export const SelectionModes: Story = {
  render: () => <SelectionModesDemo />,
}

// ---------------------------------------------------------------------------
// 7. RowExpansion
// ---------------------------------------------------------------------------

export const RowExpansion: Story = {
  args: {
    data: EMPLOYEES.slice(0, 10),
    columns: baseColumns,
    dataKey: "id",
    expandableRows: true,
    rowExpansionTemplate: (emp) => (
      <div className="grid gap-4 rounded-lg border bg-background p-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex items-start gap-2.5">
          <MailIcon className="mt-0.5 size-4 text-muted-foreground" />
          <div className="text-xs">
            <div className="font-medium text-muted-foreground">Email</div>
            <div className="font-medium text-foreground">{emp.email}</div>
          </div>
        </div>

        <div className="flex items-start gap-2.5">
          <MapPinIcon className="mt-0.5 size-4 text-muted-foreground" />
          <div className="text-xs">
            <div className="font-medium text-muted-foreground">Location</div>
            <div className="font-medium text-foreground">{emp.location}</div>
          </div>
        </div>

        <div className="flex items-start gap-2.5">
          <CalendarIcon className="mt-0.5 size-4 text-muted-foreground" />
          <div className="text-xs">
            <div className="font-medium text-muted-foreground">Hire Date</div>
            <div className="font-medium text-foreground">{emp.hireDate}</div>
          </div>
        </div>

        <div className="flex items-start gap-2.5">
          <TrendingUpIcon className="mt-0.5 size-4 text-muted-foreground" />
          <div className="w-full text-xs">
            <div className="flex items-center justify-between font-medium text-muted-foreground">
              <span>Performance</span>
              <span className="text-foreground">{emp.performance}%</span>
            </div>
            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${emp.performance}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    ),
  },
}

// ---------------------------------------------------------------------------
// 8. RowGroupingAndAggregations
// ---------------------------------------------------------------------------

export const RowGroupingAndAggregations: Story = {
  args: {
    data: EMPLOYEES,
    dataKey: "id",
    rowGroupMode: "subheader",
    groupRowsBy: "department",
    expandableRowGroups: true,
    rowGroupHeaderTemplate: (groupValue, rows) => (
      <div className="flex items-center gap-2">
        <Building2Icon className="size-4 text-muted-foreground" />
        <span className="font-semibold">{String(groupValue)}</span>
        <Badge variant="secondary">{rows.length} members</Badge>
      </div>
    ),
    rowGroupFooterTemplate: (groupValue, rows) => {
      const totalSalary = rows.reduce(
        (acc, r) => acc + r.original.salary,
        0
      )
      return (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{String(groupValue)} Subtotal</span>
          <span className="font-mono font-semibold text-foreground">
            {formatCurrency(totalSalary)}
          </span>
        </div>
      )
    },
    columns: [
      {
        field: "name",
        header: "Employee",
        minWidth: 180,
      },
      {
        field: "role",
        header: "Role",
        minWidth: 190,
      },
      {
        field: "status",
        header: "Status",
        minWidth: 110,
        body: (row) => <StatusBadge status={row.status} />,
      },
      {
        field: "performance",
        header: "Performance",
        align: "right",
        minWidth: 120,
        body: (row) => `${row.performance}%`,
        aggregation: "avg",
        aggregationFormatter: (val) =>
          val !== null ? `Avg: ${val.toFixed(1)}%` : "-",
      },
      {
        field: "salary",
        header: "Salary",
        align: "right",
        minWidth: 140,
        body: (row) => (
          <span className="font-mono tabular-nums">
            {formatCurrency(row.salary)}
          </span>
        ),
        aggregation: "sum",
        aggregationFormatter: (val) =>
          val !== null ? `Total: ${formatCurrency(val)}` : "-",
      },
    ],
  },
}

// ---------------------------------------------------------------------------
// 9. InlineCellEditing
// ---------------------------------------------------------------------------

function InlineCellEditingDemo() {
  const [rows, setRows] = React.useState<Employee[]>(() =>
    EMPLOYEES.slice(0, 8)
  )
  const [lastEdit, setLastEdit] = React.useState<string | null>(null)

  const columns: DataTableColumn<Employee>[] = [
    {
      field: "name",
      header: "Name",
      editable: true,
      minWidth: 170,
    },
    {
      field: "role",
      header: "Role",
      editable: true,
      minWidth: 200,
    },
    {
      field: "department",
      header: "Department",
      editable: true,
      minWidth: 140,
      editor: ({ value, onChange, onCommit }) => (
        <select
          className="h-7 w-full rounded border border-input bg-background px-2 text-sm"
          value={String(value)}
          autoFocus
          onChange={(e) => {
            onChange(e.target.value as Department)
          }}
          onBlur={onCommit}
        >
          {DEPARTMENTS.map((dept) => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
        </select>
      ),
    },
    {
      field: "salary",
      header: "Salary",
      align: "right",
      editable: true,
      minWidth: 130,
      onCellEditValidate: (newValue) => {
        const num = Number(newValue)
        if (Number.isNaN(num) || num < 30000) {
          return "Salary must be at least $30,000"
        }
        return true
      },
      body: (row) => (
        <span className="font-mono tabular-nums">
          {formatCurrency(row.salary)}
        </span>
      ),
    },
    {
      field: "status",
      header: "Status",
      minWidth: 110,
      body: (row) => <StatusBadge status={row.status} />,
    },
  ]

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-2 text-sm">
        <span className="text-muted-foreground">
          Click any editable cell (Name, Role, Department, Salary) to edit
          inline. Press Enter to save or Escape to cancel.
        </span>
        {lastEdit && (
          <Badge variant="secondary" className="font-mono text-xs">
            {lastEdit}
          </Badge>
        )}
      </div>

      <DataTable<Employee>
        data={rows}
        columns={columns}
        dataKey="id"
        editMode="cell"
        onCellEditComplete={(event) => {
          const parsedValue =
            event.field === "salary"
              ? Number(event.newValue)
              : event.newValue
          setRows((prev) =>
            prev.map((item) =>
              item.id === event.rowData.id
                ? { ...item, [event.field]: parsedValue }
                : item
            )
          )
          setLastEdit(
            `Updated ${event.rowData.name}'s ${event.field} → ${String(parsedValue)}`
          )
        }}
      />
    </div>
  )
}

export const InlineCellEditing: Story = {
  render: () => <InlineCellEditingDemo />,
}

// ---------------------------------------------------------------------------
// 10. InlineRowEditing
// ---------------------------------------------------------------------------

function InlineRowEditingDemo() {
  const [rows, setRows] = React.useState<Employee[]>(() =>
    EMPLOYEES.slice(0, 8)
  )
  const [log, setLog] = React.useState<string>(
    "Click the edit icon on any row to edit multiple fields at once."
  )

  const columns: DataTableColumn<Employee>[] = [
    {
      field: "name",
      header: "Name",
      editable: true,
      minWidth: 170,
    },
    {
      field: "department",
      header: "Department",
      editable: true,
      minWidth: 140,
    },
    {
      field: "role",
      header: "Role",
      editable: true,
      minWidth: 190,
    },
    {
      field: "salary",
      header: "Salary",
      align: "right",
      editable: true,
      minWidth: 130,
      body: (row) => (
        <span className="font-mono tabular-nums">
          {formatCurrency(row.salary)}
        </span>
      ),
    },
    {
      field: "status",
      header: "Status",
      minWidth: 110,
      body: (row) => <StatusBadge status={row.status} />,
    },
  ]

  return (
    <div className="space-y-3">
      <div className="rounded-lg border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
        {log}
      </div>

      <DataTable<Employee>
        data={rows}
        columns={columns}
        dataKey="id"
        editMode="row"
        onRowEditComplete={(event) => {
          const nextRow: Employee = {
            ...event.newData,
            salary: Number(event.newData.salary),
          }
          setRows((prev) =>
            prev.map((item) => (item.id === nextRow.id ? nextRow : item))
          )
          setLog(`Saved changes for ${nextRow.name}`)
        }}
        onRowEditCancel={(data) => {
          setLog(`Cancelled editing for ${data.name}`)
        }}
      />
    </div>
  )
}

export const InlineRowEditing: Story = {
  render: () => <InlineRowEditingDemo />,
}

// ---------------------------------------------------------------------------
// 11. FrozenResizableReorderableColumns
// ---------------------------------------------------------------------------

export const FrozenResizableReorderableColumns: Story = {
  args: {
    data: EMPLOYEES,
    dataKey: "id",
    scrollable: true,
    scrollHeight: "360px",
    resizableColumns: true,
    reorderableColumns: true,
    showGridlines: true,
    columns: [
      {
        field: "name",
        header: "Employee",
        frozen: true,
        width: 200,
        minWidth: 160,
      },
      {
        field: "email",
        header: "Email",
        width: 240,
        minWidth: 180,
      },
      {
        field: "department",
        header: "Department",
        width: 150,
      },
      {
        field: "role",
        header: "Role",
        width: 220,
      },
      {
        field: "location",
        header: "Location",
        width: 180,
      },
      {
        field: "hireDate",
        header: "Hire Date",
        width: 140,
      },
      {
        field: "performance",
        header: "Performance",
        align: "right",
        width: 130,
        body: (row) => `${row.performance}%`,
      },
      {
        field: "salary",
        header: "Salary",
        align: "right",
        frozen: true,
        alignFrozen: "right",
        width: 140,
        body: (row) => (
          <span className="font-mono font-medium tabular-nums">
            {formatCurrency(row.salary)}
          </span>
        ),
      },
    ],
  },
}

// ---------------------------------------------------------------------------
// 12. ColumnGrouping
// ---------------------------------------------------------------------------

const groupedHeaders: ColumnGroupRow[] = [
  {
    cells: [
      {
        header: "Employee Profile",
        colSpan: 3,
        align: "center",
      },
      {
        header: "Compensation & Metrics",
        colSpan: 3,
        align: "center",
      },
    ],
  },
  {
    cells: [
      { header: "Name", field: "name", sortable: true },
      { header: "Department", field: "department", sortable: true },
      { header: "Location", field: "location" },
      { header: "Status", field: "status", align: "center" },
      { header: "Performance", field: "performance", align: "right", sortable: true },
      { header: "Salary", field: "salary", align: "right", sortable: true },
    ],
  },
]

const groupedFooters: ColumnGroupRow[] = [
  {
    cells: [
      { footer: "Company Totals (8 shown)", colSpan: 4, align: "right" },
      {
        footer: `${(
          EMPLOYEES.slice(0, 8).reduce((s, e) => s + e.performance, 0) / 8
        ).toFixed(1)}% avg`,
        align: "right",
      },
      {
        footer: formatCurrency(
          EMPLOYEES.slice(0, 8).reduce((s, e) => s + e.salary, 0)
        ),
        align: "right",
      },
    ],
  },
]

export const ColumnGrouping: Story = {
  args: {
    data: EMPLOYEES.slice(0, 8),
    dataKey: "id",
    showGridlines: true,
    sortable: true,
    headerColumnGroup: groupedHeaders,
    footerColumnGroup: groupedFooters,
    columns: [
      { field: "name", header: "Name", minWidth: 160 },
      { field: "department", header: "Department", minWidth: 130 },
      { field: "location", header: "Location", minWidth: 150 },
      {
        field: "status",
        header: "Status",
        align: "center",
        minWidth: 110,
        body: (row) => <StatusBadge status={row.status} />,
      },
      {
        field: "performance",
        header: "Performance",
        align: "right",
        minWidth: 110,
        body: (row) => `${row.performance}%`,
      },
      {
        field: "salary",
        header: "Salary",
        align: "right",
        minWidth: 130,
        body: (row) => (
          <span className="font-mono tabular-nums">
            {formatCurrency(row.salary)}
          </span>
        ),
      },
    ],
  },
}

// ---------------------------------------------------------------------------
// 13. VirtualScroll10kRows
// ---------------------------------------------------------------------------

function VirtualScroll10kRowsDemo() {
  const largeDataset = React.useMemo(() => generateEmployees(10_000), [])

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          Rendering <strong>10,000</strong> rows via{" "}
          <code>@tanstack/react-virtual</code>
        </span>
        <Badge variant="outline">10,000 records</Badge>
      </div>

      <DataTable<Employee>
        data={largeDataset}
        columns={baseColumns}
        dataKey="id"
        scrollable
        scrollHeight="420px"
        virtualScrollerOptions={{ itemSize: 40, overscan: 10 }}
        sortable
        enableGlobalFilter
      />
    </div>
  )
}

export const VirtualScroll10kRows: Story = {
  render: () => <VirtualScroll10kRowsDemo />,
}

// ---------------------------------------------------------------------------
// 14. ContextMenuAndExport
// ---------------------------------------------------------------------------

function ContextMenuAndExportDemo() {
  const [rows, setRows] = React.useState<Employee[]>(() =>
    EMPLOYEES.slice(0, 10)
  )
  const [actionMessage, setActionMessage] = React.useState<string>(
    "Right-click any row for actions, or use the toolbar to toggle columns and export CSV/JSON."
  )

  const contextMenuItems = (row: Employee): ContextMenuItem<Employee>[] => [
    {
      id: "copy-email",
      label: "Copy Email",
      icon: <CopyIcon className="size-4" />,
      onSelect: () => {
        setActionMessage(`Copied email: ${row.email}`)
      },
    },
    {
      id: "raise",
      label: "Give 5% Raise",
      icon: <DollarSignIcon className="size-4" />,
      onSelect: () => {
        const nextSalary = Math.round(row.salary * 1.05)
        setRows((prev) =>
          prev.map((item) =>
            item.id === row.id ? { ...item, salary: nextSalary } : item
          )
        )
        setActionMessage(
          `Increased ${row.name}'s salary to ${formatCurrency(nextSalary)}`
        )
      },
    },
    {
      id: "toggle-active",
      label: row.active ? "Mark Inactive" : "Mark Active",
      icon: <UserCheckIcon className="size-4" />,
      onSelect: () => {
        setRows((prev) =>
          prev.map((item) =>
            item.id === row.id
              ? {
                  ...item,
                  active: !item.active,
                  status: !item.active ? "Active" : "On Leave",
                }
              : item
          )
        )
        setActionMessage(
          `${row.name} marked as ${row.active ? "Inactive" : "Active"}`
        )
      },
    },
    {
      id: "delete",
      label: "Remove Employee",
      icon: <Trash2Icon className="size-4" />,
      destructive: true,
      separatorBefore: true,
      onSelect: () => {
        setRows((prev) => prev.filter((item) => item.id !== row.id))
        setActionMessage(`Removed ${row.name} from directory`)
      },
    },
  ]

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2 rounded-lg border bg-muted/30 px-3 py-2 text-sm">
        <span className="text-muted-foreground">{actionMessage}</span>
        <Button
          size="xs"
          variant="outline"
          onClick={() => {
            setRows(EMPLOYEES.slice(0, 10))
            setActionMessage("Reset dataset to initial 10 employees.")
          }}
        >
          <RefreshCwIcon className="size-3.5" />
          Reset
        </Button>
      </div>

      <DataTable<Employee>
        data={rows}
        columns={baseColumns}
        dataKey="id"
        contextMenuItems={contextMenuItems}
        exportable
        exportFilename="employees-directory"
        columnToggle
        enableGlobalFilter
        sortable
      />
    </div>
  )
}

export const ContextMenuAndExport: Story = {
  render: () => <ContextMenuAndExportDemo />,
}

// ---------------------------------------------------------------------------
// 15. LoadingAndEmptyStates
// ---------------------------------------------------------------------------

function LoadingAndEmptyStatesDemo() {
  const [mode, setMode] = React.useState<"loading" | "empty" | "loaded">(
    "loading"
  )

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2">
        <Button
          size="sm"
          variant={mode === "loading" ? "default" : "outline"}
          onClick={() => setMode("loading")}
        >
          Loading Skeleton
        </Button>
        <Button
          size="sm"
          variant={mode === "empty" ? "default" : "outline"}
          onClick={() => setMode("empty")}
        >
          Empty State
        </Button>
        <Button
          size="sm"
          variant={mode === "loaded" ? "default" : "outline"}
          onClick={() => setMode("loaded")}
        >
          Loaded Data
        </Button>
      </div>

      <DataTable<Employee>
        data={mode === "loaded" ? EMPLOYEES.slice(0, 6) : []}
        columns={baseColumns}
        dataKey="id"
        loading={mode === "loading"}
        skeletonRows={6}
        emptyMessage={
          <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
            <InboxIcon className="size-10 text-muted-foreground/60" />
            <div className="text-sm font-medium text-foreground">
              No employees found
            </div>
            <p className="max-w-xs text-xs text-muted-foreground">
              There are no records matching your current view. Load sample
              employees to populate the table.
            </p>
            <Button
              size="sm"
              variant="outline"
              className="mt-1"
              onClick={() => setMode("loaded")}
            >
              Load Sample Data
            </Button>
          </div>
        }
      />
    </div>
  )
}

export const LoadingAndEmptyStates: Story = {
  render: () => <LoadingAndEmptyStatesDemo />,
}

// ---------------------------------------------------------------------------
// 16. ResponsiveStackLayout
// ---------------------------------------------------------------------------

function ResponsiveStackLayoutDemo() {
  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-xs text-foreground">
        <strong>Mobile / Tablet Viewport Note:</strong> Resize your browser or
        switch Storybook&apos;s viewport to mobile/tablet (&lt; 768px /{" "}
        <code>md</code>) to see rows automatically transform into stacked
        cards with column labels.
      </div>

      <DataTable<Employee>
        data={EMPLOYEES}
        columns={baseColumns}
        dataKey="id"
        responsiveLayout="stack"
        breakpoint="md"
        paginator
        rows={6}
        sortable
        enableGlobalFilter
        globalFilterPlaceholder="Search employees..."
        stripedRows
      />
    </div>
  )
}

export const ResponsiveStackLayout: Story = {
  render: () => <ResponsiveStackLayoutDemo />,
  parameters: {
    docs: {
      description: {
        story:
          'Showcases `responsiveLayout="stack"` with `breakpoint="md"`, `paginator`, `sortable`, and `enableGlobalFilter`. Below the `md` breakpoint, table rows render as stacked cards.',
      },
    },
  },
}
