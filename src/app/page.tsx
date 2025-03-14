"use client";
import MapWrapper from "@/components/MapWrapper";
import NavBar from "@/components/NavBar";
import { useState } from "react";

export default function Home() {
  const [view, setView] = useState("home");

  return (
    <div className="h-screen w-full">
      <MapWrapper
        sheetId="1ar8gpojbDlqihP_DcMB0ut-S-1BSwHzybnRynIu5tlg"
        sheetTab="Sheet1"
      />
      <NavBar view={view} setView={setView} />
    </div>
  );
}
