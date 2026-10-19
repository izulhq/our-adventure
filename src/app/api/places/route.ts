import { Redis } from "@upstash/redis";
import { put } from "@vercel/blob";
import type { Place } from "@/services/places";

// All places live in one Redis hash: id → Place JSON.
// Env (added by Vercel when the stores are connected): KV_REST_API_URL, KV_REST_API_TOKEN,
// BLOB_READ_WRITE_TOKEN. Set ADMIN_PASSWORD yourself.
const KEY = "places";

export async function GET() {
  const places = await Redis.fromEnv().hgetall<Record<string, Place>>(KEY);
  return Response.json(Object.values(places ?? {}));
}

function unauthorized(req: Request) {
  const password = process.env.ADMIN_PASSWORD;
  if (password && req.headers.get("x-admin-password") === password) return null;
  return Response.json({ error: "Wrong password" }, { status: 401 });
}

// Lets /admin check a password before showing the dashboard
export async function HEAD(req: Request) {
  return unauthorized(req) ?? new Response(null, { status: 204 });
}

export async function POST(req: Request) {
  const denied = unauthorized(req);
  if (denied) return denied;

  const form = await req.formData();
  const place = JSON.parse(String(form.get("place"))) as Place;
  if (
    !place.name ||
    !Number.isFinite(place.latitude) ||
    !Number.isFinite(place.longitude) ||
    !["map", "wishlist"].includes(place.list)
  ) {
    return Response.json(
      { error: "Name, latitude, longitude and list are required" },
      { status: 400 }
    );
  }
  // Timestamp IDs sort after the sheet's 1..43, so "newest first" is just a numeric sort
  place.id ||= String(Date.now());

  const photo = form.get("photo");
  if (photo instanceof File) {
    // ponytail: a replaced photo stays in Blob; del() the old URL if storage ever matters
    const blob = await put(`places/${place.id}.jpg`, photo, {
      access: "public",
      addRandomSuffix: true,
    });
    place.image = blob.url;
  }

  await Redis.fromEnv().hset(KEY, { [place.id]: place });
  return Response.json(place);
}

export async function DELETE(req: Request) {
  const denied = unauthorized(req);
  if (denied) return denied;

  const id = new URL(req.url).searchParams.get("id");
  if (!id) return Response.json({ error: "Missing id" }, { status: 400 });
  await Redis.fromEnv().hdel(KEY, id);
  return Response.json({ ok: true });
}
