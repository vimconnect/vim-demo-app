import '@testing-library/jest-dom/vitest';
import { afterEach, describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorScreen, formatDiagnostics } from '../ErrorScreen';

describe('formatDiagnostics', () => {
  it('aligns labels by padding to the longest', () => {
    const text = formatDiagnostics([
      { label: 'Error:', value: 'boom' },
      { label: 'Browser:', value: 'Firefox' },
    ]);
    expect(text).toBe(['Error:   boom', 'Browser: Firefox'].join('\n'));
  });

  it('produces one line per field in the given order', () => {
    const text = formatDiagnostics([
      { label: 'A:', value: '1' },
      { label: 'B:', value: '2' },
      { label: 'C:', value: '3' },
    ]);
    expect(text.split('\n')).toEqual(['A: 1', 'B: 2', 'C: 3']);
  });
});

describe('ErrorScreen', () => {
  const baseProps = {
    heading: 'Connection Error',
    message: 'Something went wrong. Press retry to reload the application.',
    diagnostics: [
      { label: 'Error:', value: 'SDK init timed out' },
      { label: 'Code:', value: 'TIMEOUT' },
      { label: 'Time:', value: '2026-05-14T04:00:00.000Z' },
      { label: 'Browser:', value: 'TestAgent/1.0' },
    ],
  };

  it('shows the friendly heading and message with the diagnostics folded away', () => {
    const { container } = render(<ErrorScreen {...baseProps} />);

    expect(screen.getByRole('heading', { name: 'Connection Error' })).toBeInTheDocument();
    expect(screen.getByText(baseProps.message)).toBeInTheDocument();
    const details = container.querySelector('details');
    expect(details).not.toBeNull();
    expect(details).not.toHaveAttribute('open');
    expect(screen.getByText('Error details')).toBeInTheDocument();
  });

  it('reveals the aligned diagnostics when "Error details" is opened', async () => {
    const user = userEvent.setup();
    const { container } = render(<ErrorScreen {...baseProps} />);

    await user.click(screen.getByText('Error details'));
    expect(container.querySelector('details')).toHaveAttribute('open');
    expect(screen.getByText(/SDK init timed out/)).toBeVisible();
    expect(screen.getByText(/Browser:.*TestAgent\/1\.0/)).toBeInTheDocument();
  });

  describe('retry', () => {
    it('renders and invokes onClick when retry prop is provided', async () => {
      const user = userEvent.setup();
      const onRetry = vi.fn();
      render(<ErrorScreen {...baseProps} retry={{ label: 'Retry', onClick: onRetry }} />);

      await user.click(screen.getByRole('button', { name: 'Retry' }));
      expect(onRetry).toHaveBeenCalledTimes(1);
    });

    it('omits the retry button when retry prop is not provided', () => {
      render(<ErrorScreen {...baseProps} />);
      expect(screen.queryByRole('button', { name: 'Retry' })).not.toBeInTheDocument();
    });
  });

  describe('copy', () => {
    const originalClipboard = Object.getOwnPropertyDescriptor(navigator, 'clipboard');
    afterEach(() => {
      if (originalClipboard) Object.defineProperty(navigator, 'clipboard', originalClipboard);
      else delete (navigator as unknown as { clipboard?: unknown }).clipboard;
      delete (document as unknown as { execCommand?: unknown }).execCommand;
    });

    it('writes the formatted diagnostics text to the clipboard', async () => {
      const user = userEvent.setup();
      const writeText = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
      render(<ErrorScreen {...baseProps} />);

      await user.click(screen.getByRole('button', { name: /copy diagnostics/i }));

      expect(writeText).toHaveBeenCalledTimes(1);
      const written = writeText.mock.calls[0][0] as string;
      expect(written).toContain('Error:   SDK init timed out');
      expect(written).toContain('Code:    TIMEOUT');
      expect(written).toContain('Browser: TestAgent/1.0');
    });

    it('still copies when the iframe blocks navigator.clipboard', async () => {
      const user = userEvent.setup();
      const writeText = vi.fn().mockRejectedValue(new Error('blocked by permissions policy'));
      Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
      const execCommand = vi.fn().mockReturnValue(true);
      Object.defineProperty(document, 'execCommand', { value: execCommand, configurable: true });
      render(<ErrorScreen {...baseProps} />);

      await user.click(screen.getByRole('button', { name: /copy diagnostics/i }));

      expect(execCommand).toHaveBeenCalledWith('copy');
      expect(await screen.findByRole('button', { name: /diagnostics copied/i })).toBeInTheDocument();
    });
  });
});
