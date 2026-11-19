type ViteEnv = {
    DEV?: unknown;
} | null | undefined;
/**
 * True in a development build, for dev-only warnings. Reads Vite's
 * `import.meta.env.DEV` where the bundler sets it, else `process.env.NODE_ENV`;
 * anything it can't read counts as production, so a warning stays silent rather
 * than throwing in a product without either.
 */
export declare function isDevBuild(viteEnv?: ViteEnv, nodeEnv?: string | null | undefined): boolean;
export {};
