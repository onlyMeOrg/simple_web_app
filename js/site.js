/*
 * site.js — ponto de entrada compartilhado pelas 4 páginas do site
 * institucional (index.html, sobre.html, contato.html, galeria.html).
 *
 * Bem mais magro que a antiga SPA técnica que este template tinha: nenhum
 * roteador, nenhuma vista. Cada página já é HTML estático de verdade — isto
 * aqui só liga melhorias progressivas por cima: cabeçalho/navegação
 * compartilhados, tema, funcionamento offline, e os dois Web Components que
 * têm uso real de negócio (não são demonstração): <estrela-avaliacao> e
 * <selo-status>. Também liga o gate de consentimento de cookies, que só
 * carrega o Google Tag Manager depois do aceite (ver consentimento.js).
 *
 * Import do cabeçalho ANTES de iniciarTema(): customElements.define() faz o
 * upgrade de elementos já presentes no documento de forma síncrona, então o
 * botão #alternar-tema (que <cabecalho-site> cria) já existe no light DOM
 * no momento em que iniciarTema() faz o getElementById — nenhuma mudança
 * necessária em tema.js.
 */

import "./componentes/cabecalho-site.js";

import { iniciarTema } from "./tema.js";
import { registrarServiceWorker } from "./sw-registro.js";
import { iniciarConsentimento } from "./consentimento.js";

import "./componentes/selo-status.js";
import "./componentes/estrela-avaliacao.js";

iniciarTema(document.getElementById("alternar-tema"));
registrarServiceWorker();
iniciarConsentimento(); // não faz nada até GTM_CONTAINER_ID ser preenchido

/*
 * "Aberto agora" / "Fechado no momento": calculado de verdade a partir do
 * horário de funcionamento, não decorativo. Mesmo horário do
 * "openingHoursSpecification" no JSON-LD de index.html — mantenha os dois
 * em sincronia ao personalizar para outro negócio. Só a página inicial tem
 * o elemento #selo-horario; nas demais, o bloco abaixo não faz nada.
 *
 * Simplificação assumida: usa o horário LOCAL do navegador de quem visita,
 * não o fuso do negócio — razoável para um público majoritariamente local,
 * mas vale ajustar se o público-alvo for outro fuso.
 */
const HORARIO_FUNCIONAMENTO = {
  diasDaSemana: [1, 2, 3, 4, 5], // 0 = domingo ... 6 = sábado; aqui, segunda a sexta
  abre: 9, // 09:00
  fecha: 18, // 18:00
};

function calcularStatusFuncionamento() {
  const agora = new Date();
  const diaAtual = agora.getDay();
  const horaAtual = agora.getHours() + agora.getMinutes() / 60;
  const aberto =
    HORARIO_FUNCIONAMENTO.diasDaSemana.includes(diaAtual) &&
    horaAtual >= HORARIO_FUNCIONAMENTO.abre &&
    horaAtual < HORARIO_FUNCIONAMENTO.fecha;
  return aberto ? { status: "ok", texto: "Aberto agora" } : { status: "erro", texto: "Fechado no momento" };
}

const seloHorario = document.getElementById("selo-horario");
if (seloHorario) {
  const { status, texto } = calcularStatusFuncionamento();
  seloHorario.status = status;
  seloHorario.texto = texto;
}
