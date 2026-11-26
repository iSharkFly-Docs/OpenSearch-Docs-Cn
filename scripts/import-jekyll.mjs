// Imports the OpenSearch documentation from the Jekyll (just-the-docs) collections in
// this repository (_about/, _api-reference/, ...) into src/, converting Jekyll Liquid
// and kramdown extensions to VitePress Markdown.
//
// Usage: node scripts/import-jekyll.mjs
//
// - The Jekyll sources stay untouched, so upstream changes can still be merged into
//   them; re-run this script afterwards to refresh src/.
// - Pages are laid out by their Jekyll URL, so the root-relative links used inside the
//   docs keep working. /<collection>/<page>/ becomes src/<collection>/<page>.md.
//   Jekyll URLs that end in /index/ are served from the directory (/<dir>/) and get a
//   redirect from the old URL.
// - The sidebar structure is written to scripts/nav.json and consumed by generate.mjs.
// - Old URLs (redirect_from and changed URLs) are written to src/public/_redirects,
//   which Cloudflare Workers Static Assets applies.
// - _config.yml and front matter are parsed as text; no Jekyll or Ruby is needed.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC_DIR = path.join(ROOT, 'src');
const PUBLIC_DIR = path.join(SRC_DIR, 'public');
const NAV_FILE = path.join(ROOT, 'scripts', 'nav.json');

// Pages in src/ that are maintained by hand and must survive a re-import.
const KEEP = new Set(['index.md']);
// Files copied from the repository root into src/public/.
const PUBLIC_FILES = ['favicon.ico', 'favicon.png', 'favicon.svg'];

// Jekyll sidebar sections (_config.yml) and the URL prefix each one owns.
const SECTIONS = [
  { key: 'opensearch_collection', base: '/' },
  { key: 'clients_collection', base: '/clients/' },
  { key: 'benchmark_collection', base: '/benchmark/' },
  { key: 'data_prepper_collection', base: '/data-prepper/' },
];

const CALLOUTS = {
  note: '::: info NOTE',
  tip: '::: tip TIP',
  important: '::: warning IMPORTANT',
  warning: '::: danger WARNING',
};

// ---------------------------------------------------------------------------
// _config.yml
// ---------------------------------------------------------------------------

const configText = fs.readFileSync(path.join(ROOT, '_config.yml'), 'utf8');
const configLines = configText.split(/\r?\n/);

function unquote(value) {
  const v = value.trim();
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith('\'') && v.endsWith('\'')))
    return v.slice(1, -1);
  return v;
}

const siteVars = {};
for (const line of configLines) {
  const m = line.match(/^([\w-]+):\s*(\S.*?)\s*(?:#.*)?$/);
  if (m) siteVars[m[1]] = unquote(m[2]);
}
const SITE_URL = (siteVars.url || 'https://opensearch.isharkfly.com').replace(/\/$/, '');

// Lines of the block under a top-level key.
function configBlock(key) {
  const start = configLines.findIndex(line => line.startsWith(`${key}:`));
  if (start < 0) return [];
  const block = [];
  for (let i = start + 1; i < configLines.length; i++) {
    if (/^\S/.test(configLines[i])) break;
    block.push(configLines[i]);
  }
  return block;
}

// Collections Jekyll outputs (collections: <name>: output: true).
const outputCollections = new Set();
{
  let current = null;
  for (const line of configBlock('collections')) {
    const name = line.match(/^ {2}([\w-]+):\s*$/);
    if (name) current = name[1];
    else if (current && /^\s+output:\s*true/.test(line)) outputCollections.add(current);
  }
}

// Sidebar sections: [{ base, collections: [{ name, text }] }]
const sections = SECTIONS.map(section => {
  const collections = [];
  for (const line of configBlock(section.key)) {
    const name = line.match(/^ {4}([\w-]+):\s*$/);
    if (name) collections.push({ name: name[1], text: name[1] });
    const text = line.match(/^\s+name:\s*(.+)$/);
    if (text && collections.length) collections.at(-1).text = unquote(text[1]);
  }
  return { base: section.base, collections };
});

// ---------------------------------------------------------------------------
// Pages
// ---------------------------------------------------------------------------

function parseFrontMatter(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/);
  if (!m) return { data: {}, lines: {}, body: text };
  const data = {};
  const lines = {};
  let listKey = null;
  for (const line of m[1].split(/\r?\n/)) {
    const item = line.match(/^\s*-\s+(.*)$/);
    if (item && listKey) {
      data[listKey].push(unquote(item[1]));
      continue;
    }
    const kv = line.match(/^([\w-]+):\s*(.*?)\s*$/);
    if (!kv) continue;
    lines[kv[1]] = line;
    if (kv[2] === '') {
      data[kv[1]] = [];
      listKey = kv[1];
    } else {
      data[kv[1]] = unquote(kv[2]);
      listKey = null;
    }
  }
  return { data, lines, body: text.slice(m[0].length) };
}

function listMarkdown(dir, rel = '') {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const entryRel = rel ? `${rel}/${entry.name}` : entry.name;
    if (entry.isDirectory()) files.push(...listMarkdown(path.join(dir, entry.name), entryRel));
    else if (entry.name.endsWith('.md')) files.push(entryRel);
  }
  return files;
}

