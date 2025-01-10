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
  Bars3Icon
} from "@heroicons/react/24/solid";
import { UnderConstruction } from "../underConstruction";

export default function PhoneNavigation(props: any) {
  const router = useRouter();

  const [selected, setSelected] = useState(1);

  const handleNavigation = (page: number, path: string) => {
    setSelected(page);
    router.push(path);
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
    <Bars3Icon onClick={()=>{props.setFriendListCollapsed(!props.friendListCollapsed)}} className="size-6" color="#6F7172" />
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
              onClick={() => handleNavigation(3, "/friend-list")}
            >
              <UsersIcon className="size-5" color="#6F7172" />
            </button>
          </div>
          <div className="flex justify-center">
            <button
              className={`${styles.phoneNavigationButton} ${
                selected === 4 ? styles.selected : ""
              }`}
              onClick={() => handleNavigation(4, "/quickplay")}
            >
              <PlayIcon className="size-5" color="#6F7172" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
