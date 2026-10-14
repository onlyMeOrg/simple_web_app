# Domínio personalizado

> **English summary**: this is the runbook for pointing a custom domain at this GitHub
> Pages site later. Activation is a one-line `CNAME` file commit; DNS records and the
> HTTPS/verification steps are documented below in Portuguese. The app code needs
> **zero changes** — every internal path across the site's pages is already relative.

Este guia é executado **quando** houver um domínio escolhido. Até lá, o site vive em
`https://pgillets.github.io/simple_web_app/` e nada aqui precisa ser feito.

## 1. Visão geral

O que muda: a URL do site. O que **não** muda: o fluxo de deploy (`git push` →
publicado), o código da aplicação (todos os caminhos internos são relativos) e o
processo de build (continua não existindo nenhum).

## 2. Pré-requisitos

- Ter o domínio registrado e acesso ao painel de DNS dele.
- Decidir a forma canônica: domínio apex (`exemplo.com.br`), `www` (`www.exemplo.com.br`)
  ou um subdomínio (`app.exemplo.com.br`). A recomendação é configurar **apex + www**
  juntos (o GitHub redireciona um para o outro automaticamente), com o `CNAME` do
  repositório apontando para a forma escolhida como canônica.

## 3. Verificar o domínio no GitHub (antes de tudo)

Isso evita que alguém tome posse do domínio via Pages caso o site seja desativado no
futuro enquanto o DNS ainda aponta para o GitHub.

1. **Settings da conta** (não do repositório) → **Pages** → **Add a domain**.
2. Informe o domínio apex e crie o registro **TXT** indicado, algo como:
   `_github-pages-challenge-pgillets.exemplo.com.br` → token fornecido pelo GitHub.
3. Clique em **Verify**. Verificar o apex cobre todos os subdomínios dele.

## 4. Registros de DNS

**Domínio apex** (`exemplo.com.br`):

| Tipo | Nome | Valor |
|---|---|---|
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |
| AAAA | `@` | `2606:50c0:8000::153` |
| AAAA | `@` | `2606:50c0:8001::153` |
| AAAA | `@` | `2606:50c0:8002::153` |
| AAAA | `@` | `2606:50c0:8003::153` |

**`www` ou subdomínio** (`www.exemplo.com.br` ou `app.exemplo.com.br`):

| Tipo | Nome | Valor |
|---|---|---|
| CNAME | `www` (ou o subdomínio) | `pgillets.github.io.` |

Atenção: o CNAME aponta para `pgillets.github.io`, **nunca** para
`pgillets.github.io/simple_web_app`.

Antes de trocar qualquer coisa, **fotografe a zona atual** (nameservers, A, MX, TXT):

- **Registro MX** existe? Então há e-mail no domínio — não mexa nele (a troca acima só
  envolve A/AAAA do apex e o CNAME do `www`). Sem MX, a troca não derruba caixa nenhuma.
- **TXT** de `_dmarc`, SPF ou verificações (Google, Meta): deixe intactos.
- **Registros A de estacionamento** do registrador (ex.: GoDaddy, `13.248.243.5` e
  `76.223.105.230`): remova-os — conflitam com os do GitHub.

Para conferir depois da propagação (deve listar os quatro `185.199.x.153`):

```bash
python3 -c "import socket; print(sorted({i[4][0] for i in socket.getaddrinfo('exemplo.com.br', 443)}))"
```

Outros cuidados:
- **GoDaddy: desligue o redirecionamento** (*Domain Settings → Forwarding*) **antes** de
  salvar o DNS. Os A de estacionamento vêm desse *forwarding*; com ele ativo, a GoDaddy
  recria os registros e sobrescreve os do GitHub. Outros registradores têm recursos
  equivalentes ("URL redirect", "parking") — desligue também.
- O `www` como CNAME já basta para o Pages redirecionar `www` → apex com 301; não
  configure redirecionamento no registrador.
