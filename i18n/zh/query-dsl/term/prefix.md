---
title: Prefix
---

# Prefix 查询

使用 `prefix` 查询搜索以特定前缀开头的词项。例如，以下查询搜索 `speaker` 字段中包含以 `KING H` 开头的词项的文档（Document）：

```json
GET shakespeare/_search
{
  "query": {
    "prefix": {
      "speaker": "KING H"
    }
  }
}
```

要提供参数，可以使用以下扩展语法编写与上述查询等效的查询：

```json
GET shakespeare/_search
{
  "query": {
    "prefix": {
      "speaker": {
        "value": "KING H"
      }
    }
  }
}
```

## 参数

该查询接受字段名称（`<field>`）作为顶层参数：

```json
GET _search
{
  "query": {
    "prefix": {
      "<field>": {
        "value": "sample",
        ... 
      }
    }
  }
}
```

`<field>` 接受以下参数。除 `value` 外，所有参数均为可选。

参数 | 数据类型 | 描述
:--- | :--- | :---
`value` | String | 要在 `<field>` 指定的字段中搜索的词项。
`case_insensitive` | Boolean | 如果为 `true`，则允许值与已索引的字段值进行不区分大小写的匹配。默认值为 `false`（是否区分大小写由字段的映射决定）。
`rewrite` | String | 决定 OpenSearch 如何重写多词项查询并为其评分。有效值为 `constant_score`、`scoring_boolean`、`constant_score_boolean`、`top_terms_N`、`top_terms_boost_N` 和 `top_terms_blended_freqs_N`。默认值为 `constant_score`。

::: warning 重要
如果 [`search.allow_expensive_queries`](/query-dsl/#expensive-queries) 设置为 `false`，则不会运行前缀查询。如果启用了 `index_prefixes`，则会忽略 `search.allow_expensive_queries` 设置，并构建和运行经过优化的查询。
:::
