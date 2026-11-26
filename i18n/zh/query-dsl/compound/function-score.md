---
title: 函数评分
---

# 函数评分查询

如果需要改变结果中返回文档的相关性评分（Relevance Score），可以使用 `function_score` 查询（Query）。`function_score` 查询定义一个查询以及一个或多个函数，这些函数可以应用于全部结果或部分结果，以重新计算它们的相关性评分。

## 使用一个评分函数

`function_score` 查询最基本的示例是使用一个函数重新计算评分。以下查询使用 `weight` 函数将所有相关性评分翻倍。由于 `function_score` 中未指定 `query` 参数，该函数会应用于结果中的所有文档（Document）：

```json
GET shakespeare/_search
{
  "query": {
    "function_score": {
      "weight": "2"
    }
  }
}
```

## 将评分函数应用于部分文档

要将评分函数应用于部分文档，请在函数中提供一个查询：

```json
GET shakespeare/_search
{
  "query": {
    "function_score": {
      "query": { 
        "match": {
          "play_name": "Hamlet"
        } 
      },
      "weight": "2"
    }
  }
}
```

## 支持的函数

`function_score` 查询类型支持以下函数：

- 内置函数：
    - `weight`：将文档评分乘以预定义的权重提升（boost）系数。
    - `random_score`：提供一个随机评分，该评分对同一用户保持一致，但对不同用户各不相同。
    - `field_value_factor`：使用指定文档字段的值重新计算评分。 
    - 衰减函数（`gauss`、`exp` 和 `linear`）：使用指定的衰减函数重新计算评分。
- 自定义函数：
    - `script_score`：使用脚本为文档评分。

## weight 函数

使用 `weight` 函数时，原始相关性评分会乘以 `weight` 的浮点值：

```json
GET shakespeare/_search
{
  "query": {
    "function_score": {
      "weight": "2"
    }
  }
}
```

与 `boost` 值不同，`weight` 函数不会被归一化。

## random score 函数

`random_score` 函数提供一个随机评分，该评分对同一用户保持一致，但对不同用户各不相同。评分是 [0, 1) 范围内的浮点数。默认情况下，`random_score` 函数使用 Lucene 内部文档 ID 作为种子值，由于文档在合并后可能会被重新编号，因此随机值不可复现。为了使生成的随机值保持一致，可以提供 `seed` 和 `field` 参数。`field` 必须是启用了 `fielddata` 的字段（通常是数值字段）。评分使用 `seed`、`field` 的 `fielddata` 值，以及根据索引名称和分片（Shard）ID 计算出的盐值来计算。由于位于同一分片中的文档具有相同的索引名称和分片 ID，因此 `field` 值相同的文档会被分配相同的评分。要确保同一分片中的所有文档获得不同的评分，请使用一个对所有文档都具有唯一值的 `field`。一种选择是使用 `_seq_no` 字段。但如果选择该字段，当文档更新时，评分可能会因相应的 `_seq_no` 更新而发生变化。

以下查询使用带有 `seed` 和 `field` 的 `random_score` 函数：

```json
GET blogs/_search
{
  "query": {
    "function_score": {
      "random_score": {
        "seed": 20,
        "field": "_seq_no"
      }
    }
  }
}
```

## field value factor 函数

`field_value_factor` 函数使用指定文档字段的值重新计算评分。如果该字段是多值字段，则只使用其第一个值进行计算，其他值不予考虑。 

`field_value_factor` 函数支持以下选项：

- `field`：用于评分计算的字段。

- `factor`：一个可选系数，字段值会乘以该系数。默认值为 1。

- `modifier`：应用于字段值 $$v$$ 的修饰符之一。下表列出了所有支持的修饰符。
    
    修饰符 | 公式 | 描述
    :--- | :--- | :---
    `log`| $$\log v$$ | 取该值以 10 为底的对数。对非正数取对数是非法操作，会导致错误。对于介于 0（不含）和 1（含）之间的值，该函数返回的非负值会导致错误。建议使用 `log1p` 或 `log2p` 代替 `log`。
    `log1p`| $$\log (1 + v)$$ | 取 1 与该值之和以 10 为底的对数。
    `log2p`| $$\log (2 + v)$$ | 取 2 与该值之和以 10 为底的对数。
    `ln`| $$\ln v$$ | 取该值的自然对数。对非正数取对数是非法操作，会导致错误。对于介于 0（不含）和 1（含）之间的值，该函数返回的非负值会导致错误。建议使用 `ln1p` 或 `ln2p` 代替 `ln`。
    `ln1p`| $$\ln (1 + v)$$ | 取 1 与该值之和的自然对数。
    `ln2p`| $$\ln (2 + v)$$ | 取 2 与该值之和的自然对数。
    `reciprocal`| $$\frac {1}{v}$$ | 取该值的倒数。
    `square`| $$v^2$$ | 取该值的平方。
    `sqrt`| $$\sqrt v$$ | 取该值的平方根。对负数取平方根是非法操作，会导致错误。请确保 $$v$$ 为非负数。
    `none`| N/A | 不应用任何修饰符。

