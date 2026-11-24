import * as React from "react"
import {
  DataTable,
  type DataTableColumn,
  type DataTableRef,
} from "@workspace/ui/components/data-table"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { ArrowDownToLine, Zap } from "lucide-react"
import { generateEmployees, type Employee } from "@/data/mock-employees"
import {
  PerformanceBar,
  StatusBadge,
  VerifiedIndicator,
  formatCurrency,
} from "./shared-columns"

export function VirtualScrollDemo() {
  const tableRef = React.useRef<DataTableRef<Employee>>(null)
  const data = React.useMemo(() => generateEmployees(10_000), [])

  const columns = React.useMemo<DataTableColumn<Employee>[]>(
    () => [
      {
        field: "id",
        header: "ID",
        sortable: true,
        width: 115,
        className: "font-mono text-xs text-muted-foreground",
      },
      {
        field: "name",
        header: "Name",
        sortable: true,
        width: 190,
        className: "font-medium",
      },
      {
        field: "department",
        header: "Department",
        sortable: true,
        width: 140,
        body: (emp) => <Badge variant="secondary">{emp.department}</Badge>,
      },
      {
        field: "role",
        header: "Role",
        sortable: true,
        width: 210,
      },
      {
        field: "status",
        header: "Status",
        sortable: true,
        width: 125,
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
      {
        field: "country",
        header: "Country",
        sortable: true,
        width: 140,
      },
      {
        field: "verified",
        header: "Verified",
        sortable: true,
        width: 115,
        body: (emp) => <VerifiedIndicator verified={emp.verified} />,
      },
    ],
    []
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border bg-card p-4">
        <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
          <Badge className="gap-1">
            <Zap className="size-3" />
            10,000 Rows
          </Badge>
          <span>
            Powered by <code>@tanstack/react-virtual</code> with instant search
            &amp; sorting.
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">Jump to:</span>
          {[0, 2499, 4999, 9999].map((idx) => (
            <Button
              key={idx}
              variant="outline"
              size="sm"
              onClick={() => tableRef.current?.scrollToIndex(idx)}
            >
              <ArrowDownToLine className="size-3.5" />
              Row #{(idx + 1).toLocaleString()}
            </Button>
          ))}
        </div>
      </div>

      <DataTable<Employee>
        ref={tableRef}
        data={data}
        columns={columns}
        dataKey="id"
        size="sm"
        stripedRows
        sortable
        enableGlobalFilter
        globalFilterPlaceholder="Instant search across 10,000 employees..."
        scrollable
        scrollHeight="520px"
        virtualScrollerOptions={{
          enabled: true,
          itemSize: 40,
          overscan: 12,
        }}
      />
    </div>
  )
}
