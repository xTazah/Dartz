'use client'

import React from 'react';
import { useRouter } from 'next/navigation';
import styles from '../../styles/dashboard.module.scss';
import { ClockIcon, PlayIcon, Square2StackIcon } from '@heroicons/react/24/solid';
import HistoryList from '../matchHistory/historyList';
import Image from 'next/image';
import Statistics from '../statistics/statistics';
import ThemeSwitcher from '../themeSwitcher/themeSwitcher';
import { GAME_MODES, GameMode } from '@/app/utils/constants' 
import { Lobby, Player } from '@/app/logic/game';


export default function Dashboard() {
  const router = useRouter();

  const navigateToLobby = (id: string, gameMode: GameMode) => {
    //lobby erstellen und in localStorage packen
    const testPlayer: Player = {id: "Timinz", name:"Timinz", score: 0}
    const lobby: Lobby = {id: "test", currentPlayerIndex : 0, gameMode: gameMode, isGameOver: false, players: [], owner: testPlayer}
    localStorage.setItem(`Lobby_${lobby.id}`, JSON.stringify(lobby))

    router.push(`/lobby?id=${id}`);
  };
  

  return (
    <div className={styles.dashboard + " grid grid-cols-3 gap-8"}>
      <div className={styles.tile + " row-span-2 col-span-2 flex justify-center items-center " + styles.banner}>
        <ThemeSwitcher />
        <Image
          className={styles.Logo}
          src='/images/DartsLogo.png'
          width={200}
          height={100}
          alt='Logo'
        />
        <p className={styles.x}>x</p>
        <Image
          className={styles.Logo}
          src='/images/next.png'
          width={200}
          height={100}
          color='#FFFFFF'
          alt='Logo'
        />
      </div>
      <div className={"row-span-2 col-span-1 flex flex-col gap-5"}>
        <div className={styles.tile + " flex justify-around " + styles.score}>
          <div>140 +</div>
          <div className={styles.scoreAmount}>47 Times</div>
        </div>
        <div className={styles.tile + " flex justify-around " + styles.score}>
          <div>120 +</div>
          <div className={styles.scoreAmount}>59 Times</div>
        </div>
        <div className={styles.tile + " flex justify-around " + styles.score}>
          <div>100 +</div>
          <div className={styles.scoreAmount}>73 Times</div>
        </div>
      </div>
      <div className={"col-span-2 " + styles.title}>Create Lobby</div>
      <div className={"col-span-1 " + styles.title}>Your Statistics</div>
      <div className={"col-span-2 grid grid-cols-3 gap-8"}>
      {GAME_MODES.map((gameMode) => (
        <div
          key={gameMode.key}
          className={`${styles.tile} ${styles.modes} flex justify-center items-center flex-col`}
          onClick={() => navigateToLobby("test", gameMode)}
        >
          <gameMode.Icon className="modeIcons" color="#6F7172" />
          {gameMode.name}
        </div>
      ))}
    </div>
      <div className={styles.tile + " row-span-4 "}>
        <Statistics />
      </div>
      <div className={"col-span-2 " + styles.title}>Match History</div>
      <div className={styles.tile + " row-span-2 col-span-2 "}>
        <HistoryList />
      </div>
    </div>
  );
}
