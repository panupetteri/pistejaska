import React, { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import EditGameExpansion, { KeyedExpansion } from "./EditGameExpansion";

const StatefulWrapper = ({ 
  initialExpansion, 
  onExpansionChange 
}: { 
  initialExpansion: KeyedExpansion, 
  onExpansionChange?: (expansion: KeyedExpansion) => void 
}) => {
  const [expansion, setExpansion] = useState(initialExpansion);
  const handleChange = (updatedExpansion: KeyedExpansion) => {
    setExpansion(updatedExpansion);
    onExpansionChange?.(updatedExpansion);
  };
  return (
    <EditGameExpansion
      expansion={expansion}
      onExpansionChange={handleChange}
      onExpansionRemove={vi.fn()}
    />
  );
};

describe("EditGameExpansion", () => {
  const mockExpansion: KeyedExpansion = {
    id: "exp-1",
    name: "Expansion 1",
    scoreFields: {
      "score-1": { id: "points", name: "Points", type: "number" },
    },
    miscFields: {
      "misc-1": { id: "round", name: "Round", type: "number" },
    },
  };

  it("renders correctly with given expansion data", () => {
    render(
      <EditGameExpansion
        expansion={mockExpansion}
        onExpansionChange={vi.fn()}
        onExpansionRemove={vi.fn()}
      />
    );

    expect(screen.getByLabelText("Extension Name")).toHaveValue("Expansion 1");
    // Nested score field name
    expect(screen.getAllByLabelText("Name")[0]).toHaveValue("Points");
    // Nested misc field name
    expect(screen.getAllByLabelText("Name")[1]).toHaveValue("Round");
  });

  it("calls onExpansionChange when name is changed", async () => {
    const user = userEvent.setup();
    const onExpansionChange = vi.fn();
    render(
      <StatefulWrapper
        initialExpansion={mockExpansion}
        onExpansionChange={onExpansionChange}
      />
    );

    await user.clear(screen.getByLabelText("Extension Name"));
    await user.type(screen.getByLabelText("Extension Name"), "New Expansion Name");

    expect(onExpansionChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ name: "New Expansion Name" })
    );
  });

  it("adds a score field to the expansion", async () => {
    const user = userEvent.setup();
    const onExpansionChange = vi.fn();
    render(
      <StatefulWrapper
        initialExpansion={mockExpansion}
        onExpansionChange={onExpansionChange}
      />
    );

    await user.click(screen.getByText("Add score field"));

    const lastCall = onExpansionChange.mock.calls[onExpansionChange.mock.calls.length - 1][0];
    expect(Object.values(lastCall.scoreFields)).toContainEqual(
      expect.objectContaining({ name: "", type: "number" })
    );
  });

  it("adds a miscellaneous field to the expansion", async () => {
    const user = userEvent.setup();
    const onExpansionChange = vi.fn();
    render(
      <StatefulWrapper
        initialExpansion={mockExpansion}
        onExpansionChange={onExpansionChange}
      />
    );

    await user.click(screen.getByText("Add miscellaneous field"));

    const lastCall = onExpansionChange.mock.calls[onExpansionChange.mock.calls.length - 1][0];
    expect(Object.values(lastCall.miscFields)).toContainEqual(
      expect.objectContaining({ name: "", type: "text" })
    );
  });

  it("removes a score field from the expansion", async () => {
    const user = userEvent.setup();
    const onExpansionChange = vi.fn();
    render(
      <StatefulWrapper
        initialExpansion={mockExpansion}
        onExpansionChange={onExpansionChange}
      />
    );

    await user.click(screen.getByText("Remove score field"));

    const lastCall = onExpansionChange.mock.calls[onExpansionChange.mock.calls.length - 1][0];
    expect(lastCall.scoreFields).toEqual({});
  });

  it("removes a miscellaneous field from the expansion", async () => {
    const user = userEvent.setup();
    const onExpansionChange = vi.fn();
    render(
      <StatefulWrapper
        initialExpansion={mockExpansion}
        onExpansionChange={onExpansionChange}
      />
    );

    await user.click(screen.getByText("Remove miscellaneous field"));

    const lastCall = onExpansionChange.mock.calls[onExpansionChange.mock.calls.length - 1][0];
    expect(lastCall.miscFields).toEqual({});
  });

  it("calls onExpansionRemove when remove button is clicked", async () => {
    const user = userEvent.setup();
    const onExpansionRemove = vi.fn();
    render(
      <EditGameExpansion
        expansion={mockExpansion}
        onExpansionChange={vi.fn()}
        onExpansionRemove={onExpansionRemove}
      />
    );

    await user.click(screen.getByText("Remove extension"));
    expect(onExpansionRemove).toHaveBeenCalled();
  });
});
