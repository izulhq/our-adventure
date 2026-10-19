"use client";
import { useEffect, useRef } from "react";
import L from "leaflet";
import { DUO, Place } from "@/services/places";

interface LeafletMapProps {
  markers: Place[];
  hidden?: readonly string[]; // groups to hide (the Venn filter)
  // Admin mode: when set, clicks go to these instead of opening popups
  onMapClick?: (lat: number, lng: number) => void;
  onMarkerClick?: (marker: Place) => void;
  pin?: [number, number]; // temporary marker for the place being edited
  fitPadding?: { topLeft: [number, number]; bottomRight: [number, number] };
}

const NONE: readonly string[] = [];
// Home page: room for the masthead above and the Venn below
const OVERLAY_PADDING = { topLeft: [24, 110], bottomRight: [24, 170] } as LeafletMapProps["fitPadding"];
const isSet = (p?: [number, number]): p is [number, number] => !!p && (p[0] !== 0 || p[1] !== 0);

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

// Drawn inline (not an image) so pins stay crisp and take the group's color.
function pinIcon(fill: string, label: string, opts: { dashed?: boolean; delay?: number } = {}) {
  const drop = opts.delay === undefined ? "" : ` class="pin-drop" style="animation-delay:${opts.delay}ms"`;
  const html = `<svg viewBox="0 0 32 42" width="32" height="42" aria-hidden="true"${drop}>
    <path d="M16 1.5C8 1.5 1.5 7.9 1.5 15.8 1.5 26 14.3 39 16 40.5 17.7 39 30.5 26 30.5 15.8 30.5 7.9 24 1.5 16 1.5Z"
      fill="${fill}" stroke="#000" stroke-width="2.5"${opts.dashed ? ' stroke-dasharray="4 3"' : ""}/>
    <circle cx="16" cy="15.5" r="7.5" fill="#fff" stroke="#000" stroke-width="2"/>
    <text x="16" y="19.5">${label}</text></svg>`;
  return L.divIcon({ className: "pin", html, iconSize: [32, 42], iconAnchor: [16, 41], popupAnchor: [0, -38] });
}

function placeIcon(place: Place, delay?: number) {
  if (place.list === "wishlist") return pinIcon("#fff", "♥", { dashed: true, delay });
  const duo = DUO.find((d) => d.group === place.group);
  return pinIcon(duo?.color ?? "#fff", duo?.initial ?? "", { delay });
}

function popupHtml(p: Place) {
  const duo = DUO.find((d) => d.group === p.group);
  const legacy = p.id ? `/images/${p.id}.jpg` : ""; // photos uploaded to the repo before the database
  const photo = p.image || legacy;
  const fallback = p.image ? legacy : "";
  // Loads only when the popup opens; tries the legacy photo next, then drops the frame.
  const img = photo
    ? `<a class="place-photo" href="${esc(photo)}" target="_blank" rel="noopener"><img src="${esc(photo)}" alt="photo at ${esc(p.name)}" data-fallback="${esc(fallback)}"
        onerror="if(this.dataset.fallback){this.parentNode.href=this.src=this.dataset.fallback;this.dataset.fallback=''}else{this.parentNode.remove()}"></a>`
    : "";
  return `<article class="place">${img}<div class="place-body">
    <h3 class="place-name">${esc(p.name)}</h3>
    ${p.description ? `<p class="place-note">${esc(p.description)}</p>` : ""}
    ${p.address ? `<p class="place-address">${esc(p.address)}</p>` : ""}
    ${p.group ? `<span class="place-who" style="--who:${duo?.color ?? "#fff"}">${esc(p.group)}</span>` : ""}
  </div></article>`;
}

const LeafletMap = ({
  markers,
  hidden = NONE,
  onMapClick,
  onMarkerClick,
  pin,
  fitPadding = OVERLAY_PADDING,
}: LeafletMapProps) => {
  const mapRef = useRef<L.Map | null>(null);
  const layersRef = useRef<Record<string, L.LayerGroup>>({});
  const pinRef = useRef<L.Marker | null>(null);
  // Kept across re-renders so new markers don't reset the user's zoom/pan
  const viewRef = useRef<{ center: L.LatLng; zoom: number } | null>(null);
  // Refs so fresh values are used without rebuilding the map on every render
  const handlers = useRef({ onMapClick, onMarkerClick });
  handlers.current = { onMapClick, onMarkerClick };
  const hiddenRef = useRef(hidden);
  hiddenRef.current = hidden;
  const initial = useRef({ pin, fitPadding });
  initial.current = { pin, fitPadding };

  useEffect(() => {
    const map = L.map("map", { zoomControl: false });
    mapRef.current = map;
    map.attributionControl.setPrefix(false);
    // Standard OSM tiles, greyed out in CSS (.leaflet-tile-pane) so the pins carry the color
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);
    L.control.zoom({ position: "bottomright" }).addTo(map);
    map.on("click", (e) => handlers.current.onMapClick?.(e.latlng.lat, e.latlng.lng));

    // First load only: pins drop in the order they were added (by ID), replaying the trips.
    const firstLoad = !viewRef.current;
    const order = new Map(
      [...markers].sort((a, b) => Number(a.id) - Number(b.id)).map((m, i) => [m, i])
    );

    const layers: Record<string, L.LayerGroup> = {};
    const bounds = L.latLngBounds([]);
    for (const place of markers) {
      bounds.extend([place.latitude, place.longitude]);
      const delay = firstLoad ? Math.min(order.get(place)! * 20, 1200) : undefined;
      const marker = L.marker([place.latitude, place.longitude], {
        icon: placeIcon(place, delay),
        title: place.name,
      });
      if (handlers.current.onMarkerClick) {
        marker.on("click", () => handlers.current.onMarkerClick?.(place));
      } else {
        marker.bindPopup(popupHtml(place), {
          className: "place-popup",
          minWidth: 260,
          maxWidth: 260,
          autoPanPadding: [20, 90],
        });
      }
      (layers[place.group] ??= L.layerGroup()).addLayer(marker);
    }
    layersRef.current = layers;
    for (const [group, layer] of Object.entries(layers)) {
      if (!hiddenRef.current.includes(group)) layer.addTo(map);
    }

    const { pin: openOn, fitPadding: pad } = initial.current;
    if (viewRef.current) {
      map.setView(viewRef.current.center, viewRef.current.zoom);
    } else if (isSet(openOn)) {
      map.setView(openOn, 14); // editing a place: start zoomed in on it
    } else if (markers.length > 0) {
      map.fitBounds(bounds, { paddingTopLeft: pad!.topLeft, paddingBottomRight: pad!.bottomRight, maxZoom: 13 });
    } else {
      map.setView([-7.566, 110.828], 11);
    }

    return () => {
      viewRef.current = { center: map.getCenter(), zoom: map.getZoom() };
      map.remove();
    };
  }, [markers]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    for (const [group, layer] of Object.entries(layersRef.current)) {
      if (hidden.includes(group)) layer.remove();
      else layer.addTo(map);
    }
  }, [hidden]);

  useEffect(() => {
    pinRef.current?.remove();
    pinRef.current = null;
    if (isSet(pin) && mapRef.current) {
      pinRef.current = L.marker(pin, { icon: pinIcon("#000", "+"), zIndexOffset: 1000 }).addTo(mapRef.current);
    }
  }, [pin?.[0], pin?.[1]]); // eslint-disable-line react-hooks/exhaustive-deps

  return <div id="map" className="map" />;
};

export default LeafletMap;
