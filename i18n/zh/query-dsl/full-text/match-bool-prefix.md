---
title: Match 布尔前缀
---

# Match 布尔前缀查询

`match_bool_prefix` 查询（Query）会分析提供的搜索字符串，并根据字符串中的词项（Term）构建一个[布尔查询](/query-dsl/compound/bool)。除最后一个词项外，其余每个词项都作为完整单词进行匹配，最后一个词项则作为前缀使用。`match_bool_prefix` 查询返回包含这些完整词项或以前缀词项开头的词项的文档（Document），词项顺序不限。

以下示例展示了一个基本的 `match_bool_prefix` 查询：

```json
GET _search
{
  "query": {
    "match_bool_prefix": {
      "title": "the wind"
    }
  }
}
```

如需传递其他参数，可以使用展开语法：

```json
GET _search
{
  "query": {
    "match_bool_prefix": {
      "title": {
        "query": "the wind",
        "analyzer": "stop"
      }
    }
  }
}
```

## 示例

例如，假设某个索引（Index）包含以下文档：

```json
PUT testindex/_doc/1
{
  "title": "The wind rises"
}
```

```json
PUT testindex/_doc/2
{
  "title": "Gone with the wind"
  
}
```

以下 `match_bool_prefix` 查询搜索完整单词 `rises` 以及以 `wi` 开头的单词，顺序不限：

```json
GET testindex/_search
{
  "query": {
    "match_bool_prefix": {
      "title": "rises wi"
    }
  }
}
```

上述查询等价于以下布尔查询：

```json
GET testindex/_search
{
  "query": {
    "bool" : {
      "should": [
        { "term": { "title": "rises" }},
        { "prefix": { "title": "wi"}}
      ]
    }
  }
}
```

响应中包含这两个文档：

<details markdown="block">
  <summary>
    响应
  </summary>

```json
{
  "took": 15,
  "timed_out": false,
  "_shards": {
    "total": 1,
    "successful": 1,
    "skipped": 0,
    "failed": 0
  },
  "hits": {
    "total": {
      "value": 2,
      "relation": "eq"
    },
    "max_score": 1.73617,
    "hits": [
      {
        "_index": "testindex",
        "_id": "1",
        "_score": 1.73617,
        "_source": {
          "title": "The wind rises"
        }
      },
      {
        "_index": "testindex",
        "_id": "2",
        "_score": 1,
        "_source": {
          "title": "Gone with the wind"
        }
      }
    ]
  }
}
```

</details>

## `match_bool_prefix` 查询与 `match_phrase_prefix` 查询

`match_bool_prefix` 查询匹配任意位置的词项，而 `match_phrase_prefix` 查询将词项作为一个完整短语进行匹配。为了说明二者的区别，再来看上一节中的 `match_bool_prefix` 查询：

```json
GET testindex/_search
{
  "query": {
    "match_bool_prefix": {
      "title": "rises wi"
    }
  }
}
```

`The wind rises` 和 `Gone with the wind` 都与搜索词项匹配，因此查询返回这两个文档。

现在对同一个索引运行 `match_phrase_prefix` 查询：

```json
GET testindex/_search
{
  "query": {
    "match_phrase_prefix": {
      "title": "rises wi"
    }
  }
}
```

响应中不返回任何文档，因为没有文档按指定顺序包含短语 `rises wi`。

## 分析器

默认情况下，对 `text` 字段运行查询时，搜索文本会使用与该字段关联的索引分析器（Analyzer）进行分析。你可以在 `analyzer` 参数中指定其他搜索分析器：

```json
GET testindex/_search
{
  "query": {
    "match_bool_prefix": {
      "title": {
        "query": "rise the wi",
        "analyzer": "stop"
      }
    }
  }
}
```
 
## 参数

该查询接受字段名称（`<field>`）作为顶级参数：

```json
GET _search
{
  "query": {
    "match_bool_prefix": {
      "<field>": {
        "query": "text to search for",
        ... 
      }
    }
  }
}
```

`<field>` 接受以下参数。除 `query` 外，所有参数均为可选。

参数 | 数据类型 | 描述
:--- | :--- | :---
`query` | String | 用于搜索的文本、数字、布尔值或日期。必需。
`analyzer` | String | 用于对查询字符串文本进行分词的[分析器](/analyzers/)。默认值为 `default_field` 指定的索引时分析器。如果没有为 `default_field` 指定分析器，则 `analyzer` 为该索引的默认分析器。
`fuzziness` | `AUTO`, `0`, or a positive integer | 在判断某个词项是否与某个值匹配时，将一个单词变为另一个单词所需的字符编辑（插入、删除、替换）次数。例如，`wined` 与 `wind` 之间的距离为 1。默认值 `AUTO` 会根据每个词项的长度选择一个值，适用于大多数场景。
`fuzzy_rewrite` | String | 决定 OpenSearch 如何重写查询。有效值为 `constant_score`、`scoring_boolean`、`constant_score_boolean`、`top_terms_N`、`top_terms_boost_N` 和 `top_terms_blended_freqs_N`。如果 `fuzziness` 参数不为 `0`，查询默认使用 `top_terms_blended_freqs_${max_expansions}` 作为 `fuzzy_rewrite` 方法。默认值为 `constant_score`。 
`fuzzy_transpositions` | Boolean | 将 `fuzzy_transpositions` 设置为 `true`（默认值）时，会在 `fuzziness` 选项的插入、删除和替换操作之外，增加相邻字符的交换操作。例如，如果 `fuzzy_transpositions` 为 true（交换“n”和“i”），`wind` 与 `wnid` 之间的距离为 1；如果为 false（删除“n”，再插入“n”），距离为 2。如果 `fuzzy_transpositions` 为 false，`rewind` 和 `wnid` 与 `wind` 的距离相同（均为 2），尽管从人的角度来看，`wnid` 显然只是一个拼写错误。默认值适用于大多数场景。
`max_expansions` | Positive integer |  查询最多可以扩展到的词项数。模糊查询会“扩展到”在 `fuzziness` 指定距离内的若干个匹配词项，然后 OpenSearch 尝试匹配这些词项。默认值为 `50`。
`minimum_should_match` | Positive or negative integer, positive or negative percentage, combination | 如果查询字符串包含多个搜索词项并且使用 `or` 运算符，该参数指定文档被视为匹配时需要匹配的词项数。例如，如果 `minimum_should_match` 为 2，则 `wind often rising` 与 `The Wind Rises.` 不匹配；如果 `minimum_should_match` 为 `1`，则二者匹配。有关详细信息，请参阅 [Minimum should match](/query-dsl/minimum-should-match)。
`operator` | String | 如果查询字符串包含多个搜索词项，该参数指定文档被视为匹配时是需要所有词项都匹配（`and`），还是只需一个词项匹配（`or`）。有效值为 `or` 和 `and`。默认值为 `or`。
`prefix_length` | Non-negative integer | 不参与模糊匹配的前导字符数。默认值为 `0`。

::: info 注意
`fuzziness`、`fuzzy_transpositions`、`fuzzy_rewrite`、`max_expansions` 和 `prefix_length` 参数可以应用于除最后一个词项以外的所有词项所构建的词项子查询，对为最后一个词项构建的前缀查询不起作用。
:::
