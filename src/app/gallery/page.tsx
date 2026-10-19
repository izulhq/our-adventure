import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import Gallery from "./Gallery";

export const metadata: Metadata = {
  title: "ijul & dapta's photos",
  description: "every photo from the places ijul and dapta have been",
};

// Photos committed to the repo before the database, named by place ID. That set only changes
// with a deploy, so reading it at build time tells us exactly which places have one.
const repoPhotoIds = fs
  .readdirSync(path.join(process.cwd(), "public/images"))
  .filter((f) => f.endsWith(".jpg"))
  .map((f) => f.slice(0, -4));

export default function GalleryPage() {
  return <Gallery repoPhotoIds={repoPhotoIds} />;
}
