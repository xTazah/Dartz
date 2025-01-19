import { Tabs, Tab } from "@nextui-org/react";
import React from "react";
import { GAME_MODES } from "@/app/utils/constants";
import { GameMode } from "@/app/utils/types";
import styles from "@/app/styles/lobby.module.scss"

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

  function createAbbreviation(input: string): string {
    const trimmedInput = input.trim();
    
    if (!trimmedInput.includes(' ')) {
      return trimmedInput;
    }
  
    const words = trimmedInput.split(' ').filter(word => word.length > 0);

    const abbreviation = words.map(word => word.charAt(0).toUpperCase()).join('');
  
    return abbreviation;
  }

  return (
    <div className="flex w-full flex-col ">
      <Tabs
        className={styles.tabs+ ' flex justify-center'}
        isDisabled={!isOwner}
        aria-label="Game Modes"
        color="primary"
        variant="solid"
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
                <span className="block lg:hidden" >{createAbbreviation(mode.name)}</span>
                <span className="hidden lg:block">{mode.name}</span>
              </div>
            }
          />
        ))}
      </Tabs>
    </div>
  );
}
