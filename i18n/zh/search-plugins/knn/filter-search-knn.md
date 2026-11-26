---
title: 带过滤器的 k-NN 搜索
---

# 带过滤器的 k-NN 搜索

为了细化 k-NN 结果，你可以使用以下方法之一对 k-NN 搜索进行过滤：

- [高效 k-NN 过滤](#efficient-k-nn-filtering)：这种方法在 k-NN 搜索*期间*应用过滤，而不是在 k-NN 搜索之前或之后，从而确保返回 `k` 个结果（如果总结果数至少为 `k` 个）。以下引擎支持这种方法：
  - 使用分层可导航小世界（Hierarchical Navigable Small World，HNSW）算法的 Lucene 引擎（k-NN 插件 2.4 及更高版本）
  - 使用 HNSW 算法（k-NN 插件 2.9 及更高版本）或 IVF 算法（k-NN 插件 2.10 及更高版本）的 Faiss 引擎

-  [后过滤](#post-filtering)：由于过滤在 k-NN 搜索之后执行，对于限制性较强的过滤器，这种方法返回的结果可能远少于 `k` 个。这种方法可以使用以下两种过滤策略：
    - [布尔后过滤器](#boolean-filter-with-ann-search)：这种方法先运行[近似最近邻（ANN）](/search-plugins/knn/approximate-knn)搜索，然后对结果应用过滤器。两个查询部分独立执行，然后根据查询中提供的查询运算符（`should`、`must` 等）合并结果。
    - [`post_filter` 参数](#post-filter-parameter)：这种方法先对完整数据集运行 [ANN](/search-plugins/knn/approximate-knn) 搜索，然后对 k-NN 结果应用过滤器。

- [评分脚本过滤器](#scoring-script-filter)：这种方法先对文档集进行预过滤，然后对过滤后的子集运行精确 k-NN 搜索。它的延迟可能较高，并且在过滤后的子集较大时无法扩展。

下表总结了上述过滤用例。

过滤器 | 何时应用过滤器 | 搜索类型 | 支持的引擎和方法 | `filter` 子句的放置位置
:--- | :--- | :--- | :---
高效 k-NN 过滤 | 搜索期间（预过滤与后过滤的混合） | 近似 | - `lucene`（`hnsw`） <br> - `faiss`（`hnsw`、`ivf`） | 在 k-NN 查询子句内部。
布尔过滤器 | 搜索之后（后过滤） | 近似 | - `lucene`<br> - `nmslib`<br> - `faiss` | 在 k-NN 查询子句外部。必须是叶子句。
`post_filter` 参数 | 搜索之后（后过滤） | 近似 | - `lucene`<br> - `nmslib`<br> - `faiss` | 在 k-NN 查询子句外部。
评分脚本过滤器 | 搜索之前（预过滤） | 精确 | 不适用 | 在 script score 查询子句内部。

## 过滤搜索优化

根据你的数据集和用例，你可能更关注最大化召回率或最小化延迟。下表针对各种 k-NN 搜索配置，给出了为获得更高召回率或更低延迟而应使用的过滤方法。表的前三列列出了几个 k-NN 搜索配置示例。一个搜索配置包括：

- 索引中的文档数量，其中一个 OpenSearch 文档对应一个 k-NN 向量。
- 过滤后结果中剩余文档的百分比。该值取决于你在查询中提供的过滤器的限制程度。表中限制最强的过滤器返回索引中 2.5% 的文档，而限制最弱的过滤器返回 80% 的文档。
- 期望返回的结果数量（k）。

估算出索引中的文档数量、过滤器的限制程度以及期望的最近邻数量之后，可以使用下表选择针对召回率或延迟进行优化的过滤方法。

| 索引中的文档数量 | 过滤器返回的文档百分比 | k | 获得更高召回率应使用的过滤方法 | 获得更低延迟应使用的过滤方法 |
| :-- | :-- | :-- | :-- | :-- |
| 10M | 2.5 | 100 | 高效 k-NN 过滤/评分脚本 | 评分脚本 |
| 10M | 38 | 100 | 高效 k-NN 过滤 | 高效 k-NN 过滤 |
| 10M | 80 | 100 | 高效 k-NN 过滤 | 高效 k-NN 过滤 |
| 1M | 2.5 | 100 | 高效 k-NN 过滤/评分脚本 | 评分脚本 |
| 1M | 38 | 100 | 高效 k-NN 过滤 | 高效 k-NN 过滤 |
| 1M | 80 | 100 | 高效 k-NN 过滤 | 高效 k-NN 过滤 |

## 高效 k-NN 过滤

你可以使用 `lucene` 或 `faiss` 引擎执行高效 k-NN 过滤。

### Lucene k-NN 过滤器实现

k-NN 插件 2.2 版本开始支持使用 HNSW 图通过 Lucene 引擎运行 k-NN 搜索。从基于 Lucene 9.4 版本的 2.4 版本开始，你可以在 k-NN 搜索中使用 Lucene 过滤器。

当你为 k-NN 搜索指定 Lucene 过滤器时，Lucene 算法会决定是执行带预过滤的精确 k-NN 搜索，还是执行带改进后过滤的近似搜索。该算法使用以下变量：

- N：索引中的文档数量。
- P：应用过滤器后文档子集中的文档数量（P <= N）。
- k：响应中返回的最大向量数。

以下流程图概述了 Lucene 算法。

![用于过滤的 Lucene 算法](/images/lucene-algorithm.png)

有关 Lucene 过滤实现以及底层 `KnnVectorQuery` 的更多信息，请参阅 [Apache Lucene 文档](https://lucene.apache.org/core/9_2_0/core/org/apache/lucene/search/KnnVectorQuery.html)。

### 使用 Lucene k-NN 过滤器

假设有一个数据集，包含 12 个存放酒店信息的文档。下图按位置在 xy 坐标平面上显示了所有酒店。此外，评分在 8 到 10（含）之间的酒店用橙色点表示，提供停车场的酒店用绿色圆圈表示。搜索点用红色表示：

![包含过滤条件的文档图](/images/knn-doc-set-for-filtering.png)

在本示例中，你将创建一个索引，并搜索距离搜索位置最近、评分较高且提供停车场的三家酒店。

**第 1 步：创建新索引**

在运行带过滤器的 k-NN 搜索之前，需要创建一个包含 `knn_vector` 字段的索引。对于该字段，需要在映射中将引擎指定为 `lucene`，并将 `method` 指定为 `hnsw`。

以下请求创建一个名为 `hotels-index` 的新索引，其中包含一个名为 `location` 的 `knn-filter` 字段：

```json
PUT /hotels-index
{
  "settings": {
    "index": {
      "knn": true,
      "knn.algo_param.ef_search": 100,
      "number_of_shards": 1,
      "number_of_replicas": 0
    }
  },
  "mappings": {
    "properties": {
      "location": {
        "type": "knn_vector",
        "dimension": 2,
        "method": {
          "name": "hnsw",
          "space_type": "l2",
          "engine": "lucene",
          "parameters": {
            "ef_construction": 100,
            "m": 16
          }
        }
      }
    }
  }
}
```

**第 2 步：向索引添加数据**

接下来，向索引添加数据。

以下请求添加 12 个包含酒店位置、评分和停车场信息的文档：

```json
POST /_bulk
{ "index": { "_index": "hotels-index", "_id": "1" } }
{ "location": [5.2, 4.4], "parking" : "true", "rating" : 5 }
{ "index": { "_index": "hotels-index", "_id": "2" } }
{ "location": [5.2, 3.9], "parking" : "false", "rating" : 4 }
{ "index": { "_index": "hotels-index", "_id": "3" } }
{ "location": [4.9, 3.4], "parking" : "true", "rating" : 9 }
{ "index": { "_index": "hotels-index", "_id": "4" } }
{ "location": [4.2, 4.6], "parking" : "false", "rating" : 6}
{ "index": { "_index": "hotels-index", "_id": "5" } }
{ "location": [3.3, 4.5], "parking" : "true", "rating" : 8 }
{ "index": { "_index": "hotels-index", "_id": "6" } }
{ "location": [6.4, 3.4], "parking" : "true", "rating" : 9 }
{ "index": { "_index": "hotels-index", "_id": "7" } }
{ "location": [4.2, 6.2], "parking" : "true", "rating" : 5 }
{ "index": { "_index": "hotels-index", "_id": "8" } }
{ "location": [2.4, 4.0], "parking" : "true", "rating" : 8 }
{ "index": { "_index": "hotels-index", "_id": "9" } }
{ "location": [1.4, 3.2], "parking" : "false", "rating" : 5 }
{ "index": { "_index": "hotels-index", "_id": "10" } }
{ "location": [7.0, 9.9], "parking" : "true", "rating" : 9 }
{ "index": { "_index": "hotels-index", "_id": "11" } }
{ "location": [3.0, 2.3], "parking" : "false", "rating" : 6 }
{ "index": { "_index": "hotels-index", "_id": "12" } }
{ "location": [5.0, 1.0], "parking" : "true", "rating" : 3 }
```

**第 3 步：使用过滤器搜索数据**

现在可以创建带过滤器的 k-NN 搜索。在 k-NN 查询子句中，包含用于搜索最近邻的目标点、要返回的最近邻数量（`k`）以及包含限制条件的过滤器。根据你希望过滤器达到的限制程度，可以在单个请求中添加多个查询子句。

以下请求创建一个 k-NN 查询，搜索坐标 `[5, 4]` 附近评分在 8 到 10（含）之间且提供停车场的前三家酒店：

```json
POST /hotels-index/_search
{
  "size": 3,
  "query": {
    "knn": {
      "location": {
        "vector": [
          5,
          4
        ],
        "k": 3,
        "filter": {
          "bool": {
            "must": [
              {
                "range": {
                  "rating": {
                    "gte": 8,
                    "lte": 10
                  }
                }
              },
              {
                "term": {
                  "parking": "true"
                }
              }
            ]
          }
        }
      }
    }
  }
}
```

响应返回距离搜索点最近且满足过滤条件的三家酒店：

```json
{
  "took" : 47,
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
    "max_score" : 0.72992706,
    "hits" : [
      {
        "_index" : "hotels-index",
        "_id" : "3",
        "_score" : 0.72992706,
        "_source" : {
          "location" : [
            4.9,
            3.4
          ],
          "parking" : "true",
          "rating" : 9
        }
      },
      {
        "_index" : "hotels-index",
        "_id" : "6",
        "_score" : 0.3012048,
        "_source" : {
          "location" : [
            6.4,
            3.4
          ],
          "parking" : "true",
          "rating" : 9
        }
      },
      {
        "_index" : "hotels-index",
        "_id" : "5",
        "_score" : 0.24154587,
        "_source" : {
          "location" : [
            3.3,
            4.5
          ],
          "parking" : "true",
          "rating" : 8
        }
      }
    ]
  }
}
```

有关构造过滤器的更多方式，请参阅[构造过滤器](#constructing-a-filter)。

### Faiss k-NN 过滤器实现

对于 k-NN 搜索，你可以将 `faiss` 过滤器与 HNSW 算法（k-NN 插件 2.9 及更高版本）或 IVF 算法（k-NN 插件 2.10 及更高版本）结合使用。

当你为 k-NN 搜索指定 Faiss 过滤器时，Faiss 算法会决定是执行带预过滤的精确 k-NN 搜索，还是执行带改进后过滤的近似搜索。该算法使用以下变量：

- N：索引中的文档数量。
- P：应用过滤器后文档子集中的文档数量（P <= N）。
- k：响应中返回的最大向量数。
- R：执行过滤后的近似最近邻搜索之后返回的结果数量。
- FT（filtered threshold，过滤阈值）：在 [`knn.advanced.filtered_exact_search_threshold` 设置](/search-plugins/knn/settings)中定义的索引级阈值，用于指定何时切换到精确搜索。
- MDC（max distance computations，最大距离计算次数）：未设置 `FT`（过滤阈值）时，精确搜索中允许的最大距离计算次数。该值无法更改。

以下流程图概述了 Faiss 算法。

![用于过滤的 Faiss 算法](/images/faiss-algorithm.jpg)

### 使用 Faiss 高效过滤器

假设有一个索引，包含某个电子商务应用中各种衬衫的信息。你希望找到与你已有的衬衫相似且评分最高的衬衫，但希望按衬衫尺码限制结果。

在本示例中，你将创建一个索引，并搜索与你提供的衬衫相似的衬衫。

**第 1 步：创建新索引**

在运行带过滤器的 k-NN 搜索之前，需要创建一个包含 `knn_vector` 字段的索引。对于该字段，需要在映射中指定 `faiss`，并将 `method` 指定为 `hnsw`。

以下请求创建一个包含衬衫向量表示的索引：

```json
PUT /products-shirts
{
  "settings": {
    "index": {
      "knn": true
    }
  },
  "mappings": {
    "properties": {
      "item_vector": {
        "type": "knn_vector",
        "dimension": 3,
        "method": {
          "name": "hnsw",
          "space_type": "l2",
          "engine": "faiss"
        }
      }
    }
  }
}
```

**第 2 步：向索引添加数据**

接下来，向索引添加数据。

以下请求添加 12 个包含衬衫信息的文档，包括其向量表示、尺码和评分：

```json
POST /_bulk?refresh
{ "index": { "_index": "products-shirts", "_id": "1" } }
{ "item_vector": [5.2, 4.4, 8.4], "size" : "large", "rating" : 5 }
{ "index": { "_index": "products-shirts", "_id": "2" } }
{ "item_vector": [5.2, 3.9, 2.9], "size" : "small", "rating" : 4 }
{ "index": { "_index": "products-shirts", "_id": "3" } }
{ "item_vector": [4.9, 3.4, 2.2], "size" : "xlarge", "rating" : 9 }
{ "index": { "_index": "products-shirts", "_id": "4" } }
{ "item_vector": [4.2, 4.6, 5.5], "size" : "large", "rating" : 6}
{ "index": { "_index": "products-shirts", "_id": "5" } }
{ "item_vector": [3.3, 4.5, 8.8], "size" : "medium", "rating" : 8 }
{ "index": { "_index": "products-shirts", "_id": "6" } }
{ "item_vector": [6.4, 3.4, 6.6], "size" : "small", "rating" : 9 }
{ "index": { "_index": "products-shirts", "_id": "7" } }
{ "item_vector": [4.2, 6.2, 4.6], "size" : "small", "rating" : 5 }
{ "index": { "_index": "products-shirts", "_id": "8" } }
{ "item_vector": [2.4, 4.0, 3.0], "size" : "small", "rating" : 8 }
{ "index": { "_index": "products-shirts", "_id": "9" } }
{ "item_vector": [1.4, 3.2, 9.0], "size" : "small", "rating" : 5 }
{ "index": { "_index": "products-shirts", "_id": "10" } }
{ "item_vector": [7.0, 9.9, 9.0], "size" : "xlarge", "rating" : 9 }
{ "index": { "_index": "products-shirts", "_id": "11" } }
{ "item_vector": [3.0, 2.3, 2.0], "size" : "large", "rating" : 6 }
{ "index": { "_index": "products-shirts", "_id": "12" } }
{ "item_vector": [5.0, 1.0, 4.0], "size" : "large", "rating" : 3 }

```

**第 3 步：使用过滤器搜索数据**

现在可以创建带过滤器的 k-NN 搜索。在 k-NN 查询子句中，包含用于搜索相似衬衫的衬衫向量表示、要返回的最近邻数量（`k`），以及按尺码和评分进行过滤的过滤器。

以下请求搜索评分在 7 到 10（含）之间的 small 尺码衬衫：

```json
POST /products-shirts/_search
{
  "size": 2,
  "query": {
    "knn": {
      "item_vector": {
        "vector": [
          2, 4, 3
        ],
        "k": 10,
        "filter": {
          "bool": {
            "must": [
              {
                "range": {
                  "rating": {
                    "gte": 7,
                    "lte": 10
                  }
                }
              },
              {
                "term": {
                  "size": "small"
                }
              }
            ]
          }
        }
      }
    }
  }
}
```

响应返回两个匹配的文档：

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
      "value": 2,
      "relation": "eq"
    },
    "max_score": 0.8620689,
    "hits": [
      {
        "_index": "products-shirts",
        "_id": "8",
        "_score": 0.8620689,
        "_source": {
          "item_vector": [
            2.4,
            4,
            3
          ],
          "size": "small",
          "rating": 8
        }
      },
      {
        "_index": "products-shirts",
        "_id": "6",
        "_score": 0.029691212,
        "_source": {
          "item_vector": [
            6.4,
            3.4,
            6.6
          ],
          "size": "small",
          "rating": 9
        }
      }
    ]
  }
}
```

有关构造过滤器的更多方式，请参阅[构造过滤器](#constructing-a-filter)。

### 构造过滤器

对于同一条件，可以通过多种方式构造过滤器。例如，你可以使用以下结构创建一个返回提供停车场的酒店的过滤器：

- 在 `should` 子句中使用 `term` 查询子句
- 在 `should` 子句中使用 `wildcard` 查询子句
- 在 `should` 子句中使用 `regexp` 查询子句
- 使用 `must_not` 子句排除 `parking` 设置为 `false` 的酒店。

以下请求演示了搜索提供停车场的酒店的这四种不同方式：

```json
POST /hotels-index/_search
{
  "size": 3,
  "query": {
    "knn": {
      "location": {
        "vector": [ 5.0, 4.0 ],
        "k": 3,
        "filter": {
          "bool": {
            "must": {
              "range": {
                "rating": {
                  "gte": 1,
                  "lte": 6
                }
              }
            },
            "should": [
            {
              "term": {
                "parking": "true"
              }
            },
            {
              "wildcard": {
                "parking": {
                  "value": "t*e"
                }
              }
            },
            {
              "regexp": {
                "parking": "[a-zA-Z]rue"
              }
            }
            ],
            "must_not": [
            {
              "term": {
                  "parking": "false"
              }
            }
            ],
            "minimum_should_match": 1
          }
        }
      }
    }
  }
} 
```

## 后过滤

你可以使用布尔过滤器或通过提供 `post_filter` 参数来实现后过滤。

### 结合 ANN 搜索的布尔过滤器

布尔过滤器由一个包含 k-NN 查询和过滤器的布尔查询组成。例如，以下查询搜索距离指定 `location` 最近的酒店，然后对结果进行过滤，返回评分在 8 到 10（含）之间且提供停车场的酒店：

```json
POST /hotels-index/_search
{
  "size": 3,
  "query": {
    "bool": {
      "filter": {
        "bool": {
          "must": [
            {
              "range": {
                "rating": {
                  "gte": 8,
                  "lte": 10
                }
              }
            },
            {
              "term": {
                "parking": "true"
              }
            }
          ]
        }
      },
      "must": [
        {
          "knn": {
            "location": {
              "vector": [
                5,
                4
              ],
              "k": 20
            }
          }
        }
      ]
    }
  }
}
```

响应中包含匹配酒店的文档：

```json
{
  "took" : 95,
  "timed_out" : false,
  "_shards" : {
    "total" : 1,
    "successful" : 1,
    "skipped" : 0,
    "failed" : 0
  },
  "hits" : {
    "total" : {
      "value" : 5,
      "relation" : "eq"
    },
    "max_score" : 0.72992706,
    "hits" : [
      {
        "_index" : "hotels-index",
        "_id" : "3",
        "_score" : 0.72992706,
        "_source" : {
          "location" : [
            4.9,
            3.4
          ],
          "parking" : "true",
          "rating" : 9
        }
      },
      {
        "_index" : "hotels-index",
        "_id" : "6",
        "_score" : 0.3012048,
        "_source" : {
          "location" : [
            6.4,
            3.4
          ],
          "parking" : "true",
          "rating" : 9
        }
      },
      {
        "_index" : "hotels-index",
        "_id" : "5",
        "_score" : 0.24154587,
        "_source" : {
          "location" : [
            3.3,
            4.5
          ],
          "parking" : "true",
          "rating" : 8
        }
      }
    ]
  }
}
```

### post-filter 参数

如果将 `knn` 查询与过滤器或其他子句（例如 `bool`、`must`、`match`）一起使用，返回的结果可能少于 `k` 个。在本示例中，`post_filter` 将结果数量从 2 个减少到 1 个：

```json
GET my-knn-index-1/_search
{
  "size": 2,
  "query": {
    "knn": {
      "my_vector2": {
        "vector": [2, 3, 5, 6],
        "k": 2
      }
    }
  },
  "post_filter": {
    "range": {
      "price": {
        "gte": 5,
        "lte": 10
      }
    }
  }
}
```

## 评分脚本过滤器

评分脚本过滤器先过滤文档，然后对结果使用暴力精确 k-NN 搜索。例如，以下查询先搜索评分在 8 到 10（含）之间且提供停车场的酒店，然后执行 k-NN 搜索，返回距离指定 `location` 最近的 3 家酒店：

```json
POST /hotels-index/_search
{
  "size": 3,
  "query": {
    "script_score": {
      "query": {
        "bool": {
          "filter": {
            "bool": {
              "must": [
                {
                  "range": {
                    "rating": {
                      "gte": 8,
                      "lte": 10
                    }
                  }
                },
                {
                  "term": {
                    "parking": "true"
                  }
                }
              ]
            }
          }
        }
      },
      "script": {
        "source": "knn_score",
        "lang": "knn",
        "params": {
          "field": "location",
          "query_value": [
            5.0,
            4.0
          ],
          "space_type": "l2"
        }
      }
    }
  }
}
```
