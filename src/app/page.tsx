"use client";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import DuoFilter from "@/components/DuoFilter";
import Sheet from "@/components/Sheet";
import { Place, fetchPlaces } from "@/services/places";

// Leaflet needs `window`, so the map only renders in the browser
const LeafletMap = dynamic(() => import("@/components/Maps"), { ssr: false });

const MORE = [
  { href: "https://gis.izulhq.me/klimatologi", label: "peta klimatologi" },
  { href: "https://gis.izulhq.me/gsheets", label: "leaflet x gsheets" },
  { href: "https://github.com/izulhq/our-adventure", label: "source code" },
];

export default function Home() {
  const [places, setPlaces] = useState<Place[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [hidden, setHidden] = useState<string[]>([]);
  const [sheet, setSheet] = useState<"wishlist" | "about" | null>(null);

  const load = () =>
    fetchPlaces()
      .then((p) => {
        setPlaces(p);
        setFailed(false);
      })
      .catch(() => setFailed(true));

  useEffect(() => {
    load();
    const id = setInterval(load, 5 * 60 * 1000); // pick up places added on another device
    return () => clearInterval(id);
  }, []);

  // Memoised: a new array would rebuild the whole map on every render
  const visited = useMemo(() => places?.filter((p) => p.list === "map") ?? [], [places]);
  const wishlist = places?.filter((p) => p.list === "wishlist") ?? [];

  const toggle = (group: string) =>
    setHidden((h) => (h.includes(group) ? h.filter((g) => g !== group) : [...h, group]));

  return (
    <main className="relative h-dvh w-full overflow-hidden">
      {places && <LeafletMap markers={visited} hidden={hidden} />}

      <header className="masthead sticker">
        <h1>ijul &amp; dapta</h1>
        <p>
          {!places
            ? "finding our places…"
            : visited.length === 0
              ? "no places yet"
              : `${visited.length} places so far`}
        </p>
      </header>

      <nav className="top-actions" aria-label="More">
        <button type="button" className="btn" onClick={() => setSheet("wishlist")}>
          wishlist
        </button>
        <Link href="/gallery" className="btn">
          photos
        </Link>
        <button type="button" className="btn" onClick={() => setSheet("about")}>
          about
        </button>
      </nav>

      {places && visited.length > 0 && (
        <DuoFilter places={visited} hidden={hidden} onToggle={toggle} className="duo-float" />
      )}

      {failed && !places && (
        <div className="alert sticker" role="alert">
          Couldn&apos;t load the places. Check your connection, then try again.
          <br />
          <button type="button" className="btn btn-ink" onClick={load}>
            Try again
          </button>
        </div>
      )}

      <Sheet open={sheet === "wishlist"} onClose={() => setSheet(null)} title="places we want to go">
        {wishlist.length > 0 ? (
          <ul className="wish-list mt-3">
            {wishlist.map((w) => (
              <li key={w.id}>
                <h3>{w.name}</h3>
                {w.description && <p>{w.description}</p>}
              </li>
            ))}
          </ul>
        ) : (
          <p className="sheet-empty">Nothing on the list yet.</p>
        )}
      </Sheet>

      <Sheet open={sheet === "about"} onClose={() => setSheet(null)} title="what the fuck is this (?!)">
        <div className="about">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/cover.png" alt="ijul and dapta, three photos side by side" className="about-cover" />
          <p>
            so basically, this is our interactive adventure map. whenever and wherever we go, we
            save the spot: its name, where it is, a little note and a photo, and it shows up here.
            we also keep a wishlist of places we want to go next.
          </p>
          <p>made with love by us &lt;3</p>
          <div className="about-more">
            <a href="https://gis.izulhq.me" aria-label="ijul's GIS lab">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="" />
            </a>
            <ul>
              {MORE.map((m) => (
                <li key={m.href}>
                  <a href={m.href}>{m.label}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Sheet>
    </main>
  );
}
