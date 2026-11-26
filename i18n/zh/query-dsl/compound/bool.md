---
title: 布尔查询
---

# 布尔查询

布尔（`bool`）查询（Query）可以将多个查询子句组合成一个高级查询。这些子句通过布尔逻辑组合，用于查找要在结果中返回的匹配文档（Document）。

在 `bool` 查询中可以使用以下查询子句：

子句 | 行为
:--- | :---
`must` | 逻辑 `and` 运算符。结果必须匹配该子句中的所有查询。 
`must_not` | 逻辑 `not` 运算符。所有匹配项都会从结果中排除。
`should` | 逻辑 `or` 运算符。结果必须至少匹配其中一个查询。匹配的 `should` 子句越多，文档的相关性评分（Relevance Score）越高。可以使用 [`minimum_should_match`](/query-dsl/minimum-should-match) 参数设置必须匹配的最少查询数。如果查询包含 `must` 或 `filter` 子句，则 `minimum_should_match` 的默认值为 0；否则默认值为 1。
`filter` | 逻辑 `and` 运算符，在执行查询之前先应用，用于缩小数据集。filter 子句中的查询是一个是或否的选择：如果文档匹配该查询，就会在结果中返回；否则不返回。filter 查询的结果通常会被缓存，以便更快地返回。可以使用 filter 查询根据精确匹配、范围、日期或数字来过滤结果。

布尔查询的结构如下：

```json
GET _search
{
  "query": {
    "bool": {
      "must": [
        {}
      ],
      "must_not": [
        {}
      ],
      "should": [
        {}
      ],
      "filter": {}
    }
  }
}
```

例如，假设你已将莎士比亚全集索引到 OpenSearch 集群中，现在想构造一个满足以下要求的查询：

1. `text_entry` 字段必须包含单词 `love`，并且应当包含 `life` 或 `grace` 之一。
2. `speaker` 字段不得包含 `ROMEO`。
3. 将这些结果过滤为剧目 `Romeo and Juliet`，且不影响相关性评分。

这些要求可以组合成以下查询：

```json
GET shakespeare/_search
{
  "query": {
    "bool": {
      "must": [
        {
          "match": {
            "text_entry": "love"
          }
        }
      ],
      "should": [
        {
          "match": {
            "text_entry": "life"
          }
        },
        {
          "match": {
            "text_entry": "grace"
          }
        }
      ],
      "minimum_should_match": 1,
      "must_not": [
        {
          "match": {
            "speaker": "ROMEO"
          }
        }
      ],
      "filter": {
        "term": {
          "play_name": "Romeo and Juliet"
        }
      }
    }
  }
}
```

响应中包含匹配的文档：

```json
{
  "took": 12,
  "timed_out": false,
  "_shards": {
    "total": 4,
    "successful": 4,
    "skipped": 0,
    "failed": 0
  },
  "hits": {
    "total": {
      "value": 1,
      "relation": "eq"
    },
    "max_score": 11.356054,
    "hits": [
      {
        "_index": "shakespeare",
        "_id": "88020",
        "_score": 11.356054,
        "_source": {
          "type": "line",
          "line_id": 88021,
          "play_name": "Romeo and Juliet",
          "speech_number": 19,
          "line_number": "4.5.61",
          "speaker": "PARIS",
          "text_entry": "O love! O life! not life, but love in death!"
        }
      }
    ]
  }
}
```

如果想确定究竟是哪些子句产生了匹配结果，可以使用 `_name` 参数为每个查询命名。
要添加 `_name` 参数，请将 `match` 查询中的字段名改为一个对象：

```json
GET shakespeare/_search
{
  "query": {
    "bool": {
      "must": [
        {
          "match": {
            "text_entry": {
              "query": "love",
              "_name": "love-must"
            }
          }
        }
      ],
      "should": [
        {
          "match": {
            "text_entry": {
              "query": "life",
              "_name": "life-should"
            }
          }
        },
        {
          "match": {
            "text_entry": {
              "query": "grace",
              "_name": "grace-should"
            }
          }
        }
      ],
      "minimum_should_match": 1,
      "must_not": [
        {
          "match": {
            "speaker": {
              "query": "ROMEO",
              "_name": "ROMEO-must-not"
            }
          }
        }
      ],
      "filter": {
        "term": {
          "play_name": "Romeo and Juliet"
        }
      }
    }
  }
}
```

OpenSearch 会返回一个 `matched_queries` 数组，列出与这些结果匹配的查询：

```json
"matched_queries": [
  "love-must",
  "life-should"
]
```

即使删除不在此列表中的查询，仍会得到完全相同的结果。
通过检查匹配的是哪个 `should` 子句，可以更好地理解结果的相关性评分。

还可以通过嵌套 `bool` 查询来构造复杂的布尔表达式。
例如，使用以下查询在剧目 `Romeo and Juliet` 中查找匹配 (`love` OR `hate`) AND (`life` OR `grace`) 的 `text_entry` 字段：

```json
GET shakespeare/_search
{
  "query": {
    "bool": {
      "must": [
        {
          "bool": {
            "should": [
              {
                "match": {
                  "text_entry": "love"
                }
              },
              {
                "match": {
                  "text": "hate"
                }
              }
            ]
          }
        },
        {
          "bool": {
            "should": [
              {
                "match": {
                  "text_entry": "life"
                }
              },
              {
                "match": {
                  "text": "grace"
                }
              }
            ]
          }
        }
      ],
      "filter": {
        "term": {
          "play_name": "Romeo and Juliet"
        }
      }
    }
  }
}
```

响应中包含匹配的文档：

```json
{
  "took": 10,
  "timed_out": false,
  "_shards": {
    "total": 2,
    "successful": 2,
    "skipped": 0,
    "failed": 0
  },
  "hits": {
    "total": 1,
    "max_score": 11.37006,
    "hits": [
      {
        "_index": "shakespeare",
        "_type": "doc",
        "_id": "88020",
        "_score": 11.37006,
        "_source": {
          "type": "line",
          "line_id": 88021,
          "play_name": "Romeo and Juliet",
          "speech_number": 19,
          "line_number": "4.5.61",
          "speaker": "PARIS",
          "text_entry": "O love! O life! not life, but love in death!"
        }
      }
    ]
  }
}
```