- `missing`：文档中缺少该字段时使用的值。`factor` 和 `modifier` 会应用于该值，而不是缺失的字段值。

例如，以下查询使用 `field_value_factor` 函数为 `views` 字段赋予更高的权重：

```json
GET blogs/_search
{
  "query": {
    "function_score": {
      "field_value_factor": {
        "field": "views",
        "factor": 1.5,
        "modifier": "log1p",
        "missing": 1
      }
    }
  }
}
```

上述查询使用以下公式计算相关性评分：

$$ \text{score} = \text{original score} \cdot \log(1 + 1.5 \cdot \text{views}) $$

## script score 函数

使用 `script_score` 函数，可以编写自定义脚本为文档评分，并可选择性地结合文档中字段的值。原始相关性评分可以通过 `_score` 变量访问。 

::: warning 重要
计算出的评分不能为负数，负评分会导致错误。文档评分是正的 32 位浮点值，精度更高的评分会被转换为最接近的 32 位浮点数。
:::

例如，以下查询使用 `script_score` 函数，根据原始评分以及博客文章的浏览数和点赞数来计算评分。为了降低浏览数和点赞数的权重，该公式取浏览数与点赞数之和的对数。为了在浏览数和点赞数为 `0` 时对数仍然有效，会在它们的和上加 `1`：

```json
GET blogs/_search
{
  "query": {
    "function_score": {
      "query": {"match": {"name": "opensearch"}},
      "script_score": {
        "script": "_score * Math.log(1 + doc['likes'].value + doc['views'].value)"
      }
    }
  }
}
```

脚本会被编译和缓存以提升性能。因此，最好复用同一个脚本，并传入脚本所需的任何参数：

```json
GET blogs/_search
{
  "query": {
    "function_score": {
      "query": {
        "match": { "name": "opensearch" }
      },
      "script_score": {
        "script": {
          "params": {
            "add": 1
          },
          "source": "_score * Math.log(params.add + doc['likes'].value + doc['views'].value)"
        }
      }
    }
  }
}
```

## 衰减函数

在许多应用中，需要根据邻近程度或时间远近对结果进行排序，这可以通过衰减函数实现。衰减函数使用以下三种衰减曲线之一计算文档评分：高斯（Gaussian）、指数（exponential）或线性（linear）。 

::: warning 重要
衰减函数只能作用于[数值](/field-types/supported-field-types/numeric)、[日期](/field-types/supported-field-types/dates)和 [geopoint](/field-types/supported-field-types/geo-point) 字段。
:::

衰减函数根据 `origin`、`scale`、`offset` 和 `decay` 计算评分，如下图所示。

<img src="/images/decay-functions.png" alt="Decay function curves" width="600">

### 示例：geopoint 字段

假设你正在寻找一家离办公室较近的酒店。你创建了一个 `hotels` 索引（Index），并将 `location` 字段映射为 geopoint：

```json
PUT hotels
{
  "mappings": {
    "properties": {
      "location": {
        "type": "geo_point"
      }
    }
  }
}
```

你索引了两个文档，分别对应附近的两家酒店：

```json
PUT hotels/_doc/1
{
  "name": "Hotel Within 200",
  "location": { 
    "lat": 40.7105,
    "lon": 74.00
  }
}
```

```json
PUT hotels/_doc/2
{
  "name": "Hotel Outside 500",
  "location": { 
    "lat": 40.7115,
    "lon": 74.00
  }
}
```

`origin` 定义计算距离的起点（办公室位置）。`offset` 指定距起点的一段距离，在该距离之内的文档都会获得满分 1。你可以为距离办公室 200 英尺以内的酒店赋予相同的最高评分。`scale` 定义图形的衰减速率，`decay` 定义距起点 `scale` + `offset` 距离处的文档所获得的评分。超出 200 英尺半径后，你可能会决定：如果还要再走 300 英尺才能到达某家酒店（`scale` = 300 英尺），就为它分配原始评分的四分之一（`decay` = 0.25）。

你创建了以下查询，`origin` 位于 (74.00, 40.71)：

