const TOPICOS = [{"q":"Como criar uma nova campanha de desconto","passo":"camp-04","guia":"campanhas","nome":"Campanhas de Desconto"},{"q":"Como escolher entre EAN, classificação hierárquica e marca","passo":"camp-05","guia":"campanhas","nome":"Campanhas de Desconto"},{"q":"Como definir o preço da campanha","passo":"camp-07","guia":"campanhas","nome":"Campanhas de Desconto"},{"q":"O que faz a opção Permitir preço abaixo do custo","passo":"camp-07","guia":"campanhas","nome":"Campanhas de Desconto"},{"q":"Como definir o período de vigência","passo":"camp-08","guia":"campanhas","nome":"Campanhas de Desconto"},{"q":"Como incluir todas as lojas de um estado de uma vez","passo":"camp-10","guia":"campanhas","nome":"Campanhas de Desconto"},{"q":"Como remover uma loja da campanha","passo":"camp-11","guia":"campanhas","nome":"Campanhas de Desconto"},{"q":"Como importar EANs por planilha","passo":"camp-13","guia":"campanhas","nome":"Campanhas de Desconto"},{"q":"Como digitar EANs manualmente","passo":"camp-13","guia":"campanhas","nome":"Campanhas de Desconto"},{"q":"Como corrigir o preço de um produto importado","passo":"camp-14","guia":"campanhas","nome":"Campanhas de Desconto"},{"q":"Como alterar a vigência de um único produto","passo":"camp-14","guia":"campanhas","nome":"Campanhas de Desconto"},{"q":"Como publicar a campanha","passo":"camp-15","guia":"campanhas","nome":"Campanhas de Desconto"},{"q":"Como encerrar uma campanha ativa","passo":"camp-16","guia":"campanhas","nome":"Campanhas de Desconto"},{"q":"Onde encontro o código da campanha","passo":"camp-17","guia":"campanhas","nome":"Campanhas de Desconto"},{"q":"Como ver os produtos e as lojas de uma campanha","passo":"camp-18","guia":"campanhas","nome":"Campanhas de Desconto"},{"q":"Como conferir se a importação de EANs entrou completa","passo":"camp-18","guia":"campanhas","nome":"Campanhas de Desconto"},{"q":"Como editar uma campanha já criada","passo":"camp-19","guia":"campanhas","nome":"Campanhas de Desconto"},{"q":"Onde vejo se a campanha está em rascunho ou ativa","passo":"camp-03","guia":"campanhas","nome":"Campanhas de Desconto"},{"q":"Como cadastrar um produto novo","passo":"prod-02","guia":"produtos","nome":"Cadastro de Novos Produtos"},{"q":"Como saber se o produto já está cadastrado","passo":"prod-02","guia":"produtos","nome":"Cadastro de Novos Produtos"},{"q":"Onde informo o nome do produto","passo":"prod-03","guia":"produtos","nome":"Cadastro de Novos Produtos"},{"q":"Onde informo o EAN do produto","passo":"prod-04","guia":"produtos","nome":"Cadastro de Novos Produtos"},{"q":"O que é Ético ou Popular","passo":"prod-05","guia":"produtos","nome":"Cadastro de Novos Produtos"},{"q":"Como escolher a linha do produto","passo":"prod-07","guia":"produtos","nome":"Cadastro de Novos Produtos"},{"q":"Como definir a classificação hierárquica","passo":"prod-09","guia":"produtos","nome":"Cadastro de Novos Produtos"},{"q":"Quantas classificações posso selecionar","passo":"prod-09","guia":"produtos","nome":"Cadastro de Novos Produtos"},{"q":"Como conferir se o produto foi salvo","passo":"prod-12","guia":"produtos","nome":"Cadastro de Novos Produtos"},{"q":"Como evitar cadastro duplicado","passo":"prod-12","guia":"produtos","nome":"Cadastro de Novos Produtos"},{"q":"O que fazer quando o produto não aparece na campanha","passo":"prod-01","guia":"produtos","nome":"Cadastro de Novos Produtos"},{"q":"Como acessar a listagem de lojas","passo":"loj-01","guia":"lojas","nome":"Cadastro de Loja"},{"q":"Onde cadastrar uma nova unidade","passo":"loj-01","guia":"lojas","nome":"Cadastro de Loja"},{"q":"Quais informações preencher na loja","passo":"loj-02","guia":"lojas","nome":"Cadastro de Loja"},{"q":"Onde informo o código da unidade","passo":"loj-02","guia":"lojas","nome":"Cadastro de Loja"},{"q":"Como cadastrar o endereço da loja","passo":"loj-03","guia":"lojas","nome":"Cadastro de Loja"},{"q":"Como incluir mais de um telefone","passo":"loj-04","guia":"lojas","nome":"Cadastro de Loja"},{"q":"Como marcar que a loja participa do Clube Agafarma","passo":"loj-05","guia":"lojas","nome":"Cadastro de Loja"},{"q":"Onde ver os detalhes de uma loja","passo":"loj-07","guia":"lojas","nome":"Cadastro de Loja"},{"q":"Como gerar as credenciais da loja","passo":"loj-08","guia":"lojas","nome":"Cadastro de Loja"},{"q":"Perdi a senha da credencial da loja","passo":"loj-08","guia":"lojas","nome":"Cadastro de Loja"},{"q":"Como aplicar a credencial no Trier","passo":"loj-10","guia":"lojas","nome":"Cadastro de Loja"},{"q":"Qual a URL do webservice do Clube","passo":"loj-10","guia":"lojas","nome":"Cadastro de Loja"}];

