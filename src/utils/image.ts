// Атрибути для <img>: розміри (щоб макет не стрибав) і WebP-варіанти, які готує scripts/optimize-images.mjs
import manifest from "../generated/images.json";

type Entry = { width: number; height: number; variants?: { width: number; src: string }[] };

const base = import.meta.env.BASE_URL.replace(/\/$/, "");

// src приходить з контенту вже з префіксом base, sizes — яку частку екрана займає картинка
export function image(src: string, sizes?: string) {
  const entry = (manifest as Record<string, Entry>)[src.slice(base.length)];
  if (!entry) return { src };
  const { width, height, variants } = entry;
  if (!variants) return { src, width, height };
  return {
    src: base + variants.at(-1)!.src,
    srcset: variants.map((variant) => `${base}${variant.src} ${variant.width}w`).join(", "),
    sizes,
    width,
    height,
  };
}
