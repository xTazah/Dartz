"use client";

import React, { useState, useMemo, Suspense, memo, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Html, useTexture } from "@react-three/drei";
import * as THREE from "three";
import {
  DARTBOARD_SEGMENTS,
  DartboardSegment,
} from "@/app/utils/dartboardSegments";
import { Multiplier } from "@/app/utils/types";

interface DartboardProps {
  onSegmentClick: (score: number, multiplier: Multiplier) => void;
  disabled?: boolean;
}

// Create a ring sector geometry for segment overlays
function createSectorGeometry(
  innerRadius: number,
  outerRadius: number,
  startAngle: number,
  endAngle: number,
  segments: number = 32
): THREE.BufferGeometry {
  const geometry = new THREE.BufferGeometry();
  const vertices: number[] = [];
  const indices: number[] = [];

  const angleSpan = endAngle - startAngle;
  const angleStep = angleSpan / segments;

  // Create vertices for inner and outer arcs
  for (let i = 0; i <= segments; i++) {
    const angle = startAngle + i * angleStep;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    // Inner vertex
    vertices.push(innerRadius * cos, innerRadius * sin, 0.01);
    // Outer vertex
    vertices.push(outerRadius * cos, outerRadius * sin, 0.01);
  }

  // Create triangles
  for (let i = 0; i < segments; i++) {
    const baseIndex = i * 2;
    // First triangle
    indices.push(baseIndex, baseIndex + 1, baseIndex + 2);
    // Second triangle
    indices.push(baseIndex + 1, baseIndex + 3, baseIndex + 2);
  }

  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(vertices, 3)
  );
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  return geometry;
}

// Hover color based on segment type
function getHoverColor(segment: DartboardSegment): string {
  if (segment.multiplier === Multiplier.Tripple) return "#ff6b6b";
  if (segment.multiplier === Multiplier.Double) return "#4ecdc4";
  if (segment.score === 25) return "#ffd93d";
  return "#95e1d3";
}

