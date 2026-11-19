import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Toggle } from '../Toggle';

describe('Toggle', () => {
  it('flips the switch when its visible label is clicked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Toggle on={false} onChange={onChange} label="Show camera badge">
        Hidden
      </Toggle>,
    );

    await user.click(screen.getByText('Hidden'));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('ignores clicks on the visible label while disabled', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Toggle on={false} onChange={onChange} label="Show camera badge" disabled>
        Hidden
      </Toggle>,
    );

    await user.click(screen.getByText('Hidden'));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('names the switch with its label prop', () => {
    render(<Toggle on onChange={() => {}} label="Subscribe to patient" />);
    expect(screen.getByRole('switch', { name: 'Subscribe to patient' })).toHaveAttribute('aria-checked', 'true');
  });
});
