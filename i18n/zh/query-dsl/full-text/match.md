---
title: Match
---

# Match 查询

使用 `match` 查询（Query）可以对特定的文档（Document）字段执行全文搜索。如果对 [`text`](/field-types/supported-field-types/text) 字段运行 `match` 查询，`match` 查询会[分析](/analyzers/)提供的搜索字符串，并返回与该字符串中任一词项（Term）匹配的文档。如果对精确值字段运行 `match` 查询，则返回与该精确值匹配的文档。搜索精确值字段的首选方式是使用过滤器（Filter），因为与查询不同，过滤器会被缓存。

以下示例展示了一个在 `title` 中搜索单词 `wind` 的基本 `match` 查询：

```json
GET _search
{
  "query": {
    "match": {
      "title": "wind"
    }
  }
}
```

如需传递其他参数，可以使用展开语法：

```json
GET _search
{
  "query": {
    "match": {
      "title": {
        "query": "wind",
        "analyzer": "stop"
      }
    }
  }
}
```

## 示例

在以下示例中，你将使用包含以下文档的索引（Index）：

```json
PUT testindex/_doc/1
{
  "title": "Let the wind rise"
}
```

```json
PUT testindex/_doc/2
{
  "title": "Gone with the wind"
  
}
```

```json
PUT testindex/_doc/3
{
  "title": "Rise is gone"
}
```

## 运算符

如果对 `text` 字段运行 `match` 查询，文本会使用 `analyzer` 参数中指定的分析器（Analyzer）进行分析，然后使用 `operator` 参数中指定的运算符将生成的词元（Token）组合成一个布尔查询。默认运算符为 `OR`，因此查询 `wind rise` 会变为 `wind OR rise`。在本示例中，该查询返回文档 1--3，因为每个文档都包含与查询匹配的词项。要指定 `and` 运算符，请使用以下查询：

```json
GET testindex/_search
{
  "query": {
    "match": {
      "title": {
        "query": "wind rise",
        "operator": "and"
      }
    }
  }
}
```

该查询被构造为 `wind AND rise`，并返回文档 1 作为匹配文档：

<details markdown="block">
  <summary>
    响应
  </summary>

```json
{
  "took": 17,
  "timed_out": false,
  "_shards": {
    "total": 1,
    "successful": 1,
    "skipped": 0,
    "failed": 0
  },
  "hits": {
    "total": {
      "value": 1,
      "relation": "eq"
    },
    "max_score": 1.2667098,
    "hits": [
      {
        "_index": "testindex",
        "_id": "1",
        "_score": 1.2667098,
        "_source": {
          "title": "Let the wind rise"
        }
      }
    ]
  }
}
```

</details>

### 最少应匹配数

通过指定 [`minimum_should_match`](/query-dsl/minimum-should-match) 参数，可以控制文档在结果中返回所必须匹配的最少词项数：

```json
GET testindex/_search
{
  "query": {
    "match": {
      "title": {
        "query": "wind rise",
        "operator": "or",
        "minimum_should_match": 2
      }
    }
  }
}
```

现在文档必须同时匹配两个词项，因此只返回文档 1（这等价于 `and` 运算符）：

<details markdown="block">
  <summary>
    响应
  </summary>

```json
{
  "took": 23,
  "timed_out": false,
  "_shards": {
    "total": 1,
    "successful": 1,
    "skipped": 0,
    "failed": 0
  },
  "hits": {
    "total": {
      "value": 1,
      "relation": "eq"
    },
    "max_score": 1.2667098,
    "hits": [
      {
        "_index": "testindex",
        "_id": "1",
        "_score": 1.2667098,
        "_source": {
          "title": "Let the wind rise"
        }
      }
    ]
  }
}
```
</details>

## 分析器

由于本示例中没有显式指定分析器，因此使用默认的 `standard` 分析器。默认分析器不执行词干提取，因此如果运行查询 `the wind rises`，将不会得到任何结果，因为词元 `rises` 与词元 `rise` 不匹配。要更改搜索分析器，请在 `analyzer` 字段中指定。例如，以下查询使用 `english` 分析器：

```json
GET testindex/_search
{
  "query": {
    "match": {
      "title": {
        "query": "the wind rises",
        "operator": "and",
        "analyzer": "english"
      }
    }
  }
}
```

`english` 分析器会移除停用词 `the` 并执行词干提取，生成词元 `wind` 和 `rise`。后一个词元与文档 1 匹配，因此文档 1 会在结果中返回：

<details markdown="block">
  <summary>
    响应
  </summary>

