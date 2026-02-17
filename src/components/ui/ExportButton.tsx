import { useState, useRef, useEffect } from 'react';
import { Download } from 'lucide-react';
import type { ExportFormat, ExportOptions } from '../../services/export';
import { exportData } from '../../services/export';

interface ExportButtonProps {
  options: ExportOptions;
  formats?: ExportFormat[];
}

const FORMAT_LABELS: Record<ExportFormat, string> = {
  csv: 'CSV',
  excel: 'Excel',
  pdf: 'PDF',
};

export default function ExportButton({
  options,
  formats = ['csv', 'excel', 'pdf'],
}: ExportButtonProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  function handleExport(format: ExportFormat) {
    exportData(format, options);
    setOpen(false);
  }

  if (formats.length === 1) {
    return (
      <button
        type="button"
        onClick={() => handleExport(formats[0])}
        className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
      >
        <Download className="h-4 w-4" />
        Exporter en {FORMAT_LABELS[formats[0]]}
      </button>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-haspopup="true"
        aria-expanded={open}
        className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
      >
        <Download className="h-4 w-4" />
        Exporter
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-10 mt-2 w-44 rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
        >
          {formats.map((format) => (
            <button
              key={format}
              role="menuitem"
              onClick={() => handleExport(format)}
              className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
            >
              {FORMAT_LABELS[format]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
