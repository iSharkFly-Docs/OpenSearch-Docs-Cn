---
title: Script score
---

# Script score 查询

使用 `script_score` 查询可以通过脚本自定义评分计算方式。对于开销较大的评分函数，可以使用 `script_score` 查询只为经过过滤后返回的文档（Document）计算评分。

## 示例

例如，以下请求创建一个包含一个文档的索引（Index）：

```json
PUT testindex1/_doc/1
{
  "name": "John Doe",
  "multiplier": 0.5
}
```

你可以使用 `match` 查询返回 `name` 字段中包含 `John` 的所有文档：

```json
GET testindex1/_search
{
  "query": {
    "match": {
      "name": "John"
    }
  }
}
```

在响应中，文档 1 的评分为 `0.2876821`：

```json
{
  "took": 7,
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
    "max_score": 0.2876821,
    "hits": [
      {
        "_index": "testindex1",
        "_id": "1",
        "_score": 0.2876821,
        "_source": {
          "name": "John Doe",
          "multiplier": 0.5
        }
      }
    ]
  }
}
```

现在，我们使用一个脚本来更改文档评分，该脚本将评分计算为 `_score` 字段的值乘以 `multiplier` 字段的值。在以下查询中，可以通过 `_score` 变量访问文档当前的相关性评分（Relevance Score），并通过 `doc['multiplier'].value` 访问 `multiplier` 的值：

```json
GET testindex1/_search
{
  "query": {
    "script_score": {
      "query": {
        "match": { 
            "name": "John" 
        }
      },
      "script": {
        "source": "_score * doc['multiplier'].value"
      }
    }
  }
}
```

在响应中，文档 1 的评分是原始评分的一半：

```json
{
  "took": 8,
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
    "max_score": 0.14384104,
    "hits": [
      {
        "_index": "testindex1",
        "_id": "1",
        "_score": 0.14384104,
        "_source": {
          "name": "John Doe",
          "multiplier": 0.5
        }
      }
    ]
  }
}
```

## 参数

`script_score` 查询支持以下顶层参数。

参数 | 数据类型 | 描述
:--- | :--- | :---
`query` | Object | 用于搜索的查询。必需。
`script` | Object | 用于计算 `query` 返回的文档评分的脚本。必需。
`min_score` | Float | 从结果中排除评分低于 `min_score` 的文档。可选。
`boost` | Float | 按给定的倍数提升文档评分。小于 1.0 的值会降低相关性，大于 1.0 的值会提高相关性。默认值为 1.0。 

::: warning 重要
`script_score` 查询计算出的相关性评分不能为负数。 
:::

## 使用内置函数自定义评分计算

要自定义评分计算，可以使用某个内置的 Painless 函数。对于每个函数，OpenSearch 都提供了一个或多个可以在 script score 上下文中访问的 Painless 方法。你可以直接调用以下各节中列出的 Painless 方法，而无需使用类名或实例名限定符。

### Saturation

saturation 函数按 `score = value /(value + pivot)` 计算饱和度，其中 `value` 是字段值，`pivot` 的选取应使得当 `value` 大于 `pivot` 时评分大于 0.5，当 `value` 小于 `pivot` 时评分小于 0.5。评分位于 (0, 1) 范围内。要应用 saturation 函数，请调用以下 Painless 方法：

- `double saturation(double <field-value>, double <pivot>)`
    
#### 示例 {#example-1}

以下示例查询在 `articles` 索引中搜索文本 `neural search`。它将文档的原始相关性评分与 `article_rank` 值相结合，其中 `article_rank` 值先经过 saturation 函数转换：

```json
GET articles/_search
{
  "query": {
    "script_score": {
      "query": {
        "match": { "article_name": "neural search" }
      },
      "script" : {
        "source" : "_score + saturation(doc['article_rank'].value, 11)"
      }
    }
  }
}
```

### Sigmoid

与 saturation 函数类似，sigmoid 函数按 `score = value^exp/ (value^exp + pivot^exp)` 计算评分，其中 `value` 是字段值，`exp` 是指数缩放因子，`pivot` 的选取应使得当 `value` 大于 `pivot` 时评分大于 0.5，当 `value` 小于 `pivot` 时评分小于 0.5。要应用 sigmoid 函数，请调用以下 Painless 方法：

- `double sigmoid(double <field-value>, double <pivot>, double <exp>)`

#### 示例 {#example-2}

以下示例查询在 `articles` 索引中搜索文本 `neural search`。它将文档的原始相关性评分与 `article_rank` 值相结合，其中 `article_rank` 值先经过 sigmoid 函数转换：

```json
GET articles/_search
{
  "query": {
    "script_score": {
      "query": {
        "match": { "article_name": "neural search" }
      },
      "script" : {
        "source" : "_score + sigmoid(doc['article_rank'].value, 11, 2)"
      }
    }
  }
}
```

### Random score

