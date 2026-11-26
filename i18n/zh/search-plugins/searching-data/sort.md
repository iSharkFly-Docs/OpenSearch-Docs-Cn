---
title: 对结果排序
---

## 对结果排序

排序（sort）可以让用户按照对他们最有意义的方式对结果进行排序。

默认情况下，全文查询（full-text query）按相关性评分（Relevance Score）对结果排序。
通过将 `order` 参数设置为 `asc` 或 `desc`，可以按任意字段（Field）值以升序或降序对结果进行排序。

例如，要按 `line_id` 值的降序对结果排序，请使用以下查询：

```json
GET shakespeare/_search
{
  "query": {
    "term": {
      "play_name": {
        "value": "Henry IV"
      }
    }
  },
  "sort": [
    {
      "line_id": {
        "order": "desc"
      }
    }
  ]
}
```

结果按 `line_id` 降序排列：

```json
{
  "took" : 24,
  "timed_out" : false,
  "_shards" : {
    "total" : 1,
    "successful" : 1,
    "skipped" : 0,
    "failed" : 0
  },
  "hits" : {
    "total" : {
      "value" : 3205,
      "relation" : "eq"
    },
    "max_score" : null,
    "hits" : [
      {
        "_index" : "shakespeare",
        "_id" : "3204",
        "_score" : null,
        "_source" : {
          "type" : "line",
          "line_id" : 3205,
          "play_name" : "Henry IV",
          "speech_number" : 8,
          "line_number" : "",
          "speaker" : "KING HENRY IV",
          "text_entry" : "Exeunt"
        },
        "sort" : [
          3205
        ]
      },
      {
        "_index" : "shakespeare",
        "_id" : "3203",
        "_score" : null,
        "_source" : {
          "type" : "line",
          "line_id" : 3204,
          "play_name" : "Henry IV",
          "speech_number" : 8,
          "line_number" : "5.5.45",
          "speaker" : "KING HENRY IV",
          "text_entry" : "Let us not leave till all our own be won."
        },
        "sort" : [
          3204
        ]
      },
      {
        "_index" : "shakespeare",
        "_id" : "3202",
        "_score" : null,
        "_source" : {
          "type" : "line",
          "line_id" : 3203,
          "play_name" : "Henry IV",
          "speech_number" : 8,
          "line_number" : "5.5.44",
          "speaker" : "KING HENRY IV",
          "text_entry" : "And since this business so fair is done,"
        },
        "sort" : [
          3203
        ]
      },
      {
        "_index" : "shakespeare",
        "_id" : "3201",
        "_score" : null,
        "_source" : {
          "type" : "line",
          "line_id" : 3202,
          "play_name" : "Henry IV",
          "speech_number" : 8,
          "line_number" : "5.5.43",
          "speaker" : "KING HENRY IV",
          "text_entry" : "Meeting the cheque of such another day:"
        },
        "sort" : [
          3202
        ]
      },
      {
        "_index" : "shakespeare",
        "_id" : "3200",
        "_score" : null,
        "_source" : {
          "type" : "line",
          "line_id" : 3201,
          "play_name" : "Henry IV",
          "speech_number" : 8,
          "line_number" : "5.5.42",
          "speaker" : "KING HENRY IV",
          "text_entry" : "Rebellion in this land shall lose his sway,"
        },
        "sort" : [
          3201
        ]
      },
      {
        "_index" : "shakespeare",
        "_id" : "3199",
        "_score" : null,
        "_source" : {
          "type" : "line",
          "line_id" : 3200,
          "play_name" : "Henry IV",
          "speech_number" : 8,
          "line_number" : "5.5.41",
          "speaker" : "KING HENRY IV",
          "text_entry" : "To fight with Glendower and the Earl of March."
        },
        "sort" : [
          3200
        ]
      },
      {
        "_index" : "shakespeare",
        "_id" : "3198",
        "_score" : null,
        "_source" : {
          "type" : "line",
          "line_id" : 3199,
          "play_name" : "Henry IV",
          "speech_number" : 8,
          "line_number" : "5.5.40",
          "speaker" : "KING HENRY IV",
          "text_entry" : "Myself and you, son Harry, will towards Wales,"
        },
        "sort" : [
          3199
        ]
      },
      {
        "_index" : "shakespeare",
        "_id" : "3197",
        "_score" : null,
        "_source" : {
          "type" : "line",
          "line_id" : 3198,
          "play_name" : "Henry IV",
          "speech_number" : 8,
          "line_number" : "5.5.39",
          "speaker" : "KING HENRY IV",
          "text_entry" : "Who, as we hear, are busily in arms:"
        },
        "sort" : [
          3198
        ]
      },
      {
        "_index" : "shakespeare",
        "_id" : "3196",
        "_score" : null,
        "_source" : {
          "type" : "line",
          "line_id" : 3197,
          "play_name" : "Henry IV",
          "speech_number" : 8,
          "line_number" : "5.5.38",
          "speaker" : "KING HENRY IV",
          "text_entry" : "To meet Northumberland and the prelate Scroop,"
        },
        "sort" : [
          3197
        ]
      },
      {
        "_index" : "shakespeare",
        "_id" : "3195",
        "_score" : null,
        "_source" : {
          "type" : "line",
          "line_id" : 3196,
          "play_name" : "Henry IV",
          "speech_number" : 8,
          "line_number" : "5.5.37",
          "speaker" : "KING HENRY IV",
          "text_entry" : "Towards York shall bend you with your dearest speed,"
        },
        "sort" : [
          3196
        ]
      }
    ]
  }
}
```

