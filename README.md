# ijul & dapta's adventure map

![Interactive Adventure Map](public/cover.png)

## what the fuck is this (?!)

Basically, this is our little interactive adventure map.

Whenever and wherever we go, we save the place: its name, coordinates, a note, the address and a photo. Everything is added from our editor at `/admin` and shows up on the map right away, no GitHub upload needed.

We also have a wishlist for places we want to visit next, kept in the same editor. Add a place, and it magically appears on the map. ✨

Simple, interactive, and easy to update.

**Made with love by us <3**

## Add or update a place

Go to **`/admin`** and sign in with the admin password. The dashboard has:

- **Overview:** counts per person, recently added places, and a map (tap a pin to edit it).
- **Places / Wishlist:** search, filter with the Venn, tap a row to edit.
- **Add a place:** fill in the form, tap the map to set where it is, pick a photo, Save.
- **Wishlist → been there:** open it and switch *Status* to *been there* once you've visited.
- **Delete:** open the place and press Delete.

Places live in Upstash Redis and photos in Vercel Blob. Photos are resized to 1600px in
the browser before upload. Older photos stay in `public/images/{ID}.jpg` and still show up.

## One-time setup (Vercel dashboard → project)

1. **Storage → Create → Upstash for Redis**, connect it to the project
   (adds `KV_REST_API_URL` / `KV_REST_API_TOKEN`).
2. **Storage → Create → Blob**, connect it (adds `BLOB_READ_WRITE_TOKEN`).
3. **Settings → Environment Variables:** add `ADMIN_PASSWORD`.
4. Copy the old Google Sheet into the database, once (already done for the current data):

   ```bash
   vercel env pull .env.local
   node --env-file=.env.local scripts/import-sheets.mjs
   ```

   It reads `NEXT_PUBLIC_SHEET_ID`, `NEXT_PUBLIC_SHEET_TAB` and
   `NEXT_PUBLIC_SHEET_TAB_WISHLIST` and refuses to run if the database already has places.

## Development

```bash
pnpm install
vercel env pull .env.local
pnpm dev
```

Check the Drive link conversion used by the import: `node src/services/googleSheets.test.mjs`
