import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ExportModal from './ExportModal';
import type { ExportColumn } from '../../services/export';
import * as exportService from '../../services/export';

vi.mock('../../services/export', async () => {
  const actual = await vi.importActual('../../services/export');
  return {
    ...actual,
    exportData: vi.fn(),
  };
});

const columns: ExportColumn[] = [
  { key: 'name', header: 'Nom' },
  { key: 'amount', header: 'Montant' },
  { key: 'status', header: 'Statut' },
];

const data = [
  { name: 'Alpha', amount: 1000, status: 'active' },
  { name: 'Beta', amount: 2000, status: 'draft' },
];

const defaultProps = {
  open: true,
  onClose: vi.fn(),
  title: 'Candidatures',
  filename: 'candidatures',
  columns,
  data,
};

afterEach(() => {
  vi.clearAllMocks();
});

describe('ExportModal', () => {
  it('renders nothing when closed', () => {
    render(<ExportModal {...defaultProps} open={false} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders the dialog when open', () => {
    render(<ExportModal {...defaultProps} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('shows the modal title', () => {
    render(<ExportModal {...defaultProps} />);
    expect(screen.getByText('Exporter les données')).toBeInTheDocument();
  });

  it('shows all three format options', () => {
    render(<ExportModal {...defaultProps} />);
    expect(screen.getByText('CSV (.csv)')).toBeInTheDocument();
    expect(screen.getByText('Excel (.xlsx)')).toBeInTheDocument();
    expect(screen.getByText('PDF (.pdf)')).toBeInTheDocument();
  });

  it('shows all column checkboxes, checked by default', () => {
    render(<ExportModal {...defaultProps} />);
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes).toHaveLength(3);
    checkboxes.forEach((cb) => {
      expect(cb).toBeChecked();
    });
  });

  it('shows the row and column count summary', () => {
    render(<ExportModal {...defaultProps} />);
    expect(screen.getByText(/2 lignes/)).toBeInTheDocument();
    expect(screen.getByText(/3 colonnes/)).toBeInTheDocument();
  });

  it('allows toggling columns off', async () => {
    render(<ExportModal {...defaultProps} />);
    const nameCheckbox = screen.getByLabelText('Nom');
    await userEvent.click(nameCheckbox);
    expect(nameCheckbox).not.toBeChecked();
    expect(screen.getByText(/2 colonnes/)).toBeInTheDocument();
  });

  it('calls exportData with the selected format and columns on export', async () => {
    render(<ExportModal {...defaultProps} />);

    // Select CSV
    await userEvent.click(screen.getByText('CSV (.csv)'));

    // Uncheck "Statut"
    await userEvent.click(screen.getByLabelText('Statut'));

    // Click export
    await userEvent.click(screen.getByText('Exporter'));

    expect(exportService.exportData).toHaveBeenCalledWith('csv', {
      filename: 'candidatures',
      title: 'Candidatures',
      columns: [
        { key: 'name', header: 'Nom' },
        { key: 'amount', header: 'Montant' },
      ],
      data,
    });
  });

  it('calls onClose after export', async () => {
    render(<ExportModal {...defaultProps} />);
    await userEvent.click(screen.getByText('Exporter'));
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('calls onClose when clicking Annuler', async () => {
    render(<ExportModal {...defaultProps} />);
    await userEvent.click(screen.getByText('Annuler'));
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('calls onClose when clicking the X button', async () => {
    render(<ExportModal {...defaultProps} />);
    await userEvent.click(screen.getByLabelText('Fermer'));
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('disables the export button when no columns are selected', async () => {
    render(<ExportModal {...defaultProps} />);
    // Uncheck all columns
    for (const col of columns) {
      await userEvent.click(screen.getByLabelText(col.header));
    }
    expect(screen.getByText('Exporter')).toBeDisabled();
  });

  it('defaults to Excel format', () => {
    render(<ExportModal {...defaultProps} />);
    const excelRadio = screen.getByDisplayValue('excel');
    expect(excelRadio).toBeChecked();
  });
});
