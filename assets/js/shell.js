const body = document.body;
const sidebar = document.getElementById("sidebar");
const toggle = document.getElementById("menu-toggle");
const closeButton = document.getElementById("sidebar-close");
const overlay = document.getElementById("sidebar-overlay");
const mobile = window.matchMedia("(max-width:1080px)");

function setSidebar(open) {
  const shouldOpen = Boolean(open && mobile.matches);
  body.classList.toggle("sidebar-open", shouldOpen);
  toggle?.setAttribute("aria-expanded", String(shouldOpen));
  if (overlay) overlay.hidden = !shouldOpen;
}

toggle?.addEventListener("click", () => setSidebar(!body.classList.contains("sidebar-open")));
closeButton?.addEventListener("click", () => setSidebar(false));
overlay?.addEventListener("click", () => setSidebar(false));
sidebar?.addEventListener("click", event => {
  if (event.target.closest("a") && mobile.matches) setSidebar(false);
});
document.addEventListener("keydown", event => {
  if (event.key === "Escape") setSidebar(false);
});
mobile.addEventListener("change", event => {
  if (!event.matches) setSidebar(false);
});

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

      <p class="contact-note">As informações não são salvas. Ao continuar, a mensagem será aberta no WhatsApp.</p>
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
  setSidebar(false);
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