function withSlashes(url) {
  let u = url.trim();
  if (!u.startsWith('/')) u = `/${u}`;
  if (!u.endsWith('/') && !/\.\w+$/.test(u)) u = `${u}/`;
  return u;
}

// src/ file for a Jekyll URL.
function fileForUrl(url, isIndexSource) {
  const p = url.replace(/^\/+|\/+$/g, '');
  if (p === '') return 'index.md';
  if (p === 'index' || p.endsWith('/index')) return `${p}.md`;
  return isIndexSource ? `${p}/index.md` : `${p}.md`;
}

function routeForFile(file) {
  return '/' + file.replace(/(^|\/)index\.md$/, '$1').replace(/\.md$/, '');
}

const pages = [];
for (const collection of outputCollections) {
  const dir = path.join(ROOT, `_${collection}`);
  if (!fs.existsSync(dir)) continue;
  for (const rel of listMarkdown(dir)) {
    const text = fs.readFileSync(path.join(dir, rel), 'utf8');
    if (!text.trim()) continue;
    const { data, lines, body } = parseFrontMatter(text);
    const isIndexSource = path.posix.basename(rel) === 'index.md';
    const url = data.permalink ? withSlashes(data.permalink) : `/${collection}/${rel.replace(/\.md$/, '')}/`;
    const file = fileForUrl(url, isIndexSource);
    pages.push({ collection, source: `_${collection}/${rel}`, data, lines, body, url, file, route: routeForFile(file) });
  }
}

// Detect two pages landing on the same file.
{
  const byFile = new Map();
  for (const page of pages) {
    const other = byFile.get(page.file);
    if (other) {
      console.warn(`[import] ${page.source} and ${other.source} both map to src/${page.file}; skipping ${page.source}.`);
      page.skip = true;
    } else {
      byFile.set(page.file, page);
    }
  }
}
const livePages = pages.filter(page => !page.skip);

const routeByUrl = new Map(livePages.map(page => [page.url, page.route]));
const routes = new Set(livePages.map(page => page.route));
const redirects = new Map();
for (const page of livePages) {
  const from = [page.url, ...[].concat(page.data.redirect_from ?? []).map(withSlashes)];
  for (const source of from) {
    if (source === page.route || source === `${page.route}/` || source === page.route.replace(/\/$/, '')) continue;
    if (routes.has(source) || routes.has(source.replace(/\/$/, ''))) continue;
    if (!redirects.has(source)) redirects.set(source, page.route);
    if (!routeByUrl.has(source)) routeByUrl.set(source, page.route);
  }
}

// ---------------------------------------------------------------------------
// Conversion
// ---------------------------------------------------------------------------

const SITE_MARK = '\u0000SITE\u0000';
const unresolvedLinks = new Map();
const unknownLiquid = new Map();

function count(map, key) {
  map.set(key, (map.get(key) ?? 0) + 1);
}

