import React, { useRef, useMemo } from "react";
import { useLoader } from "@react-three/fiber";
import { OBJLoader, MTLLoader } from "three-stdlib";
import * as THREE from "three";

interface DartModelProps {
  position: [number, number, number];
  rotation?: [number, number, number];
}

/**
 * Renders the actual dart 3D model from OBJ file with materials
 */
export default function DartModel({ position, rotation = [0, 0, 0] }: DartModelProps) {
  const groupRef = useRef<THREE.Group>(null);

  // Load MTL materials first
  const materials = useLoader(MTLLoader, "/models/Dart/11750_throwing_dart_v1_L3.mtl");
  
  // Set the texture path for the materials
  useMemo(() => {
    materials.preload();
  }, [materials]);
  
  // Load the OBJ model with materials
  const obj = useLoader(OBJLoader, "/models/Dart/11750_throwing_dart_v1_L3.obj", (loader) => {
    loader.setMaterials(materials);
  });
  
  // Clone to avoid sharing between instances
  const clonedObj = useMemo(() => {
    const clone = obj.clone();
    // Ensure materials are applied
    clone.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.material = (child.material as THREE.Material).clone();
      }
    });
    return clone;
  }, [obj]);

  // Default rotation to point the dart into the board
  const defaultRotation: [number, number, number] = [
    -50, // Point forward
    0,
    0,
  ];

  const finalRotation: [number, number, number] = [
    defaultRotation[0] + rotation[0],
    defaultRotation[1] + rotation[1],
    defaultRotation[2] + rotation[2],
  ];

  return (
    <group ref={groupRef} position={position} rotation={finalRotation} scale={0.1}>
      <primitive object={clonedObj} />
    </group>
  );
}
