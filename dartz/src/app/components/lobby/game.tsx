"use client";

import {
  ConnectedPlayer,
  Lobby,
  Multiplier,
  Throw,
  User,
} from "@/app/utils/types";
import LobbyHandler from "@/app/handlers/lobbyHandler";
import React, { useContext, useEffect, useState, lazy, Suspense, useCallback, useMemo } from "react";
import { Button } from "@nextui-org/react";
import getCheckoutPath from "@/app/handlers/checkoutHandler";
import { UserContext } from "../userProvider/userProvider";
import MultiplierTabs from "../multiplierTabs/multiplierTabs";
import styles from "@/app/styles/game.module.scss";
import dartboardStyles from "@/app/styles/dartboard.module.scss";
import {
  calculateAverage,
  calculate100Plus,
  calculateHighestScore,
  calculateLastScore,
} from "@/app/handlers/statisticsHandler";

import { SignalSlashIcon, ArrowUturnLeftIcon } from "@heroicons/react/24/solid";
import { Squares2X2Icon, CursorArrowRaysIcon } from "@heroicons/react/24/outline";

// Lazy load the dartboard to avoid SSR issues with Three.js
const InteractiveDartboard = lazy(
  () => import("../dartboard/InteractiveDartboard")
);
import DartboardInputPanel, {
  DartThrow,
} from "../dartboard/DartboardInputPanel";

type InputMode = "manual" | "dartboard";

interface GameProps {
  lobby: Lobby;
  setLobby: (updatedLobby: Lobby) => void;
  localUsers: User[] | null;
}

