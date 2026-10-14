/*
 * pagina-404.js — mostra o caminho pedido e volta ao início.
 *
 * O destino vem pronto do HTML (href de #link-inicio, gerado pelo build com
 * o base do site): sem detectar subcaminho em tempo de execução, funciona
 * igual no project page, no domínio próprio e em `npm run preview`.
 */
(function () {
  var link = document.getElementById("link-inicio");
  document.getElementById("caminho").textContent = location.pathname;
  setTimeout(function () {
    location.replace(link.href);
  }, 1200);
})();