```json
GET hotels/_search
{
  "query": {
    "function_score": {
      "functions": [
        {
          "exp": {
            "location": { 
              "origin": "40.71,74.00",
              "offset": "200ft",
              "scale":  "300ft",
              "decay": 0.25
            }
          }
        }
      ]
    }
  }
}
```

响应中包含这两家酒店。距离办公室 200 英尺以内的酒店评分为 1，而位于 500 英尺半径之外的酒店评分为 0.20，低于 `decay` 参数 0.25：

<details open markdown="block">
  <summary>
    响应
  </summary>

```json
{
  "took": 854,
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
    "max_score": 1,
    "hits": [
      {
        "_index": "hotels",
        "_id": "1",
        "_score": 1,
        "_source": {
          "name": "Hotel Within 200",
          "location": {
            "lat": 40.7105,
            "lon": 74
          }
        }
      },
      {
        "_index": "hotels",
        "_id": "2",
        "_score": 0.20099315,
        "_source": {
          "name": "Hotel Outside 500",
          "location": {
            "lat": 40.7115,
            "lon": 74
          }
        }
      }
    ]
  }
}
```
</details>

### 参数

下表列出了 `gauss`、`exp` 和 `linear` 函数支持的所有参数。

参数 | 描述
:--- | :---
`origin` | 计算距离的起点。对于数值字段，必须以数字形式提供；对于日期字段，以日期形式提供；对于 geopoint 字段，以 geopoint 形式提供。对 geopoint 和数值字段为必需，对日期字段为可选（默认值为 `now`）。日期字段支持日期数学表达式（例如 `now-2d`）。
`offset` | 定义距起点的一段距离，在该距离之内的文档评分为 1。可选。默认值为 0。
`scale` | 距 `origin` 为 `scale` + `offset` 距离处的文档会被分配 `decay` 评分。必需。<br>对于数值字段，`scale` 可以是任意数字。<br>对于日期字段，`scale` 可以定义为带[单位](/api-reference/units)的数字（`5h`、`1d`）。如果未提供单位，`scale` 默认以毫秒为单位。<br>对于 geopoint 字段，`scale` 可以定义为带[单位](/api-reference/units)的数字（`1mi`、`5km`）。如果未提供单位，`scale` 默认以米为单位。
`decay` | 定义距 `origin` 为 `scale` + `offset` 距离处的文档评分。可选。默认值为 0.5。

::: info 注意
对于文档中缺失的字段，衰减函数返回的评分为 1。
:::

### 示例：数值字段

以下查询使用指数衰减函数，按评论数对博客文章进行优先级排序：

```json
GET blogs/_search
{
  "query": {
    "function_score": {
      "functions": [
        {
          "exp": {
            "comments": { 
              "origin":  "20",
              "offset": "5",
              "scale":  "10"
            }
          }
        }
      ]
    }
  }
}
```

结果中的前两篇博客文章评分为 1，因为其中一篇位于起点（20），另一篇距离为 16，处于 offset 范围之内（文档获得满分的范围计算为 20 $$\pm$$ 5，即 [15, 25]）。第三篇博客文章距 `origin` 为 `scale` + `offset` 距离（20 &minus; (5 + 10) = 15），因此获得默认的 `decay` 评分（0.5）：

