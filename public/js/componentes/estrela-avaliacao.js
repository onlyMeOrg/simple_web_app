/*
 * <estrela-avaliacao> — eventos customizados + widget acessível por teclado.
 *
 * Demonstra o mesmo fluxo de dados que qualquer framework de componentes
 * usa por baixo dos panos — "atributos descem, eventos sobem" — só que
 * com APIs nativas: o valor entra por um atributo (valor="3") e cada
 * mudança sai como um CustomEvent("mudanca") que borbulha e atravessa a
 * fronteira do shadow DOM (bubbles + composed), para que qualquer
 * ancestral no documento possa escutá-lo sem conhecer o componente.
 *
 * Segue o padrão ARIA de radiogroup: uma única estrela é alcançável por
 * Tab (roving tabindex) e as setas movem E confirmam a seleção — como um
 * grupo de rádio nativo.
 *
 * Uso:
 *   <estrela-avaliacao valor="3"></estrela-avaliacao>
 *   el.addEventListener("mudanca", (ev) => console.log(ev.detail.valor));
 */

const TOTAL_ESTRELAS = 5;

const folha = new CSSStyleSheet();
folha.replaceSync(`
  :host {
    display: inline-flex;
    gap: 0.15rem;
  }
  [role="radio"] {
    all: unset;
    cursor: pointer;
    font-size: 1.5rem;
    line-height: 1;
    color: var(--cor-borda, #ccc);
  }
  [role="radio"].preenchida {
    color: var(--cor-destaque, #4f46e5);
  }
  [role="radio"]:focus-visible {
    outline: 2px solid var(--cor-destaque, #4f46e5);
    outline-offset: 2px;
    border-radius: 4px;
  }
  :host([somente-leitura]) [role="radio"] {
    cursor: default;
  }
`);

class EstrelaAvaliacao extends HTMLElement {
  static observedAttributes = ["valor"];

  constructor() {
    super();
    const raiz = this.attachShadow({ mode: "open" });
    raiz.adoptedStyleSheets = [folha];
    raiz.innerHTML = Array.from(
      { length: TOTAL_ESTRELAS },
      (_, i) => `<span role="radio" data-valor="${i + 1}" aria-label="${i + 1} de ${TOTAL_ESTRELAS} estrelas">☆</span>`
    ).join("");

    raiz.addEventListener("click", (evento) => {
      const alvo = evento.target.closest("[role='radio']");
      if (alvo) this.definirValor(Number(alvo.dataset.valor));
    });
    raiz.addEventListener("keydown", (evento) => this.aoTeclado(evento));
  }

  connectedCallback() {
    this.setAttribute("role", "radiogroup");
    if (!this.hasAttribute("aria-label")) this.setAttribute("aria-label", "Avaliação por estrelas");
    this.atualizar();
  }

  attributeChangedCallback() {
    this.atualizar();
  }

  get valor() {
    return Number(this.getAttribute("valor") ?? 0);
  }
  set valor(novoValor) {
    this.setAttribute("valor", String(novoValor));
  }

  definirValor(novoValor) {
    if (this.hasAttribute("somente-leitura") || novoValor === this.valor) return;
    this.valor = novoValor; // reflete no atributo -> attributeChangedCallback -> atualizar()
    this.dispatchEvent(new CustomEvent("mudanca", { detail: { valor: novoValor }, bubbles: true, composed: true }));
  }

  aoTeclado(evento) {
    if (this.hasAttribute("somente-leitura")) return;
    const atual = this.valor || 0;
    const teclas = {
      ArrowRight: Math.min(TOTAL_ESTRELAS, atual + 1),
      ArrowUp: Math.min(TOTAL_ESTRELAS, atual + 1),
      ArrowLeft: Math.max(1, atual - 1),
      ArrowDown: Math.max(1, atual - 1),
      Home: 1,
      End: TOTAL_ESTRELAS,
    };
    if (!(evento.key in teclas)) return;
    evento.preventDefault();
    this.definirValor(teclas[evento.key]);
    this.focarEstrelaAtual();
  }

  focarEstrelaAtual() {
    const estrelas = this.shadowRoot.querySelectorAll("[role='radio']");
    (estrelas[this.valor - 1] ?? estrelas[0])?.focus();
  }

  atualizar() {
    if (!this.shadowRoot) return;
    this.shadowRoot.querySelectorAll("[role='radio']").forEach((estrela, i) => {
      const marcada = i < this.valor;
      estrela.classList.toggle("preenchida", marcada);
      estrela.textContent = marcada ? "★" : "☆";
      estrela.setAttribute("aria-checked", String(i + 1 === this.valor));
      estrela.tabIndex = i + 1 === (this.valor || 1) ? 0 : -1;
    });
  }
}

customElements.define("estrela-avaliacao", EstrelaAvaliacao);
