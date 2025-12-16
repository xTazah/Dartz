import { DartboardSegment } from "./dartboardSegments";
import { Multiplier } from "./types";
import * as THREE from "three";

export interface DartCoordinates {
  x: number;
  y: number;
  z: number;
}

/**
 * Converts polar coordinates (angle, radius) to Cartesian coordinates for Three.js
 * @param angle - Angle in radians
 * @param radius - Normalized radius (0-1), will be multiplied by boardRadius
 * @param boardRadius - The actual board radius in Three.js units
 * @returns Three.js position vector
 */
function polarToCartesian(
  angle: number,
  radius: number,
  boardRadius: number
): { x: number; y: number } {
  const actualRadius = radius * boardRadius;
  // In Three.js, x is horizontal, y is vertical
  // Dartboard uses standard polar: angle 0 is right, increases counter-clockwise
  const x = actualRadius * Math.cos(angle);
  const y = actualRadius * Math.sin(angle);
  return { x, y };
}

// Transform constants to match the segment overlay group in InteractiveDartboard
// These must stay in sync with <group position={[-0.01, 0.08, 0]} scale={1.10}> in InteractiveDartboard.tsx
const DARTBOARD_OFFSET_X = -0.01;
const DARTBOARD_OFFSET_Y = 0.08;
const DARTBOARD_SCALE = 1.10;

/**
 * Generates a random position within a dartboard segment
 * @param segment - The dartboard segment
 * @param boardRadius - The board radius in Three.js units (typically 2)
 * @returns Coordinates for the dart position
 */
export function getRandomPositionInSegment(
  segment: DartboardSegment,
  boardRadius: number = 2
): DartCoordinates {
  // Random radius between inner and outer bounds
  const radiusRange = segment.radiusOuter - segment.radiusInner;
  const randomRadius = segment.radiusInner + Math.random() * radiusRange;

  // Random angle within segment bounds
  let angleRange: number;
  let randomAngle: number;

  // Handle full circle segments (bulls)
  if (segment.id === "double-bull" || segment.id === "single-bull") {
    randomAngle = Math.random() * 2 * Math.PI;
  } else {
    // For regular segments, handle angle wrapping
    angleRange = segment.angleEnd - segment.angleStart;
    randomAngle = segment.angleStart + Math.random() * angleRange;
  }

  const { x, y } = polarToCartesian(randomAngle, randomRadius, boardRadius);

  // Apply the same scale and offset transformation as the segment overlays
  // to ensure darts land in the visually correct position on the texture
  const scaledX = x * DARTBOARD_SCALE + DARTBOARD_OFFSET_X;
  const scaledY = y * DARTBOARD_SCALE + DARTBOARD_OFFSET_Y;

  // Z position is at the board surface (0)
  return { x: scaledX, y: scaledY, z: 0 };
}

/**
 * Calculates dart position from a segment and optional click coordinates
 * @param segment - The dartboard segment that was hit
 * @param boardRadius - The board radius in Three.js units
 * @param clickPosition - Optional exact click position from raycaster (in 3D space)
 * @returns Coordinates for the dart position
 */
export function calculateDartPosition(
  segment: DartboardSegment,
  boardRadius: number = 2,
  clickPosition?: THREE.Vector3
): DartCoordinates {
  // If we have exact click coordinates, use them
  if (clickPosition) {
    return {
      x: clickPosition.x,
      y: clickPosition.y,
      z: 0, // Stick to board surface
    };
  }

  // Otherwise, generate random position in segment
  return getRandomPositionInSegment(segment, boardRadius);
}

/**
 * Finds the segment that matches the given score and multiplier
 * @param score - The dart score (0-25)
 * @param multiplier - The multiplier
 * @param segments - Array of all dartboard segments
 * @returns The matching segment, or null if not found
 */
export function findSegmentByScore(
  score: number,
  multiplier: Multiplier,
  segments: DartboardSegment[]
): DartboardSegment | null {
  // Handle miss (score 0)
  if (score === 0) {
    // For misses, we'll use a random position outside the board
    // Return a fake segment for consistency
    return {
      id: "miss",
      score: 0,
      multiplier: Multiplier.Single,
      angleStart: 0,
      angleEnd: 2 * Math.PI,
      radiusInner: 0.65, // Just outside the board
      radiusOuter: 0.75,
      label: "MISS",
      color: "black",
    };
  }

  // Find matching segment
  return (
    segments.find(
      (seg) => seg.score === score && seg.multiplier === multiplier
    ) || null
  );
}
