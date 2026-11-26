---
title: 使用嵌套字段的 k-NN 搜索
---

# 使用嵌套字段的 k-NN 搜索

在 k 最近邻（k-NN）索引中使用[嵌套字段](/field-types/supported-field-types/nested)，可以在单个文档中存储多个向量（Vector）。例如，如果文档由多个组成部分构成，你可以为每个组成部分生成一个向量值，并将每个向量存储在嵌套字段中。

k-NN 文档搜索在字段级别进行。对于包含嵌套字段的文档，OpenSearch 只检查与查询向量最近的那个向量，以决定是否将该文档纳入结果。例如，假设一个索引包含文档 `A` 和 `B`。文档 `A` 由向量 `A1` 和 `A2` 表示，文档 `B` 由向量 `B1` 表示。此外，对于查询 Q，相似度顺序为 `A1`、`A2`、`B1`。如果使用查询 Q 并将 k 值设为 2 进行搜索，搜索将同时返回文档 `A` 和 `B`，而不是只返回文档 `A`。

请注意，在近似搜索的情况下，结果是近似值，而不是精确匹配。

Lucene 和 Faiss 引擎的 HNSW 算法支持使用嵌套字段的 k-NN 搜索。

## 索引和搜索嵌套字段

要对嵌套字段使用 k-NN 搜索，必须将 `index.knn` 设置为 `true` 来创建 k-NN 索引。将字段的 `type` 设置为 `nested` 即可创建嵌套字段，并在嵌套字段中指定一个或多个 `knn_vector` 数据类型（data type）的字段。在本例中，`knn_vector` 字段 `my_vector` 嵌套在 `nested_field` 字段中：

```json
PUT my-knn-index-1
{
  "settings": {
    "index": {
      "knn": true
    }
  },
  "mappings": {
    "properties": {
      "nested_field": {
        "type": "nested",
        "properties": {
          "my_vector": {
            "type": "knn_vector",
            "dimension": 3,
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
  }
}
```

创建索引后，向其中添加一些数据：

```json
PUT _bulk?refresh=true
{ "index": { "_index": "my-knn-index-1", "_id": "1" } }
{"nested_field":[{"my_vector":[1,1,1]},{"my_vector":[2,2,2]},{"my_vector":[3,3,3]}]}
{ "index": { "_index": "my-knn-index-1", "_id": "2" } }
{"nested_field":[{"my_vector":[10,10,10]},{"my_vector":[20,20,20]},{"my_vector":[30,30,30]}]}
```

然后使用 `knn` 查询类型对数据运行 k-NN 搜索：

```json
GET my-knn-index-1/_search
{
  "query": {
    "nested": {
      "path": "nested_field",
      "query": {
        "knn": {
          "nested_field.my_vector": {
            "vector": [1,1,1],
            "k": 2
          }
        }
      }
    }
  }
}
```

尽管与查询向量最近的三个向量都在文档 1 中，但由于 k 设置为 2，查询会同时返回文档 1 和 2：

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
      "value": 2,
      "relation": "eq"
    },
    "max_score": 1,
    "hits": [
      {
        "_index": "my-knn-index-1",
        "_id": "1",
        "_score": 1,
        "_source": {
          "nested_field": [
            {
              "my_vector": [
                1,
                1,
                1
              ]
            },
            {
              "my_vector": [
                2,
                2,
                2
              ]
            },
            {
              "my_vector": [
                3,
                3,
                3
              ]
            }
          ]
        }
      },
      {
        "_index": "my-knn-index-1",
        "_id": "2",
        "_score": 0.0040983604,
        "_source": {
          "nested_field": [
            {
              "my_vector": [
                10,
                10,
                10
              ]
            },
            {
              "my_vector": [
                20,
                20,
                20
              ]
            },
            {
              "my_vector": [
                30,
                30,
                30
              ]
            }
          ]
        }
      }
    ]
  }
}
```

## 对嵌套字段进行带过滤的 k-NN 搜索

你可以对使用嵌套字段的 k-NN 搜索应用过滤器。过滤器既可以应用于顶层字段，也可以应用于嵌套字段内部的字段。

以下示例对顶层字段应用过滤器。

首先，创建一个包含嵌套字段的 k-NN 索引：

```json
PUT my-knn-index-1
{
  "settings": {
    "index": {
      "knn": true
    }
  },
  "mappings": {
    "properties": {
      "nested_field": {
        "type": "nested",
        "properties": {
          "my_vector": {
            "type": "knn_vector",
            "dimension": 3,
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
  }
}
```

创建索引后，向其中添加一些数据：

```json
PUT _bulk?refresh=true
{ "index": { "_index": "my-knn-index-1", "_id": "1" } }
{"parking": false, "nested_field":[{"my_vector":[1,1,1]},{"my_vector":[2,2,2]},{"my_vector":[3,3,3]}]}
{ "index": { "_index": "my-knn-index-1", "_id": "2" } }
{"parking": true, "nested_field":[{"my_vector":[10,10,10]},{"my_vector":[20,20,20]},{"my_vector":[30,30,30]}]}
{ "index": { "_index": "my-knn-index-1", "_id": "3" } }
{"parking": true, "nested_field":[{"my_vector":[100,100,100]},{"my_vector":[200,200,200]},{"my_vector":[300,300,300]}]}
```

然后使用带过滤器的 `knn` 查询类型对数据运行 k-NN 搜索。以下查询返回 `parking` 字段设置为 `true` 的文档：

```json
GET my-knn-index-1/_search
{
  "query": {
    "nested": {
      "path": "nested_field",
      "query": {
        "knn": {
          "nested_field.my_vector": {
            "vector": [
              1,
              1,
              1
            ],
            "k": 3,
            "filter": {
              "term": {
                "parking": true
              }
            }
          }
        }
      }
    }
  }
}
```

尽管与查询向量最近的三个向量都在文档 1 中，但由于文档 1 被过滤掉了，查询返回的是文档 2 和 3：

```json
{
  "took": 10,
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
    "max_score": 0.0040983604,
    "hits": [
      {
        "_index": "my-knn-index-1",
        "_id": "2",
        "_score": 0.0040983604,
        "_source": {
          "parking": true,
          "nested_field": [
            {
              "my_vector": [
                10,
                10,
                10
              ]
            },
            {
              "my_vector": [
                20,
                20,
                20
              ]
            },
            {
              "my_vector": [
                30,
                30,
                30
              ]
            }
          ]
        }
      },
      {
        "_index": "my-knn-index-1",
        "_id": "3",
        "_score": 3.400898E-5,
        "_source": {
          "parking": true,
          "nested_field": [
            {
              "my_vector": [
                100,
                100,
                100
              ]
            },
            {
              "my_vector": [
                200,
                200,
                200
              ]
            },
            {
              "my_vector": [
                300,
                300,
                300
              ]
            }
          ]
        }
      }
    ]
  }
}
```
