import { GameStatus, Lobby, Player, User, MatchSubmissionPayload } from "@/app/utils/types";
import React, { useContext, useEffect, useRef, useState } from "react";
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
import MatchService from "@/app/services/backend/matchService";
import { toast } from "sonner";

interface WinnerScreenProps {
  lobby: Lobby;
  setLobby: (updatedLobby: Lobby) => void;
}

export default function WinnerScreen({ lobby, setLobby }: WinnerScreenProps) {
  const [isFinished, setisFinished] = useState(false);
  const [winner, setWinner] = useState<Player | undefined>(undefined);
  const [matchSaved, setMatchSaved] = useState(false);
  const submittingRef = useRef(false);
  const router = useRouter();
  const context = useContext(UserContext);
  const currentUser = context?.user;
  
  const handlePlayAgain = () => {
    LobbyHandler.startGame(lobby.id);
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

  // Submit match to backend when the WinnerScreen mounts.
  // This component is only rendered when gameStatus === Finished,
  // so we don't need the internal isFinished check.
  useEffect(() => {
    if (matchSaved || submittingRef.current) return;
    if (currentUser?.id !== lobby.owner?.id) return;

    const winnerPlayer = winner ?? lobby.players.find((x) => x.score == 0);
    if (!winnerPlayer?.user?.id) return;

    submittingRef.current = true;

    const payload: MatchSubmissionPayload = {
      gameModeKey: lobby.gameMode.key,
      sets: lobby.sets,
      legs: lobby.legs,
      winnerPlayerId: winnerPlayer.user.id,
      startedAt: new Date().toISOString(),
      finishedAt: new Date().toISOString(),
      players: lobby.players
        .filter((p) => p.user?.id)
        .map((player, index) => ({
          playerId: player.user!.id,
          playerIndex: index,
          finalSets: player.sets,
          finalLegs: player.legs,
          throws: (player.throws ?? []).map((t) => ({
            score1: t.score1,
            multiplier1: t.multiplier1,
            score2: t.score2,
            multiplier2: t.multiplier2,
            score3: t.score3,
            multiplier3: t.multiplier3,
          })),
        })),
    };

    const matchService = new MatchService();
    matchService
      .submitMatch(payload)
      .then(() => {
        setMatchSaved(true);
        toast.success("Match saved to history!");
      })
      .catch((error) => {
        console.error("Failed to save match:", error);
        toast.error("Failed to save match to history");
      })
      .finally(() => {
        submittingRef.current = false;
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchSaved, currentUser, lobby.owner, winner]);

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
