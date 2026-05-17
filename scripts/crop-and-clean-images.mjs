#!/usr/bin/env node
/**
 * v2.6 — Crop programmatique pour supprimer le logo Gemini.
 *
 * Toutes les images horizontales générées par Gemini ont le logo en bas
 * à droite (~12-18% de largeur en bas à droite). Stratégie pragmatique :
 * recadrer SYMÉTRIQUEMENT 15% à gauche et 15% à droite (total -30% de
 * largeur). Le logo bas-droite disparaît avec le 15% droit, et la
 * symétrie maintient le sujet centré.
 *
 * Pourquoi pas crop bas seulement ? Le user veut "garder le centrage du
 * plat" et "format horizontal". Couper en bas seulement déplacerait le
 * sujet vers le bas (mauvais). Crop symétrique horizontal = sujet reste
 * au centre du nouveau cadre.
 *
 * NB : pour des assets futurs sans logo Gemini, ce script causera une
 * perte de qualité inutile. À ne re-runner qu'après nouvel upload Gemini.
 * Idempotence : le script ÉCRASE le fichier. Re-runner deux fois donnerait
 * un sur-crop. Solution : marqueur `_cropped_` dans le nom OU détection
 * de dimensions déjà-croppées. Choix simple : sentinel fichier dans
 * /public/images/.cropped-marker contenant la liste des fichiers déjà
 * traités → on skip s'ils sont dedans et que la mtime n'a pas bougé.
 *
 * Format de sortie : JPEG qualité 90 (même format que les sources).
 * Si le fichier source est .png/.webp/.avif, on conserve le format
 * d'origine (sharp.toFormat dynamique).
 */
import {
  readFileSync,
  writeFileSync,
  readdirSync,
  statSync,
  existsSync,
} from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, parse as parsePath } from "node:path";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const IMAGES_DIR = join(ROOT, "public", "images");
const MARKER_PATH = join(IMAGES_DIR, ".cropped-marker.json");

// Extensions traitées (mêmes que map-images-to-recipes.mjs)
const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);

// Pourcentage à retirer DE CHAQUE CÔTÉ horizontalement (15% × 2 = 30%)
const CROP_LEFT_PCT = 0.15;
const CROP_RIGHT_PCT = 0.15;

// Qualité de réencodage JPEG / WebP
const ENCODE_QUALITY = 90;

// === Chargement du marqueur d'idempotence =================================
/** Map { filename: mtime_ms_when_cropped } */
let marker = {};
if (existsSync(MARKER_PATH)) {
  try {
    marker = JSON.parse(readFileSync(MARKER_PATH, "utf8"));
  } catch {
    marker = {};
  }
}

const allFiles = readdirSync(IMAGES_DIR)
  .map((name) => {
    const p = join(IMAGES_DIR, name);
    try {
      if (!statSync(p).isFile()) return null;
    } catch {
      return null;
    }
    const parsed = parsePath(name);
    const ext = parsed.ext.toLowerCase();
    if (!IMAGE_EXTENSIONS.has(ext)) return null;
    // Skip les logos
    if (parsed.name === "logo" || parsed.name === "logo-mapandfork") return null;
    return { filename: name, path: p, basename: parsed.name, ext };
  })
  .filter(Boolean);

console.log(`🖼  ${allFiles.length} images détectées dans public/images/\n`);

let processed = 0;
let skipped = 0;
let failed = 0;

for (const f of allFiles) {
  const stats = statSync(f.path);
  const mtime = stats.mtimeMs;
  // Skip si déjà croppé ET le fichier n'a pas été retouché depuis
  if (marker[f.filename] === mtime) {
    skipped += 1;
    console.log(`  ⏭  ${f.filename} (déjà croppé, skip)`);
    continue;
  }

  try {
    const buffer = readFileSync(f.path);
    const image = sharp(buffer);
    const metadata = await image.metadata();
    const { width, height, format } = metadata;
    if (!width || !height) {
      throw new Error("Pas de dimensions");
    }
    const leftCrop = Math.round(width * CROP_LEFT_PCT);
    const rightCrop = Math.round(width * CROP_RIGHT_PCT);
    const newWidth = width - leftCrop - rightCrop;

    let pipeline = image.extract({
      left: leftCrop,
      top: 0,
      width: newWidth,
      height,
    });

    // Réencode au même format que la source pour préserver la cohérence
    if (format === "jpeg" || f.ext === ".jpg" || f.ext === ".jpeg") {
      pipeline = pipeline.jpeg({ quality: ENCODE_QUALITY, mozjpeg: true });
    } else if (format === "png" || f.ext === ".png") {
      pipeline = pipeline.png({ compressionLevel: 9 });
    } else if (format === "webp" || f.ext === ".webp") {
      pipeline = pipeline.webp({ quality: ENCODE_QUALITY });
    } else if (format === "avif" || f.ext === ".avif") {
      pipeline = pipeline.avif({ quality: ENCODE_QUALITY });
    }

    const output = await pipeline.toBuffer();
    writeFileSync(f.path, output);
    // Met à jour le marqueur AVEC la nouvelle mtime (on vient d'écrire)
    marker[f.filename] = statSync(f.path).mtimeMs;
    processed += 1;
    console.log(
      `  ✓ ${f.filename.padEnd(45)} ${width}×${height} → ${newWidth}×${height} (-${(CROP_LEFT_PCT + CROP_RIGHT_PCT) * 100}%)`
    );
  } catch (err) {
    failed += 1;
    console.error(`  ✗ ${f.filename} : ${err.message}`);
  }
}

writeFileSync(MARKER_PATH, JSON.stringify(marker, null, 2) + "\n", "utf8");

console.log(`\n📊 Bilan :`);
console.log(`  ✓ ${processed} images recadrées (-30% horizontal)`);
console.log(`  ⏭  ${skipped} images déjà croppées (skip idempotence)`);
console.log(`  ✗ ${failed} échecs`);
console.log(`  📝 Marqueur d'idempotence : ${MARKER_PATH.replace(ROOT + "/", "")}`);
