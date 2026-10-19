// One-time copy of the old Google Sheet (map + wishlist tabs) into Redis.
//   vercel env pull .env.local
//   node --env-file=.env.local scripts/import-sheets.mjs          (--force to overwrite)
// Needs NEXT_PUBLIC_SHEET_ID / NEXT_PUBLIC_SHEET_TAB / NEXT_PUBLIC_SHEET_TAB_WISHLIST in .env.local.
import { Redis } from "@upstash/redis";
import { parseCSV } from "../src/services/googleSheets.ts";

const redis = Redis.fromEnv();
if ((await redis.hlen("places")) > 0 && !process.argv.includes("--force")) {
  console.error("Database already has places. Re-run with --force to overwrite them with the sheet.");
  process.exit(1);
}

const sheetId = process.env.NEXT_PUBLIC_SHEET_ID;
const tabs = {
  map: process.env.NEXT_PUBLIC_SHEET_TAB || "Sheet1",
  wishlist: process.env.NEXT_PUBLIC_SHEET_TAB_WISHLIST,
};

const places = {};
for (const [list, tab] of Object.entries(tabs)) {
  if (!tab) continue;
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(tab)}`;
  const res = await fetch(url);
  if (!res.ok || !res.headers.get("content-type")?.includes("csv")) {
    throw new Error(`Sheet tab "${tab}" didn't return CSV (HTTP ${res.status}). Is the sheet public?`);
  }
  const rows = parseCSV(await res.text());
  for (const row of rows) {
    // Map IDs stay as-is (old photos live at public/images/{id}.jpg);
    // wishlist IDs get a "w" prefix so the two tabs can't collide.
    const id = !row.id ? crypto.randomUUID().slice(0, 8) : list === "wishlist" ? `w${row.id}` : row.id;
    if (places[id]) throw new Error(`Duplicate ID "${row.id}" in tab "${tab}"`);
    places[id] = { ...row, id, list };
  }
  console.log(`${tab} → ${list}: ${rows.length} rows`);
}

if (Object.keys(places).length === 0) throw new Error("Nothing to import");
await redis.hset("places", places);
console.log(`Imported ${Object.keys(places).length} places`);
