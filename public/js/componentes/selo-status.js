/*
 * <selo-status> — atributos reativos + ::part().
 *
 * Diferente de um componente que só renderiza uma vez no construtor e
 * nunca mais muda sozinho, este observa seus próprios atributos
 * (observedAttributes) e se redesenha sozinho sempre que "status" ou
 * "texto" mudam — via setAttribute() ou via as propriedades
 * .status/.texto — sem precisar recriar o elemento.
 *
 * Também expõe partes nomeadas (part="selo" / "ponto" / "rotulo") — a
 * forma que o shadow DOM dá para o CSS de FORA estilizar pontos
 * específicos de dentro do componente, sem abrir mão do isolamento do
 * resto. É um contrato explícito: só o que tem "part" é alcançável,
 * diferente das custom properties (que atravessam tudo, sempre).
 *
 * Uso:
 *   <selo-status status="ok" texto="Publicado"></selo-status>
 *   document.querySelector("selo-status").status = "erro";
 */

const folha = new CSSStyleSheet();
folha.replaceSync(`
  /*
   * A cor por status é escolhida aqui, via seletor de atributo — não com
   * JS setando "style" no elemento. A CSP deste site (default-src 'self',
   * sem style-src próprio) bloqueia QUALQUER estilo inline, e isso inclui
   * element.style.setProperty() feito por script, não só o atributo
   * style="" no HTML. Como "status" já é um atributo observado e
   * refletido, o CSS reage sozinho a cada mudança — nenhum JS precisa
   * tocar em estilo.
   */
  :host {
    display: inline-flex;
    --cor-selo: var(--cor-ok, #15803d);
  }
  :host([status="ok"]) { --cor-selo: var(--cor-ok, #15803d); }
  :host([status="aviso"]) { --cor-selo: var(--cor-aviso, #92400e); }
  :host([status="erro"]) { --cor-selo: var(--cor-erro, #b91c1c); }
  .selo {
    display: inline-flex;
    align-items: center;
    gap: 0.5ch;
    border: 1px solid var(--cor-borda, #ddd);
    border-radius: 999px;
    padding: 0.16rem 0.7rem;
    font-size: 0.82rem;
    font-family: inherit;
    color: var(--cor-selo);
    background: var(--cor-superficie, transparent);
  }
  .ponto {
    width: 0.5em;
    height: 0.5em;
    border-radius: 50%;
    background: var(--cor-selo);
    flex: none;
  }
`);

class SeloStatus extends HTMLElement {
  static observedAttributes = ["status", "texto"];

  constructor() {
    super();
    const raiz = this.attachShadow({ mode: "open" });
    raiz.adoptedStyleSheets = [folha];
    raiz.innerHTML = `
      <span part="selo" class="selo">
        <span part="ponto" class="ponto"></span>
        <span part="rotulo"></span>
      </span>
    `;
  }

  // Propriedades espelhando os atributos — a mesma API dos elementos nativos
  // (ex.: input.value/input.getAttribute("value")).
  get status() {
    return this.getAttribute("status") ?? "ok";
  }
  set status(valor) {
    this.setAttribute("status", valor);
  }

  get texto() {
    return this.getAttribute("texto") ?? "";
  }
  set texto(valor) {
    this.setAttribute("texto", valor);
  }

  connectedCallback() {
    this.atualizar();
  }

  // Chamado automaticamente pelo navegador a cada mudança de um atributo
  // listado em observedAttributes — é o que torna o componente reativo.
  attributeChangedCallback() {
    this.atualizar();
  }

  atualizar() {
    if (!this.shadowRoot) return;
    this.shadowRoot.querySelector('[part="rotulo"]').textContent = this.texto;
  }
}

customElements.define("selo-status", SeloStatus);