```json
{
  "took": 19,
  "timed_out": false,
  "_shards": {
    "total": 1,
    "successful": 1,
    "skipped": 0,
    "failed": 0
  },
  "hits": {
    "total": {
      "value": 1,
      "relation": "eq"
    },
    "max_score": 1.2667098,
    "hits": [
      {
        "_index": "testindex",
        "_id": "1",
        "_score": 1.2667098,
        "_source": {
          "title": "Let the wind rise"
        }
      }
    ]
  }
}
```
</details>

## 空查询

在某些情况下，分析器可能会移除查询中的所有词元。例如，`english` 分析器会移除停用词，因此在查询 `and OR or` 中，所有词元都会被移除。要检查分析器的行为，可以使用 [Analyze API](/api-reference/analyze-apis#apply-a-built-in-analyzer)：

```json
GET testindex/_analyze
{
  "analyzer" : "english",
  "text" : "and OR or"
}
```

正如预期，该查询不会生成任何词元：

```json
{
  "tokens": []
}
```

你可以在 `zero_terms_query` 参数中指定空查询的行为。将 `zero_terms_query` 设置为 `all` 会返回索引中的所有文档，设置为 `none` 则不返回任何文档：

```json
GET testindex/_search
{
  "query": {
    "match": {
      "title": {
        "query": "and OR or",
        "analyzer" : "english",
        "zero_terms_query": "all"
      }
    }
  }
}
```

## 模糊匹配

为了应对拼写错误，可以为查询指定 `fuzziness`，取值为以下任意一种：

- 一个整数，指定此编辑所允许的最大 [Levenshtein 距离](https://en.wikipedia.org/wiki/Levenshtein_distance)。 
- `AUTO`： 
  - 0–2 个字符的字符串必须精确匹配。
  - 3–5 个字符的字符串允许 1 次编辑。
  - 超过 5 个字符的字符串允许 2 次编辑。

在大多数情况下，将 `fuzziness` 设置为默认值 `AUTO` 效果最好：

```json
GET testindex/_search
{
  "query": {
    "match": {
      "title": {
        "query": "wnid",
        "fuzziness": "AUTO"
      }
    }
  }
}
```

词元 `wnid` 与 `wind` 匹配，查询返回文档 1 和 2：

<details markdown="block">
  <summary>
    响应
  </summary>

```json
{
  "took": 31,
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
    "max_score": 0.47501624,
    "hits": [
      {
        "_index": "testindex",
        "_id": "1",
        "_score": 0.47501624,
        "_source": {
          "title": "Let the wind rise"
        }
      },
      {
        "_index": "testindex",
        "_id": "2",
        "_score": 0.47501624,
        "_source": {
          "title": "Gone with the wind"
        }
      }
    ]
  }
}
```
</details>

### 前缀长度

拼写错误很少出现在单词开头。因此，你可以指定匹配前缀的最小长度，满足该长度的文档才会在结果中返回。例如，可以修改上述查询，加入 `prefix_length`：

```json
GET testindex/_search
{
  "query": {
    "match": {
      "title": {
        "query": "wnid",
        "fuzziness": "AUTO",
        "prefix_length": 2
      }
    }
  }
}
```

上述查询不返回任何结果。如果将 `prefix_length` 改为 1，则会返回文档 1 和 2，因为词元 `wnid` 的第一个字母没有拼错。

### 换位

在上一个示例中，单词 `wnid` 包含一处换位（`in` 被改成了 `ni`）。默认情况下，模糊匹配允许换位，但你可以将 `fuzzy_transpositions` 设置为 `false` 来禁止换位：

```json
GET testindex/_search
{
  "query": {
    "match": {
      "title": {
        "query": "wnid",
        "fuzziness": "AUTO",
        "fuzzy_transpositions": false
      }
    }
  }
}
```

现在查询不返回任何结果。

## 同义词

如果使用 `synonym_graph` 过滤器，并且 `auto_generate_synonyms_phrase_query` 设置为 `true`（默认值），OpenSearch 会将查询解析为词项，然后组合这些词项，为多词项同义词生成[短语查询](https://lucene.apache.org/core/8_9_0/core/org/apache/lucene/search/PhraseQuery.html)。例如，如果将 `ba,batting average` 指定为同义词并搜索 `ba`，OpenSearch 会搜索 `ba OR "batting average"`。

要使用合取（AND）方式匹配多词项同义词，请将 `auto_generate_synonyms_phrase_query` 设置为 `false`：

```json
GET /testindex/_search
{
  "query": {
    "match": {
      "text": {
        "query": "good ba",
        "auto_generate_synonyms_phrase_query": false
      }
    }
  }
}
```

生成的查询为 `ba OR (batting AND average)`。

## 参数

该查询接受字段名称（`<field>`）作为顶级参数：

```json
GET _search
{
  "query": {
    "match": {
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
`query` | String | 用于搜索的查询字符串。必需。
`auto_generate_synonyms_phrase_query` | Boolean | 指定是否为多词项同义词自动创建 [match phrase 查询](/query-dsl/full-text/match-phrase)。例如，如果将 `ba,batting average` 指定为同义词并搜索 `ba`，OpenSearch 会搜索 `ba OR "batting average"`（如果此选项为 `true`）或 `ba OR (batting AND average)`（如果此选项为 `false`）。默认值为 `true`。
`analyzer` | String | 用于对查询字符串文本进行分词的[分析器](/analyzers/)。默认值为 `default_field` 指定的索引时分析器。如果没有为 `default_field` 指定分析器，则 `analyzer` 为该索引的默认分析器。
`boost` | Floating-point | 按给定的倍数提升该子句的权重。适用于在复合查询中为各子句设置权重。[0, 1) 范围内的值会降低相关性，大于 1 的值会提高相关性。默认值为 `1`。
`enable_position_increments` | Boolean | 为 `true` 时，生成的查询会感知位置增量。当移除停用词在词项之间留下不需要的“间隙”时，此设置很有用。默认值为 `true`。
`fuzziness` | String | 在判断某个词项是否与某个值匹配时，将一个单词变为另一个单词所需的字符编辑（插入、删除、替换）次数。例如，`wined` 与 `wind` 之间的距离为 1。有效值为非负整数或 `AUTO`。默认值 `AUTO` 会根据每个词项的长度选择一个值，适用于大多数场景。
`fuzzy_rewrite` | String | 决定 OpenSearch 如何重写查询。有效值为 `constant_score`、`scoring_boolean`、`constant_score_boolean`、`top_terms_N`、`top_terms_boost_N` 和 `top_terms_blended_freqs_N`。如果 `fuzziness` 参数不为 `0`，查询默认使用 `top_terms_blended_freqs_${max_expansions}` 作为 `fuzzy_rewrite` 方法。默认值为 `constant_score`。 
`fuzzy_transpositions` | Boolean | 将 `fuzzy_transpositions` 设置为 `true`（默认值）时，会在 `fuzziness` 选项的插入、删除和替换操作之外，增加相邻字符的交换操作。例如，如果 `fuzzy_transpositions` 为 true（交换“n”和“i”），`wind` 与 `wnid` 之间的距离为 1；如果为 false（删除“n”，再插入“n”），距离为 2。如果 `fuzzy_transpositions` 为 false，`rewind` 和 `wnid` 与 `wind` 的距离相同（均为 2），尽管从人的角度来看，`wnid` 显然只是一个拼写错误。默认值适用于大多数场景。
`lenient` | Boolean | 将 `lenient` 设置为 `true` 会忽略查询与文档字段之间的数据类型不匹配。例如，查询字符串 `"8.2"` 可以匹配 `float` 类型的字段。默认值为 `false`。
`max_expansions` | Positive integer |  查询最多可以扩展到的词项数。模糊查询会“扩展到”在 `fuzziness` 指定距离内的若干个匹配词项，然后 OpenSearch 尝试匹配这些词项。默认值为 `50`。
`minimum_should_match` | Positive or negative integer, positive or negative percentage, combination | 如果查询字符串包含多个搜索词项并且使用 `or` 运算符，该参数指定文档被视为匹配时需要匹配的词项数。例如，如果 `minimum_should_match` 为 2，则 `wind often rising` 与 `The Wind Rises.` 不匹配；如果 `minimum_should_match` 为 `1`，则二者匹配。有关详细信息，请参阅 [Minimum should match](/query-dsl/minimum-should-match)。
`operator` | String | 如果查询字符串包含多个搜索词项，该参数指定文档被视为匹配时是需要所有词项都匹配（`AND`），还是只需一个词项匹配（`OR`）。有效值为：<br>- `OR`：字符串 `to be` 被解释为 `to OR be`<br>- `AND`：字符串 `to be` 被解释为 `to AND be`<br> 默认值为 `OR`。
`prefix_length` | Non-negative integer | 不参与模糊匹配的前导字符数。默认值为 `0`。
`zero_terms_query` | String | 在某些情况下，分析器会移除查询字符串中的所有词项。例如，`stop` 分析器会移除字符串 `an but this` 中的所有词项。在这种情况下，`zero_terms_query` 指定是不匹配任何文档（`none`）还是匹配所有文档（`all`）。有效值为 `none` 和 `all`。默认值为 `none`。
