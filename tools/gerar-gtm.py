#!/usr/bin/env python3
"""
gerar-gtm.py — gera um contêiner do Google Tag Manager pronto para importar,
com um acionador e um evento por botão de WhatsApp do site.

Como funciona o rastreamento: cada link wa.me do site carrega um utm_content
único no formato <pagina>_<secao> (ex.: wa.me/...?utm_content=inicio_heroi).
O WhatsApp ignora o parâmetro; o GTM lê a URL clicada e sabe exatamente qual
botão gerou o lead. Este script VARRE OS PRÓPRIOS HTML para descobrir os
slugs (no HTML gerado em dist/ — rode `npm run build` antes), então o
contêiner nunca dessincroniza do que está publicado. Os links nascem da
função whatsapp() de src/dados/negocio.js.

O que o JSON contém:
  - variável "Click - utm_content" (URL do clique → parâmetro utm_content)
  - uma constante por ID preenchido abaixo — trocar um ID é um lugar só
  - um acionador "[Lead] Botão WPP - <rótulo>" por slug (clique em link,
    Click URL contém wa.me + utm_content contém <slug>)
  - GA4: tag do Google na inicialização + um evento "clickwpp_<slug>" por
    acionador
  - Google Ads (se GOOGLE_ADS_ID): tag do Google do Ads + Vinculador de
    conversões, que preserva o gclid dos cliques vindos de anúncios — sem ele,
    as conversões atribuem mal (o painel de Qualidade do GTM acusa como Urgente)
  - Pixel da Meta (se META_PIXEL_ID): código base (init + PageView) como HTML
    personalizado — 100% importável, sem baixar template da galeria — e um
    evento Lead disparado por todos os acionadores, com o slug em
    content_name. Sem o <noscript><img> oficial: dispararia sem checar o
    consentimento do site.

Fica manual no painel: as tags de conversão do Google Ads (dependem das
conversões criadas na conta) e o Publicar. Ver docs/ANALYTICS.md.

Uso:
    npm run build && python3 tools/gerar-gtm.py   # escreve tools/gtm-container.json
"""

import json
import pathlib
import re
import sys
from datetime import datetime, timezone

RAIZ = pathlib.Path(__file__).resolve().parent.parent
DESTINO = RAIZ / "tools/gtm-container.json"

NOME_CONTAINER = "Clínica Sorriso Pleno - Web"
GA4_ID = "G-XXXXXXXXXX"  # obrigatório: "ID de métricas" do fluxo de dados do GA4
GOOGLE_ADS_ID = ""  # opcional: "AW-..." — vazio = sem tags do Google Ads
META_PIXEL_ID = ""  # opcional: só dígitos — vazio = sem Pixel da Meta

# Rótulo humano de cada slug, no formato "<Página> - <Seção>". Slug sem
# rótulo aqui faz o script parar: o nome aparece nos relatórios, então vale
# escolhê-lo de propósito.
ROTULOS = {
    "inicio_heroi": "Início - Herói",
    "inicio_cta_final": "Início - CTA final",
    "galeria_cta_final": "Galeria - CTA final",
    "contato_botao": "Contato - Botão",
    "privacidade_dados": "Privacidade - Dados",
}


def slugs_do_site():
    achados = set()
    paginas = sorted((RAIZ / "dist").glob("*.html"))
    if not paginas:
        sys.exit("dist/ vazio: rode `npm run build` antes")
    for arquivo in paginas:
        texto = arquivo.read_text(encoding="utf-8")
        for m in re.finditer(r'href="https://wa\.me/[^"]*utm_content=([a-z0-9_]+)', texto):
            achados.add(m.group(1))
    return sorted(achados)


def constante(variable_id, nome, valor):
    return {
        "variableId": variable_id,
        "name": nome,
        "type": "c",
        "parameter": [{"type": "TEMPLATE", "key": "value", "value": valor}],
    }


def tag(tag_id, nome, tipo, parametros, acionadores):
    return {
        "tagId": tag_id,
        "name": nome,
        "type": tipo,
        "parameter": parametros,
        "firingTriggerId": acionadores,
        "tagFiringOption": "ONCE_PER_EVENT",
    }


def html_personalizado(codigo):
    return [
        {"type": "TEMPLATE", "key": "html", "value": codigo},
        {"type": "BOOLEAN", "key": "supportDocumentWrite", "value": "false"},
    ]


