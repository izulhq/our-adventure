export interface SheetMarker {
  group: string;
  icon: string;
  customSize: number;
  name: string;
  latitude: number;
  longitude: number;
  description: string;
  address: string;
  secondName: string;
  image: string;
}

export async function fetchGoogleSheetsData(
  sheetId: string,
  sheetTab: string
): Promise<SheetMarker[]> {
  try {
    // Use the public export to CSV feature - this is more reliable for larger sheets
    const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(
      sheetTab
    )}`;

    // Add cache control and timeout options
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      },
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Failed to fetch Google Sheets data: ${response.status}`);
    }

    const csvText = await response.text();
    const markers = parseCSV(csvText);
    return markers;
  } catch (error) {
    console.error("Error fetching Google Sheets data:", error);

    // Return fallback data
    return [
      {
        group: "Default",
        icon: "/marker.png",
        customSize: 25,
        name: "Default Location",
        latitude: -7.566,
        longitude: 110.828,
        description:
          "Failed to load data from Google Sheets. This is a default marker.",
        address: "Default Address",
        secondName: "",
        image: "",
      },
    ];
  }
}

function parseCSV(csv: string): SheetMarker[] {
  const lines = csv.split("\n");
  const headers = parseCSVLine(lines[0]);

  return lines
    .slice(1)
    .filter((line) => line.trim() !== "")
    .map((line) => {
      const values = parseCSVLine(line);
      const marker: SheetMarker = {
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
        secondName: values[headers.indexOf("Second Name")] || "",
        image: values[headers.indexOf("Image")] || "",
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
