import React, { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import EditGameScoreField from "./EditGameScoreField";
import { GameScoreFieldDefinition } from "../domain/game";

const StatefulWrapper = ({ 
  initialField, 
  onFieldChange 
}: { 
  initialField: GameScoreFieldDefinition, 
  onFieldChange?: (field: GameScoreFieldDefinition) => void 
}) => {
  const [field, setField] = useState(initialField);
  const handleChange = (updatedField: GameScoreFieldDefinition) => {
    setField(updatedField);
    onFieldChange?.(updatedField);
  };
  return (
    <EditGameScoreField
      scoreField={field}
      onScoreFieldChange={handleChange}
      onScoreFieldRemove={vi.fn()}
    />
  );
};

describe("EditGameScoreField", () => {
  const mockScoreField: GameScoreFieldDefinition = {
    id: "points",
    name: "Points",
    type: "number",
    description: "Standard points",
    minValue: 0,
    maxValue: 100,
    step: 1,
  };

  it("renders correctly with given score field data", () => {
    render(
      <EditGameScoreField
        scoreField={mockScoreField}
        onScoreFieldChange={vi.fn()}
        onScoreFieldRemove={vi.fn()}
      />
    );

    expect(screen.getByLabelText("Name")).toHaveValue("Points");
    expect(screen.getByLabelText("Description")).toHaveValue("Standard points");
    expect(screen.getByLabelText("Minimum value")).toHaveValue(0);
    expect(screen.getByLabelText("Maximum value")).toHaveValue(100);
    expect(screen.getByLabelText("Step")).toHaveValue(1);
  });

  it("calls onScoreFieldChange when name is changed", async () => {
    const user = userEvent.setup();
    const onScoreFieldChange = vi.fn();
    render(
      <StatefulWrapper
        initialField={mockScoreField}
        onFieldChange={onScoreFieldChange}
      />
    );

    await user.clear(screen.getByLabelText("Name"));
    await user.type(screen.getByLabelText("Name"), "New Name");

    expect(onScoreFieldChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ name: "New Name" })
    );
  });

  it("calls onScoreFieldChange when numeric values are changed", async () => {
    const user = userEvent.setup();
    const onScoreFieldChange = vi.fn();
    render(
      <StatefulWrapper
        initialField={mockScoreField}
        onFieldChange={onScoreFieldChange}
      />
    );

    await user.clear(screen.getByLabelText("Minimum value"));
    await user.type(screen.getByLabelText("Minimum value"), "5");
    expect(onScoreFieldChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ minValue: 5 })
    );

    await user.clear(screen.getByLabelText("Maximum value"));
    await user.type(screen.getByLabelText("Maximum value"), "50");
    expect(onScoreFieldChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ maxValue: 50 })
    );

    await user.clear(screen.getByLabelText("Step"));
    await user.type(screen.getByLabelText("Step"), "2");
    expect(onScoreFieldChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ step: 2 })
    );
  });

  it("calls onScoreFieldRemove when remove button is clicked", async () => {
    const user = userEvent.setup();
    const onScoreFieldRemove = vi.fn();
    render(
      <EditGameScoreField
        scoreField={mockScoreField}
        onScoreFieldChange={vi.fn()}
        onScoreFieldRemove={onScoreFieldRemove}
      />
    );

    await user.click(screen.getByText("Remove score field"));
    expect(onScoreFieldRemove).toHaveBeenCalled();
  });
});
