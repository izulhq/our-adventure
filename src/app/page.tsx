"use client";
import MapWrapper from "@/components/MapWrapper";

export default function Home() {
  return (
    <div className="h-screen w-full">
      <MapWrapper
        sheetId="1VNLNWbg5-ENYoQGQIjDT-W0OotmR_WmQy3S9WxMz7Ww"
        sheetTab="Sheet1"
      />
    </div>
  );
}
