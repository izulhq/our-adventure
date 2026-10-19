export interface Place {
  id: string;
  list: "map" | "wishlist";
  group: string;
  icon: string; // legacy marker image from the sheet; pins are now drawn from `group`
  customSize: number; // legacy, unused
  name: string;
  latitude: number;
  longitude: number;
  description: string;
  address: string;
  image: string; // photo URL (Vercel Blob, or an older Drive/other link)
}

// Who's been here, in Venn order: left circle, overlap, right circle.
export const DUO = [
  { group: "ijul been here", label: "ijul", initial: "i", color: "#D7B4F3" },
  { group: "both been here", label: "both", initial: "&", color: "#2EE86F" },
  { group: "dapta been here", label: "dapta", initial: "d", color: "#34D1FF" },
] as const;

export async function fetchPlaces(): Promise<Place[]> {
  const res = await fetch("/api/places", { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load places: ${res.status}`);
  return res.json();
}
