import React, { useRef, useMemo } from "react";
import { useLoader } from "@react-three/fiber";
import { OBJLoader, MTLLoader } from "three-stdlib";
import * as THREE from "three";

interface DartModelProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  color?: string; // Hex color code for dart customization
}

/**
 * Renders the actual dart 3D model from OBJ file with materials
 * Color prop applies a custom color to the dart barrel
 */
export default function DartModel({ position, rotation = [0, 0, 0], color }: DartModelProps) {
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
  
  // Clone to avoid sharing between instances and apply color
  const clonedObj = useMemo(() => {
    const clone = obj.clone();
    // Apply color to mesh materials
    clone.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const material = (child.material as THREE.Material).clone();
        // Apply custom color if provided
        if (color && material instanceof THREE.MeshPhongMaterial) {
          material.color = new THREE.Color(color);
          material.emissive = new THREE.Color(color).multiplyScalar(0.1);
        } else if (color && material instanceof THREE.MeshStandardMaterial) {
          material.color = new THREE.Color(color);
        } else if (color && material instanceof THREE.MeshBasicMaterial) {
          material.color = new THREE.Color(color);
        }
        child.material = material;
      }
    });
    return clone;
  }, [obj, color]);

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
