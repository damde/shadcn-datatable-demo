import * as React from "react"
import {
  DataTable,
  type DataTableColumn,
  type DataTableRef,
} from "@workspace/ui/components/data-table"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  Building2,
  Calendar,
  ChevronsDownUp,
  ChevronsUpDown,
  FolderKanban,
  Globe,
  Mail,
} from "lucide-react"
import { generateEmployees, type Employee } from "@/data/mock-employees"
import {
  EmployeeAvatarCell,
  PerformanceBar,
  StatusBadge,
  formatCurrency,
} from "./shared-columns"

export function GroupingExpansionDemo() {
  const tableRef = React.useRef<DataTableRef<Employee>>(null)

  const data = React.useMemo(
    () =>
      generateEmployees(28).sort((a, b) =>
        a.department.localeCompare(b.department)
      ),
    []
  )

  const columns = React.useMemo<DataTableColumn<Employee>[]>(
    () => [
      {
        field: "name",
        header: "Employee",
        sortable: true,
        width: 240,
        body: (emp) => <EmployeeAvatarCell employee={emp} />,
        aggregation: "count",
        aggregationFormatter: (val) => (
          <span className="font-semibold">Total: {val ?? 0}</span>
        ),
      },
      {
        field: "department",
        header: "Department",
        sortable: true,
        width: 135,
        body: (emp) => <Badge variant="secondary">{emp.department}</Badge>,
      },
      {
        field: "role",
        header: "Role",
        sortable: true,
        width: 200,
      },
      {
        field: "status",
        header: "Status",
        sortable: true,
        width: 120,
        body: (emp) => <StatusBadge status={emp.status} />,
      },
      {
        field: "projects",
        header: "Projects",
        sortable: true,
        align: "right",
        width: 110,
        aggregation: "sum",
        aggregationFormatter: (val) => (
          <span className="font-mono font-semibold">{val ?? 0} active</span>
        ),
      },
      {
        field: "performance",
        header: "Avg Rating",
        sortable: true,
        width: 150,
        body: (emp) => <PerformanceBar score={emp.performance} />,
        aggregation: "avg",
        aggregationFormatter: (val) => (
          <span className="font-mono font-semibold">
            Avg: {val !== null ? val.toFixed(2) : "—"}
          </span>
        ),
      },
      {
        field: "salary",
        header: "Salary",
        sortable: true,
        align: "right",
        width: 145,
        body: (emp) => (
          <span className="font-mono tabular-nums">
            {formatCurrency(emp.salary)}
          </span>
        ),
        aggregation: "sum",
        aggregationFormatter: (val) => (
          <span className="font-mono font-semibold">
            {val !== null ? formatCurrency(val) : "—"}
          </span>
        ),
      },
    ],
    []
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border bg-card p-4">
        <div className="text-xs text-muted-foreground">
          Grouped by <strong className="text-foreground">Department</strong>{" "}
          with collapsible subheaders, custom group footers, expandable detail
          cards, and column footer aggregations (<code>count</code>,{" "}
          <code>sum</code>, <code>avg</code>).
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => tableRef.current?.expandAll()}
          >
            <ChevronsUpDown className="size-3.5" />
            Expand All Rows
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => tableRef.current?.collapseAll()}
          >
            <ChevronsDownUp className="size-3.5" />
            Collapse All Rows
          </Button>
        </div>
      </div>

      <DataTable<Employee>
        ref={tableRef}
        data={data}
        columns={columns}
        dataKey="id"
        sortable
        rowGroupMode="subheader"
        groupRowsBy="department"
        expandableRowGroups
        rowGroupHeaderTemplate={(groupValue, groupRows) => (
          <div className="flex items-center gap-2.5">
            <Building2 className="size-4 text-primary" />
            <span className="font-semibold">{String(groupValue)}</span>
            <Badge variant="outline" className="text-[11px]">
              {groupRows.length} members
            </Badge>
          </div>
        )}
        rowGroupFooterTemplate={(groupValue, groupRows) => {
          const totalSalary = groupRows.reduce(
            (acc, r) => acc + r.original.salary,
            0
          )
          const avgRating =
            groupRows.reduce((acc, r) => acc + r.original.performance, 0) /
            Math.max(1, groupRows.length)
          return (
            <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-muted-foreground">
              <span>
                <strong className="text-foreground">
                  {String(groupValue)}
                </strong>{" "}
                summary ({groupRows.length} employees)
              </span>
              <div className="flex items-center gap-6 font-mono">
                <span>Avg Rating: {avgRating.toFixed(2)}</span>
                <span className="font-semibold text-foreground">
                  Payroll: {formatCurrency(totalSalary)}
                </span>
              </div>
            </div>
          )
        }}
        expandableRows
        rowExpansionTemplate={(emp) => (
          <div className="grid gap-4 rounded-lg border bg-background p-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-start gap-2.5">
              <Mail className="mt-0.5 size-4 text-muted-foreground" />
              <div className="text-xs">
                <div className="text-muted-foreground">Email</div>
                <div className="font-medium">{emp.email}</div>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <Globe className="mt-0.5 size-4 text-muted-foreground" />
              <div className="text-xs">
                <div className="text-muted-foreground">Location</div>
                <div className="font-medium">{emp.country}</div>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <Calendar className="mt-0.5 size-4 text-muted-foreground" />
              <div className="text-xs">
                <div className="text-muted-foreground">Join Date</div>
                <div className="font-mono font-medium">{emp.joinDate}</div>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <FolderKanban className="mt-0.5 size-4 text-muted-foreground" />
              <div className="text-xs">
                <div className="text-muted-foreground">Active Projects</div>
                <div className="font-medium">
                  {emp.projects} assigned ({emp.verified ? "Verified" : "Pending"})
                </div>
              </div>
            </div>
          </div>
        )}
      />
    </div>
  )
}
