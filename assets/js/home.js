const catalog = Array.isArray(window.AGA_MANUALS) ? window.AGA_MANUALS : [];
const routes = Object.fromEntries(catalog.map(function (item) { return [item.key, item.href]; }));
const guideData = new Map();
let searchIndex = [];
let indexReady = false;
let activeSearchIndex = -1;

const results = document.getElementById("res");
const searchInput = document.getElementById("busca");
const cards = document.getElementById("guide-cards");

function normalizeText(value) {
  return String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function htmlToText(html) {
  if (!html) return "";
  const doc = new DOMParser().parseFromString(String(html), "text/html");
  return doc.body.textContent || "";
}

function regexEscape(value) {
  return String(value).replace(/[^a-zA-Z0-9À-ÿ]/g, function (character) {
    return "\\" + character;
  });
}

function iconMarkup(icon) {
  const icons = {
    campaign: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 11v2a1 1 0 0 0 1 1h2l4 4V6L6 10H4a1 1 0 0 0-1 1Z"/><path d="M14 8.5a4 4 0 0 1 0 7"/><path d="M17 5.5a8 8 0 0 1 0 13"/></svg>',
    product: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3 4 7v10l8 4 8-4V7Z"/><path d="M4 7l8 4 8-4"/><path d="M12 11v10"/></svg>',
    store: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 9l2-5h14l2 5"/><path d="M5 13v8h14v-8"/><path d="M9 21v-6h6v6"/><path d="M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0"/></svg>',
    target: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><path d="M12 2v3M22 12h-3M12 22v-3M2 12h3"/></svg>'
  };
  return icons[icon] || icons.target;
}

function renderCards() {
  if (!cards) return;

  cards.innerHTML = catalog.map(function (item) {
    const data = guideData.get(item.key);
    const count = data && data.steps ? data.steps.length + " etapas" : "Manual interativo";
    const className = ["card", item.accent || ""].filter(Boolean).join(" ");
    const bullets = item.bullets.map(function (bullet) {
      return "<li>" + escapeHTML(bullet) + "</li>";
    }).join("");

    return '<a class="' + className + '" href="' + escapeHTML(item.href) + '">' +
      '<span class="ico">' + iconMarkup(item.icon) + '</span>' +
      '<h3>' + escapeHTML(item.title) + '</h3>' +
      '<p>' + escapeHTML(item.description) + '</p>' +
      '<ul>' + bullets + '</ul>' +
      '<span class="pe"><span class="qtd">' + count + '</span><span class="abrir">Abrir guia</span></span>' +
    '</a>';
  }).join("");
}

function buildStepSearch(entry, data) {
  return (data.steps || []).map(function (step, position) {
    const section = (data.sections || []).find(function (item) { return item.key === step.group; });
    const fields = (step.fields || []).flat().join(" ");
    const actions = (step.actions || []).join(" ");
    const captions = (step.shots || []).map(function (shot) { return shot.cap; }).join(" ");
    const searchable = [
      data.name,
      entry.title,
      section && section.short,
      section && section.title,
      step.title,
      step.intro,
      htmlToText(step.html),
      step.warning,
      step.tip,
      fields,
      actions,
      captions
    ].filter(Boolean).join(" ");

    return {
      guia: entry.key,
      nome: data.name || entry.title,
      passo: step.anchor,
      numero: position + 1,
      titulo: step.title,
      intro: step.intro || "",
      searchable: normalizeText(searchable),
      titleSearch: normalizeText(step.title),
      introSearch: normalizeText(step.intro)
    };
  });
}

async function loadGuide(entry) {
  const response = await fetch(entry.href);
  if (!response.ok) throw new Error(entry.href + ": HTTP " + response.status);

  const html = await response.text();
  const doc = new DOMParser().parseFromString(html, "text/html");
  const source = doc.getElementById("manual-data");
  if (!source) throw new Error(entry.href + ": manual-data ausente");

  const data = JSON.parse(source.textContent);
  guideData.set(entry.key, data);
  return buildStepSearch(entry, data);
}

async function loadSearchIndex() {
  const loaded = await Promise.allSettled(catalog.map(loadGuide));
  searchIndex = loaded.flatMap(function (result) {
    return result.status === "fulfilled" ? result.value : [];
  });
  indexReady = true;
  renderCards();

  if (searchInput && searchInput.value.trim().length >= 2) runSearch(searchInput.value);
}

function scoreTopic(topic, terms, original) {
  if (!terms.every(function (term) { return topic.searchable.includes(term); })) return -1;

  let score = 0;
  const phrase = normalizeText(original);
  if (topic.titleSearch.includes(phrase)) score += 80;

  terms.forEach(function (term) {
    if (topic.titleSearch.includes(term)) score += 18;
    if (topic.introSearch.includes(term)) score += 6;
    score += Math.min(3, topic.searchable.split(term).length - 1);
  });

  return score;
}

function openGuide(guide, step) {
  const page = routes[guide];
  if (!page) return;
  window.location.href = page + (step ? "#" + step : "");
}

function searchButtons() {
  return [...((results && results.querySelectorAll("button[data-ir]")) || [])];
}

function setActiveResult(newIndex) {
  const buttons = searchButtons();
  buttons.forEach(function (button) { button.classList.remove("search-active"); });

  if (!buttons.length) {
    activeSearchIndex = -1;
    return;
  }

  activeSearchIndex = Math.max(0, Math.min(newIndex, buttons.length - 1));
  buttons[activeSearchIndex].classList.add("search-active");
  buttons[activeSearchIndex].focus();
}

function hideResults() {
  if (!results || !searchInput) return;
  results.hidden = true;
  searchInput.setAttribute("aria-expanded", "false");
  activeSearchIndex = -1;
}

function highlight(text, original) {
  const safe = escapeHTML(text);
  const words = original.trim().split(/\s+/).filter(Boolean).map(regexEscape);
  if (!words.length) return safe;
  const regex = new RegExp("(" + words.join("|") + ")", "gi");
  return safe.replace(regex, "<mark>$1</mark>");
}

function paintResults(list, original) {
  if (!results || !searchInput) return;

  if (!indexReady) {
    results.innerHTML = '<p class="nada">Preparando a busca nos manuais…</p>';
    results.hidden = false;
    searchInput.setAttribute("aria-expanded", "true");
    return;
  }

  if (!list.length) {
    results.innerHTML = '<p class="nada">Nenhuma etapa encontrada. Tente termos do processo, campo, tela ou ação que você precisa executar.</p>';
    results.hidden = false;
    searchInput.setAttribute("aria-expanded", "true");
    activeSearchIndex = -1;
    return;
  }

  const groups = new Map();
  list.slice(0, 12).forEach(function (topic) {
    if (!groups.has(topic.nome)) groups.set(topic.nome, []);
    groups.get(topic.nome).push(topic);
  });

  results.innerHTML = [...groups.entries()].map(function (entry) {
    const name = entry[0];
    const topics = entry[1];
    const buttons = topics.map(function (topic) {
      return '<button type="button" role="option" data-ir="' + escapeHTML(topic.guia) + '" data-passo="' + escapeHTML(topic.passo) + '">' +
        '<span class="q">' + highlight(topic.titulo, original) + '<small>' + escapeHTML(topic.intro) + '</small></span>' +
        '<span class="g">Etapa ' + topic.numero + '</span>' +
      '</button>';
    }).join("");

    return '<section class="res-group" aria-label="' + escapeHTML(name) + '">' +
      '<p class="res-group-title">' + escapeHTML(name) + '</p>' +
      buttons +
    '</section>';
  }).join("");

  results.hidden = false;
  searchInput.setAttribute("aria-expanded", "true");
  activeSearchIndex = -1;
}

function runSearch(original) {
  const value = String(original || "").trim();
  const normalized = normalizeText(value);

  if (normalized.length < 2) {
    hideResults();
    return;
  }

  if (!indexReady) {
    paintResults([], value);
    return;
  }

  const terms = normalized.split(/\s+/).filter(Boolean);
  const matches = searchIndex
    .map(function (topic) { return { topic: topic, score: scoreTopic(topic, terms, value) }; })
    .filter(function (item) { return item.score >= 0; })
    .sort(function (a, b) { return b.score - a.score || a.topic.numero - b.topic.numero; })
    .map(function (item) { return item.topic; });

  paintResults(matches, value);
}

renderCards();
loadSearchIndex().catch(function () {
  indexReady = true;
  renderCards();
});

if (results && searchInput) {
  results.setAttribute("role", "listbox");
  results.setAttribute("aria-label", "Resultados da busca");
  searchInput.setAttribute("aria-controls", "res");
  searchInput.setAttribute("aria-expanded", "false");
}

if (searchInput) {
  searchInput.addEventListener("input", function () { runSearch(searchInput.value); });

  searchInput.addEventListener("keydown", function (event) {
    const buttons = searchButtons();

    if (event.key === "Escape") {
      searchInput.value = "";
      hideResults();
      searchInput.focus();
      return;
    }

    if (event.key === "ArrowDown" && buttons.length) {
      event.preventDefault();
      setActiveResult(activeSearchIndex < 0 ? 0 : activeSearchIndex + 1);
      return;
    }

    if (event.key === "ArrowUp" && buttons.length) {
      event.preventDefault();
      setActiveResult(activeSearchIndex < 0 ? buttons.length - 1 : activeSearchIndex - 1);
      return;
    }

    if (event.key === "Enter") {
      const target = activeSearchIndex >= 0 ? buttons[activeSearchIndex] : buttons[0];
      if (target) {
        event.preventDefault();
        target.click();
      }
    }
  });
}

if (results) {
  results.addEventListener("keydown", function (event) {
    const currentButton = event.target.closest("button[data-ir]");
    if (!currentButton) return;

    const buttons = searchButtons();
    const currentIndex = buttons.indexOf(currentButton);

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveResult(currentIndex + 1 >= buttons.length ? 0 : currentIndex + 1);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveResult(currentIndex - 1 < 0 ? buttons.length - 1 : currentIndex - 1);
    } else if (event.key === "Escape") {
      event.preventDefault();
      hideResults();
      if (searchInput) searchInput.focus();
    }
  });
}

document.addEventListener("click", function (event) {
  const destination = event.target.closest("[data-ir]");
  if (destination) {
    openGuide(destination.dataset.ir, destination.dataset.passo);
    return;
  }

  if (results && !results.hidden && !results.contains(event.target) && event.target !== searchInput) {
    hideResults();
  }
});
