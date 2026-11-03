// Перед dev і build: робить WebP кількох ширин для кожного JPG/PNG з public/images
// і записує розміри всіх картинок у src/generated/images.json (див. src/utils/image.ts).
// Так оптимізуються й фото, завантажені через адмінку.
import { mkdir, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = "public/images";
const OUT = "_responsive";
const WIDTHS = [480, 960, 1440, 1920, 2560];
const QUALITY = 75;

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) => {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) return entry.name === OUT ? [] : walk(full);
      return [full];
    }),
  );
  return files.flat();
}

async function isFresh(target, source) {
  try {
    return (await stat(target)).mtimeMs >= (await stat(source)).mtimeMs;
  } catch {
    return false;
  }
}

const manifest = {};

for (const file of await walk(ROOT)) {
  const ext = path.extname(file).toLowerCase();
  if (![".jpg", ".jpeg", ".png", ".webp", ".svg"].includes(ext)) continue;

  const key = "/" + path.relative("public", file).split(path.sep).join("/");
  const { width, height } = await sharp(file).metadata();
  const entry = { width, height };
  manifest[key] = entry;
  if (ext === ".svg") continue;

  const rel = path.relative(ROOT, file).slice(0, -ext.length).split(path.sep).join("/");
  const widths = [...WIDTHS.filter((w) => w < width), Math.min(width, WIDTHS.at(-1))];
  entry.variants = [];
  for (const w of [...new Set(widths)]) {
    const name = `${OUT}/${rel}-${w}.webp`;
    const target = path.join(ROOT, name);
    if (!(await isFresh(target, file))) {
      await mkdir(path.dirname(target), { recursive: true });
      await sharp(file).resize({ width: w }).webp({ quality: QUALITY }).toFile(target);
    }
    entry.variants.push({ width: w, src: `/images/${name}` });
  }
}

await mkdir("src/generated", { recursive: true });
await writeFile("src/generated/images.json", JSON.stringify(manifest, null, 2) + "\n");
console.log(`images: ${Object.keys(manifest).length} optimized`);
