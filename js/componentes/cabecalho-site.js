/*
 * <cabecalho-site> — cabeçalho e navegação compartilhados entre as páginas.
 *
 * Light DOM (sem shadow root) de propósito — ao contrário de <selo-status> e
 * <estrela-avaliacao>. js/tema.js localiza o botão de tema com
 * document.getElementById("alternar-tema"); um shadow root tornaria esse
 * botão invisível para essa busca. Em light DOM, o CSS global já existente
 * (.topo-conteudo, .marca, .topo nav — css/componentes.css) estiliza este
 * componente de graça, sem duplicar nada aqui dentro.
 *
 * O único lugar a editar para adicionar, renomear ou remover uma página do
 * site é o array PAGINAS abaixo.
 *
 * A marca (ícone + nome do negócio) já vem como markup estático dentro de
 * <cabecalho-site> em cada página — assim ela existe no HTML servido,
 * visível a crawlers que não executam JavaScript. Este componente só a
 * reaproveita; se a página não a incluir, cria uma como fallback.
 *
 * Uso (em cada página):
 *   <header class="topo">
 *     <cabecalho-site class="topo-conteudo" data-pagina="sobre"
 *                     nome-negocio="Clínica Sorriso Pleno">
 *       <a class="marca" href="./index.html">
 *         <img src="./assets/favicon.svg" alt="" width="22" height="22">
 *         <span>Clínica Sorriso Pleno</span>
 *       </a>
 *     </cabecalho-site>
 *     <noscript>...link de navegação em texto puro...</noscript>
 *   </header>
 *
 * "servicos" não é uma página própria (é uma âncora dentro de index.html),
 * por isso não tem "pagina" — nunca deve ganhar aria-current.
 */

const PAGINAS = [
  { pagina: "inicio", href: "./index.html", rotulo: "Início" },
  { pagina: null, href: "./index.html#servicos", rotulo: "Serviços" },
  { pagina: "sobre", href: "./sobre.html", rotulo: "Sobre" },
  { pagina: "galeria", href: "./galeria.html", rotulo: "Galeria" },
  { pagina: "contato", href: "./contato.html", rotulo: "Contato" },
];

class CabecalhoSite extends HTMLElement {
  // Sem observedAttributes: "data-pagina" e "nome-negocio" são lidos uma
  // única vez, em connectedCallback. Não há navegação client-side neste
  // template — cada página é um carregamento de documento novo — então
  // nada aqui precisa reagir a mudanças de atributo depois de montado.
  connectedCallback() {
    if (this.dataset.montado) return;
    this.dataset.montado = "true";

    const nomeDoNegocio = this.getAttribute("nome-negocio") ?? "";
    const paginaAtual = this.getAttribute("data-pagina") ?? "";

    // A marca normalmente já vem como markup estático (ver comentário acima).
    // Fallback: cria caso a página não a inclua.
    if (!this.querySelector(".marca")) {
      const marca = document.createElement("a");
      marca.className = "marca";
      marca.href = "./index.html";
      const icone = document.createElement("img");
      icone.src = "./assets/favicon.svg";
      icone.alt = "";
      icone.width = 22;
      icone.height = 22;
      const nomeSpan = document.createElement("span");
      nomeSpan.textContent = nomeDoNegocio;
      marca.append(icone, nomeSpan);
      this.append(marca);
    }

    const nav = document.createElement("nav");
    nav.setAttribute("aria-label", "Navegação principal");
    for (const item of PAGINAS) {
      const link = document.createElement("a");
      link.href = item.href;
      link.textContent = item.rotulo;
      if (item.pagina && item.pagina === paginaAtual) {
        link.setAttribute("aria-current", "page");
      }
      nav.append(link);
    }

    const botaoTema = document.createElement("button");
    botaoTema.type = "button";
    botaoTema.id = "alternar-tema";
    botaoTema.setAttribute("aria-label", "Alternar tema");

    this.append(nav, botaoTema);
  }
}

customElements.define("cabecalho-site", CabecalhoSite);
