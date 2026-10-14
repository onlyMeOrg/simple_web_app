#!/usr/bin/env python3
"""Recalcula a CSP de 404.html a partir do <style> e do <script> embutidos.

404.html é servido em qualquer caminho inexistente (inclusive aninhado), então
não pode depender de CSS/JS externo com caminho relativo. Em vez de liberar
'unsafe-inline', a CSP dele lista o hash SHA-256 exato de cada bloco embutido.
Rode este script sempre que editar um desses blocos:

    python3 tools/hash-csp-404.py          # reescreve a CSP no próprio arquivo
    python3 tools/hash-csp-404.py --checar # só confere (sai com erro se defasada)
"""

import base64
import hashlib
import pathlib
import re
import sys

ARQUIVO = pathlib.Path(__file__).resolve().parent.parent / "404.html"


def sha256(conteudo):
    return "'sha256-" + base64.b64encode(hashlib.sha256(conteudo.encode("utf-8")).digest()).decode() + "'"


def csp_esperada(html):
    html = re.sub(r"<!--.*?-->", "", html, flags=re.S)  # comentários citam as tags
    estilos = re.findall(r"<style>(.*?)</style>", html, re.S)
    scripts = re.findall(r"<script>(.*?)</script>", html, re.S)
    return (
        "default-src 'self'; img-src 'self' data:; "
        f"style-src {' '.join(map(sha256, estilos))}; "
        f"script-src {' '.join(map(sha256, scripts))}; "
        "base-uri 'self'; form-action 'none'; object-src 'none'"
    )


def main():
    html = ARQUIVO.read_text(encoding="utf-8")
    padrao = r'(<meta http-equiv="Content-Security-Policy" content=")[^"]*(">)'
    atual = re.search(padrao, html).group(0)
    nova = re.sub(padrao, lambda m: m.group(1) + csp_esperada(html) + m.group(2), atual)
    if "--checar" in sys.argv:
        if atual != nova:
            sys.exit("404.html: CSP defasada — rode python3 tools/hash-csp-404.py")
        print("404.html: CSP em dia")
        return
    ARQUIVO.write_text(html.replace(atual, nova), encoding="utf-8")
    print("404.html: CSP atualizada")


if __name__ == "__main__":
    main()
