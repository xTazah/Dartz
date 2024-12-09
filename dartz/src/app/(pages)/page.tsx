'use client'

import Image from "next/image";
import BackNavigation from "../components/backNavigation/backNavigation";
import Dashboard from "../components/dashboard/dashboard";
import React from "react";

export default function Home() { 
  return (
    <main className="pb-7">
     <div>
      <Dashboard />
     </div>
    </main>
  );
}
