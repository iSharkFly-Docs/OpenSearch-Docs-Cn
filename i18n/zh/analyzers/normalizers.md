---
title: 规范化器
---

# 规范化器

*规范化器（Normalizer）* 的作用与分析器类似，但只输出单个词元（Token）。它不包含分词器（Tokenizer），并且只能包含特定类型的字符过滤器（Character Filter）和词元过滤器（Token Filter）。这些过滤器只能执行字符级操作，例如字符替换或模式替换，而不能对整个词元进行操作。这意味着不支持将词元替换为同义词，也不支持词干提取。

规范化器在关键字搜索（即基于词项的查询）中很有用，因为它允许你对任意输入运行词元过滤器和字符过滤器。例如，它可以让传入的查询 `Naïve` 与索引词项 `naive` 相匹配。

请看下面的示例。

创建一个带有自定义规范化器的新索引：
```json
PUT /sample-index
{
  "settings": {
    "analysis": {
      "normalizer": {
        "normalized_keyword": {
          "type": "custom",
          "char_filter": [],
          "filter": [ "asciifolding", "lowercase" ]
        }
      }
    }
  },
  "mappings": {
    "properties": {
      "approach": {
        "type": "keyword",
        "normalizer": "normalized_keyword"
      }
    }
  }
}
```

索引一个文档：
```json
POST /sample-index/_doc/
{
  "approach": "naive"
}
```

以下查询会匹配该文档，这符合预期：
```json
GET /sample-index/_search
{
  "query": {
    "term": {
      "approach": "naive"
    }
  }
}
```

但下面这个查询同样会匹配该文档：
```json
GET /sample-index/_search
{
  "query": {
    "term": {
      "approach": "Naïve"
    }
  }
}
```

要理解其中的原因，请看规范化器的作用效果：
```json
GET /sample-index/_analyze
{
  "normalizer" : "normalized_keyword",
  "text" : "Naïve"
}
```

在内部，规范化器只接受 `NormalizingTokenFilterFactory` 或 `NormalizingCharFilterFactory` 的实例作为过滤器。以下列出了 OpenSearch 核心仓库中各模块和插件所提供的兼容过滤器。

### `common-analysis` 模块

此模块无需安装，默认可用。

字符过滤器：`pattern_replace`、`mapping`

词元过滤器：`arabic_normalization`、`asciifolding`、`bengali_normalization`、`cjk_width`、`decimal_digit`、`elision`、`german_normalization`、`hindi_normalization`、`indic_normalization`、`lowercase`、`persian_normalization`、`scandinavian_folding`、`scandinavian_normalization`、`serbian_normalization`、`sorani_normalization`、`trim`、`uppercase`

### `analysis-icu` 插件

字符过滤器：`icu_normalizer`

词元过滤器：`icu_normalizer`、`icu_folding`、`icu_transform`

### `analysis-kuromoji` 插件

字符过滤器：`normalize_kanji`、`normalize_kana`

### `analysis-nori` 插件

字符过滤器：`normalize_kanji`、`normalize_kana`

::: info 注意
这些过滤器列表仅包含 OpenSearch 核心仓库中[附加插件](/install-and-configure/plugins#additional-plugins)所提供的分析组件。
:::
