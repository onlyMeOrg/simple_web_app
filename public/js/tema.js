/*
 * tema.js — alternância de tema claro/escuro.
 *
 * Três camadas, da mais fraca para a mais forte:
 *   1. padrão do sistema (prefers-color-scheme, resolvido só no CSS);
 *   2. escolha explícita do visitante (data-tema no <html> + localStorage);
 *   3. js/tema-boot.js reaplica a escolha salva antes do primeiro paint.
 */

const CHAVE = "tema";

export function temaAtual() {
  const explicito = document.documentElement.getAttribute("data-tema");
  if (explicito === "claro" || explicito === "escuro") return explicito;
  return matchMedia("(prefers-color-scheme: dark)").matches ? "escuro" : "claro";
}

export function temaSalvo() {
  try {
    return localStorage.getItem(CHAVE);
  } catch {
    return null;
  }
}

export function alternarTema() {
  const novo = temaAtual() === "escuro" ? "claro" : "escuro";
  document.documentElement.setAttribute("data-tema", novo);
  try {
    localStorage.setItem(CHAVE, novo);
  } catch {
    /* sem persistência, o tema vale só até o próximo carregamento */
  }
  atualizarBotao();
  return novo;
}

/** Remove a escolha explícita e volta a seguir o sistema. */
export function seguirSistema() {
  document.documentElement.removeAttribute("data-tema");
  try {
    localStorage.removeItem(CHAVE);
  } catch {
    /* nada a remover */
  }
  atualizarBotao();
}

function atualizarBotao() {
  const botao = document.getElementById("alternar-tema");
  if (!botao) return;
  const escuro = temaAtual() === "escuro";
  botao.textContent = escuro ? "☀️" : "🌙";
  botao.setAttribute(
    "aria-label",
    escuro ? "Mudar para o tema claro" : "Mudar para o tema escuro"
  );
}

export function iniciarTema(botao) {
  botao.hidden = false; // vem escondido no HTML: sem JS, não há botão inútil
  botao.addEventListener("click", alternarTema);
  // Se o sistema mudar de tema e não houver escolha salva, o ícone acompanha.
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", atualizarBotao);
  atualizarBotao();
}