`sort` 参数是一个数组，因此可以按优先级顺序指定多个字段值。

如果有两个字段的 `line_id` 值相同，OpenSearch 会使用第二个排序选项 `speech_number`：

```json
GET shakespeare/_search
{
  "query": {
    "term": {
      "play_name": {
        "value": "Henry IV"
      }
    }
  },
  "sort": [
    {
      "line_id": {
        "order": "desc"
      }
    },
    {
      "speech_number": {
        "order": "desc"
      }
    }
  ]
}
```

可以继续按任意数量的字段值排序，以便让结果完全按照所需的顺序排列。排序依据不一定是数值&mdash;&mdash;也可以按日期或时间戳字段排序：

```json
"sort": [
    {
      "date": {
        "order": "desc"
      }
    }
  ]
```

经过分析的文本字段不能用于对文档（Document）排序，因为倒排索引中只包含分词后的各个词项，而不包含完整的字符串。因此，例如你不能按 `play_name` 排序。

要绕过此限制，可以使用映射为 keyword 类型的文本字段原始版本。在以下示例中，`play_name.keyword` 未经分析，你拥有一份完整的原始版本副本可用于排序：

```json
GET shakespeare/_search
{
  "query": {
    "term": {
      "play_name": {
        "value": "Henry IV"
      }
    }
  },
  "sort": [
    {
      "play_name.keyword": {
        "order": "desc"
      }
    }
  ]
}
```

结果按 `play_name` 字段的字母顺序排列。

将 `sort` 与 [`search_after` 参数](/search-plugins/searching-data/paginate#the-search_after-parameter)结合使用，可以更高效地滚动浏览结果。
结果从 `search_after` 数组中所指定排序值之后的文档开始。

请确保 `search_after` 数组中值的数量与 `sort` 数组中的相同，且顺序一致。
在本例中，请求的是从 `line_id = 3202` 且 `speech_number = 8` 之后的文档开始的结果：

```json
GET shakespeare/_search
{
  "query": {
    "term": {
      "play_name": {
        "value": "Henry IV"
      }
    }
  },
  "sort": [
    {
      "line_id": {
        "order": "desc"
      }
    },
    {
      "speech_number": {
        "order": "desc"
      }
    }
  ],
  "search_after": [
    "3202",
    "8"
  ]
}
```

## 排序模式

排序模式适用于按数组字段或多值字段排序的情况。它指定选择哪个数组值来对文档进行排序。对于包含数字数组的数值字段，可以使用 `avg`、`sum` 或 `median` 模式排序。要按最小值或最大值排序，请使用 `min` 或 `max` 模式，这两种模式同时适用于数值和字符串数据类型（data type）。

升序排序时默认模式为 `min`，降序排序时默认模式为 `max`。

以下示例演示了如何使用排序模式按数组字段排序。

假设有一个存放学生成绩的索引（Index）。向该索引中索引两个文档：

```json
PUT students/_doc/1
{
   "name": "John Doe",
   "grades": [70, 90]
}

PUT students/_doc/2
{
   "name": "Mary Major",
   "grades": [80, 100]
}
```

使用 `avg` 模式按平均成绩从高到低对所有学生排序：

```
GET students/_search
{
   "query" : {
      "match_all": {}
   },
   "sort" : [
      {"grades" : {"order" : "desc", "mode" : "avg"}}
   ]
}
```

响应中的学生按 `grades` 降序排列：

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
      "value" : 2,
      "relation" : "eq"
    },
    "max_score" : null,
    "hits" : [
      {
        "_index" : "students",
        "_id" : "2",
        "_score" : null,
        "_source" : {
          "name" : "Mary Major",
          "grades" : [
            80,
            100
          ]
        },
        "sort" : [
          90
        ]
      },
      {
        "_index" : "students",
        "_id" : "1",
        "_score" : null,
        "_source" : {
          "name" : "John Doe",
          "grades" : [
            70,
            90
          ]
        },
        "sort" : [
          80
        ]
      }
    ]
  }
}
```

## 对嵌套对象排序

对 [nested](/field-types/supported-field-types/nested) 对象排序时，请提供 `path` 参数，指定要排序的字段的路径。

例如，在索引 `students` 中，将变量 `first_sem` 映射为 `nested`：

```json
PUT students
{
  "mappings" : {
    "properties": {
      "first_sem": { 
        "type" : "nested"
      }
    }
  }
}
```

索引两个包含嵌套字段的文档：

```json
PUT students/_doc/1
{
   "name": "John Doe",
   "first_sem" : {
     "grades": [70, 90]
   }
}

