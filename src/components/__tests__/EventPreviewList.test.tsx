import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { EventPreviewList, type PreviewEntry } from "../EventPreviewList";

const entry = (key: number, body: string | null = `payload ${key}`): PreviewEntry => ({
  key,
  title: `event ${key}`,
  meta: "",
  body: body === null ? null : <pre>{body}</pre>,
});

const list = (entries: PreviewEntry[]) => (
  <EventPreviewList label="Context changes" entries={entries} emptyText="" onClear={() => {}} />
);

describe("EventPreviewList", () => {
  it("opens the newest event, so its payload shows", () => {
    render(list([entry(2), entry(1)]));
    expect(screen.getByText("payload 2")).toBeTruthy();
    expect(screen.queryByText("payload 1")).toBeNull();
  });

  it("opens the newest event that has a payload when the newest is a close", () => {
    render(list([entry(3, null), entry(2), entry(1)]));
    expect(screen.getByText("payload 2")).toBeTruthy();
  });

  it("keeps the reader's pick until a newer event lands", () => {
    const { rerender } = render(list([entry(2), entry(1)]));
    fireEvent.click(screen.getByText("event 2"));
    expect(screen.queryByText("payload 2")).toBeNull();

    rerender(list([entry(3), entry(2), entry(1)]));
    expect(screen.getByText("payload 3")).toBeTruthy();
  });
});
