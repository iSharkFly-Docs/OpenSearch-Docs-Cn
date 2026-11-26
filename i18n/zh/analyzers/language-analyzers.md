---
title: 语言分析器
---

# 语言分析器

OpenSearch 的 `analyzer` 选项支持以下语言值：
`arabic`、`armenian`、`basque`、`bengali`、`brazilian`、`bulgarian`、`catalan`、`czech`、`danish`、`dutch`、`english`、`estonian`、`finnish`、`french`、`galician`、`german`、`greek`、`hindi`、`hungarian`、`indonesian`、`irish`、`italian`、`latvian`、`lithuanian`、`norwegian`、`persian`、`portuguese`、`romanian`、`russian`、`sorani`、`spanish`、`swedish`、`turkish` 和 `thai`。

要在映射索引时使用该分析器，请在查询中指定该值。例如，要使用法语分析器映射索引，请为 analyzer 字段指定 `french` 值：

```json
 "analyzer": "french"
```

#### 示例请求

以下查询为索引 `my-index` 指定了 `french` 语言分析器：

```json
PUT my-index
{
  "mappings": {
    "properties": {
      "text": { 
        "type": "text",
        "fields": {
          "french": { 
            "type": "text",
            "analyzer": "french"
          }
        }
      }
    }
  }
}
```

<!-- TO do: each of the options needs its own section with an example. Convert table to individual sections, and then give a streamlined list with valid values. -->
