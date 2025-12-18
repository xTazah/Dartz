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
  ExclamationTriangleIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/solid";
import { UnderConstruction } from "../underConstruction";
import { GAME_MODES } from "@/app/utils/constants";
import { UserContext } from "../userProvider/userProvider";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure } from "@nextui-org/react";
import LeaveGameModal from "../modals/LeaveGameModal";

export default function Navigation(props: any) {
  const router = useRouter();
  const { inLobby } = useContext(UserContext)!;
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [selected, setSelected] = useState(1);
  const [pendingNavigation, setPendingNavigation] = useState<{ page: number; path: string } | null>(null);

  const handleNavigation = (page: number, path: string) => {
    // Check if user is in a lobby before navigating away
    if (inLobby) {
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

  const toggleCollapse = () => props.setCollapsed(!props.collapsed);

  return (
    <div
      className={`${styles.navigation} ${
        props.collapsed ? styles.collapsed : ""
      }`}
    >
      <div className={styles.toggleButton} >
        <button onClick={toggleCollapse}>
          {props.collapsed ? (
            <ChevronRightIcon className="size-5" />
          ) : (
            <ChevronLeftIcon className="size-5" />
          )}
        </button>
      </div>

      <Image
        className="cursor-pointer"
        src="/images/DartsLogo.png"
        width={130}
        height={100}
        alt="Logo"
        onClick={() => handleNavigation(1, "/")}
        style={{
          display: props.collapsed ? "none" : "block",
        }}
      />

      <Image
        className="cursor-pointer mt-3 mb-8"
        src="/images/DartzIconTransparent.png"
        width={40}
        height={100}
        alt="Logo"
        onClick={() => handleNavigation(1, "/")}
        style={{
          display: props.collapsed ? "block" : "none",
        }}
      />

      <button
        className={`${styles.navigationButton} ${
          selected === 1 ? styles.selected : ""
        }`}
        onClick={() => handleNavigation(1, "/")}
      >
        <HomeIcon className="size-5" color="#6F7172" />
        {!props.collapsed && " Home"}
      </button>

      <button
        className={`${styles.navigationButton} ${
          selected === 2 ? styles.selected : ""
        }`}
        onClick={() => handleNavigation(2, "/statistics")}
      >
        <ChartPieIcon className="size-5" color="#6F7172" />
        {!props.collapsed && " Statistics"}
      </button>

      <button
        className={`${styles.navigationButton} ${
          selected === 3 ? styles.selected : ""
        }`}
        onClick={() => handleNavigation(3, "/profile")}
      >
        <UsersIcon className="size-5" color="#6F7172" />
        {!props.collapsed && " Profile"}
      </button>

      <button
        className={`${styles.navigationButton} ${
          selected === 4 ? styles.selected : ""
        }`}
        onClick={() => handleNavigation(4, `/lobby?mode=${GAME_MODES[1].key}`)}
      >
        <PlayIcon className="size-5" color="#6F7172" />
        {!props.collapsed && " Quickplay"}
      </button>

      <button
        className={`${styles.navigationButton} ${
          selected === 5 ? styles.selected : ""
        }`}
        onClick={() => handleNavigation(5, "/settings")}
      >
        <Cog6ToothIcon className="size-5" color="#6F7172" />
        {!props.collapsed && " Settings"}
      </button>

      <LeaveGameModal 
        isOpen={isOpen} 
        onClose={cancelLeave} 
        onConfirm={confirmLeave} 
      />
    </div>
  );
}
