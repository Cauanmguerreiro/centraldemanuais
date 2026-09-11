(() => {
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

  function marcarImagensAmpliaveis() {
    document.querySelectorAll(".quadro img").forEach(img => {
      img.title = img.title || "Clique para abrir a imagem em tamanho maior";
      img.setAttribute("data-ampliavel", "true");
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      prepararIndice();
      marcarImagensAmpliaveis();
    });
  } else {
    prepararIndice();
    marcarImagensAmpliaveis();
  }
})();
