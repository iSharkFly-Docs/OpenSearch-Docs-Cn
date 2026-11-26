---
title: 自动补全
---

# 自动补全功能

自动补全（autocomplete）会在用户输入时向其显示建议。

例如，如果用户输入 "pop"，OpenSearch 会提供 "popcorn" 或 "popsicles" 之类的建议。这些建议可以预判用户的意图，引导用户更快地找到可能的搜索词。

在 OpenSearch 中，可以设计出随每次击键更新、提供少量相关建议并且能够容忍拼写错误的自动补全功能。

可以使用以下方法之一实现自动补全：

- [前缀匹配](#prefix-matching)
- [Edge n-gram 匹配](#edge-n-gram-matching)
- [边输入边搜索](#search-as-you-type)
- [补全建议器](#completion-suggester)

前缀匹配在查询时进行，其他三种方法则在索引时进行。下文将分别介绍所有方法。

## 前缀匹配

前缀匹配（prefix matching）会查找与查询字符串中最后一个词项相匹配的文档。

例如，假设用户在搜索界面中输入了 "qui"。要自动补全这个短语，可以使用 `match_phrase_prefix` 查询，搜索所有以前缀 "qui" 开头的 `text_entry` 字段（field）值：

```json
GET shakespeare/_search
{
  "query": {
    "match_phrase_prefix": {
      "text_entry": {
        "query": "qui",
        "slop": 3
      }
    }
  }
}
```

要让词序和相对位置更灵活，请指定 `slop` 值。要了解 `slop` 选项，请参阅 [Slop](/query-dsl/full-text/match-phrase#slop)。

前缀匹配不需要任何特殊的映射（mapping），可以直接使用现有数据。
不过，这是一种相当消耗资源的操作。前缀 `a` 可能会匹配数十万个词项，而且对用户也没有用处。
要限制前缀扩展的影响，请将 `max_expansions` 设为一个合理的数值：

```json
GET shakespeare/_search
{
  "query": {
    "match_phrase_prefix": {
      "text_entry": {
        "query": "qui",
        "slop": 3,
        "max_expansions": 10
      }
    }
  }
}
```

查询可以扩展到的最大词项数。查询会将搜索词“扩展”为若干个匹配词项，这些词项都在 `fuzziness` 指定的距离之内。

查询时自动补全易于实现，代价是性能。
在大规模实现此功能时，我们建议采用索引时解决方案。使用索引时解决方案，索引速度可能会变慢，但这个代价只需付出一次，而不是每次查询都要付出。edge n-gram、边输入边搜索和补全建议器方法都是索引时解决方案。

## Edge n-gram 匹配

在索引过程中，edge n-gram 会把一个单词拆分成由 n 个字符组成的序列，以便更快地查找不完整的搜索词。

对单词 "quick" 进行 n-gram 切分时，结果取决于 n 的值。

n | 类型 | n-gram
:--- | :--- | :---
1 | 一元组（Unigram） | [ `q`, `u`, `i`, `c`, `k` ]
2 | 二元组（Bigram） | [ `qu`, `ui`, `ic`, `ck` ]
3 | 三元组（Trigram） | [ `qui`, `uic`, `ick` ]
4 | 四元组（Four-gram） | [ `quic`, `uick` ]
5 | 五元组（Five-gram） | [ `quick` ]

自动补全只需要搜索短语开头的 n-gram，因此 OpenSearch 使用一种称为 *edge n-gram* 的特殊 n-gram。

对单词 "quick" 进行 edge n-gram 切分，结果如下：

- `q`
- `qu`
- `qui`
- `quic`
- `quick`

这与用户输入的顺序相同。

要将字段配置为使用 edge n-gram，请创建一个带有 `edge_ngram` 过滤器的自动补全分析器（analyzer）：

```json
PUT shakespeare
{
  "mappings": {
    "properties": {
      "text_entry": {
        "type": "text",
        "analyzer": "autocomplete"
      }
    }
  },
  "settings": {
    "analysis": {
      "filter": {
        "edge_ngram_filter": {
          "type": "edge_ngram",
          "min_gram": 1,
          "max_gram": 20
        }
      },
      "analyzer": {
        "autocomplete": {
          "type": "custom",
          "tokenizer": "standard",
          "filter": [
            "lowercase",
            "edge_ngram_filter"
          ]
        }
      }
    }
  }
}
```

此示例创建索引，并实例化 edge n-gram 过滤器和分析器。

`edge_ngram_filter` 生成的 edge n-gram 最小长度为 1（单个字母），最大长度为 20，因此它可以为最多 20 个字母的单词提供建议。

`autocomplete` 分析器会把字符串切分为单个词项，将词项转换为小写，然后使用 `edge_ngram_filter` 为每个词项生成 edge n-gram。

使用 `analyze` 操作测试此分析器：

```json
POST shakespeare/_analyze
{
  "analyzer": "autocomplete",
  "text": "quick"
}
```

它返回作为词元（token）的 edge n-gram：

* `q`
* `qu`
* `qui`
* `quic`
* `quick`

在搜索时请使用 `standard` 分析器。否则，搜索查询会被切分为 edge n-gram，你会得到与 `q`、`u` 和 `i` 匹配的所有结果。
这是少数需要在索引时和查询时使用不同分析器的情况之一：

```json
GET shakespeare/_search
{
  "query": {
    "match": {
      "text_entry": {
        "query": "qui",
        "analyzer": "standard"
      }
    }
  }
}
```

响应中包含匹配的文档：

```json
{
  "took": 5,
  "timed_out": false,
  "_shards": {
    "total": 1,
    "successful": 1,
    "skipped": 0,
    "failed": 0
  },
  "hits": {
    "total": {
      "value": 533,
      "relation": "eq"
    },
    "max_score": 9.712725,
    "hits": [
      {
        "_index": "shakespeare",
        "_id": "22006",
        "_score": 9.712725,
        "_source": {
          "type": "line",
          "line_id": 22007,
          "play_name": "Antony and Cleopatra",
          "speech_number": 12,
          "line_number": "5.2.44",
          "speaker": "CLEOPATRA",
          "text_entry": "Quick, quick, good hands."
        }
      },
      {
        "_index": "shakespeare",
        "_id": "54665",
        "_score": 9.712725,
        "_source": {
          "type": "line",
          "line_id": 54666,
          "play_name": "Loves Labours Lost",
          "speech_number": 21,
          "line_number": "5.1.52",
          "speaker": "HOLOFERNES",
          "text_entry": "Quis, quis, thou consonant?"
        }
      }
      ...
    ]
  }
}
```

或者，也可以直接在映射中指定 `search_analyzer`：

```json
"mappings": {
  "properties": {
    "text_entry": {
      "type": "text",
      "analyzer": "autocomplete",
      "search_analyzer": "standard"
    }
  }
}
```

## 补全建议器

补全建议器（completion suggester）接受一个建议列表，并将其构建为有限状态转换器（finite-state transducer，FST）。FST 是一种经过优化的数据结构，本质上是一个图。该数据结构驻留在内存中，并针对快速前缀查找进行了优化。要了解有关 FST 的更多信息，请参阅 [Wikipedia](https://en.wikipedia.org/wiki/Finite-state_transducer)。

当用户输入时，补全建议器沿着匹配路径在 FST 图中逐字符移动。用户输入结束后，它会检查剩余的结尾部分，生成建议列表。

补全建议器可以让自动补全解决方案尽可能高效，并让你可以显式控制它给出的建议。

使用一种名为 [`completion`](/field-types/supported-field-types/completion) 的专用字段类型，它会在索引中存储类似 FST 的数据结构：

```json
PUT shakespeare
{
  "mappings": {
    "properties": {
      "text_entry": {
        "type": "completion"
      }
    }
  }
}
```

要获取建议，请使用 `search` 端点和 `suggest` 参数：

```json
GET shakespeare/_search
{
  "suggest": {
    "autocomplete": {
      "prefix": "To be",
      "completion": {
        "field": "text_entry"
      }
    }
  }
}
```

短语 "to be" 与 `text_entry` 字段的 FST 进行前缀匹配：

```json
{
  "took" : 29,
  "timed_out" : false,
  "_shards" : {
    "total" : 1,
    "successful" : 1,
    "skipped" : 0,
    "failed" : 0
  },
  "hits" : {
    "total" : {
      "value" : 0,
      "relation" : "eq"
    },
    "max_score" : null,
    "hits" : [ ]
  },
  "suggest" : {
    "autocomplete" : [
      {
        "text" : "To be",
        "offset" : 0,
        "length" : 5,
        "options" : [
          {
            "text" : "To be a comrade with the wolf and owl,--",
            "_index" : "shakespeare",
            "_id" : "50652",
            "_score" : 1.0,
            "_source" : {
              "type" : "line",
              "line_id" : 50653,
              "play_name" : "King Lear",
              "speech_number" : 68,
              "line_number" : "2.4.230",
              "speaker" : "KING LEAR",
              "text_entry" : "To be a comrade with the wolf and owl,--"
            }
          },
          {
            "text" : "To be a make-peace shall become my age:",
            "_index" : "shakespeare",
            "_id" : "78566",
            "_score" : 1.0,
            "_source" : {
              "type" : "line",
              "line_id" : 78567,
              "play_name" : "Richard II",
              "speech_number" : 20,
              "line_number" : "1.1.160",
              "speaker" : "JOHN OF GAUNT",
              "text_entry" : "To be a make-peace shall become my age:"
            }
          },
          {
            "text" : "To be a party in this injury.",
            "_index" : "shakespeare",
            "_id" : "75259",
            "_score" : 1.0,
            "_source" : {
              "type" : "line",
              "line_id" : 75260,
              "play_name" : "Othello",
              "speech_number" : 57,
              "line_number" : "5.1.93",
              "speaker" : "IAGO",
              "text_entry" : "To be a party in this injury."
            }
          },
          {
            "text" : "To be a preparation gainst the Polack;",
            "_index" : "shakespeare",
            "_id" : "33591",
            "_score" : 1.0,
            "_source" : {
              "type" : "line",
              "line_id" : 33592,
              "play_name" : "Hamlet",
              "speech_number" : 17,
              "line_number" : "2.2.67",
              "speaker" : "VOLTIMAND",
              "text_entry" : "To be a preparation gainst the Polack;"
            }
          },
          {
            "text" : "To be a public spectacle to all:",
            "_index" : "shakespeare",
            "_id" : "3709",
            "_score" : 1.0,
            "_source" : {
              "type" : "line",
              "line_id" : 3710,
              "play_name" : "Henry VI Part 1",
              "speech_number" : 6,
              "line_number" : "1.4.41",
              "speaker" : "TALBOT",
              "text_entry" : "To be a public spectacle to all:"
            }
          }
        ]
      }
    ]
  }
}
```

要指定返回的建议数量，请使用 `size` 参数：

```json
GET shakespeare/_search
{
  "suggest": {
    "autocomplete": {
      "prefix": "To n",
      "completion": {
        "field": "text_entry",
        "size": 3
      }
    }
  }
}
```

最多返回三个文档：

```json
{
  "took" : 4109,
  "timed_out" : false,
  "_shards" : {
    "total" : 1,
    "successful" : 1,
    "skipped" : 0,
    "failed" : 0
  },
  "hits" : {
    "total" : {
      "value" : 0,
      "relation" : "eq"
    },
    "max_score" : null,
    "hits" : [ ]
  },
  "suggest" : {
    "autocomplete" : [
      {
        "text" : "To n",
        "offset" : 0,
        "length" : 4,
        "options" : [
          {
            "text" : "To NESTOR",
            "_index" : "shakespeare",
            "_id" : "99707",
            "_score" : 1.0,
            "_source" : {
              "type" : "line",
              "line_id" : 99708,
              "play_name" : "Troilus and Cressida",
              "speech_number" : 3,
              "line_number" : "",
              "speaker" : "ULYSSES",
              "text_entry" : "To NESTOR"
            }
          },
          {
            "text" : "To name the bigger light, and how the less,",
            "_index" : "shakespeare",
            "_id" : "91884",
            "_score" : 1.0,
            "_source" : {
              "type" : "line",
              "line_id" : 91885,
              "play_name" : "The Tempest",
              "speech_number" : 91,
              "line_number" : "1.2.394",
              "speaker" : "CALIBAN",
              "text_entry" : "To name the bigger light, and how the less,"
            }
          },
          {
            "text" : "To nature none more bound; his training such,",
            "_index" : "shakespeare",
            "_id" : "40510",
            "_score" : 1.0,
            "_source" : {
              "type" : "line",
              "line_id" : 40511,
              "play_name" : "Henry VIII",
              "speech_number" : 18,
              "line_number" : "1.2.126",
              "speaker" : "KING HENRY VIII",
              "text_entry" : "To nature none more bound; his training such,"
            }
          }
        ]
      }
    ]
  }
}
```

`suggest` 参数只使用前缀匹配来查找建议。
例如，文档 "To be, or not to be" 不在结果中。如果希望将特定文档作为建议返回，可以手动添加精选的建议，并为它们添加权重以确定优先级。

索引一个带有输入建议的文档，并为其分配权重：

```json
PUT shakespeare/_doc/1?refresh=true
{
  "text_entry": {
    "input": [
      "To n", "To be, or not to be: that is the question:"
    ],
    "weight": 10
  }
}
```

执行同样的搜索：

```json
GET shakespeare/_search
{
  "suggest": {
    "autocomplete": {
      "prefix": "To n",
      "completion": {
        "field": "text_entry",
        "size": 3
      }
    }
  }
}
```

你会看到刚才索引的文档排在第一位：

```json
{
  "took" : 1,
  "timed_out" : false,
  "_shards" : {
    "total" : 1,
    "successful" : 1,
    "skipped" : 0,
    "failed" : 0
  },
  "hits" : {
    "total" : {
      "value" : 0,
      "relation" : "eq"
    },
    "max_score" : null,
    "hits" : [ ]
  },
  "suggest" : {
    "autocomplete" : [
      {
        "text" : "To n",
        "offset" : 0,
        "length" : 4,
        "options" : [
          {
            "text" : "To n",
            "_index" : "shakespeare",
            "_id" : "1",
            "_score" : 10.0,
            "_source" : {
              "text_entry" : {
                "input" : [
                  "To n",
                  "To be, or not to be: that is the question:"
                ],
                "weight" : 10
              }
            }
          },
          {
            "text" : "To NESTOR",
            "_index" : "shakespeare",
            "_id" : "99707",
            "_score" : 1.0,
            "_source" : {
              "type" : "line",
              "line_id" : 99708,
              "play_name" : "Troilus and Cressida",
              "speech_number" : 3,
              "line_number" : "",
              "speaker" : "ULYSSES",
              "text_entry" : "To NESTOR"
            }
          },
          {
            "text" : "To name the bigger light, and how the less,",
            "_index" : "shakespeare",
            "_id" : "91884",
            "_score" : 1.0,
            "_source" : {
              "type" : "line",
              "line_id" : 91885,
              "play_name" : "The Tempest",
              "speech_number" : 91,
              "line_number" : "1.2.394",
              "speaker" : "CALIBAN",
              "text_entry" : "To name the bigger light, and how the less,"
            }
          }
        ]
      }
    ]
  }
}
```

也可以通过指定 `fuzzy` 参数，允许查询中存在拼写错误：

```json
GET shakespeare/_search
{
  "suggest": {
    "autocomplete": {
      "prefix": "rosenkrantz",
      "completion": {
        "field": "text_entry",
        "size": 3,
        "fuzzy" : {
            "fuzziness" : "AUTO"
        }
      }
    }
  }
}
```

结果与正确的拼写相匹配：

```json
{
  "took" : 1,
  "timed_out" : false,
  "_shards" : {
    "total" : 1,
    "successful" : 1,
    "skipped" : 0,
    "failed" : 0
  },
  "hits" : {
    "total" : {
      "value" : 0,
      "relation" : "eq"
    },
    "max_score" : null,
    "hits" : [ ]
  },
  "suggest" : {
    "autocomplete" : [
      {
        "text" : "rosenkrantz",
        "offset" : 0,
        "length" : 11,
        "options" : [
          {
            "text" : "ROSENCRANTZ:",
            "_index" : "shakespeare",
            "_id" : "35196",
            "_score" : 5.0,
            "_source" : {
              "type" : "line",
              "line_id" : 35197,
              "play_name" : "Hamlet",
              "speech_number" : 2,
              "line_number" : "4.2.1",
              "speaker" : "HAMLET",
              "text_entry" : "ROSENCRANTZ:"
            }
          }
        ]
      }
    ]
  }
}
```

可以使用正则表达式为补全建议器查询定义前缀：

```json
GET shakespeare/_search
{
  "suggest": {
    "autocomplete": {
      "prefix": "rosen*",
      "completion": {
        "field": "text_entry",
        "size": 3
      }
    }
  }
}
```

有关更多信息，请参阅 [`completion` 字段类型文档](/field-types/supported-field-types/completion)。

## 边输入边搜索

OpenSearch 提供了一种专用的 [`search_as_you_type`](/field-types/supported-field-types/search-as-you-type) 字段类型，它针对边输入边搜索（search as you type）功能进行了优化，可以同时使用前缀补全和中缀补全来匹配词项。使用 `search_as_you_type` 字段时，不需要事先设置自定义分析器或索引建议。

首先，将字段映射为 `search_as_you_type`：

```json
PUT shakespeare
{
  "mappings": {
    "properties": {
      "text_entry": {
        "type": "search_as_you_type"
      }
    }
  }
}
```

索引文档后，OpenSearch 会自动创建并存储该文档的 n-gram 和 edge n-gram。例如，以字符串 `that is the question` 为例。首先，它会使用标准分析器被切分为词项，这些词项存储在 `text_entry` 字段中：

```json
[
    "that",
    "is",
    "the",
    "question"
]
```

除了存储这些词项之外，该字段的以下 2-gram 会存储在 `text_entry._2gram` 字段中：

```json
[
    "that is",
    "is the",
    "the question"
]
```

该字段的以下 3-gram 会存储在 `text_entry._3gram` 字段中：

```json
[
    "that is the",
    "is the question"
]
```

最后，应用 edge n-gram 词元过滤器之后，得到的词项会存储在 `text_entry._index_prefix` 字段中：

```json
[
    "t", 
    "th", 
    "tha", 
    "that", 
    ...
]
```

然后，可以使用 `multi-match` 查询的 `bool_prefix` 类型，以任意顺序匹配词项：

```json
GET shakespeare/_search
{
  "query": {
    "multi_match": {
      "query": "uncle what",
      "type": "bool_prefix",
      "fields": [
        "text_entry",
        "text_entry._2gram",
        "text_entry._3gram"
      ]
    }
  },
  "size": 3
}
```

单词出现顺序与查询中相同的文档，在结果中的排名更高：

```json
{
  "took" : 1,
  "timed_out" : false,
  "_shards" : {
    "total" : 1,
    "successful" : 1,
    "skipped" : 0,
    "failed" : 0
  },
  "hits" : {
    "total" : {
      "value" : 4759,
      "relation" : "eq"
    },
    "max_score" : 10.437667,
    "hits" : [
      {
        "_index" : "shakespeare",
        "_id" : "2817",
        "_score" : 10.437667,
        "_source" : {
          "type" : "line",
          "line_id" : 2818,
          "play_name" : "Henry IV",
          "speech_number" : 5,
          "line_number" : "5.2.31",
          "speaker" : "HOTSPUR",
          "text_entry" : "Uncle, what news?"
        }
      },
      {
        "_index" : "shakespeare",
        "_id" : "37085",
        "_score" : 9.437667,
        "_source" : {
          "type" : "line",
          "line_id" : 37086,
          "play_name" : "Henry V",
          "speech_number" : 26,
          "line_number" : "1.2.262",
          "speaker" : "KING HENRY V",
          "text_entry" : "What treasure, uncle?"
        }
      },
      {
        "_index" : "shakespeare",
        "_id" : "79274",
        "_score" : 9.358302,
        "_source" : {
          "type" : "line",
          "line_id" : 79275,
          "play_name" : "Richard II",
          "speech_number" : 29,
          "line_number" : "2.1.187",
          "speaker" : "KING RICHARD II",
          "text_entry" : "Why, uncle, whats the matter?"
        }
      }
    ]
  }
}
```

要按顺序匹配词项，可以使用 `match_phrase_prefix` 查询：

```json
GET shakespeare/_search
{
  "query": {
    "match_phrase_prefix": {
      "text_entry": "uncle wha"
    }
  },
  "size": 3
}
```

响应中包含与前缀匹配的文档：

```json
{
  "took" : 1,
  "timed_out" : false,
  "_shards" : {
    "total" : 1,
    "successful" : 1,
    "skipped" : 0,
    "failed" : 0
  },
  "hits" : {
    "total" : {
      "value" : 6,
      "relation" : "eq"
    },
    "max_score" : 16.37664,
    "hits" : [
      {
        "_index" : "shakespeare",
        "_id" : "2817",
        "_score" : 16.37664,
        "_source" : {
          "type" : "line",
          "line_id" : 2818,
          "play_name" : "Henry IV",
          "speech_number" : 5,
          "line_number" : "5.2.31",
          "speaker" : "HOTSPUR",
          "text_entry" : "Uncle, what news?"
        }
      },
      {
        "_index" : "shakespeare",
        "_id" : "6789",
        "_score" : 16.37664,
        "_source" : {
          "type" : "line",
          "line_id" : 6790,
          "play_name" : "Henry VI Part 2",
          "speech_number" : 60,
          "line_number" : "1.3.202",
          "speaker" : "KING HENRY VI",
          "text_entry" : "Uncle, what shall we say to this in law?"
        }
      },
      {
        "_index" : "shakespeare",
        "_id" : "7877",
        "_score" : 16.37664,
        "_source" : {
          "type" : "line",
          "line_id" : 7878,
          "play_name" : "Henry VI Part 2",
          "speech_number" : 13,
          "line_number" : "3.2.28",
          "speaker" : "KING HENRY VI",
          "text_entry" : "Where is our uncle? whats the matter, Suffolk?"
        }
      }
    ]
  }
}
```

最后，要精确匹配最后一个词项而不是将其作为前缀匹配，可以使用 `match_phrase` 查询：

```json
GET shakespeare/_search
{
  "query": {
    "match_phrase": {
      "text_entry": "uncle what"
    }
  },
  "size": 5
}
```

响应中包含精确匹配的结果：

```json
{
  "took" : 1,
  "timed_out" : false,
  "_shards" : {
    "total" : 1,
    "successful" : 1,
    "skipped" : 0,
    "failed" : 0
  },
  "hits" : {
    "total" : {
      "value" : 3,
      "relation" : "eq"
    },
    "max_score" : 14.437452,
    "hits" : [
      {
        "_index" : "shakespeare",
        "_id" : "2817",
        "_score" : 14.437452,
        "_source" : {
          "type" : "line",
          "line_id" : 2818,
          "play_name" : "Henry IV",
          "speech_number" : 5,
          "line_number" : "5.2.31",
          "speaker" : "HOTSPUR",
          "text_entry" : "Uncle, what news?"
        }
      },
      {
        "_index" : "shakespeare",
        "_id" : "6789",
        "_score" : 9.461917,
        "_source" : {
          "type" : "line",
          "line_id" : 6790,
          "play_name" : "Henry VI Part 2",
          "speech_number" : 60,
          "line_number" : "1.3.202",
          "speaker" : "KING HENRY VI",
          "text_entry" : "Uncle, what shall we say to this in law?"
        }
      },
      {
        "_index" : "shakespeare",
        "_id" : "100955",
        "_score" : 8.947967,
        "_source" : {
          "type" : "line",
          "line_id" : 100956,
          "play_name" : "Troilus and Cressida",
          "speech_number" : 28,
          "line_number" : "3.2.98",
          "speaker" : "CRESSIDA",
          "text_entry" : "Well, uncle, what folly I commit, I dedicate to you."
        }
      }
    ]
  }
}
```

如果修改前面 `match_phrase` 查询中的文本，省略最后一个字母，那么前面响应中的所有文档都不会被返回：

```json
GET shakespeare/_search
{
  "query": {
    "match_phrase": {
      "text_entry": "uncle wha"
    }
  }
}
```

结果为空：

```json
{
  "took" : 1,
  "timed_out" : false,
  "_shards" : {
    "total" : 1,
    "successful" : 1,
    "skipped" : 0,
    "failed" : 0
  },
  "hits" : {
    "total" : {
      "value" : 0,
      "relation" : "eq"
    },
    "max_score" : null,
    "hits" : [ ]
  }
}
```

有关更多信息，请参阅 [`search_as_you_type` 字段类型文档](/field-types/supported-field-types/search-as-you-type)。
