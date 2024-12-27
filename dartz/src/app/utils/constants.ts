import { ClockIcon, PlayIcon, Square2StackIcon, ArchiveBoxIcon} from '@heroicons/react/24/solid';
import { fiveHundredOneLogic } from '../gameLogic/501Logic';

export const GAME_MODES = [
  {
    key: "around-the-clock",
    name: "Around the Clock",
    Icon: ClockIcon,
    logic: fiveHundredOneLogic,
  },
  {
    key: "501",
    name: "501",
    Icon: PlayIcon,
    logic: fiveHundredOneLogic,
  },
  {
    key: "double-training",
    name: "Double Training",
    Icon: Square2StackIcon,
    logic: fiveHundredOneLogic,
  },
  // {
  //   key: "test-mode",
  //   name: "Test Mode",
  //   Icon: ArchiveBoxIcon,
  //   logic: fiveHundredOneLogic,
  // },
] as const; //for type safety

export const IconsMap = {
  // "test-mode": ArchiveBoxIcon,
  "double-training":Square2StackIcon,
  "501": PlayIcon,
  "around-the-clock":ClockIcon
};