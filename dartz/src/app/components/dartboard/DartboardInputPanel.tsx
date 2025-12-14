"use client";

import React from "react";
import { Button } from "@nextui-org/react";
import { XMarkIcon, ArrowUturnLeftIcon } from "@heroicons/react/24/solid";
import { Multiplier } from "@/app/utils/types";
import { formatScoreLabel } from "@/app/utils/dartboardSegments";
import styles from "@/app/styles/dartboard.module.scss";

export interface DartThrow {
  score: number;
  multiplier: Multiplier;
}

interface DartboardInputPanelProps {
  throws: DartThrow[];
  onUndoThrow: (index: number) => void;
  onConfirm: () => void;
  onClear: () => void;
  currentScore: number;
  previewScore: number;
  disabled?: boolean;
}

export default function DartboardInputPanel({
  throws,
  onUndoThrow,
  onConfirm,
  onClear,
  currentScore,
  previewScore,
  disabled = false,
}: DartboardInputPanelProps) {
  const totalThrowScore = throws.reduce(
    (sum, t) => sum + t.score * t.multiplier,
    0
  );
  
  const isBust = previewScore < 0 || (previewScore > 0 && previewScore < 2);
  const isCheckout = previewScore === 0;
  const hasThrows = throws.length > 0;
  const isComplete = throws.length === 3;

  // Get color based on multiplier
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

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <h3 className={styles.title}>Current Turn</h3>
        {hasThrows && (
          <button
            className={styles.clearButton}
            onClick={onClear}
            disabled={disabled}
            title="Clear all throws"
          >
            <ArrowUturnLeftIcon className="w-4 h-4" />
            Clear
          </button>
        )}
      </div>

      {/* Score preview */}
      <div className={styles.scorePreview}>
        <div className={styles.scoreLabel}>Score</div>
        <div
          className={`${styles.scoreValue} ${isBust ? styles.bust : ""} ${
            isCheckout ? styles.checkout : ""
          }`}
        >
          {isBust ? "BUST" : previewScore}
        </div>
        {hasThrows && !isBust && (
          <div className={styles.scoreDelta}>-{totalThrowScore}</div>
        )}
      </div>

      {/* Throw slots */}
      <div className={styles.throwsContainer}>
        {[0, 1, 2].map((index) => {
          const dart = throws[index];
          const isEmpty = !dart;

          return (
            <div
              key={index}
              className={`${styles.throwSlot} ${isEmpty ? styles.empty : ""}`}
              style={
                dart
                  ? {
                      borderColor: getThrowColor(dart.multiplier),
                      boxShadow: `0 0 10px ${getThrowColor(dart.multiplier)}40`,
                    }
                  : {}
              }
            >
              {dart ? (
                <>
                  <span
                    className={styles.throwLabel}
                    style={{ color: getThrowColor(dart.multiplier) }}
                  >
                    {formatScoreLabel(dart.score, dart.multiplier)}
                  </span>
                  <span className={styles.throwPoints}>
                    = {dart.score * dart.multiplier}
                  </span>
                  <button
                    className={styles.undoButton}
                    onClick={() => onUndoThrow(index)}
                    disabled={disabled}
                    title="Undo this throw"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <span className={styles.emptyLabel}>Dart {index + 1}</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Total */}
      {hasThrows && (
        <div className={styles.totalRow}>
          <span>Round total:</span>
          <span className={styles.totalValue}>{totalThrowScore}</span>
        </div>
      )}

      {/* Confirm button */}
      <Button
        className={styles.confirmButton}
        onPress={onConfirm}
        isDisabled={disabled || !hasThrows}
        color={isCheckout ? "success" : "primary"}
        size="lg"
      >
        {isCheckout
          ? "🎯 Checkout!"
          : isBust
          ? "Confirm Bust"
          : isComplete
          ? "Confirm Throws"
          : `Confirm (${throws.length}/3 darts)`}
      </Button>

      {/* Help text */}
      <p className={styles.helpText}>
        Click on the dartboard to register throws. You can undo individual
        throws or clear all.
      </p>
    </div>
  );
}
