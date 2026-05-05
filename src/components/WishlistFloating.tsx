"use client";
import React, { useEffect, useState } from "react";
import { SheetMarker, fetchGoogleSheetsData } from "@/services/googleSheets";
import { X } from "lucide-react";
import { FaHeart } from "react-icons/fa6";

export default function WishlistFloating({
  isVisible,
  toggleWishlist,
}: {
  isVisible: boolean;
  toggleWishlist: () => void;
}) {
  const [items, setItems] = useState<SheetMarker[]>([]);
  const sheetId = process.env.NEXT_PUBLIC_SHEET_ID || "";
  const sheetTab = process.env.NEXT_PUBLIC_SHEET_TAB_WISHLIST || "";

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!sheetId) return;
      try {
        const data = await fetchGoogleSheetsData(sheetId, sheetTab);
        if (mounted) setItems(data);
        console.log("Wishlist fetched items:", data);
      } catch (e) {
        console.warn("Failed loading wishlist:", e);
      }
    }
    if (isVisible) load();
    return () => {
      mounted = false;
    };
  }, [isVisible, sheetId, sheetTab]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[9998] p-2">
      <div className="max-w-3xl w-full">
        <div className="bg-white/95 border border-gray-200 rounded-lg shadow-xl p-4 pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="justify-start flex gap-2">
              {" "}
              {/* Wishlist Icon and Title */}
              <div className="p-2 rounded-full bg-red-500">
                <FaHeart className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-lg font-semibold">our wishlist</h3>
            </div>
            <button
              onClick={toggleWishlist}
              className="text-sm text-gray-600 hover:text-gray-900 bg-white rounded-full p-1 transition-colors border border-gray-400 hover:border-gray-600"
            >
              <X className="w-5 h-5 text-gray-600 hover:text-black" />
            </button>
          </div>

          <div className="space-y-3 max-h-[60vh] overflow-auto">
            {items.length === 0 ? (
              <div className="text-sm text-gray-600">
                No wishlist items found.
              </div>
            ) : (
              items.map((it) => (
                <div
                  key={it.id || `${it.name}`}
                  className="p-3 border rounded-md bg-white"
                >
                  <div>
                    <div className="font-medium">{it.name}</div>
                  </div>
                  {it.description && (
                    <div className="mt-2 text-sm text-gray-600">
                      {it.description}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
