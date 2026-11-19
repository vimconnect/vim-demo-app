/**
 * Exactly `process.env.NODE_ENV`, the expression bundlers (Vite, webpack, Next) replace at
 * build time; with no bundler and no `process`, the ReferenceError is caught.
 */
function readNodeEnv() {
    try {
        return process.env.NODE_ENV;
    }
    catch {
        return undefined;
    }
}
/**
 * True in a development build, for dev-only warnings. Reads Vite's
 * `import.meta.env.DEV` where the bundler sets it, else `process.env.NODE_ENV`;
 * anything it can't read counts as production, so a warning stays silent rather
 * than throwing in a product without either.
 */
export function isDevBuild(viteEnv = import.meta.env, nodeEnv = readNodeEnv()) {
    if (typeof viteEnv?.DEV === 'boolean')
        return viteEnv.DEV;
    return typeof nodeEnv === 'string' && nodeEnv !== 'production';
}
