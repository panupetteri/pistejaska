import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import EditGameMiscField from "./EditGameMiscField";
import { GameMiscFieldDefinition } from "../domain/game";

describe("EditGameMiscField", () => {
  const mockMiscField: GameMiscFieldDefinition = {
    id: "round",
    name: "Round",
    type: "number",
    description: "Current round",
    minValue: 1,
    maxValue: 10,
    valuePerPlayer: false,
    affectsScoring: false,
    isRelevantReportDimension: true,
  };

  const onMiscFieldChange = vi.fn();
  const onMiscFieldRemove = vi.fn();

  it("renders correctly for a numeric field", () => {
    render(
      <EditGameMiscField
        miscField={mockMiscField}
        onMiscFieldChange={onMiscFieldChange}
        onMiscFieldRemove={onMiscFieldRemove}
      />
    );

    expect(screen.getByLabelText("Type")).toHaveValue(JSON.stringify("number"));
    expect(screen.getByLabelText("Name")).toHaveValue("Round");
    expect(screen.getByLabelText("Description")).toHaveValue("Current round");
    expect(screen.getByLabelText("Minimum value")).toHaveValue(1);
    expect(screen.getByLabelText("Maximum value")).toHaveValue(10);
    expect(screen.getByLabelText("Is relevant report dimension")).toBeChecked();
    expect(screen.getByLabelText("Value per player")).not.toBeChecked();
  });

  it("renders correctly for a text field", () => {
    const textMiscField: GameMiscFieldDefinition = {
      ...mockMiscField,
      type: "text",
    };
    render(
      <EditGameMiscField
        miscField={textMiscField}
        onMiscFieldChange={onMiscFieldChange}
        onMiscFieldRemove={onMiscFieldRemove}
      />
    );

    expect(screen.getByLabelText("Type")).toHaveValue(JSON.stringify("text"));
    expect(screen.queryByLabelText("Minimum value")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Maximum value")).not.toBeInTheDocument();
  });

  it("removes numeric constraints when type is changed from numeric to text", async () => {
    const user = userEvent.setup();
    render(
      <EditGameMiscField
        miscField={mockMiscField}
        onMiscFieldChange={onMiscFieldChange}
        onMiscFieldRemove={onMiscFieldRemove}
      />
    );

    await user.selectOptions(screen.getByLabelText("Type"), JSON.stringify("text"));

    const lastCall = onMiscFieldChange.mock.calls[onMiscFieldChange.mock.calls.length - 1][0];
    expect(lastCall).toMatchObject({ type: "text" });
    expect(lastCall).not.toHaveProperty("minValue");
    expect(lastCall).not.toHaveProperty("maxValue");
  });

  it("calls onMiscFieldRemove when remove button is clicked", async () => {
    const user = userEvent.setup();
    render(
      <EditGameMiscField
        miscField={mockMiscField}
        onMiscFieldChange={onMiscFieldChange}
        onMiscFieldRemove={onMiscFieldRemove}
      />
    );

    await user.click(screen.getByText("Remove miscellaneous field"));
    expect(onMiscFieldRemove).toHaveBeenCalled();
  });

  it("calls onMiscFieldChange when checkboxes are toggled", async () => {
    const user = userEvent.setup();
    const onMiscFieldChange = vi.fn();
    render(
      <EditGameMiscField
        miscField={mockMiscField}
        onMiscFieldChange={onMiscFieldChange}
        onMiscFieldRemove={onMiscFieldRemove}
      />
    );

    await user.click(screen.getByLabelText("Value per player"));
    expect(onMiscFieldChange).toHaveBeenCalledWith(
      expect.objectContaining({ valuePerPlayer: true })
    );

    await user.click(screen.getByLabelText("Affects scoring"));
    expect(onMiscFieldChange).toHaveBeenCalledWith(
      expect.objectContaining({ affectsScoring: true })
    );

    await user.click(screen.getByLabelText("Is relevant report dimension"));
    expect(onMiscFieldChange).toHaveBeenCalledWith(
      expect.objectContaining({ isRelevantReportDimension: false })
    );
  });

  it("calls onMiscFieldChange when an option is added", async () => {
    const user = userEvent.setup();
    const onMiscFieldChange = vi.fn();
    render(
      <EditGameMiscField
        miscField={{ ...mockMiscField, type: "text", options: [] }}
        onMiscFieldChange={onMiscFieldChange}
        onMiscFieldRemove={onMiscFieldRemove}
      />
    );

    await user.click(screen.getByText("Add option"));
    expect(onMiscFieldChange).toHaveBeenCalledWith(
      expect.objectContaining({ options: [{ value: "", label: "" }] })
    );
  });
});
