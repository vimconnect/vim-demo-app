import type { Metadata } from 'next';
import './shared-design-tokens.css';
import './globals.css';
import { buildClientConfig } from '@/lib/client-config';

// force-dynamic ensures buildClientConfig() reads process.env at request time,
// not at build time. This is what makes runtime env vars (from helm values) work
// for client components instead of the values baked into the Docker image.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Vim Connect Demo App',
  description: 'OAuth-enabled demo app for Vim Connect App SDK',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const config = buildClientConfig();

  return (
    <html lang="en">
      <head>
        {/* Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=Poppins:wght@500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="light-mode">
        {/* Inject runtime config for client components. Values come from process.env (no user input). */}
        <script
          dangerouslySetInnerHTML={{
            __html: `window.__CONFIG__ = ${JSON.stringify(config)}`,
          }}
        />
        {children}
      </body>
    </html>
  );
}
