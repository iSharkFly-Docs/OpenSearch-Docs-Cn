import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, type DefaultTheme, type LocaleConfig } from 'vitepress';

type GeneratedLocale = {
  label: string;
  base: string;
  sidebar: DefaultTheme.SidebarMulti;
};

const siteFile = path.join(path.dirname(fileURLToPath(import.meta.url)), 'generated', 'site.json');
if (!fs.existsSync(siteFile))
  throw new Error('Run "node scripts/generate.mjs" first. The file .vitepress/generated/site.json is missing.');
const site: { locales: Record<string, GeneratedLocale> } = JSON.parse(fs.readFileSync(siteFile, 'utf8'));
const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const englishSrcDir = path.join(rootDir, 'src');

const EN_PREFIX = '/en';
const FORUM_URL = 'https://www.isharkfly.com/tag/opensearch';
const CONTACT_URL = 'https://www.isharkfly.com/t/opensearch/15530';
const REPO_URL = 'https://github.com/iSharkFly-Docs/opensearch-docs-cn';

// Sidebar group names (just-the-docs collection names from _config.yml).
const zhSidebarText: Record<string, string> = {
  'About OpenSearch': '关于 OpenSearch',
  'Install and upgrade': '安装与升级',
  'Migrate to OpenSearch': '迁移到 OpenSearch',
  'Managing Indexes': '索引管理',
  'Ingest Pipelines': '摄取管道',
  'OpenSearch Integrations': 'OpenSearch 集成',
  'Creating and tuning your cluster': '创建与调优集群',
  'Security in OpenSearch': 'OpenSearch 安全',
  'Security analytics': '安全分析',
  'Mappings and field types': '映射与字段类型',
  'Text analysis': '文本分析',
  'Aggregations': '聚合',
  'Search': '搜索',
  'Machine learning': '机器学习',
  'Automating configurations': '自动化配置',
  'Monitoring your cluster': '监控集群',
  'Observability': '可观测性',
  'Reporting': '报告',
  'Tools': '工具',
  'API reference': 'API 参考',
  'Troubleshooting': '故障排查',
  'Developer documentation': '开发者文档',
  'Clients': '客户端',
};

// Sections with their own sidebar; everything else belongs to the main docs.
const SECTION_PATHS = '(?:clients|benchmark|data-prepper|api-reference|en)/';

function enLink(link: string) {
  return link.startsWith('/') ? EN_PREFIX + link : link;
}

function mapSidebar(
  sidebar: DefaultTheme.SidebarMulti,
  mapLink: (link: string) => string,
  mapGroupText: (text: string) => string,
): DefaultTheme.SidebarMulti {
  const mapItems = (items: DefaultTheme.SidebarItem[]): DefaultTheme.SidebarItem[] => items.map(item => ({
    ...item,
    ...(item.items ? { text: mapGroupText(item.text ?? ''), items: mapItems(item.items) } : {}),
    ...(item.link ? { link: mapLink(item.link) } : {}),
  }));
  return Object.fromEntries(Object.entries(sidebar).map(([key, value]) => [
    mapLink(key),
    Array.isArray(value) ? mapItems(value) : { ...value, base: mapLink(value.base), items: mapItems(value.items) },
  ]));
}

const zhThemeText: DefaultTheme.Config = {
  outline: { level: [2, 3], label: '本页目录' },
  docFooter: { prev: '上一页', next: '下一页' },
  darkModeSwitchLabel: '外观',
  lightModeSwitchTitle: '切换到浅色模式',
  darkModeSwitchTitle: '切换到深色模式',
  sidebarMenuLabel: '菜单',
  returnToTopLabel: '回到顶部',
  langMenuLabel: '切换语言',
  skipToContentLabel: '跳到正文',
  notFound: {
    title: '页面未找到',
    quote: '你要找的页面不存在，或者已经被移动。',
    linkLabel: '返回首页',
    linkText: '返回首页',
  },
  footer: {
    message: `基于 Apache License 2.0 发布。<a href="${FORUM_URL}">OpenSearch 中文论坛</a> · <a href="${CONTACT_URL}">联系我们</a>`,
    copyright: 'Copyright © OpenSearch contributors',
  },
};

