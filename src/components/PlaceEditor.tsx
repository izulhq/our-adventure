"use client";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { DUO, Place } from "@/services/places";

const LeafletMap = dynamic(() => import("@/components/Maps"), { ssr: false });
const TIGHT = { topLeft: [24, 24], bottomRight: [24, 24] } as { topLeft: [number, number]; bottomRight: [number, number] };

export default function PlaceEditor({
  place,
  places,
  photo,
  saving,
  onChange,
  onPhoto,
  onSave,
  onDelete,
  onCancel,
  onSwitch,
}: {
  place: Place;
  places: Place[]; // everything with a location, shown for context
  photo: File | null;
  saving: boolean;
  onChange: (patch: Partial<Place>) => void;
  onPhoto: (file: File | null) => void;
  onSave: () => void;
  onDelete: () => void;
  onCancel: () => void;
  onSwitch: (place: Place) => void;
}) {
  const preview = useMemo(() => (photo ? URL.createObjectURL(photo) : ""), [photo]);
  useEffect(() => () => URL.revokeObjectURL(preview), [preview]);
  // New upload, else the saved photo, else the pre-database one in public/images
  const src = preview || place.image || (place.id ? `/images/${place.id}.jpg` : "");
  const [broken, setBroken] = useState("");
  const shownPhoto = src && src !== broken ? src : "";

  return (
    <form
      className="edit-grid"
      onSubmit={(e) => {
        e.preventDefault();
        onSave();
      }}
    >
      <section className="card space-y-4">
        <label className="field">
          <span>Name</span>
          <input
            className="input"
            required
            value={place.name}
            onChange={(e) => onChange({ name: e.target.value })}
          />
        </label>

        <fieldset className="field">
          <legend className="field-label mb-1.5">Status</legend>
          <div className="choices">
            {(
              [
                ["map", "been there"],
                ["wishlist", "wishlist"],
              ] as const
            ).map(([value, label]) => (
              <label key={value} className="choice">
                <input
                  type="radio"
                  name="list"
                  checked={place.list === value}
                  onChange={() =>
                    onChange({ list: value, ...(value === "map" && !place.group && { group: DUO[1].group }) })
                  }
                />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        {place.list === "map" && (
          <fieldset className="field">
            <legend className="field-label mb-1.5">Who&apos;s been here</legend>
            <div className="choices">
              {DUO.map((d) => (
                <label key={d.group} className="choice" style={{ "--c": d.color } as React.CSSProperties}>
                  <input
                    type="radio"
                    name="group"
                    checked={place.group === d.group}
                    onChange={() => onChange({ group: d.group })}
                  />
                  <span>{d.label}</span>
                </label>
              ))}
            </div>
          </fieldset>
        )}

        <label className="field">
          <span>Note</span>
          <textarea
            className="input"
            rows={3}
            value={place.description}
            onChange={(e) => onChange({ description: e.target.value })}
          />
        </label>

        <label className="field">
          <span>Address</span>
          <input
            className="input"
            value={place.address}
            onChange={(e) => onChange({ address: e.target.value })}
          />
        </label>

        <label className="photo-drop">
          {shownPhoto && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={shownPhoto} alt="" onError={() => setBroken(shownPhoto)} />
          )}
          {shownPhoto ? "Replace photo" : "Add a photo"}
          <input type="file" accept="image/*" onChange={(e) => onPhoto(e.target.files?.[0] ?? null)} />
        </label>
      </section>

      <section className="card map-pick">
        <div className="map-frame">
          <LeafletMap
            markers={places}
            pin={[place.latitude, place.longitude]}
            fitPadding={TIGHT}
            onMapClick={(lat, lng) => onChange({ latitude: +lat.toFixed(6), longitude: +lng.toFixed(6) })}
            onMarkerClick={onSwitch}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <label className="field">
            <span>Latitude</span>
            <input
              className="input"
              type="number"
              step="any"
              required
              value={place.latitude}
              onChange={(e) => onChange({ latitude: Number(e.target.value) })}
            />
          </label>
          <label className="field">
            <span>Longitude</span>
            <input
              className="input"
              type="number"
              step="any"
              required
              value={place.longitude}
              onChange={(e) => onChange({ longitude: Number(e.target.value) })}
            />
          </label>
        </div>
        <p className="editor-hint">Tap the map to set where it is. Tap another pin to edit that place instead.</p>
      </section>

      <div className="edit-actions">
        <button type="submit" className="btn btn-ink" disabled={saving}>
          {saving ? "Saving…" : "Save"}
        </button>
        <button type="button" className="btn" onClick={onCancel}>
          Cancel
        </button>
        {place.id && (
          <button type="button" className="btn btn-heart ml-auto" disabled={saving} onClick={onDelete}>
            Delete
          </button>
        )}
      </div>
    </form>
  );
}
