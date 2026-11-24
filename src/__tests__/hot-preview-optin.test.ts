// The demo app's hot-preview opt-in spans platform.yaml, the Dockerfile, the preview chart values
// and two workflow mappings. A mismatch between them disables hot-deploy without an error, so
// this pins the values that have to agree.

// @vitest-environment node

import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import yaml from 'js-yaml';
import { describe, expect, it } from 'vitest';

const here = dirname(fileURLToPath(import.meta.url));
const appDir = resolve(here, '..', '..');
const repoRoot = resolve(appDir, '..');
const SERVICE_DIR = 'demo-app';
const SLUG = 'demo-app';

type Doc = Record<string, unknown>;

const read = (path: string): string => readFileSync(path, 'utf8');
const readYaml = (path: string): Doc => yaml.load(read(path)) as Doc;
const platform = (): Doc => readYaml(join(appDir, 'platform.yaml'));
const hotDeploy = (): Doc => platform()['hotDeploy'] as Doc;
const runtime = (): Doc => hotDeploy()['runtime'] as Doc;
const dockerfile = (): string =>
  read(join(appDir, 'Dockerfile')).replace(/\\\n\s*/g, ' ').replace(/[ \t]+/g, ' ');

function stage(df: string, name: string): string {
  const starts = [...df.matchAll(/^FROM\s+\S+\s+AS\s+(\S+)\s*$/gm)];
  const i = starts.findIndex((m) => m[1] === name);
  if (i === -1) throw new Error(`Dockerfile has no stage ${name}`);
  const from = starts[i]!.index!;
  const to = starts[i + 1]?.index ?? df.length;
  return df.slice(from, to);
}

describe('platform.yaml hotDeploy', () => {
  it('is enabled and bundles only the standalone server and its static assets', () => {
    expect(hotDeploy()['enabled']).toBe(true);
    const bundle = hotDeploy()['bundle'] as Doc;
    expect(bundle['include']).toEqual([
      `${SERVICE_DIR}/.next/standalone/**`,
      `${SERVICE_DIR}/.next/static/**`,
    ]);
  });

  it('refuses hot-deploys of what the bundle cannot carry', () => {
    const bundle = hotDeploy()['bundle'] as Doc;
    expect(bundle['incompatiblePaths']).toEqual([
      `${SERVICE_DIR}/Dockerfile`,
      `${SERVICE_DIR}/platform.yaml`,
      `${SERVICE_DIR}/chart-values/**`,
    ]);
  });

  it('builds the workspace packages except app-sdk, then the app', () => {
    const commands = (hotDeploy()['build'] as Doc)['commands'] as string[];
    expect(commands.slice(0, 2)).toEqual([
      "pnpm turbo run build --filter='vim-sdk-demo-app^...' --filter='!@vimconnect/app-sdk'",
      'pnpm --filter vim-sdk-demo-app run build',
    ]);
  });

  it('ends the build by removing every .env* file from the directory that holds server.js', () => {
    const commands = (hotDeploy()['build'] as Doc)['commands'] as string[];
    const serverDir = `${runtime()['workDir'] as string}/${SERVICE_DIR}`;
    expect(commands[commands.length - 1]).toBe(`rm -f ${serverDir}/.env ${serverDir}/.env.*`);
    expect((runtime()['args'] as string[])[1]).toContain(`node ${SERVICE_DIR}/server.js`);
  });

  it('watches the source of every workspace package the hot build rebuilds', () => {
    const appSdkOnly = ['app-sdk', 'core-sdk', 'sdk-transport', 'sdk-type-gen'];
    const copied = [...stage(dockerfile(), 'builder').matchAll(/^COPY packages\/([\w-]+)\/ /gm)]
      .map((m) => m[1]!)
      .filter((name) => !appSdkOnly.includes(name))
      .sort();
    const watched = ((hotDeploy()['watch'] as Doc)['include'] as string[])
      .map((glob) => /^packages\/([\w-]+)\/src\/\*\*$/.exec(glob)?.[1])
      .filter((name): name is string => name !== undefined)
      .sort();
    expect(copied.length).toBeGreaterThan(0);
    expect(watched).toEqual(copied);
  });

  it('runs the same server the production image runs, on a port the agent does not hold', () => {
    const cmd = /^CMD\s+(\[.*\])\s*$/m.exec(stage(dockerfile(), 'runner'));
    expect(cmd).not.toBeNull();
    const [command, ...args] = JSON.parse(cmd![1]!) as string[];
    expect(runtime()['command']).toBe(command);
    expect(runtime()['args']).toEqual(args);
    const agentPort = Number(/PORT=(\d+)/.exec(stage(dockerfile(), 'runner'))![1]);
    expect(runtime()['port']).not.toBe(agentPort);
  });

  it('serves the health path the deploy checks', () => {
    expect(runtime()['healthPath']).toBe((platform()['deploy'] as Doc)['health-check']);
  });

  it('keeps the baseline and the release worktree on one layout: the include holds the server entry', () => {
    const workDir = runtime()['workDir'] as string;
    expect(workDir).toBe(`${SERVICE_DIR}/.next/standalone`);
    expect((runtime()['args'] as string[])[1]).toContain(`node ${SERVICE_DIR}/server.js`);
    const bundle = hotDeploy()['bundle'] as Doc;
    expect(bundle['include']).toContain(`${workDir}/**`);
    expect(runtime()['staticDir']).toBe(`${SERVICE_DIR}/.next/static`);
    expect(bundle['include']).toContain(`${runtime()['staticDir'] as string}/**`);
  });
});

