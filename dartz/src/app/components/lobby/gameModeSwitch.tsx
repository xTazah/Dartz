import { Tabs, Tab } from "@nextui-org/react";
import React from "react";
import { GAME_MODES } from "@/app/utils/constants";
import { GameMode } from "@/app/utils/types";

interface ModeSwapProps {
  selectedGameMode: GameMode;
  setSelectedGameMode: (gameMode: GameMode) => void;
  isOwner: boolean;
}

interface IconProps {
  Icon: React.FC<React.SVGProps<SVGSVGElement>>;
}

export const SvgIcon: React.FC<IconProps> = ({ Icon }) => {
  return (
    <Icon
      aria-hidden="true"
      fill="currentColor"
      focusable="false"
      height="24"
      role="presentation"
      viewBox="0 0 24 24"
      width="24"
    />
  );
};

export default function GameModeSwitch({
  selectedGameMode,
  setSelectedGameMode,
  isOwner,
}: ModeSwapProps) {
  return (
    <div className="flex w-full flex-col">
      <Tabs
        isDisabled={!isOwner}
        aria-label="Game Modes"
        color="secondary"
        variant="bordered"
        selectedKey={selectedGameMode.key}
        onSelectionChange={(key) => {
          const newMode = GAME_MODES.find(
            (mode: GameMode) => mode.key === String(key)
          );
          if (newMode && selectedGameMode != newMode) {
            setSelectedGameMode(newMode);
          }
        }}
      >
        {GAME_MODES.map((mode) => (
          <Tab
            key={mode.key}
            title={
              <div className="flex items-center space-x-2">
                <SvgIcon Icon={mode.Icon} />
                <span>{mode.name}</span>
              </div>
            }
          />
        ))}
      </Tabs>
    </div>
  );
}