random score 函数生成在 [0, 1) 范围内均匀分布的随机评分。要了解该函数的工作原理，请参阅 [random score 函数](/query-dsl/compound/function-score#the-random-score-function)。要应用 random score 函数，请调用以下 Painless 方法之一：

- `double randomScore(int <seed>)`：使用 Lucene 内部文档 ID 作为种子值。
- `double randomScore(int <seed>, String <field-name>)`

#### 示例 {#example-3}

以下查询使用带有 `seed` 和 `field` 的 `random_score` 函数：

```json
GET articles/_search
{
  "query": {
    "script_score": {
      "query": {
        "match": { "article_name": "neural search" }
      },
      "script" : {
          "source" : "randomScore(20, '_seq_no')"
      }
    }
  }
}
```

### 衰减函数

使用衰减函数（Decay Function），可以根据距离远近或时间新旧为结果评分。更多信息，请参阅[衰减函数](/query-dsl/compound/function-score#decay-functions)。你可以使用指数、高斯或线性衰减曲线计算评分。要应用衰减函数，请根据字段类型调用以下 Painless 方法之一：

- [数值](/field-types/supported-field-types/numeric)字段： 
    - `double decayNumericGauss(double <origin>, double <scale>, double <offset>, double <decay>, double <field-value>)`
    - `double decayNumericExp(double <origin>, double <scale>, double <offset>, double <decay>, double <field-value>)`
    - `double decayNumericLinear(double <origin>, double <scale>, double <offset>, double <decay>, double <field-value>)`
- [Geopoint](/field-types/supported-field-types/geo-point) 字段： 
    - `double decayGeoGauss(String <origin>, String <scale>, String <offset>, double <decay>, GeoPoint <field-value>)`
    - `double decayGeoExp(String <origin>, String <scale>, String <offset>, double <decay>, GeoPoint <field-value>)`
    - `double decayGeoLinear(String <origin>, String <scale>, String <offset>, double <decay>, GeoPoint <field-value>)`
- [日期](/field-types/supported-field-types/date)字段： 
    - `double decayDateGauss(String <origin>, String <scale>, String <offset>, double <decay>, JodaCompatibleZonedDateTime <field-value>)`
    - `double decayDateExp(String <origin>, String <scale>, String <offset>, double <decay>, JodaCompatibleZonedDateTime <field-value>)`
    - `double decayDateLinear(String <origin>, String <scale>, String <offset>, double <decay>, JodaCompatibleZonedDateTime <field-value>)`

#### 示例：数值字段

以下查询对数值字段使用指数衰减函数：

```json
GET articles/_search
{
  "query": {
    "script_score": {
      "query": {
        "match": {
          "article_name": "neural search"
        }
      },
      "script": {
        "source": "decayNumericExp(params.origin, params.scale, params.offset, params.decay, doc['article_rank'].value)",
        "params": {
          "origin": 50,
          "scale": 20,
          "offset": 30,
          "decay": 0.5
        }
      }
    }
  }
}
```

#### 示例：Geopoint 字段

以下查询对 geopoint 字段使用高斯衰减函数：

```json
GET hotels/_search
{
  "query": {
    "script_score": {
      "query": {
        "match": {
          "name": "hotel"
        }
      },
      "script": {
        "source": "decayGeoGauss(params.origin, params.scale, params.offset, params.decay, doc['location'].value)",
        "params": {
          "origin": "40.71,74.00",
          "scale":  "300ft",
          "offset": "200ft",
          "decay": 0.25
        }
      }
    }
  }
}
```

#### 示例：日期字段

以下查询对日期字段使用线性衰减函数：

```json
GET blogs/_search
{
  "query": {
    "script_score": {
      "query": {
        "match": {
          "name": "opensearch"
        }
      },
      "script": {
        "source": "decayDateLinear(params.origin, params.scale, params.offset, params.decay, doc['date_posted'].value)",
        "params": {
          "origin":  "2022-04-24",
          "scale":  "6d",
          "offset": "1d",
          "decay": 0.25
        }
      }
    }
  }
}
```

### 词频函数

词频函数（Term Frequency Function）在评分脚本源代码中公开词项级统计信息。你可以使用这些统计信息实现自定义的信息检索和排名算法，例如在查询时按热度对评分进行乘法或加法权重提升（boost）。要应用词频函数，请调用以下 Painless 方法之一：

- `int termFreq(String <field-name>, String <term>)`：获取特定词项在字段中的词频。
- `long totalTermFreq(String <field-name>, String <term>)`：获取特定词项在字段中的总词频。
- `long sumTotalTermFreq(String <field-name>)`：获取字段中所有总词频之和。

#### 示例 {#example-4}

以下查询将评分计算为 `fields` 列表中每个字段的总词频乘以 `multiplier` 值：

```json
GET /demo_index_v1/_search
{
  "query": {
    "function_score": {
      "query": {
        "match_all": {}
      },
      "script_score": {
        "script": {
          "source": """
            for (int x = 0; x < params.fields.length; x++) {
              String field = params.fields[x];
              if (field != null) {
                return params.multiplier * totalTermFreq(field, params.term);
              }
            }
            return params.default_value;
            
          """,
          "params": {
              "fields": ["title", "description"],
              "term": "ai",
              "multiplier": 2,
              "default_value": 1
          }
        }
      }
    }
  }
}
```

::: warning 重要
如果 [`search.allow_expensive_queries`](/query-dsl/#expensive-queries) 设置为 `false`，则不会执行 `script_score` 查询。
:::
