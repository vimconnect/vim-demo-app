'use client';

import { useEffect, useRef, useState } from 'react';

type Device = 'microphone' | 'camera';
type LogType = 'info' | 'success' | 'error';

/** The slice of the SDK this needs: what the provider allowed before the reload. */
type DeviceGrantSource = { hub: { consumeGrantedDevices?: () => Device[] } };

type DeviceState =
  | { status: 'idle' }
  | { status: 'requesting' }
  | { status: 'live'; stream: MediaStream };

const DEVICE_LABEL: Record<Device, string> = { microphone: 'Microphone', camera: 'Video' };

type FeaturePolicy = { allowsFeature: (feature: string) => boolean };
type WakeLockSentinelLike = {
  release: () => Promise<void>;
  addEventListener?: (type: 'release', listener: () => void) => void;
};

/** `false` only when the iframe's Permissions Policy definitely denies `feature`; unknown counts as allowed. */
export function policyAllows(feature: string): boolean {
  const policy = (document as unknown as { featurePolicy?: FeaturePolicy }).featurePolicy;
  return policy ? policy.allowsFeature(feature) : true;
}

export function captureErrorMessage(device: string, error: unknown): string {
  const { name = '', message = '' } = (error ?? {}) as { name?: string; message?: string };
  const raw = name ? ` (${name}: ${message})` : '';
  if (name === 'NotAllowedError' || name === 'SecurityError') {
    // The provider, Chrome and the Hub all refuse as NotAllowedError and nothing
    // distinguishes them, so name none of them — the raw message says which it was.
    return `Not allowed — the provider, Chrome, or the Hub refused it${raw}.`;
  }
  if (name === 'NotFoundError' || name === 'OverconstrainedError') return `No ${device} found on this computer${raw}.`;
  if (name === 'NotReadableError') return `The ${device} is in use by another app${raw}.`;
  return name ? `${name}: ${message}` : String(error);
}

function MicLevel({ stream }: { stream: MediaStream }) {
  const [level, setLevel] = useState(0);
  useEffect(() => {
    const AudioCtx = window.AudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    ctx.createMediaStreamSource(stream).connect(analyser);
    const samples = new Uint8Array(analyser.frequencyBinCount);
    let frame = 0;
    const tick = () => {
      analyser.getByteTimeDomainData(samples);
      const peak = samples.reduce((max, v) => Math.max(max, Math.abs(v - 128)), 0);
      setLevel(Math.min(1, peak / 64));
      frame = requestAnimationFrame(tick);
    };
    tick();
    return () => {
      cancelAnimationFrame(frame);
      void ctx.close();
    };
  }, [stream]);
  return (
    <div className="mic-level" role="meter" aria-label="Microphone level" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(level * 100)}>
      <div className="mic-level-fill" style={{ transform: `scaleX(${level})` }} />
    </div>
  );
}

function VideoPreview({ stream }: { stream: MediaStream }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.srcObject = stream;
  }, [stream]);
  return <video ref={ref} className="video-preview" autoPlay muted playsInline aria-label="Camera preview" />;
}

/** Calls `onChange` when `live` flips, never on mount while idle. */
function useReportLive(live: boolean, onChange: ((live: boolean) => void) | undefined) {
  const reportedRef = useRef(false);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  useEffect(() => {
    if (reportedRef.current === live) return;
    reportedRef.current = live;
    onChangeRef.current?.(live);
  }, [live]);
}

/**
 * Starts the microphone or camera with `getUserMedia`, so a demo walks through the hub's Permissions
 * Policy and Chrome's own prompt, and holds a screen wake lock while anything captures.
 */