<details open markdown="block">
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
      "value": 4,
      "relation": "eq"
    },
    "max_score": 1,
    "hits": [
      {
        "_index": "blogs",
        "_id": "1",
        "_score": 1,
        "_source": {
          "name": "Semantic search in OpenSearch",
          "views": 1200,
          "likes": 150,
          "comments": 16,
          "date_posted": "2022-04-17"
        }
      },
      {
        "_index": "blogs",
        "_id": "2",
        "_score": 1,
        "_source": {
          "name": "Get started with OpenSearch 2.7",
          "views": 1400,
          "likes": 100,
          "comments": 20,
          "date_posted": "2022-05-02"
        }
      },
      {
        "_index": "blogs",
        "_id": "3",
        "_score": 0.5,
        "_source": {
          "name": "Distributed tracing with Data Prepper",
          "views": 800,
          "likes": 50,
          "comments": 5,
          "date_posted": "2022-04-25"
        }
      },
      {
        "_index": "blogs",
        "_id": "4",
        "_score": 0.4352753,
        "_source": {
          "name": "A very old blog",
          "views": 100,
          "likes": 20,
          "comments": 3,
          "date_posted": "2000-04-25"
        }
      }
    ]
  }
}
```
</details>

### 示例：日期字段

以下查询使用高斯衰减函数，优先返回在 04/24/2002 前后发布的博客文章：

```json
GET blogs/_search
{
  "query": {
    "function_score": {
      "functions": [
        {
          "gauss": {
            "date_posted": { 
              "origin":  "2022-04-24",
              "offset": "1d",
              "scale":  "6d",
              "decay": 0.25
            }
          }
        }
      ]
    }
  }
}
```

在结果中，第一篇博客文章发布于 04/24/2022 前后一天以内，因此具有最高评分 1。第二篇博客文章发布于 04/17/2022，处于 `offset` + `scale`（`1d` + `6d`）范围内，因此评分等于 `decay`（0.25）。第三篇博客文章发布于 04/24/2022 之后 7 天以上，因此评分较低。最后一篇博客文章发布于多年前，因此评分为 0：

<details open markdown="block">
  <summary>
    响应
  </summary>

```json
{
  "took": 2,
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
    "max_score": 1,
    "hits": [
      {
        "_index": "blogs",
        "_id": "3",
        "_score": 1,
        "_source": {
          "name": "Distributed tracing with Data Prepper",
          "views": 800,
          "likes": 50,
          "comments": 5,
          "date_posted": "2022-04-25"
        }
      },
      {
        "_index": "blogs",
        "_id": "1",
        "_score": 0.25,
        "_source": {
          "name": "Semantic search in OpenSearch",
          "views": 1200,
          "likes": 150,
          "comments": 16,
          "date_posted": "2022-04-17"
        }
      },
      {
        "_index": "blogs",
        "_id": "2",
        "_score": 0.15154076,
        "_source": {
          "name": "Get started with OpenSearch 2.7",
          "views": 1400,
          "likes": 100,
          "comments": 20,
          "date_posted": "2022-05-02"
        }
      },
      {
        "_index": "blogs",
        "_id": "4",
        "_score": 0,
        "_source": {
          "name": "A very old blog",
          "views": 100,
          "likes": 20,
          "comments": 3,
          "date_posted": "2000-04-25"
        }
      }
    ]
  }
}
```
</details>

### 多值字段

如果为衰减计算指定的字段包含多个值，可以使用 `multi_value_mode` 参数。该参数指定以下函数之一，用于确定参与计算的字段值：

- `min`：（默认）距 `origin` 的最小距离。 
- `max`：距 `origin` 的最大距离。
- `avg`：距 `origin` 的平均距离。
- `sum`：距 `origin` 的所有距离之和。

例如，你索引了一个包含距离数组的文档：

```json
PUT testindex/_doc/1
{
  "distances": [1, 2, 3, 4, 5]
}
```

以下查询使用多值字段 `distances` 的 `max` 距离来计算衰减：

```json
GET testindex/_search
{
  "query": {
    "function_score": {
      "functions": [
        {
          "exp": {
            "distances": { 
              "origin":  "6",
              "offset": "5",
              "scale":  "1"
            },
            "multi_value_mode": "max"
          }
        }
      ]
    }
  }
}
```

由于距起点的最大距离（1）处于距 `origin` 的 `offset` 范围之内，该文档获得评分 1：

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
    "max_score": 1,
    "hits": [
      {
        "_index": "testindex",
        "_id": "1",
        "_score": 1,
        "_source": {
          "distances": [
            1,
            2,
            3,
            4,
            5
          ]
        }
      }
    ]
  }
}
```

### 衰减曲线计算

以下公式定义了各种衰减函数的评分计算方式（$$v$$ 表示文档字段值）。

**高斯（Gaussian）**
    
$$ \text{score} = \exp \left(-\frac {(\max(0, \lvert v - \text{origin} \rvert - \text{offset}))^2} {2\sigma^2} \right), $$

其中 $$\sigma$$ 的计算方式确保在距 `origin` 为 `offset` + `scale` 距离处的评分等于 `decay`：

$$ \sigma^2 = - \frac {\text{scale}^2} {2 \ln(\text{decay})} $$

**指数（Exponential）**

$$ \text{score} = \exp (\lambda \cdot \max(0, \lvert v - \text{origin} \rvert - \text{offset})),$$

其中 $$\lambda$$ 的计算方式确保在距 `origin` 为 `offset` + `scale` 距离处的评分等于 `decay`：

$$\lambda = \frac {\ln(\text{decay})} {\text{scale}} $$

**线性（Linear）**

$$ \text{score} = \max \left(\frac {s - \max(0, \lvert v - \text{origin} \rvert - \text{offset})} {s} \right), $$

其中 $$s$$ 的计算方式确保在距 `origin` 为 `offset` + `scale` 距离处的评分等于 `decay`：

$$s = \frac {\text{scale}} {1 - \text{decay}}$$

## 使用多个评分函数

可以在函数评分查询的 `functions` 数组中列出多个评分函数。 

### 合并多个函数的评分

