import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DeviceAccessControls } from '../DeviceAccessControls';

function setPolicy(allowed: string[] | null) {
  Object.defineProperty(document, 'featurePolicy', {
    configurable: true,
    value: allowed === null ? undefined : { allowsFeature: (f: string) => allowed.includes(f) },
  });
}

function setGetUserMedia(impl: (c: MediaStreamConstraints) => Promise<MediaStream>) {
  Object.defineProperty(navigator, 'mediaDevices', { configurable: true, value: { getUserMedia: vi.fn(impl) } });
  return navigator.mediaDevices.getUserMedia as ReturnType<typeof vi.fn>;
}

const fakeStream = () => {
  const track = { stop: vi.fn(), addEventListener: vi.fn() };
  return { stream: { getTracks: () => [track] } as unknown as MediaStream, track };
};

function setWakeLock(request: () => Promise<unknown>) {
  Object.defineProperty(navigator, 'wakeLock', { configurable: true, value: { request: vi.fn(request) } });
  return (navigator as unknown as { wakeLock: { request: ReturnType<typeof vi.fn> } }).wakeLock.request;
}

afterEach(() => {
  setPolicy(null);
  Object.defineProperty(navigator, 'wakeLock', { configurable: true, value: undefined });
});

describe('DeviceAccessControls', () => {
  it('logs which console toggle to turn on when the hub has not delegated the device', async () => {
    setPolicy([]);
    const getUserMedia = setGetUserMedia(async () => fakeStream().stream);
    const addLog = vi.fn();
    render(<DeviceAccessControls addLog={addLog} />);
    await userEvent.click(screen.getByRole('button', { name: 'Start microphone' }));
    expect(addLog).toHaveBeenCalledWith(expect.stringMatching(/Turn on "Allow Microphone"/), 'error');
    expect(getUserMedia).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Start microphone' })).toBeInTheDocument();
  });

  it('requests video, then stops the tracks', async () => {
    setPolicy(['camera']);
    const { stream, track } = fakeStream();
    const getUserMedia = setGetUserMedia(async () => stream);
    render(<DeviceAccessControls addLog={vi.fn()} />);
    await userEvent.click(screen.getByRole('button', { name: 'Start video' }));
    expect(getUserMedia).toHaveBeenCalledWith({ video: true });
    await userEvent.click(await screen.findByRole('button', { name: 'Stop video' }));
    expect(track.stop).toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Start video' })).toBeInTheDocument();
  });

  it('logs a denial from Chrome prompt and resets the button', async () => {
    setPolicy(['microphone']);
    setGetUserMedia(async () => {
      throw new DOMException('denied', 'NotAllowedError');
    });
    const addLog = vi.fn();
    render(<DeviceAccessControls addLog={addLog} />);
    await userEvent.click(screen.getByRole('button', { name: 'Start microphone' }));
    await waitFor(() =>
      expect(addLog).toHaveBeenCalledWith(expect.stringMatching(/Denied — in Chrome's prompt.*NotAllowedError: denied/), 'error'),
    );
    expect(screen.getByRole('button', { name: 'Start microphone' })).toBeInTheDocument();
  });

  it('holds a screen wake lock while capturing and releases it on stop', async () => {
    setPolicy(['microphone', 'screen-wake-lock']);
    setGetUserMedia(async () => fakeStream().stream);
    const sentinel = { release: vi.fn(async () => {}), addEventListener: vi.fn() };
    const request = setWakeLock(async () => sentinel);
    render(<DeviceAccessControls addLog={vi.fn()} />);
    await userEvent.click(screen.getByRole('button', { name: 'Start microphone' }));
    expect(await screen.findByText('Screen kept awake while capturing')).toBeInTheDocument();
    expect(request).toHaveBeenCalledTimes(1);
    await userEvent.click(screen.getByRole('button', { name: 'Stop microphone' }));
    expect(sentinel.release).toHaveBeenCalled();
    expect(screen.queryByText('Screen kept awake while capturing')).not.toBeInTheDocument();
  });

  it('clears the wake lock status when the browser releases the lock', async () => {
    setPolicy(['microphone', 'screen-wake-lock']);
    setGetUserMedia(async () => fakeStream().stream);
    let onRelease = () => {};
    const sentinel = {
      release: vi.fn(async () => {}),
      addEventListener: vi.fn((_: string, listener: () => void) => {
        onRelease = listener;
      }),
    };
    setWakeLock(async () => sentinel);
    render(<DeviceAccessControls addLog={vi.fn()} />);
    await userEvent.click(screen.getByRole('button', { name: 'Start microphone' }));
    await screen.findByText('Screen kept awake while capturing');
    act(() => onRelease());
    expect(screen.queryByText('Screen kept awake while capturing')).not.toBeInTheDocument();
  });

  it('stops a capture that is granted after the controls unmount', async () => {
    setPolicy(['camera']);
    const { stream, track } = fakeStream();
    let grant: (s: MediaStream) => void = () => {};
    setGetUserMedia(() => new Promise<MediaStream>((resolve) => (grant = resolve)));
    const { unmount } = render(<DeviceAccessControls addLog={vi.fn()} />);
    await userEvent.click(screen.getByRole('button', { name: 'Start video' }));
    unmount();
    await act(async () => grant(stream));
    expect(track.stop).toHaveBeenCalled();
  });

  it('logs when the browser context has no media devices API', async () => {
    setPolicy(['microphone']);
    Object.defineProperty(navigator, 'mediaDevices', { configurable: true, value: undefined });
    const addLog = vi.fn();
    render(<DeviceAccessControls addLog={addLog} />);
    await userEvent.click(screen.getByRole('button', { name: 'Start microphone' }));
    expect(addLog).toHaveBeenCalledWith(expect.stringMatching(/no media devices API/), 'error');
    expect(screen.getByRole('button', { name: 'Start microphone' })).toBeInTheDocument();
  });
});
