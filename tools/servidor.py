#!/usr/bin/env python3
"""Servidor de desenvolvimento — só biblioteca padrão, sem dependências.

python3 -m http.server resolve o básico, mas erra em três pontos que
importam para esta SPA:
  1. serve .webmanifest como application/octet-stream (o navegador ignora
     o manifesto silenciosamente);
  2. não manda Cache-Control: no-store, então o service worker em
     desenvolvimento pode servir uma versão desatualizada dos arquivos;
  3. serve seu próprio 404 embutido, o que impede testar o 404.html do
     projeto localmente.

Uso:
  python3 tools/servidor.py                     # serve a raiz em /
  python3 tools/servidor.py --base simple_web_app
                                                  # simula o project page,
                                                  # servindo em /simple_web_app/
                                                  # -- o ensaio da migração de domínio
  python3 tools/servidor.py --porta 8080
"""

import argparse
import http.server
import os
import sys

RAIZ_DO_SITE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

MIME_EXTRA = {
    ".webmanifest": "application/manifest+json",
}


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, base="", **kwargs):
        self.base = base
        super().__init__(*args, directory=RAIZ_DO_SITE, **kwargs)

    def guess_type(self, path):
        for extensao, tipo in MIME_EXTRA.items():
            if path.endswith(extensao):
                return tipo
        return super().guess_type(path)

    def end_headers(self):
        # Essencial ao testar o service worker: nunca serve arquivos velhos do cache do navegador.
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def translate_path(self, path):
        # Simula o prefixo /<repositorio>/ do GitHub Pages (project page).
        if self.base:
            prefixo = f"/{self.base}/"
            if path == f"/{self.base}":
                path = prefixo
            if path.startswith(prefixo):
                path = "/" + path[len(prefixo):]
            elif path != "/":
                # Fora do prefixo esperado: cai no 404.html, como no GitHub Pages de verdade.
                path = "/404.html"
        return super().translate_path(path)

    def send_error(self, code, message=None, explain=None):
        if code == 404:
            caminho_404 = os.path.join(RAIZ_DO_SITE, "404.html")
            if os.path.isfile(caminho_404):
                self.send_response(404)
                self.send_header("Content-Type", "text/html; charset=utf-8")
                self.end_headers()
                with open(caminho_404, "rb") as arquivo:
                    self.wfile.write(arquivo.read())
                return
        super().send_error(code, message, explain)


def principal():
    ap = argparse.ArgumentParser()
    ap.add_argument("--porta", type=int, default=8000)
    ap.add_argument("--base", default="", help="prefixo para simular o project page do GitHub Pages")
    args = ap.parse_args()

    def fabrica(*handler_args, **handler_kwargs):
        Handler(*handler_args, base=args.base, **handler_kwargs)

    endereco = f"http://localhost:{args.porta}/{args.base + '/' if args.base else ''}"
    print(f"Servindo {RAIZ_DO_SITE} em {endereco}  (Ctrl+C para parar)")
    with http.server.ThreadingHTTPServer(("", args.porta), fabrica) as servidor:
        try:
            servidor.serve_forever()
        except KeyboardInterrupt:
            sys.exit(0)


if __name__ == "__main__":
    principal()
