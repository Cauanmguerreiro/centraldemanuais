const body = document.body;
const sidebar = document.getElementById("sidebar");
const toggle = document.getElementById("menu-toggle");
const closeButton = document.getElementById("sidebar-close");
const overlay = document.getElementById("sidebar-overlay");
const mobile = window.matchMedia("(max-width:1080px)");
const catalog = Array.isArray(window.AGA_MANUALS) ? window.AGA_MANUALS : [];
let lastFocusedElement = null;

function renderGlobalNavigation() {
  const nav = document.querySelector(".topo-nav");
  if (!nav || !catalog.length) return;

  const currentPage = body.dataset.page || "home";
  const items = [
    { key: "home", href: "index.html", label: "Visão geral" },
    ...catalog.map(function (item) {
      return { key: item.key, href: item.href, label: item.navLabel };
    })
  ];

  nav.innerHTML = items.map(function (item) {
    const current = item.key === currentPage ? ' aria-current="page"' : "";
    return '<a href="' + item.href + '"' + current + '>' + item.label + '</a>';
  }).join("");
}

renderGlobalNavigation();

function sidebarFocusable() {
  if (!sidebar) return [];
  return [...sidebar.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')]
    .filter(function (element) { return !element.hidden && element.offsetParent !== null; });
}

function syncSidebarAccessibility(open) {
  const isOpen = open === undefined ? body.classList.contains("sidebar-open") : open;
  if (!sidebar) return;
  if (mobile.matches) sidebar.setAttribute("aria-hidden", String(!isOpen));
  else sidebar.removeAttribute("aria-hidden");
}

function setSidebar(open, options) {
  const settings = options || {};
  const shouldOpen = Boolean(open && mobile.matches);
  const wasOpen = body.classList.contains("sidebar-open");

  if (shouldOpen && !wasOpen) lastFocusedElement = document.activeElement;
  body.classList.toggle("sidebar-open", shouldOpen);
  if (toggle) toggle.setAttribute("aria-expanded", String(shouldOpen));
  if (overlay) overlay.hidden = !shouldOpen;
  syncSidebarAccessibility(shouldOpen);

  if (shouldOpen) {
    requestAnimationFrame(function () {
      const focusTarget = closeButton || sidebarFocusable()[0];
      if (focusTarget) focusTarget.focus();
    });
  } else if (wasOpen && settings.restoreFocus !== false && lastFocusedElement instanceof HTMLElement) {
    lastFocusedElement.focus();
  }
}

if (toggle) toggle.addEventListener("click", function () {
  setSidebar(!body.classList.contains("sidebar-open"));
});
if (closeButton) closeButton.addEventListener("click", function () { setSidebar(false); });
if (overlay) overlay.addEventListener("click", function () { setSidebar(false); });
if (sidebar) sidebar.addEventListener("click", function (event) {
  if (event.target.closest("a") && mobile.matches) setSidebar(false, { restoreFocus: false });
});

document.addEventListener("keydown", function (event) {
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

mobile.addEventListener("change", function (event) {
  if (!event.matches) setSidebar(false, { restoreFocus: false });
  syncSidebarAccessibility(false);
});
syncSidebarAccessibility(false);

/* Contato com o setor — somente encaminhamento para WhatsApp. */
const contactButton = document.createElement("button");
contactButton.className = "sector-action";
contactButton.type = "button";
contactButton.innerHTML = '<span>Acionar o setor</span><small>Falar pelo WhatsApp</small>';
const nav = document.querySelector(".topo-nav");
if (nav) nav.insertAdjacentElement("afterend", contactButton);

const contactDialog = document.createElement("dialog");
contactDialog.className = "contact-dialog";
contactDialog.id = "contact-dialog";
contactDialog.setAttribute("aria-labelledby", "contact-title");

const contactForm = document.createElement("form");
contactForm.className = "contact-form";
contactForm.id = "contact-form";

contactForm.innerHTML =
  '<div class="contact-head">' +
    '<div><p class="contact-eyebrow">Inovação e Desenvolvimento</p><h2 id="contact-title">Acionar o setor</h2></div>' +
    '<button class="contact-close" type="button" aria-label="Fechar formulário">×</button>' +
  '</div>' +
  '<div class="contact-grid">' +
    '<label><span>Seu nome</span><input name="nome" type="text" autocomplete="name" required></label>' +
    '<label><span>Loja ou unidade</span><input name="unidade" type="text" autocomplete="organization"></label>' +
  '</div>' +
  '<label><span>Assunto</span><select name="assunto" required><option value="">Selecione</option></select></label>' +
  '<label><span>O que aconteceu?</span><textarea name="descricao" rows="5" required placeholder="Descreva o problema e, se possível, informe em qual etapa ele ocorreu."></textarea></label>' +
  '<p class="contact-note">As informações não são salvas neste site. Ao continuar, a mensagem será apenas preparada e aberta no WhatsApp para sua conferência.</p>' +
  '<div class="contact-actions"><button class="contact-cancel" type="button">Cancelar</button><button class="contact-submit" type="submit">Continuar no WhatsApp</button></div>';

contactDialog.append(contactForm);
document.body.append(contactDialog);

const subjectSelect = contactForm.elements.assunto;
catalog.forEach(function (item) {
  const option = document.createElement("option");
  option.value = item.title;
  option.textContent = item.title;
  subjectSelect.append(option);
});
["Acesso ao painel", "Outro assunto"].forEach(function (label) {
  const option = document.createElement("option");
  option.value = label;
  option.textContent = label;
  subjectSelect.append(option);
});

const currentGuide = catalog.find(function (item) { return item.key === body.dataset.page; });
if (currentGuide) subjectSelect.value = currentGuide.title;

function closeContact() {
  if (contactDialog.open) contactDialog.close();
}

contactButton.addEventListener("click", function () {
  setSidebar(false, { restoreFocus: false });
  contactDialog.showModal();
  const firstInput = contactForm.querySelector("input");
  if (firstInput) firstInput.focus();
});
contactForm.querySelector(".contact-close").addEventListener("click", closeContact);
contactForm.querySelector(".contact-cancel").addEventListener("click", closeContact);
contactDialog.addEventListener("click", function (event) {
  if (event.target === contactDialog) closeContact();
});

contactForm.addEventListener("submit", function (event) {
  event.preventDefault();
  const data = new FormData(contactForm);
  const nome = String(data.get("nome") || "").trim();
  const unidade = String(data.get("unidade") || "").trim();
  const assunto = String(data.get("assunto") || "").trim();
  const descricao = String(data.get("descricao") || "").trim();

  const linhas = [
    "Olá! Preciso de ajuda no AgaClube.",
    "",
    "Nome: " + nome,
    unidade ? "Loja/unidade: " + unidade : null,
    "Assunto: " + assunto,
    "Descrição: " + descricao,
    "",
    "Página consultada: " + document.title,
    "Link: " + window.location.href
  ].filter(Boolean);

  const url = "https://wa.me/5551982553302?text=" + encodeURIComponent(linhas.join("\n"));
  window.open(url, "_blank", "noopener,noreferrer");
  closeContact();
});
