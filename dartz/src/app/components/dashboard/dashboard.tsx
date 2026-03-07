"use client";

import React, { useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "../../styles/dashboard.module.scss";
import HistoryList from "../matchHistory/historyList";
import Image from "next/image";
import Statistics from "../statistics/statistics";
import ThemeSwitcher from "../themeSwitcher/themeSwitcher";
import { GAME_MODES } from "@/app/utils/constants";
import { Lobby, Player, GameMode, DragDataType, PlayerStatsResponse } from "@/app/utils/types";
import MatchService from "@/app/services/backend/matchService";
import { UserContext } from "../userProvider/userProvider";
import { Button } from "@nextui-org/button";
import {
  ClipboardDocumentIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/solid";
import { Tooltip } from "@nextui-org/react";
import LobbyHandler from "@/app/handlers/lobbyHandler";
import { toast } from "sonner";
import DropZone from "../DragDrop/dropzone";

export default function Dashboard() {
  const router = useRouter();

  const context = useContext(UserContext);
  const { user } = context!;

  const [lobbyKey, setLobbyKey] = useState("");
  const [isLobbyLoading, setIsLobbyLoading] = useState(false);
  const [dashStats, setDashStats] = useState<PlayerStatsResponse | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    const matchService = new MatchService();
    matchService
      .getPlayerStats(user.id)
      .then((res) => setDashStats(res.data))
      .catch((err) => console.error("Dashboard stats error:", err));
  }, [user?.id]);

  const navigateToLobby = (gameMode: GameMode) => {
    console.log("navigate to lobby clicked");
    router.push(`/lobby?mode=${gameMode.key}`);
  };

  const handleLobbyJoin = async () => {
    setIsLobbyLoading(true);
    if (lobbyKey != "") {
      const lobby = await LobbyHandler.getLobbyExists(lobbyKey);
      if (!lobby) {
        toast(
          <>
            <ExclamationTriangleIcon className="size-6" />
            <div>
              Lobby with code <span className="font-bold"> {lobbyKey} </span>{" "}
              does not exist.
            </div>
          </>,
          {
            duration: 5000,
          }
        );
        setIsLobbyLoading(false);
      } else router.push(`/lobby?id=${lobbyKey}`);
    }
    setIsLobbyLoading(false);
  };

  return (
    <div
      className={styles.dashboard + " grid grid-cols-1 lg:grid-cols-3 gap-8"}
    >
      <div
        className={
          styles.tile +
          " row-span-2 col-span-2 flex flex-col justify-center items-center " +
          styles.banner
        }
      >
        <Image
          className={styles.Logo}
          src="/images/DartsLogo.png"
          width={150}
          height={100}
          alt="Logo"
        />
        <div>
          <p className="text-[var(--secondary)] text-center mb-2">
            Enter or paste a
            <span className="font-bold"> custom lobby code </span>to join a
            lobby
          </p>
          <div className="relative">
            <input
              type="text"
              value={lobbyKey}
              onChange={(e) => {
                setLobbyKey(e.target.value);
              }}
              placeholder="Code"
              className="focus:outline font-bold outline-[var(--component-outline)] w-full p-2 rounded bg-[var(--component-background-hover)] text-[var(--font-color)] pr-10"
            />
            <Tooltip
              closeDelay={0}
              showArrow
              className="text-black"
              content="Paste"
            >
              <ClipboardDocumentIcon
                className="absolute top-1/2 right-3 -translate-y-1/2 h-5 w-5 cursor-pointer text-[var(--secondary)] hover:text-[var(--primary)]"
                onClick={async () => {
                  const clipboardText = await navigator.clipboard.readText();
                  setLobbyKey(clipboardText);
                }}
              />
            </Tooltip>
          </div>
          <Button
            className="mt-4 w-full bg-[var(--primary)]"
            onPress={handleLobbyJoin}
            disabled={lobbyKey === ""}
            isLoading={isLobbyLoading}
            color="primary"
          >
            Join Lobby
          </Button>
        </div>
      </div>
      <div
        className={"row-span-2 col-span-2 lg:col-span-1 flex flex-col gap-5"}
      >
        <div className={styles.tile + " flex justify-around " + styles.score}>
          <div>180s</div>
          <div className={styles.scoreAmount}>{dashStats?.count180s ?? "—"} Times</div>
        </div>
        <div className={styles.tile + " flex justify-around " + styles.score}>
          <div>140 +</div>
          <div className={styles.scoreAmount}>{dashStats?.count140Plus ?? "—"} Times</div>
        </div>
        <div className={styles.tile + " flex justify-around " + styles.score}>
          <div>100 +</div>
          <div className={styles.scoreAmount}>{dashStats?.count100Plus ?? "—"} Times</div>
        </div>
      </div>
      <div className={"col-span-2 " + styles.title}>Create Lobby</div>
      <div className={"hidden lg:block col-span-1 " + styles.title}>
        Your Statistics
      </div>
      <div className={"col-span-2 grid grid-cols-3 gap-3 md:gap-4 lg:gap-8"}>
        {GAME_MODES.map((gameMode) => (
          <div
            key={gameMode.key}
            className={`${styles.tile} ${styles.modes} flex justify-center items-center flex-col`}
            onClick={() => navigateToLobby(gameMode)}
          >
            <gameMode.Icon className="modeIcons" color="#6F7172" />
            <span className="text-center text-sm lg:text-md">{gameMode.name}</span>
          </div>
        ))}
      </div>
      <div className={"block lg:hidden col-span-1 " + styles.title}>
        Your Statistics
      </div>
      <div className={styles.tile + " row-span-4 col-span-2 lg:col-span-1 "}>
        <Statistics />
      </div>
      <div className={"col-span-2 " + styles.title}>Match History</div>
      <div className={styles.tile + " row-span-2 col-span-2"}>
        <HistoryList playerId={user?.id} compact limit={5} />
      </div>
    </div>
  );
}
