"use client";
import MapWrapper from "@/components/MapWrapper";
import NavBar from "@/components/NavBar";
import { useState } from "react";

export default function Home() {
  const [view, setView] = useState("home");

  return (
    <div className="h-screen w-full">
      <MapWrapper
        sheetId="1VNLNWbg5-ENYoQGQIjDT-W0OotmR_WmQy3S9WxMz7Ww"
        sheetTab="Sheet1"
      />
      <NavBar view={view} setView={setView} />
    </div>
  );
}
