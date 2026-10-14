# Template de site institucional para PMEs — SEO-first, HTML estático

[![CI](https://github.com/pgillets/simple_web_app/actions/workflows/ci.yml/badge.svg)](https://github.com/pgillets/simple_web_app/actions/workflows/ci.yml)

**🇧🇷 Português** · [🇺🇸 English](#english)

🔗 **Exemplo no ar:** https://pgillets.github.io/simple_web_app/

Um template pronto para criar rapidamente o site de divulgação de uma pequena ou
média empresa, hospedado de graça no GitHub Pages. Este repositório já é um exemplo
completo (uma clínica odontológica fictícia): troque os dados e o conteúdo pelos da
sua empresa e publique.

O site publicado é **HTML estático puro**, sem framework no navegador. Para não
repetir o mesmo `<head>`, cabeçalho e rodapé em cada página, o HTML é gerado pelo
[Astro](https://astro.build/) a partir de um layout único — por que essa troca foi
feita está em [`docs/DECISAO-STACK.md`](docs/DECISAO-STACK.md).

Feito para aparecer no Google: páginas estáticas de verdade (indexáveis sem depender
de JavaScript), meta tags de SEO, dados estruturados (schema.org), sitemap e
`robots.txt` gerados no build — veja [SEO](#seo).

## Onde mexer

| Para mudar… | Edite |
|---|---|
| Nome, telefone, endereço, horário, WhatsApp, nota de avaliação | `src/dados/negocio.js` |
| Menu | `MENU` em `src/dados/negocio.js` |
| `<head>`, CSP, cabeçalho, rodapé — de **todas** as páginas | `src/layouts/Base.astro` |
| Texto de uma página | `src/pages/<pagina>.astro` (HTML comum dentro de `<Base>`) |
| Cores, fontes, espaçamento | `public/css/tokens.css` |
| Endereço de produção (domínio, subpasta) | `site` e `base` em `astro.config.mjs` |
| Ligar Google Tag Manager / GA4 / Pixel | `GTM_CONTAINER_ID` em `src/dados/negocio.js` ([`docs/ANALYTICS.md`](docs/ANALYTICS.md)) |

## As páginas deste template

| Página | Papel | No `sitemap.xml`? |
|---|---|---|
| **`index`** | Início: herói, serviços, prova social, chamada para ação. | Sim |
| **`sobre`** | História da empresa, números e depoimentos completos. | Sim |
| **`contato`** | Endereço, telefone, e-mail, horário — a página de conversão. | Sim |
| **`galeria`** | Fotos do espaço/produto. Pouco texto único, então **não** compete por posição no Google. | Não (`noindex`) |
| **`privacidade`** | Política de privacidade e cookies, linkada pelo rodapé. Fora do menu. | Não (`noindex`) |
| **`404`** | Página de erro, com volta automática ao início. | Não |

**Página nova** = criar `src/pages/<nome>.astro` (copie uma existente) e, se ela for
para o menu, acrescentar a entrada em `MENU`. Só isso: o sitemap inclui sozinho toda
página que não tiver `indexavel={false}`, e o cabeçalho, o rodapé e as meta tags vêm do
layout.

## SEO

- **HTML 100% estático em cada página**, menu incluso — nada é montado por JavaScript.
  Funciona para buscadores, leitores de redes sociais e visitantes sem JS.
- **Meta tags completas por página**, geradas pelo layout a partir de `titulo` e
  `descricao`: `canonical`, Open Graph (com `og:site_name` e as dimensões da
  `og:image`) e Twitter Card completo.
- **Dados estruturados (JSON-LD)** `schema.org/Dentist` (troque por outro
  [subtipo de `LocalBusiness`](https://schema.org/LocalBusiness) em `tipoSchema`), só na
  página inicial, gerados de `src/dados/negocio.js` — os mesmos dados do rodapé, de
  `contato` e do selo "Aberto agora", então não dessincronizam.
- **`sitemap.xml` e `robots.txt` gerados no build** a partir do próprio HTML: entra no
  sitemap toda página indexável; páginas `noindex` ficam de fora sozinhas.

## Como funciona

- **Astro só no build.** Ele junta layout + páginas e escreve HTML em `dist/`. O CSS e
  o JS ficam em `public/` e são copiados como estão — nada é processado, embutido ou
  empacotado, então o navegador recebe exatamente o que está no repositório.
- **Content-Security-Policy estrita** em todas as páginas, inclusive a 404
  (`'self'`, sem `'unsafe-inline'`, sem hash). Com o GTM ligado, o layout abre só os
  hosts do Google e da Meta que um site em produção realmente precisou.
- **Analytics prontos, mas desligados**: um gate de consentimento (`public/js/consentimento.js`)
  carrega o Google Tag Manager só depois do "Aceitar" na faixa de cookies.
- **Links de WhatsApp com rastreamento por botão**: `whatsapp("<pagina>_<secao>")` gera o
  link com `utm_content`; o build falha se houver emoji na mensagem pré-preenchida
  (vira "�" no WhatsApp).
- **JavaScript só para melhorias**: tema claro/escuro, consentimento, galeria em
  `<dialog>`, e dois Web Components de negócio (`<selo-status>` calcula "Aberto agora";
  `<estrela-avaliacao>` mostra a nota). Sem JS, nada some além deles.

## Rodando localmente

Precisa de Node.js 22.12 ou mais novo.

```bash
npm install
npm run dev       # servidor com recarga automática
npm run build     # gera dist/
npm run preview   # serve dist/ exatamente como vai para o ar
```

O endereço aparece no terminal (com o `base`, ex.: `/simple_web_app/`).

## Publicando no GitHub Pages

1. O repositório precisa ser **público** (requisito do Pages gratuito).
2. **Settings → Pages → Build and deployment**: Source = **GitHub Actions**.
3. Cada push na `main` roda `.github/workflows/deploy.yml`: build e publicação em
   ~1–2 minutos, em `https://<usuário>.github.io/<repositório>/`.
4. Ajuste `site` e `base` em `astro.config.mjs` para o seu usuário e repositório.

## Domínio personalizado

Troque `site` pelo domínio e apague `base` em `astro.config.mjs` — canonical, og:url,
sitemap, robots.txt e o 404 acompanham. O passo a passo de DNS e HTTPS está em
**[`docs/DOMINIO.md`](docs/DOMINIO.md)**.

## Checklist de release

- `npm run build` sem erro (o CI repete o build, valida o HTML e confere os links).
- Botão de WhatsApp novo: slug novo em `whatsapp()`, rótulo em `ROTULOS` de
  `tools/gerar-gtm.py` e rodar o script de novo (se o GTM estiver ligado).
- Sem service worker, não há versão de cache para subir: o GitHub Pages serve tudo com
  `Cache-Control: max-age=600`, então uma publicação aparece para todos em até 10 minutos.

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

  (A regra aparece duas vezes pelo mesmo motivo do bloco escuro de `public/css/tokens.css`:
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
- Um `@font-face` que nenhuma regra usa não é baixado pelo navegador — declarar a
  fonte antes de usá-la não custa nada.
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
astro.config.mjs         → endereço de produção (site/base) e geração do sitemap
src/
  dados/negocio.js       → dados do negócio, menu, ID do GTM, links de WhatsApp
  layouts/Base.astro     → <head>, CSP, cabeçalho e rodapé de todas as páginas
  pages/                 → uma .astro por página (+ 404 e robots.txt)
public/                  → copiado como está para o site
  css/tokens.css         → design tokens (cores, espaçamento, fontes)
  css/base.css, componentes.css, negocio.css, pagina-404.css
  js/site.js             → entrada compartilhada: tema, consentimento, selo de horário
  js/consentimento.js    → faixa de cookies + Google Tag Manager (desligado por padrão)
  js/galeria.js          → só na galeria: lightbox via <dialog> nativo
  js/componentes/        → <selo-status> e <estrela-avaliacao>
  assets/                → favicon, ícone, capa de compartilhamento, fotos
docs/
  DECISAO-STACK.md       → por que Astro (com os números) e o que foi removido
  ANALYTICS.md           → como ligar GTM/GA4/Ads/Pixel
  DOMINIO.md             → domínio personalizado
tools/gerar-gtm.py       → contêiner do GTM importável, um evento por botão de WhatsApp
.github/workflows/       → ci.yml (build + validação + links) e deploy.yml (Pages)
```

## Licença

MIT — veja [`LICENSE`](LICENSE).

---

## English

A ready-to-use template for a small/medium business's website, hosted for free on
GitHub Pages. This repository is already a complete example (a fictional dental
clinic): replace the data and content with your own and publish.

The published site is **plain static HTML**, no client-side framework. To avoid
repeating the same `<head>`, header and footer on every page, the HTML is generated
by [Astro](https://astro.build/) from a single layout — the reasoning (with numbers from
a real client site) is in [`docs/DECISAO-STACK.md`](docs/DECISAO-STACK.md).

**Live example:** https://pgillets.github.io/simple_web_app/

### Where to edit

- Business data, menu, GTM ID, WhatsApp links: `src/dados/negocio.js`
- `<head>`, CSP, header, footer for every page: `src/layouts/Base.astro`
- Page content: `src/pages/*.astro`
- Colors and fonts: `public/css/tokens.css`
- Production URL: `site` / `base` in `astro.config.mjs`

### Highlights

- **Static HTML on every page**, menu included; JavaScript only adds enhancements.
- **Full SEO meta tags, JSON-LD, sitemap and robots.txt** generated at build time from
  one data file; `noindex` pages leave the sitemap automatically.
- **Strict Content-Security-Policy** on every page, including the 404 — CSS and JS
  live in `public/` and are served untouched, so nothing gets inlined.
- **Analytics ready but off**: setting the GTM ID turns on the consent banner and
  widens the CSP to exactly the hosts Google tag and the Meta Pixel need
  ([`docs/ANALYTICS.md`](docs/ANALYTICS.md)).
- **Lessons from a real client site** are collected in
  [Lições de projetos reais](#lições-de-projetos-reais).

### Local development

```bash
npm install && npm run dev   # Node.js 22.12+
```

### Deploying

Repository must be **public**. **Settings → Pages → Build and deployment → Source:
GitHub Actions**; every push to `main` builds and publishes via
`.github/workflows/deploy.yml`.

### License

MIT — see [`LICENSE`](LICENSE).
