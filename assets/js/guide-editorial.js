(() => {
  const guideStylesheet = document.createElement("link");
  guideStylesheet.rel = "stylesheet";
  guideStylesheet.href = "assets/css/guide-editorial.css";
  document.head.append(guideStylesheet);

  function textoDoPasso(link) {
    if (!link) return "Índice do guia";
    const numero = link.querySelector("em")?.textContent.trim();
    const clone = link.cloneNode(true);
    clone.querySelector("em")?.remove();
    const titulo = clone.textContent.trim().replace(/\s+/g, " ");
    if (!titulo) return "Índice do guia";
    return numero && numero !== "✓" ? `Passo ${numero} · ${titulo}` : titulo;
  }

  function atualizarResumoDoIndice() {
    const nav = document.querySelector("nav.lado");
    const summary = nav?.querySelector(".indice > summary");
    if (!summary) return;

    const ativo = nav.querySelector("a.ativo") || nav.querySelector('a[href^="#"]');
    summary.textContent = textoDoPasso(ativo);
  }

  function prepararIndice() {
    const nav = document.querySelector("nav.lado");
    if (!nav) return;

    atualizarResumoDoIndice();
    window.addEventListener("scroll", () => requestAnimationFrame(atualizarResumoDoIndice), { passive: true });
    window.addEventListener("hashchange", atualizarResumoDoIndice);

    nav.addEventListener("click", event => {
      const link = event.target.closest('a[href^="#"]');
      if (!link) return;
      requestAnimationFrame(() => {
        atualizarResumoDoIndice();
        const details = nav.querySelector(".indice");
        if (details && window.matchMedia("(max-width:1000px)").matches) details.open = false;
      });
    });
  }

  function prepararVisualizadorDeImagens() {
    const imagens = [...document.querySelectorAll(".quadro img")];
    if (!imagens.length) return;

    document.body.insertAdjacentHTML("beforeend", `
      <dialog class="media-dialog" id="media-dialog" aria-labelledby="media-dialog-title">
        <div class="media-dialog-head">
          <p id="media-dialog-title">Captura do sistema</p>
          <button class="media-dialog-close" type="button" aria-label="Fechar imagem ampliada">×</button>
        </div>
        <figure><img src="" alt=""></figure>
      </dialog>
    `);

    const dialog = document.getElementById("media-dialog");
    const dialogImage = dialog?.querySelector("img");
    const dialogTitle = dialog?.querySelector("#media-dialog-title");
    const closeButton = dialog?.querySelector(".media-dialog-close");
    let origem = null;

    function fechar() {
      dialog?.close();
    }

    function abrir(img) {
      if (!dialog || !dialogImage || !dialogTitle) return;
      origem = img;
      dialogImage.src = img.currentSrc || img.src;
      dialogImage.alt = img.alt || "Captura do sistema ampliada";
      dialogTitle.textContent = img.alt || "Captura do sistema";
      dialog.showModal();
      closeButton?.focus();
    }

    imagens.forEach(img => {
      img.title = img.title || "Abrir imagem em tamanho maior";
      img.setAttribute("data-ampliavel", "true");
      img.setAttribute("role", "button");
      img.setAttribute("tabindex", "0");
      img.setAttribute("aria-label", `${img.alt || "Captura do sistema"}. Abrir imagem em tamanho maior.`);

      img.addEventListener("click", () => abrir(img));
      img.addEventListener("keydown", event => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          abrir(img);
        }
      });
    });

    closeButton?.addEventListener("click", fechar);
    dialog?.addEventListener("click", event => {
      if (event.target === dialog) fechar();
    });
    dialog?.addEventListener("close", () => {
      dialogImage?.removeAttribute("src");
      origem?.focus();
    });
  }

  function iniciar() {
    prepararIndice();
    prepararVisualizadorDeImagens();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciar);
  else iniciar();
})();