function convertLiquid(text, page) {
  const vars = { ...siteVars };
  const [major] = String(siteVars.opensearch_major_minor_version ?? '').split('.');
  vars.major_version_mask = `${major}.x`;

  return text.split(/(\{%-?\s*raw\s*-?%\}[\s\S]*?\{%-?\s*endraw\s*-?%\})/).map((part, i) => {
    if (i % 2) return part.replace(/^\{%-?\s*raw\s*-?%\}|\{%-?\s*endraw\s*-?%\}$/g, '');
    return part
      .replace(/\{%-?\s*comment\s*-?%\}[\s\S]*?\{%-?\s*endcomment\s*-?%\}/g, '')
      .replace(/^[ \t]*\{%-?\s*include\s+copy(?:-curl)?\.html\s*-?%\}[ \t]*\r?\n?/gm, '')
      .replace(/\{%-?\s*include\s+copy(?:-curl)?\.html\s*-?%\}/g, '')
      .replace(/^[ \t]*\{%-?\s*assign\s[^%]*%\}[ \t]*\r?\n?/gm, '')
      .replace(/\{%-?\s*include\s+youtube-player\.html\s+id=['"]?([\w-]+)['"]?\s*-?%\}/g,
        (_, id) => `<iframe width="560" height="315" src="https://www.youtube.com/embed/${id}" title="YouTube video player" frameborder="0" allowfullscreen></iframe>`)
      .replace(/\{\{\s*site\.url\s*\}\}\{\{\s*site\.baseurl\s*\}\}/g, SITE_MARK)
      .replace(/\{\{\s*site\.url\s*\}\}\/docs\/latest/g, SITE_MARK)
      .replace(/\{\{\s*site\.baseurl\s*\}\}/g, SITE_MARK)
      .replace(/\{\{\s*site\.url\s*\}\}/g, SITE_URL)
      .replace(/\{\{\s*site\.([\w-]+)\s*\}\}/g, (all, key) => {
        if (key in vars) return vars[key];
        count(unknownLiquid, `${page.source}: ${all}`);
        return all;
      })
      .replace(/\{\{\s*major_version_mask\s*\}\}/g, vars.major_version_mask)
      .replace(/\{%[\s\S]*?%\}/g, all => {
        count(unknownLiquid, `${page.source}: ${all.slice(0, 60)}`);
        return '';
      });
  }).join('');
}

function resolveLink(target, page) {
  const m = target.match(/^([^#?]*)([?#].*)?$/);
  const pathPart = m[1];
  const rest = m[2] ?? '';
  if (/^\/(images|assets)\//.test(pathPart) || /\.\w+$/.test(pathPart) && !pathPart.endsWith('.html'))
    return target;
  const key = withSlashes(pathPart.replace(/\/index\.html$/, '/').replace(/\.html$/, '/'));
  const route = key === '/' ? '/' : routeByUrl.get(key) ?? routeByUrl.get(`${key}index/`);
  if (!route) {
    count(unresolvedLinks, `${pathPart}  (${page.source})`);
    return target;
  }
  return route + rest;
}

// Static files the pages may reference (copied to the site root by sync-zh.mjs).
const staticFiles = new Map();
for (const dir of ['images', 'assets']) {
  if (!fs.existsSync(path.join(ROOT, dir))) continue;
  for (const entry of fs.readdirSync(path.join(ROOT, dir), { recursive: true, withFileTypes: true })) {
    if (!entry.isFile()) continue;
    const rel = '/' + path.relative(ROOT, path.join(entry.parentPath ?? entry.path, entry.name)).split(path.sep).join('/');
    staticFiles.set(rel, rel);
    staticFiles.set(rel.toLowerCase(), staticFiles.get(rel.toLowerCase()) ?? rel);
    const base = `base:${entry.name.toLowerCase()}`;
    staticFiles.set(base, staticFiles.has(base) ? null : rel);
  }
}
const missingImages = new Map();

// Cloudflare Workers Static Assets rejects files over 25 MiB; sync-zh.mjs skips them,
// so pages load them from the upstream repository instead.
const MAX_ASSET_BYTES = 25 * 1024 * 1024;
const UPSTREAM_RAW = 'https://raw.githubusercontent.com/opensearch-project/documentation-website/main';

// Absolute path of an existing image, or null. Fixes case and relative paths.
function resolveImage(src, page) {
  if (/^(https?:)?\/\//.test(src) || src.startsWith('data:')) return src;
  let p = decodeURI(src.split(/[?#]/)[0]);
  if (!p.startsWith('/')) p = path.posix.join(page.url, p);
  const found = staticFiles.get(p) ?? staticFiles.get(p.toLowerCase()) ?? staticFiles.get(`base:${path.posix.basename(p).toLowerCase()}`) ?? null;
  if (found && fs.statSync(path.join(ROOT, found)).size > MAX_ASSET_BYTES) return UPSTREAM_RAW + found;
  return found;
}

function rewriteImages(line, page) {
  return line
    .replace(/!\[([^\]]*)\]\(\s*([^)\s]+)([^)]*)\)/g, (all, alt, src, rest) => {
      const found = resolveImage(src, page);
      if (found) return `![${alt}](${encodeURI(found)}${rest})`;
      count(missingImages, `${src}  (${page.source})`);
      return alt ? `*${alt}*` : '';
    })
    .replace(/<img\b[^>]*>/gi, tag => {
      const src = tag.match(/\bsrc="([^"]*)"/i)?.[1];
      if (!src) return tag;
      const found = resolveImage(src, page);
      if (found) return tag.replace(/\bsrc="[^"]*"/i, `src="${encodeURI(found)}"`);
      count(missingImages, `${src}  (${page.source})`);
      return tag.match(/\balt="([^"]*)"/i)?.[1] ?? '';
    });
}

function rewriteLinks(line, page) {
  return line
    .replace(/\]\((\/(?!\/)[^)\s]*)/g, (_, target) => `](${resolveLink(target, page)}`)
    .replace(/\b(href|src)="(\/(?!\/)[^"]*)"/g, (_, attr, target) => `${attr}="${resolveLink(target, page)}"`)
    .replace(/^(\s*\[[^\]]+\]:\s*)(\/(?!\/)\S*)/, (_, prefix, target) => `${prefix}${resolveLink(target, page)}`);
}

const FENCE = /^\s*(`{3,}|~{3,})/;
const IAL_LINE = /^\s*\{\s*:\s*([^}]*)\}\s*$/;
const HEADING = /^(#{1,6})\s+(.*?)\s*$/;
const CUSTOM_ID = /\s*\{#([^}]+)\}\s*$/;

// Marks each line as code (inside a fenced block, fence lines included) or not.
function codeMask(lines) {
  const mask = [];
  let fence = null;
  for (const line of lines) {
    const m = line.match(FENCE);
    if (m) {
      if (!fence) fence = m[1];
      else if (line.trim().startsWith(fence[0].repeat(fence.length)) && line.trim().replace(/[`~]/g, '') === '') fence = null;
      mask.push(true);
      continue;
    }
    mask.push(Boolean(fence));
  }
  return mask;
}

