// Run: node src/services/googleSheets.test.mjs
import assert from "node:assert/strict";
import { toImageUrl } from "./googleSheets.ts";

const thumb = "https://drive.google.com/thumbnail?id=1AbC-_x9&sz=w1000";
assert.equal(toImageUrl("https://drive.google.com/file/d/1AbC-_x9/view?usp=sharing"), thumb);
assert.equal(toImageUrl("https://drive.google.com/open?id=1AbC-_x9"), thumb); // Google Form upload format
assert.equal(toImageUrl("https://drive.google.com/uc?export=view&id=1AbC-_x9"), thumb);
assert.equal(toImageUrl(" https://example.com/a.jpg "), "https://example.com/a.jpg");
assert.equal(toImageUrl(""), "");
console.log("ok");
