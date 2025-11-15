# Our Adventure - Interactive React Leaflet Map with Google Sheets

An interactive exploration map built with Next.js, Leaflet, and Google Sheets integration. Features a "fog of war" style overlay that shows explored areas with transparent holes and dark overlay for unexplored regions.

## Getting Started

### Step 1: Create a Google Sheet

First, create a Google Sheet with the following format:

![Google Sheet Format](/public/readme-gsheet-format.png)

Make sure your Google Sheet has columns for:

- `ID` - To embed image from /public folder to the popup
- `group` - Group/category name
- `icon` - Icon URL
- `customSize` - Marker size
- `name` - Location name
- `latitude` - Latitude coordinate
- `longitude` - Longitude coordinate
- `address` - Location address
- `description` - Location description

Once created, copy the Google Sheet link.

### Step 2: Setup the Project

Fork or download this repository, then install dependencies:

```bash
npm install
```

### Step 3: Environment Configuration

Create a new file called `.env` in the root directory with the following format:

```env
NEXT_PUBLIC_SHEET_ID=YOUR_SPREADSHEET_URL
NEXT_PUBLIC_SHEET_TAB=Sheet1
```

Replace `YOUR_SPREADSHEET_URL` with your Google Sheet link and adjust the tab name if different.

### Step 4: Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Features

- **Interactive Map**: Built with Leaflet for smooth map interactions
- **Google Sheets Integration**: Dynamically loads markers from your Google Sheet
- **Exploration Overlay**: Dark overlay with transparent holes around visited locations (5km radius)
- **Custom Markers**: Support for custom icons and sizes
- **Image Popups**: Automatic image loading from `/public/images/` directory
- **Layer Controls**: Group and toggle different marker categories
- **Responsive Design**: Works on desktop and mobile devices

## Technologies Used

- [Next.js](https://nextjs.org/) - React framework
- [Leaflet](https://leafletjs.com/) - Interactive maps
- [Turf.js](https://turfjs.org/) - Geospatial analysis
- [Google Sheets](https://sheets.google.com/) - Data source
- [TypeScript](https://www.typescriptlang.org/) - Type safety