- Se a zona tiver um registro **CAA**, ele precisa permitir `letsencrypt.org`, ou a
  emissão do certificado HTTPS falha silenciosamente.
- Reduza o **TTL** dos registros antigos para algo baixo (ex.: 300s) um pouco antes da
  troca, para acelerar a propagação.
- Remova registros conflitantes (A/AAAA/ALIAS antigos, CNAMEs de parking).

## 5. O commit de uma linha

Crie o arquivo `CNAME` na raiz do repositório, na branch `main`, contendo **só** o
domínio escolhido (sem `http://`, sem barra final):

```
exemplo.com.br
```

Esse commit é suficiente: o próximo deploy do Pages lê o arquivo e preenche sozinho o
campo "Custom domain" em Settings → Pages. (O caminho inverso também funciona — digitar
o domínio direto em Settings → Pages cria esse mesmo commit automaticamente — mas dê
preferência ao commit direto, que é rastreável no histórico do repositório.)

## 6. HTTPS

1. Aguarde o indicador de DNS em Settings → Pages ficar verde.
2. O GitHub emite um certificado Let's Encrypt automaticamente — normalmente em
   minutos, mas pode levar até ~24h se a propagação de DNS for lenta.
3. Assim que o certificado existir, marque **"Enforce HTTPS"**. Antes disso a opção
   fica desabilitada — não esqueça de voltar e marcá-la.

## 7. Checklist pós-migração (só código, sem risco)

O código da aplicação não precisa de nenhuma mudança — todos os caminhos internos
(CSS, JS, imagens, links entre páginas) já são relativos e funcionam em qualquer base.
O que **vale a pena** atualizar, por serem as únicas URLs absolutas do projeto:

- [ ] `index.html`: `<link rel="canonical">`, `og:url`, `og:image`, `twitter:image` e as URLs dentro do
      bloco `<script type="application/ld+json">` → novo domínio.
- [ ] `sobre.html`, `contato.html`, `galeria.html`, `privacidade.html`:
      `<link rel="canonical">`, `og:url`, `og:image`, `twitter:image` → novo domínio.
- [ ] `robots.txt`: a linha `Sitemap:` → novo domínio.
- [ ] `sitemap.xml`: a(s) `<loc>` → novo domínio (já existem desde o início — só
      trocar a URL, não recriar).
- [ ] `.github/workflows/ci.yml`: troque o `--exclude` de `pgillets\.github\.io` pelo
      domínio novo — o lychee não deve checar a própria URL de produção (dependência
      circular entre o CI e o Pages publicado).
- [ ] `404.html`: com domínio próprio o destino do redirecionamento é sempre `/`; a
      detecção do subcaminho do project page pode virar `var destino = "/";` (depois,
      `python3 tools/hash-csp-404.py`). `tools/servidor.py --base` também deixa de ser
      necessário.
- [ ] Atualizar as URLs mencionadas no `README.md`.
- [ ] Se usar a Meta (Pixel/anúncios), verifique o domínio novo por meta tag — ver
      [`ANALYTICS.md`](ANALYTICS.md#armadilhas-já-pisadas).
- [ ] Nada a fazer com a URL antiga: `pgillets.github.io/simple_web_app/`
      passa a redirecionar (301) para o domínio novo automaticamente.

## 8. Solução de problemas

| Sintoma | Causa provável |
|---|---|
| DNS não verifica no Settings → Pages | Propagação ainda em andamento (pode levar até 24-48h); confira com `dig` se os registros já resolvem. |
| "Enforce HTTPS" continua cinza | O certificado ainda não foi emitido — normalmente resolve sozinho; verifique se há um CAA record bloqueando o Let's Encrypt. |
| Domínio abre mas mostra 404 do GitHub | O arquivo `CNAME` foi removido (algumas ferramentas de build/deploy o apagam); confirme que ele ainda existe na raiz da `main`. |
| Alguém "roubou" o subdomínio antigo | É por isso que o Passo 3 (verificação) deve ser feito antes de qualquer coisa. |
