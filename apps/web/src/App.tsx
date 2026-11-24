import * as React from "react"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  BookOpen,
  Columns3,
  Database,
  Layers,
  Moon,
  Pencil,
  SlidersHorizontal,
  Sun,
  Table2,
  Zap,
} from "lucide-react"
import { useTheme } from "@/components/theme-provider"

const PlaygroundDemo = React.lazy(() =>
  import("@/demos/playground-demo").then((m) => ({ default: m.PlaygroundDemo }))
)
const EditingDemo = React.lazy(() =>
  import("@/demos/editing-demo").then((m) => ({ default: m.EditingDemo }))
)
const GroupingExpansionDemo = React.lazy(() =>
  import("@/demos/grouping-expansion-demo").then((m) => ({
    default: m.GroupingExpansionDemo,
  }))
)
const FrozenReorderDemo = React.lazy(() =>
  import("@/demos/frozen-reorder-demo").then((m) => ({
    default: m.FrozenReorderDemo,
  }))
)
const VirtualScrollDemo = React.lazy(() =>
  import("@/demos/virtual-scroll-demo").then((m) => ({
    default: m.VirtualScrollDemo,
  }))
)
const LazyPersistenceDemo = React.lazy(() =>
  import("@/demos/lazy-persistence-demo").then((m) => ({
    default: m.LazyPersistenceDemo,
  }))
)
const DocsCenter = React.lazy(() =>
  import("@/demos/docs-center").then((m) => ({ default: m.DocsCenter }))
)

type DemoId =
  | "playground"
  | "editing"
  | "grouping"
  | "frozen"
  | "virtual"
  | "lazy"
  | "docs"

interface DemoTab {
  id: DemoId
  label: string
  description: string
  icon: React.ReactNode
}

const DEMO_TABS: DemoTab[] = [
  {
    id: "playground",
    label: "All-in-One Playground",
    description:
      "Global search, row & menu filters, multi-sort, pagination, checkbox selection, column visibility, CSV/JSON export, density, context menu & DataTableRef actions.",
    icon: <SlidersHorizontal className="size-4" />,
  },
  {
    id: "editing",
    label: "Inline Editing",
    description:
      "Toggle between cell and row edit modes with custom editors, keyboard commit/cancel, validation callbacks, and live state updates.",
    icon: <Pencil className="size-4" />,
  },
  {
    id: "grouping",
    label: "Expansion & Grouping",
    description:
      "Collapsible department subheader groups, custom group footers, expandable detail cards, and automatic footer aggregations (sum, avg, count).",
    icon: <Layers className="size-4" />,
  },
  {
    id: "frozen",
    label: "Frozen & Reorderable",
    description:
      "Sticky left/right pinned columns, column resizing (fit/expand), drag-and-drop column & row reordering, and multi-row grouped headers.",
    icon: <Columns3 className="size-4" />,
  },
  {
    id: "virtual",
    label: "Virtual Scroll (10k)",
    description:
      "Smooth @tanstack/react-virtual rendering over 10,000 generated records with instant search, sorting, and programmatic scrollToIndex.",
    icon: <Zap className="size-4" />,
  },
  {
    id: "lazy",
    label: "Lazy & Persistence",
    description:
      "Simulated async server-side pagination, sorting, and filtering with skeleton loading states and localStorage state persistence.",
    icon: <Database className="size-4" />,
  },
  {
    id: "docs",
    label: "Documentation & API",
    description:
      "Searchable enterprise documentation portal covering installation, architecture, complete DataTableProps & DataTableColumn APIs, filter modes, accessibility, and PrimeReact parity.",
    icon: <BookOpen className="size-4" />,
  },
]

export function App() {
  const { theme, setTheme } = useTheme()
  const [activeTab, setActiveTab] = React.useState<DemoId>("playground")
  const [isDark, setIsDark] = React.useState(() =>
    typeof document !== "undefined"
      ? document.documentElement.classList.contains("dark")
      : false
  )

  React.useEffect(() => {
    const root = document.documentElement
    const update = () => setIsDark(root.classList.contains("dark"))
    update()
    const observer = new MutationObserver(update)
    observer.observe(root, { attributes: true, attributeFilter: ["class"] })
    return () => observer.disconnect()
  }, [theme])

  const toggleDarkMode = () => {
    const nextDark = !isDark
    document.documentElement.classList.toggle("dark", nextDark)
    setTheme(nextDark ? "dark" : "light")
    setIsDark(nextDark)
  }

  const currentTab = DEMO_TABS.find((t) => t.id === activeTab) ?? DEMO_TABS[0]!

  return (
    <div className="min-h-svh bg-background text-foreground">
      {/* Top Header */}
      <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
              <Table2 className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-base font-semibold tracking-tight sm:text-lg">
                  shadcn DataTable
                </h1>
                <Badge variant="secondary" className="font-mono text-[11px]">
                  24+ Features
                </Badge>
              </div>
              <p className="hidden text-xs text-muted-foreground sm:block">
                PrimeReact-equivalent enterprise table built on TanStack Table,
                Base UI &amp; Tailwind v4
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden font-mono text-xs text-muted-foreground md:inline">
              Press <kbd className="rounded border px-1.5 py-0.5">d</kbd> for
              theme
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleDarkMode}
              aria-label={
                isDark ? "Switch to Light mode" : "Switch to Dark mode"
              }
            >
              {isDark ? (
                <>
                  <Sun className="size-4" />
                  <span className="hidden sm:inline">Light</span>
                </>
              ) : (
                <>
                  <Moon className="size-4" />
                  <span className="hidden sm:inline">Dark</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="mx-auto flex max-w-[1440px] flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row">
        {/* Left Navigation Sidebar (Top scrollable bar on mobile/tablet) */}
        <aside className="w-full shrink-0 lg:w-64">
          <nav
            aria-label="DataTable demos"
            className="flex gap-1.5 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0"
          >
            {DEMO_TABS.map((tab) => {
              const active = tab.id === activeTab
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
                    active
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {tab.icon}
                  <span className="whitespace-nowrap">{tab.label}</span>
                </button>
              )
            })}
          </nav>
        </aside>

        {/* Active Demo Panel */}
        <main className="min-w-0 flex-1 space-y-4">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold tracking-tight">
              {currentTab.label}
            </h2>
            <p className="text-sm text-muted-foreground">
              {currentTab.description}
            </p>
          </div>

          <React.Suspense
            fallback={
              <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
                Loading demo...
              </div>
            }
          >
            {activeTab === "playground" && <PlaygroundDemo />}
            {activeTab === "editing" && <EditingDemo />}
            {activeTab === "grouping" && <GroupingExpansionDemo />}
            {activeTab === "frozen" && <FrozenReorderDemo />}
            {activeTab === "virtual" && <VirtualScrollDemo />}
            {activeTab === "lazy" && <LazyPersistenceDemo />}
            {activeTab === "docs" && <DocsCenter />}
          </React.Suspense>
        </main>
      </div>
    </div>
  )
}

export default App
