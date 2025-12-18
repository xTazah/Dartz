"use client";

import React, { useContext, useState, useEffect } from "react";
import { UserContext } from "@/app/components/userProvider/userProvider";
import DartColorPicker from "@/app/components/settings/DartColorPicker";
import PlayerService from "@/app/services/backend/playerService";
import styles from "@/app/styles/settings.module.scss";
import { toast } from "sonner";
import { Cog6ToothIcon, CheckCircleIcon } from "@heroicons/react/24/solid";

export default function SettingsPage() {
  const context = useContext(UserContext);
  const user = context?.user;
  
  const [selectedColor, setSelectedColor] = useState(user?.dartColor ?? "#C0C0C0");
  const [isSaving, setIsSaving] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Update selected color when user data loads
  useEffect(() => {
    if (user?.dartColor) {
      setSelectedColor(user.dartColor);
    }
  }, [user?.dartColor]);

  const handleColorChange = (color: string) => {
    setSelectedColor(color);
    setHasChanges(color !== (user?.dartColor ?? "#C0C0C0"));
    setShowSaved(false);
  };

  const handleSave = async () => {
    if (!user?.id) return;

    setIsSaving(true);
    try {
      const service = new PlayerService();
      await service.updateDartColor(user.id, selectedColor);
      
      // Update user context with new color
      if (context?.setUser) {
        context.setUser({
          ...user,
          dartColor: selectedColor,
        });
      }
      
      setShowSaved(true);
      setHasChanges(false);
      toast.success("Dart color updated!");
      
      // Hide saved message after 3 seconds
      setTimeout(() => setShowSaved(false), 3000);
    } catch (error) {
      toast.error("Failed to update dart color");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={styles.settingsContainer}>
      <div className={styles.settingsHeader}>
        <h1 className={styles.settingsTitle}>
          <Cog6ToothIcon className="w-7 h-7" style={{ display: "inline", marginRight: "8px" }} />
          Settings
        </h1>
        <p className={styles.settingsSubtitle}>
          Customize your Dartz experience
        </p>
      </div>

      <div className={styles.settingsSection}>
        <h2 className={styles.sectionTitle}>
          🎯 Dart Appearance
        </h2>
        
        <DartColorPicker
          selectedColor={selectedColor}
          onColorChange={handleColorChange}
        />

        {hasChanges && (
          <button
            className={styles.saveButton}
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        )}

        {showSaved && (
          <div className={styles.savedMessage}>
            <CheckCircleIcon className="w-5 h-5" />
            Changes saved successfully!
          </div>
        )}
      </div>
    </div>
  );
}
