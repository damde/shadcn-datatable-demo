"use client"

import * as React from "react"
import type { RowData } from "@tanstack/react-table"
import { cn } from "cn"
import { TooltipProvider } from "../tooltip"
import { DataTableBody } from "./components/data-table-body"
import { DataTableFooter } from "./components/data-table-footer"
import { DataTableHeader } from "./components/data-table-header"
import { DataTablePagination } from "./components/data-table-pagination"
import { DataTableToolbar } from "./components/data-table-toolbar"
import { useDataTable } from "./hooks/use-data-table"
import type { DataTableProps, DataTableRef } from "./types"
import { resolveDataTableMessages } from "./utils/locale"

function DataTableInner<TData extends Record<string, unknown> | object>(
  props: DataTableProps<TData>,
  ref: React.ForwardedRef<DataTableRef<TData>>
) {
  const scrollContainerRef = React.useRef<HTMLDivElement | null>(null)
  const [scrollContainerEl, setScrollContainerEl] =
    React.useState<HTMLDivElement | null>(null)
  const setScrollContainerRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      scrollContainerRef.current = node
      setScrollContainerEl(node)
    },
    []
  )
  const virtualScrollToIndexRef = React.useRef<
    ((index: number) => void) | null
  >(null)

  const { table, state, setters, actions, hasFooter, hasToolbar } =
    useDataTable(props, scrollContainerRef, virtualScrollToIndexRef)

  React.useImperativeHandle(ref, () => actions, [actions])

  const {
    columns,
    size = "md",
    stripedRows = false,
    showGridlines = false,
    hoverableRows = true,
    rowClassName,
    caption,
    header,
    footer,
    emptyMessage,
    loading = false,
    skeletonRows = 5,
    showToolbar,
    toolbarLeft,
    toolbarRight,
    className,
    tableClassName,
    responsiveLayout = "scroll",
    breakpoint = "md",
    ariaLabel,
    ariaLabelledBy,
    locale,
    messages: messagesProp,
    sortable = false,
    sortMode = "single",
    removableSort = true,
    filterDisplay = "none",
    enableGlobalFilter = false,
    globalFilterPlaceholder,
    paginator = false,
    paginatorPosition = "bottom",
    rowsPerPageOptions,
    currentPageReportTemplate,
    showCurrentPageReport,
    totalRecords,
    selectionMode,
    metaKeySelection = false,
    isRowSelectable,
    onRowSelect,
    onRowUnselect,
    expandableRows = false,
    rowExpansionTemplate,
    allowRowExpansion,
    rowGroupMode,
    groupRowsBy,
    expandableRowGroups = false,
    rowGroupHeaderTemplate,
    rowGroupFooterTemplate,
    columnToggle = false,
    resizableColumns = false,
    columnResizeMode = "fit",
    reorderableColumns = false,
    headerColumnGroup,
    footerColumnGroup,
    reorderableRows = false,
    onRowReorder,
    editMode,
    onCellEditComplete,
    onRowEditComplete,
    onRowEditCancel,
    scrollable = false,
    scrollHeight,
    virtualScrollerOptions,
    frozenValue,
    contextMenuItems,
    onRowContextMenu,
    onRowClick,
    onRowDoubleClick,
    exportable = false,
  } = props

  const resolvedMessages = React.useMemo(
    () => resolveDataTableMessages(locale, messagesProp),
    [locale, messagesProp]
  )

  const isVirtualized =
    Boolean(virtualScrollerOptions) &&
    virtualScrollerOptions?.enabled !== false

  const resolvedScrollHeight =
    typeof scrollHeight === "number"
      ? `${scrollHeight}px`
      : scrollHeight ?? (isVirtualized ? "400px" : undefined)

  const hasSelectionCol =
    selectionMode === "checkbox" || selectionMode === "radiobutton"
  const totalVisibleColCount =
    table.getVisibleLeafColumns().length +
    (hasSelectionCol ? 1 : 0) +
    (expandableRows ? 1 : 0) +
    (reorderableRows ? 1 : 0) +
    (editMode === "row" ? 1 : 0)

  const filteredRowCount =
    totalRecords ?? table.getFilteredRowModel().rows.length
  const pageCount = Math.max(1, table.getPageCount())

  const headerRowCount =
    (headerColumnGroup?.length ?? 0) +
    table.getHeaderGroups().length +
    (filterDisplay === "row" ? 1 : 0)
  const pageRowOffset = paginator
    ? state.pagination.pageIndex * state.pagination.pageSize
    : 0
  const totalAriaRowCount = Math.max(
    headerRowCount + filteredRowCount,
    headerRowCount + pageRowOffset + table.getRowModel().rows.length
  )

  const [liveAnnouncement, setLiveAnnouncement] = React.useState("")
  const [prevAnnouncementDeps, setPrevAnnouncementDeps] = React.useState({
    sorting: state.sorting,
    columnFilters: state.columnFilters,
    globalFilter: state.globalFilter,
    pageIndex: state.pagination.pageIndex,
    pageSize: state.pagination.pageSize,
  })

  if (
    prevAnnouncementDeps.sorting !== state.sorting ||
    prevAnnouncementDeps.columnFilters !== state.columnFilters ||
    prevAnnouncementDeps.globalFilter !== state.globalFilter ||
    prevAnnouncementDeps.pageIndex !== state.pagination.pageIndex ||
    prevAnnouncementDeps.pageSize !== state.pagination.pageSize
  ) {
    const announcements: string[] = []

    if (prevAnnouncementDeps.sorting !== state.sorting) {
      if (state.sorting.length === 0) {
        announcements.push(resolvedMessages.sortingCleared)
      } else {
        const sortDescriptions = state.sorting.map((s) => {
          const col = columns.find((c) => (c.id ?? c.field) === s.id)
          const label =
            typeof col?.header === "string"
              ? col.header
              : col?.field ?? s.id
          return `${label} ${s.desc ? resolvedMessages.descending : resolvedMessages.ascending}`
        })
        announcements.push(
          resolvedMessages.sortedBy(sortDescriptions.join(", "))
        )
      }
    }

    if (
      prevAnnouncementDeps.columnFilters !== state.columnFilters ||
      prevAnnouncementDeps.globalFilter !== state.globalFilter
    ) {
      announcements.push(
        resolvedMessages.showingMatchingRecords(filteredRowCount)
      )
    }

    if (
      paginator &&
      (prevAnnouncementDeps.pageIndex !== state.pagination.pageIndex ||
        prevAnnouncementDeps.pageSize !== state.pagination.pageSize)
    ) {
      announcements.push(
        resolvedMessages.pageOf(state.pagination.pageIndex + 1, pageCount)
      )
    }

    setPrevAnnouncementDeps({
      sorting: state.sorting,
      columnFilters: state.columnFilters,
      globalFilter: state.globalFilter,
      pageIndex: state.pagination.pageIndex,
      pageSize: state.pagination.pageSize,
    })

    if (announcements.length > 0) {
      setLiveAnnouncement(announcements.join(". "))
    }
  }

  const shouldShowToolbar =
    hasToolbar || (showToolbar !== false && responsiveLayout === "stack")
  const showTopPaginator =
    paginator && (paginatorPosition === "top" || paginatorPosition === "both")
  const showBottomPaginator =
    paginator &&
    (paginatorPosition === "bottom" || paginatorPosition === "both")

  return (
    <TooltipProvider>
      <div
        data-slot="data-table-root"
        lang={locale}
        className={cn("flex w-full flex-col gap-3", className)}
      >
        {shouldShowToolbar ? (
          <DataTableToolbar
            table={table}
            header={header}
            toolbarLeft={toolbarLeft}
            toolbarRight={toolbarRight}
            enableGlobalFilter={enableGlobalFilter}
            globalFilter={state.globalFilter}
            globalFilterPlaceholder={globalFilterPlaceholder}
            onGlobalFilterChange={setters.setGlobalFilter}
            onClearFilters={actions.clearFilters}
            columnToggle={columnToggle}
            exportable={exportable}
            onExportCSV={(opts) => actions.exportCSV(opts)}
            onExportJSON={(opts) => actions.exportJSON(opts)}
            responsiveLayout={responsiveLayout}
            breakpoint={breakpoint}
            messages={resolvedMessages}
          />
        ) : header ? (
          <div className="flex items-center justify-between gap-2">{header}</div>
        ) : null}

        {showTopPaginator && (
          <DataTablePagination
            table={table}
            totalRecords={totalRecords}
            rowsPerPageOptions={rowsPerPageOptions}
            currentPageReportTemplate={currentPageReportTemplate}
            showCurrentPageReport={showCurrentPageReport}
            messages={resolvedMessages}
          />
        )}

        <div
          ref={setScrollContainerRef}
          data-slot="data-table-container"
          data-responsive-stack={
            responsiveLayout === "stack" ? breakpoint : undefined
          }
          className={cn(
            "relative w-full overflow-x-auto scroll-pt-12 scroll-pb-4 rounded-lg border border-border bg-background",
            (scrollable || isVirtualized) && "overflow-y-auto"
          )}
          style={
            resolvedScrollHeight
              ? {
                  maxHeight: resolvedScrollHeight,
                  ...(isVirtualized ? { height: resolvedScrollHeight } : {}),
                }
              : undefined
          }
        >
          <table
            data-slot="data-table"
            role="grid"
            aria-label={
              ariaLabelledBy
                ? undefined
                : (ariaLabel ?? resolvedMessages.dataTableLabel)
            }
            aria-labelledby={ariaLabelledBy}
            aria-rowcount={totalAriaRowCount}
            aria-colcount={totalVisibleColCount}
            aria-busy={loading || undefined}
            className={cn(
              "w-full caption-bottom border-collapse text-sm",
              resizableColumns && "table-fixed",
              tableClassName
            )}
            style={
              resizableColumns
                ? columnResizeMode === "expand"
                  ? { width: table.getTotalSize(), minWidth: "100%" }
                  : { width: "100%" }
                : undefined
            }
          >
            {caption && (
              <caption className="mt-2 text-xs text-muted-foreground">
                {caption}
              </caption>
            )}

            <DataTableHeader
              table={table}
              columns={columns}
              headerColumnGroup={headerColumnGroup}
              sortable={sortable}
              sortMode={sortMode}
              removableSort={removableSort}
              filterDisplay={filterDisplay}
              selectionMode={selectionMode}
              expandableRows={expandableRows}
              reorderableRows={reorderableRows}
              resizableColumns={resizableColumns}
              reorderableColumns={reorderableColumns}
              editMode={editMode}
              scrollable={scrollable || Boolean(virtualScrollerOptions)}
              showGridlines={showGridlines}
              size={size}
              onColumnOrderChange={setters.setColumnOrder}
              messages={resolvedMessages}
            />

            <DataTableBody
              table={table}
              columns={columns}
              size={size}
              stripedRows={stripedRows}
              showGridlines={showGridlines}
              hoverableRows={hoverableRows}
              rowClassName={rowClassName}
              loading={loading}
              skeletonRows={skeletonRows}
              emptyMessage={emptyMessage ?? resolvedMessages.emptyMessage}
              frozenValue={frozenValue}
              scrollable={scrollable}
              scrollContainerRef={scrollContainerRef}
              scrollContainerEl={scrollContainerEl}
              virtualScrollToIndexRef={virtualScrollToIndexRef}
              virtualScrollerOptions={virtualScrollerOptions}
              rowIndexOffset={headerRowCount + pageRowOffset}
              messages={resolvedMessages}
              rowGroupMode={rowGroupMode}
              groupRowsBy={groupRowsBy}
              expandableRowGroups={expandableRowGroups}
              rowGroupHeaderTemplate={rowGroupHeaderTemplate}
              rowGroupFooterTemplate={rowGroupFooterTemplate}
              selectionMode={selectionMode}
              metaKeySelection={metaKeySelection}
              isRowSelectable={isRowSelectable}
              onRowSelect={onRowSelect}
              onRowUnselect={onRowUnselect}
              expandableRows={expandableRows}
              rowExpansionTemplate={rowExpansionTemplate}
              allowRowExpansion={allowRowExpansion}
              reorderableRows={reorderableRows}
              onRowReorder={onRowReorder}
              editMode={editMode}
              onCellEditComplete={onCellEditComplete}
              onRowEditComplete={onRowEditComplete}
              onRowEditCancel={onRowEditCancel}
              contextMenuItems={contextMenuItems}
              onRowContextMenu={onRowContextMenu}
              onRowClick={onRowClick}
              onRowDoubleClick={onRowDoubleClick}
            />

            {hasFooter && (
              <DataTableFooter
                table={table}
                columns={columns}
                footerColumnGroup={footerColumnGroup}
                selectionMode={selectionMode}
                expandableRows={expandableRows}
                reorderableRows={reorderableRows}
                editMode={editMode}
                showGridlines={showGridlines}
                size={size}
              />
            )}
          </table>
        </div>

        {showBottomPaginator && (
          <DataTablePagination
            table={table}
            totalRecords={totalRecords}
            rowsPerPageOptions={rowsPerPageOptions}
            currentPageReportTemplate={currentPageReportTemplate}
            showCurrentPageReport={showCurrentPageReport}
            messages={resolvedMessages}
          />
        )}

        {footer && (
          <div
            data-slot="data-table-footer-slot"
            className="text-sm text-muted-foreground"
          >
            {footer}
          </div>
        )}

        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
        >
          {liveAnnouncement}
        </div>
      </div>
    </TooltipProvider>
  )
}

/**
 * Advanced, PrimeReact-inspired DataTable built on shadcn/ui, Base UI, TanStack Table, and TanStack Virtual.
 */
export const DataTable = React.forwardRef(DataTableInner) as <
  TData extends Record<string, unknown> | object = Record<string, unknown> &
    RowData,
>(
  props: DataTableProps<TData> & { ref?: React.Ref<DataTableRef<TData>> }
) => React.ReactElement | null
