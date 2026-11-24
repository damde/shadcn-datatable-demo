import * as React from "react"
import {
  DataTable,
  type ContextMenuItem,
  type DataTableColumn,
  type DataTableRef,
  type DataTableSize,
  type FilterDisplay,
} from "@workspace/ui/components/data-table"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Label } from "@workspace/ui/components/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { Switch } from "@workspace/ui/components/switch"
import {
  Copy,
  Download,
  FileJson,
  FilterX,
  RotateCcw,
  Sparkles,
  Trash2,
  UserCheck,
} from "lucide-react"
import {
  COUNTRIES,
  DEPARTMENTS,
  EMPLOYEE_STATUSES,
  generateEmployees,
  type Employee,
} from "@/data/mock-employees"
import {
  EmployeeAvatarCell,
  PerformanceBar,
  StatusBadge,
  VerifiedIndicator,
  formatCurrency,
} from "./shared-columns"

export function PlaygroundDemo() {
  const tableRef = React.useRef<DataTableRef<Employee>>(null)
  const [data, setData] = React.useState<Employee[]>(() =>
    generateEmployees(60)
  )
  const [selectedEmployees, setSelectedEmployees] = React.useState<Employee[]>(
    []
  )
  const [size, setSize] = React.useState<DataTableSize>("md")
  const [filterDisplay, setFilterDisplay] =
    React.useState<FilterDisplay>("menu")
  const [stripedRows, setStripedRows] = React.useState(true)
  const [showGridlines, setShowGridlines] = React.useState(false)
  const [responsiveLayout, setResponsiveLayout] = React.useState<
    "scroll" | "stack"
  >("scroll")
  const [lastAction, setLastAction] = React.useState<string | null>(null)

  const columns = React.useMemo<DataTableColumn<Employee>[]>(
    () => [
      {
        field: "id",
        header: "ID",
        sortable: true,
        filterable: true,
        filterPlaceholder: "EMP-...",
        width: 115,
        className: "font-mono text-xs",
      },
      {
        field: "name",
        header: "Employee",
        sortable: true,
        filterable: true,
        filterPlaceholder: "Search name...",
        width: 240,
        body: (emp) => <EmployeeAvatarCell employee={emp} />,
      },
      {
        field: "department",
        header: "Department",
        sortable: true,
        filterable: true,
        filterType: "multi-select",
        filterOptions: DEPARTMENTS.map((d) => ({ label: d, value: d })),
        width: 145,
        body: (emp) => <Badge variant="secondary">{emp.department}</Badge>,
      },
      {
        field: "role",
        header: "Role",
        sortable: true,
        filterable: true,
        filterPlaceholder: "Search role...",
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
        filterable: true,
        filterType: "number",
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
        filterable: true,
        filterType: "number",
        width: 145,
        body: (emp) => <PerformanceBar score={emp.performance} />,
      },
      {
        field: "country",
        header: "Country",
        sortable: true,
        filterable: true,
        filterType: "select",
        filterOptions: COUNTRIES.map((c) => ({ label: c, value: c })),
        width: 140,
      },
      {
        field: "joinDate",
        header: "Joined",
        sortable: true,
        filterable: true,
        filterType: "date",
        width: 130,
        className: "font-mono text-xs",
      },
      {
        field: "verified",
        header: "Verified",
        sortable: true,
        filterable: true,
        filterType: "boolean",
        width: 120,
        body: (emp) => <VerifiedIndicator verified={emp.verified} />,
      },
    ],
    []
  )

  const contextMenuItems = React.useMemo<ContextMenuItem<Employee>[]>(
    () => [
      {
        id: "verify",
        label: "Toggle Verified",
        icon: <UserCheck className="size-4" />,
        onSelect: (emp) => {
          setData((prev) =>
            prev.map((item) =>
              item.id === emp.id ? { ...item, verified: !item.verified } : item
            )
          )
          setLastAction(
            `Toggled verification for ${emp.name} (${emp.id}) to ${!emp.verified}`
          )
        },
      },
      {
        id: "promote",
        label: "Give 5% Raise",
        icon: <Sparkles className="size-4" />,
        onSelect: (emp) => {
          const nextSalary = Math.round(emp.salary * 1.05)
          setData((prev) =>
            prev.map((item) =>
              item.id === emp.id ? { ...item, salary: nextSalary } : item
            )
          )
          setLastAction(
            `Updated ${emp.name}'s salary to ${formatCurrency(nextSalary)}`
          )
        },
      },
      {
        id: "copy-email",
        label: "Copy Email",
        icon: <Copy className="size-4" />,
        onSelect: (emp) => {
          void navigator.clipboard?.writeText(emp.email)
          setLastAction(`Copied email: ${emp.email}`)
        },
      },
      {
        id: "delete",
        label: "Remove Employee",
        icon: <Trash2 className="size-4" />,
        destructive: true,
        separatorBefore: true,
        onSelect: (emp) => {
          setData((prev) => prev.filter((item) => item.id !== emp.id))
          setSelectedEmployees((prev) =>
            prev.filter((item) => item.id !== emp.id)
          )
          setLastAction(`Removed ${emp.name} (${emp.id})`)
        },
      },
    ],
    []
  )

  return (
    <div className="space-y-4">
      {/* Interactive Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border bg-card p-4">
        <div className="flex flex-wrap items-center gap-5">
          <div className="flex items-center gap-2">
            <Label htmlFor="pg-density" className="text-xs text-muted-foreground">
              Density
            </Label>
            <Select
              value={size}
              onValueChange={(val) => {
                if (val === "sm" || val === "md" || val === "lg") {
                  setSize(val)
                }
              }}
            >
              <SelectTrigger id="pg-density" size="sm" className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sm">Compact</SelectItem>
                <SelectItem value="md">Default</SelectItem>
                <SelectItem value="lg">Relaxed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Label htmlFor="pg-filter" className="text-xs text-muted-foreground">
              Filter Display
            </Label>
            <Select
              value={filterDisplay}
              onValueChange={(val) => {
                if (val === "row" || val === "menu" || val === "none") {
                  setFilterDisplay(val)
                }
              }}
            >
              <SelectTrigger id="pg-filter" size="sm" className="w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="menu">Menu</SelectItem>
                <SelectItem value="row">Row</SelectItem>
                <SelectItem value="none">None</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Label
              htmlFor="pg-responsive"
              className="text-xs text-muted-foreground"
            >
              Layout
            </Label>
            <Select
              value={responsiveLayout}
              onValueChange={(val) => {
                if (val === "scroll" || val === "stack") {
                  setResponsiveLayout(val)
                }
              }}
            >
              <SelectTrigger id="pg-responsive" size="sm" className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="scroll">Scroll</SelectItem>
                <SelectItem value="stack">Stack</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              id="pg-striped"
              size="sm"
              checked={stripedRows}
              onCheckedChange={setStripedRows}
            />
            <Label htmlFor="pg-striped" className="text-xs">
              Striped
            </Label>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              id="pg-gridlines"
              size="sm"
              checked={showGridlines}
              onCheckedChange={setShowGridlines}
            />
            <Label htmlFor="pg-gridlines" className="text-xs">
              Gridlines
            </Label>
          </div>
        </div>

        {/* Imperative DataTableRef Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => tableRef.current?.clearFilters()}
          >
            <FilterX className="size-3.5" />
            Clear Filters
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => tableRef.current?.clearSorting()}
          >
            Clear Sort
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={selectedEmployees.length === 0}
            onClick={() => tableRef.current?.clearSelection()}
          >
            Clear Selection ({selectedEmployees.length})
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              tableRef.current?.exportCSV({
                selectionOnly: selectedEmployees.length > 0,
                filename: "employees-playground",
              })
            }
          >
            <Download className="size-3.5" />
            {selectedEmployees.length > 0 ? "Export Selected CSV" : "Export CSV"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              tableRef.current?.exportJSON({
                selectionOnly: selectedEmployees.length > 0,
                filename: "employees-playground",
              })
            }
          >
            <FileJson className="size-3.5" />
            JSON
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              tableRef.current?.reset()
              setLastAction("Reset table sorting, filters, selection, and page")
            }}
          >
            <RotateCcw className="size-3.5" />
            Reset
          </Button>
        </div>
      </div>

      {lastAction && (
        <div className="flex items-center justify-between rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-xs text-foreground">
          <span>
            <strong>Event:</strong> {lastAction}
          </span>
          <button
            type="button"
            onClick={() => setLastAction(null)}
            className="text-muted-foreground hover:text-foreground"
          >
            Dismiss
          </button>
        </div>
      )}

      <DataTable<Employee>
        ref={tableRef}
        data={data}
        columns={columns}
        dataKey="id"
        size={size}
        responsiveLayout={responsiveLayout}
        stripedRows={stripedRows}
        showGridlines={showGridlines}
        sortable
        sortMode="multiple"
        filterDisplay={filterDisplay}
        enableGlobalFilter
        globalFilterPlaceholder="Search employees across all columns..."
        paginator
        rows={10}
        rowsPerPageOptions={[5, 10, 20, 50]}
        selectionMode="checkbox"
        selection={selectedEmployees}
        onSelectionChange={(sel) =>
          setSelectedEmployees(Array.isArray(sel) ? sel : sel ? [sel] : [])
        }
        columnToggle
        exportable
        exportFilename="employees-directory"
        contextMenuItems={contextMenuItems}
        toolbarLeft={
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="outline">{data.length} records</Badge>
            <span>Right-click any row for context actions</span>
          </div>
        }
      />
    </div>
  )
}
