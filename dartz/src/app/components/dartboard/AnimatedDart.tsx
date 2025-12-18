import React, { useMemo } from "react";
import { animated, useSpring } from "@react-spring/three";
import DartModel from "./DartModel";
import { DartCoordinates } from "@/app/utils/dartCoordinates";

interface AnimatedDartProps {
  id: string;
  targetPosition: DartCoordinates;
  onAnimationComplete?: (id: string) => void;
  color?: string; // Hex color for dart customization
}

// Physics constants (scaled for visual effect)
const GRAVITY = 10; // Gravity acceleration in units/s²
const FLIGHT_TIME = 0.2; // Flight duration in seconds (200ms)

/**
 * Calculates initial velocities needed to hit target under gravity
 */
function calculateInitialVelocities(
  start: [number, number, number],
  target: DartCoordinates,
  time: number,
  gravity: number
) {
  // X and Z travel linearly (no air resistance)
  const vx0 = (target.x - start[0]) / time;
  const vz0 = (target.z - start[2]) / time;
  
  // Y follows projectile motion: y = y0 + vy0*t - 0.5*g*t²
  // Solve for vy0: vy0 = (yTarget - yStart + 0.5*g*t²) / t
  const vy0 = (target.y - start[1] + 0.5 * gravity * time * time) / time;
  
  return { vx0, vy0, vz0 };
}

/**
 * Renders a dart with realistic projectile motion physics.
 * The dart follows kinematic equations with gravity affecting Y,
 * and rotation dynamically follows the velocity vector tangent.
 */
export default function AnimatedDart({
  id,
  targetPosition,
  onAnimationComplete,
  color,
}: AnimatedDartProps) {
  
  // Start position: in front of the board, offset based on target
  const startPosition = useMemo((): [number, number, number] => [
    targetPosition.x * 0.2,  
    targetPosition.y * 0.2 + 0.3,
    3.5, 
  ], [targetPosition.x, targetPosition.y]);

  // Pre-calculate initial velocities for the trajectory
  const initialVelocities = useMemo(() => {
    return calculateInitialVelocities(
      startPosition,
      targetPosition,
      FLIGHT_TIME,
      GRAVITY
    );
  }, [startPosition, targetPosition]);

  // Animate time from 0 to FLIGHT_TIME
  const { time } = useSpring({
    from: { time: 0 },
    to: { time: FLIGHT_TIME },
    config: { 
      duration: FLIGHT_TIME * 1000, // Convert to milliseconds
    },
    onRest: () => {
      if (onAnimationComplete) {
        onAnimationComplete(id);
      }
    },
  });

  // Interpolate position using kinematic equations
  const position = time.to((t) => {
    const { vx0, vy0, vz0 } = initialVelocities;
    
    // X and Z: linear motion (no gravity)
    const x = startPosition[0] + vx0 * t;
    const z = startPosition[2] + vz0 * t;
    
    // Y: projectile motion with gravity
    // y = y0 + vy0*t - 0.5*g*t²
    const y = startPosition[1] + vy0 * t - 0.5 * GRAVITY * t * t;
    
    return [x, y, z] as [number, number, number];
  });

  // Interpolate rotation to follow velocity vector (tangent to trajectory)
  const rotation = time.to((t) => {
    const { vx0, vy0, vz0 } = initialVelocities;
    
    // Current velocity components
    const vx = vx0; // Constant (no air resistance)
    const vy = vy0 - GRAVITY * t; // Decreases due to gravity
    const vz = vz0; // Constant (no air resistance)
    
    // Pitch: angle from horizontal based on vertical velocity
    // Positive vy = pointing up, negative vy = pointing down
    const horizontalSpeed = Math.sqrt(vx * vx + vz * vz);
    const pitch = Math.atan2(vy, horizontalSpeed);
    
    // Yaw: horizontal aiming direction based on start and end position
    const yaw = -Math.atan2(vx, -vz);
    
    return [pitch, yaw, 0] as [number, number, number];
  });

  // Random roll angle so dart fins aren't always oriented the same
  const randomRoll = useMemo(() => Math.random() * Math.PI * 2, []);

  return (
    <animated.group position={position as any} rotation={rotation as any}>
      <DartModel position={[0, 0, 0]} rotation={[0, 0, randomRoll]} color={color} />
    </animated.group>
  );
}
