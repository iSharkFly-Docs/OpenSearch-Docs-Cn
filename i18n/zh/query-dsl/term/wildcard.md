---
title: Wildcard
---

# Wildcard 查询

使用通配符查询（Wildcard Query）搜索与通配符模式匹配的词项。通配符查询支持以下运算符。

运算符 | 描述
:--- | :---
`*` | 匹配零个或多个字符。
`?` | 匹配任意单个字符。
`case_insensitive` | 如果为 `true`，则通配符查询不区分大小写。如果为 `false`，则通配符查询区分大小写。默认值为 `false`（区分大小写）。

要以区分大小写的方式搜索以 `H` 开头、以 `Y` 结尾的词项，请使用以下请求：

```json
GET shakespeare/_search
{
  "query": {
    "wildcard": {
      "speaker": {
        "value": "H*Y",
        "case_insensitive": false
      }
    }
  }
}
```

如果将 `*` 改为 `?`，则不会得到任何匹配结果，因为 `?` 只代表单个字符。

通配符查询往往较慢，因为它们需要遍历大量词项。请避免将通配符放在查询的开头，因为这在资源和时间上都可能是开销非常大的操作。

## 参数

该查询接受字段名称（`<field>`）作为顶层参数：

```json
GET _search
{
  "query": {
    "wildcard": {
      "<field>": {
        "value": "patt*rn",
        ...
      }
    }
  }
}
```

`<field>` 接受以下参数。除 `value` 外，所有参数均为可选。

参数 | 数据类型 | 描述
:--- | :--- | :---
`value` | String | 用于匹配 `<field>` 指定字段中词项的通配符模式。
`boost` | Floating-point | 按给定的倍数提升查询权重。适用于包含多个查询的搜索。[0, 1) 范围内的值会降低相关性，大于 1 的值会提高相关性。默认值为 `1`。
`case_insensitive` | Boolean | 如果为 `true`，则允许值与已索引的字段值进行不区分大小写的匹配。默认值为 `false`（是否区分大小写由字段的映射决定）。
`rewrite` | String | 决定 OpenSearch 如何重写多词项查询并为其评分。有效值为 `constant_score`、`scoring_boolean`、`constant_score_boolean`、`top_terms_N`、`top_terms_boost_N` 和 `top_terms_blended_freqs_N`。默认值为 `constant_score`。

::: warning 重要
如果 [`search.allow_expensive_queries`](/query-dsl/#expensive-queries) 设置为 `false`，则不会运行通配符查询。
:::