function ialClasses(spec) {
  return spec.split(/\s+/).map(token => token.replace(/^\./, '').replace(/\.$/, '')).filter(Boolean);
}

// Same algorithm as VitePress's default heading slugify.
function slugify(str) {
  return str.normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[\u0000-\u001f]/g, '')
    .replace(/[\s~`!@#$%^&*()\-_+=[\]{}|\\;:"'“”‘’<>,.?/]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/^(\d)/, '_$1')
    .toLowerCase();
}

// kramdown's auto id (transliterated_header_ids: false).
function kramdownId(str) {
  let id = str.replace(/^[^a-zA-Z]+/, '').replace(/[^a-zA-Z0-9 -]/g, '').replace(/ /g, '-').toLowerCase();
  return id || 'section';
}

function headingText(raw) {
  return raw
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/(\*\*|__|\*|_)(?=\S)([^*_]*?\S)\1/g, '$2')
    .replace(/&[a-z]+;/g, '')
    .trim();
}

function convertKramdown(text, page) {
  let lines = text.split(/\r?\n/);

  // Split trailing callout/label IALs onto their own line.
  let mask = codeMask(lines);
  lines = lines.flatMap((line, i) => {
    if (mask[i]) return [line];
    const m = line.match(/^(\s*)(.*\S)\s*(\{\s*:\s*\.?(?:note|tip|warning|important|label)[^}]*\})\s*$/);
    return m && !/^\{\s*:/.test(m[2]) ? [m[1] + m[2], m[1] + m[3]] : [line];
  });

  // Table of contents blocks: just-the-docs renders them; VitePress has the outline.
  mask = codeMask(lines);
  for (let i = 0; i < lines.length; i++) {
    if (mask[i] || !/^\s*\{:\s*toc\s*\}\s*$/.test(lines[i])) continue;
    let start = i;
    let end = i;
    const open = lines.slice(0, i).findLastIndex(line => /^\s*<details/i.test(line));
    const close = lines.findIndex((line, j) => j > i && /^\s*<\/details>/i.test(line));
    if (open >= 0 && close >= 0 && !lines.slice(open + 1, i).some(line => /<\/details>/i.test(line))) {
      start = open;
      end = close;
    } else {
      if (/^\s*1\.\s+TOC\s*$/.test(lines[start - 1] ?? '')) start--;
      let k = start - 1;
      while (k >= 0 && !lines[k].trim()) k--;
      if (k >= 0 && /^#{1,6}\s+table of contents\s*$/i.test(lines[k])) start = k;
    }
    for (let j = start; j <= end; j++) lines[j] = null;
  }
  lines = lines.filter(line => line !== null);

  // Block IALs: callouts, labels; drop the rest.
  mask = codeMask(lines);
  const out = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const ial = !mask[i] && line.match(IAL_LINE);
    if (!ial) {
      out.push(line);
      continue;
    }
    const indent = line.match(/^\s*/)[0];
    const classes = ialClasses(ial[1]);
    const callout = classes.find(c => CALLOUTS[c]);
    if (classes.includes('label')) {
      let k = out.length - 1;
      while (k >= 0 && !out[k].trim()) k--;
      if (k >= 0) {
        const label = out[k].trim().replace(/^\*\*(.*)\*\*$/, '$1').replace(/^_(.*)_$/, '$1').replace(/"/g, '&quot;');
        const type = classes.includes('label-red') ? 'danger' : classes.includes('label-yellow') ? 'warning' : 'tip';
        out[k] = `${out[k].match(/^\s*/)[0]}<Badge type="${type}" text="${label}" />`;
        out.push('');
      }
      continue;
    }
    if (callout) {
      let k = out.length - 1;
      while (k >= 0 && !out[k].trim()) k--;
      if (k < 0) continue;
      let start = k;
      if (FENCE.test(out[k])) {
        // Preceding block is a fenced code block: find its opening fence.
        start = k - 1;
        while (start > 0 && !FENCE.test(out[start])) start--;
      }
      while (start > 0 && out[start - 1].trim() && !HEADING.test(out[start]) && !FENCE.test(out[start - 1]) && !HEADING.test(out[start - 1]))
        start--;
      out.length = k + 1;
      out.splice(start, 0, '', `${indent}${CALLOUTS[callout]}`);
      out.push(`${indent}:::`, '');
      continue;
    }
    // .text-delta, .img-fluid, {:/}, ...: presentation only.
  }
  lines = out;

  // Inline IALs, nomarkdown markers, links, heading ids.
  mask = codeMask(lines);
  const usedIds = new Map();
  lines = lines.map((line, i) => {
    if (mask[i]) return line.split(SITE_MARK).join(SITE_URL);
    let result = line
      .replace(/\{::nomarkdown\}|\{:\/\}|\{::options[^}]*\/?\}/g, '')
      .replace(/\{\s*:(?!\/)[^}\n]*\}/g, '')
      .split(SITE_MARK).join('');
    result = rewriteLinks(rewriteImages(result, page), page);
    const heading = result.match(HEADING);
    if (heading && !CUSTOM_ID.test(result)) {
      const textValue = headingText(heading[2]);
      let kid = kramdownId(textValue);
      const n = usedIds.get(kid) ?? 0;
      usedIds.set(kid, n + 1);
      if (n) kid = `${kid}-${n}`;
      if (kid !== slugify(textValue)) result = `${result.trimEnd()} {#${kid}}`;
    }
    return result;
  });

  // kramdown ends an HTML line at the line break; CommonMark keeps the HTML block open
  // until a blank line and would swallow a code fence that follows directly.
  mask = codeMask(lines);
  lines = lines.flatMap((line, i) => {
    const next = lines[i + 1];
    const opensFence = next !== undefined && mask[i + 1] && !mask[i] && FENCE.test(next);
    return opensFence && /^\s*(?:[-*+]\s+|\d+\.\s+)?<.*>\s*$/.test(line) ? [line, ''] : [line];
  });

  return lines.join('\n').replace(/\n{3,}/g, '\n\n');
}