PUT students/_doc/2
{
  "name": "Mary Major",
  "first_sem": {
    "grades": [80, 100]
  }
}
```

按平均成绩排序时，请提供嵌套字段的路径：

```json
GET students/_search
{
 "query" : {
    "match_all": {}
 },
 "sort" : [
    {"first_sem.grades": {
      "order" : "desc", 
      "mode" : "avg",
      "nested": {
        "path": "first_sem"
     }
    }
    }
 ]
}
```

## 处理缺失值

`missing` 参数指定如何处理缺失值。内置的有效值为 `_last`（将缺失该值的文档排在最后）和 `_first`（将缺失该值的文档排在最前）。默认值为 `_last`。也可以指定一个自定义值，作为缺失该值的文档的排序值。

例如，可以索引一个包含 `average` 字段的文档，以及另一个不含 `average` 字段的文档：

```json
PUT students/_doc/1
{
   "name": "John Doe",
   "average": 80
}

PUT students/_doc/2
{
   "name": "Mary Major"
}
```

对文档排序，将缺失该字段的文档排在最前：

```json
GET students/_search
{
  "query": {
    "match_all": {}
  },
  "sort": [
    {
      "average": {
        "order": "desc",
        "missing": "_first"
      }
    }
  ]
}
```

响应将文档 2 列在最前：

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
      "value" : 2,
      "relation" : "eq"
    },
    "max_score" : null,
    "hits" : [
      {
        "_index" : "students",
        "_id" : "2",
        "_score" : null,
        "_source" : {
          "name" : "Mary Major"
        },
        "sort" : [
          9223372036854775807
        ]
      },
      {
        "_index" : "students",
        "_id" : "1",
        "_score" : null,
        "_source" : {
          "name" : "John Doe",
          "average" : 80
        },
        "sort" : [
          80
        ]
      }
    ]
  }
}
```

## 忽略未映射的字段

如果某个字段未被映射（Mapping），默认情况下按该字段排序的搜索请求会失败。为避免这种情况，可以使用 `unmapped_type` 参数，通知 OpenSearch 忽略该字段。例如，如果将 `unmapped_type` 设置为 `long`，该字段将被视为已映射为 `long` 类型。此外，索引中所有带有 `unmapped_type` 字段的文档都会被视为该字段没有值，因此不会按该字段排序。

例如，假设有两个索引。在第一个索引中索引一个包含 `average` 字段的文档：

```json
PUT students/_doc/1
{
   "name": "John Doe",
   "average": 80
}
```

在第二个索引中索引一个不含 `average` 字段的文档：

```json
PUT students_no_map/_doc/2
{
   "name": "Mary Major"
}
```

搜索两个索引中的所有文档，并按 `average` 字段排序：

```json
GET students*/_search
{
  "query": {
    "match_all": {}
  },
  "sort": [
    {
      "average": {
        "order": "desc"
      }
    }
  ]
}
```

默认情况下，由于 `average` 字段未被映射，第二个索引会产生错误：

```json
{
  "took" : 3,
  "timed_out" : false,
  "_shards" : {
    "total" : 2,
    "successful" : 1,
    "skipped" : 0,
    "failed" : 1,
    "failures" : [
      {
        "shard" : 0,
        "index" : "students_no_map",
        "node" : "cam9NWqVSV-jUIkQ3tRubw",
        "reason" : {
          "type" : "query_shard_exception",
          "reason" : "No mapping found for [average] in order to sort on",
          "index" : "students_no_map",
          "index_uuid" : "JgfRkypKSUSpyU-ZXr9kKA"
        }
      }
    ]
  },
  "hits" : {
    "total" : {
      "value" : 1,
      "relation" : "eq"
    },
    "max_score" : null,
    "hits" : [
      {
        "_index" : "students",
        "_id" : "1",
        "_score" : null,
        "_source" : {
          "name" : "John Doe",
          "average" : 80
        },
        "sort" : [
          80
        ]
      }
    ]
  }
}
```

可以指定 `unmapped_type` 参数，以忽略未映射的字段：

```json
GET students*/_search
{
  "query": {
    "match_all": {}
  },
  "sort": [
    {
      "average": {
        "order": "desc",
        "unmapped_type": "long"
      }
    }
  ]
}
```

