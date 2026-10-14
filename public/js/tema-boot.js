/*
 * tema-boot.js — anti-FOUC (flash of unstyled content... de tema errado).
 *
 * Este é o ÚNICO script clássico (não-módulo) do projeto, carregado de forma
 * bloqueante no <head> de propósito: ele aplica o tema salvo em localStorage
 * ANTES do primeiro paint. Sem ele, quem escolheu o tema escuro veria um
 * clarão do tema claro a cada carregamento.
 *
 * Sem escolha salva, nenhum atributo é aplicado e o CSS decide sozinho via
 * @media (prefers-color-scheme) — ver css/tokens.css.
 */
(function () {
  try {
    var salvo = localStorage.getItem("tema");
    if (salvo === "claro" || salvo === "escuro") {
      document.documentElement.setAttribute("data-tema", salvo);
    }
  } catch (erro) {
    /* localStorage indisponível (ex.: cookies bloqueados) — segue o sistema. */
  }
})();
