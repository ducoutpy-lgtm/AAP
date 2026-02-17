import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export type ExportFormat = 'csv' | 'excel' | 'pdf';

export interface ExportColumn {
  key: string;
  header: string;
}

export interface ExportOptions {
  filename: string;
  title?: string;
  columns: ExportColumn[];
  data: Record<string, unknown>[];
}

/** Resolve a possibly dot-separated key against a row object. */
export function resolveValue(row: Record<string, unknown>, key: string): string {
  const value = key.split('.').reduce<unknown>((obj, k) => {
    if (obj != null && typeof obj === 'object') {
      return (obj as Record<string, unknown>)[k];
    }
    return undefined;
  }, row);

  if (value == null) return '';
  if (value instanceof Date) return value.toLocaleDateString('fr-FR');
  return String(value);
}

/** Build a 2D array of strings: [headers, ...dataRows]. */
export function buildRows(options: ExportOptions): string[][] {
  const headers = options.columns.map((col) => col.header);
  const body = options.data.map((row) =>
    options.columns.map((col) => resolveValue(row, col.key)),
  );
  return [headers, ...body];
}

/** Build CSV content string (with BOM for UTF-8). */
export function buildCSVContent(options: ExportOptions): string {
  const rows = buildRows(options);
  const csvBody = rows
    .map((row) =>
      row
        .map((cell) => {
          const escaped = cell.replace(/"/g, '""');
          return `"${escaped}"`;
        })
        .join(','),
    )
    .join('\n');

  return '\uFEFF' + csvBody;
}

export function exportToCSV(options: ExportOptions): void {
  const content = buildCSVContent(options);
  const blob = new Blob([content], {
    type: 'text/csv;charset=utf-8;',
  });
  downloadBlob(blob, `${options.filename}.csv`);
}

/** Build an XLSX workbook object. */
export function buildExcelWorkbook(options: ExportOptions): XLSX.WorkBook {
  const rows = buildRows(options);
  const worksheet = XLSX.utils.aoa_to_sheet(rows);

  const colWidths = rows[0].map((_, colIdx) => {
    const maxLen = rows.reduce(
      (max, row) => Math.max(max, (row[colIdx] || '').length),
      0,
    );
    return { wch: Math.min(Math.max(maxLen + 2, 10), 50) };
  });
  worksheet['!cols'] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, options.title || 'Export');
  return workbook;
}

export function exportToExcel(options: ExportOptions): void {
  const workbook = buildExcelWorkbook(options);
  XLSX.writeFile(workbook, `${options.filename}.xlsx`);
}

export function exportToPDF(options: ExportOptions): void {
  const doc = new jsPDF({ orientation: 'landscape' });

  if (options.title) {
    doc.setFontSize(16);
    doc.text(options.title, 14, 20);
  }

  const headers = options.columns.map((col) => col.header);
  const body = options.data.map((row) =>
    options.columns.map((col) => resolveValue(row, col.key)),
  );

  autoTable(doc, {
    head: [headers],
    body,
    startY: options.title ? 28 : 14,
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: [37, 99, 235] },
  });

  doc.save(`${options.filename}.pdf`);
}

export function exportData(
  format: ExportFormat,
  options: ExportOptions,
): void {
  switch (format) {
    case 'csv':
      exportToCSV(options);
      break;
    case 'excel':
      exportToExcel(options);
      break;
    case 'pdf':
      exportToPDF(options);
      break;
  }
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