def main():
    slugs = slugs_do_site()
    sem_rotulo = [s for s in slugs if s not in ROTULOS]
    if sem_rotulo:
        sys.exit(f"slugs no site sem rótulo em ROTULOS: {sem_rotulo}")

    variaveis = [
        {
            "variableId": "1",
            "name": "Click - utm_content",
            "type": "u",
            "parameter": [
                {"type": "TEMPLATE", "key": "component", "value": "QUERY"},
                {"type": "TEMPLATE", "key": "queryKey", "value": "utm_content"},
                {"type": "TEMPLATE", "key": "customUrlSource", "value": "{{Click URL}}"},
            ],
        },
        constante("2", "GA4 - ID de métricas", GA4_ID),
    ]
    # Acionador de inicialização próprio (equivalente ao builtin
    # "Initialization - All Pages", sem depender do id interno dele).
    acionadores = [{"triggerId": "10", "name": "Initialization - Todas as páginas", "type": "INIT"}]
    tags = [
        tag("100", "00 - [GT] GA4", "googtag",
            [{"type": "TEMPLATE", "key": "tagId", "value": "{{GA4 - ID de métricas}}"}], ["10"]),
    ]

    if GOOGLE_ADS_ID:
        variaveis.append(constante("3", "Google Ads - ID da conta", GOOGLE_ADS_ID))
        tags += [
            tag("98", f"00 - [GT] Google Ads - {GOOGLE_ADS_ID}", "googtag",
                [{"type": "TEMPLATE", "key": "tagId", "value": "{{Google Ads - ID da conta}}"}], ["10"]),
            tag("99", "00 - [Google Ads] Vinculador de conversões", "gclidw",
                [{"type": "BOOLEAN", "key": "enableCrossDomain", "value": "false"},
                 {"type": "BOOLEAN", "key": "enableUrlPassthrough", "value": "false"}], ["10"]),
        ]

    for indice, slug in enumerate(slugs):
        rotulo = ROTULOS[slug]
        id_acionador = str(11 + indice)
        acionadores.append(
            {
                "triggerId": id_acionador,
                "name": f"[Lead] Botão WPP - {rotulo}",
                "type": "LINK_CLICK",
                "filter": [
                    {
                        "type": "CONTAINS",
                        "parameter": [
                            {"type": "TEMPLATE", "key": "arg0", "value": "{{Click URL}}"},
                            {"type": "TEMPLATE", "key": "arg1", "value": "wa.me"},
                        ],
                    },
                    {
                        "type": "CONTAINS",
                        "parameter": [
                            {"type": "TEMPLATE", "key": "arg0", "value": "{{Click - utm_content}}"},
                            {"type": "TEMPLATE", "key": "arg1", "value": slug},
                        ],
                    },
                ],
                "waitForTags": {"type": "BOOLEAN", "value": "false"},
                "checkValidation": {"type": "BOOLEAN", "value": "false"},
            }
        )
        evento = f"clickwpp_{slug}"
        assert len(evento) <= 40, f"nome de evento GA4 acima de 40 caracteres: {evento}"
        tags.append(
            tag(str(101 + indice), f"02 - [GA4] Evento - Botão WPP {rotulo} - {evento}", "gaawe",
                [{"type": "TEMPLATE", "key": "eventName", "value": evento},
                 {"type": "TEMPLATE", "key": "measurementIdOverride", "value": "{{GA4 - ID de métricas}}"}],
                [id_acionador])
        )

    if META_PIXEL_ID:
        variaveis.append(constante("4", "Meta - Pixel ID", META_PIXEL_ID))
        base_pixel = (
            "<script>\n"
            "!function(f,b,e,v,n,t,s)\n"
            "{if(f.fbq)return;n=f.fbq=function(){n.callMethod?\n"
            "n.callMethod.apply(n,arguments):n.queue.push(arguments)};\n"
            "if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';\n"
            "n.queue=[];t=b.createElement(e);t.async=!0;\n"
            "t.src=v;s=b.getElementsByTagName(e)[0];\n"
            "s.parentNode.insertBefore(t,s)}(window,document,'script',\n"
            "'https://connect.facebook.net/en_US/fbevents.js');\n"
            "fbq('init', '{{Meta - Pixel ID}}');\n"
            "fbq('track', 'PageView');\n"
            "</script>"
        )
        lead_pixel = (
            "<script>\n"
            "if (window.fbq) {\n"
            "  fbq('track', 'Lead', {content_name: '{{Click - utm_content}}'});\n"
            "}\n"
            "</script>"
        )
        tags += [
            tag("200", "00 - [Meta] Pixel - Código base", "html", html_personalizado(base_pixel), ["10"]),
            tag("201", "01 - [Meta] Lead - Botão WPP (todos os acionadores)", "html",
                html_personalizado(lead_pixel), [str(11 + i) for i in range(len(slugs))]),
        ]

    container = {
        "exportFormatVersion": 2,
        "exportTime": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S"),
        "containerVersion": {
            "path": "accounts/0/containers/0/versions/0",
            "accountId": "0",
            "containerId": "0",
            "containerVersionId": "0",
            "container": {
                "path": "accounts/0/containers/0",
                "accountId": "0",
                "containerId": "0",
                "name": NOME_CONTAINER,
                "publicId": "GTM-0000000",
                "usageContext": ["WEB"],
            },
            "builtInVariable": [
                {"type": "PAGE_URL", "name": "Page URL"},
                {"type": "PAGE_PATH", "name": "Page Path"},
                {"type": "CLICK_URL", "name": "Click URL"},
                {"type": "CLICK_TEXT", "name": "Click Text"},
            ],
            "variable": variaveis,
            "trigger": acionadores,
            "tag": tags,
        },
    }

    DESTINO.write_text(json.dumps(container, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(DESTINO.relative_to(RAIZ))
    print(f"  {len(slugs)} slugs → {len(acionadores)} acionadores, {len(tags)} tags, {len(variaveis)} variáveis")


if __name__ == "__main__":
    main()
