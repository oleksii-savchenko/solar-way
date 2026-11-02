import { defineConfig } from "astro/config";

const base = "/solar-way";

// Додає base до всіх шляхів від кореня сайту у файлах контенту
function contentBase() {
  return {
    name: "content-base",
    enforce: "pre",
    transform(code, id) {
      if (!/[\\/]src[\\/]content[\\/].+\.json$/.test(id)) return;
      const withBase = (key, value) =>
        typeof value === "string" && value.startsWith("/") ? base + value : value;
      return JSON.stringify(JSON.parse(code), withBase);
    },
  };
}

export default defineConfig({
  // Домен і шлях сайту: з них будуються canonical і адреса OG-картинки
  site: "https://oleksii-savchenko.github.io",
  base,
  vite: { plugins: [contentBase()] },
});
