import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { InfoTip } from '../Hint';

describe('InfoTip', () => {
  it('is a named trigger that opens its help text, code and all, from the keyboard', async () => {
    render(<InfoTip label="About Read">Reads on <code>demand</code>.</InfoTip>);
    const trigger = screen.getByRole('button', { name: 'About Read' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    fireEvent.keyDown(trigger, { key: 'Enter' });
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(await screen.findByText('demand')).toBeInTheDocument();
    expect(screen.getByText(/Reads on/)).toHaveTextContent('Reads on demand.');
  });

  it("doesn't pass its click on to a clickable header around it", () => {
    const onHeaderClick = vi.fn();
    render(
      <div onClick={onHeaderClick}>
        <InfoTip label="About Read">Reads on demand.</InfoTip>
      </div>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'About Read' }));
    expect(onHeaderClick).not.toHaveBeenCalled();
  });
});
