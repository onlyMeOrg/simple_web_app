# Analytics: Google Tag Manager, GA4, Google Ads e Pixel da Meta

> **English summary**: analytics ship **off**. Turning them on takes a GTM container
> ID in `js/consentimento.js` plus a widened CSP on each content page (the exact
> allow-list below was learned from real blocks in GTM's debugger). Nothing third-party
> runs before the visitor clicks "Accept" on the cookie banner. Every WhatsApp button
> carries a unique `utm_content`, and `tools/gerar-gtm.py` turns those into an importable
> GTM container with one trigger and one event per button.

O template vem com o rastreamento **desligado**: sem faixa de cookies, sem nenhum
script de terceiro. Esta é a receita para ligar — validada em produção num site real
feito a partir deste template.

## Como funciona

- **Gate de consentimento** (`js/consentimento.js`): nada de terceiro executa antes do
  clique em "Aceitar". Só então o GTM é carregado — e GA4, Ads e Pixel vivem **dentro**
  do contêiner do GTM, configurados no painel, sem novas edições no site.
- **Não cole o snippet oficial do GTM nas páginas.** Ele carregaria sem passar pelo
  gate. O `<noscript><iframe>` oficial também fica de fora: dispara sem qualquer chance
  de checar consentimento.
- **Um `utm_content` por botão de WhatsApp**, no formato `<pagina>_<secao>`
  (ex.: `wa.me/5511999999999?utm_content=inicio_heroi`). O WhatsApp ignora o parâmetro;
  o GTM lê a URL clicada e sabe qual botão gerou o lead. Um link no rodapé, repetido em
  todas as páginas, usa um slug único (`rodape`): a página de origem já vem no
  `page_path` do GA4.
- **`privacidade.html`** explica tudo isso ao visitante, e o rodapé de cada página ganha
  "Gerenciar cookies" (escondido enquanto o GTM estiver desligado).

## Ligando

1. **Crie o contêiner** no [Google Tag Manager](https://tagmanager.google.com/) e copie o
   ID `GTM-XXXXXXX` para a constante `GTM_CONTAINER_ID` no topo de
   `js/consentimento.js` — é o único lugar do código com o ID.
2. **Abra a CSP** de cada página de conteúdo (todas menos `404.html`, que continua sem
   rastreamento). Troque a `<meta http-equiv="Content-Security-Policy">` por:

   ```text
   default-src 'self'; img-src 'self' data: https://www.facebook.com https://www.googletagmanager.com https://*.google-analytics.com https://www.google.com https://www.google.com.br https://googleads.g.doubleclick.net https://ad.doubleclick.net; script-src 'self' https://www.googletagmanager.com https://connect.facebook.net https://www.googleadservices.com https://googleads.g.doubleclick.net; connect-src 'self' https://www.googletagmanager.com https://*.google-analytics.com https://analytics.google.com https://*.analytics.google.com https://www.facebook.com https://connect.facebook.net https://www.google.com https://www.google.com.br https://googleads.g.doubleclick.net https://ad.doubleclick.net; frame-src https://www.googletagmanager.com https://td.doubleclick.net; base-uri 'self'; form-action 'none'; object-src 'none'
   ```

   Lista fechada, sem curinga amplo e sem `'unsafe-inline'`. Cada host está aí por ter
   sido **bloqueado de verdade** no depurador do GTM:
   - `googletagmanager.com` em `img-src`: beacons de diagnóstico do próprio GTM (`/td`, `/a`).
   - `*.google-analytics.com`: cobre `www` e o endpoint regional (`region1`) do GA4.
   - `www.google.com` / `ad.doubleclick.net` em `connect-src`: medição de conversão do
     vínculo GA4 ↔ Google Ads (`/ccm/collect`) — aparece mesmo sem tag de Ads no contêiner.
   - `googleads.g.doubleclick.net` também em **`script-src`**: o vínculo GA4 ↔ Ads carrega
     um *script* de lá (`viewthroughconversion`); liberar só em `img-src`/`connect-src` não basta.
   - `www.googleadservices.com`, `www.google.com.br`, `td.doubleclick.net` (`frame-src`):
     tags de conversão e remarketing do Google Ads.
   - `connect.facebook.net` / `www.facebook.com`: Pixel da Meta.

   Sem Pixel da Meta ou sem Google Ads, dá para tirar os hosts correspondentes.
3. **Gere o contêiner**: preencha `GA4_ID` (e, se houver, `GOOGLE_ADS_ID` e
   `META_PIXEL_ID`) no topo de `tools/gerar-gtm.py` e rode:

   ```bash
   python3 tools/gerar-gtm.py   # escreve tools/gtm-container.json
   ```

   O script varre os HTML e cria um acionador `[Lead] Botão WPP - <rótulo>` e um evento
   GA4 `clickwpp_<slug>` por botão. Como ele lê o site, contêiner e páginas não
   dessincronizam. Botão novo = `utm_content` novo + rótulo em `ROTULOS` + rodar de novo.
4. **Importe** no GTM: **Administrador → Importar contêiner** → `tools/gtm-container.json`
   → workspace existente → **Mesclar**. Nada é publicado nesse passo.
5. **Manual no painel**: as tags de conversão do Google Ads (uma por acionador `[Lead]`,
   dependem das conversões criadas na conta do Ads).
6. **Teste no modo de visualização** do GTM — aceite a faixa de cookies antes, ou nada
   carrega — e confira o console do navegador: qualquer bloqueio de CSP aparece lá com o
   host exato. Então **publique**.
7. Suba a `VERSAO` em `sw.js` (o HTML e o `consentimento.js` estão no `PRECACHE`).

## Armadilhas já pisadas

- **Sem emoji no `text=` pré-preenchido do WhatsApp.** Um 😊 (4 bytes em UTF-8) aparecia
  como "�" na página de envio do WhatsApp em alguns navegadores. Acentos são seguros.
- **Faltou o Vinculador de conversões?** O painel "Qualidade do contêiner" do GTM acusa
  como *Urgente*: sem ele, o `gclid` dos cliques vindos de anúncios se perde e as
  conversões atribuem mal. O gerador já cria essa tag quando há `GOOGLE_ADS_ID`.
- **Pixel como HTML personalizado**, não como template da galeria do GTM: assim o JSON é
  100% importável, sem depender de o painel baixar template durante a importação.
- **Verificação de domínio na Meta** (Business Manager → Segurança da marca → Domínios):
  prefira a opção **meta tag** — `<meta name="facebook-domain-verification" content="...">`
  no `<head>`. A raiz é a que a Meta confere; pôr em todas as páginas de conteúdo dá
  robustez. **Não remova depois**: a Meta re-verifica periodicamente, e domínio verificado
  é pré-requisito para configurar eventos priorizados nas campanhas.
