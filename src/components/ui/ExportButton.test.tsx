import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ExportButton from './ExportButton';
import type { ExportOptions } from '../../services/export';
import * as exportService from '../../services/export';

vi.mock('../../services/export', async () => {
  const actual = await vi.importActual('../../services/export');
  return {
    ...actual,
    exportData: vi.fn(),
  };
});

const sampleOptions: ExportOptions = {
  filename: 'test',
  columns: [{ key: 'name', header: 'Nom' }],
  data: [{ name: 'Alpha' }],
};

afterEach(() => {
  vi.clearAllMocks();
});

describe('ExportButton', () => {
  describe('single format', () => {
    it('renders a direct export button when only one format', () => {
      render(<ExportButton options={sampleOptions} formats={['csv']} />);
      expect(screen.getByText('Exporter en CSV')).toBeInTheDocument();
    });

    it('exports immediately on click for single format', async () => {
      render(<ExportButton options={sampleOptions} formats={['excel']} />);
      await userEvent.click(screen.getByText('Exporter en Excel'));
      expect(exportService.exportData).toHaveBeenCalledWith('excel', sampleOptions);
    });
  });

  describe('multiple formats (dropdown)', () => {
    it('renders an Exporter button', () => {
      render(<ExportButton options={sampleOptions} />);
      expect(screen.getByText('Exporter')).toBeInTheDocument();
    });

    it('does not show dropdown menu initially', () => {
      render(<ExportButton options={sampleOptions} />);
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });

    it('shows dropdown menu on click', async () => {
      render(<ExportButton options={sampleOptions} />);
      await userEvent.click(screen.getByText('Exporter'));
      expect(screen.getByRole('menu')).toBeInTheDocument();
    });

    it('shows all three format options in the dropdown', async () => {
      render(<ExportButton options={sampleOptions} />);
      await userEvent.click(screen.getByText('Exporter'));
      expect(screen.getByText('CSV')).toBeInTheDocument();
      expect(screen.getByText('Excel')).toBeInTheDocument();
      expect(screen.getByText('PDF')).toBeInTheDocument();
    });

    it('exports in the selected format and closes the menu', async () => {
      render(<ExportButton options={sampleOptions} />);
      await userEvent.click(screen.getByText('Exporter'));
      await userEvent.click(screen.getByText('PDF'));
      expect(exportService.exportData).toHaveBeenCalledWith('pdf', sampleOptions);
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });

    it('closes dropdown when clicking outside', async () => {
      render(
        <div>
          <ExportButton options={sampleOptions} />
          <span>outside</span>
        </div>,
      );
      await userEvent.click(screen.getByText('Exporter'));
      expect(screen.getByRole('menu')).toBeInTheDocument();

      await userEvent.click(screen.getByText('outside'));
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });

    it('sets aria-expanded correctly', async () => {
      render(<ExportButton options={sampleOptions} />);
      const button = screen.getByText('Exporter');
      expect(button).toHaveAttribute('aria-expanded', 'false');

      await userEvent.click(button);
      expect(button).toHaveAttribute('aria-expanded', 'true');
    });
  });
});
