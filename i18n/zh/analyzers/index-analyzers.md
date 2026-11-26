---
title: 索引分析器
---

# 索引分析器

索引分析器（Index Analyzer）在索引时指定，用于在索引文档（Document）时分析 [text](/field-types/supported-field-types/text) 字段。

## 确定使用哪个索引分析器

为了确定在索引文档时对某个字段使用哪个分析器（Analyzer），OpenSearch 会按顺序检查以下参数：

1. 字段的 `analyzer` 映射参数
1. `analysis.analyzer.default` 索引设置
1. `standard` 分析器（默认）

::: warning 重要
指定索引分析器时请注意，在大多数情况下，为索引中的每个 `text` 字段指定一个分析器效果最好。使用同一个分析器分析 text 字段（在索引时）和查询字符串（在查询时），可以确保搜索使用的词项与索引中存储的词项相同。 
:::

关于如何验证哪个分析器与哪个字段关联，请参阅[验证分析器设置](/analyzers/#verifying-analyzer-settings)。

## 为字段指定索引分析器

创建索引映射（Mapping）时，你可以为每个 [text](/field-types/supported-field-types/text) 字段提供 `analyzer` 参数。例如，以下请求为 `text_entry` 字段指定了 `simple` 分析器：

```json
PUT testindex
{
  "mappings": {
    "properties": {
      "text_entry": {
        "type": "text",
        "analyzer": "simple"
      }
    }
  }
}
```

## 为索引指定默认索引分析器

如果你想对索引中的所有 text 字段使用同一个分析器，可以在 `analysis.analyzer.default` 设置中指定，如下所示：

```json
PUT testindex
{
  "settings": {
    "analysis": {
      "analyzer": {
        "default": {
          "type": "simple"
        }
      }
    }
  }
}
```

::: info 注意
如果没有指定默认分析器，则使用 `standard` 分析器。
:::