const zhSearchText = {
  button: { buttonText: '搜索', buttonAriaLabel: '搜索' },
  modal: {
    displayDetails: '显示详细列表',
    resetButtonTitle: '清除查询',
    backButtonTitle: '关闭搜索',
    noResultsText: '没有找到结果',
    footer: {
      selectText: '选择',
      selectKeyAriaLabel: '回车',
      navigateText: '切换',
      navigateUpKeyAriaLabel: '向上',
      navigateDownKeyAriaLabel: '向下',
      closeText: '关闭',
      closeKeyAriaLabel: 'Esc',
    },
  },
};

const zhLocales: LocaleConfig<DefaultTheme.Config> = {};
const enLocales: LocaleConfig<DefaultTheme.Config> = {};

for (const [key, locale] of Object.entries(site.locales)) {
  const b = locale.base;
  zhLocales[key] = {
    label: `简体中文`,
    lang: 'zh-CN',
    link: b,
    title: 'OpenSearch',
    description: `OpenSearch 中文文档`,
    themeConfig: {
      ...zhThemeText,
      nav: [
        { text: '文档', link: `${b}about/`, activeMatch: `^${b}(?!${SECTION_PATHS})[^/]+` },
        { text: 'API 参考', link: `${b}api-reference/`, activeMatch: `^${b}api-reference/` },
        { text: '客户端', link: `${b}clients/`, activeMatch: `^${b}clients/` },
        { text: 'Data Prepper', link: `${b}data-prepper/`, activeMatch: `^${b}data-prepper/` },
        { text: 'Benchmark', link: `${b}benchmark/`, activeMatch: `^${b}benchmark/` },
        { text: '中文论坛', link: FORUM_URL },
      ],
      sidebar: mapSidebar(locale.sidebar, link => link, text => zhSidebarText[text] ?? text),
    },
  };

  const enBase = enLink(b);
  enLocales[key === 'root' ? 'en' : `en/${key}`] = {
    label: `English`,
    lang: 'en-US',
    link: enBase,
    title: 'OpenSearch',
    description: `OpenSearch documentation`,
    themeConfig: {
      nav: [
        { text: 'Docs', link: `${enBase}about/`, activeMatch: `^${enBase}(?!${SECTION_PATHS})[^/]+` },
        { text: 'API reference', link: `${enBase}api-reference/`, activeMatch: `^${enBase}api-reference/` },
        { text: 'Clients', link: `${enBase}clients/`, activeMatch: `^${enBase}clients/` },
        { text: 'Data Prepper', link: `${enBase}data-prepper/`, activeMatch: `^${enBase}data-prepper/` },
        { text: 'Benchmark', link: `${enBase}benchmark/`, activeMatch: `^${enBase}benchmark/` },
        { text: 'Forum', link: FORUM_URL },
      ],
      sidebar: mapSidebar(locale.sidebar, enLink, text => text),
    },
  };
}

const locales: LocaleConfig<DefaultTheme.Config> = { ...zhLocales };
for (const key of Object.keys(enLocales).sort((a, b) => b.length - a.length))
  locales[key] = enLocales[key];

function listPages(dir: string, rel = ''): string[] {
  if (!fs.existsSync(dir))
    return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const entryRel = rel + entry.name;
    if (entry.isDirectory()) {
      if (!rel && (['zh', 'en', 'public'].includes(entry.name) || site.locales[entry.name]))
        return [];
      return listPages(path.join(dir, entry.name), `${entryRel}/`);
    }
    return entry.name.endsWith('.md') ? [entryRel] : [];
  });
}

const pagesByLanguage = Object.fromEntries(Object.keys(site.locales).map(key => [
  key,
  listPages(key === 'root' ? englishSrcDir : path.join(englishSrcDir, key)),
]));

// Tags the docs write as HTML. Anything else that looks like a tag in the text
// (such as <index> or <node-id> placeholders) is shown literally instead of being
// compiled by Vue.
const HTML_TAGS = new Set((
  'a abbr audio b badge big blockquote br button caption center cite code col colgroup dd del details dfn div dl dt '
  + 'em figcaption figure font h1 h2 h3 h4 h5 h6 header hr i iframe img input ins kbd label li mark nobr ol option p '
  + 'picture pre q s samp section select small source span strong style sub summary sup svg table tbody td '
  + 'textarea tfoot th thead tr tt u ul var video wbr'
).split(' '));

