'use client'
import { useState, useEffect } from "react";
import { SunIcon, MoonIcon } from "@heroicons/react/24/solid";
import { Button, Tooltip } from "@nextui-org/react";
import React from "react";

export default function ThemeSwitcher () {
  const [darkMode, setDarkMode] = useState<boolean>();

  const toggleDarkMode = () => setDarkMode(!darkMode);

  return (
    <Tooltip
      showArrow={true}
      placement="bottom-end"
      content={
        <div className="text-small">
          Switch to {!darkMode ? "Dark" : "Light"} Mode
        </div>
      }
    >
      <Button
        data-hover="true"
        isIconOnly
        onClick={toggleDarkMode}
        color="secondary"
        aria-label="Toggle theme"
      >
        {darkMode ? (
          <SunIcon className="w-6 h-6" />
        ) : (
          <MoonIcon className="w-6 h-6" />
        )}
      </Button>
    </Tooltip>
  );
};
