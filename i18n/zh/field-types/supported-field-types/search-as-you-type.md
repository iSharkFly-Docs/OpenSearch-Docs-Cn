---
title: 边输入边搜索
---

# Search-as-you-type 字段类型

search-as-you-type 字段类型同时利用前缀补全和中缀补全，提供边输入边搜索（search-as-you-type）功能。 

## 示例

为 search-as-you-type 字段建立映射（Mapping）时，会为该字段创建 n-gram 子字段，其中 n 的取值范围为 [2, `max_shingle_size`]。此外，还会创建一个索引前缀子字段。

创建一个包含 search-as-you-type 字段的映射：

```json
PUT books
{
  "mappings": {
    "properties": {
      "suggestions": {
        "type": "search_as_you_type"
      }
    }
  }
}
```

除 `suggestions` 字段外，上述操作还会创建 `suggestions._2gram`、`suggestions._3gram` 和 `suggestions._index_prefix` 字段。 

索引一个包含 search-as-you-type 字段的文档（Document）：

```json
PUT books/_doc/1
{
  "suggestions": "one two three four"
}
```

要以任意顺序匹配词项，请使用 bool_prefix 或 multi-match 查询（Query）。这些查询会将搜索词按指定顺序出现的文档排在搜索词顺序不一致的文档之前。

```json
GET books/_search
{
  "query": {
    "multi_match": {
      "query": "tw one",
      "type": "bool_prefix",
      "fields": [
        "suggestions",
        "suggestions._2gram",
        "suggestions._3gram"
      ]
    }
  }
}
```

响应中包含匹配的文档：

```json
{
  "took" : 13,
  "timed_out" : false,
  "_shards" : {
    "total" : 1,
    "successful" : 1,
    "skipped" : 0,
    "failed" : 0
  },
  "hits" : {
    "total" : {
      "value" : 1,
      "relation" : "eq"
    },
    "max_score" : 1.0,
    "hits" : [
      {
        "_index" : "books",
        "_type" : "_doc",
        "_id" : "1",
        "_score" : 1.0,
        "_source" : {
          "suggestions" : "one two three four"
        }
      }
    ]
  }
}
```

要按顺序匹配词项，请使用 match_phrase_prefix 查询：

```json
GET books/_search
{
  "query": {
    "match_phrase_prefix": {
      "suggestions": "two th"
    }
  }
}
```

响应中包含匹配的文档：

```json
{
  "took" : 23,
  "timed_out" : false,
  "_shards" : {
    "total" : 1,
    "successful" : 1,
    "skipped" : 0,
    "failed" : 0
  },
  "hits" : {
    "total" : {
      "value" : 1,
      "relation" : "eq"
    },
    "max_score" : 0.4793051,
    "hits" : [
      {
        "_index" : "books",
        "_type" : "_doc",
        "_id" : "1",
        "_score" : 0.4793051,
        "_source" : {
          "suggestions" : "one two three four"
        }
      }
    ]
  }
}
```

要精确匹配最后的词项，请使用 match_phrase 查询：

```json
GET books/_search
{
  "query": {
    "match_phrase": {
      "suggestions": "four"
    }
  }
}
```

响应：

```json
{
  "took" : 2,
  "timed_out" : false,
  "_shards" : {
    "total" : 1,
    "successful" : 1,
    "skipped" : 0,
    "failed" : 0
  },
  "hits" : {
    "total" : {
      "value" : 1,
      "relation" : "eq"
    },
    "max_score" : 0.2876821,
    "hits" : [
      {
        "_index" : "books",
        "_type" : "_doc",
        "_id" : "1",
        "_score" : 0.2876821,
        "_source" : {
          "suggestions" : "one two three four"
        }
      }
    ]
  }
}
```

## 参数

下表列出了 search-as-you-type 字段类型接受的参数。所有参数均为可选。

参数 | 描述 
:--- | :---
`analyzer` | 用于该字段的分析器（Analyzer）。默认情况下，该分析器同时用于索引时和搜索时。如需在搜索时覆盖它，请设置 `search_analyzer` 参数。默认值为 `standard` 分析器，它使用基于语法的分词，并基于 [Unicode Text Segmentation](https://unicode.org/reports/tr29/) 算法。作用于根字段和子字段。
`index` | 一个布尔值，指定该字段是否可搜索。默认值为 `true`。作用于根字段和子字段。
`index_options` | 指定为搜索和高亮而在索引中存储的信息。有效值：`docs`（仅文档编号）、`freqs`（文档编号和词频）、`positions`（文档编号、词频和词项位置）、`offsets`（文档编号、词频、词项位置以及起止字符偏移量）。默认值为 `positions`。作用于根字段和子字段。
`max_shingle_size` | 一个整数，指定 n-gram 的最大长度。有效值的范围为 [2, 4]。所创建的 n-gram 范围为 [2, `max_shingle_size`]。默认值为 3，即创建 2-gram 和 3-gram。较大的 `max_shingle_size` 值更适合更具体的查询，但会使索引更大。 
`norms` | 一个布尔值，指定计算相关性评分（Relevance Score）时是否使用字段长度。作用于根字段和 n-gram 子字段（默认值为 `false`）。不作用于前缀子字段（前缀子字段中 `norms` 为 `false`）。 
`search_analyzer` | 搜索时使用的分析器。默认值为 `analyzer` 参数中指定的分析器。作用于根字段和子字段。
`search_quote_analyzer` | 搜索短语时使用的分析器。默认值为 `analyzer` 参数中指定的分析器。作用于根字段和子字段。
`similarity` | 用于计算相关性评分的排名算法。默认值为 `BM25`。作用于根字段和子字段。
`store` | 一个布尔值，指定是否存储该字段值，以便能够独立于 _source 字段单独检索。默认值为 `false`。仅作用于根字段。
[`term_vector`](/field-types/supported-field-types/text#term-vector-parameter) | 一个布尔值，指定是否存储该字段的词项向量。默认值为 `no`。作用于根字段和 n-gram 子字段。不作用于前缀子字段。