不同的函数可能使用不同的评分尺度。例如，`random_score` 函数提供介于 0 和 1 之间的评分，而 `field_value_factor` 的评分没有特定的尺度。此外，你可能希望对不同函数给出的评分赋予不同的权重。要调整不同函数的评分，可以为每个函数指定 `weight` 参数，每个函数给出的评分会乘以 `weight`，得到该函数的最终评分。`weight` 参数必须在 `functions` 数组中提供，以便与 [weight 函数](#the-weight-function)区分开来。

各函数给出的评分通过 `score_mode` 参数进行合并，该参数可取以下值之一：

- `multiply`：（默认）将各评分相乘。
- `sum`：将各评分相加。
- `avg`：取各评分的平均值。如果指定了 `weight`，则为[加权平均值](https://en.wikipedia.org/wiki/Weighted_arithmetic_mean)。例如，如果权重为 $$1$$ 的第一个函数返回评分 $$10$$，权重为 $$4$$ 的第二个函数返回评分 $$20$$，则平均值计算为 $$\frac {10 \cdot 1 + 20 \cdot 4}{1 + 4} = 18$$。
- `first`：取第一个具有匹配过滤器的函数的评分。
- `max`：取最大评分。
- `min`：取最小评分。

### 指定评分上限

可以在 `max_boost` 参数中为函数评分指定上限。默认上限为 `float` 值的最大量级：(2 &minus; 2<sup>&minus;23</sup>) &middot; 2<sup>127</sup>。

### 将所有函数的评分与查询评分合并

可以在 `boost_mode` 参数中指定如何将所有函数计算出的评分与查询评分合并，该参数可取以下值之一：

- `multiply`：（默认）将查询评分乘以函数评分。
- `replace`：忽略查询评分，使用函数评分。
- `sum`：将查询评分与函数评分相加。
- `avg`：取查询评分与函数评分的平均值。
- `max`：取查询评分与函数评分中的较大者。
- `min`：取查询评分与函数评分中的较小者。

### 过滤未达到阈值的文档 {#filtering-documents-that-dont-meet-a-threshold}

更改相关性评分不会改变匹配文档的列表。要排除一些未达到阈值的文档，请在 `min_score` 参数中指定阈值。查询返回的所有文档都会先计算评分，然后使用该阈值进行过滤。

### 示例

以下请求搜索包含 "OpenSearch Data Prepper" 这些单词的博客文章，优先返回在 04/24/2022 前后发布的文章，同时也会考虑浏览数和点赞数。最后，将截止阈值设置为评分 10：

```json
GET blogs/_search
{
  "query": {
    "function_score": {
      "boost": "5", 
      "functions": [
        {
          "gauss": {
            "date_posted": {
              "origin": "2022-04-24",
              "offset": "1d",
              "scale": "6d"
            }
          }, 
          "weight": 1
        },
        {
          "gauss": {
            "likes": {
              "origin": 200,
              "scale": 200
            }
          }, 
          "weight": 4
        },
        {
          "gauss": {
            "views": {
              "origin": 1000,
              "scale": 800
            }
          }, 
          "weight": 2
        }
      ],
      "query": {
        "match": {
          "name": "opensearch data prepper"
        }
      },
      "max_boost": 10,
      "score_mode": "max",
      "boost_mode": "multiply",
      "min_score": 10
    }
  }
}
```

结果中包含三篇匹配的博客文章：

<details open markdown="block">
  <summary>
    响应
  </summary>

```json
{
  "took": 14,
  "timed_out": false,
  "_shards": {
    "total": 1,
    "successful": 1,
    "skipped": 0,
    "failed": 0
  },
  "hits": {
    "total": {
      "value": 3,
      "relation": "eq"
    },
    "max_score": 31.191923,
    "hits": [
      {
        "_index": "blogs",
        "_id": "3",
        "_score": 31.191923,
        "_source": {
          "name": "Distributed tracing with Data Prepper",
          "views": 800,
          "likes": 50,
          "comments": 5,
          "date_posted": "2022-04-25"
        }
      },
      {
        "_index": "blogs",
        "_id": "1",
        "_score": 13.907352,
        "_source": {
          "name": "Semantic search in OpenSearch",
          "views": 1200,
          "likes": 150,
          "comments": 16,
          "date_posted": "2022-04-17"
        }
      },
      {
        "_index": "blogs",
        "_id": "2",
        "_score": 11.150461,
        "_source": {
          "name": "Get started with OpenSearch 2.7",
          "views": 1400,
          "likes": 100,
          "comments": 20,
          "date_posted": "2022-05-02"
        }
      }
    ]
  }
}
```
</details>
