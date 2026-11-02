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

/** The SDK as this component sees it: what the provider allowed before the reload. */
function sdkGranting(devices: Array<'microphone' | 'camera'>) {
  const consumeGrantedDevices = vi.fn(() => devices);
  return { sdk: { hub: { consumeGrantedDevices } }, consumeGrantedDevices };
}

afterEach(() => {
  setPolicy(null);
  Object.defineProperty(navigator, 'wakeLock', { configurable: true, value: undefined });
});

describe('DeviceAccessControls', () => {
  // The iframe is delegated a device only after the provider consents, and the consent is
  // asked for by the getUserMedia call itself. Returning early on an undelegated policy
  // means the Hub is never asked, so the app can never become delegated.
  it('asks even when the policy has not delegated the device yet', async () => {
    setPolicy([]);
    const getUserMedia = setGetUserMedia(async () => fakeStream().stream);
    render(<DeviceAccessControls addLog={vi.fn()} sdk={null} />);
    await userEvent.click(screen.getByRole('button', { name: 'Start microphone' }));
    expect(getUserMedia).toHaveBeenCalledWith({ audio: true });
  });

  // The hub's refusal for an undeclared capability arrives as a NotAllowedError like any
  // other denial, and its own text is the guidance — so it has to reach the log intact.
  it('surfaces the hub\'s reason when it refuses an undeclared device', async () => {
    setPolicy([]);
    setGetUserMedia(async () => {
      throw new DOMException(
        'This app\'s manifest does not request the device. Add it under UI.capabilities and have the version approved.',
        'NotAllowedError',
      );
    });
    const addLog = vi.fn();
    render(<DeviceAccessControls addLog={addLog} sdk={null} />);
    await userEvent.click(screen.getByRole('button', { name: 'Start microphone' }));
    await waitFor(() =>
      expect(addLog).toHaveBeenCalledWith(
        expect.stringMatching(/manifest does not request the device.*UI\.capabilities/),
        'error',
      ),
    );
    expect(screen.getByRole('button', { name: 'Start microphone' })).toBeInTheDocument();
  });

  // The Hub reloads the app on the provider's first Allow, so the getUserMedia call that
  // asked never settles. Without this the provider allows a device and nothing happens.
  it('resumes the device the provider allowed before the reload', async () => {
    setPolicy(['microphone']);
    const getUserMedia = setGetUserMedia(async () => fakeStream().stream);
    const { sdk, consumeGrantedDevices } = sdkGranting(['microphone']);
    const addLog = vi.fn();
    render(<DeviceAccessControls addLog={addLog} sdk={sdk} />);

    await waitFor(() => expect(getUserMedia).toHaveBeenCalledWith({ audio: true }));
    expect(consumeGrantedDevices).toHaveBeenCalledTimes(1);
    expect(addLog).toHaveBeenCalledWith(expect.stringMatching(/resuming/), 'info');
    expect(await screen.findByRole('button', { name: 'Stop microphone' })).toBeInTheDocument();
  });

  // The reload drops the provider at the top of the app, pages above the control they just
  // answered a prompt about — which reads as "nothing happened".
  it('asks the page to bring the device controls back into view when it resumes', async () => {
    setPolicy(['microphone']);
    setGetUserMedia(async () => fakeStream().stream);
    const onResume = vi.fn();
    const { sdk } = sdkGranting(['microphone']);

    render(<DeviceAccessControls addLog={vi.fn()} sdk={sdk} onResume={onResume} />);

    await waitFor(() => expect(onResume).toHaveBeenCalledTimes(1));
  });

  // Any other launch is the provider's own to scroll; only a resume earns the jump.
  it('does not ask for the controls in view when nothing was granted before the reload', async () => {
    setPolicy(['microphone']);
    setGetUserMedia(async () => fakeStream().stream);
    const onResume = vi.fn();
    const { sdk } = sdkGranting([]);

    render(<DeviceAccessControls addLog={vi.fn()} sdk={sdk} onResume={onResume} />);

    await act(async () => { await Promise.resolve(); });
    expect(onResume).not.toHaveBeenCalled();
  });

  // The Hub's microphone badge tells the provider the app is listening, so it follows
  // the microphone whichever button started or stopped it.
  it('reports both devices going live and stopping, from the visit button too', async () => {
    vi.stubGlobal('MediaStream', class {
      constructor(private readonly tracks: unknown[]) {}
      getTracks() { return this.tracks; }
    });
    const audio = { stop: vi.fn(), addEventListener: vi.fn() };
    const video = { stop: vi.fn(), addEventListener: vi.fn() };
    const stream = { getTracks: () => [audio, video], getAudioTracks: () => [audio], getVideoTracks: () => [video] };
    setGetUserMedia(async () => stream as unknown as MediaStream);
    const onMicrophoneLiveChange = vi.fn();
    const onCameraLiveChange = vi.fn();
    render(
      <DeviceAccessControls
        addLog={vi.fn()}
        sdk={null}
        onMicrophoneLiveChange={onMicrophoneLiveChange}
        onCameraLiveChange={onCameraLiveChange}
      />,
    );
    expect(onMicrophoneLiveChange).not.toHaveBeenCalled();
    expect(onCameraLiveChange).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole('button', { name: 'Start video visit (mic + camera)' }));
    await waitFor(() => expect(onMicrophoneLiveChange).toHaveBeenLastCalledWith(true));
    await waitFor(() => expect(onCameraLiveChange).toHaveBeenLastCalledWith(true));

    await userEvent.click(screen.getByRole('button', { name: 'Stop video visit' }));
    await waitFor(() => expect(onMicrophoneLiveChange).toHaveBeenLastCalledWith(false));
    await waitFor(() => expect(onCameraLiveChange).toHaveBeenLastCalledWith(false));
    expect(onMicrophoneLiveChange).toHaveBeenCalledTimes(2);
    expect(onCameraLiveChange).toHaveBeenCalledTimes(2);
    vi.unstubAllGlobals();
  });

  // The camera alone captures no sound, so the microphone badge stays off.
  it('reports only the camera for the camera alone', async () => {
    setGetUserMedia(async () => fakeStream().stream);
    const onMicrophoneLiveChange = vi.fn();
    const onCameraLiveChange = vi.fn();
    render(
      <DeviceAccessControls
        addLog={vi.fn()}
        sdk={null}
        onMicrophoneLiveChange={onMicrophoneLiveChange}
        onCameraLiveChange={onCameraLiveChange}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Start video' }));
    await screen.findByRole('button', { name: 'Stop video' });
    expect(onMicrophoneLiveChange).not.toHaveBeenCalled();
    expect(onCameraLiveChange).toHaveBeenLastCalledWith(true);
  });

  // The SDK is null until the handshake completes, so a resume that only looked on mount
  // would read nothing and the provider's Allow would be lost.
  it('resumes once the sdk arrives, not only if it was there on mount', async () => {
    setPolicy(['microphone']);
    const getUserMedia = setGetUserMedia(async () => fakeStream().stream);
    const { sdk } = sdkGranting(['camera']);
    const { rerender } = render(<DeviceAccessControls addLog={vi.fn()} sdk={null} />);

    await act(async () => { await Promise.resolve(); });
    expect(getUserMedia).not.toHaveBeenCalled();

    rerender(<DeviceAccessControls addLog={vi.fn()} sdk={sdk} />);
    await waitFor(() => expect(getUserMedia).toHaveBeenCalledWith({ video: true }));
  });

  it('starts nothing on an ordinary launch', async () => {
    setPolicy(['microphone']);
    const getUserMedia = setGetUserMedia(async () => fakeStream().stream);
    const { sdk } = sdkGranting([]);
    render(<DeviceAccessControls addLog={vi.fn()} sdk={sdk} />);

    await act(async () => { await Promise.resolve(); });
    expect(getUserMedia).not.toHaveBeenCalled();
  });

  it('requests video, then stops the tracks', async () => {
    setPolicy(['camera']);
    const { stream, track } = fakeStream();
    const getUserMedia = setGetUserMedia(async () => stream);
    render(<DeviceAccessControls addLog={vi.fn()} sdk={null} />);
    await userEvent.click(screen.getByRole('button', { name: 'Start video' }));
    expect(getUserMedia).toHaveBeenCalledWith({ video: true });
    await userEvent.click(await screen.findByRole('button', { name: 'Stop video' }));
    expect(track.stop).toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Start video' })).toBeInTheDocument();
  });

  // The Hub shows one prompt for both devices only when one getUserMedia call asks for both.
  it('starts a video visit with one call for both devices, then stops both', async () => {
    vi.stubGlobal('MediaStream', class {
      constructor(private readonly tracks: unknown[]) {}
      getTracks() { return this.tracks; }
    });
    const audio = { stop: vi.fn(), addEventListener: vi.fn() };
    const video = { stop: vi.fn(), addEventListener: vi.fn() };
    const stream = { getTracks: () => [audio, video], getAudioTracks: () => [audio], getVideoTracks: () => [video] };
    const getUserMedia = setGetUserMedia(async () => stream as unknown as MediaStream);
    render(<DeviceAccessControls addLog={vi.fn()} sdk={null} />);
    await userEvent.click(screen.getByRole('button', { name: 'Start video visit (mic + camera)' }));
    expect(getUserMedia).toHaveBeenCalledTimes(1);
    expect(getUserMedia).toHaveBeenCalledWith({ audio: true, video: true });
    expect(await screen.findByRole('button', { name: 'Stop microphone' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Stop video' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Stop video visit' }));
    expect(audio.stop).toHaveBeenCalled();
    expect(video.stop).toHaveBeenCalled();
    vi.unstubAllGlobals();
  });

  it('offers to stop the visit when only one device is live', async () => {
    const { stream, track } = fakeStream();
    setGetUserMedia(async () => stream);
    render(<DeviceAccessControls addLog={vi.fn()} sdk={null} />);
    await userEvent.click(screen.getByRole('button', { name: 'Start video' }));
    const visit = await screen.findByRole('button', { name: 'Stop video visit' });
    expect(visit).toBeEnabled();
    await userEvent.click(visit);
    expect(track.stop).toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Start video visit (mic + camera)' })).toBeInTheDocument();
  });

  it('does not blame both devices when the visit fails on one', async () => {
    setGetUserMedia(async () => {
      throw new DOMException('Requested device not found', 'NotFoundError');
    });
    const addLog = vi.fn();
    render(<DeviceAccessControls addLog={addLog} sdk={null} />);
    await userEvent.click(screen.getByRole('button', { name: 'Start video visit (mic + camera)' }));
    await waitFor(() =>
      expect(addLog).toHaveBeenCalledWith(expect.stringMatching(/^Video visit: No microphone or camera found/), 'error'),
    );
  });

  it('logs a denial of the video visit and resets both devices', async () => {
    setGetUserMedia(async () => {
      throw new DOMException('denied', 'NotAllowedError');
    });
    const addLog = vi.fn();
    render(<DeviceAccessControls addLog={addLog} sdk={null} />);
    await userEvent.click(screen.getByRole('button', { name: 'Start video visit (mic + camera)' }));
    await waitFor(() => expect(addLog).toHaveBeenCalledWith(expect.stringMatching(/^Video visit: Not allowed/), 'error'));
    expect(screen.getByRole('button', { name: 'Start microphone' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Start video' })).toBeEnabled();
  });

  it('logs a denial from Chrome prompt and resets the button', async () => {
    setPolicy(['microphone']);
    setGetUserMedia(async () => {
      throw new DOMException('denied', 'NotAllowedError');
    });
    const addLog = vi.fn();
    render(<DeviceAccessControls addLog={addLog} sdk={null} />);
    await userEvent.click(screen.getByRole('button', { name: 'Start microphone' }));
    await waitFor(() =>
      expect(addLog).toHaveBeenCalledWith(
        expect.stringMatching(/Not allowed — the provider, Chrome, or the Hub refused it.*NotAllowedError: denied/),
        'error',
      ),
    );
    expect(screen.getByRole('button', { name: 'Start microphone' })).toBeInTheDocument();
  });

  it('holds a screen wake lock while capturing and releases it on stop', async () => {
    setPolicy(['microphone', 'screen-wake-lock']);
    setGetUserMedia(async () => fakeStream().stream);
    const sentinel = { release: vi.fn(async () => {}), addEventListener: vi.fn() };
    const request = setWakeLock(async () => sentinel);
    render(<DeviceAccessControls addLog={vi.fn()} sdk={null} />);
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
    render(<DeviceAccessControls addLog={vi.fn()} sdk={null} />);
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
    const { unmount } = render(<DeviceAccessControls addLog={vi.fn()} sdk={null} />);
    await userEvent.click(screen.getByRole('button', { name: 'Start video' }));
    unmount();
    await act(async () => grant(stream));
    expect(track.stop).toHaveBeenCalled();
  });

  it('logs when the browser context has no media devices API', async () => {
    setPolicy(['microphone']);
    Object.defineProperty(navigator, 'mediaDevices', { configurable: true, value: undefined });
    const addLog = vi.fn();
    render(<DeviceAccessControls addLog={addLog} sdk={null} />);
    await userEvent.click(screen.getByRole('button', { name: 'Start microphone' }));
    expect(addLog).toHaveBeenCalledWith(expect.stringMatching(/no media devices API/), 'error');
    expect(screen.getByRole('button', { name: 'Start microphone' })).toBeInTheDocument();
  });
});
