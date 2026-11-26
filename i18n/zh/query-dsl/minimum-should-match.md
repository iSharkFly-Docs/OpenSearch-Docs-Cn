---
title: Minimum should match
---

# Minimum should match 

`minimum_should_match` 参数可用于全文搜索，它指定文档必须匹配的最少词项数，只有满足该数量的文档才会在搜索结果中返回。 

以下示例要求文档至少匹配三个搜索词项中的两个，才会作为搜索结果返回：

```json
GET /shakespeare/_search
{
  "query": {
    "match": {
      "text_entry": {
        "query": "prince king star",
        "minimum_should_match": "2"
      }
    }
  }
}
```

在此示例中，查询包含三个通过 `OR` 组合的可选子句，因此文档必须匹配 `prince`、`king` 或 `star`。

## 有效值

你可以将 `minimum_should_match` 参数指定为以下值之一。

值类型 | 示例 | 描述
:--- | :--- | :---
非负整数 | `2` | 文档必须匹配此数量的可选子句。
负整数 | `-1` | 文档必须匹配的可选子句数量为可选子句总数减去此数值。
非负百分比 | `70%` | 文档必须匹配可选子句总数的此百分比。需要匹配的子句数量会向下取整到最接近的整数。
负百分比 | `-30%` | 文档可以有可选子句总数的此百分比不匹配。允许文档不匹配的子句数量会向下取整到最接近的整数。
组合 | `2<75%` | 采用 `n<p%` 格式的表达式。如果可选子句数量小于或等于 `n`，则文档必须匹配所有可选子句。如果可选子句数量大于 `n`，则文档必须匹配 `p` 百分比的可选子句。
多个组合 | `3<-1 5<50%` | 以空格分隔的多个组合。每个条件适用于可选子句数量大于 `<` 符号左侧数字的情况。在此示例中，如果可选子句不超过三个，则文档必须全部匹配。如果有四个或五个可选子句，则文档必须匹配其中除一个以外的所有子句。如果有 6 个或更多可选子句，则文档必须匹配其中的 50%。

::: info 注意
设 `n` 为文档必须匹配的可选子句数量。当 `n` 以百分比计算时，如果 `n` 小于 1，则使用 1。如果 `n` 大于可选子句数量，则使用可选子句数量。
:::

## 在 Boolean 查询中使用该参数

[Boolean 查询](/)在 `should` 子句中列出可选子句，在 `must` 子句中列出必需子句。它还可以选择包含一个 `filter` 子句来过滤结果。

假设一个示例索引（Index）包含以下五个文档（Document）：

```json
PUT testindex/_doc/1
{
  "text": "one OpenSearch"
}
```

```json
PUT testindex/_doc/2
{
  "text": "one two OpenSearch"
}
```

```json
PUT testindex/_doc/3
{
  "text": "one two three OpenSearch"
}
```

```json
PUT testindex/_doc/4
{
  "text": "one two three four OpenSearch"
}
```

```json
PUT testindex/_doc/5
{
  "text": "OpenSearch"
}
```

以下查询包含四个可选子句：

```json
GET testindex/_search
{
  "query": {
    "bool": {
      "must": [
        {
          "match": {
            "text": "OpenSearch"
          }
        }
      ], 
      "should": [
        {
          "match": {
            "text": "one"
          }
        },
        {
          "match": {
            "text": "two"
          }
        },
        {
          "match": {
            "text": "three"
          }
        },
        {
          "match": {
            "text": "four"
          }
        }
      ],
      "minimum_should_match": "80%"
    }
  }
}
```

由于 `minimum_should_match` 指定为 `80%`，需要匹配的可选子句数量计算为 4 &middot; 0.8 = 3.2，然后向下取整为 3。因此，结果中包含至少匹配三个子句的文档：

```json
{
  "took": 40,
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
    "max_score": 2.494999,
    "hits": [
      {
        "_index": "testindex",
        "_id": "4",
        "_score": 2.494999,
        "_source": {
          "text": "one two three four OpenSearch"
        }
      },
      {
        "_index": "testindex",
        "_id": "3",
        "_score": 1.5744598,
        "_source": {
          "text": "one two three OpenSearch"
        }
      }
    ]
  }
}
```

现在将 `minimum_should_match` 指定为 `-20%`：

