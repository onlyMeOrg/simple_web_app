# Template de site institucional para PMEs — SEO-first, zero build

[![CI](https://github.com/pgillets/simple_web_app/actions/workflows/ci.yml/badge.svg)](https://github.com/pgillets/simple_web_app/actions/workflows/ci.yml)

**🇧🇷 Português** · [🇺🇸 English](#english)

🔗 **Exemplo no ar:** https://pgillets.github.io/simple_web_app/

Um template pronto para criar rapidamente o site de divulgação de uma pequena ou
média empresa — em HTML, CSS e JavaScript puros, **sem build, sem framework, sem
dependências**, hospedado de graça no GitHub Pages. Este repositório já é um exemplo
completo (uma clínica odontológica fictícia, com 4 páginas reais): troque o conteúdo
pelo da sua empresa e publique.

Feito para aparecer no Google: páginas estáticas de verdade (indexáveis sem depender
de JavaScript), meta tags de SEO, dados estruturados (schema.org) e sitemap já vêm
prontos — veja a seção [SEO](#seo) abaixo.

## As páginas deste template

| Página | Papel | Aparece no `sitemap.xml`? |
|---|---|---|
| **`index.html`** | Início: herói, serviços, prova social, chamada para ação. | Sim |
| **`sobre.html`** | História da empresa, números e depoimentos completos. | Sim |
| **`contato.html`** | Endereço, telefone, e-mail, horário — a página de conversão. | Sim |
| **`galeria.html`** | Fotos do espaço/produto. Pouco texto único, então **não** compete por posição no Google — veja [SEO](#seo). | Não (`noindex`) |
| **`privacidade.html`** | Política de privacidade e cookies, linkada pelo rodapé. Fora do menu. | Não (`noindex`) |

Adicionar uma página nova ao template é: criar o arquivo `.html` seguindo o padrão dos
outros (cabeçalho compartilhado + `<main>` próprio + rodapé), adicionar a entrada no
array `PAGINAS` de `js/componentes/cabecalho-site.js`, e decidir se ela entra no
`sitemap.xml`.

## SEO

O que já vem pronto, para você ajustar com os dados reais do negócio:

- **Conteúdo 100% estático em cada página**: nada é montado por JavaScript — o HTML
  que o navegador recebe já é o conteúdo final. Funciona para buscadores, leitores de
  redes sociais e visitantes mesmo sem JS. Só o cabeçalho/menu compartilhado
  (`<cabecalho-site>`) depende de JavaScript para aparecer — cada página tem um
  `<noscript>` com os mesmos links em texto puro como rede de segurança.
- **Meta tags completas por página**: `title`, `description`, `canonical`, Open Graph
  (com `og:site_name` e as dimensões da `og:image`) e Twitter Card completo
  (`twitter:title`, `twitter:description`, `twitter:image`).
- **Marca no HTML servido**: o ícone e o nome do negócio vêm como markup estático dentro
  de `<cabecalho-site>` — visíveis a crawlers que não executam JavaScript. O componente
  só acrescenta o menu e o botão de tema.
- **Dados estruturados (JSON-LD)**: um bloco `schema.org/Dentist` (subtipo de
  `LocalBusiness`) com nome, endereço, telefone, horário e avaliação — vive **só** em
  `index.html` (a URL canônica do negócio), não repetido em toda página, para não
  correr o risco de duas cópias ficarem dessincronizadas. Troque pelo tipo mais
  adequado ao seu negócio (veja a
  [lista de subtipos de `LocalBusiness`](https://schema.org/LocalBusiness)).
- **`robots.txt`** e **`sitemap.xml`**: já na raiz do repositório, listando as 3 páginas
  indexáveis (`galeria.html` fica de fora de propósito).
- **Indexabilidade por página, explícita**: cada página declara `<meta
  name="robots">` (ou a ausência dela, que já significa "indexar") — a convenção é
  simples: página com informação real do negócio → indexável; página de baixo
  conteúdo textual único (como uma galeria de fotos) → `noindex, follow` (não
  indexada, mas o crédito de link continua fluindo para o resto do site).

### Personalizando para o seu negócio

1. Edite as 4 páginas `.html`: nome, textos, serviços, depoimentos, endereço, telefone
   e horário. É HTML puro — não precisa entender o resto do repositório para isso.
2. Troque `nome-negocio="..."` em cada `<cabecalho-site>` e o array `PAGINAS` em
   `js/componentes/cabecalho-site.js` se as páginas mudarem de nome.
3. Troque as cores em `css/tokens.css` (design tokens) e o `assets/favicon.svg`.
4. Troque as fotos de exemplo em `assets/galeria/` pelas fotos reais do negócio.
5. Gere uma imagem de Open Graph própria (1200×630) e salve em
   `assets/og-capa-negocio.png`, ou aponte `og:image` para outra.
6. Atualize `title`, `description`, `canonical`, `og:url`, `og:image` em cada página e
   os campos do JSON-LD em `index.html` com os dados reais.
7. Atualize a URL em `robots.txt` e em `sitemap.xml` (troque pelo seu domínio final).
8. Dê a cada botão de WhatsApp um `?utm_content=<pagina>_<secao>` próprio — custa nada
   agora e deixa o rastreamento por botão pronto para quando houver anúncios
   ([`docs/ANALYTICS.md`](docs/ANALYTICS.md)). Mensagem pré-preenchida (`text=`) **sem
   emoji**.
9. Revise `privacidade.html` com quem responde pelo negócio.
10. Publique (veja abaixo) e, se quiser, configure um domínio próprio
    ([`docs/DOMINIO.md`](docs/DOMINIO.md)).

## Como funciona

- **Cada página é HTML estático de verdade** — nada de roteador, nada de conteúdo
  montado via JavaScript. O pouco JavaScript que carrega (`js/site.js`) só liga
  melhorias progressivas: tema claro/escuro, o cabeçalho/menu compartilhado e
  funcionamento offline — nunca o conteúdo em si.
- **Cabeçalho compartilhado sem duplicar HTML**: `<cabecalho-site>` é um Web Component
  (`js/componentes/cabecalho-site.js`) que monta o menu a partir de um único array —
  o único lugar a editar para adicionar, renomear ou remover uma página. Fica em
  *light DOM* (sem shadow root) de propósito, para herdar o CSS do site e para que
  `js/tema.js` continue achando o botão de tema com `document.getElementById`.
- **Zero build**: os módulos são ES Modules nativos, resolvidos pelo próprio
  navegador. `git push` é o deploy inteiro.
- **PWA discreta**: um service worker *network-first* garante que as 4 páginas
  funcionem offline sem o efeito colateral clássico de "publiquei e ainda vejo a
  versão antiga".
- **Content-Security-Policy** estrita via `<meta>` em **todas** as páginas, inclusive o
  `404.html` — por isso não há script ou estilo inline nas páginas de conteúdo (os dados
  estruturados JSON-LD são dado inerte, não código, e não precisam de exceção na CSP). O
  `404.html` é a exceção controlada: é servido em qualquer caminho inexistente, até
  aninhado (`/a/b/c`), onde um `./css/...` relativo não resolveria; então o CSS e o JS
  dele ficam embutidos e liberados **por hash** na CSP. Editou um dos dois? Rode
  `python3 tools/hash-csp-404.py` (o CI confere).
- **Analytics prontos, mas desligados**: um gate de consentimento (`js/consentimento.js`)
  carrega o Google Tag Manager só depois do "Aceitar" na faixa de cookies. Com o ID do
  contêiner vazio (o padrão), nada aparece e nada de terceiro carrega. Para ligar:
  [`docs/ANALYTICS.md`](docs/ANALYTICS.md).

## Rodando localmente

ES Modules não funcionam abrindo os arquivos direto (`file://`) — é preciso um
servidor HTTP:

```bash
python3 tools/servidor.py
# http://localhost:8000/          → Início
# http://localhost:8000/sobre.html, /contato.html, /galeria.html
```

Para simular exatamente como o site roda no GitHub Pages hoje (com o prefixo do
repositório na URL):

```bash
python3 tools/servidor.py --base simple_web_app
# abre em http://localhost:8000/simple_web_app/
```

Qualquer servidor estático serve (`npx serve`, `python3 -m http.server`); o script
acima só adiciona o tipo MIME correto do `.webmanifest`, desativa o cache HTTP (útil
ao mexer no service worker) e simula o 404.html do Pages.

## Publicando no GitHub Pages

1. O repositório precisa ser **público** (requisito do Pages gratuito).
2. **Settings → Pages → Build and deployment**: Source = **Deploy from a branch**,
   Branch = **`main`**, pasta = **`/ (root)`** → Save.
3. Em cerca de 1–2 minutos o site sobe em `https://<usuário>.github.io/<repositório>/`.
   Atenção: o GitHub Pages cacheia por até 10 minutos — uma mudança recém-publicada
   pode demorar um pouco para aparecer.

## Domínio personalizado

A ativação é um commit de uma linha: um arquivo `CNAME` na raiz com o domínio
escolhido. O passo a passo completo — verificação anti-sequestro, registros de DNS,
HTTPS, e o checklist de URLs (canonical, sitemap, robots.txt) para atualizar — está em
**[`docs/DOMINIO.md`](docs/DOMINIO.md)**. O código da aplicação não precisa de
nenhuma alteração: todos os caminhos internos já são relativos.

## Checklist de release

Ao publicar uma mudança que afete algum arquivo listado no `sw.js`, suba a constante
`VERSAO` nesse arquivo — é o gatilho que faz o service worker descartar o cache antigo
e avisar quem já tem o site aberto. Um arquivo novo que as páginas carregam (fonte,
logo, script) também precisa entrar no `PRECACHE` — junto com o bump.

No `sitemap.xml`, só atualize o `lastmod` das páginas cujo **conteúdo** mudou de
verdade.

## Lições de projetos reais

Aprendizados de um site de cliente feito a partir deste template, em produção desde
2026. Não estão no exemplo (são específicos de cada marca), mas valem a cada projeto.

### Tema, cores e marca

- **`<meta name="color-scheme" content="light dark">` no `<head>`**, além do
  `color-scheme` do CSS. O Samsung Internet tem um "modo escuro para sites" que
  reprocessa as cores por cima do tema da página (fundo quase preto, logo sumindo); essa
  meta é um sinal extra que alguns desses motores respeitam. Já vem em todas as páginas.
- **Logo com duas artes, não `filter: invert()`**: se o manual da marca tem a versão
  clara e a escura, ponha as duas no cabeçalho e deixe o CSS mostrar a do tema — o nome
  acessível fica no `aria-label` do link `.marca`, e as imagens ficam `alt=""`:

  ```css
  .marca-logo--escuro { display: none; }
  @media (prefers-color-scheme: dark) {
    :root:not([data-tema="claro"]) .marca-logo--claro { display: none; }
    :root:not([data-tema="claro"]) .marca-logo--escuro { display: block; }
  }
  :root[data-tema="escuro"] .marca-logo--claro { display: none; }
  :root[data-tema="escuro"] .marca-logo--escuro { display: block; }
  ```

  (A regra aparece duas vezes pelo mesmo motivo do bloco escuro de `css/tokens.css`:
  preferência do sistema + escolha manual.)
- **Tema escuro que a marca não define**: derive uma escala escura da cor secundária da
  marca (mesma matiz, escurecida) e confira o contraste de cada par texto/fundo (WCAG
  AA). Anote no topo de `tokens.css` de onde veio cada cor.

### Fontes da marca

- **Auto-hospede em `woff2`** (`assets/fontes/`) em vez de Google Fonts: a CSP fica em
  `style-src 'self'; font-src 'self'` e nenhuma requisição sai para terceiros. Converter:
  `python3 -c "from fontTools.ttLib import TTFont; f=TTFont('X.ttf'); f.flavor='woff2'; f.save('x.woff2')"`
  (`pip install fonttools brotli`).
- **Declare pesos como faixa** (`font-weight: 600 900` no arquivo Heavy) para que os
  600/700/800 do CSS resolvam para o arquivo real, sem negrito sintetizado.
- **Fonte manuscrita/de exibição só em acentos curtos** (uma palavra de um título), com
  `font-weight: 400` (senão o `h1` sintetiza negrito), `letter-spacing: normal` (o
  negativo dos títulos cola as ligaduras) e tamanho compensado (~`1.45em`, a altura-x
  costuma ser bem menor). Cursivas descem muito abaixo da linha de base: dê
  `padding-bottom` só ao título que tem o trecho, com `:has()`.
- Fonte nova que o CSS passa a usar entra no `PRECACHE` do `sw.js`. Um `@font-face`
  que nenhuma regra usa não é baixado — não precisa entrar antes disso.
- **Licença**: `.ttf`/`.otf` costumam vir com licença *desktop*; servir como webfont
  deixa o arquivo baixável e normalmente exige licença *web*. Confirme com o
  fornecedor e registre a decisão no README do projeto.

### Ícones e capa de compartilhamento

- **Nunca use `<text font-family="...">` num favicon SVG**: nenhuma webfont carrega
  ali, e o navegador desenha a letra em Arial. Extraia o contorno do glifo da fonte
  (`fontTools`) e embuta como `<path>`.
- **Ícone `maskable` com margem**: o Android recorta dentro de um círculo de 80% do
  lado. Deixe o desenho bem dentro disso (num glifo largo, ~60% da largura).
- **Gere a `og:image` (1200×630) por script** (ex.: Pillow desenhando com a fonte da
  marca convertida de `woff2` para `ttf` em memória), não por captura de navegador: uma
  captura em que a webfont não carregou a tempo sai em fonte genérica — e ninguém
  percebe até compartilhar o link.

### CI

- Nada de `style="..."` no HTML (o `html-validate` reprova) — use uma classe.
- URLs `http://localhost...` no README em `código`, não como link: o lychee tenta
  acessá-las. (Já há um `--exclude` para elas, por garantia.)
- Redes sociais (`wa.me`, Instagram, Facebook) bloqueiam bots de forma instável e já
  estão fora da checagem de links.

### Site de cliente

- **O rodapé não deve linkar o repositório.** O Pages gratuito exige repositório
  público; tirar o link só deixa de divulgá-lo — vale avisar o cliente.
- **Fidelidade ao texto do cliente**: ao receber um documento de conteúdo, não condense
  parágrafos, não funda listas nem troque títulos por conta própria — o cliente percebe
  e pede de volta. Se o texto não cabe no layout, mude o layout.
- **Duas fontes do cliente divergem** (o documento escrito e um áudio, por exemplo)?
  Não decida por dedução: registre a divergência no README como pendência e pergunte.
- **Preços**: quando o mesmo valor aparece em várias páginas (ou "a partir de" numa e
  cheio na outra), mantenha no README uma tabela "onde cada número aparece". Explicite
  condições ("por pessoa", "em dupla", "por casal") em todo lugar que mostrar o número.
- **Separe pendência de decisão** no README: o que falta (fotos reais, avaliações) e o
  que foi decidido conscientemente (ex.: "sob consulta", licença de fonte mantida),
  com data — evita reabrir a mesma discussão.
- **Avaliações do Google**: sem avaliações reais publicadas, tire o `aggregateRating`
  do JSON-LD e as estrelas da página. Para mostrá-las depois, citações copiadas do perfil
  são o caminho simples; um widget ao vivo exige chave da API Places (com billing) ou
  serviço de terceiro, e abre a CSP.

## Estrutura de arquivos

```
index.html, sobre.html, contato.html, galeria.html   → as 4 páginas do site
privacidade.html                                     → política de privacidade (noindex)
404.html, manifest.webmanifest, sw.js                → casca compartilhada e PWA
robots.txt, sitemap.xml                              → infraestrutura de SEO
css/
  tokens.css      → design tokens (cores, espaçamento, fontes) — troque as cores aqui
  base.css        → reset/layout compartilhado
  componentes.css → cabeçalho, navegação, botões, selos, tabelas
  negocio.css     → estilos de conteúdo (serviços, depoimentos, contato, galeria)
js/
  site.js               → entrada compartilhada pelas páginas: cabeçalho, tema, SW, consentimento
  consentimento.js      → faixa de cookies + Google Tag Manager (desligado por padrão)
  galeria.js            → só em galeria.html: lightbox via <dialog> nativo
  tema.js, tema-boot.js, sw-registro.js
                        → núcleo compartilhado (tema claro/escuro, service worker)
  componentes/
    cabecalho-site.js    → Web Component do cabeçalho/menu — edite o array PAGINAS aqui
    selo-status.js       → selo "Aberto agora" / "Fechado", calculado de verdade
    estrela-avaliacao.js → avaliação por estrelas, acessível por teclado
assets/
  galeria/          → fotos de exemplo da página galeria.html
  favicon.svg, icones/, og-capa-negocio.png
docs/DOMINIO.md     → runbook de domínio personalizado
docs/ANALYTICS.md   → como ligar GTM/GA4/Ads/Pixel (CSP já mapeada)
tools/
  servidor.py       → servidor de desenvolvimento (stdlib, sem dependências)
  hash-csp-404.py   → recalcula a CSP do 404.html (o CI confere)
  gerar-gtm.py      → contêiner do GTM importável, um evento por botão de WhatsApp
.github/workflows/ci.yml → validação de HTML e links a cada push/PR
```

## Licença

MIT — veja [`LICENSE`](LICENSE).

---

## English

A ready-to-use template for a small/medium business's promotional website — plain
HTML, CSS and JavaScript, **no build step, no framework, no dependencies**, hosted for
free on GitHub Pages. This repository is already a complete example (a fictional
dental clinic, 4 real pages): replace the content with your own business and publish.

Built to rank: real static pages (indexable without depending on JavaScript), SEO meta
tags, structured data (schema.org) and a sitemap are already in place — see
[SEO](#seo-1) below.

**Live example:** https://pgillets.github.io/simple_web_app/

### The pages

| Page | Role | In `sitemap.xml`? |
|---|---|---|
| **`index.html`** | Home: hero, services, social proof, call to action. | Yes |
| **`sobre.html`** | Company story, stats, full testimonials. | Yes |
| **`contato.html`** | Address, phone, email, hours — the conversion page. | Yes |
| **`galeria.html`** | Photo gallery. Little unique text, so it's intentionally excluded from search indexing — see [SEO](#seo-1). | No (`noindex`) |

### SEO

- **100% static content on every page** — nothing is assembled by JavaScript; the
  shared header (`<cabecalho-site>`) is the one piece that needs JS to render, and
  every page ships a `<noscript>` fallback nav for that.
- **Full meta tags per page**: title, description, canonical, Open Graph, Twitter Card.
- **Structured data (JSON-LD)**: a `schema.org/Dentist` block (a `LocalBusiness`
  subtype) lives only on `index.html` — one always-in-sync copy instead of several
  that could drift.
- **`robots.txt`** and **`sitemap.xml`** at the repo root, listing the 3 indexable
  pages (`galeria.html` is intentionally excluded, being `noindex`).

### Customizing for your business

Edit the 4 HTML pages' content and `css/tokens.css`'s colors, replace the photos in
`assets/galeria/` and `assets/og-capa-negocio.png`, update the meta tags and JSON-LD
fields, then update the URLs in `robots.txt`/`sitemap.xml` to your final domain.

### Highlights

- **Every page is real static HTML** — no router, no JS-rendered content. The little
  JavaScript that loads (`js/site.js`) only wires progressive enhancements (shared
  header, theme, offline support) — never the content itself.
- **Shared header without duplicating markup**: `<cabecalho-site>` is a light-DOM Web
  Component driven by a single array — the one place to edit to add/rename/remove a
  page.
- **Zero build**: native ES Modules, resolved by the browser itself.
- **A tame PWA**: a network-first service worker makes all 4 pages work offline.
- **Strict Content-Security-Policy** via `<meta>` on every page — the JSON-LD block is
  inert data, not code, so it needs no CSP exception. `404.html` keeps its CSS/JS inline
  (it is served at any missing path, even nested ones) and allows them **by hash**;
  `tools/hash-csp-404.py` recomputes it and CI checks it.
- **Analytics ready but off**: a consent gate loads Google Tag Manager only after the
  visitor accepts the cookie banner. See [`docs/ANALYTICS.md`](docs/ANALYTICS.md) for
  the two-step activation and the CSP allow-list learned in production.
- **Lessons from a real client site** (forced dark mode on Samsung Internet, self-hosted
  brand fonts, favicon glyphs as paths, deterministic og:image, client-content
  workflow) are collected in [Lições de projetos reais](#lições-de-projetos-reais).

### Local development

```bash
python3 tools/servidor.py                              # http://localhost:8000/
python3 tools/servidor.py --base simple_web_app # simulates the current
                                                          # GitHub Pages project-page URL
```

### Enabling GitHub Pages

Repository must be **public** (free-tier Pages requirement). Then: **Settings → Pages
→ Build and deployment** → Source: **Deploy from a branch** → Branch: **`main`**,
folder **`/ (root)`**. Live in ~1–2 minutes; GitHub's CDN caches responses for up to
10 minutes.

### Custom domain

Activation is a one-line commit (a `CNAME` file at the repo root). Full DNS/HTTPS
runbook, including the SEO-URL update checklist: [`docs/DOMINIO.md`](docs/DOMINIO.md)
(in Portuguese, with an English summary at the top).

### License

MIT — see [`LICENSE`](LICENSE).
