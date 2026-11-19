import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import { Accordion } from "@vim-connect/ui";

import { CollapsibleCard } from "../CollapsibleCard";

function Harness({ onSample }: { onSample: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <Accordion>
      <CollapsibleCard
        id="patient"
        title="Patient (3/5)"
        info="Fields this app can write"
        actions={
          <button type="button" onClick={onSample}>
            Sample
          </button>
        }
        expanded={open}
        onToggle={() => setOpen(!open)}
      >
        <p>Patient fields</p>
      </CollapsibleCard>
    </Accordion>
  );
}

describe("CollapsibleCard", () => {
  it("shows a trailing (3/5) as a count badge beside the name", () => {
    render(<Harness onSample={() => {}} />);
    const header = screen.getByRole("button", { name: /^Patient/ });
    expect(header.textContent).toContain("3/5");
    expect(header.textContent).not.toContain("(3/5)");
  });

  it("opens and closes through onToggle, mounting the body only while open", () => {
    render(<Harness onSample={() => {}} />);
    const header = screen.getByRole("button", { name: /^Patient/ });
    expect(screen.queryByText("Patient fields")).toBeNull();
    fireEvent.click(header);
    expect(header.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByText("Patient fields")).toBeTruthy();
    fireEvent.click(header);
    expect(screen.queryByText("Patient fields")).toBeNull();
  });

  it("keeps the info tip and actions outside the header, so using them doesn't toggle", () => {
    let sampled = 0;
    render(<Harness onSample={() => sampled++} />);
    const header = screen.getByRole("button", { name: /^Patient/ });
    const sample = screen.getByRole("button", { name: "Sample" });
    expect(header.contains(sample)).toBe(false);
    expect(header.contains(screen.getByRole("button", { name: "About Patient" }))).toBe(false);
    fireEvent.click(sample);
    expect(sampled).toBe(1);
    expect(header.getAttribute("aria-expanded")).toBe("false");
  });
});
