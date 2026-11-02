import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { BrandLoader, LOADING_CAPTION } from "../BrandLoader";

const HUB_CSS = path.resolve(__dirname, "../../../../extension/src/sidepanel/App.css");
/** Present only in the monorepo; the public vim-demo-app mirror has no extension sources. */
const IN_MONOREPO = existsSync(path.resolve(__dirname, "../../../../pnpm-workspace.yaml"));

/** Every rule from `.vim-dots {` up to the first blank-line-separated comment that ends the block. */
function vimDotsRules(css: string): string {
  const start = css.indexOf(".vim-dots {");
  if (start === -1) throw new Error(".vim-dots rules not found");
  const rest = css.slice(start);
  const end = rest.indexOf("/*");
  return (end === -1 ? rest : rest.slice(0, end)).trim();
}

describe("BrandLoader", () => {
  it("renders the four brand dots and the Hub's caption", () => {
    const { container } = render(<BrandLoader />);
    expect(container.querySelectorAll(".vim-dots__dot")).toHaveLength(4);
    expect(screen.getByRole("status", { name: LOADING_CAPTION })).toBeTruthy();
    expect(screen.getByText(LOADING_CAPTION)).toBeTruthy();
  });

  it.skipIf(!IN_MONOREPO)("uses the same dot CSS as the Vim Hub side panel", () => {
    const demo = readFileSync(path.resolve(__dirname, "../../app/globals.css"), "utf8");
    const hub = readFileSync(HUB_CSS, "utf8");
    expect(vimDotsRules(demo)).toBe(vimDotsRules(hub));
  });
});