const Game = ({ lobby, setLobby, localUsers }: GameProps) => {
  const context = useContext(UserContext);
  const user = context?.user;

  // Input mode state
  const [inputMode, setInputMode] = useState<InputMode>("dartboard");

  // Manual input state
  const [previewScore, setPreviewScore] = useState(501);
  const [playerScore1, setPlayerScore1] = useState<string>("");
  const [playerScore2, setPlayerScore2] = useState<string>("");
  const [playerScore3, setPlayerScore3] = useState<string>("");

  const [multiplier1, setMultiplier1] = useState<Multiplier>(Multiplier.Single);
  const [multiplier2, setMultiplier2] = useState<Multiplier>(Multiplier.Single);
  const [multiplier3, setMultiplier3] = useState<Multiplier>(Multiplier.Single);

  const [isSubmitDisabled, setIsSubmitDisabled] = useState<boolean>(true);

  // Dartboard input state
  const [dartboardThrows, setDartboardThrows] = useState<DartThrow[]>([]);
  const [dartboardPreviewScore, setDartboardPreviewScore] = useState(501);

  const currentPlayer = lobby.players[lobby.currentPlayerIndex];

  // Check if current user is the current player or a local user
  const isCurrentUsersTurn = useMemo(() => {
    const playerUserId = currentPlayer.user?.id;
    if (!playerUserId) return false;
    return (
      user?.id === playerUserId ||
      localUsers?.some((localUser) => localUser?.id === playerUserId)
    );
  }, [currentPlayer.user?.id, user?.id, localUsers]);

  // Update dartboard preview score
  useEffect(() => {
    const totalThrowScore = dartboardThrows.reduce(
      (sum, t) => sum + t.score * t.multiplier,
      0
    );
    setDartboardPreviewScore(currentPlayer.score - totalThrowScore);
  }, [dartboardThrows, currentPlayer.score]);

  // Reset dartboard throws when player changes
  useEffect(() => {
    setDartboardThrows([]);
  }, [currentPlayer.user?.id]);

  const handleSubmitScore = () => {
    if (playerScore1 === "" || playerScore2 === "" || playerScore3 === "")
      return;
    else if (
      (Number(playerScore1) > 20 && Number(playerScore1) != 25) ||
      (Number(playerScore2) > 20 && Number(playerScore2) != 25) ||
      (Number(playerScore3) > 20 && Number(playerScore3) != 25)
    )
      return;
    else if (Number(playerScore1) < 0 || Number(playerScore2) < 0 || Number(playerScore3) < 0) return;

    let score: Throw = {
      score1: Number(playerScore1),
      multiplier1: multiplier1,
      score2: Number(playerScore2),
      multiplier2: multiplier2,
      score3: Number(playerScore3),
      multiplier3: multiplier3,
    };

    const updatedLobby = LobbyHandler.handlePlayerScore(
      lobby,
      currentPlayer,
      score
    );
    console.log(updatedLobby);
    setLobby(updatedLobby);
    //reset States
    setPlayerScore1("");
    setPlayerScore2("");
    setPlayerScore3("");
    setMultiplier1(Multiplier.Single);
    setMultiplier2(Multiplier.Single);
    setMultiplier3(Multiplier.Single);
  };

  // Handle dartboard segment click - memoized to prevent dartboard re-renders
  const handleDartboardClick = useCallback((score: number, multiplier: Multiplier) => {
    setDartboardThrows(prev => {
      if (prev.length >= 3) return prev;
      return [...prev, { score, multiplier }];
    });
  }, []);

  // Handle undo for dartboard throw
  const handleDartboardUndo = useCallback((index: number) => {
    setDartboardThrows(prev => prev.filter((_, i) => i !== index));
  }, []);

  // Clear all dartboard throws
  const handleDartboardClear = useCallback(() => {
    setDartboardThrows([]);
  }, []);

  // Confirm dartboard throws
  const handleDartboardConfirm = useCallback(() => {
    if (dartboardThrows.length === 0) return;

    // Pad with zeros if less than 3 throws
    const throws = [...dartboardThrows];
    while (throws.length < 3) {
      throws.push({ score: 0, multiplier: Multiplier.Single });
    }

    const score: Throw = {
      score1: throws[0].score,
      multiplier1: throws[0].multiplier,
      score2: throws[1].score,
      multiplier2: throws[1].multiplier,
      score3: throws[2].score,
      multiplier3: throws[2].multiplier,
    };

    const updatedLobby = LobbyHandler.handlePlayerScore(
      lobby,
      currentPlayer,
      score
    );
    console.log(updatedLobby);
    setLobby(updatedLobby);
    setDartboardThrows([]);
  }, [dartboardThrows, lobby, currentPlayer, setLobby]);

  useEffect(() => {
    let s1 = playerScore1 == "" ? 0 : playerScore1;
    let s2 = playerScore2 == "" ? 0 : playerScore2;
    let s3 = playerScore3 == "" ? 0 : playerScore3;
    setPreviewScore(
      currentPlayer.score -
      Number(s1) * multiplier1 -
        Number(s2) * multiplier2 -
          Number(s3) * multiplier3
    );
    if (Number(playerScore1) == 25 && multiplier1 == Multiplier.Tripple) {
      setMultiplier1(Multiplier.Single);
    }
    if (Number(playerScore2) == 25 && multiplier2 == Multiplier.Tripple) {
      setMultiplier2(Multiplier.Single);
    }
    if (Number(playerScore3) == 25 && multiplier3 == Multiplier.Tripple) {
      setMultiplier3(Multiplier.Single);
    }
    setIsSubmitDisabled(false);
    if (playerScore1 === "" || playerScore2 === "" || playerScore3 === "")
      setIsSubmitDisabled(true);
    else if (
      (Number(playerScore1) > 20 && Number(playerScore1) != 25) ||
      (Number(playerScore2) > 20 && Number(playerScore2) != 25) ||
      (Number(playerScore3) > 20 && Number(playerScore3) != 25)
    )
      setIsSubmitDisabled(true);
    else if (Number(playerScore1) < 0 || Number(playerScore2) < 0 || Number(playerScore3) < 0)
      setIsSubmitDisabled(true);
  }, [
    playerScore1,
    playerScore2,
    playerScore3,
    multiplier1,
    multiplier2,
    multiplier3,
    currentPlayer.score,
  ]);

  const handleUndo = () => {
    let updatedLobby = LobbyHandler.handleUndo(lobby);
    console.log(updatedLobby.players)
    console.log(updatedLobby.players[updatedLobby.currentPlayerIndex])
    console.log(updatedLobby.currentPlayerIndex)
    let length =
      updatedLobby.players[updatedLobby.currentPlayerIndex].throws.length - 1;
    setPlayerScore1(
      ""+updatedLobby.players[updatedLobby.currentPlayerIndex].throws[length]
        .score1
    );
    setPlayerScore2(
      ""+updatedLobby.players[updatedLobby.currentPlayerIndex].throws[length]
        .score2
    );
    setPlayerScore3(
      ""+updatedLobby.players[updatedLobby.currentPlayerIndex].throws[length]
        .score3
    );
    setMultiplier1(
      updatedLobby.players[updatedLobby.currentPlayerIndex].throws[length]
        .multiplier1
    );
    setMultiplier2(
      updatedLobby.players[updatedLobby.currentPlayerIndex].throws[length]
        .multiplier2
    );
    setMultiplier3(
      updatedLobby.players[updatedLobby.currentPlayerIndex].throws[length]
        .multiplier3
    );
    updatedLobby = LobbyHandler.hanldeRemoveLastThrows(updatedLobby);
    setLobby(updatedLobby);
  };

  const isCurrentOrLocalUser = (
    playerUserId: number | undefined,
    localUsers: User[] | null,
    user: User | undefined
  ) => {
    if (!playerUserId) return false;
    return (
      user?.id === playerUserId ||
      localUsers?.some((localUser) => localUser?.id === playerUserId)
    );
  };

  // Get the preview score based on input mode
  const getDisplayPreviewScore = () => {
    return inputMode === "dartboard" ? dartboardPreviewScore : previewScore;
  };

  // Manual input form component - redesigned
  const ManualInputForm = () => {
    const totalManualScore = 
      (playerScore1 ? Number(playerScore1) * multiplier1 : 0) +
      (playerScore2 ? Number(playerScore2) * multiplier2 : 0) +
      (playerScore3 ? Number(playerScore3) * multiplier3 : 0);
    
    return (
      <div className={dartboardStyles.manualFormContainer}>
        {/* Score Preview */}
        <div className={dartboardStyles.manualScorePreview}>
          <span className={dartboardStyles.manualScoreLabel}>Remaining</span>
          <span className={`${dartboardStyles.manualScoreValue} ${
            previewScore < 2 && previewScore !== 0 ? dartboardStyles.bust : ""
          }`}>
            {previewScore < 2 && previewScore !== 0 ? "BUST" : previewScore}
          </span>
          {totalManualScore > 0 && (
            <span className={dartboardStyles.manualScoreDelta}>-{totalManualScore}</span>
          )}
        </div>

        {/* Throw inputs */}
        <div className={dartboardStyles.manualThrowsGrid}>
          {/* Dart 1 */}
          <div className={dartboardStyles.manualThrowCard}>
            <span className={dartboardStyles.manualDartLabel}>Dart 1</span>
            <input
              type="number"
              placeholder="0-20, 25"
              className={dartboardStyles.manualInput}
              value={playerScore1}
              onChange={(e) => setPlayerScore1(e.target.value)}
            />
            <MultiplierTabs
              selectedMultiplier={multiplier1}
              setSelectedMultiplier={setMultiplier1}
              isDisabled={Number(playerScore1) == 25}
            />
          </div>

          {/* Dart 2 */}
          <div className={dartboardStyles.manualThrowCard}>
            <span className={dartboardStyles.manualDartLabel}>Dart 2</span>
            <input
              type="number"
              placeholder="0-20, 25"
              className={dartboardStyles.manualInput}
              value={playerScore2}
              onChange={(e) => setPlayerScore2(e.target.value)}
            />
            <MultiplierTabs
              selectedMultiplier={multiplier2}
              setSelectedMultiplier={setMultiplier2}
              isDisabled={Number(playerScore2) == 25}
            />
          </div>

          {/* Dart 3 */}
          <div className={dartboardStyles.manualThrowCard}>
            <span className={dartboardStyles.manualDartLabel}>Dart 3</span>
            <input
              type="number"
              placeholder="0-20, 25"
              className={dartboardStyles.manualInput}
              value={playerScore3}
              onChange={(e) => setPlayerScore3(e.target.value)}
            />
            <MultiplierTabs
              selectedMultiplier={multiplier3}
              setSelectedMultiplier={setMultiplier3}
              isDisabled={Number(playerScore3) == 25}
            />
          </div>
        </div>

        {/* Total */}
        {totalManualScore > 0 && (
          <div className={dartboardStyles.manualTotalRow}>
            <span>Round total</span>
            <span className={dartboardStyles.manualTotalValue}>{totalManualScore}</span>
          </div>
        )}

        {/* Submit button */}
        <Button
          className={dartboardStyles.manualSubmitButton}
          onPress={handleSubmitScore}
          isDisabled={isSubmitDisabled}
          color="primary"
          size="lg"
        >
          Submit Score
        </Button>
      </div>
    );
  };

  // Input mode toggle
  const InputModeToggle = () => (
    <div className={dartboardStyles.modeToggle}>
      <button
        className={`${dartboardStyles.modeButton} ${
          inputMode === "dartboard" ? dartboardStyles.active : ""
        }`}
        onClick={() => setInputMode("dartboard")}
      >
        <CursorArrowRaysIcon className="w-5 h-5" />
        Dartboard
      </button>
      <button
        className={`${dartboardStyles.modeButton} ${
          inputMode === "manual" ? dartboardStyles.active : ""
        }`}
        onClick={() => setInputMode("manual")}
      >
        <Squares2X2Icon className="w-5 h-5" />
        Manual
      </button>
    </div>
  );

  // Player card component for non-active players
  const PlayerCard = ({ player, isActive }: { player: typeof currentPlayer; isActive: boolean }) => {
    const displayScore = isActive && user?.id === currentPlayer.user?.id
      ? getDisplayPreviewScore()
      : player.score;
    
    const isBust = isActive && user?.id === currentPlayer.user?.id && 
      ((displayScore < 2 || displayScore > 501) && displayScore !== 0);

    return (
      <div className={`${dartboardStyles.playerCard} ${isActive ? dartboardStyles.activePlayer : ""}`}>
        {!player.connected && (
          <div className={dartboardStyles.disconnectedOverlay}>
            <SignalSlashIcon className="w-8 h-8 mb-2" />
            <span>Disconnected</span>
          </div>
        )}
        
        <div className={dartboardStyles.playerHeader}>
          <span className={dartboardStyles.playerName}>{player.user?.username}</span>
          <span className={dartboardStyles.playerLegs}>{player.legs} legs</span>
        </div>
        
        <div className={`${dartboardStyles.playerScore} ${isBust ? dartboardStyles.bust : ""}`}>
          {isBust ? "BUST" : displayScore}
        </div>
        
        {/* Checkout suggestion */}
        {(() => {
          const checkout = getCheckoutPath(displayScore);
          if (checkout) {
            return <div className={dartboardStyles.checkoutHint}>{checkout}</div>;
          }
          return null;
        })()}
        
        {/* Stats for non-active players */}
        {!isActive && player.throws && player.throws.length > 0 && (
          <div className={dartboardStyles.playerStats}>
            <div className={dartboardStyles.statRow}>
              <span>Avg</span>
              <span>{calculateAverage(player.throws)}</span>
            </div>
            <div className={dartboardStyles.statRow}>
              <span>Last</span>
              <span>{calculateLastScore(player.throws)}</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={dartboardStyles.gameContainer}>
      {/* Left side: Player cards */}
      <div className={dartboardStyles.playersPanel}>
        <h3 className={dartboardStyles.panelTitle}>Players</h3>
        <div className={dartboardStyles.playersList}>
          {lobby.players?.map((player) => {
            const isActive = lobby.players[lobby.currentPlayerIndex].user?.id === player.user?.id;
            return (
              <PlayerCard key={player.user?.id} player={player} isActive={isActive} />
            );
          })}
        </div>
        
        {/* Undo button */}
        {currentPlayer?.throws && currentPlayer.throws.length > 0 && 
         lobby.players.length === 1 && currentPlayer.score !== 501 && (
          <button onClick={handleUndo} className={dartboardStyles.undoTurnButton}>
            <ArrowUturnLeftIcon className="w-5 h-5" />
            Undo Last Turn
          </button>
        )}
      </div>

      {/* Center: Dartboard or input area (only shown for current player) */}
      {isCurrentUsersTurn && (
        <div className={dartboardStyles.inputPanel}>
          <InputModeToggle />
          
          {inputMode === "dartboard" ? (
            <div className={dartboardStyles.dartboardLayout}>
              <div className={dartboardStyles.dartboardArea}>
                <Suspense
                  fallback={
                    <div className={dartboardStyles.dartboardLoading}>
                      Loading dartboard...
                    </div>
                  }
                >
                  <InteractiveDartboard
                    onSegmentClick={handleDartboardClick}
                    disabled={dartboardThrows.length >= 3}
                  />
                </Suspense>
              </div>
              <div className={dartboardStyles.throwsPanel}>
                <DartboardInputPanel
                  throws={dartboardThrows}
                  onUndoThrow={handleDartboardUndo}
                  onConfirm={handleDartboardConfirm}
                  onClear={handleDartboardClear}
                  currentScore={currentPlayer.score}
                  previewScore={dartboardPreviewScore}
                />
              </div>
            </div>
          ) : (
            <div className={dartboardStyles.manualInputArea}>
              <ManualInputForm />
            </div>
          )}
        </div>
      )}

      {/* Waiting message for non-current players */}
      {!isCurrentUsersTurn && (
        <div className={dartboardStyles.waitingPanel}>
          <div className={dartboardStyles.waitingContent}>
            <div className={dartboardStyles.waitingIcon}>🎯</div>
            <h3>Waiting for {currentPlayer.user?.username}</h3>
            <p>They are taking their turn...</p>
          </div>
        </div>
      )}

      {/* Spectators */}
      {lobby.spectators && lobby.spectators.length > 0 && (
        <div className={dartboardStyles.spectatorsBar}>
          <span>Spectators:</span>
          {lobby.spectators.map(
            (spectator: ConnectedPlayer) =>
              spectator.connected && (
                <span key={spectator?.user?.id} className={dartboardStyles.spectatorName}>
                  {spectator?.user?.username}
                </span>
              )
          )}
        </div>
      )}
    </div>
  );
};

export default Game;
