---
title: 搜索分析器
---

# 搜索分析器

搜索分析器（Search Analyzer）在查询时指定，用于在对 [text](/field-types/supported-field-types/text) 字段运行全文查询（Full-text Query）时分析查询字符串。

## 确定使用哪个搜索分析器

为了确定在查询时对查询字符串使用哪个分析器（Analyzer），OpenSearch 会按顺序检查以下参数：

1. 查询的 `analyzer` 参数
1. 字段的 `search_analyzer` 映射参数
1. `analysis.analyzer.default_search` 索引设置
1. 字段的 `analyzer` 映射参数
1. `standard` 分析器（默认）

::: danger 警告
在大多数情况下，没有必要指定与索引分析器不同的搜索分析器，这样做可能会降低搜索结果的相关性，或导致意外的搜索结果。
:::

关于如何验证哪个分析器与哪个字段关联，请参阅[验证分析器设置](/analyzers/#verifying-analyzer-settings)。

## 为查询字符串指定搜索分析器

在 `analyzer` 字段中指定查询时要使用的分析器名称：

```json
GET shakespeare/_search
{
  "query": {
    "match": {
      "text_entry": {
        "query": "speak the truth",
        "analyzer": "english"
      }
    }
  }
}
```

[内置分析器](/analyzers/#built-in-analyzers)的有效值为 `standard`、`simple`、`whitespace`、`stop`、`keyword`、`pattern`、`fingerprint`，或任何受支持的[语言分析器](/analyzers/language-analyzers)。

## 为字段指定搜索分析器

创建索引映射（Mapping）时，你可以为每个 [text](/field-types/supported-field-types/text) 字段提供 `search_analyzer` 参数。提供 `search_analyzer` 时，还必须提供 `analyzer` 参数，用于指定索引时使用的[索引分析器](/analyzers/index-analyzers)。

例如，以下请求为 `text_entry` 字段指定 `simple` 分析器作为索引分析器，`whitespace` 分析器作为搜索分析器：

```json
PUT testindex
{
  "mappings": {
    "properties": {
      "text_entry": {
        "type": "text",
        "analyzer": "simple",
        "search_analyzer": "whitespace"
      }
    }
  }
}
```

## 为索引指定默认搜索分析器

如果你想在搜索时使用同一个分析器分析所有查询字符串，可以在 `analysis.analyzer.default_search` 设置中指定搜索分析器。提供 `analysis.analyzer.default_search` 时，还必须提供 `analysis.analyzer.default` 参数，用于指定索引时使用的[索引分析器](/analyzers/index-analyzers)。

例如，以下请求为 `testindex` 索引指定 `simple` 分析器作为索引分析器，`whitespace` 分析器作为搜索分析器：

```json
PUT testindex
{
  "settings": {
    "analysis": {
      "analyzer": {
        "default": {
          "type": "simple"
        },
        "default_search": {
          "type": "whitespace"
        }
      }
    }
  }
}

```
