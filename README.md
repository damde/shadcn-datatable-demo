# shadcn-datatable

[![CI](https://github.com/damde/shadcn-datatable-demo/actions/workflows/ci.yml/badge.svg)](https://github.com/damde/shadcn-datatable-demo/actions/workflows/ci.yml)
[![Deploy to GitHub Pages](https://github.com/damde/shadcn-datatable-demo/actions/workflows/deploy-pages.yml/badge.svg)](https://github.com/damde/shadcn-datatable-demo/actions/workflows/deploy-pages.yml)

A Turborepo monorepo featuring a PrimeReact-inspired, enterprise-grade, **WCAG 2.2 AA compliant** `DataTable` component built on **React 19**, **shadcn/ui + Base UI**, **Tailwind CSS v4**, **TanStack Table v9**, and **TanStack Virtual**.

## Live Demo & Storybook (GitHub Pages)

- **Interactive Demo & Enterprise Documentation**: [https://damde.github.io/shadcn-datatable-demo/](https://damde.github.io/shadcn-datatable-demo/)
- **Storybook Component Explorer**: [https://damde.github.io/shadcn-datatable-demo/storybook/](https://damde.github.io/shadcn-datatable-demo/storybook/)

## Tech Stack

- **UI & Styling**: React 19, [shadcn/ui](https://ui.shadcn.com/) + [`@base-ui/react`](https://base-ui.com/), Tailwind CSS v4
- **Table & Virtualization**: [`@tanstack/react-table`](https://tanstack.com/table) v9, [`@tanstack/react-virtual`](https://tanstack.com/virtual)
- **Testing & Accessibility**: Vitest, Testing Library, `vitest-axe`, Playwright + `@axe-core/playwright` (WCAG 2.2 AA), Storybook
- **Monorepo & CI/CD**: Turborepo, npm workspaces, TypeScript, GitHub Actions (CI + GitHub Pages)

## Workspace Structure

```text
.
├── apps/
│   └── web/                          # Demo & showcase Vite application
├── packages/
│   └── ui/                           # Shared UI component library (@workspace/ui)
│       └── src/components/data-table/ # DataTable component, hooks, utils, tests, stories
└── docs/
    └── DATATABLE_API.md              # Complete DataTable TypeScript API reference
```

## Documentation

- **Component Guide & Recipes**: [`packages/ui/src/components/data-table/README.md`](./packages/ui/src/components/data-table/README.md)
- **Full API Reference**: [`docs/DATATABLE_API.md`](./docs/DATATABLE_API.md)

## Available Scripts

Run these commands from the repository root:

```bash
# Start all dev servers (web app)
npm run dev

# Build all workspaces
npm run build

# Typecheck all workspaces
npm run typecheck

# Run Vitest unit & vitest-axe WCAG tests (74 tests)
npm test

# Run real-browser Playwright E2E & @axe-core/playwright WCAG 2.2 AA suite
npm run test:e2e

# Launch or build Storybook for @workspace/ui
npm run storybook
npm run build-storybook
```

## Using `@workspace/ui` in `apps/web`

```tsx
import { DataTable, type DataTableColumn } from "@workspace/ui/components/data-table"
import { Button } from "@workspace/ui/components/button"
```
