---
title: Multi-match
---

# Multi-match 查询

multi-match 操作的功能与 [match](/query-dsl/full-text/match) 操作类似。你可以使用 `multi_match` 查询（Query）搜索多个字段。 

`^` 用于对某些字段进行“权重提升”。权重提升（boost）是一种乘数，使某个字段中的匹配比其他字段中的匹配具有更高的权重。在以下示例中，title 字段中对“wind”的匹配对 `_score` 的影响是 plot 字段中匹配的四倍：

```json
GET _search
{
  "query": {
    "multi_match": {
      "query": "wind",
      "fields": ["title^4", "plot"]
    }
  }
}
```

结果是，*The Wind Rises* 和 *Gone with the Wind* 等电影排在搜索结果的前面，而像 *Twister* 这样大概在剧情简介中包含“wind”的电影则排在后面。

字段名称中可以使用通配符。例如，以下查询会搜索 `speaker` 字段以及所有以 `play_` 开头的字段，例如 `play_name` 或 `play_title`：

```json
GET _search
{
  "query": {
    "multi_match": {
      "query": "hamlet",
      "fields": ["speaker", "play_*"]
    }
  }
}
```

如果未提供 `fields` 参数，`multi_match` 查询会搜索 `index.query. Default_field` 设置中指定的字段，该设置的默认值为 `*`。默认行为是提取映射（Mapping）中所有适用于[词项级查询](/query-dsl/term/)（Term-level Query）的字段，过滤掉元数据字段，然后组合所有提取出的字段来构建查询。

::: info 注意
查询中子句的最大数量由 `indices.query.bool.max_clause_count` 设置定义，默认值为 1,024。 
:::

## Multi-match 查询类型

OpenSearch 支持以下 multi-match 查询类型，它们的区别在于查询在内部的执行方式：

