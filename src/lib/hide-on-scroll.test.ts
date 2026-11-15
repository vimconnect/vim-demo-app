import { describe, expect, it } from "vitest";
import { advanceScroll, nextBarVisibility, type ScrollTracker } from "./hide-on-scroll";

describe("nextBarVisibility", () => {
  it("shows the bar at the top of the page", () => {
    expect(nextBarVisibility(300, 0, false)).toBe(true);
  });

  it("hides the bar when scrolling down past the threshold", () => {
    expect(nextBarVisibility(100, 140, true)).toBe(false);
  });

  it("keeps the bar while still near the top", () => {
    expect(nextBarVisibility(20, 50, true)).toBe(true);
  });

  it("shows the bar on any upward scroll", () => {
    expect(nextBarVisibility(400, 380, false)).toBe(true);
  });

  it("ignores movement smaller than a step", () => {
    expect(nextBarVisibility(400, 403, false)).toBe(false);
    expect(nextBarVisibility(400, 397, true)).toBe(true);
  });
});

describe("advanceScroll", () => {
  const run = (start: ScrollTracker, ys: number[]) => ys.reduce(advanceScroll, start);

  it("shows the hidden bar on a slow scroll up made of small steps", () => {
    const end = run({ anchorY: 400, visible: false }, [397, 394, 391, 388]);
    expect(end.visible).toBe(true);
  });

  it("hides the bar on a slow scroll down made of small steps", () => {
    const end = run({ anchorY: 100, visible: true }, [103, 106, 109, 112]);
    expect(end.visible).toBe(false);
  });

  it("keeps the state while the page barely moves", () => {
    expect(run({ anchorY: 400, visible: false }, [402, 401, 403])).toEqual({ anchorY: 400, visible: false });
  });
});
