---
title: Regexp
---

# Regexp 查询

使用 `regexp` 查询搜索与正则表达式匹配的词项。

以下查询搜索以任意大写或小写字母开头、后跟 `amlet` 的词项：

```json
GET shakespeare/_search
{
  "query": {
    "regexp": {
      "play_name": "[a-zA-Z]amlet"
    }
  }
}
```

请注意以下重要事项：

- 正则表达式作用于字段中的词项（即词元（Token）），而不是整个字段。
- 默认情况下，正则表达式的最大长度为 1,000 个字符。要更改最大长度，请更新 `index.max_regex_length` 设置。
- 正则表达式使用 Lucene 语法，该语法与更标准化的实现有所不同。请充分测试，以确保得到预期的结果。更多信息，请参阅 [Lucene 文档](https://lucene.apache.org/core/8_9_0/core/index.html)。
- 为了提高 regexp 查询的性能，请避免使用没有前缀或后缀的通配符模式，例如 `.*` 或 `.*?+`。
- `regexp` 查询可能是开销较大的操作，需要将 [`search.allow_expensive_queries`](/query-dsl/#expensive-queries) 设置为 `true`。在频繁执行 `regexp` 查询之前，请测试其对集群性能的影响，并考虑能够获得类似结果的替代查询。

## 参数

该查询接受字段名称（`<field>`）作为顶层参数：

```json
GET _search
{
  "query": {
    "regexp": {
      "<field>": {
        "value": "[Ss]ample",
        ... 
      }
    }
  }
}
```

`<field>` 接受以下参数。除 `value` 外，所有参数均为可选。

参数 | 数据类型 | 描述
:--- | :--- | :---
`value` | String | 用于匹配 `<field>` 指定字段中词项的正则表达式。
`case_insensitive` | Boolean | 如果为 `true`，则允许正则表达式值与已索引的字段值进行不区分大小写的匹配。默认值为 `false`（是否区分大小写由字段的映射决定）。
`flags` | String | 为 Lucene 正则表达式引擎启用可选运算符。
`max_determinized_states` | Integer | Lucene 会将正则表达式转换为具有若干确定化状态的自动机。该参数指定查询所需的最大自动机状态数，用于防止资源消耗过高。要运行复杂的正则表达式，可能需要增大该参数的值。默认值为 10,000。
`rewrite` | String | 决定 OpenSearch 如何重写多词项查询并为其评分。有效值为 `constant_score`、`scoring_boolean`、`constant_score_boolean`、`top_terms_N`、`top_terms_boost_N` 和 `top_terms_blended_freqs_N`。默认值为 `constant_score`。

::: warning 重要
如果 [`search.allow_expensive_queries`](/query-dsl/#expensive-queries) 设置为 `false`，则不会运行 `regexp` 查询。
:::
