import {
  resolveValue,
  buildRows,
  buildCSVContent,
  buildExcelWorkbook,
} from './export';
import type { ExportOptions } from './export';

const sampleOptions: ExportOptions = {
  filename: 'test-export',
  title: 'Test Export',
  columns: [
    { key: 'name', header: 'Nom' },
    { key: 'amount', header: 'Montant' },
    { key: 'status', header: 'Statut' },
  ],
  data: [
    { name: 'Projet Alpha', amount: 50000, status: 'active' },
    { name: 'Projet Beta', amount: 100000, status: 'draft' },
  ],
};

describe('resolveValue', () => {
  it('resolves a simple key', () => {
    expect(resolveValue({ name: 'Test' }, 'name')).toBe('Test');
  });

  it('resolves a dot-separated nested key', () => {
    expect(resolveValue({ budget: { total: 75000 } }, 'budget.total')).toBe('75000');
  });

  it('returns empty string for missing keys', () => {
    expect(resolveValue({ name: 'Test' }, 'missing')).toBe('');
  });

  it('returns empty string for missing nested keys', () => {
    expect(resolveValue({ a: { b: 1 } }, 'a.c')).toBe('');
  });

  it('returns empty string for null values', () => {
    expect(resolveValue({ val: null }, 'val')).toBe('');
  });

  it('formats Date objects using fr-FR locale', () => {
    const date = new Date(2025, 5, 15);
    const result = resolveValue({ d: date }, 'd');
    expect(result).toBe('15/06/2025');
  });

  it('converts numbers to strings', () => {
    expect(resolveValue({ count: 42 }, 'count')).toBe('42');
  });

  it('converts booleans to strings', () => {
    expect(resolveValue({ active: true }, 'active')).toBe('true');
  });
});

describe('buildRows', () => {
  it('returns headers as the first row', () => {
    const rows = buildRows(sampleOptions);
    expect(rows[0]).toEqual(['Nom', 'Montant', 'Statut']);
  });

  it('returns the correct number of rows (header + data)', () => {
    const rows = buildRows(sampleOptions);
    expect(rows).toHaveLength(3);
  });

  it('maps data values correctly', () => {
    const rows = buildRows(sampleOptions);
    expect(rows[1]).toEqual(['Projet Alpha', '50000', 'active']);
    expect(rows[2]).toEqual(['Projet Beta', '100000', 'draft']);
  });

  it('handles empty data array', () => {
    const rows = buildRows({ ...sampleOptions, data: [] });
    expect(rows).toHaveLength(1);
    expect(rows[0]).toEqual(['Nom', 'Montant', 'Statut']);
  });
});

describe('buildCSVContent', () => {
  it('starts with UTF-8 BOM', () => {
    const content = buildCSVContent(sampleOptions);
    expect(content.charCodeAt(0)).toBe(0xfeff);
  });

  it('includes headers', () => {
    const content = buildCSVContent(sampleOptions);
    expect(content).toContain('"Nom"');
    expect(content).toContain('"Montant"');
    expect(content).toContain('"Statut"');
  });

  it('includes data values', () => {
    const content = buildCSVContent(sampleOptions);
    expect(content).toContain('"Projet Alpha"');
    expect(content).toContain('"50000"');
  });

  it('separates columns with commas', () => {
    const content = buildCSVContent(sampleOptions);
    const firstLine = content.split('\n')[0];
    expect(firstLine).toContain('","');
  });

  it('separates rows with newlines', () => {
    const content = buildCSVContent(sampleOptions);
    const lines = content.split('\n');
    expect(lines).toHaveLength(3);
  });

  it('escapes double quotes by doubling them', () => {
    const opts: ExportOptions = {
      ...sampleOptions,
      data: [{ name: 'Projet "Test"', amount: 0, status: '' }],
    };
    const content = buildCSVContent(opts);
    expect(content).toContain('""Test""');
  });

  it('handles empty cell values', () => {
    const opts: ExportOptions = {
      ...sampleOptions,
      columns: [{ key: 'missing', header: 'Missing' }],
      data: [{ name: 'Test' }],
    };
    const content = buildCSVContent(opts);
    const dataLine = content.split('\n')[1];
    expect(dataLine).toBe('""');
  });
});

describe('buildExcelWorkbook', () => {
  it('creates a workbook with one sheet', () => {
    const wb = buildExcelWorkbook(sampleOptions);
    expect(wb.SheetNames).toHaveLength(1);
  });

  it('names the sheet after the title', () => {
    const wb = buildExcelWorkbook(sampleOptions);
    expect(wb.SheetNames[0]).toBe('Test Export');
  });

  it('uses "Export" as default sheet name when no title', () => {
    const wb = buildExcelWorkbook({ ...sampleOptions, title: undefined });
    expect(wb.SheetNames[0]).toBe('Export');
  });

  it('contains the header cells', () => {
    const wb = buildExcelWorkbook(sampleOptions);
    const sheet = wb.Sheets[wb.SheetNames[0]];
    expect(sheet['A1']?.v).toBe('Nom');
    expect(sheet['B1']?.v).toBe('Montant');
    expect(sheet['C1']?.v).toBe('Statut');
  });

  it('contains the data cells', () => {
    const wb = buildExcelWorkbook(sampleOptions);
    const sheet = wb.Sheets[wb.SheetNames[0]];
    expect(sheet['A2']?.v).toBe('Projet Alpha');
    expect(sheet['B2']?.v).toBe('50000');
  });

  it('sets column widths', () => {
    const wb = buildExcelWorkbook(sampleOptions);
    const sheet = wb.Sheets[wb.SheetNames[0]];
    expect(sheet['!cols']).toBeDefined();
    expect(sheet['!cols']!.length).toBe(3);
  });
});
