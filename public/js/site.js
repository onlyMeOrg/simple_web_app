/*
 * site.js — ponto de entrada compartilhado por todas as páginas.
 *
 * Cada página já é HTML estático completo, gerado pelo Astro (menu e rodapé
 * inclusos) — isto aqui só liga melhorias progressivas por cima: o botão de
 * tema, o gate de consentimento de cookies (que só carrega o Google Tag
 * Manager depois do aceite, ver consentimento.js) e os dois Web Components
 * com uso real de negócio: <estrela-avaliacao> e <selo-status>.
 */

import { iniciarTema } from "./tema.js";
import { iniciarConsentimento } from "./consentimento.js";

import "./componentes/selo-status.js";
import "./componentes/estrela-avaliacao.js";

iniciarTema(document.getElementById("alternar-tema"));
iniciarConsentimento(); // não faz nada sem o ID do GTM (src/dados/negocio.js)

/*
 * "Aberto agora" / "Fechado no momento": calculado de verdade a partir do
 * horário de funcionamento, que o build escreve nos data-* do selo a partir
 * de src/dados/negocio.js (a mesma fonte do JSON-LD). Só a página inicial
 * tem o #selo-horario; nas demais, o bloco abaixo não faz nada.
 *
 * Simplificação assumida: usa o horário LOCAL do navegador de quem visita,
 * não o fuso do negócio — razoável para um público majoritariamente local.
 */
function emHoras(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  return h + m / 60;
}

const seloHorario = document.getElementById("selo-horario");
if (seloHorario) {
  const dias = seloHorario.dataset.dias.split(",").map(Number);
  const agora = new Date();
  const horaAtual = agora.getHours() + agora.getMinutes() / 60;
  const aberto =
    dias.includes(agora.getDay()) &&
    horaAtual >= emHoras(seloHorario.dataset.abre) &&
    horaAtual < emHoras(seloHorario.dataset.fecha);
  seloHorario.status = aberto ? "ok" : "erro";
  seloHorario.texto = aberto ? "Aberto agora" : "Fechado no momento";
}