function frontMatterFor(page) {
  const keep = ['title', 'description'];
  const lines = keep.filter(key => page.lines[key] && page.data[key] !== '').map(key => page.lines[key]);
  return lines.length ? `---\n${lines.join('\n')}\n---\n\n` : '';
}

// ---------------------------------------------------------------------------
// Navigation
// ---------------------------------------------------------------------------

function navCompare(a, b) {
  const ao = a.data.nav_order;
  const bo = b.data.nav_order;
  const an = ao !== undefined && ao !== '' && !isNaN(Number(ao));
  const bn = bo !== undefined && bo !== '' && !isNaN(Number(bo));
  if (an && bn) return Number(ao) - Number(bo);
  if (an !== bn) return an ? -1 : 1;
  return String(ao ?? a.data.title ?? '').localeCompare(String(bo ?? b.data.title ?? ''));
}

function buildTree(collectionPages) {
  const visible = collectionPages.filter(page => page.data.nav_exclude !== 'true' && page.data.title);
  const placed = new Set();

  function children(node) {
    return visible
      .filter(page => !placed.has(page) && page.data.parent === node.data.title
        && (page.data.grand_parent ?? null) === (node.data.parent ?? null))
      .sort(navCompare);
  }

  function toItem(page) {
    placed.add(page);
    const kids = children(page).map(kid => {
      placed.add(kid);
      return kid;
    });
    const item = { text: page.data.title, link: page.route };
    if (kids.length) item.items = kids.map(toItem);
    return item;
  }

  const top = visible.filter(page => !page.data.parent).sort(navCompare);
  top.forEach(page => placed.add(page));
  const tree = top.map(toItem);

  // Pages whose parent/grand_parent do not line up exactly: attach by parent title,
  // repeating while that places more pages (an orphan can be another orphan's parent).
  const find = (items, title) => {
    for (const item of items) {
      if (item.text === title) return item;
      const found = item.items && find(item.items, title);
      if (found) return found;
    }
    return null;
  };
  let progress = true;
  while (progress) {
    progress = false;
    for (const page of visible.filter(page => !placed.has(page)).sort(navCompare)) {
      const parent = find(tree, page.data.parent);
      if (!parent) continue;
      (parent.items ??= []).push(toItem(page));
      progress = true;
    }
  }
  for (const page of visible.filter(page => !placed.has(page)).sort(navCompare)) {
    if (placed.has(page)) continue;
    console.warn(`[import] ${page.source}: parent "${page.data.parent}" is not in this collection; listed at its top level.`);
    tree.push(toItem(page));
  }
  return tree;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  const kept = new Map();
  for (const rel of KEEP) {
    const file = path.join(SRC_DIR, rel);
    if (fs.existsSync(file)) kept.set(rel, fs.readFileSync(file));
  }
  fs.rmSync(SRC_DIR, { recursive: true, force: true });
  fs.mkdirSync(PUBLIC_DIR, { recursive: true });
  for (const [rel, content] of kept) {
    fs.mkdirSync(path.dirname(path.join(SRC_DIR, rel)), { recursive: true });
    fs.writeFileSync(path.join(SRC_DIR, rel), content);
  }

  let written = 0;
  for (const page of livePages) {
    if (KEEP.has(page.file)) continue;
    const body = convertKramdown(convertLiquid(page.body, page), page).trim();
    const file = path.join(SRC_DIR, page.file);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, `${frontMatterFor(page)}${body}\n`);
    written++;
  }

  for (const name of PUBLIC_FILES) {
    if (fs.existsSync(path.join(ROOT, name))) fs.copyFileSync(path.join(ROOT, name), path.join(PUBLIC_DIR, name));
  }

  const redirectLines = [...redirects].sort(([a], [b]) => a.localeCompare(b)).map(([from, to]) => `${from} ${to} 301`);
  fs.writeFileSync(path.join(PUBLIC_DIR, '_redirects'),
    `# Generated by scripts/import-jekyll.mjs: old Jekyll URLs and redirect_from entries.\n${redirectLines.join('\n')}\n`);

  const nav = sections.map(section => ({
    base: section.base,
    groups: section.collections
      .map(collection => ({
        text: collection.text,
        collection: collection.name,
        items: buildTree(livePages.filter(page => page.collection === collection.name)),
      }))
      .filter(group => group.items.length),
  }));
  fs.writeFileSync(NAV_FILE, `${JSON.stringify(nav, null, 2)}\n`);

  if (unknownLiquid.size) {
    console.warn(`[import] ${unknownLiquid.size} unhandled Liquid expressions (left as is or removed):`);
    for (const key of [...unknownLiquid.keys()].slice(0, 20)) console.warn(`  ${key}`);
  }
  if (missingImages.size) {
    console.warn(`[import] ${missingImages.size} images do not exist in the repository and were replaced by their alt text:`);
    for (const key of missingImages.keys()) console.warn(`  ${key}`);
  }
  if (unresolvedLinks.size) {
    console.warn(`[import] ${unresolvedLinks.size} internal links did not match a page (kept unchanged). First 30:`);
    for (const key of [...unresolvedLinks.keys()].slice(0, 30)) console.warn(`  ${key}`);
  }
  console.log(`[import] ${written} pages written to src/, ${redirectLines.length} redirects, nav in scripts/nav.json.`);
}

main();