const ROTAS = {
  campanhas: "campanhas.html",
  produtos: "produtos.html",
  lojas: "lojas.html"
};

function abrirGuia(guia, passo) {
  const pagina = ROTAS[guia];
  if (!pagina) return;
  window.location.href = pagina + (passo ? "#" + passo : "");
}

const res = document.getElementById("res");
const campo = document.getElementById("busca");
const semAcento = texto => texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
let activeSearchIndex = -1;

if (res && campo) {
  res.setAttribute("role", "listbox");
  res.setAttribute("aria-label", "Resultados da busca");
  campo.setAttribute("aria-controls", "res");
  campo.setAttribute("aria-expanded", "false");
}

function escaparHTML(texto) {
  return String(texto)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function destacar(texto, termoOriginal) {
  const seguro = escaparHTML(texto);
  const termo = termoOriginal.trim();
  if (!termo) return seguro;

  const palavras = termo.split(/\s+/).filter(Boolean).map(palavra => palavra.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  if (!palavras.length) return seguro;

  const regex = new RegExp(`(${palavras.join("|")})`, "gi");
  return seguro.replace(regex, "<mark>$1</mark>");
}

function numeroPasso(passo) {
  const numero = String(passo).match(/(\d+)$/)?.[1];
  return numero ? `Passo ${Number(numero)}` : "Checklist";
}

function botoesBusca() {
  return [...(res?.querySelectorAll("button[data-ir]") || [])];
}

function atualizarAtivo(novoIndice) {
  const botoes = botoesBusca();
  botoes.forEach(botao => botao.classList.remove("search-active"));
  if (!botoes.length) {
    activeSearchIndex = -1;
    return;
  }

  activeSearchIndex = Math.max(0, Math.min(novoIndice, botoes.length - 1));
  const ativo = botoes[activeSearchIndex];
  ativo.classList.add("search-active");
  ativo.focus();
}

function esconderResultados() {
  if (!res || !campo) return;
  res.hidden = true;
  campo.setAttribute("aria-expanded", "false");
  activeSearchIndex = -1;
}

function pintar(lista, termoOriginal) {
  if (!res || !campo) return;

  if (!lista.length) {
    res.innerHTML = '<p class="nada">Nenhum tópico encontrado. Abra um dos guias abaixo para consultar o processo completo.</p>';
    res.hidden = false;
    campo.setAttribute("aria-expanded", "true");
    activeSearchIndex = -1;
    return;
  }

  const limitados = lista.slice(0, 12);
  const grupos = new Map();
  limitados.forEach(topico => {
    if (!grupos.has(topico.nome)) grupos.set(topico.nome, []);
    grupos.get(topico.nome).push(topico);
  });

  res.innerHTML = [...grupos.entries()].map(([nome, topicos]) => `
    <section class="res-group" aria-label="${escaparHTML(nome)}">
      <p class="res-group-title">${escaparHTML(nome)}</p>
      ${topicos.map(topico => `
        <button type="button" role="option" data-ir="${topico.guia}" data-passo="${topico.passo}">
          <span class="q">${destacar(topico.q, termoOriginal)}</span>
          <span class="g">${numeroPasso(topico.passo)}</span>
        </button>
      `).join("")}
    </section>
  `).join("");

  res.hidden = false;
  campo.setAttribute("aria-expanded", "true");
  activeSearchIndex = -1;
}

campo?.addEventListener("input", () => {
  const termoOriginal = campo.value.trim();
  const termo = semAcento(termoOriginal);
  if (termo.length < 2) {
    esconderResultados();
    return;
  }

  const lista = TOPICOS.filter(item => semAcento(item.q + " " + item.nome).includes(termo));
  pintar(lista, termoOriginal);
});

campo?.addEventListener("keydown", event => {
  const botoes = botoesBusca();

  if (event.key === "Escape") {
    campo.value = "";
    esconderResultados();
    campo.focus();
    return;
  }

  if (event.key === "ArrowDown" && botoes.length) {
    event.preventDefault();
    atualizarAtivo(activeSearchIndex < 0 ? 0 : activeSearchIndex + 1);
    return;
  }

  if (event.key === "ArrowUp" && botoes.length) {
    event.preventDefault();
    atualizarAtivo(activeSearchIndex < 0 ? botoes.length - 1 : activeSearchIndex - 1);
    return;
  }

  if (event.key === "Enter") {
    const alvo = activeSearchIndex >= 0 ? botoes[activeSearchIndex] : botoes[0];
    if (alvo) {
      event.preventDefault();
      alvo.click();
    }
  }
});

res?.addEventListener("keydown", event => {
  if (!event.target.closest("button[data-ir]")) return;
  const botoes = botoesBusca();
  const atual = botoes.indexOf(event.target.closest("button[data-ir]"));

  if (event.key === "ArrowDown") {
    event.preventDefault();
    atualizarAtivo(atual + 1 >= botoes.length ? 0 : atual + 1);
  } else if (event.key === "ArrowUp") {
    event.preventDefault();
    atualizarAtivo(atual - 1 < 0 ? botoes.length - 1 : atual - 1);
  } else if (event.key === "Escape") {
    event.preventDefault();
    esconderResultados();
    campo?.focus();
  }
});

document.addEventListener("click", event => {
  const destino = event.target.closest("[data-guia],[data-ir]");
  if (destino) {
    abrirGuia(destino.dataset.guia || destino.dataset.ir, destino.dataset.passo);
    return;
  }
  if (res && !res.hidden && !res.contains(event.target) && event.target !== campo) esconderResultados();
});
