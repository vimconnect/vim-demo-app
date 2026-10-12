import '@testing-library/jest-dom/vitest';
import { describe, expect, it } from 'vitest';
import { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InPageSearch } from '../InPageSearch';

function Harness() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <InPageSearch rootSelector="#root" open={open} onOpenChange={setOpen} />
      <div id="root">
        <p>mrn: SBX0002</p>
        <p>other mrn</p>
      </div>
    </>
  );
}

describe('InPageSearch', () => {
  it('opens on Ctrl+F, counts matches, steps and closes on Escape', async () => {
    Element.prototype.scrollIntoView = () => {};
    render(<Harness />);
    expect(screen.queryByRole('search')).not.toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'f', ctrlKey: true });
    const input = screen.getByRole('searchbox', { name: 'Find in app' });
    await userEvent.type(input, 'mrn');
    expect(screen.getByText('1/2')).toBeInTheDocument();

    await userEvent.type(input, '{Enter}');
    expect(screen.getByText('2/2')).toBeInTheDocument();

    await userEvent.type(input, '{Escape}');
    expect(screen.queryByRole('search')).not.toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'f', ctrlKey: true });
    expect(screen.getByRole('searchbox', { name: 'Find in app' })).toHaveValue('');
    expect(screen.queryByText('2/2')).not.toBeInTheDocument();
  });
});
