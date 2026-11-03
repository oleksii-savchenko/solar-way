import { defineConfig } from "astro/config";

// Сайт у корені домену; для підпапки впиши її сюди, напр. "/solar-way"
const base = "";

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
  site: "https://solar.hawk-style.com",
  base: base || "/",
  // Стилі прямо в HTML: сторінка малюється без очікування CSS-файлів
  build: { inlineStylesheets: "always" },
  vite: {
    plugins: [contentBase()],
    // Шрифт заголовка вбудовується в стилі, тож заголовок одразу має свій розмір і не зсуває макет
    build: { assetsInlineLimit: (file) => (file.endsWith("league-gothic-latin-400-normal.woff2") ? true : undefined) },
  },
});
