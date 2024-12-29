"use client";

import { Lobby, Multiplier, Throw } from "@/app/utils/types";
import LobbyHandler from "@/app/handlers/lobbyHandler";
import React, { useContext, useState } from "react";
import { Button } from "@nextui-org/react";
import getCheckoutPath from "@/app/handlers/checkoutHandler";
import { UserContext } from "../userProvider/userProvider";
import MultiplierTabs from "../multiplierTabs/multiplierTabs";
import styles from "@/app/styles/game.module.scss";
import {
  calculateAverage,
  calculate100Plus,
  calculateHighestScore,
} from "@/app/handlers/statisticsHandler";

interface GameProps {
  lobby: Lobby;
  setLobby: (updatedLobby: Lobby) => void;
}

const Game = ({ lobby, setLobby }: GameProps) => {
  const context = useContext(UserContext);
  const user = context?.user;
  const [playerScore1, setPlayerScore1] = useState<number | "">("");
  const [playerScore2, setPlayerScore2] = useState<number | "">("");
  const [playerScore3, setPlayerScore3] = useState<number | "">("");

  const [multiplier1, setMultiplier1] = useState<Multiplier>(Multiplier.Single);
  const [multiplier2, setMultiplier2] = useState<Multiplier>(Multiplier.Single);
  const [multiplier3, setMultiplier3] = useState<Multiplier>(Multiplier.Single);

  const currentPlayer = lobby.players[lobby.currentPlayerIndex];

  const handleSubmitScore = () => {
    if (playerScore1 === "" || playerScore2 === "" || playerScore3 === "")
      return;
    else if (playerScore1 > 20 || playerScore2 > 20 || playerScore3 > 20)
      return;
    else if (playerScore1 < 0 || playerScore2 < 0 || playerScore3 < 0) return;

    let score: Throw = {
      score1: playerScore1,
      multiplier1: multiplier1,
      score2: playerScore2,
      multiplier2: multiplier2,
      score3: playerScore3,
      multiplier3: multiplier3,
    };

    const updatedLobby = LobbyHandler.handlePlayerScore(
      lobby,
      currentPlayer,
      score
    );
    setLobby(updatedLobby);
    //reset States
    setPlayerScore1("");
    setPlayerScore2("");
    setPlayerScore3("");
    setMultiplier1(Multiplier.Single);
    setMultiplier2(Multiplier.Single);
    setMultiplier3(Multiplier.Single);
  };

  return (
    <div className="p-4 bg-[(var(--background))] text-white rounded-lg">
      <h1 className="text-2xl font-bold mb-4">Game in Progress</h1>
      <div className="mb-4"></div>

      <div className="grid grid-cols-3 gap-5">
        {lobby.players?.map((player) => (
          <div key={player.user?.id}>
            <div className={styles.score}>{player?.score}</div>
            <div className={styles.player + ""}>
              <h2 className="text-xl text-center mb-3">
                {player.user?.username}
              </h2>
              {user?.id === currentPlayer.user?.id &&
              currentPlayer.user?.id === player.user?.id ? (
                <div className="flex flex-col gap-2 items-center">
                  <h3 className="mb-2">Enter your score:</h3>
                  <div className="flex gap-2 items-center">
                    <input
                      type="number"
                      className="focus:outline font-bold outline-[var(--component-outline)] w-full p-2 rounded bg-[var(--component-background-hover)] text-[var(--font-color)] pr-10"
                      value={playerScore1}
                      onChange={(e) => {
                        setPlayerScore1(Number(e.target.value));
                      }}
                    />
                    <MultiplierTabs
                      selectedMultiplier={multiplier1}
                      setSelectedMultiplier={setMultiplier1}
                    />
                  </div>
                  <div className="flex gap-2 items-center">
                    <input
                      type="number"
                      className="focus:outline font-bold outline-[var(--component-outline)] w-full p-2 rounded bg-[var(--component-background-hover)] text-[var(--font-color)] pr-10"
                      value={playerScore2}
                      onChange={(e) => {
                        setPlayerScore2(Number(e.target.value));
                      }}
                    />
                    <MultiplierTabs
                      selectedMultiplier={multiplier2}
                      setSelectedMultiplier={setMultiplier2}
                    />
                  </div>
                  <div className="flex gap-2 items-center">
                    <input
                      type="number"
                      className="focus:outline font-bold outline-[var(--component-outline)] w-full p-2 rounded bg-[var(--component-background-hover)] text-[var(--font-color)] pr-10"
                      value={playerScore3}
                      onChange={(e) => {
                        setPlayerScore3(Number(e.target.value));
                      }}
                    />
                    <MultiplierTabs
                      selectedMultiplier={multiplier3}
                      setSelectedMultiplier={setMultiplier3}
                    />
                  </div>
                  <Button
                    className="mt-4 w-full bg-[var(--primary)]"
                    onClick={handleSubmitScore}
                    color="primary"
                  >
                    Submit Score
                  </Button>
                </div>
              ) : (
                <div>
                  {player.throws != undefined ? (
                    <div>
                      <p className="mb-2">
                        Average: {calculateAverage(player?.throws)}
                      </p>
                      <p className="mb-2">
                        100+: {calculate100Plus(player?.throws)}
                      </p>
                      <p className="mb-2">
                        Highest Score: {calculateHighestScore(player?.throws)}
                      </p>
                    </div>
                  ) : (
                    <></>
                  )}
                </div>
              )}
            </div>
            {(() => {
              var checkout = getCheckoutPath(player?.score);
              if (checkout) {
                return (
                  <div className={styles.checkout}>
                    {getCheckoutPath(player?.score)}
                  </div>
                );
              }
              return <></>;
            })()}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Game;
