import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { BlueprintLoader, LOADING_CAPTION } from "../BlueprintLoader";

const REPO_ROOT = path.resolve(__dirname, "../../../..");
/** The public vim-demo-app mirror has no shared styles; in the monorepo a missing source must fail, not skip. */
const IN_MONOREPO = existsSync(path.join(REPO_ROOT, "pnpm-workspace.yaml"));
/** auth-loading.css today; blueprint-loader.css when an open PR (#15516) moves the rules there, so that merge can't break this test. */
function sharedLoaderCss(): string {
  const own = path.join(REPO_ROOT, "shared/styles/blueprint-loader.css");
  return readFileSync(existsSync(own) ? own : path.join(REPO_ROOT, "shared/styles/auth-loading.css"), "utf8");
}

/** The `.vim-blueprint*` rules: from the top-level `.vim-blueprint {` to the panel's narrow-width media query or the next comment. */
function blueprintRules(css: string): string {
  const start = css.indexOf("\n.vim-blueprint {");
  if (start === -1) throw new Error(".vim-blueprint rules not found");
  const rest = css.slice(start);
  const ends = [rest.indexOf("@media (max-width: 420px)"), rest.indexOf("\n/*")].filter((i) => i !== -1);
  return (ends.length ? rest.slice(0, Math.min(...ends)) : rest).trim();
}

describe("BlueprintLoader", () => {
  it("renders the blueprint, the Hub's tags and its caption", () => {
    const { container } = render(<BlueprintLoader />);
    expect(container.querySelector(".vim-blueprint")).toBeTruthy();
    expect(container.querySelectorAll(".vim-blueprint-node")).toHaveLength(4);
    expect(screen.getByRole("status")).toBeTruthy();
    expect(screen.getByText(LOADING_CAPTION)).toBeTruthy();
    expect(screen.getByText("Launch")).toBeTruthy();
    expect(screen.getByText("Handshake")).toBeTruthy();
  });

  it.skipIf(!IN_MONOREPO)("uses the same blueprint CSS as the shared loader styles", () => {
    const demo = readFileSync(path.resolve(__dirname, "../../app/globals.css"), "utf8");
    // The one deliberate change: the tags use --text-xs, the smallest DS type step.
    const shared = sharedLoaderCss().replace(/font-size: (var\(--text-2xs\)|9\.5px);/, "font-size: var(--text-xs);");
    expect(blueprintRules(demo)).toBe(blueprintRules(shared));
  });
});
