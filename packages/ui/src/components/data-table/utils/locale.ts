/**
 * Localizable UI and ARIA strings for `DataTable` (WCAG 3.1.2 Language of Parts).
 */
export interface DataTableMessages {
  dataTableLabel: string
  emptyMessage: string
  globalSearchPlaceholder: string
  globalSearchAriaLabel: string
  clearSearchAriaLabel: string
  clearFilters: string
  columnsButton: string
  toggleColumnsLabel: string
  exportButton: string
  exportCSV: string
  exportJSON: string
  exportSelectedCSV: (count: number) => string
  exportSelectedJSON: (count: number) => string
  selectAllRows: string
  selectRow: (rowNumber: number) => string
  expandAllRows: string
  collapseAllRows: string
  expandRow: string
  collapseRow: string
  dragToReorderRow: string
  rowReorderHeader: string
  editRow: string
  saveRow: string
  cancelRowEdit: string
  rowActions: string
  rowsPerPage: string
  paginationNav: string
  firstPage: string
  previousPage: string
  nextPage: string
  lastPage: string
  pageLabel: (page: number) => string
  filterColumn: (column: string) => string
  clearColumnFilter: (column: string) => string
  applyFilter: string
  clearFilter: string
  resizeColumn: (column: string) => string
  mobileSortLabel: string
  mobileSortNone: string
  sortingCleared: string
  sortedBy: (descriptions: string) => string
  ascending: string
  descending: string
  showingMatchingRecords: (count: number) => string
  pageOf: (page: number, totalPages: number) => string
}

export const DEFAULT_MESSAGES_EN: DataTableMessages = {
  dataTableLabel: "Data table",
  emptyMessage: "No records found.",
  globalSearchPlaceholder: "Search...",
  globalSearchAriaLabel: "Global search",
  clearSearchAriaLabel: "Clear search",
  clearFilters: "Clear Filters",
  columnsButton: "Columns",
  toggleColumnsLabel: "Toggle columns",
  exportButton: "Export",
  exportCSV: "Export CSV",
  exportJSON: "Export JSON",
  exportSelectedCSV: (count) => `Export Selected CSV (${count})`,
  exportSelectedJSON: (count) => `Export Selected JSON (${count})`,
  selectAllRows: "Select all rows",
  selectRow: (n) => `Select row ${n}`,
  expandAllRows: "Expand all rows",
  collapseAllRows: "Collapse all rows",
  expandRow: "Expand row",
  collapseRow: "Collapse row",
  dragToReorderRow: "Drag to reorder row",
  rowReorderHeader: "Row reorder",
  editRow: "Edit row",
  saveRow: "Save row",
  cancelRowEdit: "Cancel row edit",
  rowActions: "Row actions",
  rowsPerPage: "Rows per page",
  paginationNav: "Pagination",
  firstPage: "First page",
  previousPage: "Previous page",
  nextPage: "Next page",
  lastPage: "Last page",
  pageLabel: (page) => `Page ${page}`,
  filterColumn: (col) => `Filter ${col}`,
  clearColumnFilter: (col) => `Clear ${col} filter`,
  applyFilter: "Apply",
  clearFilter: "Clear",
  resizeColumn: (col) => `Resize column ${col}`,
  mobileSortLabel: "Sort",
  mobileSortNone: "Default order",
  sortingCleared: "Sorting cleared",
  sortedBy: (desc) => `Sorted by ${desc}`,
  ascending: "ascending",
  descending: "descending",
  showingMatchingRecords: (count) =>
    `Showing ${count} matching ${count === 1 ? "record" : "records"}`,
  pageOf: (page, totalPages) => `Page ${page} of ${totalPages}`,
}

export const MESSAGES_IT: DataTableMessages = {
  dataTableLabel: "Tabella dati",
  emptyMessage: "Nessun record trovato.",
  globalSearchPlaceholder: "Cerca...",
  globalSearchAriaLabel: "Ricerca globale",
  clearSearchAriaLabel: "Cancella ricerca",
  clearFilters: "Cancella filtri",
  columnsButton: "Colonne",
  toggleColumnsLabel: "Mostra/nascondi colonne",
  exportButton: "Esporta",
  exportCSV: "Esporta CSV",
  exportJSON: "Esporta JSON",
  exportSelectedCSV: (count) => `Esporta selezionati CSV (${count})`,
  exportSelectedJSON: (count) => `Esporta selezionati JSON (${count})`,
  selectAllRows: "Seleziona tutte le righe",
  selectRow: (n) => `Seleziona riga ${n}`,
  expandAllRows: "Espandi tutte le righe",
  collapseAllRows: "Comprimi tutte le righe",
  expandRow: "Espandi riga",
  collapseRow: "Comprimi riga",
  dragToReorderRow: "Trascina per riordinare la riga",
  rowReorderHeader: "Riordina righe",
  editRow: "Modifica riga",
  saveRow: "Salva riga",
  cancelRowEdit: "Annulla modifica riga",
  rowActions: "Azioni riga",
  rowsPerPage: "Righe per pagina",
  paginationNav: "Paginazione",
  firstPage: "Prima pagina",
  previousPage: "Pagina precedente",
  nextPage: "Pagina successiva",
  lastPage: "Ultima pagina",
  pageLabel: (page) => `Pagina ${page}`,
  filterColumn: (col) => `Filtra ${col}`,
  clearColumnFilter: (col) => `Cancella filtro ${col}`,
  applyFilter: "Applica",
  clearFilter: "Cancella",
  resizeColumn: (col) => `Ridimensiona colonna ${col}`,
  mobileSortLabel: "Ordina",
  mobileSortNone: "Ordine predefinito",
  sortingCleared: "Ordinamento rimosso",
  sortedBy: (desc) => `Ordinato per ${desc}`,
  ascending: "crescente",
  descending: "decrescente",
  showingMatchingRecords: (count) =>
    `${count} ${count === 1 ? "risultato trovato" : "risultati trovati"}`,
  pageOf: (page, totalPages) => `Pagina ${page} di ${totalPages}`,
}

/**
 * Resolves full `DataTableMessages` by merging optional locale preset ("en" | "it")
 * and custom partial overrides.
 */
export function resolveDataTableMessages(
  locale?: string,
  overrides?: Partial<DataTableMessages>
): DataTableMessages {
  const base =
    locale?.toLowerCase().startsWith("it") ? MESSAGES_IT : DEFAULT_MESSAGES_EN
  if (!overrides) return base
  return { ...base, ...overrides }
}
