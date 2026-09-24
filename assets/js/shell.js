const body = document.body;
const sidebar = document.getElementById("sidebar");
const toggle = document.getElementById("menu-toggle");
const closeButton = document.getElementById("sidebar-close");
const overlay = document.getElementById("sidebar-overlay");
const mobile = window.matchMedia("(max-width:1080px)");
let lastFocusedElement = null;

/* Camada visual autoral carregada separadamente para manter a arquitetura estática simples. */
const editorialStylesheet = document.createElement("link");
editorialStylesheet.rel = "stylesheet";
editorialStylesheet.href = "assets/css/editorial.css";
document.head.append(editorialStylesheet);

if (body.dataset.page && body.dataset.page !== "home" && !body.classList.contains("manual-v3")) {
  const guideEditorialScript = document.createElement("script");
  guideEditorialScript.src = "assets/js/guide-editorial.js";
  guideEditorialScript.defer = true;
  document.head.append(guideEditorialScript);
}

/* Nomes completos para a sinalização da central. */
const navLabels = {
  "index.html": "Visão geral",
  "campanhas.html": "Campanhas de desconto",
  "clube-v3.html": "Clube Agafarma V3",
  "produtos.html": "Cadastro de produtos",
  "lojas.html": "Cadastro de lojas"
};
document.querySelectorAll(".topo-nav a").forEach(link => {
  const href = link.getAttribute("href");
  if (navLabels[href]) link.textContent = navLabels[href];
});

function sidebarFocusable() {
  if (!sidebar) return [];
  return [...sidebar.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')]
    .filter(element => !element.hidden && element.offsetParent !== null);
}

function syncSidebarAccessibility(open = body.classList.contains("sidebar-open")) {
  if (!sidebar) return;
  if (mobile.matches) sidebar.setAttribute("aria-hidden", String(!open));
  else sidebar.removeAttribute("aria-hidden");
}

function setSidebar(open, options = {}) {
  const shouldOpen = Boolean(open && mobile.matches);
  const wasOpen = body.classList.contains("sidebar-open");

  if (shouldOpen && !wasOpen) lastFocusedElement = document.activeElement;
  body.classList.toggle("sidebar-open", shouldOpen);
  toggle?.setAttribute("aria-expanded", String(shouldOpen));
  if (overlay) overlay.hidden = !shouldOpen;
  syncSidebarAccessibility(shouldOpen);

  if (shouldOpen) {
    requestAnimationFrame(() => (closeButton || sidebarFocusable()[0])?.focus());
  } else if (wasOpen && options.restoreFocus !== false && lastFocusedElement instanceof HTMLElement) {
    lastFocusedElement.focus();
  }
}

toggle?.addEventListener("click", () => setSidebar(!body.classList.contains("sidebar-open")));
closeButton?.addEventListener("click", () => setSidebar(false));
overlay?.addEventListener("click", () => setSidebar(false));
sidebar?.addEventListener("click", event => {
  if (event.target.closest("a") && mobile.matches) setSidebar(false, { restoreFocus: false });
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape" && body.classList.contains("sidebar-open")) {
    event.preventDefault();
    setSidebar(false);
    return;
  }

  if (event.key === "Tab" && body.classList.contains("sidebar-open")) {
    const focusable = sidebarFocusable();
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
});

mobile.addEventListener("change", event => {
  if (!event.matches) setSidebar(false, { restoreFocus: false });
  syncSidebarAccessibility(false);
});
syncSidebarAccessibility(false);

/* Contato com o setor — somente encaminhamento para WhatsApp. */
const contactButton = document.createElement("button");
contactButton.className = "sector-action";
contactButton.type = "button";
contactButton.innerHTML = '<span>Acionar o setor</span><small>Falar pelo WhatsApp</small>';
document.querySelector(".topo-nav")?.insertAdjacentElement("afterend", contactButton);

document.body.insertAdjacentHTML("beforeend", `
  <dialog class="contact-dialog" id="contact-dialog" aria-labelledby="contact-title">
    <form class="contact-form" id="contact-form">
      <div class="contact-head">
        <div>
          <p class="contact-eyebrow">Inovação e Desenvolvimento</p>
          <h2 id="contact-title">Acionar o setor</h2>
        </div>
        <button class="contact-close" type="button" aria-label="Fechar formulário">×</button>
      </div>

      <div class="contact-grid">
        <label>
          <span>Seu nome</span>
          <input name="nome" type="text" autocomplete="name" required>
        </label>
        <label>
          <span>Loja ou unidade</span>
          <input name="unidade" type="text" autocomplete="organization">
        </label>
      </div>

      <label>
        <span>Assunto</span>
        <select name="assunto" required>
          <option value="">Selecione</option>
          <option>Campanhas de desconto</option>
          <option>Cadastro de produtos</option>
          <option>Cadastro de loja</option>
          <option>Acesso ao painel</option>
          <option>Outro assunto</option>
        </select>
      </label>

      <label>
        <span>O que aconteceu?</span>
        <textarea name="descricao" rows="5" required placeholder="Descreva o problema e, se possível, informe em qual etapa ele ocorreu."></textarea>
      </label>

      <p class="contact-note">As informações não são salvas neste site. Ao continuar, a mensagem será apenas preparada e aberta no WhatsApp para sua conferência.</p>
      <div class="contact-actions">
        <button class="contact-cancel" type="button">Cancelar</button>
        <button class="contact-submit" type="submit">Continuar no WhatsApp</button>
      </div>
    </form>
  </dialog>
`);

const contactDialog = document.getElementById("contact-dialog");
const contactForm = document.getElementById("contact-form");

function closeContact() {
  contactDialog?.close();
}

contactButton.addEventListener("click", () => {
  setSidebar(false, { restoreFocus: false });
  contactDialog?.showModal();
  contactForm?.querySelector("input")?.focus();
});
contactDialog?.querySelector(".contact-close")?.addEventListener("click", closeContact);
contactDialog?.querySelector(".contact-cancel")?.addEventListener("click", closeContact);
contactDialog?.addEventListener("click", event => {
  if (event.target === contactDialog) closeContact();
});

contactForm?.addEventListener("submit", event => {
  event.preventDefault();
  const data = new FormData(contactForm);
  const nome = String(data.get("nome") || "").trim();
  const unidade = String(data.get("unidade") || "").trim();
  const assunto = String(data.get("assunto") || "").trim();
  const descricao = String(data.get("descricao") || "").trim();

  const linhas = [
    "Olá! Preciso de ajuda no AgaClube.",
    "",
    `Nome: ${nome}`,
    unidade ? `Loja/unidade: ${unidade}` : null,
    `Assunto: ${assunto}`,
    `Descrição: ${descricao}`,
    "",
    `Página consultada: ${document.title}`,
    `Link: ${window.location.href}`
  ].filter(Boolean);

  const url = "https://wa.me/5551982553302?text=" + encodeURIComponent(linhas.join("\n"));
  window.open(url, "_blank", "noopener,noreferrer");
  closeContact();
});
