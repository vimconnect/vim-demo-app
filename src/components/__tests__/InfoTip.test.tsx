import '@testing-library/jest-dom/vitest';
import { describe, it, expect } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { InfoTip } from '../Hint';

describe('InfoTip', () => {
  it('exposes the help text as the trigger description', () => {
    render(<InfoTip label="About Read">Reads on <code>demand</code>.</InfoTip>);
    const trigger = screen.getByRole('button', { name: 'About Read' });
    const id = trigger.getAttribute('aria-describedby');
    expect(id).toBeTruthy();
    expect(document.getElementById(id!)).toHaveTextContent('Reads on demand.');
  });

  it('shows the themed bubble on focus and hides it on Escape', () => {
    render(<InfoTip label="About Read">Reads on demand.</InfoTip>);
    const trigger = screen.getByRole('button', { name: 'About Read' });
    fireEvent.focus(trigger);
    expect(screen.getByRole('tooltip')).toHaveTextContent('Reads on demand.');
    fireEvent.keyDown(trigger, { key: 'Escape' });
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });
});
