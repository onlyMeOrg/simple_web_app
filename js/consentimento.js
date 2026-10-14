/*
 * consentimento.js — faixa de cookies + carregamento do Google Tag Manager.
 *
 * DESLIGADO POR PADRÃO: com GTM_CONTAINER_ID vazio, nada acontece — sem
 * faixa, sem rastreador, e o link "Gerenciar cookies" do rodapé continua
 * escondido. Para ligar, siga docs/ANALYTICS.md (são dois passos: o ID
 * abaixo e a CSP de cada página).
 *
 * Ligado, nenhum código de terceiro (GTM e, dentro dele, GA4, Google Ads,
 * Pixel da Meta) executa antes do visitante clicar em "Aceitar". Sem Consent
 * Mode do Google (gtag('consent', ...)) de propósito: a régua é simples —
 * zero código de terceiro antes do aceite. Mesmo padrão de localStorage com
 * try/catch de js/tema.js (chave própria, falha graciosa).
 *
 * O snippet oficial do painel do GTM NÃO deve ser colado nas páginas: ele
 * carregaria sem passar por este gate. E o <noscript><iframe> oficial fica
 * de fora de propósito: dispara sem qualquer chance de checar consentimento.
 */

// "GTM-XXXXXXX" do painel do Google Tag Manager. Vazio = analytics desligado.
const GTM_CONTAINER_ID = "";

const CHAVE = "consentimento-cookies";

function escolhaSalva() {
  try {
    return localStorage.getItem(CHAVE);
  } catch {
    return null;
  }
}

function salvarEscolha(valor) {
  try {
    localStorage.setItem(CHAVE, valor);
  } catch {
    /* sem persistência, a escolha vale só até o próximo carregamento */
  }
}

/** Injeta o loader do GTM (script próprio, mesma origem; só o destino do
 * carregamento dinâmico é cross-origin — é essa URL que a CSP libera). */
function carregarGTM() {
  if (document.getElementById("gtm-loader")) return; // não injeta duas vezes
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
  const script = document.createElement("script");
  script.id = "gtm-loader";
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtm.js?id=${GTM_CONTAINER_ID}`;
  document.head.appendChild(script);
}

function criarFaixa() {
  if (document.getElementById("faixa-cookies")) return;

  const faixa = document.createElement("div");
  faixa.className = "faixa-cookies";
  faixa.id = "faixa-cookies";
  faixa.setAttribute("role", "region");
  faixa.setAttribute("aria-label", "Aviso de cookies");

  const texto = document.createElement("p");
  texto.textContent =
    "Usamos cookies para entender como você usa o site e mostrar anúncios mais relevantes.";
  const link = document.createElement("a");
  link.href = "./privacidade.html";
  link.textContent = "Política de Privacidade";
  texto.append(" ", link);

  const botoes = document.createElement("div");
  botoes.className = "grupo-botoes";

  const rejeitar = document.createElement("button");
  rejeitar.type = "button";
  rejeitar.className = "botao";
  rejeitar.textContent = "Rejeitar";
  rejeitar.addEventListener("click", () => responder("rejeitado"));

  const aceitar = document.createElement("button");
  aceitar.type = "button";
  aceitar.className = "botao botao-primario";
  aceitar.textContent = "Aceitar";
  aceitar.addEventListener("click", () => responder("aceito"));

  botoes.append(rejeitar, aceitar);
  faixa.append(texto, botoes);
  document.body.append(faixa);

  function responder(valor) {
    salvarEscolha(valor);
    faixa.remove();
    if (valor === "aceito") carregarGTM();
  }
}

export function iniciarConsentimento() {
  if (!GTM_CONTAINER_ID) return;

  const escolha = escolhaSalva();
  if (escolha === "aceito") {
    carregarGTM();
  } else if (escolha !== "rejeitado") {
    criarFaixa();
  }

  // "Gerenciar cookies" no rodapé: escondido no HTML (sem JS ou sem GTM, não
  // há o que gerenciar), aparece aqui e reabre a faixa.
  document.querySelectorAll(".gerenciar-cookies-item").forEach((item) => {
    item.hidden = false;
  });
  document.querySelectorAll(".gerenciar-cookies").forEach((link) => {
    link.addEventListener("click", (evento) => {
      evento.preventDefault();
      criarFaixa();
    });
  });
}
