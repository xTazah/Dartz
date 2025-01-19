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
import { UnderConstruction } from "../underConstruction";
import { GAME_MODES } from "@/app/utils/constants";

export default function Navigation(props: any) {
  const router = useRouter();

  const [selected, setSelected] = useState(1);

  const handleNavigation = (page: number, path: string) => {
    setSelected(page);
    router.push(path);
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
    </div>
  );
}
