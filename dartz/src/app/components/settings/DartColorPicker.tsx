"use client";

import React, { Suspense, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import DartModel from "../dartboard/DartModel";
import styles from "@/app/styles/settings.module.scss";

// Preset dart colors
const DART_COLOR_PRESETS = [
  { name: "Silver", color: "#C0C0C0" },
  { name: "Gold", color: "#FFD700" },
  { name: "Red", color: "#DC143C" },
  { name: "Blue", color: "#1E90FF" },
  { name: "Green", color: "#32CD32" },
  { name: "Purple", color: "#9370DB" },
  { name: "Orange", color: "#FF8C00" },
  { name: "Pink", color: "#FF69B4" },
];

interface DartColorPickerProps {
  selectedColor: string;
  onColorChange: (color: string) => void;
  showInfo?: boolean;
}

/**
 * DartColorPicker component with 3D preview
 * Can be used in both settings page and signup flow
 */
export default function DartColorPicker({
  selectedColor,
  onColorChange,
  showInfo = false,
}: DartColorPickerProps) {
  const [customColor, setCustomColor] = useState(selectedColor);

  const handlePresetClick = (color: string) => {
    setCustomColor(color);
    onColorChange(color);
  };

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    setCustomColor(color);
    onColorChange(color);
  };

  return (
    <div className={styles.colorPickerContainer}>
      {/* 3D Dart Preview */}
      <div className={styles.dartPreview}>
        <Canvas camera={{ position: [0, 0, 2.5], fov: 45 }}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 5, 5]} intensity={1} />
          <pointLight position={[-5, -5, -5]} intensity={0.5} />
          <Suspense fallback={null}>
            <DartModel
              position={[0, 0, 0]}
              rotation={[0.3, 0.5, 0]}
              color={selectedColor}
            />
          </Suspense>
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            autoRotate
            autoRotateSpeed={2}
          />
        </Canvas>
      </div>

      {/* Color Selection */}
      <div className={styles.colorSelection}>
        <h3 className={styles.colorTitle}>Choose Your Dart Color</h3>
        
        {showInfo && (
          <p className={styles.colorInfo}>
            💡 You can change this later in Settings
          </p>
        )}

        {/* Preset Colors */}
        <div className={styles.colorPresets}>
          {DART_COLOR_PRESETS.map((preset) => (
            <button
              key={preset.name}
              className={`${styles.colorPresetButton} ${
                selectedColor === preset.color ? styles.selected : ""
              }`}
              style={{ backgroundColor: preset.color }}
              onClick={() => handlePresetClick(preset.color)}
              title={preset.name}
            >
              {selectedColor === preset.color && (
                <span className={styles.checkmark}>✓</span>
              )}
            </button>
          ))}
        </div>

        {/* Custom Color Picker */}
        <div className={styles.customColorContainer}>
          <label className={styles.customColorLabel}>
            Custom Color:
            <input
              type="color"
              value={customColor}
              onChange={handleCustomColorChange}
              className={styles.customColorInput}
            />
          </label>
        </div>
      </div>
    </div>
  );
}
