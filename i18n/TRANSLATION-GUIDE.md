# OpenSearch 文档中文翻译规范

## 文件位置

- Jekyll 原文：`_<collection>/<路径>.md`（例如 `_query-dsl/full-text/match.md`），跟随官方仓库更新，**不要修改**。
- 英文原文（VitePress 版）：`src/<路径>.md`，由 `node scripts/import-jekyll.mjs` 从 Jekyll 原文转换生成，**不要手工修改**（`src/index.md` 首页除外）。构建时 `scripts/sync-zh.mjs` 会把它发布到 `/en/<路径>`。
- 中文译文：`i18n/zh/<路径>.md`，与 `src/` 下的路径一一对应。构建时发布到站点根路径 `/<路径>`。
- **翻译时以 `src/` 下的文件为原文**，不要以 `_<collection>/` 下的 Jekyll 文件为原文：`src/` 中已经把 Liquid 变量、`{: .note}` 等 kramdown 语法转换成了 VitePress 语法。
- 没有译文的页面会自动以英文显示并标记 `untranslated: true`。

## 翻译要求

1. 读者是中文开发者和运维人员。译文要自然、通顺，不要逐词硬译；使用简体中文。
2. **术语**：OpenSearch 核心术语首次出现时写成「中文（English）」，之后只用中文。例如：索引（Index）、文档（Document）、字段（Field）、映射（Mapping）、分片（Shard）、主分片（Primary Shard）、副本分片（Replica Shard）、节点（Node）、集群（Cluster）、集群管理节点（Cluster Manager Node）、分析器（Analyzer）、分词器（Tokenizer）、词元过滤器（Token Filter）、聚合（Aggregation）、桶聚合（Bucket Aggregation）、指标聚合（Metric Aggregation）、查询（Query）、过滤器（Filter）、相关性评分（Relevance Score）、摄取管道（Ingest Pipeline）、处理器（Processor）、搜索管道（Search Pipeline）、快照（Snapshot）、别名（Alias）、索引模板（Index Template）、索引状态管理（Index State Management，ISM）、段（Segment）、段复制（Segment Replication）、远程存储（Remote Store）、跨集群复制（Cross-cluster Replication）、可观测性（Observability）、向量搜索（Vector Search）、神经搜索（Neural Search）、混合搜索（Hybrid Search）。
   其他已统一的译法：插件（plugin）、仪表板（dashboard，产品名 OpenSearch Dashboards 不译）、可视化（visualization）、告警（alerting）、监控器（monitor）、角色（role）、权限（permission）、租户（tenant）。
3. 产品名、库名、API 名称和代码标识符保持英文：OpenSearch、OpenSearch Dashboards、Data Prepper、OpenSearch Benchmark、Lucene、Query DSL、PPL、SQL、k-NN、`_search`、`match`、`bool` 等。API 的端点、参数名和字段名保持英文。
4. **不翻译**：代码块内的代码、行内代码（反引号内）、文件路径、命令、URL、HTML 标签和属性、Vue/VitePress 组件标签及属性名（例如 `<Badge type="tip" text="Introduced 1.0" />` 中的 `text` 值保留英文）。代码块中的**注释**可以翻译。
   - 代码块的整行 fence（包括 ```` ```json ```` 这类语言标记）保持原样，不要翻译。
   - 示例请求和示例响应（JSON、YAML、curl 命令）保持原样。
5. **保持结构**：标题层级、列表、表格、`:::` 容器、HTML 片段、空行和 frontmatter 的键名都保持原样。frontmatter 中的 `title`、`description` 等文字值要翻译。
   - 容器标题统一译为：NOTE → 注意，TIP → 提示，IMPORTANT → 重要，WARNING → 警告。例如 `::: info NOTE` 译为 `::: info 注意`。
   - API 参数表格：参数名、数据类型（Boolean、String、Integer 等）保持英文，只翻译描述列。
6. **链接**：链接地址保持原样（站内的 `/xxx` 链接会自动指向中文页面），只翻译链接文字。锚点链接（`#some-heading`）保持原样。
   - 标题锚点不用手动处理：`scripts/sync-zh.mjs` 构建时会按顺序把中文标题与英文标题配对，自动加上英文锚点 `{#english-slug}`。因此**译文的标题数量和顺序必须与原文完全一致**，不能合并、拆分或增删标题。原文已有的 `{#xxx}` 保持原样。
7. 中英文之间、中文与数字之间加一个空格。中文语境下使用全角标点（，。：；？！「」（）），代码和英文内容中保持半角。
8. 不要增删内容，不要添加译者注，除非原文有明显错误。
