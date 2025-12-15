"use client";

import React, { useState, useContext } from "react";
import { useRouter } from "next/navigation";
import styles from "../../styles/navigation.module.scss";
import Image from "next/image";
import {
  HomeIcon,
  UsersIcon,
  ChartPieIcon,
  PlayIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Bars3Icon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/solid";
import { UnderConstruction } from "../underConstruction";
import { GAME_MODES } from "@/app/utils/constants";
import { UserContext } from "../userProvider/userProvider";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure } from "@nextui-org/react";
import LeaveGameModal from "../modals/LeaveGameModal";

export default function PhoneNavigation(props: any) {
  const router = useRouter();
  const { inLobby } = useContext(UserContext)!;
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [selected, setSelected] = useState(1);
  const [pendingNavigation, setPendingNavigation] = useState<{ page: number; path: string } | null>(null);

  const handleNavigation = (page: number, path: string) => {
    // Check if user is in a lobby before navigating away
    if (inLobby && !path.includes('/lobby')) {
      // Store pending navigation and show confirmation
      setPendingNavigation({ page, path });
      onOpen();
    } else {
      // Navigate normally
      setSelected(page);
      router.push(path);
    }
  };

  const confirmLeave = () => {
    if (pendingNavigation) {
      setSelected(pendingNavigation.page);
      router.push(pendingNavigation.path);
      setPendingNavigation(null);
    }
    onClose();
  };

  const cancelLeave = () => {
    setPendingNavigation(null);
    onClose();
  };

  return (
    <>
      <div className="shadow-lg lg:hidden fixed w-full p-3 h-15 rounded-b-xl bg-[var(--component-background)] top-0">
        <div className="flex justify-between items-center">
          <Image
            className="cursor-pointer"
            src="/images/DartsLogo.png"
            width={80}
            height={100}
            alt="Logo"
            onClick={() => handleNavigation(1, "/")}
            style={{
              display: props.collapsed ? "none" : "block",
            }}
          />
          <Bars3Icon
            onClick={() => {
              props.setFriendListCollapsed(!props.friendListCollapsed);
            }}
            className="size-6"
            color="#6F7172"
          />
        </div>
      </div>
      <div className="shadow-lg lg:hidden fixed w-full p-3 h-15 rounded-t-xl bg-[var(--component-background)] bottom-0">
        <div className="grid grid-cols-4 gap-8 ">
          <div className="flex justify-center">
            <button
              className={
                `${styles.phoneNavigationButton} ${
                  selected === 1 ? styles.selected : ""
                }` + ""
              }
              onClick={() => handleNavigation(1, "/")}
            >
              <HomeIcon className="size-5" color="#6F7172" />
            </button>
          </div>
          <div className="flex justify-center align-center">
            <button
              className={
                `${styles.phoneNavigationButton} ${
                  selected === 2 ? styles.selected : ""
                }` + " "
              }
              onClick={() => handleNavigation(2, "/statistics")}
            >
              <ChartPieIcon className="size-5" color="#6F7172" />
            </button>
          </div>
          <div className="flex justify-center">
            <button
              className={`${styles.phoneNavigationButton} ${
                selected === 3 ? styles.selected : ""
              }`}
              onClick={() => handleNavigation(3, "/profile")}
            >
              <UsersIcon className="size-5" color="#6F7172" />
            </button>
          </div>
          <div className="flex justify-center">
            <button
              className={`${styles.phoneNavigationButton} ${
                selected === 4 ? styles.selected : ""
              }`}
              onClick={() => handleNavigation(4, `/lobby?mode=${GAME_MODES[1].key}`)}
            >
              <PlayIcon className="size-5" color="#6F7172" />
            </button>
          </div>
        </div>
      </div>

      <LeaveGameModal 
        isOpen={isOpen} 
        onClose={cancelLeave} 
        onConfirm={confirmLeave} 
      />
    </>
  );
}