describe('Dockerfile', () => {
  it('leaves the production runner stage free of the preview-agent', () => {
    const runner = stage(dockerfile(), 'runner');
    expect(runner).not.toMatch(/preview-agent|PREVIEW_/);
    expect(runner).not.toMatch(/^ENTRYPOINT\b/m);
  });

  it('ends on a production alias so an untargeted build yields the production image', () => {
    const froms = [...dockerfile().matchAll(/^FROM\s+(\S+)(?:\s+AS\s+(\S+))?\s*$/gm)];
    expect(froms[froms.length - 1]!.slice(1, 3)).toEqual(['runner', 'default-production-image']);
  });

  it('derives runner-preview from runner and runs the agent as the non-root user', () => {
    const df = dockerfile();
    expect(df).toMatch(/^FROM runner AS runner-preview$/m);
    const s = stage(df, 'runner-preview');
    expect(s).toMatch(/^RUN apk add --no-cache git dumb-init bash$/m);
    expect(s).toMatch(
      /^ENTRYPOINT \["dumb-init", "--", "node", "--enable-source-maps", "\/usr\/local\/bin\/preview-agent\.mjs"\]$/m,
    );
    expect(s).toMatch(/^CMD \[\]$/m);
    expect(s).toMatch(/^HEALTHCHECK[^\n]+localhost:8080\/_vim\/preview-agent\/v1\/health\/agent/m);
    const users = [...s.matchAll(/^USER\s+(\S+)$/gm)].map((m) => m[1]);
    expect(users[users.length - 1]).toBe('nextjs');
  });

  it('places the baseline build where hotDeploy.runtime runs it', () => {
    const s = stage(dockerfile(), 'runner-preview');
    expect(s).toContain(
      `COPY --from=builder --chown=nextjs:nodejs /app/${SERVICE_DIR}/.next/standalone /app/${runtime()['workDir'] as string}/`,
    );
    expect(s).toContain(
      `COPY --from=builder --chown=nextjs:nodejs /app/${SERVICE_DIR}/.next/static /app/${runtime()['workDir'] as string}/${SERVICE_DIR}/.next/static/`,
    );
  });

  it('renders base-start.json and incompatible-paths.txt from this platform.yaml', () => {
    const df = dockerfile();
    expect(df).toContain(
      `RUN node tools/preview-agent/scripts/render-base-start.mjs ${SERVICE_DIR}/platform.yaml ${SERVICE_DIR}/.base-start.json`,
    );
    expect(df).toContain(
      `RUN node tools/preview-agent/scripts/render-incompatible-paths.mjs ${SERVICE_DIR}/platform.yaml ${SERVICE_DIR}/.incompatible-paths.txt`,
    );
    const s = stage(df, 'runner-preview');
    expect(s).toContain(
      `/app/${SERVICE_DIR}/.base-start.json /usr/local/etc/preview-agent/base-start.json`,
    );
    expect(s).toContain(
      `/app/${SERVICE_DIR}/.incompatible-paths.txt /usr/local/libexec/preview-agent/incompatible-paths.txt`,
    );
  });

  it('bakes the agent public key and the base revision labels the preview action reads', () => {
    const s = stage(dockerfile(), 'runner-preview');
    expect(s).toMatch(/^ARG PREVIEW_AGENT_PUBLIC_KEY_B64=""$/m);
    expect(s).toMatch(/^ARG PREVIEW_AGENT_PUBLIC_KEY_KID=""$/m);
    expect(s).toMatch(/^ENV PREVIEW_AGENT_PUBLIC_KEY_B64=\$PREVIEW_AGENT_PUBLIC_KEY_B64$/m);
    expect(s).toMatch(/^LABEL preview\.base_revision=\$PREVIEW_BASE_REVISION$/m);
    expect(s).toMatch(/^LABEL preview\.baseline_commit=\$PREVIEW_BASELINE_COMMIT$/m);
    expect(s).toMatch(/^COPY --from=preview-git-seed \/ \/opt\/preview-git-seed$/m);
  });
});

describe('chart-values/values-preview.yaml', () => {
  const values = (): Doc => readYaml(join(appDir, 'chart-values', 'values-preview.yaml'));

  it('carries the dormant hotDeploy block bound to Control Tower staging, with the Next static overlay on', () => {
    expect(values()['hotDeploy']).toEqual({
      enabled: false,
      controlTowerBaseUrl: 'https://control-tower.stage.getvim.ai',
      controlTowerNamespace: 'control-tower',
      nextStaticOverlay: true,
    });
  });

  it('serves the pod on the port the agent listens on', () => {
    const agentPort = Number(/PORT=(\d+)/.exec(stage(dockerfile(), 'runner'))![1]);
    expect(values()['port']).toBe(agentPort);
  });

  it('runs one replica (the chart refuses hot-deploy otherwise)', () => {
    expect(values()['replicas']).toBe(1);
  });
});

describe('workflow registration', () => {
  const workflows = join(repoRoot, '.github', 'workflows');

  it('names this service in both preview workflows, pointing at this directory', () => {
    expect(platform()['slug']).toBe(SLUG);
    expect(read(join(workflows, 'feature-preview.yml'))).toContain(
      `${SLUG}) SERVICE_DIR=${SERVICE_DIR} ;;`,
    );
    expect(read(join(workflows, 'feature-preview-deploy.yml'))).toContain(
      `${SLUG}) echo "service-dir=${SERVICE_DIR}" >> "$GITHUB_OUTPUT" ;;`,
    );
  });

  it('lets the reserved-path guard accept the Dockerfile and this test', () => {
    const guard = read(join(workflows, 'reserved-path-guard.yml'));
    expect(guard).toContain("'^demo-app/Dockerfile$'");
    expect(guard).toContain("'^demo-app/src/__tests__/hot-preview-optin\\.test\\.ts$'");
  });
});
