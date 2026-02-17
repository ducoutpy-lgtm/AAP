import { useState } from 'react';
import { X } from 'lucide-react';
import Button from './Button';
import type { ExportFormat, ExportColumn, ExportOptions } from '../../services/export';
import { exportData } from '../../services/export';

interface ExportModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  filename: string;
  columns: ExportColumn[];
  data: Record<string, unknown>[];
}

const FORMAT_OPTIONS: { value: ExportFormat; label: string }[] = [
  { value: 'csv', label: 'CSV (.csv)' },
  { value: 'excel', label: 'Excel (.xlsx)' },
  { value: 'pdf', label: 'PDF (.pdf)' },
];

export default function ExportModal({
  open,
  onClose,
  title,
  filename,
  columns,
  data,
}: ExportModalProps) {
  const [format, setFormat] = useState<ExportFormat>('excel');
  const [selectedColumns, setSelectedColumns] = useState<string[]>(
    columns.map((c) => c.key),
  );

  if (!open) return null;

  function toggleColumn(key: string) {
    setSelectedColumns((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  }

  function handleExport() {
    const filteredColumns = columns.filter((c) =>
      selectedColumns.includes(c.key),
    );
    const options: ExportOptions = {
      filename,
      title,
      columns: filteredColumns,
      data,
    };
    exportData(format, options);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-label={`Exporter ${title}`}
        className="relative z-10 w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Exporter les données
          </h2>
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="rounded-lg p-1 text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Format selection */}
        <fieldset className="mt-4">
          <legend className="text-sm font-medium text-gray-700">Format</legend>
          <div className="mt-2 flex gap-3">
            {FORMAT_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className={`flex-1 cursor-pointer rounded-lg border px-3 py-2 text-center text-sm font-medium transition-colors ${
                  format === opt.value
                    ? 'border-primary-600 bg-primary-50 text-primary-700'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="export-format"
                  value={opt.value}
                  checked={format === opt.value}
                  onChange={() => setFormat(opt.value)}
                  className="sr-only"
                />
                {opt.label}
              </label>
            ))}
          </div>
        </fieldset>

        {/* Column selection */}
        <fieldset className="mt-4">
          <legend className="text-sm font-medium text-gray-700">
            Colonnes à inclure
          </legend>
          <div className="mt-2 max-h-48 space-y-2 overflow-y-auto">
            {columns.map((col) => (
              <label
                key={col.key}
                className="flex items-center gap-2 text-sm text-gray-700"
              >
                <input
                  type="checkbox"
                  checked={selectedColumns.includes(col.key)}
                  onChange={() => toggleColumn(col.key)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                {col.header}
              </label>
            ))}
          </div>
        </fieldset>

        {/* Summary */}
        <p className="mt-4 text-sm text-gray-500">
          {data.length} ligne{data.length > 1 ? 's' : ''} &middot;{' '}
          {selectedColumns.length} colonne{selectedColumns.length > 1 ? 's' : ''}
        </p>

        {/* Actions */}
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>
            Annuler
          </Button>
          <Button
            onClick={handleExport}
            disabled={selectedColumns.length === 0}
          >
            Exporter
          </Button>
        </div>
      </div>
    </div>
  );
}
