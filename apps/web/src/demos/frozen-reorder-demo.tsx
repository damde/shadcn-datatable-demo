import * as React from "react"
import {
  DataTable,
  type ColumnGroupRow,
  type ColumnResizeMode,
  type DataTableColumn,
  type RowReorderEvent,
} from "@workspace/ui/components/data-table"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  ArrowLeftRight,
  GripVertical,
  Pin,
  RotateCcw,
} from "lucide-react"
import { generateEmployees, type Employee } from "@/data/mock-employees"
import {
  EmployeeAvatarCell,
  PerformanceBar,
  StatusBadge,
  formatCurrency,
} from "./shared-columns"

export function FrozenReorderDemo() {
  const initialData = React.useMemo(() => generateEmployees(25), [])
  const [data, setData] = React.useState<Employee[]>(initialData)
  const [resizeMode, setResizeMode] = React.useState<ColumnResizeMode>("fit")
  const [columnOrder, setColumnOrder] = React.useState<string[]>([])
  const [reorderLog, setReorderLog] = React.useState<string | null>(null)

  const columns = React.useMemo<DataTableColumn<Employee>[]>(
    () => [
      {
        field: "id",
        header: "ID",
        frozen: true,
        alignFrozen: "left",
        sortable: true,
        width: 110,
        minWidth: 90,
        className: "font-mono text-xs",
      },
      {
        field: "name",
        header: "Employee",
        frozen: true,
        alignFrozen: "left",
        sortable: true,
        width: 230,
        minWidth: 180,
        body: (emp) => <EmployeeAvatarCell employee={emp} />,
      },
      {
        field: "department",
        header: "Department",
        sortable: true,
        width: 145,
        body: (emp) => <Badge variant="secondary">{emp.department}</Badge>,
      },
      {
        field: "role",
        header: "Role",
        sortable: true,
        width: 220,
      },
      {
        field: "country",
        header: "Country",
        sortable: true,
        width: 150,
      },
      {
        field: "joinDate",
        header: "Join Date",
        sortable: true,
        width: 130,
        className: "font-mono text-xs",
      },
      {
        field: "performance",
        header: "Rating",
        sortable: true,
        width: 155,
        body: (emp) => <PerformanceBar score={emp.performance} />,
      },
      {
        field: "status",
        header: "Status",
        sortable: true,
        width: 130,
        body: (emp) => <StatusBadge status={emp.status} />,
      },
      {
        field: "salary",
        header: "Salary",
        frozen: true,
        alignFrozen: "right",
        sortable: true,
        align: "right",
        width: 135,
        minWidth: 110,
        body: (emp) => (
          <span className="font-mono font-medium tabular-nums">
            {formatCurrency(emp.salary)}
          </span>
        ),
      },
    ],
    []
  )

  const headerColumnGroup = React.useMemo<ColumnGroupRow[]>(
    () => [
      {
        cells: [
          {
            header: "",
            colSpan: 1,
            className: "bg-muted/40",
          },
          {
            header: (
              <span className="inline-flex items-center gap-1.5 text-xs">
                <Pin className="size-3 text-primary" />
                Identity (Frozen Left)
              </span>
            ),
            colSpan: 2,
            align: "center",
            className: "bg-muted/50 font-semibold",
          },
          {
            header: "Organization & Location",
            colSpan: 4,
            align: "center",
            className: "bg-muted/20 font-semibold text-xs",
          },
          {
            header: "Metrics & Status",
            colSpan: 2,
            align: "center",
            className: "bg-muted/20 font-semibold text-xs",
          },
          {
            header: (
              <span className="inline-flex items-center gap-1.5 text-xs">
                <Pin className="size-3 text-primary" />
                Comp (Right)
              </span>
            ),
            colSpan: 1,
            align: "center",
            className: "bg-muted/50 font-semibold",
          },
        ],
      },
    ],
    []
  )

  const handleRowReorder = (event: RowReorderEvent<Employee>) => {
    setData(event.value)
    setReorderLog(
      `Moved row from position ${event.dragIndex + 1} to ${event.dropIndex + 1}`
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border bg-card p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">
              Resize Mode:
            </span>
            <div className="inline-flex rounded-lg border bg-muted/50 p-0.5">
              <Button
                size="sm"
                variant={resizeMode === "fit" ? "default" : "ghost"}
                onClick={() => setResizeMode("fit")}
              >
                Fit
              </Button>
              <Button
                size="sm"
                variant={resizeMode === "expand" ? "default" : "ghost"}
                onClick={() => setResizeMode("expand")}
              >
                Expand
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <ArrowLeftRight className="size-3.5" />
              Drag column headers to reorder
            </span>
            <span className="inline-flex items-center gap-1">
              <GripVertical className="size-3.5" />
              Drag row handles to reorder rows
            </span>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setData(initialData)
            setColumnOrder([])
            setReorderLog("Restored original row & column order")
          }}
        >
          <RotateCcw className="size-3.5" />
          Reset Order
        </Button>
      </div>

      {reorderLog && (
        <div className="flex items-center justify-between rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-xs">
          <span>{reorderLog}</span>
          <button
            type="button"
            onClick={() => setReorderLog(null)}
            className="text-muted-foreground hover:text-foreground"
          >
            Dismiss
          </button>
        </div>
      )}

      <DataTable<Employee>
        data={data}
        columns={columns}
        dataKey="id"
        scrollable
        scrollHeight="460px"
        showGridlines
        sortable
        resizableColumns
        columnResizeMode={resizeMode}
        reorderableColumns
        columnOrder={columnOrder}
        onColumnOrderChange={setColumnOrder}
        reorderableRows
        onRowReorder={handleRowReorder}
        headerColumnGroup={headerColumnGroup}
      />
    </div>
  )
}
