/** Shared contract between the Worker's welcome push and the UI App's redirect dialog. */

export const DEMO_APP_REPO_URL = 'https://github.com/vimconnect/vim-demo-app';

export const DEMO_APP_FORK_COMMAND =
  'gh repo create my-vim-app --template vimconnect/vim-demo-app --private --clone';

/** workerState key the Worker writes when "View code" is clicked. */
export const REDIRECT_REQUEST_STATE_KEY = 'redirectRequest';

/** appEvents name the UI App sends once it has shown the dialog; the Worker then clears the request. */
export const REDIRECT_HANDLED_EVENT = 'redirect-request-handled';

/** A request older than this is never shown. */
export const REDIRECT_REQUEST_TTL_MS = 60_000;

export interface RedirectRequest {
  url: string;
  requestedAt: number;
}

export interface WelcomePushCopy {
  title: string;
  text: string;
}

/** One is picked at random per session. `text` supports <b>. */
export const WELCOME_PUSH_VARIANTS: readonly WelcomePushCopy[] = [
  {
    title: 'Vim Demo App',
    text: 'Explore the <b>Vim Demo App</b> to see SDK capabilities live in this EHR — context, writeback and Hub UX — and grab the code to start your own app.',
  },
  {
    title: 'Build your Vim app with an AI agent',
    text: 'Start from the <b>Vim Demo App</b> code and give your coding agent the Vim SDK docs skill, so it writes SDK code that compiles.',
  },
];

export function isFreshRedirectRequest(
  request: RedirectRequest | null | undefined,
  lastHandledAt: number,
  now: number = Date.now(),
): request is RedirectRequest {
  return (
    request != null &&
    request.requestedAt > lastHandledAt &&
    now - request.requestedAt <= REDIRECT_REQUEST_TTL_MS
  );
}

export function pickWelcomePush(random: () => number = Math.random): WelcomePushCopy {
  return WELCOME_PUSH_VARIANTS[Math.floor(random() * WELCOME_PUSH_VARIANTS.length)];
}
