/*
 * sw-registro.js — registro do service worker + fluxo de atualização.
 *
 * Estratégia de atualização: quando uma nova versão do sw.js é instalada e
 * fica esperando, mostramos um toast "Atualizar". O clique manda a mensagem
 * PULAR_ESPERA (o worker chama skipWaiting()), o controllerchange dispara e
 * recarregamos a página uma única vez. Nada de recarregar sozinho no meio da
 * leitura do visitante.
 *
 * Escape de emergência (e de desenvolvimento): abrir o site com ?sw=off
 * desregistra o worker e apaga todos os caches.
 */

// O beforeinstallprompt (só Chromium) dispara cedo, antes de qualquer UI
// própria pedir a instalação — capturamos e guardamos para usar depois.
let eventoInstalacao = null;

addEventListener("beforeinstallprompt", (evento) => {
  evento.preventDefault();
  eventoInstalacao = evento;
});

export function obterEventoDeInstalacao() {
  return eventoInstalacao;
}

export function limparEventoDeInstalacao() {
  eventoInstalacao = null;
}

export function registrarServiceWorker() {
  if (!("serviceWorker" in navigator)) return;

  if (new URLSearchParams(location.search).get("sw") === "off") {
    desligarServiceWorker();
    return;
  }

  // Registrar depois do load não disputa banda com o carregamento da página.
  addEventListener("load", async () => {
    try {
      // "./sw.js" resolve contra a URL do documento. Como as 4 páginas do
      // site vivem todas na raiz do repositório, o caminho relativo aponta
      // para o mesmo arquivo não importa qual página fez o registro — e o
      // escopo fica correto tanto em /simple_web_app/ quanto num
      // domínio próprio.
      const registro = await navigator.serviceWorker.register("./sw.js");
      vigiarAtualizacao(registro);
    } catch (erro) {
      console.warn("Service worker não registrado:", erro);
    }
  });
}

export async function desligarServiceWorker() {
  const registros = await navigator.serviceWorker.getRegistrations();
  await Promise.all(registros.map((r) => r.unregister()));
  if ("caches" in window) {
    const chaves = await caches.keys();
    await Promise.all(chaves.map((chave) => caches.delete(chave)));
  }
}

function vigiarAtualizacao(registro) {
  // Já existe uma versão nova esperando (ex.: o visitante voltou depois de um deploy).
  if (registro.waiting && navigator.serviceWorker.controller) {
    mostrarToastDeAtualizacao(registro.waiting);
  }

  registro.addEventListener("updatefound", () => {
    const novo = registro.installing;
    if (!novo) return;
    novo.addEventListener("statechange", () => {
      if (novo.state === "installed" && navigator.serviceWorker.controller) {
        mostrarToastDeAtualizacao(novo);
      }
    });
  });

  let recarregou = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (recarregou) return;
    recarregou = true;
    location.reload();
  });
}

function mostrarToastDeAtualizacao(worker) {
  if (document.querySelector(".toast")) return;

  const toast = document.createElement("div");
  toast.className = "toast";
  toast.setAttribute("role", "status");

  const texto = document.createElement("span");
  texto.textContent = "Nova versão do site disponível.";

  const botao = document.createElement("button");
  botao.type = "button";
  botao.className = "botao botao-primario";
  botao.textContent = "Atualizar";
  botao.addEventListener("click", () => {
    botao.disabled = true;
    worker.postMessage({ tipo: "PULAR_ESPERA" });
  });

  toast.append(texto, botao);
  document.body.append(toast);
  requestAnimationFrame(() => toast.classList.add("visivel"));
}
