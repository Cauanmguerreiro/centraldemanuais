import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const pages = ["index.html", "clube-v3.html", "campanhas.html", "produtos.html", "lojas.html"];
const errors = [];

const exists = file => fs.existsSync(path.join(root, file));
const read = file => fs.readFileSync(path.join(root, file), "utf8");

function localReference(value) {
  if (!value || /^(?:https?:|mailto:|tel:|javascript:|data:|#)/i.test(value)) return null;
  return value.split("#")[0].split("?")[0].replace(/^\.\//, "");
}

for (const page of pages) {
  if (!exists(page)) {
    errors.push(page + ": arquivo obrigatório ausente");
    continue;
  }

  const html = read(page);
  const ids = [...html.matchAll(/\bid=["']([^"']+)["']/g)].map(match => match[1]);
  const duplicates = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];
  duplicates.forEach(id => errors.push(page + ': id duplicado "' + id + '"'));

  const refs = [...html.matchAll(/\b(?:src|href)=["']([^"']+)["']/g)]
    .map(match => localReference(match[1]))
    .filter(Boolean);

  refs.forEach(ref => {
    if (!exists(ref)) errors.push(page + ": referência local ausente: " + ref);
  });

  if (page === "index.html") continue;

  const match = html.match(/<script type=["']application\/json["'] id=["']manual-data["']>([\s\S]*?)<\/script>/);
  if (!match) {
    errors.push(page + ": manual-data ausente");
    continue;
  }

  let data;
  try {
    data = JSON.parse(match[1]);
  } catch (error) {
    errors.push(page + ": manual-data inválido: " + error.message);
    continue;
  }

  if (!data.key || !Array.isArray(data.steps) || !Array.isArray(data.sections)) {
    errors.push(page + ": manual-data sem key, steps ou sections");
    continue;
  }

  const anchors = data.steps.map(step => step.anchor);
  if (new Set(anchors).size !== anchors.length) errors.push(page + ": anchors de etapas duplicados");

  const sectionKeys = new Set(data.sections.map(section => section.key));
  data.steps.forEach((step, index) => {
    if (!step.anchor) errors.push(page + ": etapa " + (index + 1) + " sem anchor");
    if (!sectionKeys.has(step.group)) {
      errors.push(page + ": etapa " + (step.anchor || index + 1) + ' usa grupo inexistente "' + step.group + '"');
    }

    (step.shots || []).forEach(shot => {
      if (!exists(shot.src)) errors.push(page + ": captura ausente em " + step.anchor + ": " + shot.src);
    });
  });

  if (data.resource && data.resource.pdf && !exists(data.resource.pdf)) {
    errors.push(page + ": PDF de apoio ausente: " + data.resource.pdf);
  }
}

["assets/js/catalog.js", "assets/js/home.js", "assets/js/manual.js", "assets/js/shell.js"].forEach(required => {
  if (!exists(required)) errors.push("arquivo estrutural ausente: " + required);
});

if (exists("clubeagahelp")) errors.push("diretório legado clubeagahelp ainda existe");

if (errors.length) {
  console.error("\nFalhas de validação:\n");
  errors.forEach(error => console.error("- " + error));
  process.exit(1);
}

console.log("Validação concluída: " + pages.length + " páginas verificadas sem erros.");