// Individual segment overlay component - memoized to prevent re-renders
const SegmentOverlay = memo(function SegmentOverlay({
  segment,
  boardRadius,
  isHovered,
  onPointerEnter,
  onPointerLeave,
  onClick,
  disabled,
}: {
  segment: DartboardSegment;
  boardRadius: number;
  isHovered: boolean;
  onPointerEnter: () => void;
  onPointerLeave: () => void;
  onClick: () => void;
  disabled: boolean;
}) {
  const geometry = useMemo(() => {
    const inner = segment.radiusInner * boardRadius;
    const outer = segment.radiusOuter * boardRadius;

    // For bulls, create a circle
    if (segment.id === "double-bull" || segment.id === "single-bull") {
      return new THREE.RingGeometry(inner, outer, 32);
    }

    return createSectorGeometry(
      inner,
      outer,
      segment.angleStart,
      segment.angleEnd,
      16
    );
  }, [segment, boardRadius]);

  const hoverColor = useMemo(() => getHoverColor(segment), [segment]);

  return (
    <mesh
      geometry={geometry}
      onPointerEnter={(e) => {
        e.stopPropagation();
        if (!disabled) onPointerEnter();
      }}
      onPointerLeave={(e) => {
        e.stopPropagation();
        onPointerLeave();
      }}
      onClick={(e) => {
        e.stopPropagation();
        if (!disabled) onClick();
      }}
    >
      <meshBasicMaterial
        color={hoverColor}
        transparent
        opacity={isHovered ? 0.4 : 0}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
});

// Separate tooltip component - rendered outside the segment to prevent click blocking
const HoverTooltip = memo(function HoverTooltip({
  segment,
  boardRadius,
}: {
  segment: DartboardSegment;
  boardRadius: number;
}) {
  const hoverColor = getHoverColor(segment);
  
  // Position tooltip at center of screen, above the board
  const tooltipPosition = useMemo(() => {
    return new THREE.Vector3(0, -1.7, 0.5);
  }, []);

  return (
    <Html position={tooltipPosition} center style={{ pointerEvents: "none" }}>
      <div
        style={{
          background: "rgba(0, 0, 0, 0.9)",
          color: hoverColor,
          padding: "8px 16px",
          borderRadius: "8px",
          fontSize: "20px",
          fontWeight: "bold",
          whiteSpace: "nowrap",
          border: `2px solid ${hoverColor}`,
          boxShadow: `0 0 20px ${hoverColor}60`,
          pointerEvents: "none",
          userSelect: "none",
        }}
      >
        {segment.label}
        <span style={{ opacity: 0.6, marginLeft: "8px", fontSize: "14px" }}>
          = {segment.score * segment.multiplier}
        </span>
      </div>
    </Html>
  );
});

// Dartboard texture background - memoized
const DartboardTexture = memo(function DartboardTexture({
  radius,
}: {
  radius: number;
}) {
  const texture = useTexture("/models/Dartboard/dartboard.jpg");

  return (
    <mesh>
      <circleGeometry args={[radius, 64]} />
      <meshBasicMaterial map={texture} side={THREE.FrontSide} />
    </mesh>
  );
});

// Main dartboard scene - memoized
const DartboardScene = memo(function DartboardScene({
  onSegmentClick,
  disabled,
}: {
  onSegmentClick: (score: number, multiplier: Multiplier) => void;
  disabled: boolean;
}) {
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);
  const boardRadius = 2;

  // memoize callbacks to prevent re-renders
  const handlePointerEnter = useCallback(
    (id: string) => () => setHoveredSegment(id),
    []
  );
  const handlePointerLeave = useCallback(() => setHoveredSegment(null), []);
  const handleClick = useCallback(
    (score: number, multiplier: Multiplier) => () =>
      onSegmentClick(score, multiplier),
    [onSegmentClick]
  );

  // find hovered segment for tooltip
  const hoveredSegmentData = useMemo(
    () => DARTBOARD_SEGMENTS.find((s) => s.id === hoveredSegment),
    [hoveredSegment]
  );

  return (
    <>
      {/* Ambient lighting */}
      <ambientLight intensity={1} />

      {/* Dartboard texture */}
      <Suspense
        fallback={
          <mesh>
            <circleGeometry args={[boardRadius, 64]} />
            <meshBasicMaterial color="#1a1a1a" />
          </mesh>
        }
      >
        <DartboardTexture radius={boardRadius} />
      </Suspense>


      <group position={[-0.01, 0.08, 0]} scale={1.10}>
        {DARTBOARD_SEGMENTS.map((segment) => (
          <SegmentOverlay
            key={segment.id}
            segment={segment}
            boardRadius={boardRadius}
            isHovered={hoveredSegment === segment.id}
            onPointerEnter={handlePointerEnter(segment.id)}
            onPointerLeave={handlePointerLeave}
            onClick={handleClick(segment.score, segment.multiplier)}
            disabled={disabled}
          />
        ))}
      </group>

      {/* Tooltip rendered at center, above the board */}
      {hoveredSegmentData && (
        <HoverTooltip segment={hoveredSegmentData} boardRadius={boardRadius} />
      )}

      {/* Orbit controls for viewing */}
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        minDistance={4}
        maxDistance={7}
        enableRotate={false}
      />
    </>
  );
});

// Main exported component - memoized to prevent parent re-renders from affecting it
const InteractiveDartboard = memo(function InteractiveDartboard({
  onSegmentClick,
  disabled = false,
}: DartboardProps) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        minHeight: "500px",
        borderRadius: "16px",
        overflow: "hidden",
        background: "transparent",
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        style={{ 
          cursor: disabled ? "not-allowed" : "crosshair",
          background: "transparent",
        }}
        gl={{ alpha: true }}
      >
        <DartboardScene onSegmentClick={onSegmentClick} disabled={disabled} />
      </Canvas>
    </div>
  );
});

export default InteractiveDartboard;
