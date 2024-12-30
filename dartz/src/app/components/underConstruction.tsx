"use client";

import React from "react";

export const UnderConstruction: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <div className="relative group">
      {/* Content under the overlay */}
      <div className="opacity-50 pointer-events-none">{children}</div>

      {/* Compact Overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 text-white rounded-md">
        <div className="text-center p-2">
          <div className="text-sm font-bold tracking-wide mb-1 group-hover:animate-pulse">
            🚧 Under Construction 🚧
          </div>
          <p className="text-xs">Coming soon!</p>
        </div>
      </div>
    </div>
  );
};
