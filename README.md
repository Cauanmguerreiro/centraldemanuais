# Central de Manuais — AgaClube Help

Central estática de apoio ao painel Agafarma.

## Estrutura

- `index.html`: visão geral, cards e busca central.
- `campanhas.html`: campanhas de desconto.
- `clube-v3.html`: segmentos e campanhas segmentadas do Clube V3.
- `produtos.html`: cadastro de novos produtos.
- `lojas.html`: cadastro de loja e integração.
- `assets/js/catalog.js`: catálogo único dos manuais; define ordem, rótulos e cards.
- `assets/js/shell.js`: navegação global, sidebar responsiva e acionamento do I&D.
- `assets/js/home.js`: monta os cards e cria a busca automaticamente a partir do `manual-data` de cada manual.
- `assets/js/manual.js`: motor compartilhado dos manuais: busca local, filtros, progresso, modo guiado, mídia, checklist, tema e impressão.
- `assets/css/base.css`: shell da central e página inicial.
- `assets/css/editorial.css`: camada visual editorial.
- `assets/css/manual.css`: componentes e layout dos manuais.
- `midia/`: imagens dos passos.
- `manuais/`: versões em PDF.
- `scripts/validate.mjs`: validação estática do repositório.
- `.github/workflows/validate-static.yml`: executa a validação em pushes e pull requests.

## Como adicionar um manual

1. Crie a página HTML seguindo a estrutura dos manuais existentes e inclua o `manual-data`.
2. Adicione a entrada correspondente em `assets/js/catalog.js`.
3. Coloque as capturas em `midia/`.

A navegação global, o card da home e o índice de busca são derivados dessas fontes. Não existe uma lista separada de tópicos de busca para manter manualmente.

## Banco de dados

Nenhum banco, autenticação ou API é usado nesta fase. O arquivo de configuração é somente um placeholder e não deve receber credenciais reais.

## Validação

Execute:

```bash
node scripts/validate.mjs
```

A validação confere referências locais, IDs duplicados, JSON dos manuais, anchors, grupos e capturas de tela.
