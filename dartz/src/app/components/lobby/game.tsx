"use client";

import {
  ConnectedPlayer,
  Lobby,
  Multiplier,
  Throw,
  User,
} from "@/app/utils/types";
import LobbyHandler from "@/app/handlers/lobbyHandler";
import React, { useContext, useEffect, useState, lazy, Suspense, useCallback, useMemo, useRef } from "react";
import { Button } from "@nextui-org/react";
import getCheckoutPath from "@/app/handlers/checkoutHandler";
import { UserContext } from "../userProvider/userProvider";
import styles from "@/app/styles/game.module.scss";
import dartboardStyles from "@/app/styles/dartboard.module.scss";
import { formatScoreLabel } from "@/app/utils/dartboardSegments";
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
import { DartInstance } from "../dartboard/InteractiveDartboard";
import {
  calculateDartPosition,
  findSegmentByScore,
  getRandomPositionInSegment,
  type DartCoordinates,
} from "@/app/utils/dartCoordinates";
import { DARTBOARD_SEGMENTS } from "@/app/utils/dartboardSegments";

type InputMode = "manual" | "dartboard";

interface GameProps {
  lobby: Lobby;
  setLobby: (updatedLobby: Lobby) => void;
  localUsers: User[] | null;
}

const Game = ({ lobby, setLobby, localUsers }: GameProps) => {
  const context = useContext(UserContext);
  const user = context?.user;

  // Load input mode preference from cookie, default to dartboard
  const getInitialInputMode = (): InputMode => {
    if (typeof document !== 'undefined') {
      const cookies = document.cookie.split('; ');
      const inputModeCookie = cookies.find(row => row.startsWith('inputMode='));
      if (inputModeCookie) {
        const mode = inputModeCookie.split('=')[1] as InputMode;
        return mode === 'manual' || mode === 'dartboard' ? mode : 'dartboard';
      }
    }
    return 'dartboard';
  };

  // Input mode state - initialize from cookie
  const [inputMode, setInputMode] = useState<InputMode>(getInitialInputMode);

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

  // Dart rendering state
  const [activeDarts, setActiveDarts] = useState<DartInstance[]>([]);
  
  // Cache random positions for manual input to prevent constant regeneration
  const manualDartPositions = useRef<{[key: string]: DartCoordinates}>({});

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

  // Sync dartboard throws to manual input fields ONLY when in dartboard mode
  // This prevents focus loss when typing in manual mode
  useEffect(() => {
    if (inputMode !== "dartboard") return; // Don't sync when in manual mode
    
    const t0 = dartboardThrows[0];
    const t1 = dartboardThrows[1];
    const t2 = dartboardThrows[2];
    
    setPlayerScore1(t0 ? String(t0.score) : "");
    setMultiplier1(t0?.multiplier ?? Multiplier.Single);
    
    setPlayerScore2(t1 ? String(t1.score) : "");
    setMultiplier2(t1?.multiplier ?? Multiplier.Single);
    
    setPlayerScore3(t2 ? String(t2.score) : "");
    setMultiplier3(t2?.multiplier ?? Multiplier.Single);
  }, [dartboardThrows, inputMode]);

  // Reset dartboard throws and darts when player changes
  useEffect(() => {
    setDartboardThrows([]);
    setActiveDarts([]);
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
  const handleDartboardClick = useCallback((score: number, multiplier: Multiplier, coordinates: DartCoordinates) => {
    setDartboardThrows(prev => {
      if (prev.length >= 3) return prev;
      
      const newThrow = { score, multiplier, coordinates };
      
      // Add dart to active darts
      const dartId = `dart-${Date.now()}-${prev.length}`;
      setActiveDarts(existingDarts => [
        ...existingDarts,
        { id: dartId, position: coordinates },
      ]);
      
      return [...prev, newThrow];
    });
  }, []);

  // Handle undo for dartboard throw
  const handleDartboardUndo = useCallback((index: number) => {
    setDartboardThrows(prev => prev.filter((_, i) => i !== index));
    // Remove corresponding dart
    setActiveDarts(existingDarts => {
      const newDarts = [...existingDarts];
      newDarts.splice(index, 1);
      return newDarts;
    });
  }, []);

  // Handle miss click on dartboard
  const handleDartboardMiss = useCallback(() => {
    setDartboardThrows(prev => {
      if (prev.length >= 3) return prev;
      
      // Generate coordinates for a miss (outside the board)
      const missSegment = findSegmentByScore(0, Multiplier.Single, DARTBOARD_SEGMENTS);
      const coordinates = missSegment
        ? getRandomPositionInSegment(missSegment, 2)
        : { x: 0, y: 0, z: 0 };
      
      const newThrow = { score: 0, multiplier: Multiplier.Single, coordinates };
      
      // Add dart for miss
      const dartId = `dart-${Date.now()}-${prev.length}`;
      setActiveDarts(existingDarts => [
        ...existingDarts,
        { id: dartId, position: coordinates },
      ]);
      
      return [...prev, newThrow];
    });
  }, []);

  // Clear all dartboard throws
  const handleDartboardClear = useCallback(() => {
    setDartboardThrows([]);
    setActiveDarts([]);
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
    // Keep darts visible after confirmation
    // They'll be cleared when player changes
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

  // Separate effect for manual input dart generation (performance fix)
  useEffect(() => {
    // Only generate darts in manual mode
    if (inputMode !== "manual") return;
    
    const newDarts: DartInstance[] = [];
    
    // Generate dart for score 1 - cache the position
    if (playerScore1 !== "") {
      const key = `${playerScore1}-${multiplier1}`;
      if (!manualDartPositions.current[key]) {
        const segment = findSegmentByScore(Number(playerScore1), multiplier1, DARTBOARD_SEGMENTS);
        if (segment) {
          manualDartPositions.current[key] = getRandomPositionInSegment(segment, 2);
        }
      }
      if (manualDartPositions.current[key]) {
        newDarts.push({ id: `manual-dart-1`, position: manualDartPositions.current[key] });
      }
    }
    
    // Generate dart for score 2 - cache the position
    if (playerScore2 !== "") {
      const key = `${playerScore2}-${multiplier2}`;
      if (!manualDartPositions.current[key]) {
        const segment = findSegmentByScore(Number(playerScore2), multiplier2, DARTBOARD_SEGMENTS);
        if (segment) {
          manualDartPositions.current[key] = getRandomPositionInSegment(segment, 2);
        }
      }
      if (manualDartPositions.current[key]) {
        newDarts.push({ id: `manual-dart-2`, position: manualDartPositions.current[key] });
      }
    }
    
    // Generate dart for score 3 - cache the position
    if (playerScore3 !== "") {
      const key = `${playerScore3}-${multiplier3}`;
      if (!manualDartPositions.current[key]) {
        const segment = findSegmentByScore(Number(playerScore3), multiplier3, DARTBOARD_SEGMENTS);
        if (segment) {
          manualDartPositions.current[key] = getRandomPositionInSegment(segment, 2);
        }
      }
      if (manualDartPositions.current[key]) {
        newDarts.push({ id: `manual-dart-3`, position: manualDartPositions.current[key] });
      }
    }
    
    setActiveDarts(newDarts);
  }, [
    playerScore1,
    playerScore2,
    playerScore3,
    multiplier1,
    multiplier2,
    multiplier3,
    inputMode,
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

  // Calculate total manual score
  const totalManualScore = useMemo(() => 
    (playerScore1 ? Number(playerScore1) * multiplier1 : 0) +
    (playerScore2 ? Number(playerScore2) * multiplier2 : 0) +
    (playerScore3 ? Number(playerScore3) * multiplier3 : 0),
    [playerScore1, playerScore2, playerScore3, multiplier1, multiplier2, multiplier3]
  );

  // Get throw color based on multiplier (matching DartboardInputPanel)
  const getThrowColor = (multiplier: Multiplier) => {
    switch (multiplier) {
      case Multiplier.Tripple:
        return "#ff6b6b";
      case Multiplier.Double:
        return "#4ecd92ff";
      default:
        return "#95e1d3";
    }
  };

  // Handle mode switching with bidirectional sync
  const handleSwitchToDartboard = useCallback(() => {
    // Sync manual inputs TO dartboard throws
    const throws: DartThrow[] = [];
    if (playerScore1 !== "") {
      throws.push({ score: Number(playerScore1), multiplier: multiplier1 });
    }
    if (playerScore2 !== "") {
      throws.push({ score: Number(playerScore2), multiplier: multiplier2 });
    }
    if (playerScore3 !== "") {
      throws.push({ score: Number(playerScore3), multiplier: multiplier3 });
    }
    setDartboardThrows(throws);
    setInputMode("dartboard");
    // Save preference to cookie
    document.cookie = `inputMode=dartboard; path=/; max-age=${60 * 60 * 24 * 365}`; // 1 year
  }, [playerScore1, playerScore2, playerScore3, multiplier1, multiplier2, multiplier3]);

  const handleSwitchToManual = useCallback(() => {
    setInputMode("manual");
    // Save preference to cookie
    document.cookie = `inputMode=manual; path=/; max-age=${60 * 60 * 24 * 365}`; // 1 year
  }, []);

  // Input mode toggle
  const InputModeToggle = () => (
    <div className={dartboardStyles.modeToggle}>
      <button
        className={`${dartboardStyles.modeButton} ${
          inputMode === "dartboard" ? dartboardStyles.active : ""
        }`}
        onClick={handleSwitchToDartboard}
      >
        <CursorArrowRaysIcon className="w-5 h-5" />
        Dartboard
      </button>
      <button
        className={`${dartboardStyles.modeButton} ${
          inputMode === "manual" ? dartboardStyles.active : ""
        }`}
        onClick={handleSwitchToManual}
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
                    onMiss={handleDartboardMiss}
                    disabled={dartboardThrows.length >= 3}
                    darts={activeDarts}
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
              <div className={dartboardStyles.manualFormContainer}>
                {/* Score Preview */}
                <div className={dartboardStyles.manualScorePreview}>
                  <span className={dartboardStyles.manualScoreLabel}>Score</span>
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
                <div className={dartboardStyles.throwsContainer}>
                  {/* Dart 1 */}
                  <div 
                    className={`${dartboardStyles.throwSlot} ${playerScore1 === "" ? dartboardStyles.empty : ""}`}
                    style={playerScore1 !== "" ? {
                      borderColor: getThrowColor(multiplier1),
                      boxShadow: `0 0 10px ${getThrowColor(multiplier1)}40`,
                    } : {}}
                  >
                    {playerScore1 !== "" ? (
                      <>
                        <span
                          className={dartboardStyles.throwLabel}
                          style={{ color: getThrowColor(multiplier1) }}
                        >
                          {formatScoreLabel(Number(playerScore1), multiplier1)}
                        </span>
                        <span className={dartboardStyles.throwPoints}>
                          = {Number(playerScore1) * multiplier1}
                        </span>
                      </>
                    ) : (
                      <span className={dartboardStyles.emptyLabel}>Dart 1</span>
                    )}
                    <div className={dartboardStyles.manualInputControls}>
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="0-20"
                        className={dartboardStyles.manualInputSmall}
                        value={playerScore1}
                        onChange={(e) => setPlayerScore1(e.target.value.replace(/[^0-9]/g, ''))}
                      />
                      <div className={dartboardStyles.compactMultiplier}>
                        <button 
                          type="button"
                          className={`${dartboardStyles.compactMultiplierBtn} ${multiplier1 === Multiplier.Single ? dartboardStyles.active : ''}`}
                          onClick={() => setMultiplier1(Multiplier.Single)}
                        >1x</button>
                        <button 
                          type="button"
                          className={`${dartboardStyles.compactMultiplierBtn} ${multiplier1 === Multiplier.Double ? dartboardStyles.active : ''}`}
                          onClick={() => setMultiplier1(Multiplier.Double)}
                        >2x</button>
                        <button 
                          type="button"
                          className={`${dartboardStyles.compactMultiplierBtn} ${multiplier1 === Multiplier.Tripple ? dartboardStyles.active : ''}`}
                          onClick={() => setMultiplier1(Multiplier.Tripple)}
                          disabled={Number(playerScore1) === 25}
                        >3x</button>
                      </div>
                    </div>
                  </div>

                  {/* Dart 2 */}
                  <div 
                    className={`${dartboardStyles.throwSlot} ${playerScore2 === "" ? dartboardStyles.empty : ""}`}
                    style={playerScore2 !== "" ? {
                      borderColor: getThrowColor(multiplier2),
                      boxShadow: `0 0 10px ${getThrowColor(multiplier2)}40`,
                    } : {}}
                  >
                    {playerScore2 !== "" ? (
                      <>
                        <span
                          className={dartboardStyles.throwLabel}
                          style={{ color: getThrowColor(multiplier2) }}
                        >
                          {formatScoreLabel(Number(playerScore2), multiplier2)}
                        </span>
                        <span className={dartboardStyles.throwPoints}>
                          = {Number(playerScore2) * multiplier2}
                        </span>
                      </>
                    ) : (
                      <span className={dartboardStyles.emptyLabel}>Dart 2</span>
                    )}
                    <div className={dartboardStyles.manualInputControls}>
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="0-20"
                        className={dartboardStyles.manualInputSmall}
                        value={playerScore2}
                        onChange={(e) => setPlayerScore2(e.target.value.replace(/[^0-9]/g, ''))}
                      />
                      <div className={dartboardStyles.compactMultiplier}>
                        <button 
                          type="button"
                          className={`${dartboardStyles.compactMultiplierBtn} ${multiplier2 === Multiplier.Single ? dartboardStyles.active : ''}`}
                          onClick={() => setMultiplier2(Multiplier.Single)}
                        >1x</button>
                        <button 
                          type="button"
                          className={`${dartboardStyles.compactMultiplierBtn} ${multiplier2 === Multiplier.Double ? dartboardStyles.active : ''}`}
                          onClick={() => setMultiplier2(Multiplier.Double)}
                        >2x</button>
                        <button 
                          type="button"
                          className={`${dartboardStyles.compactMultiplierBtn} ${multiplier2 === Multiplier.Tripple ? dartboardStyles.active : ''}`}
                          onClick={() => setMultiplier2(Multiplier.Tripple)}
                          disabled={Number(playerScore2) === 25}
                        >3x</button>
                      </div>
                    </div>
                  </div>

                  {/* Dart 3 */}
                  <div 
                    className={`${dartboardStyles.throwSlot} ${playerScore3 === "" ? dartboardStyles.empty : ""}`}
                    style={playerScore3 !== "" ? {
                      borderColor: getThrowColor(multiplier3),
                      boxShadow: `0 0 10px ${getThrowColor(multiplier3)}40`,
                    } : {}}
                  >
                    {playerScore3 !== "" ? (
                      <>
                        <span
                          className={dartboardStyles.throwLabel}
                          style={{ color: getThrowColor(multiplier3) }}
                        >
                          {formatScoreLabel(Number(playerScore3), multiplier3)}
                        </span>
                        <span className={dartboardStyles.throwPoints}>
                          = {Number(playerScore3) * multiplier3}
                        </span>
                      </>
                    ) : (
                      <span className={dartboardStyles.emptyLabel}>Dart 3</span>
                    )}
                    <div className={dartboardStyles.manualInputControls}>
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="0-20"
                        className={dartboardStyles.manualInputSmall}
                        value={playerScore3}
                        onChange={(e) => setPlayerScore3(e.target.value.replace(/[^0-9]/g, ''))}
                      />
                      <div className={dartboardStyles.compactMultiplier}>
                        <button 
                          type="button"
                          className={`${dartboardStyles.compactMultiplierBtn} ${multiplier3 === Multiplier.Single ? dartboardStyles.active : ''}`}
                          onClick={() => setMultiplier3(Multiplier.Single)}
                        >1x</button>
                        <button 
                          type="button"
                          className={`${dartboardStyles.compactMultiplierBtn} ${multiplier3 === Multiplier.Double ? dartboardStyles.active : ''}`}
                          onClick={() => setMultiplier3(Multiplier.Double)}
                        >2x</button>
                        <button 
                          type="button"
                          className={`${dartboardStyles.compactMultiplierBtn} ${multiplier3 === Multiplier.Tripple ? dartboardStyles.active : ''}`}
                          onClick={() => setMultiplier3(Multiplier.Tripple)}
                          disabled={Number(playerScore3) === 25}
                        >3x</button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Total */}
                {totalManualScore > 0 && (
                  <div className={dartboardStyles.totalRow}>
                    <span>Round total:</span>
                    <span className={dartboardStyles.totalValue}>{totalManualScore}</span>
                  </div>
                )}

                {/* Submit button */}
                <Button
                  className={dartboardStyles.confirmButton}
                  onPress={handleSubmitScore}
                  isDisabled={isSubmitDisabled}
                  color="primary"
                  size="lg"
                >
                  Submit Score
                </Button>
              </div>
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
