/*
 * sw.js — service worker do "app shell", na raiz do repositório de propósito:
 * o escopo padrão de um service worker é o diretório de onde ele é servido,
 * então ficar na raiz garante escopo = base do site tanto em
 * /simple_web_app/ (project page) quanto em / (domínio próprio).
 *
 * Estratégia: NETWORK-FIRST para tudo same-origin (navegação e assets do
 * shell), com fallback ao cache. O GitHub Pages já manda os arquivos com
 * Cache-Control: max-age=600 — um service worker cache-first empilharia
 * mais uma camada de staleness em cima disso. Network-first elimina o
 * clássico "publiquei e continuo vendo a versão antiga".
 *
 * Requisições cross-origin (Google Tag Manager, Pixel da Meta, quando
 * ligados — ver docs/ANALYTICS.md) nunca são interceptadas: passam direto.
 *
 * Ao publicar uma mudança em qualquer arquivo do PRECACHE, suba a VERSAO —
 * é o gatilho que faz o activate() descartar o cache antigo.
 */

const VERSAO = "v6";
const CACHE = `shell-${VERSAO}`;

// As 4 páginas do site — usadas também pelo fallback de navegação offline
// abaixo. Adicionar uma página nova ao template? Acrescente o arquivo aqui.
const PAGINAS = ["./index.html", "./sobre.html", "./contato.html", "./galeria.html"];

const PRECACHE = [
  "./",
  ...PAGINAS,
  "./404.html",
  "./privacidade.html",
  "./manifest.webmanifest",
  "./css/tokens.css",
  "./css/base.css",
  "./css/componentes.css",
  "./css/negocio.css",
  "./js/tema-boot.js",
  "./js/tema.js",
  "./js/site.js",
  "./js/galeria.js",
  "./js/sw-registro.js",
  "./js/consentimento.js",
  "./js/componentes/cabecalho-site.js",
  "./js/componentes/selo-status.js",
  "./js/componentes/estrela-avaliacao.js",
  "./assets/favicon.svg",
  "./assets/icones/icone-192.png",
  "./assets/icones/icone-512.png",
  "./assets/icones/icone-maskable-512.png",
  "./assets/og-capa-negocio.png",
  "./assets/galeria/recepcao.png",
  "./assets/galeria/consultorio-1.png",
  "./assets/galeria/consultorio-2.png",
  "./assets/galeria/equipe.png",
  "./assets/galeria/sala-espera.png",
  "./assets/galeria/equipamentos.png",
];

self.addEventListener("install", (evento) => {
  evento.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);
      // cache: "reload" fura o cache HTTP do navegador — sem isso, o
      // max-age=600 do GitHub Pages poderia precachear conteúdo já obsoleto.
      await Promise.all(
        PRECACHE.map(async (caminho) => {
          const url = new URL(caminho, self.location);
          try {
            const resposta = await fetch(url, { cache: "reload" });
            if (resposta.ok) await cache.put(url, resposta);
          } catch {
            /* recurso opcional indisponível durante o install; segue sem ele */
          }
        })
      );
    })()
  );
});

self.addEventListener("activate", (evento) => {
  evento.waitUntil(
    (async () => {
      const chaves = await caches.keys();
      await Promise.all(chaves.filter((chave) => chave !== CACHE).map((chave) => caches.delete(chave)));
      await self.clients.claim();
    })()
  );
});

self.addEventListener("message", (evento) => {
  if (evento.data?.tipo === "PULAR_ESPERA") self.skipWaiting();
});

self.addEventListener("fetch", (evento) => {
  const requisicao = evento.request;
  if (requisicao.method !== "GET") return;

  const url = new URL(requisicao.url);
  if (url.origin !== self.location.origin) return; // GTM, Pixel e afins: passam direto

  evento.respondWith(networkFirst(requisicao));
});

async function networkFirst(requisicao) {
  const cache = await caches.open(CACHE);
  try {
    const resposta = await fetch(requisicao);
    if (resposta.ok) cache.put(requisicao, resposta.clone());
    return resposta;
  } catch (erro) {
    const emCache = await cache.match(requisicao, { ignoreSearch: true });
    if (emCache) return emCache;
    if (requisicao.mode === "navigate") {
      // Cada uma das 4 páginas já está cacheada com o próprio caminho — o
      // cache.match acima já resolve a maioria dos casos offline. Este
      // fallback só entra em cena para um caminho de navegação não
      // reconhecido (ex.: um link com typo); nesse caso, cai no Início.
      const pagina = PAGINAS.find((p) => url.pathname.endsWith(p.slice(1)));
      const casca = await cache.match(pagina ?? "./index.html");
      if (casca) return casca;
    }
    throw erro;
  }
}
