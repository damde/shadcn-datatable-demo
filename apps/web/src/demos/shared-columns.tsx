import { Badge } from "@workspace/ui/components/badge"
import { CheckCircle2, XCircle } from "lucide-react"
import type { Employee, EmployeeStatus } from "@/data/mock-employees"

const STATUS_BADGE_CLASS: Record<EmployeeStatus, string> = {
  Active:
    "border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300",
  Remote:
    "border-sky-500/30 bg-sky-500/10 text-sky-800 dark:text-sky-300",
  "On Leave":
    "border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300",
  Probation:
    "border-rose-500/30 bg-rose-500/10 text-rose-800 dark:text-rose-300",
}

export function StatusBadge({ status }: { status: EmployeeStatus }) {
  return (
    <Badge variant="outline" className={STATUS_BADGE_CLASS[status]}>
      {status}
    </Badge>
  )
}

export function VerifiedIndicator({ verified }: { verified: boolean }) {
  return verified ? (
    <span className="inline-flex items-center gap-1 text-emerald-800 dark:text-emerald-300">
      <CheckCircle2 className="size-4" />
      <span className="text-xs">Verified</span>
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-muted-foreground">
      <XCircle className="size-4" />
      <span className="text-xs">Pending</span>
    </span>
  )
}

export function PerformanceBar({ score }: { score: number }) {
  const pct = Math.min(100, Math.max(0, (score / 5) * 100))
  const barColor =
    score >= 4.2
      ? "bg-emerald-500"
      : score >= 3.5
        ? "bg-sky-500"
        : "bg-amber-500"

  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="font-mono text-xs tabular-nums">{score.toFixed(1)}</span>
    </div>
  )
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount)
}

export function EmployeeAvatarCell({ employee }: { employee: Employee }) {
  const initials = employee.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="flex items-center gap-2.5">
      <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
        {initials}
      </div>
      <div className="min-w-0">
        <div className="truncate font-medium">{employee.name}</div>
        <div className="truncate text-xs text-muted-foreground">
          {employee.email}
        </div>
      </div>
    </div>
  )
}
