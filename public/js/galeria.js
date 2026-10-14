/*
 * galeria.js — lightbox nativo para galeria.html, via <dialog>. Carregado só
 * nesta página (não faz parte de js/site.js).
 *
 * Progressive enhancement: cada miniatura já é um <a href="foto-grande.png">
 * — sem JavaScript, o clique abre a imagem em tela cheia normalmente, a
 * página continua 100% funcional. Com JavaScript, este script intercepta o
 * clique e abre a mesma imagem dentro do <dialog> compartilhado, sem sair
 * da página. Esc e clique fora fecham (comportamento nativo de <dialog> +
 * o listener de clique no backdrop abaixo).
 */

const dialogo = document.getElementById("visualizador-foto");
const imagemGrande = document.getElementById("imagem-visualizador");
const legendaGrande = document.getElementById("legenda-visualizador");
const botaoFechar = document.getElementById("fechar-visualizador");

if (dialogo && imagemGrande) {
  document.querySelectorAll(".item-galeria").forEach((link) => {
    link.addEventListener("click", (evento) => {
      evento.preventDefault();
      const imagemMiniatura = link.querySelector("img");
      imagemGrande.src = link.href;
      imagemGrande.alt = imagemMiniatura.alt;
      legendaGrande.textContent = link.dataset.titulo ?? "";
      dialogo.showModal();
    });
  });

  botaoFechar.addEventListener("click", () => dialogo.close());

  // Clique no próprio elemento <dialog> (fora da caixa de conteúdo, na área
  // do backdrop) fecha — clique dentro da imagem/legenda não propaga até
  // aqui como "target === dialogo".
  dialogo.addEventListener("click", (evento) => {
    if (evento.target === dialogo) dialogo.close();
  });
}