响应包含两个文档：

```json
{
  "took" : 4,
  "timed_out" : false,
  "_shards" : {
    "total" : 2,
    "successful" : 2,
    "skipped" : 0,
    "failed" : 0
  },
  "hits" : {
    "total" : {
      "value" : 2,
      "relation" : "eq"
    },
    "max_score" : null,
    "hits" : [
      {
        "_index" : "students",
        "_id" : "1",
        "_score" : null,
        "_source" : {
          "name" : "John Doe",
          "average" : 80
        },
        "sort" : [
          80
        ]
      },
      {
        "_index" : "students_no_map",
        "_id" : "2",
        "_score" : null,
        "_source" : {
          "name" : "Mary Major"
        },
        "sort" : [
          -9223372036854775808
        ]
      }
    ]
  }
}
```

## 跟踪评分

默认情况下，按字段排序时不会计算评分。可以将 `track_scores` 设置为 `true` 来计算和跟踪评分：

```json
GET students/_search
{
  "query": {
    "match_all": {}
  },
  "sort": [
    {
      "average": {
        "order": "desc"
      }
    }
  ],
  "track_scores": true
}
```

## 按地理距离排序

可以按 `_geo_distance` 对文档排序。支持以下参数。

参数 | 说明
:--- | :---
distance_type | 指定计算距离的方法。有效值为 `arc` 和 `plane`。`plane` 方法速度更快，但在长距离或靠近两极时精度较低。默认值为 `arc`。
mode | 指定如何处理包含多个地理点（geopoint）的字段。默认情况下，升序排序时文档按最短距离排序，降序排序时按最长距离排序。有效值为 `min`、`max`、`median` 和 `avg`。
unit | 指定计算排序值时使用的单位。默认值为米（`m`）。
ignore_unmapped | 指定如何处理未映射的字段。将 `ignore_unmapped` 设置为 `true` 可忽略未映射的字段。默认值为 `false`（遇到未映射的字段时报错）。

::: info 注意
`_geo_distance` 参数不支持 `missing_values`。当文档不包含用于计算距离的字段时，距离始终被视为 `infinity`。
:::

例如，索引两个包含地理点的文档：

```json
PUT testindex1/_doc/1
{
  "point": [74.00, 40.71] 
}

PUT testindex1/_doc/2
{
  "point": [73.77, -69.63] 
}
```

搜索所有文档，并按与所提供的点之间的距离对其排序：

```json
GET testindex1/_search
{
  "sort": [
    {
      "_geo_distance": {
        "point": [59, -54],
        "order": "asc",
        "unit": "km",
        "distance_type": "arc",
        "mode": "min",
        "ignore_unmapped": true
      }
    }
  ],
  "query": {
    "match_all": {}
  }
}
```

响应包含排序后的文档：

```json
{
  "took" : 864,
  "timed_out" : false,
  "_shards" : {
    "total" : 1,
    "successful" : 1,
    "skipped" : 0,
    "failed" : 0
  },
  "hits" : {
    "total" : {
      "value" : 2,
      "relation" : "eq"
    },
    "max_score" : null,
    "hits" : [
      {
        "_index" : "testindex1",
        "_id" : "2",
        "_score" : null,
        "_source" : {
          "point" : [
            73.77,
            -69.63
          ]
        },
        "sort" : [
          1891.2667493895767
        ]
      },
      {
        "_index" : "testindex1",
        "_id" : "1",
        "_score" : null,
        "_source" : {
          "point" : [
            74.0,
            40.71
          ]
        },
        "sort" : [
          10628.402240213345
        ]
      }
    ]
  }
}
```

::: info 注意
可以使用地理点字段类型（field type）支持的任意格式提供坐标。有关所有格式的说明，请参阅[地理点字段类型文档](/field-types/supported-field-types/geo-point)。
:::

要向 `_geo_distance` 传入多个地理点，请使用数组：

```json
GET testindex1/_search
{
  "sort": [
    {
      "_geo_distance": {
        "point": [[59, -54], [60, -53]],
        "order": "asc",
        "unit": "km",
        "distance_type": "arc",
        "mode": "min",
        "ignore_unmapped": true
      }
    }
  ],
  "query": {
    "match_all": {}
  }
}
```

对于每个文档，排序距离按照 `mode` 的指定，取搜索中提供的所有点到文档中所有点之间距离的最小值、最大值或平均值。

## 性能考虑

用于排序的字段值会被加载到内存中。因此，为了将开销降到最低，建议将[数值类型](/field-types/supported-field-types/numeric)映射为可接受的最小类型，例如 `short`、`integer` 和 `float`。[字符串类型](/field-types/supported-field-types/string)的排序字段不应经过分析或分词。
