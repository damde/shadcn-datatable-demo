import * as React from "react"
import {
  DataTable,
  type DataTableColumn,
  type DataTableLazyParams,
  type DataTableRef,
} from "@workspace/ui/components/data-table"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Database, HardDrive, Trash2 } from "lucide-react"
import {
  DEPARTMENTS,
  EMPLOYEE_STATUSES,
  generateEmployees,
  type Employee,
} from "@/data/mock-employees"
import {
  EmployeeAvatarCell,
  PerformanceBar,
  StatusBadge,
  formatCurrency,
} from "./shared-columns"

const STATE_KEY = "shadcn-datatable-lazy-demo"
const SERVER_DATASET = generateEmployees(250)

function simulateServerQuery(params: DataTableLazyParams): {
  rows: Employee[]
  totalRecords: number
} {
  let result = [...SERVER_DATASET]

  // Global filter
  const q = params.globalFilter.trim().toLowerCase()
  if (q) {
    result = result.filter(
      (emp) =>
        emp.id.toLowerCase().includes(q) ||
        emp.name.toLowerCase().includes(q) ||
        emp.email.toLowerCase().includes(q) ||
        emp.department.toLowerCase().includes(q) ||
        emp.role.toLowerCase().includes(q) ||
        emp.country.toLowerCase().includes(q)
    )
  }

  // Column filters
  for (const filter of params.columnFilters) {
    const rawVal = filter.value
    const actualVal =
      rawVal !== null &&
      typeof rawVal === "object" &&
      "value" in (rawVal as Record<string, unknown>)
        ? (rawVal as { value: unknown }).value
        : rawVal

    if (actualVal === undefined || actualVal === null || actualVal === "") {
      continue
    }

    result = result.filter((emp) => {
      const cell = emp[filter.id as keyof Employee]
      if (Array.isArray(actualVal)) {
        return actualVal.length === 0 || actualVal.includes(String(cell))
      }
      return String(cell)
        .toLowerCase()
        .includes(String(actualVal).toLowerCase())
    })
  }

  // Sorting
  if (params.sorting.length > 0) {
    result.sort((a, b) => {
      for (const sort of params.sorting) {
        const key = sort.id as keyof Employee
        const aVal = a[key]
        const bVal = b[key]
        const cmp =
          typeof aVal === "number" && typeof bVal === "number"
            ? aVal - bVal
            : String(aVal).localeCompare(String(bVal))
        if (cmp !== 0) {
          return sort.desc ? -cmp : cmp
        }
      }
      return 0
    })
  }

  const totalRecords = result.length
  const rows = result.slice(params.first, params.first + params.rows)
  return { rows, totalRecords }
}

export function LazyPersistenceDemo() {
  const tableRef = React.useRef<DataTableRef<Employee>>(null)
  const [rows, setRows] = React.useState<Employee[]>(() =>
    SERVER_DATASET.slice(0, 8)
  )
  const [totalRecords, setTotalRecords] = React.useState<number>(
    SERVER_DATASET.length
  )
  const [loading, setLoading] = React.useState(false)
  const [lastQuery, setLastQuery] = React.useState<DataTableLazyParams | null>(
    null
  )
  const timerRef = React.useRef<number | null>(null)

  React.useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current)
      }
    }
  }, [])

  const handleLazyLoad = React.useCallback((params: DataTableLazyParams) => {
    setLastQuery(params)
    setLoading(true)

    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current)
    }

    timerRef.current = window.setTimeout(() => {
      const response = simulateServerQuery(params)
      setRows(response.rows)
      setTotalRecords(response.totalRecords)
      setLoading(false)
    }, 400)
  }, [])

  const columns = React.useMemo<DataTableColumn<Employee>[]>(
    () => [
      {
        field: "id",
        header: "ID",
        sortable: true,
        filterable: true,
        width: 110,
        className: "font-mono text-xs",
      },
      {
        field: "name",
        header: "Employee",
        sortable: true,
        filterable: true,
        width: 230,
        body: (emp) => <EmployeeAvatarCell employee={emp} />,
      },
      {
        field: "department",
        header: "Department",
        sortable: true,
        filterable: true,
        filterType: "select",
        filterOptions: DEPARTMENTS.map((d) => ({ label: d, value: d })),
        width: 145,
        body: (emp) => <Badge variant="secondary">{emp.department}</Badge>,
      },
      {
        field: "role",
        header: "Role",
        sortable: true,
        filterable: true,
        width: 210,
      },
      {
        field: "status",
        header: "Status",
        sortable: true,
        filterable: true,
        filterType: "select",
        filterOptions: EMPLOYEE_STATUSES.map((s) => ({ label: s, value: s })),
        width: 130,
        body: (emp) => <StatusBadge status={emp.status} />,
      },
      {
        field: "salary",
        header: "Salary",
        sortable: true,
        align: "right",
        width: 130,
        body: (emp) => (
          <span className="font-mono tabular-nums">
            {formatCurrency(emp.salary)}
          </span>
        ),
      },
      {
        field: "performance",
        header: "Rating",
        sortable: true,
        width: 145,
        body: (emp) => <PerformanceBar score={emp.performance} />,
      },
    ],
    []
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border bg-card p-4">
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <Badge variant="outline" className="gap-1">
            <Database className="size-3" />
            Lazy Server Mode (400ms simulated)
          </Badge>
          <Badge variant="outline" className="gap-1">
            <HardDrive className="size-3" />
            localStorage: <code>{STATE_KEY}</code>
          </Badge>
          <span>
            Sort, filter, paginate, or toggle columns — reload the page and your
            table state persists.
          </span>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            localStorage.removeItem(STATE_KEY)
            tableRef.current?.reset()
          }}
        >
          <Trash2 className="size-3.5" />
          Clear Saved State
        </Button>
      </div>

      {lastQuery && (
        <div className="rounded-lg border bg-muted/40 px-3 py-2 font-mono text-[11px] text-muted-foreground">
          <span className="font-semibold text-foreground">Last Lazy Query:</span>{" "}
          page={lastQuery.page + 1} · rows={lastQuery.rows} · sorting=
          {JSON.stringify(lastQuery.sorting)} · filters=
          {lastQuery.columnFilters.length} · global=&quot;
          {lastQuery.globalFilter}&quot;
        </div>
      )}

      <DataTable<Employee>
        ref={tableRef}
        data={rows}
        columns={columns}
        dataKey="id"
        lazy
        totalRecords={totalRecords}
        loading={loading}
        skeletonRows={8}
        onLazyLoad={handleLazyLoad}
        sortable
        filterDisplay="menu"
        enableGlobalFilter
        globalFilterPlaceholder="Server-side search..."
        paginator
        rows={8}
        rowsPerPageOptions={[5, 8, 15, 25]}
        columnToggle
        stateStorage="local"
        stateKey={STATE_KEY}
      />
    </div>
  )
}
