// @ts-check
import { readdir, readFile, writeFile } from "node:fs/promises";
import { defineConfig } from "astro/config";

// site + base: endereço de produção. No project page do GitHub Pages o site
// vive em /<repositório>/; com domínio próprio, troque `site` pelo domínio e
// apague `base` (ver docs/DOMINIO.md). Links internos, canonical, og:url,
// robots.txt, sitemap e o destino do 404 derivam daqui — não há outra URL a
// editar no projeto.
const site = "https://pgillets.github.io";
const base = "/simple_web_app";

/**
 * Sitemap gerado a partir do próprio HTML de saída: entra toda página que
 * tem <link rel="canonical"> e não tem "noindex". A decisão de indexar fica
 * só na página (prop `indexavel` do layout), então sitemap e robots meta
 * não têm como divergir. Sem <lastmod>: uma data errada é pior do que
 * nenhuma, e o build não sabe quando o CONTEÚDO de uma página mudou.
 */
const sitemap = {
  name: "sitemap-local",
  hooks: {
    "astro:build:done": async ({ dir }) => {
      const urls = [];
      for (const nome of await readdir(dir)) {
        if (!nome.endsWith(".html")) continue;
        const html = await readFile(new URL(nome, dir), "utf-8");
        const canonical = html.match(/<link rel="canonical" href="([^"]+)"/);
        if (canonical && !/<meta name="robots" content="[^"]*noindex/.test(html)) {
          urls.push(canonical[1]);
        }
      }
      const corpo = urls.sort().map((url) => `  <url><loc>${url}</loc></url>`).join("\n");
      await writeFile(
        new URL("sitemap.xml", dir),
        `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${corpo}\n</urlset>\n`,
      );
    },
  },
};

export default defineConfig({
  site,
  base,
  // sobre.html em vez de sobre/index.html: mantém as URLs que já existiam.
  build: { format: "file" },
  integrations: [sitemap],
  devToolbar: { enabled: false },
});
