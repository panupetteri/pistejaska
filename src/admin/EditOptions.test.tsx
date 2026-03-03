import React, { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import EditOptions from "./EditOptions";
import { GameFieldOption } from "../domain/game";

const StatefulWrapper = ({ 
  initialOptions, 
  type,
  onOptionsChange 
}: { 
  initialOptions?: GameFieldOption<string | number>[], 
  type: "text" | "number",
  onOptionsChange?: (options: GameFieldOption<string | number>[]) => void 
}) => {
  const [options, setOptions] = useState(initialOptions);
  const handleChange = (updatedOptions: GameFieldOption<string | number>[]) => {
    setOptions(updatedOptions);
    onOptionsChange?.(updatedOptions);
  };
  return (
    <EditOptions
      type={type}
      options={options}
      onOptionsChange={handleChange}
      className="test-class"
    />
  );
};

describe("EditOptions", () => {
  it("renders correctly without initial options", () => {
    render(
      <EditOptions
        type="text"
        onOptionsChange={vi.fn()}
        className="test-class"
      />
    );

    expect(screen.getByText("Define options")).toBeInTheDocument();
    expect(screen.queryByText("Options")).not.toBeInTheDocument();
  });

  it("renders correctly with initial options (text type)", () => {
    const options: GameFieldOption<string>[] = [
      { value: "opt1", label: "Option 1" },
      { value: "opt2", label: "Option 2" },
    ];
    render(
      <EditOptions
        type="text"
        options={options}
        onOptionsChange={vi.fn()}
        className="test-class"
      />
    );

    expect(screen.getByText("Options")).toBeInTheDocument();
    expect(screen.getAllByLabelText("Label")).toHaveLength(2);
    expect(screen.getAllByLabelText("Label")[0]).toHaveValue("Option 1");
    expect(screen.getAllByLabelText("Label")[1]).toHaveValue("Option 2");
    // Text type doesn't show separate value fields
    expect(screen.queryByLabelText("Value")).not.toBeInTheDocument();
  });

  it("renders correctly with initial options (number type)", () => {
    const options: GameFieldOption<number>[] = [
      { value: 1, label: "One" },
      { value: 2, label: "Two" },
    ];
    render(
      <EditOptions
        type="number"
        options={options}
        onOptionsChange={vi.fn()}
        className="test-class"
      />
    );

    expect(screen.getAllByLabelText("Label")).toHaveLength(2);
    expect(screen.getAllByLabelText("Value")).toHaveLength(2);
    expect(screen.getAllByLabelText("Value")[0]).toHaveValue(1);
    expect(screen.getAllByLabelText("Value")[1]).toHaveValue(2);
  });

  it("adds an option", async () => {
    const user = userEvent.setup();
    const onOptionsChange = vi.fn();
    render(
      <StatefulWrapper
        type="text"
        onOptionsChange={onOptionsChange}
      />
    );

    await user.click(screen.getByText("Define options"));

    expect(onOptionsChange).toHaveBeenCalledWith([{ value: "", label: "" }]);
    expect(screen.getByLabelText("Label")).toBeInTheDocument();
  });

  it("edits an option label", async () => {
    const user = userEvent.setup();
    const onOptionsChange = vi.fn();
    const initialOptions = [{ value: "v1", label: "L1" }];
    render(
      <StatefulWrapper
        type="text"
        initialOptions={initialOptions}
        onOptionsChange={onOptionsChange}
      />
    );

    await user.clear(screen.getByLabelText("Label"));
    await user.type(screen.getByLabelText("Label"), "New Label");

    expect(onOptionsChange).toHaveBeenLastCalledWith([{ value: "v1", label: "New Label" }]);
  });

  it("deletes an option", async () => {
    const user = userEvent.setup();
    const onOptionsChange = vi.fn();
    const initialOptions = [
      { value: "v1", label: "L1" },
      { value: "v2", label: "L2" },
    ];
    render(
      <StatefulWrapper
        type="text"
        initialOptions={initialOptions}
        onOptionsChange={onOptionsChange}
      />
    );

    const deleteButtons = screen.getAllByText("X");
    await user.click(deleteButtons[0]);

    expect(onOptionsChange).toHaveBeenCalledWith([{ value: "v2", label: "L2" }]);
    expect(screen.getAllByLabelText("Label")).toHaveLength(1);
  });

  it("sorts options", async () => {
    const user = userEvent.setup();
    const onOptionsChange = vi.fn();
    const initialOptions = [
      { value: "b", label: "Beta" },
      { value: "a", label: "Alpha" },
    ];
    render(
      <StatefulWrapper
        type="text"
        initialOptions={initialOptions}
        onOptionsChange={onOptionsChange}
      />
    );

    await user.click(screen.getByText("Sort (A-Z)"));

    expect(onOptionsChange).toHaveBeenCalledWith([
      { value: "a", label: "Alpha" },
      { value: "b", label: "Beta" },
    ]);
  });
});
