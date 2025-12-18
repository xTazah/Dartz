import { GameStatus, Lobby, Player, User } from "@/app/utils/types";
import React, { useContext, useEffect, useState } from "react";
import dartboardStyles from "@/app/styles/dartboard.module.scss";
import {
  calculate100Plus,
  calculateAverage,
  calculateHighestScore,
  calculateLastScore,
} from "@/app/handlers/statisticsHandler";
import { Button } from "@nextui-org/react";
import LobbyHandler from "@/app/handlers/lobbyHandler";
import { useRouter } from "next/navigation";
import { TrophyIcon, ArrowLeftIcon, ArrowPathIcon, SignalSlashIcon, UserIcon } from "@heroicons/react/24/solid";
import { UserContext } from "../userProvider/userProvider";

interface WinnerScreenProps {
  lobby: Lobby;
  setLobby: (updatedLobby: Lobby) => void;
}

export default function WinnerScreen({ lobby, setLobby }: WinnerScreenProps) {
  const [isFinished, setisFinished] = useState(false);
  const [winner, setWinner] = useState<Player | undefined>(undefined);
  const router = useRouter();
  const context = useContext(UserContext);
  const currentUser = context?.user;
  
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
  }, [lobby.sets, lobby.legs, lobby.players]);

  const winnerName = winner?.user?.username ?? lobby.players.find((x) => x.score == 0)?.user?.username ?? "Unknown";
  const isCurrentUserWinner = winner?.user?.id === currentUser?.id || 
    lobby.players.find((x) => x.score == 0)?.user?.id === currentUser?.id;

  return (
    <div className={dartboardStyles.winnerContainer}>
      {/* Winner announcement */}
      <div className={dartboardStyles.winnerHeader}>
        <div className={dartboardStyles.trophyIcon}>
          <TrophyIcon className="w-16 h-16" />
        </div>
        <h1 className={dartboardStyles.winnerTitle}>
          {isFinished ? "Game Over!" : "Leg Complete!"}
        </h1>
        <p className={dartboardStyles.winnerName}>
          🎯 {isCurrentUserWinner ? "YOU" : winnerName} {isFinished ? (isCurrentUserWinner ? "win the match!" : "wins the match!") : (isCurrentUserWinner ? "win the leg!" : "wins the leg!")}
        </p>
        {lobby.sets > 0 && (
          <p className={dartboardStyles.matchInfo}>
            First to {lobby.sets} sets • Best of {lobby.legs} legs
          </p>
        )}
        {lobby.sets === 0 && lobby.legs > 0 && (
          <p className={dartboardStyles.matchInfo}>
            First to {lobby.legs} legs
          </p>
        )}
      </div>

      {/* Player stats cards */}
      <div className={dartboardStyles.winnerStatsGrid}>
        {lobby.players?.map((player) => {
          const isWinner = player.user?.username === winnerName;
          const isCurrentUser = player.user?.id === currentUser?.id;
          return (
            <div 
              key={player.user?.id} 
              className={`${dartboardStyles.winnerPlayerCard} ${isWinner ? dartboardStyles.winnerHighlight : ""} ${isCurrentUser ? dartboardStyles.currentUserCard : ""}`}
            >
              {isWinner && (
                <div className={dartboardStyles.winnerBadge}>
                  <TrophyIcon className="w-4 h-4" />
                  Winner
                </div>
              )}
              {isCurrentUser && (
                <div className={dartboardStyles.youBadge}>
                  <UserIcon className="w-3 h-3" />
                  You
                </div>
              )}
              {!player.connected && (
                <div className={dartboardStyles.disconnectedOverlay}>
                  <SignalSlashIcon className="w-8 h-8 mb-2" />
                  <span>Disconnected</span>
                </div>
              )}
              <h2 className={dartboardStyles.winnerPlayerName}>
                {player.user?.username}
              </h2>
              
              {/* Score display */}
              <div className={dartboardStyles.winnerScoreRow}>
                <div className={dartboardStyles.winnerScoreItem}>
                  <span className={dartboardStyles.winnerScoreValue}>{player.sets}</span>
                  <span className={dartboardStyles.winnerScoreLabel}>Sets</span>
                </div>
                <div className={dartboardStyles.winnerScoreDivider} />
                <div className={dartboardStyles.winnerScoreItem}>
                  <span className={dartboardStyles.winnerScoreValue}>{player.legs}</span>
                  <span className={dartboardStyles.winnerScoreLabel}>Legs</span>
                </div>
              </div>

              {/* Stats */}
              {player.throws != undefined && player.throws.length > 0 && (
                <div className={dartboardStyles.winnerStatsSection}>
                  <div className={dartboardStyles.winnerStatRow}>
                    <span>Average</span>
                    <span className={dartboardStyles.winnerStatValue}>
                      {calculateAverage(player.throws)}
                    </span>
                  </div>
                  <div className={dartboardStyles.winnerStatRow}>
                    <span>100+ Scores</span>
                    <span className={dartboardStyles.winnerStatValue}>
                      {calculate100Plus(player.throws)}
                    </span>
                  </div>
                  <div className={dartboardStyles.winnerStatRow}>
                    <span>Highest Score</span>
                    <span className={dartboardStyles.winnerStatValue}>
                      {calculateHighestScore(player.throws)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Action buttons */}
      <div className={dartboardStyles.winnerActions}>
        <Button
          className={dartboardStyles.winnerButtonSecondary}
          onPress={() => router.push("/")}
          variant="bordered"
          size="lg"
          startContent={<ArrowLeftIcon className="w-5 h-5" />}
        >
          Leave Game
        </Button>
        {!isFinished && (
          <Button
            className={dartboardStyles.winnerButtonPrimary}
            onPress={handlePlayAgain}
            color="primary"
            size="lg"
            startContent={<ArrowPathIcon className="w-5 h-5" />}
          >
            Next Leg
          </Button>
        )}
        {isFinished && (
          <Button
            className={dartboardStyles.winnerButtonPrimary}
            onPress={handlePlayAgain}
            color="primary"
            size="lg"
            startContent={<ArrowPathIcon className="w-5 h-5" />}
          >
            Play Again
          </Button>
        )}
      </div>
    </div>
  );
}
