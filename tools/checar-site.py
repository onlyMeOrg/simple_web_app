#!/usr/bin/env python3
"""
checar-site.py — confere as regras do template que dependem de memória.

Cada uma já foi esquecida ao menos uma vez num site real feito a partir
deste template; o CI roda este script a cada push/PR.

  1. Toda página .html da raiz e todo arquivo local que ela carrega (CSS, JS,
     imagem, ícone, manifesto) estão no PRECACHE de sw.js — senão a página
     não funciona offline.
  2. O <noscript> de cada página lista os mesmos links do array PAGINAS de
     js/componentes/cabecalho-site.js — o menu sem JS não pode divergir.
  3. Página indexável está no sitemap.xml; página "noindex" não está.
  4. Todo link wa.me tem utm_content (rastreamento por botão, docs/ANALYTICS.md)
     e a mensagem pré-preenchida (text=) não tem emoji — vira "�" na página
     de envio do WhatsApp em alguns navegadores.

Uso:
    python3 tools/checar-site.py
"""

import pathlib
import re
import sys
from urllib.parse import parse_qs, unquote, urlparse

RAIZ = pathlib.Path(__file__).resolve().parent.parent
problemas = []


def ler(caminho):
    return (RAIZ / caminho).read_text(encoding="utf-8")


def sem_comentarios(html):
    return re.sub(r"<!--.*?-->", "", html, flags=re.S)


sw = ler("sw.js")
precache = {m.removeprefix("./") for m in re.findall(r'"(\./[^"]*)"', sw)}
paginas_menu = re.findall(r'href: "([^"]+)"', ler("js/componentes/cabecalho-site.js"))
sitemap = set(re.findall(r"<loc>([^<]+)</loc>", ler("sitemap.xml")))

for arquivo in sorted(RAIZ.glob("*.html")):
    nome = arquivo.name
    html = sem_comentarios(arquivo.read_text(encoding="utf-8"))

    # 1. PRECACHE
    if nome not in precache:
        problemas.append(f"{nome}: fora do PRECACHE de sw.js")
    if nome != "404.html":
        for ref in re.findall(r'(?:href|src)="\./([^"#?]+)"', html):
            if not ref.endswith(".html") and ref not in precache:
                problemas.append(f"{nome}: ./{ref} fora do PRECACHE de sw.js")

    # 2. <noscript> espelha PAGINAS
    noscript = re.search(r"<noscript>(.*?)</noscript>", html, re.S)
    if "<cabecalho-site" in html:
        links = re.findall(r'href="([^"]+)"', noscript.group(1)) if noscript else []
        if links != paginas_menu:
            problemas.append(f"{nome}: <noscript> difere de PAGINAS em cabecalho-site.js")

    # 3. sitemap × noindex
    if nome != "404.html":
        canonical = re.search(r'<link rel="canonical" href="([^"]+)"', html)
        noindex = re.search(r'<meta name="robots" content="[^"]*noindex', html)
        no_sitemap = bool(canonical) and canonical.group(1) in sitemap
        if noindex and no_sitemap:
            problemas.append(f"{nome}: é noindex mas está no sitemap.xml")
        if not noindex and not no_sitemap:
            problemas.append(f"{nome}: é indexável mas falta no sitemap.xml (pela URL canonical)")

    # 4. WhatsApp
    for url in re.findall(r'href="(https://wa\.me/[^"]*)"', html):
        consulta = parse_qs(urlparse(url.replace("&amp;", "&")).query)
        if "utm_content" not in consulta:
            problemas.append(f"{nome}: link wa.me sem utm_content: {url}")
        texto = unquote(" ".join(consulta.get("text", [])))
        if any(ord(c) > 0xFFFF or 0x2600 <= ord(c) <= 0x27BF for c in texto):
            problemas.append(f"{nome}: emoji no text= do WhatsApp: {url}")

if problemas:
    print("\n".join(problemas))
    sys.exit(f"{len(problemas)} problema(s) — ver README, seção \"Checklist de release\"")
print("site: tudo em dia")
