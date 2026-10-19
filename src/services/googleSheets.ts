// Only used by scripts/import-sheets.mjs to copy the old Google Sheet into the database.
import type { Place } from "./places";

type SheetMarker = Omit<Place, "list">;

// Google Drive share links aren't loadable by <img>; rewrite them to Drive's thumbnail URL.
// Any other URL passes through unchanged.
export function toImageUrl(link: string): string {
  const driveId = link.match(/drive\.google\.com\/.*?(?:\/d\/|[?&]id=)([\w-]+)/)?.[1];
  return driveId
    ? `https://drive.google.com/thumbnail?id=${driveId}&sz=w1000`
    : link.trim();
}

export function parseCSV(csv: string): SheetMarker[] {
  const lines = csv.split("\n");
  const headers = parseCSVLine(lines[0]);

  return lines
    .slice(1)
    .filter((line) => line.trim() !== "")
    .map((line) => {
      const values = parseCSVLine(line);
      const marker: SheetMarker = {
        id:
          values[headers.indexOf("ID")] ||
          values[headers.indexOf("Id")] ||
          values[headers.indexOf("id")] ||
          "",
        group: values[headers.indexOf("Group")] || "",
        icon: values[headers.indexOf("Icon")] || "",
        customSize: parseInt(
          values[headers.indexOf("Custom Size")] || "25",
          10
        ),
        name: values[headers.indexOf("Name")] || "",
        latitude: parseFloat(values[headers.indexOf("Latitude")] || "0"),
        longitude: parseFloat(values[headers.indexOf("Longitude")] || "0"),
        description: values[headers.indexOf("Description")] || "",
        address: values[headers.indexOf("Address")] || "",
        image: toImageUrl(values[headers.indexOf("Image")] || ""),
      };
      return marker;
    })
    .filter((marker) => !isNaN(marker.latitude) && !isNaN(marker.longitude));
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let inQuotes = false;
  let currentValue = "";

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"' && (i === 0 || line[i - 1] !== "\\")) {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(currentValue.replace(/""/g, '"'));
      currentValue = "";
    } else {
      currentValue += char;
    }
  }

  result.push(currentValue.replace(/""/g, '"'));
  return result.map((value) => value.replace(/^"(.+)"$/, "$1"));
}
