"use client";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import DuoFilter from "@/components/DuoFilter";
import PlaceEditor from "@/components/PlaceEditor";
import { DUO, Place, fetchPlaces, newestFirst } from "@/services/places";

const LeafletMap = dynamic(() => import("@/components/Maps"), { ssr: false });
const TIGHT = { topLeft: [24, 24], bottomRight: [24, 24] } as { topLeft: [number, number]; bottomRight: [number, number] };

type View = "overview" | "places" | "wishlist";

const BLANK: Place = {
  id: "",
  list: "map",
  group: "both been here",
  icon: "",
  customSize: 25,
  name: "",
  latitude: 0,
  longitude: 0,
  description: "",
  address: "",
  image: "",
};

const checkPassword = (password: string) =>
  fetch("/api/places", { method: "HEAD", headers: { "x-admin-password": password } }).then((r) => r.ok);

// Phone photos are several MB; shrink to a web-sized JPEG before upload
// (also keeps it under Vercel's 4.5 MB request limit).
async function toJpeg(file: File, maxSide = 1600): Promise<Blob> {
  const img = await createImageBitmap(file);
  const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(img.width * scale);
  canvas.height = Math.round(img.height * scale);
  canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Could not read photo"))), "image/jpeg", 0.85)
  );
}

export default function Admin() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState<boolean | null>(null); // null while checking a saved password
  const [places, setPlaces] = useState<Place[]>([]);
  const [view, setView] = useState<View>("overview");
  const [draft, setDraft] = useState<Place | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [hidden, setHidden] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const saving = status === "Saving…";
  const mainRef = useRef<HTMLElement>(null);

  // Each view starts at the top, not wherever the previous list was scrolled to
  useEffect(() => {
    mainRef.current?.scrollTo(0, 0); // braces: newer browsers return a Promise, which React would call as cleanup
  }, [view, draft?.id, !draft]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchPlaces()
      .then(setPlaces)
      .catch((err) => setStatus(`Error: ${err.message}`));
    let saved = "";
    try {
      saved = localStorage.getItem("adminPassword") ?? "";
    } catch {}
    if (!saved) return setAuthed(false);
    setPassword(saved);
    checkPassword(saved)
      .then(setAuthed)
      .catch(() => setAuthed(false));
  }, []);

  useEffect(() => {
    if (!status || saving) return;
    const id = setTimeout(() => setStatus(""), 4000);
    return () => clearTimeout(id);
  }, [status, saving]);

  const visited = useMemo(() => places.filter((p) => p.list === "map").sort(newestFirst), [places]);
  const wishlist = useMemo(() => places.filter((p) => p.list === "wishlist").sort(newestFirst), [places]);
  // Wishlist places from the old sheet have no location (0,0); keep them off the maps
  const located = useMemo(() => places.filter((p) => p.latitude || p.longitude), [places]);

  const go = (v: View) => {
    setView(v);
    setDraft(null);
  };
  const open = (place: Place) => {
    setDraft(place);
    setPhoto(null);
  };
  const close = () => {
    setDraft(null);
    setPhoto(null);
  };
  const showOnly = (group: string) => {
    setHidden(DUO.map((d) => d.group).filter((g) => g !== group));
    go("places");
  };

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    const ok = await checkPassword(password).catch(() => false);
    setAuthed(ok);
    if (!ok) return setStatus("Error: That password didn't work. Check it and try again.");
    setStatus("");
    try {
      localStorage.setItem("adminPassword", password);
    } catch {}
  }

  function signOut() {
    try {
      localStorage.removeItem("adminPassword");
    } catch {}
    setPassword("");
    setAuthed(false);
    close();
  }

  async function save() {
    if (!draft) return;
    if (draft.list === "map" && !draft.latitude && !draft.longitude) {
      return setStatus("Error: Tap the map to set where this place is.");
    }
    setStatus("Saving…");
    try {
      const body = new FormData();
      body.append("place", JSON.stringify(draft));
      if (photo) body.append("photo", await toJpeg(photo), "photo.jpg");
      const res = await fetch("/api/places", {
        method: "POST",
        headers: { "x-admin-password": password },
        body,
      });
      const saved: Place & { error?: string } = await res.json();
      if (!res.ok) throw new Error(saved.error ?? `HTTP ${res.status}`);
      setPlaces((ps) =>
        ps.some((p) => p.id === saved.id) ? ps.map((p) => (p.id === saved.id ? saved : p)) : [...ps, saved]
      );
      close();
      setStatus(`Saved ${saved.name}`);
    } catch (err) {
      setStatus(`Error: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  async function remove() {
    if (!draft?.id || !confirm(`Delete ${draft.name}? This can't be undone.`)) return;
    setStatus("Saving…");
    const res = await fetch(`/api/places?id=${encodeURIComponent(draft.id)}`, {
      method: "DELETE",
      headers: { "x-admin-password": password },
    });
    if (!res.ok) return setStatus(`Error: ${(await res.json()).error ?? res.status}`);
    setPlaces((ps) => ps.filter((p) => p.id !== draft.id));
    close();
    setStatus(`Deleted ${draft.name}`);
  }

  const toast = status && !saving && (
    <p className={`toast sticker ${status.startsWith("Error") ? "toast-error" : ""}`} role="status">
      {status.replace(/^Error: /, "")}
    </p>
  );

  if (authed === null) return <main className="login" aria-busy="true" />;

  if (!authed) {
    return (
      <main className="login">
        {toast}
        <form className="card login-card space-y-4" onSubmit={signIn}>
          <h1>editor</h1>
          <p className="editor-hint">Sign in to add and edit places on the map.</p>
          <label className="field">
            <span>Admin password</span>
            <input
              className="input"
              type="password"
              autoComplete="current-password"
              required
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          <button type="submit" className="btn btn-ink">
            Sign in
          </button>
        </form>
      </main>
    );
  }

  const q = query.trim().toLowerCase();
  const list = (view === "wishlist" ? wishlist : visited).filter(
    (p) =>
      (view === "wishlist" || !hidden.includes(p.group)) &&
      (!q || [p.name, p.description, p.address].some((s) => s.toLowerCase().includes(q)))
  );
  const nav: { id: View; label: string; count?: number }[] = [
    { id: "overview", label: "Overview" },
    { id: "places", label: "Places", count: visited.length },
    { id: "wishlist", label: "Wishlist", count: wishlist.length },
  ];
  const startNew = (patch: Partial<Place> = {}) => open({ ...BLANK, ...patch });

  return (
    <div className="dash">
      {toast}
      <aside className="dash-side">
        <div className="dash-brand">
          ijul &amp; dapta
          <span>editor</span>
        </div>
        <nav className="dash-nav" aria-label="Editor">
          {nav.map((n) => (
            <button
              key={n.id}
              type="button"
              aria-current={view === n.id && !draft ? "page" : undefined}
              onClick={() => go(n.id)}
            >
              {n.label}
              {n.count !== undefined && <span>{n.count}</span>}
            </button>
          ))}
        </nav>
        <div className="dash-foot">
          <a href="/">View the map</a>
          <button type="button" onClick={signOut}>
            Sign out
          </button>
        </div>
      </aside>

      <main className="dash-main" ref={mainRef}>
        {draft ? (
          <>
            <header className="dash-head">
              <div>
                <button type="button" className="crumb" onClick={close}>
                  {draft.list === "wishlist" ? "Wishlist" : "Places"}
                </button>
                <h1>{draft.id ? draft.name || "untitled" : "new place"}</h1>
              </div>
            </header>
            <PlaceEditor
              place={draft}
              places={located}
              photo={photo}
              saving={saving}
              onChange={(patch) => setDraft((d) => d && { ...d, ...patch })}
              onPhoto={setPhoto}
              onSave={save}
              onDelete={remove}
              onCancel={close}
              onSwitch={open}
            />
          </>
        ) : view === "overview" ? (
          <>
            <header className="dash-head">
              <div>
                <h1>overview</h1>
                <p>
                  {visited.length} places so far, {wishlist.length} on the wishlist
                </p>
              </div>
              <button type="button" className="btn btn-ink" onClick={() => startNew()}>
                Add a place
              </button>
            </header>

            <div className="tiles">
              {DUO.map((d) => (
                <button
                  key={d.group}
                  type="button"
                  className="tile sticker"
                  style={{ "--c": d.color } as React.CSSProperties}
                  onClick={() => showOnly(d.group)}
                >
                  <span className="tile-n">{visited.filter((p) => p.group === d.group).length}</span>
                  {d.group}
                </button>
              ))}
              <button type="button" className="tile tile-wish sticker" onClick={() => go("wishlist")}>
                <span className="tile-n">{wishlist.length}</span>
                on the wishlist
              </button>
            </div>

            <div className="overview-grid">
              <section className="card">
                <h2>recently added</h2>
                <PlaceRows places={visited.slice(0, 5)} onOpen={open} compact />
              </section>
              <section className="card map-card">
                <div className="map-frame">
                  <LeafletMap markers={located} fitPadding={TIGHT} onMarkerClick={open} />
                </div>
              </section>
            </div>
          </>
        ) : (
          <>
            <header className="dash-head">
              <div>
                <h1>{view === "wishlist" ? "wishlist" : "places"}</h1>
                <p>
                  {list.length === (view === "wishlist" ? wishlist : visited).length
                    ? `${list.length} in total`
                    : `${list.length} of ${(view === "wishlist" ? wishlist : visited).length} shown`}
                </p>
              </div>
              <button
                type="button"
                className="btn btn-ink"
                onClick={() => startNew(view === "wishlist" ? { list: "wishlist", group: "" } : {})}
              >
                {view === "wishlist" ? "Add to the wishlist" : "Add a place"}
              </button>
            </header>

            <div className="list-tools">
              <label className="field grow">
                <span>Search</span>
                <input
                  className="input"
                  type="search"
                  placeholder="Name, note or address"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </label>
              {view === "places" && (
                <DuoFilter
                  places={visited}
                  hidden={hidden}
                  onToggle={(g) => setHidden((h) => (h.includes(g) ? h.filter((x) => x !== g) : [...h, g]))}
                />
              )}
            </div>

            <section className="card card-flush">
              {list.length > 0 ? (
                <PlaceRows places={list} onOpen={open} />
              ) : (
                <p className="empty">
                  {q ? `Nothing matches “${query}”.` : "Nothing here yet. Add the first one."}
                </p>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}

function PlaceRows({ places, onOpen, compact }: { places: Place[]; onOpen: (p: Place) => void; compact?: boolean }) {
  return (
    <ul className={`rows ${compact ? "rows-compact" : ""}`}>
      {places.map((p) => {
        const duo = DUO.find((d) => d.group === p.group);
        return (
          <li key={p.id}>
            <button type="button" className="row" onClick={() => onOpen(p)}>
              <span className="thumb" style={{ "--c": duo?.color ?? "#fff" } as React.CSSProperties}>
                {duo?.initial ?? "♥"}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.image || `/images/${p.id}.jpg`}
                  alt=""
                  loading="lazy"
                  onError={(e) => (e.currentTarget.style.display = "none")}
                />
              </span>
              <span className="row-main">
                <span className="row-name">{p.name}</span>
                {p.description && <span className="row-note">{p.description}</span>}
              </span>
              {!compact && (
                <>
                  <span className="who" style={{ "--who": duo?.color ?? "#fff" } as React.CSSProperties}>
                    {p.list === "wishlist" ? "wishlist" : (duo?.label ?? p.group)}
                  </span>
                  <span className="row-address">{p.address || "No address"}</span>
                </>
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
