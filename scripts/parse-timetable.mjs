#!/usr/bin/env node
/**
 * Parses school timetable images using Claude Vision API.
 *
 * Fix for: "messages: text content blocks must be non-empty"
 * Root cause: passing empty string "" as a text content block to the API.
 * Solution: validate all content blocks before building the messages array.
 *
 * Usage: ANTHROPIC_API_KEY=sk-... node scripts/parse-timetable.mjs [image.png ...]
 */

import Anthropic from "@anthropic-ai/sdk";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const client = new Anthropic();

const PROMPT = `Analysoi tämä tuntikiiertokaavio-kuva. Palauta tiedot JSON-muodossa seuraavalla rakenteella:
{
  "name": "Koulun nimi",
  "palkkiCount": 8,
  "periodCount": 5,
  "times": ["8.15–9.30", "9.45–11.00", "11.10–13.00", "13.15–14.30", "14.45–16.00"],
  "days": ["Ma", "Ti", "Ke", "To", "Pe"],
  "rotation": [
    [2, 7, 4, 7, 1],
    [3, 5, 2, 5, 4],
    [7, 4, 3, 1, 6],
    [6, 1, 6, 2, 5],
    [8, null, 8, 3, 8]
  ]
}

Ohjeet:
- rotation on 2D-taulukko: yksi rivi per oppitunti, yksi sarake per päivä
- Jokainen arvo on palkkinumero (kokonaisluku)
- Käytä null jos solu on tyhjä tai "YS" (yhteinen suunnittelu)
- palkkiCount = suurin palkkinumero taulukossa
- Palauta VAIN JSON, ei muuta tekstiä`;

function buildImageContent(imagePath) {
  const buffer = fs.readFileSync(imagePath);
  if (buffer.length === 0) {
    throw new Error(`Image file is empty: ${imagePath}`);
  }
  const base64 = buffer.toString("base64");
  const ext = path.extname(imagePath).toLowerCase();
  const mediaType = ext === ".png" ? "image/png" : "image/jpeg";
  return { type: "image", source: { type: "base64", media_type: mediaType, data: base64 } };
}

function buildTextContent(text) {
  const trimmed = text.trim();
  if (!trimmed) {
    throw new Error("Text content block must be non-empty");
  }
  return { type: "text", text: trimmed };
}

async function parseTimetable(imagePath) {
  const content = [
    buildImageContent(imagePath),
    buildTextContent(PROMPT),
  ];

  // Guard: the API rejects any message with an empty text block
  for (const block of content) {
    if (block.type === "text" && !block.text.trim()) {
      throw new Error(`Empty text content block detected before API call`);
    }
  }

  const response = await client.messages.create({
    model: "claude-opus-4-7",
    max_tokens: 1024,
    messages: [{ role: "user", content }],
  });

  const raw = response.content[0]?.text ?? "";
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("No JSON found in response");
  return JSON.parse(jsonMatch[0]);
}

const uploadsDir = path.join(__dirname, "../uploads");
const args = process.argv.slice(2);
const images = args.length
  ? args
  : fs.readdirSync(uploadsDir)
      .filter((f) => /\.(png|jpe?g)$/i.test(f))
      .map((f) => path.join(uploadsDir, f));

if (images.length === 0) {
  console.error("No images found. Add .png/.jpg files to uploads/ or pass paths as arguments.");
  process.exit(1);
}

for (const imgPath of images) {
  console.log(`\nParsing: ${path.basename(imgPath)}`);
  try {
    const data = await parseTimetable(imgPath);
    console.log("Result:");
    console.log(JSON.stringify(data, null, 2));
    console.log("\nschools.js entry:");
    const id = path.basename(imgPath, path.extname(imgPath)).toLowerCase().replace(/\s+/g, "-");
    console.log(`  {
    id: "${id}", name: "${data.name}", location: "Espoo",
    palkkiCount: ${data.palkkiCount}, periodCount: ${data.periodCount},
    times: ${JSON.stringify(data.times)},
    days: ${JSON.stringify(data.days)},
    rotation: ${JSON.stringify(data.rotation)}
  }`);
  } catch (err) {
    console.error(`Error: ${err.message}`);
  }
}