function isKnownTag(html: string) {
  const m = html.match(/^<\/?([A-Za-z][\w-]*)/);
  return !m || HTML_TAGS.has(m[1]) || m[1] === 'Badge';
}

export default defineConfig({
  srcDir: 'site',
  lang: 'zh-CN',
  title: 'OpenSearch',
  description: 'OpenSearch 中文文档',
  cleanUrls: true,
  lastUpdated: false,
  ignoreDeadLinks: true,
  locales,
  head: [
    ['link', { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' }],
    ['link', { rel: 'alternate icon', href: '/favicon.png', type: 'image/png' }],
    // Google Tag Manager
    ['script', {}, `(function (w, d, s, l, i) {
        w[l] = w[l] || [];
        w[l].push({
            'gtm.start':
                new Date().getTime(), event: 'gtm.js'
        });
        var f = d.getElementsByTagName(s)[0],
            j = d.createElement(s), dl = l != 'dataLayer' ? '&l=' + l : '';
        j.async = true;
        j.src =
            'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
        f.parentNode.insertBefore(j, f);
    })(window, document, 'script', 'dataLayer', 'GTM-W3NL9V');`],
    // End Google Tag Manager
  ],
  markdown: {
    theme: { light: 'github-light', dark: 'github-dark' },
    config: md => {
      const defaultCodeInline = md.renderer.rules.code_inline!;
      md.renderer.rules.code_inline = (tokens, idx, options, env, self) =>
        defaultCodeInline(tokens, idx, options, env, self).replace(/^<code/, '<code v-pre');
      const defaultText = md.renderer.rules.text!;
      md.renderer.rules.text = (tokens, idx, options, env, self) =>
        defaultText(tokens, idx, options, env, self).replace(/\{\{/g, '&#123;&#123;').replace(/\}\}/g, '&#125;&#125;');
      md.renderer.rules.html_inline = (tokens, idx) =>
        isKnownTag(tokens[idx].content) ? tokens[idx].content : md.utils.escapeHtml(tokens[idx].content);
      const defaultHtmlBlock = md.renderer.rules.html_block!;
      md.renderer.rules.html_block = (tokens, idx, options, env, self) =>
        isKnownTag(tokens[idx].content.trimStart())
          ? defaultHtmlBlock(tokens, idx, options, env, self)
          : `<p>${md.utils.escapeHtml(tokens[idx].content)}</p>`;
    },
  },
  themeConfig: {
    logo: '/favicon.svg',
    search: {
      provider: 'local',
      options: {
        locales: Object.fromEntries(Object.keys(zhLocales).map(key => [key, { translations: zhSearchText }])),
      },
    },
    outline: { level: [2, 3] },
    socialLinks: [
      { icon: 'github', link: REPO_URL },
    ],
    editLink: undefined,
    footer: {
      message: `Released under the Apache License 2.0. <a href="${FORUM_URL}">Forum</a> · <a href="${CONTACT_URL}">Contact us</a>`,
      copyright: 'Copyright © OpenSearch contributors',
    },
    languageSwitcher: {
      enPrefix: EN_PREFIX,
      pages: pagesByLanguage,
    },
  } as DefaultTheme.Config,
  vite: {
    build: { chunkSizeWarningLimit: 4096 },
    // Some docs images use upper-case extensions (apply-policy.PNG).
    assetsInclude: [/\.(PNG|JPE?G|GIF|SVG)$/],
    resolve: {
      alias: [
        {
          find: /^.*\/VPNavBarTranslations\.vue$/,
          replacement: fileURLToPath(new URL('./theme/components/NavBarLanguageSwitcher.vue', import.meta.url)),
        },
        {
          find: /^.*\/VPNavScreenTranslations\.vue$/,
          replacement: fileURLToPath(new URL('./theme/components/NavScreenLanguageSwitcher.vue', import.meta.url)),
        },
      ],
    },
  },
});
