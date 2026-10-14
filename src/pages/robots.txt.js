// robots.txt gerado no build: a URL do sitemap acompanha site/base do
// astro.config.mjs, sem precisar editar nada ao trocar de domínio.
export function GET({ site }) {
  const base = import.meta.env.BASE_URL.replace(/\/?$/, "/");
  const sitemap = new URL(`${base}sitemap.xml`, site);
  return new Response(`User-agent: *\nAllow: /\n\nSitemap: ${sitemap.href}\n`);
}
