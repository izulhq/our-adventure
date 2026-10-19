"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import DuoFilter from "@/components/DuoFilter";
import Sheet from "@/components/Sheet";
import { DUO, Place, fetchPlaces, newestFirst } from "@/services/places";

type Photo = Place & { src: string };

export default function Gallery({ repoPhotoIds }: { repoPhotoIds: string[] }) {
  const [places, setPlaces] = useState<Place[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [hidden, setHidden] = useState<string[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);

  const load = () =>
    fetchPlaces()
      .then((p) => {
        setPlaces(p);
        setFailed(false);
      })
      .catch(() => setFailed(true));
  useEffect(() => {
    load();
  }, []);

  // Uploaded photo first, else the one committed to public/images
  const photos = useMemo<Photo[]>(
    () =>
      (places ?? [])
        .filter((p) => p.list === "map" && (p.image || repoPhotoIds.includes(p.id)))
        .sort(newestFirst)
        .map((p) => ({ ...p, src: p.image || `/images/${p.id}.jpg` })),
    [places, repoPhotoIds]
  );
  const shown = photos.filter((p) => !hidden.includes(p.group));

  const index = shown.findIndex((p) => p.id === openId);
  const current = index >= 0 ? shown[index] : null;
  const step = (by: number) => setOpenId(shown[(index + by + shown.length) % shown.length].id);

  useEffect(() => {
    if (!current) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const who = (p: Place) => DUO.find((d) => d.group === p.group);

  return (
    <main className="gallery">
      <div className="gallery-top">
        <div>
          <Link href="/" className="btn">
            Back to the map
          </Link>
          <header className="gallery-title sticker">
            <h1>our photos</h1>
            <p>
              {!places
                ? failed
                  ? "Couldn't load the photos. Check your connection and try again."
                  : "finding our photos…"
                : `${photos.length} photos from our trips`}
            </p>
          </header>
          {failed && !places && (
            <button type="button" className="btn btn-ink" onClick={load}>
              Try again
            </button>
          )}
        </div>
        {photos.length > 0 && (
          <DuoFilter
            places={photos}
            hidden={hidden}
            onToggle={(g) => setHidden((h) => (h.includes(g) ? h.filter((x) => x !== g) : [...h, g]))}
          />
        )}
      </div>

      {places && shown.length === 0 && (
        <p className="sheet-empty">
          {photos.length === 0 ? "No photos yet." : "No photos for this filter. Tap a circle to show it again."}
        </p>
      )}

      <ul className="photo-grid">
        {shown.map((p, i) => (
          <li key={p.id}>
            <button
              type="button"
              className="photo sticker"
              // Small fixed tilt per position, like stickers pressed on by hand
              style={{ "--r": `${((i * 7) % 5) - 2}deg`, "--c": who(p)?.color ?? "#fff" } as React.CSSProperties}
              onClick={() => setOpenId(p.id)}
            >
              <span className="photo-frame">
                <Image
                  src={p.src}
                  alt={`photo at ${p.name}`}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1100px) 33vw, 280px"
                />
              </span>
              <span className="photo-name">
                <span className="photo-dot" aria-hidden="true" />
                {p.name}
              </span>
            </button>
          </li>
        ))}
      </ul>

      <Sheet open={!!current} onClose={() => setOpenId(null)} title={current?.name ?? ""} className="sheet-wide">
        {current && (
          <div className="lightbox">
            {/* Full original, not the resized thumbnail */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={current.src} alt={`photo at ${current.name}`} />
            {current.description && <p>{current.description}</p>}
            {current.address && <p className="lightbox-address">{current.address}</p>}
            <div className="lightbox-nav">
              <span className="who" style={{ "--who": who(current)?.color ?? "#fff" } as React.CSSProperties}>
                {current.group}
              </span>
              {shown.length > 1 && (
                <>
                  <span className="lightbox-count">
                    {index + 1} of {shown.length}
                  </span>
                  <button type="button" className="btn" onClick={() => step(-1)}>
                    Previous
                  </button>
                  <button type="button" className="btn" onClick={() => step(1)}>
                    Next
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </Sheet>
    </main>
  );
}
