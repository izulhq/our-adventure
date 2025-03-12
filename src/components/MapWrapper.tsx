"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { SheetMarker, fetchGoogleSheetsData } from "@/services/googleSheets";

// Dynamic import of the Map component to prevent SSR issues with Leaflet
const LeafletMap = dynamic(() => import("@/components/Maps"), {
  ssr: false,
  loading: () => (
    <div className="h-screen w-full flex items-center justify-center">
      <p className="text-lg">Loading map...</p>
    </div>
  ),
});

interface MapWrapperProps {
  sheetId: string;
  sheetTab: string;
}

export default function MapWrapper({ sheetId, sheetTab }: MapWrapperProps) {
  const [markers, setMarkers] = useState<SheetMarker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await fetchGoogleSheetsData(sheetId, sheetTab);

        if (data.length === 0) {
          setError("No valid data found in the Google Sheet");
        } else {
          setMarkers(data);
          setError(null);
        }
      } catch (err) {
        console.error("Failed to load sheet data:", err);
        setError("Failed to load data from Google Sheets");
      } finally {
        setLoading(false);
      }
    };

    loadData();

    // Optional: Add periodic refresh
    const intervalId = setInterval(loadData, 300000); // Refresh every 5 minutes

    return () => clearInterval(intervalId);
  }, [sheetId, sheetTab]);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <p className="text-lg">Loading data from Google Sheets...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <div className="bg-red-50 p-4 rounded-lg border border-red-200 max-w-md">
          <p className="text-red-700 font-medium">{error}</p>
          <p className="text-red-600 mt-2">
            Please check that your Google Sheet is publicly accessible and
            contains valid data.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return <LeafletMap markers={markers} />;
}
