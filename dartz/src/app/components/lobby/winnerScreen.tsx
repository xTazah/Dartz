import { GameStatus, Lobby, Player } from "@/app/utils/types";
import React, { useEffect, useState } from "react";
import styles from "@/app/styles/game.module.scss";
import {
  calculate100Plus,
  calculateAverage,
  calculateHighestScore,
  calculateLastScore,
} from "@/app/handlers/statisticsHandler";
import { Button } from "@nextui-org/react";
import LobbyHandler from "@/app/handlers/lobbyHandler";
import { useRouter } from "next/navigation";

interface WinnerScreenProps {
  lobby: Lobby;
  setLobby: (updatedLobby: Lobby) => void;
}

export default function WinnerScreen({ lobby, setLobby }: WinnerScreenProps) {
  const [isFinished, setisFinished] = useState(false);
  const [winner, setWinner] = useState<Player | undefined>(undefined);
  const router = useRouter();
  const handlePlayAgain = () => {
    const updatedLobby = LobbyHandler.startGame(lobby);
    setLobby(updatedLobby);
  };

  useEffect(() => {
    console.log("checking wins");
    if (lobby.sets != 0) {
      let win = lobby.players.find((x) => x.sets == lobby.sets);
      if (win != undefined) {
        setWinner(win);
        setisFinished(true);
      }
    } else if (lobby.legs != 0) {
      let win = lobby.players.find((x) => x.legs == lobby.legs);
      if (win != undefined) {
        setWinner(win);
        setisFinished(true);
      }
    }
  }, []);

  return (
    <div>
      {winner != undefined ? (
        <p>{winner.user?.username} won the Game</p>
      ) : (
        <p>
          Winner is {lobby.players.find((x) => x.score == 0)?.user?.username}
        </p>
      )}
      <p>Sets in Total: {lobby.sets}</p>
      <p>Legs in Total: {lobby.legs}</p>
      <div className="grid grid-cols-3 gap-5">
        {lobby.players?.map((player) => (
          <div className="relative" key={player.user?.id}>
            <div className={styles.player + ""}>
              <h2 className="text-xl text-center mb-3">
                {player.user?.username}
              </h2>
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
              <div className="flex justify-around mt-6">
                <h2 className="text-xl text-center ">Sets: {player.sets}</h2>
                <h2 className="text-xl text-center ">Legs: {player.legs}</h2>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-4">
        <Button
          className="mt-4 w-full bg-[var(--secondary)]"
          onClick={() => {
            router.push("/");
          }}
          color="secondary"
        >
          Leave Game
        </Button>
        {!isFinished && (
          <Button
            className="mt-4 w-full bg-[var(--primary)]"
            onClick={handlePlayAgain}
            color="primary"
          >
            Play Again
          </Button>
        )}
      </div>
    </div>
  );
}
