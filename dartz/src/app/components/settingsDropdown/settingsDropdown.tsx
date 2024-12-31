import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";

import {
  Cog6ToothIcon,
  UserIcon,
  ArrowLeftEndOnRectangleIcon,
} from "@heroicons/react/24/solid";

import styles from "../../styles/dropdown.module.scss";
import PlayerService from "@/app/services/playerService";
import { useContext } from "react";
import { UserContext } from "../userProvider/userProvider";

export function SettingsDropdown() {
  const playerService = new PlayerService();
  const context = useContext(UserContext);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Cog6ToothIcon className={`size-5 ${styles.icon}`} color="#6F7172" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className={`w-56 ${styles.dropdownBackground}`}>
        <DropdownMenuLabel>Account Settings</DropdownMenuLabel>
        <DropdownMenuSeparator className={`${styles.dropdownSeperator}`} />
        <DropdownMenuGroup>
          <DropdownMenuItem className={`${styles.dropdownItem}`}>
            <UserIcon className={`size-5 ${styles.icon}`} color="#6F7172" />
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem className={`${styles.dropdownItem}`}>
            <Cog6ToothIcon
              className={`size-5 ${styles.icon}`}
              color="#6F7172"
            />
            Settings
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator className={`${styles.dropdownSeperator}`} />
        <DropdownMenuItem
          className={`${styles.dropdownItem}`}
          onClick={() =>
            playerService.logout().then(() => {
              context?.setUser(null);
            })
          }
        >
          <ArrowLeftEndOnRectangleIcon
            className={`size-5 ${styles.icon}`}
            color="#6F7172"
          />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
