"use client";
import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "@/styles/styles.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { SheetMarker } from "@/services/googleSheets";

interface IconDefault extends L.Icon.Default {
  _getIconUrl?: string;
}

const LeafletMap = ({ markers }: { markers: SheetMarker[] }) => {
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Fix Leaflet default marker icons
      delete (L.Icon.Default.prototype as IconDefault)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: markerIcon2x.src,
        iconUrl: markerIcon.src,
        shadowUrl: markerShadow.src,
      });

      // Initialize map with attribution control disabled
      const map = L.map("map", { attributionControl: false }).setView(
        [markers[0]?.latitude || -7.566, markers[0]?.longitude || 110.828],
        13
      );
      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(
        map
      );

      // Group markers by their group property
      const markerGroups: Record<string, L.LayerGroup> = {};

      markers.forEach((marker) => {
        // Create custom icon based on marker data
        const customIcon = L.icon({
          iconUrl: marker.icon || "/marker.png",
          iconSize: [marker.customSize || 25, marker.customSize || 25],
          iconAnchor: [marker.customSize / 2 || 12, marker.customSize || 25],
          popupAnchor: [0, -(marker.customSize || 25)],
        });

        // Create popup content with all information
        const imageHtml = marker.image
          ? `<div class="marker-image"><img src="${marker.image}" alt="${marker.name}" /></div>`
          : "";

        const popupContent = `
          <div class="custom-popup-content">
            <h3>${marker.name}</h3>
            ${marker.secondName ? `<h4>${marker.secondName}</h4>` : ""}
            ${imageHtml}
            ${marker.description ? `<p>${marker.description}</p>` : ""}
            ${
              marker.address
                ? `<p class="address"><strong>Address:</strong> ${marker.address}</p>`
                : ""
            }
          </div>
        `;

        // Create the marker
        const leafletMarker = L.marker([marker.latitude, marker.longitude], {
          icon: customIcon,
        }).bindPopup(popupContent, {
          className: "custom-popup",
          closeButton: true,
          maxWidth: 300,
        });

        // Add marker to its group (or create a new group)
        if (!markerGroups[marker.group]) {
          markerGroups[marker.group] = L.layerGroup().addTo(map);
        }
        leafletMarker.addTo(markerGroups[marker.group]);
      });

      // Create layer control if there are multiple groups
      if (Object.keys(markerGroups).length > 1) {
        const overlays: { [key: string]: L.LayerGroup } = {};

        // For each group, create a layer with custom HTML that keeps elements in line
        Object.entries(markerGroups).forEach(([groupName, layer]) => {
          // Create a custom HTML label with the icon and name on the same line
          const iconUrl =
            markers.find((m) => m.group === groupName)?.icon || "/marker.png";

          // Use a span to contain both the icon and text to keep them on same line
          overlays[
            `<span class="layer-control-item align-middle">
              <img src="${iconUrl}" class="layer-icon" alt="${groupName}"/>${groupName}
            </span>`
          ] = layer;
        });

        L.control
          .layers({}, overlays, {
            collapsed: true,
            position: "topright",
          })
          .addTo(map);
      }
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, [markers]);

  return <div id="map" className="h-full w-full" />;
};

export default LeafletMap;
