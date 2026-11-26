// Generates the site.json configuration file for the OpenSearch documentation.
// The sidebar comes from scripts/nav.json, which import-jekyll.mjs writes from the
// just-the-docs front matter (title / parent / grand_parent / nav_order).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const NAV_FILE = path.join(SITE_DIR, 'scripts', 'nav.json');
const GENERATED_DIR = path.join(SITE_DIR, '.vitepress', 'generated');

function toSidebarItems(items) {
  return items.map(item => {
    if (item.items)
      return { text: item.text, link: item.link, collapsed: true, items: toSidebarItems(item.items) };
    return { text: item.text, link: item.link };
  });
}

function main() {
  if (!fs.existsSync(NAV_FILE))
    throw new Error('scripts/nav.json is missing. Run "node scripts/import-jekyll.mjs" first.');
  const nav = JSON.parse(fs.readFileSync(NAV_FILE, 'utf8'));

  // One sidebar per just-the-docs section: OpenSearch (/), Clients, Benchmark, Data Prepper.
  const sidebar = {};
  for (const section of nav) {
    sidebar[section.base] = section.groups.map(group => ({
      text: group.text,
      collapsed: section.groups.length > 1,
      items: toSidebarItems(group.items),
    }));
  }

  fs.mkdirSync(GENERATED_DIR, { recursive: true });
  const site = {
    locales: {
      root: {
        label: 'OpenSearch',
        base: '/',
        sidebar,
      },
    },
  };

  fs.writeFileSync(path.join(GENERATED_DIR, 'site.json'), JSON.stringify(site, null, 2));
  console.log('[generate] Generated site.json');
}

main();