export function DeviceAccessControls({
  addLog,
  sdk,
  onResume,
  onMicrophoneLiveChange,
  onCameraLiveChange,
}: {
  addLog: (message: string, type?: LogType) => void;
  /** Null until the handshake completes; the resume waits for it. */
  sdk: DeviceGrantSource | null;
  /** Called when a capture resumes after the Hub's reload, to bring these controls into view. */
  onResume?: () => void;
  /** Called each time the microphone starts or stops capturing, whichever button started it. */
  onMicrophoneLiveChange?: (live: boolean) => void;
  /** Called each time the camera starts or stops capturing, whichever button started it. */
  onCameraLiveChange?: (live: boolean) => void;
}) {
  const [devices, setDevices] = useState<Record<Device, DeviceState>>({
    microphone: { status: 'idle' },
    camera: { status: 'idle' },
  });
  const [wakeLock, setWakeLock] = useState<string | null>(null);
  const wakeLockRef = useRef<WakeLockSentinelLike | null>(null);
  const wakeLockPendingRef = useRef(false);
  const streamsRef = useRef<Partial<Record<Device, MediaStream>>>({});
  const mountedRef = useRef(true);

  const setDevice = (device: Device, state: DeviceState) => setDevices((prev) => ({ ...prev, [device]: state }));

  const anyLive = devices.microphone.status === 'live' || devices.camera.status === 'live';

  const liveRef = useRef(false);
  liveRef.current = anyLive;
  const logRef = useRef(addLog);
  logRef.current = addLog;

  /** Holds a screen wake lock exactly while something captures and the panel is visible. */
  const syncWakeLock = useRef(() => {
    const held = wakeLockRef.current;
    if (!liveRef.current || !mountedRef.current) {
      if (held) {
        wakeLockRef.current = null;
        void held.release();
        logRef.current('Screen wake lock released', 'info');
      }
      if (mountedRef.current) setWakeLock(null);
      return;
    }
    if (held || wakeLockPendingRef.current || document.visibilityState !== 'visible') return;
    if (!policyAllows('screen-wake-lock')) {
      setWakeLock('Screen wake lock is not delegated to this app');
      return;
    }
    const api = (navigator as unknown as { wakeLock?: { request: (type: 'screen') => Promise<WakeLockSentinelLike> } }).wakeLock;
    if (!api) return;
    wakeLockPendingRef.current = true;
    api.request('screen').then(
      (sentinel) => {
        wakeLockPendingRef.current = false;
        if (!liveRef.current || !mountedRef.current) return void sentinel.release();
        wakeLockRef.current = sentinel;
        // Chrome releases the lock itself when the panel is hidden.
        sentinel.addEventListener?.('release', () => {
          if (wakeLockRef.current !== sentinel) return;
          wakeLockRef.current = null;
          if (mountedRef.current) setWakeLock(null);
        });
        setWakeLock('Screen kept awake while capturing');
        logRef.current('Screen wake lock acquired', 'success');
      },
      (error: unknown) => {
        wakeLockPendingRef.current = false;
        if (mountedRef.current) setWakeLock(`Wake lock refused: ${error instanceof Error ? error.message : String(error)}`);
      },
    );
  }).current;

  useEffect(() => {
    syncWakeLock();
  }, [anyLive, syncWakeLock]);

  useReportLive(devices.microphone.status === 'live', onMicrophoneLiveChange);
  useReportLive(devices.camera.status === 'live', onCameraLiveChange);

  useEffect(() => {
    mountedRef.current = true;
    document.addEventListener('visibilitychange', syncWakeLock);
    return () => {
      mountedRef.current = false;
      document.removeEventListener('visibilitychange', syncWakeLock);
      Object.values(streamsRef.current).forEach((s) => s?.getTracks().forEach((t) => t.stop()));
      streamsRef.current = {};
      syncWakeLock();
    };
  }, [syncWakeLock]);

  const adopt = (device: Device, stream: MediaStream) => {
    streamsRef.current[device] = stream;
    stream.getTracks().forEach((track) =>
      track.addEventListener('ended', () => {
        if (streamsRef.current[device] !== stream) return;
        delete streamsRef.current[device];
        setDevice(device, { status: 'idle' });
        addLog(`${DEVICE_LABEL[device]}: ended by the browser`, 'info');
      }),
    );
    setDevice(device, { status: 'live', stream });
    addLog(`${DEVICE_LABEL[device]}: started`, 'success');
  };

  /** One `getUserMedia` call; asking for both devices at once makes the Hub show a single prompt for both. */
  const capture = async (wanted: Device[], constraints: MediaStreamConstraints, label: string) => {
    // No Permissions Policy pre-check. The iframe is delegated a device only after the
    // provider consents, so an undelegated policy is the normal state before the first
    // ask — and the ask only happens when getUserMedia is called.
    if (!navigator.mediaDevices?.getUserMedia) {
      addLog(`${label}: this browser context has no media devices API`, 'error');
      return;
    }
    wanted.forEach((device) => setDevice(device, { status: 'requesting' }));
    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      // Granted after these controls unmounted: nothing could stop it later.
      if (!mountedRef.current) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }
      if (wanted.length === 1) {
        adopt(wanted[0], stream);
      } else {
        adopt('microphone', new MediaStream(stream.getAudioTracks()));
        adopt('camera', new MediaStream(stream.getVideoTracks()));
      }
    } catch (error) {
      if (!mountedRef.current) return;
      wanted.forEach((device) => setDevice(device, { status: 'idle' }));
      addLog(`${label}: ${captureErrorMessage(wanted.length === 1 ? wanted[0] : 'microphone or camera', error)}`, 'error');
    }
  };

  const start = (device: Device) =>
    capture([device], device === 'microphone' ? { audio: true } : { video: true }, DEVICE_LABEL[device]);

  const startVisit = () => capture(['microphone', 'camera'], { audio: true, video: true }, 'Video visit');

  /**
   * Resume what the provider allowed just before the Hub reloaded the app: the
   * getUserMedia call that asked never settles, so without this their Allow does nothing.
   *
   * `consumeGrantedDevices` answers once per launch, so this runs once — and only after
   * the handshake, since the SDK is null until then. Resume only what they started; a
   * capture that begins on its own surprises them.
   */
  const resumed = useRef(false);
  useEffect(() => {
    if (resumed.current || !sdk) return;
    resumed.current = true;
    const granted = sdk.hub.consumeGrantedDevices?.() ?? [];
    for (const device of granted) {
      logRef.current(`${DEVICE_LABEL[device]}: allowed before the reload — resuming`, 'info');
      void start(device);
    }
    // The reload puts the provider back at the top of the app, pages away from the control they
    // just answered a prompt about. Only on a resume: any other launch is theirs to scroll.
    if (granted.length > 0) onResume?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sdk]);

  const stop = (device: Device) => {
    streamsRef.current[device]?.getTracks().forEach((t) => t.stop());
    delete streamsRef.current[device];
    setDevice(device, { status: 'idle' });
    addLog(`${DEVICE_LABEL[device]}: stopped`, 'info');
  };

  const control = (device: Device) => {
    const state = devices[device];
    const live = state.status === 'live';
    return (
      <div className="device-control" key={device}>
        <button
          type="button"
          className={`btn btn-sm ${live ? 'btn-danger' : 'btn-secondary'} device-control-btn`}
          disabled={state.status === 'requesting'}
          onClick={() => (live ? stop(device) : void start(device))}
        >
          {state.status === 'requesting'
            ? 'Waiting for Chrome…'
            : live
              ? `Stop ${DEVICE_LABEL[device].toLowerCase()}`
              : `Start ${DEVICE_LABEL[device].toLowerCase()}`}
        </button>
        {state.status === 'live' && (device === 'microphone' ? <MicLevel stream={state.stream} /> : <VideoPreview stream={state.stream} />)}
      </div>
    );
  };

  const anyRequesting = devices.microphone.status === 'requesting' || devices.camera.status === 'requesting';

  return (
    <>
      <div className="device-controls">{(['microphone', 'camera'] as const).map(control)}</div>
      <button
        type="button"
        className={`btn btn-sm ${anyLive ? 'btn-danger' : 'btn-primary'} device-control-btn device-visit-btn`}
        disabled={anyRequesting}
        onClick={() => {
          if (!anyLive) return void startVisit();
          (['microphone', 'camera'] as const).forEach((device) => {
            if (devices[device].status === 'live') stop(device);
          });
        }}
      >
        {anyLive ? 'Stop video visit' : 'Start video visit (mic + camera)'}
      </button>
      {wakeLock && <div className="updater-meta device-wake-lock">{wakeLock}</div>}
    </>
  );
}
