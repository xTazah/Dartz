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
  
  // Settings state
  const [dartColor, setDartColor] = useState(user?.dartColor ?? "#C0C0C0");
  const [allowNoAuth, setAllowNoAuth] = useState(user?.allowNoAuth ?? false);
  
  // Original values to detect changes
  const [originalDartColor, setOriginalDartColor] = useState(user?.dartColor ?? "#C0C0C0");
  const [originalAllowNoAuth, setOriginalAllowNoAuth] = useState(user?.allowNoAuth ?? false);
  
  const [isSaving, setIsSaving] = useState(false);
  const [showSaved, setShowSaved] = useState(false);

  // Calculate if there are unsaved changes
  const hasChanges = dartColor !== originalDartColor || allowNoAuth !== originalAllowNoAuth;

  // Update state when user data loads
  useEffect(() => {
    if (user) {
      setDartColor(user.dartColor ?? "#C0C0C0");
      setAllowNoAuth(user.allowNoAuth ?? false);
      setOriginalDartColor(user.dartColor ?? "#C0C0C0");
      setOriginalAllowNoAuth(user.allowNoAuth ?? false);
    }
  }, [user]);

  // Browser warning for unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasChanges]);

  const handleColorChange = (color: string) => {
    setDartColor(color);
    setShowSaved(false);
  };

  const handleToggleNoAuth = () => {
    setAllowNoAuth(!allowNoAuth);
    setShowSaved(false);
  };

  const handleSave = async () => {
    if (!user?.id) return;

    setIsSaving(true);
    try {
      const service = new PlayerService();
      await service.updateAllSettings(user.id, dartColor, allowNoAuth);
      
      // Update user context with new values
      if (context?.setUser) {
        context.setUser({
          ...user,
          dartColor,
          allowNoAuth,
        });
      }
      
      // Update original values
      setOriginalDartColor(dartColor);
      setOriginalAllowNoAuth(allowNoAuth);
      
      setShowSaved(true);
      
      setTimeout(() => setShowSaved(false), 3000);
    } catch (error) {
      toast.error("Failed to save settings");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={styles.settingsContainer}>
      <div className={styles.settingsHeader}>
        <h1 className={styles.settingsTitle}>
          <Cog6ToothIcon className="w-6 h-6" />
          Settings
        </h1>
        <p className={styles.settingsSubtitle}>
          Customize your Dartz experience
        </p>
      </div>

      {/* Dart Appearance Section */}
      <div className={styles.settingsSection}>
        <h2 className={styles.sectionTitle}>Dart Appearance</h2>
        <p className={styles.sectionDescription}>
          Choose a color for your darts that will be displayed in game lobbies.
        </p>
        
        <DartColorPicker
          selectedColor={dartColor}
          onColorChange={handleColorChange}
        />
      </div>

      {/* Privacy & Security Section */}
      <div className={styles.settingsSection}>
        <h2 className={styles.sectionTitle}>Privacy & Security</h2>
        <p className={styles.sectionDescription}>
          Control how others can interact with your account.
        </p>
        
        <div className={styles.settingRow}>
          <div className={styles.settingInfo}>
            <h4 className={styles.settingLabel}>Allow No-Auth Local Players</h4>
            <p className={styles.settingHint}>
              When enabled, friends can add you as a local player without entering your password. 
              Useful for in-person games where multiple players share one device.
            </p>
            <p className={`${styles.settingHint} ${styles.warningHint}`}>
              ⚠️ Only works for friends. Enable at your own risk.
            </p>
          </div>
          <button 
            className={`${styles.toggleSwitch} ${allowNoAuth ? styles.active : ""}`}
            onClick={handleToggleNoAuth}
          >
            <div className={styles.toggleKnob} />
          </button>
        </div>
      </div>

      {/* Floating Save Bar */}
      {hasChanges && (
        <div className={styles.floatingSaveBar}>
          <span className={styles.unsavedText}>You have unsaved changes</span>
          <button
            className={styles.saveButton}
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      )}

      {showSaved && (
        <div className={styles.floatingSaveBar}>
          <div className={styles.savedMessage}>
            <CheckCircleIcon className="w-5 h-5" />
            Changes saved successfully!
          </div>
        </div>
      )}
    </div>
  );
}
