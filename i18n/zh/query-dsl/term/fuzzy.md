---
title: Fuzzy
---

# Fuzzy 查询

模糊查询（Fuzzy Query）搜索包含与搜索词项相似（在允许的最大 [Levenshtein 距离](https://en.wikipedia.org/wiki/Levenshtein_distance)内）的词项的文档（Document）。Levenshtein 距离衡量将一个词项变为另一个词项所需的单字符修改次数。这些修改包括：

- 替换：**c**at 变为 **b**at
- 插入：cat 变为 cat**s**
- 删除：**c**at 变为 at
- 换位：**ca**t 变为 **ac**t

模糊查询会创建一个列表，其中包含搜索词项在 Levenshtein 距离范围内所有可能的扩展。你可以在 `max_expansions` 字段中指定此类扩展的最大数量。然后，它会搜索与任一扩展匹配的文档。

以下示例查询搜索说话人 `HALET`（`HAMLET` 的拼写错误）。由于未指定最大编辑距离，因此使用默认的 `AUTO` 编辑距离：

```json
GET shakespeare/_search
{
  "query": {
    "fuzzy": {
      "speaker": {
        "value": "HALET"
      }
    }
  }
}
```

响应中包含说话人为 `HAMLET` 的所有文档。

以下示例查询使用高级参数搜索单词 `HALET`：

```json
GET shakespeare/_search
{
  "query": {
    "fuzzy": {
      "speaker": {
        "value": "HALET",
        "fuzziness": "2",
        "max_expansions": 40,
        "prefix_length": 0,
        "transpositions": true,
        "rewrite": "constant_score"
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
    "fuzzy": {
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
`fuzziness` | `AUTO`, `0`, or a positive integer | 在判断词项是否与值匹配时，将一个单词变为另一个单词所需的字符编辑（插入、删除、替换）次数。例如，`wined` 与 `wind` 之间的距离为 1。默认值 `AUTO` 会根据每个词项的长度选择一个值，适用于大多数使用场景。
`max_expansions` | Positive integer |  查询可以扩展到的最大词项数量。模糊查询会「扩展到」若干个在 `fuzziness` 指定距离内的匹配词项，然后 OpenSearch 尝试匹配这些词项。默认值为 `50`。
`prefix_length` | Non-negative integer | 不参与模糊匹配的前导字符数量。默认值为 `0`。
`rewrite` | String | 决定 OpenSearch 如何重写多词项查询并为其评分。有效值为 `constant_score`、`scoring_boolean`、`constant_score_boolean`、`top_terms_N`、`top_terms_boost_N` 和 `top_terms_blended_freqs_N`。默认值为 `constant_score`。
`transpositions` | Boolean | 指定是否允许将两个相邻字符的换位（`ab` 变为 `ba`）视为一次编辑。默认值为 `true`。 

::: danger 警告
如果在 `max_expansions` 中指定较大的值，可能会导致性能下降，尤其是当 `prefix_length` 设置为 `0` 时，因为 OpenSearch 需要尝试匹配该单词的大量变体。
:::

::: warning 重要
如果 [`search.allow_expensive_queries`](/query-dsl/#expensive-queries) 设置为 `false`，则不会运行模糊查询。
:::