- [`best_fields`](#best-fields)（默认）：返回与任一字段匹配的文档（Document）。使用最佳匹配字段的 `_score`。 
- [`most_fields`](#most-fields)：返回与任一字段匹配的文档。使用各匹配字段的组合评分。
- [`cross_fields`](#cross-fields)：将所有字段视为一个字段。以相同的 `analyzer` 处理各字段，并在任意字段中匹配单词。 
- [`phrase`](#phrase)：对每个字段运行 `match_phrase` 查询。使用最佳匹配字段的 `_score`。
- [`phrase_prefix`](#phrase-prefix)：对每个字段运行 `match_phrase_prefix` 查询。使用最佳匹配字段的 `_score`。
- [`bool_prefix`](#boolean-prefix)：对每个字段运行 `match_bool_prefix` 查询。使用各匹配字段的组合评分。

## Best fields 

如果你搜索的两个单词共同表示一个概念，那么你会希望这两个单词相邻出现的结果评分更高。 

例如，假设某个索引（Index）包含以下科学文章：

```json
PUT /articles/_doc/1
{
  "title": "Aurora borealis",
  "description": "Northern lights, or aurora borealis, explained"
}
```

```json
PUT /articles/_doc/2
{
  "title": "Sun deprivation in the Northern countries",
  "description": "Using fluorescent lights for therapy"
}
```

你可以搜索标题或描述中包含 `northern lights` 的文章：

```json
GET articles/_search
{
  "query": {
    "multi_match" : {
      "query": "northern lights",
      "type": "best_fields",
      "fields": [ "title", "description" ],
      "tie_breaker": 0.3
    }
  }
}
```

上述查询会作为以下 [`dis_max`](/query-dsl/compound/disjunction-max) 查询执行，其中每个字段对应一个 `match` 查询：

```json
GET /articles/_search
{
  "query": {
    "dis_max": {
      "queries": [
        { "match": { "title": "northern lights" }},
        { "match": { "description": "northern lights" }}
      ],
      "tie_breaker": 0.3
    }
  }
}
```

结果中包含两个文档，但文档 1 的评分更高，因为两个单词都出现在其 `description` 字段中：

```json
{
  "took": 30,
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
    "max_score": 0.84407747,
    "hits": [
      {
        "_index": "articles",
        "_id": "1",
        "_score": 0.84407747,
        "_source": {
          "title": "Aurora borealis",
          "description": "Northern lights, or aurora borealis, explained"
        }
      },
      {
        "_index": "articles",
        "_id": "2",
        "_score": 0.6322521,
        "_source": {
          "title": "Sun deprivation in the Northern countries",
          "description": "Using fluorescent lights for therapy"
        }
      }
    ]
  }
}
```

`best_fields` 查询使用最佳匹配字段的评分。如果指定了 `tie_breaker`，则使用以下算法计算评分：

取最佳匹配字段的评分，再为所有其他匹配字段加上（`tie_breaker` * `_score`）。

## Most fields 

如果多个字段包含相同的文本，但这些文本以不同方式进行分析，请使用 `most_fields` 查询。例如，原始字段可能包含使用 `standard` 分析器（Analyzer）分析的文本，而另一个字段可能包含使用 `english` 分析器分析的相同文本，后者会执行词干提取：

```json
PUT /articles
{
  "mappings": {
    "properties": {
      "title": { 
        "type": "text",
        "fields": {
          "english": { 
            "type": "text",
            "analyzer": "english"
          }
        }
      }
    }
  }
}
```

假设 `articles` 索引中索引了以下两个文档：

```json
PUT /articles/_doc/1
{
  "title": "Buttered toasts"
}
```

```json
PUT /articles/_doc/2
{
  "title": "Buttering a toast"
}
```

`standard` 分析器将标题 `Buttered toast` 分析为 [`buttered`, `toasts`]，将标题 `Buttering a toast` 分析为 [`buttering`, `a`, `toast`]。而由于词干提取，`english` 分析器会为这两个标题生成相同的词元（Token）列表 [`butter`, `toast`]。

你可以使用 `most_fields` 查询来返回尽可能多的文档：

```json
GET /articles/_search
{
  "query": {
    "multi_match": {
      "query": "buttered toast",
      "fields": [ 
        "title",
        "title.english"
      ],
      "type": "most_fields" 
    }
  }
}
```

上述查询会作为以下布尔查询执行：

```json
GET articles/_search
{
  "query": {
    "bool": {
      "should": [
        { "match": { "title": "buttered toasts" }},
        { "match": { "title.english": "buttered toasts" }}
      ]
    }
  }
}
```

计算相关性评分（Relevance Score）时，会将文档在所有 `match` 子句中的评分相加，然后将结果除以 `match` 子句的数量。

加入 `title.english` 字段后，可以检索到与词干化后的词元相匹配的第二个文档：

```json
{
  "took": 9,
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
    "max_score": 1.4418206,
    "hits": [
      {
        "_index": "articles",
        "_id": "1",
        "_score": 1.4418206,
        "_source": {
          "title": "Buttered toasts"
        }
      },
      {
        "_index": "articles",
        "_id": "2",
        "_score": 0.09304003,
        "_source": {
          "title": "Buttering a toast"
        }
      }
    ]
  }
}
```

由于第一个文档的 `title` 和 `title.english` 字段都匹配，因此它的相关性评分更高。

## 运算符与最少应匹配数

`best_fields` 和 `most_fields` 查询以字段为单位生成 match 查询（每个字段一个）。因此，`minimum_should_match` 和 `operator` 参数会应用于每个字段，而这通常并不是期望的行为。 

例如，假设 `customers` 索引包含以下文档： 

```json
PUT customers/_doc/1 
{
  "first_name": "John",
  "last_name": "Doe"
}
```

```json
PUT customers/_doc/2 
{
  "first_name": "Jane",
  "last_name": "Doe"
}
```

如果要在 `customers` 索引中搜索 `John Doe`，你可能会构造如下查询：

```json
GET customers/_validate/query?explain
{
  "query": {
    "multi_match" : {
      "query": "John Doe",
      "type": "best_fields",
      "fields": [ "first_name", "last_name" ],
      "operator": "and" 
    }
  }
}
```

该查询中 `and` 运算符的意图是查找同时匹配 `John` 和 `Doe` 的文档。然而，该查询不返回任何结果。你可以运行 Validate API 来了解查询的执行方式：

```json
GET customers/_validate/query?explain
{
  "query": {
    "multi_match" : {
      "query":      "John Doe",
      "type":       "best_fields",
      "fields":     [ "first_name", "last_name" ],
      "operator":   "and" 
    }
  }
}
```

从响应中可以看到，该查询试图让 `John` 和 `Doe` 同时与 `first_name` 字段或 `last_name` 字段匹配：

```json
{
  "_shards": {
    "total": 1,
    "successful": 1,
    "failed": 0
  },
  "valid": true,
  "explanations": [
    {
      "index": "customers",
      "valid": true,
      "explanation": "((+first_name:john +first_name:doe) | (+last_name:john +last_name:doe))"
    }
  ]
}
```

由于两个字段都不同时包含这两个单词，因此不返回任何结果。 

跨字段搜索的更好方案是使用 [`cross_fields`](#cross-fields) 查询。与以字段为中心的 `best_fields` 和 `most_fields` 查询不同，`cross_fields` 查询以词项（Term）为中心。

## Cross fields 

使用 `cross_fields` 查询可以跨多个字段搜索数据。例如，如果索引包含客户数据，客户的名字和姓氏位于不同的字段中。然而，在搜索 `John Doe` 时，你希望得到 `first_name` 字段中包含 `John` 且 `last_name` 字段中包含 `Doe` 的文档。

在这种情况下，`most_fields` 查询无法正常工作，原因如下：

- [`operator` 和 `minimum_should_match`](#operator-and-minimum-should-match) 参数以字段为单位而不是以词项为单位应用。
- `first_name` 和 `last_name` 字段中的词频可能导致意外的结果。例如，如果某人的名字恰好是 `Doe`，那么包含该名字的文档会被认为是更好的匹配，因为这个名字不会出现在其他任何文档中。

`cross_fields` 查询会将查询字符串分析为单个词项，然后在任意字段中搜索每个词项，就好像这些字段是同一个字段一样。

以下是针对 `John Doe` 的 `cross_fields` 查询：

```json
GET /customers/_search
{
  "query": {
    "multi_match" : {
      "query": "John Doe",
      "type": "cross_fields",
      "fields": [ "first_name", "last_name" ],
      "operator": "and"
    }
  }
}
```

响应中只包含同时出现 `John` 和 `Doe` 的那个文档：

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
    "max_score": 0.8754687,
    "hits": [
      {
        "_index": "customers",
        "_id": "1",
        "_score": 0.8754687,
        "_source": {
          "first_name": "John",
          "last_name": "Doe"
        }
      }
    ]
  }
}
```

你可以使用 Validate API 操作来了解上述查询的执行方式：

```json
GET /customers/_validate/query?explain
{
  "query": {
    "multi_match" : {
      "query": "John Doe",
      "type": "cross_fields",
      "fields": [ "first_name", "last_name" ],
      "operator": "and"
    }
  }
}
```

从响应中可以看到，该查询在至少一个字段中搜索所有词项：

```json
{
  "_shards": {
    "total": 1,
    "successful": 1,
    "failed": 0
  },
  "valid": true,
  "explanations": [
    {
      "index": "customers",
      "valid": true,
      "explanation": "+blended(terms:[last_name:john, first_name:john]) +blended(terms:[last_name:doe, first_name:doe])"
    }
  ]
}
```

因此，通过混合所有字段的词频来校正差异，就解决了各字段词频不同的问题。

::: info 注意
`cross_fields` 查询通常只适用于 `boost` 为 1 的短字符串字段。在其他情况下，由于权重提升、词频和长度归一化对评分的影响方式，评分无法产生有意义的词项统计混合结果。
:::

::: info 注意
`cross_fields` 查询不支持 `fuzziness` 参数。
:::

### 分析

`cross_fields` 查询只有在具有相同分析器的字段上才能作为以词项为中心的查询工作。具有相同分析器的字段会被分为一组，这些组再通过布尔查询组合起来。 

例如，假设某个索引的 `first_name` 和 `last_name` 字段使用默认的 `standard`
 分析器进行分析，而它们的 `.edge` 子字段使用 edge n-gram 分析器进行分析：

<details markdown="block">
  <summary>
    响应
  </summary>

```json
PUT customers
{
  "settings": {
    "analysis": {
      "analyzer": {
        "my_analyzer": {
          "tokenizer": "my_tokenizer"
        }
      },
      "tokenizer": {
        "my_tokenizer": {
          "type": "edge_ngram",
          "min_gram": 2,
          "max_gram": 10
        }
      }
    }
  },
  "mappings": {
    "properties": {
      "first_name": { 
        "type": "text",
        "fields": {
          "edge": { 
            "type": "text",
            "analyzer": "my_analyzer"
          }
        }
      },
      "last_name": { 
        "type": "text",
        "fields": {
          "edge": { 
            "type": "text",
            "analyzer": "my_analyzer"
          }
        }
      }
    }
  }
}
```

</details>

在 `customers` 索引中索引一个文档：

```json
PUT /customers/_doc/1
{
  "first": "John",
  "last": "Doe"
}
```

你可以使用 `cross_fields` 查询跨这些字段搜索 `John Doe`：

```json
GET /customers/_search
{
  "query": {
    "multi_match" : {
      "query": "John",
      "type": "cross_fields",
      "fields": [
        "first_name", "first_name.edge",
        "last_name",  "last_name.edge"
      ]
    }
  }
}
```

要查看查询的执行方式，可以运行 Validate API：

```json
GET /customers/_validate/query?explain
{
  "query": {
    "multi_match" : {
      "query": "John",
      "type": "cross_fields",
      "fields": [
        "first_name", "first_name.edge",
        "last_name",  "last_name.edge"
      ]
    }
  }
}
```

响应显示，`last_name` 和 `first_name` 字段被分为一组并被视为单个字段。同样，`last_name.edge` 和 `first_name.edge` 字段也被分为一组并被视为单个字段：

```json
{
  "_shards": {
    "total": 1,
    "successful": 1,
    "failed": 0
  },
  "valid": true,
  "explanations": [
    {
      "index": "customers",
      "valid": true,
      "explanation": "(blended(terms:[last_name:john, first_name:john]) | (blended(terms:[last_name.edge:Jo, first_name.edge:Jo]) blended(terms:[last_name.edge:Joh, first_name.edge:Joh]) blended(terms:[last_name.edge:John, first_name.edge:John])))"
    }
  ]
}
```

对上述这样的多个字段组使用 `operator` 或 `minimum_should_match` 参数，可能会导致[上一节](#operator-and-minimum-should-match)中所述的问题。为避免该问题，可以将上述查询改写为通过布尔查询组合的两个 `cross_fields` 子查询，并将 `minimum_should_match` 应用于其中一个子查询：

```json
GET /customers/_search
{
  "query": {
    "bool": {
      "should": [
        {
          "multi_match": {
            "query": "John Doe",
            "type": "cross_fields",
            "fields": [
              "first_name",
              "last_name"
            ],
            "minimum_should_match": "1"
          }
        },
        {
          "multi_match": {
            "query": "John Doe",
            "type": "cross_fields",
            "fields": [
              "first_name.edge",
              "last_name.edge"
            ]
          }
        }
      ]
    }
  }
}
```

要为所有字段创建一个组，请在查询中指定分析器：

```json
GET customers/_search
{
  "query": {
   "multi_match" : {
      "query": "John Doe",
      "type": "cross_fields",
      "analyzer": "standard", 
      "fields": [ "first_name", "last_name", "*.edge" ]
    }
  }
}
```

对上述查询运行 Validate API，可以看到查询的执行方式：

```json
{
  "_shards": {
    "total": 1,
    "successful": 1,
    "failed": 0
  },
  "valid": true,
  "explanations": [
    {
      "index": "customers",
      "valid": true,
      "explanation": "blended(terms:[last_name.edge:john, last_name:john, first_name:john, first_name.edge:john]) blended(terms:[last_name.edge:doe, last_name:doe, first_name:doe, first_name.edge:doe])"
    }
  ]
}
```

## Phrase 

`phrase` 查询的行为与 [`best_fields`](#best-fields) 查询类似，但使用 `match_phrase` 查询而不是 `match` 查询。

以下是针对 [`best_fields`](#best-fields) 一节中所述索引的 `phrase` 查询示例：

```json
GET articles/_search
{
  "query": {
    "multi_match" : {
      "query": "northern lights",
      "type": "phrase",
      "fields": [ "title", "description" ]
    }
  }
}
```

上述查询会作为以下 [`dis_max`](/query-dsl/compound/disjunction-max) 查询执行，其中每个字段对应一个 `match_phrase` 查询：

```json
GET articles/_search
{
  "query": {
    "dis_max": {
      "queries": [
        { "match_phrase": { "title": "northern lights" }},
        { "match_phrase": { "description": "northern lights" }}
      ]
    }
  }
}
```

由于默认情况下 `phrase` 查询只在词项按相同顺序出现时才匹配文本，因此结果中只返回文档 1：

<details markdown="block">
  <summary>
    响应
  </summary>

```json
{
  "took": 3,
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
    "max_score": 0.84407747,
    "hits": [
      {
        "_index": "articles",
        "_id": "1",
        "_score": 0.84407747,
        "_source": {
          "title": "Aurora borealis",
          "description": "Northern lights, or aurora borealis, explained"
        }
      }
    ]
  }
}
```
</details>

你可以使用 `slop` 参数，允许查询短语的单词之间出现其他单词。例如，以下查询在 `flourescent` 和 `therapy` 之间最多有两个单词时，仍将文本视为匹配：

```json
GET articles/_search
{
  "query": {
    "multi_match" : {
      "query": "fluorescent therapy",
      "type": "phrase",
      "fields": [ "title", "description" ],
      "slop": 2
    }
  }
}
```

响应中包含文档 2：

<details markdown="block">
  <summary>
    响应
  </summary>

```json
{
  "took": 3,
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
    "max_score": 0.7003825,
    "hits": [
      {
        "_index": "articles",
        "_id": "2",
        "_score": 0.7003825,
        "_source": {
          "title": "Sun deprivation in the Northern countries",
          "description": "Using fluorescent lights for therapy"
        }
      }
    ]
  }
}
```
</details>

当 `slop` 值小于 2 时，不返回任何文档。

::: info 注意
`phrase` 查询不支持 `fuzziness` 参数。
:::

## Phrase prefix 

`phrase_prefix` 查询的行为与 [`phrase`](#phrase) 查询类似，但使用 `match_phrase_prefix` 查询而不是 `match_phrase` 查询。

以下是针对 [`best_fields`](#best-fields) 一节中所述索引的 `phrase_prefix` 查询示例：

```json
GET articles/_search
{
  "query": {
    "multi_match" : {
      "query": "northern light",
      "type": "phrase_prefix",
      "fields": [ "title", "description" ]
    }
  }
}
```

上述查询会作为以下 [`dis_max`](/query-dsl/compound/disjunction-max) 查询执行，其中每个字段对应一个 `match_phrase_prefix` 查询：

```json
GET articles/_search
{
  "query": {
    "dis_max": {
      "queries": [
        { "match_phrase_prefix": { "title": "northern light" }},
        { "match_phrase_prefix": { "description": "northern light" }}
      ]
    }
  }
}
```

你可以使用 `slop` 参数，允许查询短语的单词之间出现其他单词。

::: info 注意
`phrase_prefix` 查询不支持 `fuzziness` 参数。
:::

## Boolean prefix 

`bool_prefix` 查询为文档评分的方式与 [`most_fields`](#most-fields) 查询类似，但使用 [`match_bool_prefix`](/query-dsl/full-text/match-bool-prefix) 查询而不是 `match` 查询。

以下是针对 [`best_fields`](#best-fields) 一节中所述索引的 `bool_prefix` 查询示例：

```json
GET articles/_search
{
  "query": {
    "multi_match" : {
      "query": "li northern",
      "type": "bool_prefix",
      "fields": [ "title", "description" ]
    }
  }
}
```

上述查询会作为以下 [`dis_max`](/query-dsl/compound/disjunction-max) 查询执行，其中每个字段对应一个 `match_bool_prefix` 查询：

```json
GET articles/_search
{
  "query": {
    "dis_max": {
      "queries": [
        { "match_bool_prefix": { "title": "li northern" }},
        { "match_bool_prefix": { "description": "li northern" }}
      ]
    }
  }
}
```

::: info 注意
`fuzziness`、`prefix_length`、`max_expansions`、`fuzzy_rewrite` 和 `fuzzy_transpositions` 参数支持用于构建词项查询的那些词项，但对根据最后一个词项构建的前缀查询不起作用。
:::

## 参数

该查询接受以下参数。除 `query` 外，所有参数均为可选。

参数 | 数据类型 | 描述
:--- | :--- | :---
`query` | String | 用于搜索的查询字符串。必需。
`auto_generate_synonyms_phrase_query` | Boolean | 指定是否为多词项同义词自动创建 [match phrase 查询](/query-dsl/full-text/match-phrase)。例如，如果将 `ba,batting average` 指定为同义词并搜索 `ba`，OpenSearch 会搜索 `ba OR "batting average"`（如果此选项为 `true`）或 `ba OR (batting AND average)`（如果此选项为 `false`）。默认值为 `true`。
`analyzer` | String | 用于对查询字符串文本进行分词的[分析器](/analyzers/)。默认值为 `default_field` 指定的索引时分析器。如果没有为 `default_field` 指定分析器，则 `analyzer` 为该索引的默认分析器。
`boost` | Floating-point | 按给定的倍数提升该子句的权重。适用于在复合查询中为各子句设置权重。[0, 1) 范围内的值会降低相关性，大于 1 的值会提高相关性。默认值为 `1`。
`fields` | Array of strings | 要搜索的字段列表。如果未提供 `fields` 参数，`multi_match` 查询会搜索 `index.query. Default_field` 设置中指定的字段，该设置的默认值为 `*`。 
`fuzziness` | String | 在判断某个词项是否与某个值匹配时，将一个单词变为另一个单词所需的字符编辑（插入、删除、替换）次数。例如，`wined` 与 `wind` 之间的距离为 1。有效值为非负整数或 `AUTO`。默认值 `AUTO` 会根据每个词项的长度选择一个值，适用于大多数场景。不支持 `phrase`、`phrase_prefix` 和 `cross_fields` 查询。
`fuzzy_rewrite` | String | 决定 OpenSearch 如何重写查询。有效值为 `constant_score`、`scoring_boolean`、`constant_score_boolean`、`top_terms_N`、`top_terms_boost_N` 和 `top_terms_blended_freqs_N`。如果 `fuzziness` 参数不为 `0`，查询默认使用 `top_terms_blended_freqs_${max_expansions}` 作为 `fuzzy_rewrite` 方法。默认值为 `constant_score`。 
`fuzzy_transpositions` | Boolean | 将 `fuzzy_transpositions` 设置为 `true`（默认值）时，会在 `fuzziness` 选项的插入、删除和替换操作之外，增加相邻字符的交换操作。例如，如果 `fuzzy_transpositions` 为 true（交换“n”和“i”），`wind` 与 `wnid` 之间的距离为 1；如果为 false（删除“n”，再插入“n”），距离为 2。如果 `fuzzy_transpositions` 为 false，`rewind` 和 `wnid` 与 `wind` 的距离相同（均为 2），尽管从人的角度来看，`wnid` 显然只是一个拼写错误。默认值适用于大多数场景。
`lenient` | Boolean | 将 `lenient` 设置为 `true` 会忽略查询与文档字段之间的数据类型不匹配。例如，查询字符串 `"8.2"` 可以匹配 `float` 类型的字段。默认值为 `false`。
`max_expansions` | Positive integer |  查询最多可以扩展到的词项数。模糊查询会“扩展到”在 `fuzziness` 指定距离内的若干个匹配词项，然后 OpenSearch 尝试匹配这些词项。默认值为 `50`。
`minimum_should_match` | Positive or negative integer, positive or negative percentage, combination | 如果查询字符串包含多个搜索词项并且使用 `or` 运算符，该参数指定文档被视为匹配时需要匹配的词项数。例如，如果 `minimum_should_match` 为 2，则 `wind often rising` 与 `The Wind Rises.` 不匹配；如果 `minimum_should_match` 为 `1`，则二者匹配。有关详细信息，请参阅 [Minimum should match](/query-dsl/minimum-should-match)。
`operator` | String | 如果查询字符串包含多个搜索词项，该参数指定文档被视为匹配时是需要所有词项都匹配（`AND`），还是只需一个词项匹配（`OR`）。有效值为：<br>- `OR`：字符串 `to be` 被解释为 `to OR be`<br>- `AND`：字符串 `to be` 被解释为 `to AND be`<br> 默认值为 `OR`。
`prefix_length` | Non-negative integer | 不参与模糊匹配的前导字符数。默认值为 `0`。
`slop` | `0` (default) or a positive integer | 控制查询中的单词在顺序错乱到何种程度时仍可视为匹配。引自 [Lucene 文档](https://lucene.apache.org/core/8_9_0/core/org/apache/lucene/search/PhraseQuery.html#getSlop--)：“查询短语中各单词之间允许出现的其他单词数。例如，调换两个单词的顺序需要移动两次（第一次移动使两个单词重叠），因此若要允许短语重新排序，slop 至少为 2。值为 0 时要求精确匹配。”支持 `phrase` 和 `phrase_prefix` 查询类型。
`tie_breaker` | Floating-point | 一个介于 0 和 1.0 之间的系数，用于为匹配多个查询子句的文档赋予更高的权重。有关更多信息，请参阅 [`tie_breaker` 参数](#the-tie_breaker-parameter)。
`type` | String | multi-match 查询类型。有效值为 `best_fields`、`most_fields`、`cross_fields`、`phrase`、`phrase_prefix`、`bool_prefix`。默认值为 `best_fields`。
`zero_terms_query` | String | 在某些情况下，分析器会移除查询字符串中的所有词项。例如，`stop` 分析器会移除字符串 `an but this` 中的所有词项。在这种情况下，`zero_terms_query` 指定是不匹配任何文档（`none`）还是匹配所有文档（`all`）。有效值为 `none` 和 `all`。默认值为 `none`。

::: info 注意
`phrase`、`phrase_prefix` 和 `cross_fields` 查询不支持 `fuzziness` 参数。
:::

::: info 注意
只有 `phrase` 和 `phrase_prefix` 查询支持 `slop` 参数。
:::

### `tie_breaker` 参数 {#the-tiebreaker-parameter}

每个词项级混合查询都会将文档评分计算为组内任一字段返回的最佳评分。所有混合查询的评分相加得到最终评分。你可以使用 `tie_breaker` 参数更改评分的计算方式。`tie_breaker` 参数接受以下值：

- 0.0（`best_fields`、`cross_fields`、`phrase` 和 `phrase_prefix` 查询的默认值）：取组内任一字段返回的单个最佳评分。
- 1.0（`most_fields` 和 `bool_prefix` 查询的默认值）：将组内所有字段的评分相加。
- (0, 1) 范围内的浮点值：取最佳匹配字段的单个最佳评分，再为所有其他匹配字段加上（`tie_breaker` * `_score`）。
