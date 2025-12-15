import React from "react";
import { animated, useSpring } from "@react-spring/three";
import DartModel from "./DartModel";
import { DartCoordinates } from "@/app/utils/dartCoordinates";

interface AnimatedDartProps {
  id: string;
  targetPosition: DartCoordinates;
  onAnimationComplete?: (id: string) => void;
}

/**
 * Renders a dart with smooth spring animation
 */
export default function AnimatedDart({
  id,
  targetPosition,
  onAnimationComplete,
}: AnimatedDartProps) {
  
  // Start position: in front of the board
  const startPosition: [number, number, number] = [
    targetPosition.x * 0.3,
    targetPosition.y * 0.3 - 0.5,
    3, // 3 units in front
  ];

  // Smooth spring animation to target
  const { position } = useSpring({
    from: { position: startPosition },
    to: { position: [targetPosition.x, targetPosition.y, targetPosition.z] as [number, number, number] },
    config: { tension: 200, friction: 30 },
    onRest: () => {
      if (onAnimationComplete) {
        onAnimationComplete(id);
      }
    },
  });

  return (
    <animated.group position={position as any}>
      <DartModel position={[0, 0, 0]} rotation={[0, 0, 0]} />
    </animated.group>
  );
}
