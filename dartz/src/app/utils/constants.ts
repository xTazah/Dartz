import { ClockIcon, PlayIcon, Square2StackIcon, ArchiveBoxIcon} from '@heroicons/react/24/solid';

export const GAME_MODES = [
  {
    key: "around-the-clock",
    name: "Around the Clock",
    Icon: ClockIcon,
  },
  {
    key: "501",
    name: "501",
    Icon: PlayIcon,
  },
  {
    key: "double-training",
    name: "Double Training",
    Icon: Square2StackIcon,
  },
  {
    key: "test-mode",
    name: "Test Mode",
    Icon: ArchiveBoxIcon,
  },
] as const; //for type safety

export type GameMode = (typeof GAME_MODES)[number];
