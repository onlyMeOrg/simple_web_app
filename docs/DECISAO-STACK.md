# Decisão de stack: continuar sem build ou adotar Astro?

> **English summary**: the tooling is genuinely simple (no build, no dependencies), but the
> *content* isn't DRY: ~40% of every page is copy-pasted head/header/footer, and in the one
> real site built from this template, 10 of 24 commits had to edit every page for a single
> change, and 14 of 24 had to bump the service worker version. Astro would remove exactly
> that cost, at the price of a Node build step and an Actions-based deploy. Recommendation:
> pilot Astro in a separate PR; meanwhile, consider dropping the service worker.

Análise feita em 2026-10, com base neste repositório e no histórico do
`simple_site_mentalize`, o único site real feito a partir dele (11 páginas, 24 commits
fora os merges).

## 1. A stack é realmente simples?

**Nas ferramentas, sim.** HTML, CSS e JS puros, zero dependência, `git push` é o deploy,
Python só para utilitários opcionais. Quem sabe HTML entende o repositório inteiro.

**No conteúdo, não.** Simples de *entender* não é o mesmo que simples de *manter*:

| Medida | Template (5 páginas) | Mentalize (11 páginas) |
|---|---|---|
| Linhas repetidas por página (`<head>` + cabeçalho + rodapé) | ~75 de ~110–240 | ~80 de ~110–290 (≈40%) |
| Commits que editaram **todas** as páginas para uma só mudança | — | **10 de 24** |
| Commits que precisaram subir a `VERSAO` do service worker | — | **14 de 24** |

Os 10 commits "em todas as páginas" foram mudanças transversais: uma meta tag de
verificação da Meta, dois ajustes de CSP, o `color-scheme`, o logo do cabeçalho, o domínio
novo, um item de menu. Cada um é trivial, mas repetido 10 vezes à mão — e é aí que nascem
os erros que o `tools/checar-site.py` e o `tools/hash-csp-404.py` existem para pegar.
Esses dois scripts, o `<noscript>` duplicado e o Web Component `<cabecalho-site>` são,
todos, **compensação pela falta de um sistema de layout**.

A organização do repositório em si está boa: páginas na raiz (exigência do Pages sem
build), `css/`, `js/`, `assets/`, `docs/`, `tools/`. Não há pasta sobrando nem
abstração prematura. A complexidade que existe está no **service worker** e na
**duplicação**, não na estrutura de pastas.

## 2. O que o Astro resolveria

Astro gera HTML estático (zero JS por padrão), então o resultado publicado continua
sendo o que este template já produz. O que muda é a fonte:

- **Um `Layout.astro`** com `<head>`, CSP, meta tags, cabeçalho e rodapé. Cada página
  passa só título, descrição e conteúdo. As 10 edições em massa da Mentalize viram
  1 edição cada.
- **Menu estático, gerado no build**: some o `<cabecalho-site>` (93 linhas de JS) e o
  `<noscript>` duplicado — o menu já sai no HTML, visível sem JS.
- **Sitemap automático** (`@astrojs/sitemap`), respeitando as páginas `noindex`.
- **Dados do negócio num lugar só** (nome, telefone, endereço, horário): hoje estão
  repetidos no JSON-LD, no rodapé de cada página, em `contato.html` e no `site.js`.
- **Hash de assets no nome do arquivo**: o cache de navegador se resolve sozinho, o que
  reduz o motivo para manter o service worker.
- Boa parte de `tools/checar-site.py` deixa de ser necessária: o erro que ele procura
  não tem mais como acontecer.

## 3. O que o Astro custaria

- **Etapa de build e Node.js**: `package.json`, lockfile e dependências para atualizar
  (Dependabot). Some o "abre o HTML e edita" — vira "edita o `.astro`" (que é HTML com um
  cabeçalho de frontmatter, mas exige `npm install` e `npm run dev` para ver o resultado).
- **Deploy por GitHub Actions** (`withastro/action`) em vez de "Deploy from a branch"; no
  project page, `site` + `base` no `astro.config.mjs`; com domínio próprio, sem `base`.
- **CSP exige cuidado**: o Astro pode embutir CSS pequeno inline (configurável com
  `build.inlineStylesheets: 'never'`), e o suporte nativo a CSP com hashes ainda era
  **experimental** na linha 5.x (`experimental.csp`, desde a 5.9, não funciona no
  `astro dev`). Dá para manter a CSP estrita deste template, mas precisa ser verificado na
  migração, não presumido.
- Uma migração: ~5 páginas aqui, ~11 na Mentalize. Pequena, mas não gratuita.

## 4. Recomendação

1. **Astro vale a pena para este template**, porque o uso real dele é gerar vários sites
   de cliente com 8–12 páginas e mudanças transversais frequentes — exatamente o cenário
   em que a duplicação custa mais. Para um site único de 3 páginas que quase não muda, o
   zero-build atual seria a escolha mais simples.
2. **Fazer como piloto, em PR separado** (não neste): migrar as páginas para um
   `Layout.astro`, comparar o HTML gerado com o atual (mesmo `<head>`, mesma CSP, nenhum
   script a mais) e só então decidir. Critério de sucesso: Lighthouse e CSP iguais aos de
   hoje, e uma mudança de rodapé tocando um arquivo só.
3. **Independentemente do Astro, considerar remover o service worker.** Funcionar
   offline tem pouco valor para um site institucional, e a regra "subir a `VERSAO`" pesou
   em 14 de 24 commits da Mentalize. Sem ele saem `sw.js`, `js/sw-registro.js` e
   `manifest.webmanifest` (~240 linhas) e um item do checklist de release. Pequeno,
   reversível, e pode ser feito antes ou junto do piloto.
4. **Também opcional**: o alternador manual de tema (`tema.js`, `tema-boot.js` e o bloco
   escuro duplicado em `tokens.css`) poderia dar lugar a seguir só a preferência do
   sistema — menos código, ao custo de um recurso que alguns visitantes usam.

Referências: [Astro — CSP experimental](https://v5.docs.astro.build/en/reference/experimental-flags/csp/),
[Astro 5.9](https://astro.build/blog/astro-590/),
[Astro — deploy no GitHub Pages](https://docs.astro.build/en/guides/deploy/github/).
