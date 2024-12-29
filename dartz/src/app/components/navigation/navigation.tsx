"use client";

import React, { useState } from "react";
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
} from "@heroicons/react/24/solid";

export default function Navigation() {
  const router = useRouter();

  const [selected, setSelected] = useState(1);
  const [collapsed, setCollapsed] = useState(false);

  const handleNavigation = (page: number, path: string) => {
    setSelected(page);
    router.push(path);
  };

  const toggleCollapse = () => setCollapsed(!collapsed);

  return (
    <div
      className={`${styles.navigation} ${collapsed ? styles.collapsed : ""}`}
    >
      <div className={styles.toggleButton}>
        <button onClick={toggleCollapse}>
          {collapsed ? (
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
          display: collapsed ? "none" : "block",
        }} /*ToDo: Add small logo that has only the feather of the dart to be collapsible too*/
      />

      <button
        className={`${styles.navigationButton} ${
          selected === 1 ? styles.selected : ""
        }`}
        onClick={() => handleNavigation(1, "/")}
      >
        <HomeIcon className="size-5" color="#6F7172" />
        {!collapsed && " Home"}
      </button>

      <button
        className={`${styles.navigationButton} ${
          selected === 2 ? styles.selected : ""
        }`}
        onClick={() => handleNavigation(2, "/statistics")}
      >
        <ChartPieIcon className="size-5" color="#6F7172" />
        {!collapsed && " Statistics"}
      </button>

      <button
        className={`${styles.navigationButton} ${
          selected === 3 ? styles.selected : ""
        }`}
        onClick={() => handleNavigation(3, "/friend-list")}
      >
        <UsersIcon className="size-5" color="#6F7172" />
        {!collapsed && " Friend List"}
      </button>

      <button
        className={`${styles.navigationButton} ${
          selected === 4 ? styles.selected : ""
        }`}
        onClick={() => handleNavigation(4, "/quickplay")}
      >
        <PlayIcon className="size-5" color="#6F7172" />
        {!collapsed && " Quickplay"}
      </button>
    </div>
  );
}
