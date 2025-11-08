"use client";
import MapWrapper from "@/components/MapWrapper";
import NavBar from "@/components/NavBar";
import { useState } from "react";

export default function Home() {
  const [view, setView] = useState("home");

  const sheetId = process.env.NEXT_PUBLIC_SHEET_ID ?? "";
  const sheetTab = process.env.NEXT_PUBLIC_SHEET_TAB ?? "Sheet1";

  return (
    <div className="h-screen w-full">
      <MapWrapper sheetId={sheetId} sheetTab={sheetTab} />
      <NavBar view={view} setView={setView} />
    </div>
  );
}
