import * as React from "react"
import {
  DataTable,
  type CellEditCompleteEvent,
  type DataTableColumn,
  type EditMode,
  type RowEditCompleteEvent,
} from "@workspace/ui/components/data-table"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { Switch } from "@workspace/ui/components/switch"
import { AlertCircle, CheckCircle2, Pencil } from "lucide-react"
import {
  DEPARTMENTS,
  EMPLOYEE_STATUSES,
  generateEmployees,
  type Department,
  type Employee,
  type EmployeeStatus,
} from "@/data/mock-employees"
import {
  StatusBadge,
  VerifiedIndicator,
  formatCurrency,
} from "./shared-columns"

interface EditFeedback {
  type: "success" | "error" | "info"
  message: string
}

export function EditingDemo() {
  const [editMode, setEditMode] = React.useState<EditMode>("cell")
  const [data, setData] = React.useState<Employee[]>(() =>
    generateEmployees(15)
  )
  const [feedback, setFeedback] = React.useState<EditFeedback | null>(null)

  const columns = React.useMemo<DataTableColumn<Employee>[]>(
    () => [
      {
        field: "id",
        header: "ID",
        width: 110,
        className: "font-mono text-xs text-muted-foreground",
      },
      {
        field: "name",
        header: "Name",
        sortable: true,
        editable: true,
        width: 190,
        onCellEditValidate: (newVal) => {
          const str = String(newVal ?? "").trim()
          if (str.length < 2) {
            setFeedback({
              type: "error",
              message: "Validation failed: Name must be at least 2 characters.",
            })
            return "Name must be at least 2 characters"
          }
          return true
        },
        editor: ({ value, onChange, onCommit, onCancel }) => (
          <Input
            autoFocus
            className="h-7 text-sm"
            value={String(value ?? "")}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onCommit()
              if (e.key === "Escape") onCancel()
            }}
          />
        ),
      },
      {
        field: "department",
        header: "Department",
        sortable: true,
        editable: true,
        width: 155,
        body: (emp) => <Badge variant="secondary">{emp.department}</Badge>,
        editor: ({ value, onChange }) => (
          <Select
            value={String(value)}
            onValueChange={(val) => {
              if (val) onChange(val as Department)
            }}
          >
            <SelectTrigger size="sm" className="h-7 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DEPARTMENTS.map((dept) => (
                <SelectItem key={dept} value={dept}>
                  {dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ),
      },
      {
        field: "role",
        header: "Role",
        editable: true,
        width: 210,
        editor: ({ value, onChange, onCommit, onCancel }) => (
          <Input
            className="h-7 text-sm"
            value={String(value ?? "")}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onCommit()
              if (e.key === "Escape") onCancel()
            }}
          />
        ),
      },
      {
        field: "status",
        header: "Status",
        sortable: true,
        editable: true,
        width: 140,
        body: (emp) => <StatusBadge status={emp.status} />,
        editor: ({ value, onChange }) => (
          <Select
            value={String(value)}
            onValueChange={(val) => {
              if (val) onChange(val as EmployeeStatus)
            }}
          >
            <SelectTrigger size="sm" className="h-7 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {EMPLOYEE_STATUSES.map((st) => (
                <SelectItem key={st} value={st}>
                  {st}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ),
      },
      {
        field: "salary",
        header: "Salary ($30k–$500k)",
        sortable: true,
        editable: true,
        align: "right",
        width: 165,
        body: (emp) => (
          <span className="font-mono tabular-nums">
            {formatCurrency(emp.salary)}
          </span>
        ),
        onCellEditValidate: (newVal) => {
          const num = Number(newVal)
          if (Number.isNaN(num) || num < 30000 || num > 500000) {
            setFeedback({
              type: "error",
              message:
                "Validation failed: Salary must be between $30,000 and $500,000.",
            })
            return "Salary must be between $30,000 and $500,000"
          }
          return true
        },
        editor: ({ value, onChange, onCommit, onCancel }) => (
          <Input
            type="number"
            min={30000}
            max={500000}
            step={1000}
            className="h-7 text-right font-mono text-sm"
            value={Number(value ?? 0)}
            onChange={(e) => onChange(Number(e.target.value))}
            onKeyDown={(e) => {
              if (e.key === "Enter") onCommit()
              if (e.key === "Escape") onCancel()
            }}
          />
        ),
      },
      {
        field: "verified",
        header: "Verified",
        editable: true,
        width: 120,
        body: (emp) => <VerifiedIndicator verified={emp.verified} />,
        editor: ({ value, onChange }) => (
          <div className="flex items-center gap-2">
            <Switch
              size="sm"
              checked={Boolean(value)}
              onCheckedChange={(checked) => onChange(checked)}
            />
            <span className="text-xs text-muted-foreground">
              {value ? "Yes" : "No"}
            </span>
          </div>
        ),
      },
    ],
    []
  )

  const handleCellEditComplete = (event: CellEditCompleteEvent<Employee>) => {
    setData((prev) =>
      prev.map((row) => (row.id === event.rowData.id ? event.newRowData : row))
    )
    setFeedback({
      type: "success",
      message: `Cell updated: ${event.rowData.id}.${event.field} → ${String(
        event.newValue
      )}`,
    })
  }

  const handleRowEditComplete = (event: RowEditCompleteEvent<Employee>) => {
    const { newData } = event
    if (newData.name.trim().length < 2) {
      setFeedback({
        type: "error",
        message: "Row save rejected: Name must be at least 2 characters.",
      })
      return
    }
    if (newData.salary < 30000 || newData.salary > 500000) {
      setFeedback({
        type: "error",
        message:
          "Row save rejected: Salary must be between $30,000 and $500,000.",
      })
      return
    }

    setData((prev) =>
      prev.map((row) => (row.id === newData.id ? newData : row))
    )
    setFeedback({
      type: "success",
      message: `Row saved: ${newData.name} (${newData.id})`,
    })
  }

  const handleRowEditCancel = (row: Employee) => {
    setFeedback({
      type: "info",
      message: `Cancelled editing for ${row.name} (${row.id})`,
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border bg-card p-4">
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-muted-foreground">
            Edit Mode:
          </span>
          <div className="inline-flex rounded-lg border bg-muted/50 p-0.5">
            <Button
              size="sm"
              variant={editMode === "cell" ? "default" : "ghost"}
              onClick={() => {
                setEditMode("cell")
                setFeedback(null)
              }}
            >
              Cell Edit
            </Button>
            <Button
              size="sm"
              variant={editMode === "row" ? "default" : "ghost"}
              onClick={() => {
                setEditMode("row")
                setFeedback(null)
              }}
            >
              Row Edit
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Pencil className="size-3.5" />
          {editMode === "cell"
            ? "Click any editable cell to edit inline. Press Enter to commit or Esc to cancel."
            : "Click the pencil icon in the Actions column to edit an entire row."}
        </div>
      </div>

      {feedback && (
        <div
          className={`flex items-center justify-between rounded-lg border px-3 py-2 text-xs ${
            feedback.type === "error"
              ? "border-destructive/40 bg-destructive/10 text-destructive"
              : feedback.type === "success"
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                : "border-border bg-muted/50 text-foreground"
          }`}
        >
          <span className="flex items-center gap-2">
            {feedback.type === "error" ? (
              <AlertCircle className="size-4 shrink-0" />
            ) : (
              <CheckCircle2 className="size-4 shrink-0" />
            )}
            {feedback.message}
          </span>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="opacity-70 hover:opacity-100"
          >
            Dismiss
          </button>
        </div>
      )}

      <DataTable<Employee>
        data={data}
        columns={columns}
        dataKey="id"
        editMode={editMode}
        onCellEditComplete={handleCellEditComplete}
        onRowEditComplete={handleRowEditComplete}
        onRowEditCancel={handleRowEditCancel}
        sortable
        showGridlines
        paginator
        rows={8}
        rowsPerPageOptions={[5, 8, 15]}
      />
    </div>
  )
}
