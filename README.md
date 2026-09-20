# Vim Connect Demo App

[![npm version](https://img.shields.io/npm/v/@vimconnect/app-sdk.svg)](https://www.npmjs.com/package/@vimconnect/app-sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

A reference implementation showing how to build applications with the [Vim Connect App SDK](https://developer-docs.getvim.ai/docs). Built with Next.js, this demo covers OAuth authentication, real-time EHR context events, and the full SDK API surface.

Use this as a starting point for building your own Vim Connect application.

## Quick Start

```bash
# 1. Clone
git clone https://github.com/vimconnect/vim-demo-app.git
cd vim-demo-app

# 2. Install
npm install

# 3. Configure
cp .env.local.example .env.local
# Edit .env.local with your OAuth credentials

# 4. Run
npm run dev
```

App runs at [http://localhost:8080](http://localhost:8080)

## Prerequisites

- **Node.js** 18+
- **Vim Connect Chrome extension** installed ([setup guide](https://developer-docs.getvim.ai/docs/getting-started#prerequisites))
- **Vim Connect account** with an OAuth application registered
- **OAuth credentials** (client ID + client secret) from the [Vim Console](https://developer-docs.getvim.ai/docs/developer-account#getting-your-client-id-and-secret)

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `CLIENT_ID` | Yes | Your OAuth client ID |
| `CLIENT_SECRET` | Yes | Your OAuth client secret (server-side only) |

See [`.env.local.example`](.env.local.example) for details.

## What This Demo Shows

- **OAuth 2.0 flow** — Secure token exchange with CSRF protection
- **SDK initialization** — Loading and connecting `@vimconnect/app-sdk`
- **EHR context events** — Subscribing to patient, encounter, and provider context
- **Real-time updates** — Live event log showing SDK activity
- **API calls** — Querying EHR data through the SDK

## Project Structure

```
src/
├── app/
│   ├── launch/page.tsx        # OAuth launcher (generates CSRF state, redirects)
│   ├── app/page.tsx           # Main app (OAuth callback + SDK demo)
│   ├── token/route.ts  # Server-side token exchange
│   └── layout.tsx             # SDK script loading
└── lib/
    ├── config.ts              # Environment configuration
    └── sdk-config.ts          # SDK URL resolution
```

## Documentation

- [Vim Connect App SDK Documentation](https://developer-docs.getvim.ai/docs)
- [`@vimconnect/app-sdk` on npm](https://www.npmjs.com/package/@vimconnect/app-sdk)
- [OAuth Integration Guide](https://developer-docs.getvim.ai/docs/authentication)

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (port 8080) |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run type-check` | Run TypeScript type checking |

## License

[MIT](LICENSE)