```json
GET testindex/_search
{
  "query": {
    "bool": {
      "must": [
        {
          "match": {
            "text": "OpenSearch"
          }
        }
      ], 
      "should": [
        {
          "match": {
            "text": "one"
          }
        },
        {
          "match": {
            "text": "two"
          }
        },
        {
          "match": {
            "text": "three"
          }
        },
        {
          "match": {
            "text": "four"
          }
        }
      ],
      "minimum_should_match": "-20%"
    }
  }
}
```

文档可以不匹配的可选子句数量计算为 4 &middot; 0.2 = 0.8，然后向下取整为 0。因此，结果中只包含一个匹配所有可选子句的文档：

```json
{
  "took": 41,
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
    "max_score": 2.494999,
    "hits": [
      {
        "_index": "testindex",
        "_id": "4",
        "_score": 2.494999,
        "_source": {
          "text": "one two three four OpenSearch"
        }
      }
    ]
  }
}
```

请注意，指定正百分比（`80%`）和负百分比（`-20%`）并没有得到相同的文档必须匹配的可选子句数量，因为在这两种情况下，结果都进行了向下取整。例如，如果可选子句数量为 5，那么 `80%` 和 `-20%` 会得到相同的文档必须匹配的可选子句数量（4）。

### `minimum_should_match` 的默认值 

如果查询包含 `must` 或 `filter` 子句，则 `minimum_should_match` 的默认值为 0。例如，以下查询搜索匹配 `OpenSearch` 且匹配 0 个可选 `should` 子句的文档：

```json
GET testindex/_search
{
  "query": {
    "bool": {
      "must": [
        {
          "match": {
            "text": "OpenSearch"
          }
        }
      ], 
      "should": [
        {
          "match": {
            "text": "one"
          }
        },
        {
          "match": {
            "text": "two"
          }
        },
        {
          "match": {
            "text": "three"
          }
        },
        {
          "match": {
            "text": "four"
          }
        }
      ]
    }
  }
}
```

该查询返回索引中的全部五个文档：

```json
{
  "took": 34,
  "timed_out": false,
  "_shards": {
    "total": 1,
    "successful": 1,
    "skipped": 0,
    "failed": 0
  },
  "hits": {
    "total": {
      "value": 5,
      "relation": "eq"
    },
    "max_score": 2.494999,
    "hits": [
      {
        "_index": "testindex",
        "_id": "4",
        "_score": 2.494999,
        "_source": {
          "text": "one two three four OpenSearch"
        }
      },
      {
        "_index": "testindex",
        "_id": "3",
        "_score": 1.5744598,
        "_source": {
          "text": "one two three OpenSearch"
        }
      },
      {
        "_index": "testindex",
        "_id": "2",
        "_score": 0.91368985,
        "_source": {
          "text": "one two OpenSearch"
        }
      },
      {
        "_index": "testindex",
        "_id": "1",
        "_score": 0.4338556,
        "_source": {
          "text": "one OpenSearch"
        }
      },
      {
        "_index": "testindex",
        "_id": "5",
        "_score": 0.11964063,
        "_source": {
          "text": "OpenSearch"
        }
      }
    ]
  }
}
```

但是，如果省略 `must` 子句，则查询会搜索匹配一个可选 `should` 子句的文档：

```json
GET testindex/_search
{
  "query": {
    "bool": {
      "should": [
        {
          "match": {
            "text": "one"
          }
        },
        {
          "match": {
            "text": "two"
          }
        },
        {
          "match": {
            "text": "three"
          }
        },
        {
          "match": {
            "text": "four"
          }
        }
      ]
    }
  }
}
```

结果中只包含至少匹配一个可选子句的四个文档：

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
      "value": 4,
      "relation": "eq"
    },
    "max_score": 2.426633,
    "hits": [
      {
        "_index": "testindex",
        "_id": "4",
        "_score": 2.426633,
        "_source": {
          "text": "one two three four OpenSearch"
        }
      },
      {
        "_index": "testindex",
        "_id": "3",
        "_score": 1.4978898,
        "_source": {
          "text": "one two three OpenSearch"
        }
      },
      {
        "_index": "testindex",
        "_id": "2",
        "_score": 0.8266785,
        "_source": {
          "text": "one two OpenSearch"
        }
      },
      {
        "_index": "testindex",
        "_id": "1",
        "_score": 0.3331056,
        "_source": {
          "text": "one OpenSearch"
        }
      }
    ]
  }
}
```
