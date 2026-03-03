import React, { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import EditGameBasicInfo from "./EditGameBasicInfo";
import { GameBasicInfoDefinition } from "../domain/game";

const StatefulWrapper = ({ 
  initialInfo, 
  onInfoChange 
}: { 
  initialInfo: GameBasicInfoDefinition, 
  onInfoChange?: (info: GameBasicInfoDefinition) => void 
}) => {
  const [info, setInfo] = useState(initialInfo);
  const handleChange = (updatedInfo: GameBasicInfoDefinition) => {
    setInfo(updatedInfo);
    onInfoChange?.(updatedInfo);
  };
  return (
    <EditGameBasicInfo
      basicInfo={info}
      onBasicInfoChange={handleChange}
    />
  );
};

describe("EditGameBasicInfo", () => {
  const mockBasicInfo: GameBasicInfoDefinition = {
    id: "test-game",
    name: "Test Game",
    icon: "https://example.com/icon.png",
    simultaneousTurns: true,
  };

  it("renders correctly with initial data", () => {
    render(
      <EditGameBasicInfo
        basicInfo={mockBasicInfo}
        onBasicInfoChange={vi.fn()}
      />
    );

    expect(screen.getByLabelText("Name")).toHaveValue("Test Game");
    expect(screen.getByLabelText("Icon URL")).toHaveValue("https://example.com/icon.png");
    expect(screen.getByLabelText("Simultaneous turns")).toBeChecked();
  });

  it("calls onBasicInfoChange when name is changed", async () => {
    const user = userEvent.setup();
    const onBasicInfoChange = vi.fn();
    render(
      <StatefulWrapper
        initialInfo={mockBasicInfo}
        onInfoChange={onBasicInfoChange}
      />
    );

    await user.clear(screen.getByLabelText("Name"));
    await user.type(screen.getByLabelText("Name"), "New Name");

    expect(onBasicInfoChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ name: "New Name" })
    );
  });

  it("calls onBasicInfoChange when simultaneous turns is toggled", async () => {
    const user = userEvent.setup();
    const onBasicInfoChange = vi.fn();
    render(
      <EditGameBasicInfo
        basicInfo={mockBasicInfo}
        onBasicInfoChange={onBasicInfoChange}
      />
    );

    await user.click(screen.getByLabelText("Simultaneous turns"));

    expect(onBasicInfoChange).toHaveBeenCalledWith(
      expect.objectContaining({ simultaneousTurns: false })
    );
  });
});
