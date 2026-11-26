---
title: Keyword
---

# Keyword 字段类型

keyword 字段类型包含不经过分析的字符串，只允许精确且区分大小写的匹配。

默认情况下，keyword 字段既会被索引（因为启用了 `index`），也会存储到磁盘上（因为启用了 `doc_values`）。为了减少磁盘空间占用，可以将 `index` 设置为 `false`，不对 keyword 字段建立索引。

::: info 注意
如果需要将字段用于全文搜索，请将其映射为 [`text`](/field-types/supported-field-types/text)。
:::

## 示例

以下查询创建了一个包含 keyword 字段的映射（Mapping）。将 `index` 设置为 `false` 表示将 `genre` 字段存储在磁盘上，并通过 `doc_values` 检索：

```json
PUT movies
{
  "mappings" : {
    "properties" : {
      "genre" : {
        "type" :  "keyword",
        "index" : false
      }
    }
  }
}
```

## 参数

下表列出了 keyword 字段类型接受的参数。所有参数均为可选。

参数 | 描述 
:--- | :--- 
`boost` | 一个浮点值，指定该字段对相关性评分（Relevance Score）的权重。大于 1.0 的值会提高该字段的相关性，介于 0.0 和 1.0 之间的值会降低该字段的相关性。默认值为 1.0。
`doc_values` | 一个布尔值，指定是否将该字段存储到磁盘上，以便用于聚合、排序或脚本。默认值为 `true`。
`eager_global_ordinals` | 指定是否在刷新时预先加载全局序号（global ordinals）。如果该字段经常用于聚合，应将此参数设置为 `true`。默认值为 `false`。
`fields` | 如需以多种方式索引同一个字符串（例如同时作为 keyword 和 text），请提供 fields 参数。可以指定字段的一个版本用于搜索，另一个版本用于排序和聚合。
`ignore_above` | 长度超过该整数值的字符串不会被索引。默认值为 2147483647。默认的动态映射会创建一个 keyword 子字段，其 `ignore_above` 设置为 256。
`index` | 一个布尔值，指定该字段是否可搜索。默认值为 `true`。为了减少磁盘空间占用，可将 `index` 设置为 `false`。
`index_options` | 存储在索引中、计算相关性评分时会用到的信息。可以设置为 `freqs` 以存储词频。默认值为 `docs`。
`meta` | 接受该字段的元数据。
[`normalizer`](/analyzers/normalizers) | 指定在索引之前如何预处理该字段（例如转换为小写）。默认值为 `null`（不做预处理）。
`norms` | 一个布尔值，指定在计算相关性评分时是否使用字段长度。默认值为 `false`。
[`null_value`](/field-types/supported-field-types/#null-value) | 用于替代 `null` 的值，必须与字段类型相同。如果未指定此参数，当字段值为 `null` 时，该字段会被视为缺失。默认值为 `null`。
`similarity` | 用于计算相关性评分的排序算法。默认值为 `BM25`。 
`split_queries_on_whitespace` | 一个布尔值，指定全文查询（Full-text Query）是否按空白字符拆分。默认值为 `false`。
`store` | 一个布尔值，指定是否存储字段值，以便能独立于 `_source` 字段单独检索。默认值为 `false`。
