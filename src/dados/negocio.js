/*
 * negocio.js — os dados do negócio, num lugar só.
 *
 * CONTEÚDO DE EXEMPLO — troque pelo da sua empresa. Tudo que aparece em mais
 * de uma página (nome, telefone, endereço, horário, WhatsApp, o ID do Google
 * Tag Manager) vem daqui: o cabeçalho, o rodapé, o JSON-LD, o selo "Aberto
 * agora" e a CSP leem estes valores no build. Mudou aqui, mudou no site todo.
 */

export const NEGOCIO = {
  nome: "Clínica Sorriso Pleno",
  // Subtipo de https://schema.org/LocalBusiness mais adequado ao negócio.
  tipoSchema: "Dentist",
  priceRange: "$$",
  telefone: { exibicao: "(11) 4000-0000", e164: "+551140000000" },
  email: "contato@clinicaexemplo.com.br",
  // Número do WhatsApp só com dígitos, com DDI e DDD.
  whatsapp: "5511999999999",
  endereco: {
    rua: "Rua Exemplo, 123",
    cidade: "São Paulo",
    estado: "SP",
    cep: "01000-000",
    pais: "BR",
  },
  geo: { latitude: -23.5505, longitude: -46.6333 },
  // Usado no JSON-LD, no texto de contato.html e no selo "Aberto agora".
  // dias: 0 = domingo ... 6 = sábado.
  horario: {
    dias: [1, 2, 3, 4, 5],
    abre: "09:00",
    fecha: "18:00",
    texto: "Segunda a sexta, das 9h às 18h",
  },
  // ATENÇÃO: nota e quantidade FICTÍCIAS, só para a estrutura ficar completa.
  // O Google pode penalizar nota sem avaliações reais por trás — troque pelos
  // números de verdade ou use null (o JSON-LD e a página inicial acompanham).
  avaliacao: { nota: 4.9, quantidade: 127 },
  redes: ["https://www.instagram.com/", "https://www.facebook.com/"],
};

/*
 * Google Tag Manager — vazio = analytics desligado (sem faixa de cookies,
 * sem rastreador). Preenchido, o layout abre a CSP para os hosts do Google e
 * da Meta e js/consentimento.js passa a carregar o GTM depois do aceite.
 * Ver docs/ANALYTICS.md.
 */
export const GTM_CONTAINER_ID = "";

/** Menu principal. `pagina` casa com a prop `pagina` do layout (aria-current). */
export const MENU = [
  { pagina: "inicio", href: "", rotulo: "Início" },
  { pagina: null, href: "#servicos", rotulo: "Serviços" },
  { pagina: "sobre", href: "sobre.html", rotulo: "Sobre" },
  { pagina: "galeria", href: "galeria.html", rotulo: "Galeria" },
  { pagina: "contato", href: "contato.html", rotulo: "Contato" },
];

/**
 * Link de WhatsApp com rastreamento por botão (utm_content, ver
 * docs/ANALYTICS.md). O slug segue <pagina>_<secao> e precisa ser único no
 * site; tools/gerar-gtm.py transforma cada slug num evento do GA4.
 * A mensagem pré-preenchida não pode ter emoji: vira "�" na página de envio
 * do WhatsApp em alguns navegadores — o build falha se tiver.
 */
export function whatsapp(slug, mensagem) {
  if (!/^[a-z0-9_]+$/.test(slug)) throw new Error(`slug de WhatsApp inválido: ${slug}`);
  const url = new URL(`https://wa.me/${NEGOCIO.whatsapp}`);
  if (mensagem) {
    if (/\p{Extended_Pictographic}/u.test(mensagem)) {
      throw new Error(`emoji na mensagem do WhatsApp (${slug}): ${mensagem}`);
    }
    url.searchParams.set("text", mensagem);
  }
  url.searchParams.set("utm_content", slug);
  return url.href;
}

/** Telefone para exibir: espaço e hífen inquebráveis, para não partir no meio. */
export const telefoneExibicao = NEGOCIO.telefone.exibicao.replace(" ", "\u00a0").replace("-", "\u2011");
