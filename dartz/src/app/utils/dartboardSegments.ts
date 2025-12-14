"use client";

import { Multiplier } from "./types";

// Standard dartboard number sequence (clockwise starting from top)
export const DARTBOARD_NUMBERS = [
  20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5,
];

// radius values calibrated to match dartboard texture
export const DARTBOARD_RADIUS = {
  doubleBullOuter: 0.03,     // double bull
  bullOuter: 0.07,           // single bull
  tripleInner: 0.365,        // inner edge of triple ring
  tripleOuter: 0.4,          // outer edge of triple ring
  singleOuter: 0.6,          // where outer single ends
  doubleInner: 0.6,          // inner edge of double ring
  doubleOuter: 0.64,         // outer edge of dartboard
};

export interface DartboardSegment {
  id: string;
  score: number;
  multiplier: Multiplier;
  // polar coordinates
  angleStart: number;  // in radians
  angleEnd: number;    // in radians
  radiusInner: number; // normalized 0-1
  radiusOuter: number; // normalized 0-1
  label: string;
  color: "black" | "white" | "red" | "green";
}

// angle range for single number section (each spans 18 degrees)
function getAngleRangeForIndex(index: number): { start: number; end: number } {
  // section is 18 degrees (360 / 20)
  const sectionAngle = (2 * Math.PI) / 20;

  // 20 is at the LEFT (π radians), going clockwise (negative in polar coords)
  // Add π/2 to rotate 90 degrees to align with texture
  const baseAngle = Math.PI - Math.PI / 2 + sectionAngle / 2;
  
  // Subtract to go clockwise
  const end = baseAngle - index * sectionAngle;
  const start = end - sectionAngle;
  
  return { start, end };
}

// Color pattern for dartboard (alternating)
function getSegmentColor(
  index: number,
  ring: "single" | "double" | "triple"
): "black" | "white" | "red" | "green" {
  // Even indices: black/green pattern, Odd indices: white/red pattern
  const isEvenSection = index % 2 === 0;
  
  if (ring === "single") {
    return isEvenSection ? "black" : "white";
  } else {
    // Double and triple rings use red/green
    return isEvenSection ? "green" : "red";
  }
}

// "T20", "D16", "25"
export function formatScoreLabel(score: number, multiplier: Multiplier): string {
  if (score === 25) {
    return multiplier === Multiplier.Double ? "D-BULL" : "BULL";
  }
  
  const prefix =
    multiplier === Multiplier.Double
      ? "D"
      : multiplier === Multiplier.Tripple
      ? "T"
      : "";
  
  return `${prefix}${score}`;
}

export function generateDartboardSegments(): DartboardSegment[] {
  const segments: DartboardSegment[] = [];
  
  // double bull
  segments.push({
    id: "double-bull",
    score: 25,
    multiplier: Multiplier.Double,
    angleStart: 0,
    angleEnd: 2 * Math.PI,
    radiusInner: 0,
    radiusOuter: DARTBOARD_RADIUS.doubleBullOuter,
    label: "D-BULL",
    color: "red",
  });
  
  // single bull
  segments.push({
    id: "single-bull",
    score: 25,
    multiplier: Multiplier.Single,
    angleStart: 0,
    angleEnd: 2 * Math.PI,
    radiusInner: DARTBOARD_RADIUS.doubleBullOuter,
    radiusOuter: DARTBOARD_RADIUS.bullOuter,
    label: "BULL",
    color: "green",
  });
  
  // generate segments for each number
  DARTBOARD_NUMBERS.forEach((num, index) => {
    const { start, end } = getAngleRangeForIndex(index);
    
    // inner single (between bull and triple)
    segments.push({
      id: `single-inner-${num}`,
      score: num,
      multiplier: Multiplier.Single,
      angleStart: start,
      angleEnd: end,
      radiusInner: DARTBOARD_RADIUS.bullOuter,
      radiusOuter: DARTBOARD_RADIUS.tripleInner,
      label: `${num}`,
      color: getSegmentColor(index, "single"),
    });
    
    // triple ring
    segments.push({
      id: `triple-${num}`,
      score: num,
      multiplier: Multiplier.Tripple,
      angleStart: start,
      angleEnd: end,
      radiusInner: DARTBOARD_RADIUS.tripleInner,
      radiusOuter: DARTBOARD_RADIUS.tripleOuter,
      label: `T${num}`,
      color: getSegmentColor(index, "triple"),
    });
    
    // outer single (between triple and double)
    segments.push({
      id: `single-outer-${num}`,
      score: num,
      multiplier: Multiplier.Single,
      angleStart: start,
      angleEnd: end,
      radiusInner: DARTBOARD_RADIUS.tripleOuter,
      radiusOuter: DARTBOARD_RADIUS.singleOuter,
      label: `${num}`,
      color: getSegmentColor(index, "single"),
    });
    
    // double ring (outer edge)
    segments.push({
      id: `double-${num}`,
      score: num,
      multiplier: Multiplier.Double,
      angleStart: start,
      angleEnd: end,
      radiusInner: DARTBOARD_RADIUS.doubleInner,
      radiusOuter: DARTBOARD_RADIUS.doubleOuter,
      label: `D${num}`,
      color: getSegmentColor(index, "double"),
    });
  });
  
  return segments;
}

// pre generate segments
export const DARTBOARD_SEGMENTS = generateDartboardSegments();
