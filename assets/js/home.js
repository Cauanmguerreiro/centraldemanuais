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

function pintar(lista) {
  if (!lista.length) {
    res.innerHTML = '<p class="nada">Nenhum tópico encontrado. Abra um dos guias abaixo para ver o passo a passo completo.</p>';
    res.hidden = false;
    return;
  }

  res.innerHTML = lista.slice(0, 8).map(topico =>
    `<button type="button" data-ir="${topico.guia}" data-passo="${topico.passo}">
      <span class="q">${topico.q}</span>
      <span class="g">${topico.nome}</span>
    </button>`
  ).join("");
  res.hidden = false;
}

campo?.addEventListener("input", () => {
  const termo = semAcento(campo.value.trim());
  if (termo.length < 2) {
    res.hidden = true;
    return;
  }
  pintar(TOPICOS.filter(item => semAcento(item.q + " " + item.nome).includes(termo)));
});

campo?.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    campo.value = "";
    res.hidden = true;
  }
  if (event.key === "Enter") res.querySelector("button")?.click();
});

document.addEventListener("click", event => {
  const destino = event.target.closest("[data-guia],[data-ir]");
  if (destino) {
    abrirGuia(destino.dataset.guia || destino.dataset.ir, destino.dataset.passo);
    return;
  }
  if (!res.hidden && !res.contains(event.target) && event.target !== campo) res.hidden = true;
});
