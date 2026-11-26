---
title: 使用评分脚本的精确 k-NN
---

# 使用评分脚本的精确 k-NN

k-NN 插件实现了 OpenSearch 的评分脚本插件，你可以用它找出与给定查询点精确的 k 个最近邻。使用 k-NN 评分脚本，你可以在执行最近邻搜索之前先对索引应用过滤器。这对于索引内容可能因其他条件而变化的动态搜索场景非常有用。

由于评分脚本方法执行的是暴力搜索，它的可扩展性不如[近似方法](/search-plugins/knn/approximate-knn)。在某些情况下，最好考虑重构工作流或索引结构，以使用近似方法代替评分脚本方法。

## 针对向量使用评分脚本入门

与近似最近邻搜索类似，要在一组向量（Vector）上使用评分脚本，必须先创建一个包含一个或多个 `knn_vector` 字段的索引。

如果你只打算使用评分脚本方法（而不使用近似方法），可以将 `index.knn` 设置为 `false`，并且不设置 `index.knn.space_type`。你可以在搜索时选择空间类型。有关 k-NN 评分脚本支持的空间，请参阅[空间](#spaces)。

以下示例创建一个包含两个 `knn_vector` 字段的索引：

```json
PUT my-knn-index-1
{
  "mappings": {
    "properties": {
      "my_vector1": {
        "type": "knn_vector",
        "dimension": 2
      },
      "my_vector2": {
        "type": "knn_vector",
        "dimension": 4
      }
    }
  }
}
```

::: tip 提示
如果你*只*想使用评分脚本，可以省略 `"index.knn": true`。这种方式的好处是索引速度更快、内存占用更低，但你将无法在该索引上执行标准的 k-NN 查询。
:::

创建索引后，可以向其中添加一些数据：

```json
POST _bulk
{ "index": { "_index": "my-knn-index-1", "_id": "1" } }
{ "my_vector1": [1.5, 2.5], "price": 12.2 }
{ "index": { "_index": "my-knn-index-1", "_id": "2" } }
{ "my_vector1": [2.5, 3.5], "price": 7.1 }
{ "index": { "_index": "my-knn-index-1", "_id": "3" } }
{ "my_vector1": [3.5, 4.5], "price": 12.9 }
{ "index": { "_index": "my-knn-index-1", "_id": "4" } }
{ "my_vector1": [5.5, 6.5], "price": 1.2 }
{ "index": { "_index": "my-knn-index-1", "_id": "5" } }
{ "my_vector1": [4.5, 5.5], "price": 3.7 }
{ "index": { "_index": "my-knn-index-1", "_id": "6" } }
{ "my_vector2": [1.5, 5.5, 4.5, 6.4], "price": 10.3 }
{ "index": { "_index": "my-knn-index-1", "_id": "7" } }
{ "my_vector2": [2.5, 3.5, 5.6, 6.7], "price": 5.5 }
{ "index": { "_index": "my-knn-index-1", "_id": "8" } }
{ "my_vector2": [4.5, 5.5, 6.7, 3.7], "price": 4.4 }
{ "index": { "_index": "my-knn-index-1", "_id": "9" } }
{ "my_vector2": [1.5, 5.5, 4.5, 6.4], "price": 8.9 }

```

最后，可以使用 `knn` 脚本对数据执行精确最近邻搜索：
```json
GET my-knn-index-1/_search
{
 "size": 4,
 "query": {
   "script_score": {
     "query": {
       "match_all": {}
     },
     "script": {
       "source": "knn_score",
       "lang": "knn",
       "params": {
         "field": "my_vector2",
         "query_value": [2.0, 3.0, 5.0, 6.0],
         "space_type": "cosinesimil"
       }
     }
   }
 }
}
```

所有参数都是必需的。

- `lang` 是脚本类型。该值通常为 `painless`，但这里必须指定为 `knn`。
- `source` 是脚本的名称，即 `knn_score`。

  该脚本是 k-NN 插件的一部分，在标准的 `_scripts` 路径下不可用。向 `_cluster/state/metadata` 发送 GET 请求也不会返回它。

- `field` 是包含向量数据的字段。
- `query_value` 是你要查找其最近邻的点。对于欧氏空间和余弦相似度空间，该值必须是一个浮点数组，且与字段映射中设置的维度一致。对于汉明位距离（Hamming bit distance），该值可以是有符号 long 类型，也可以是 base64 编码的字符串（分别对应 long 和 binary 字段类型）。
- `space_type` 对应距离函数。请参阅[空间部分](#spaces)。

[近似方法中的后过滤示例](/search-plugins/knn/approximate-knn#using-approximate-k-nn-with-filters)展示了一个返回结果少于 `k` 个的搜索。如果你想避免这种情况，评分脚本方法实际上可以让你颠倒操作顺序。换句话说，你可以先过滤出要执行 k 最近邻搜索的文档集合。

以下示例展示了如何使用评分脚本方法对 k-NN 搜索进行预过滤。首先，创建索引：

```json
PUT my-knn-index-2
{
  "mappings": {
    "properties": {
      "my_vector": {
        "type": "knn_vector",
        "dimension": 2
      },
      "color": {
        "type": "keyword"
      }
    }
  }
}
```

然后添加一些文档：

```json
POST _bulk
{ "index": { "_index": "my-knn-index-2", "_id": "1" } }
{ "my_vector": [1, 1], "color" : "RED" }
{ "index": { "_index": "my-knn-index-2", "_id": "2" } }
{ "my_vector": [2, 2], "color" : "RED" }
{ "index": { "_index": "my-knn-index-2", "_id": "3" } }
{ "my_vector": [3, 3], "color" : "RED" }
{ "index": { "_index": "my-knn-index-2", "_id": "4" } }
{ "my_vector": [10, 10], "color" : "BLUE" }
{ "index": { "_index": "my-knn-index-2", "_id": "5" } }
{ "my_vector": [20, 20], "color" : "BLUE" }
{ "index": { "_index": "my-knn-index-2", "_id": "6" } }
{ "my_vector": [30, 30], "color" : "BLUE" }

```

最后，在确定最近邻之前，使用 `script_score` 查询对文档进行预过滤：

```json
GET my-knn-index-2/_search
{
  "size": 2,
  "query": {
    "script_score": {
      "query": {
        "bool": {
          "filter": {
            "term": {
              "color": "BLUE"
            }
          }
        }
      },
      "script": {
        "lang": "knn",
        "source": "knn_score",
        "params": {
          "field": "my_vector",
          "query_value": [9.9, 9.9],
          "space_type": "l2"
        }
      }
    }
  }
}
```

## 针对二进制数据使用评分脚本入门
k-NN 评分脚本还允许你使用汉明距离空间，在二进制数据上运行 k-NN 搜索。
要使用汉明距离，目标字段的字段类型必须是 `binary` 或 `long`。如果使用 `binary` 类型，数据必须是 base64 编码的字符串。

以下示例展示了如何对 `binary` 字段类型使用汉明距离空间：

```json
PUT my-index
{
  "mappings": {
    "properties": {
      "my_binary": {
        "type": "binary",
        "doc_values": true
      },
      "color": {
        "type": "keyword"
      }
    }
  }
}
```

然后添加一些文档：

```json
POST _bulk
{ "index": { "_index": "my-index", "_id": "1" } }
{ "my_binary": "SGVsbG8gV29ybGQh", "color" : "RED" }
{ "index": { "_index": "my-index", "_id": "2" } }
{ "my_binary": "ay1OTiBjdXN0b20gc2NvcmluZyE=", "color" : "RED" }
{ "index": { "_index": "my-index", "_id": "3" } }
{ "my_binary": "V2VsY29tZSB0byBrLU5O", "color" : "RED" }
{ "index": { "_index": "my-index", "_id": "4" } }
{ "my_binary": "SSBob3BlIHRoaXMgaXMgaGVscGZ1bA==", "color" : "BLUE" }
{ "index": { "_index": "my-index", "_id": "5" } }
{ "my_binary": "QSBjb3VwbGUgbW9yZSBkb2NzLi4u", "color" : "BLUE" }
{ "index": { "_index": "my-index", "_id": "6" } }
{ "my_binary":  "TGFzdCBvbmUh", "color" : "BLUE" }

```

最后，在确定最近邻之前，使用 `script_score` 查询对文档进行预过滤：

```json
GET my-index/_search
{
  "size": 2,
  "query": {
    "script_score": {
      "query": {
        "bool": {
          "filter": {
            "term": {
              "color": "BLUE"
            }
          }
        }
      },
      "script": {
        "lang": "knn",
        "source": "knn_score",
        "params": {
          "field": "my_binary",
          "query_value": "U29tZXRoaW5nIEltIGxvb2tpbmcgZm9y",
          "space_type": "hammingbit"
        }
      }
    }
  }
}
```

同样，你也可以使用 `long` 字段对数据进行编码并运行搜索：

```json
GET my-long-index/_search
{
  "size": 2,
  "query": {
    "script_score": {
      "query": {
        "bool": {
          "filter": {
            "term": {
              "color": "BLUE"
            }
          }
        }
      },
      "script": {
        "lang": "knn",
        "source": "knn_score",
        "params": {
          "field": "my_long",
          "query_value": 23,
          "space_type": "hammingbit"
        }
      }
    }
  }
}
```

## 空间

空间对应用于度量两点之间距离的函数，以确定 k 个最近邻。从 k-NN 的角度来看，评分越低，表示结果越近、越好。这与 OpenSearch 的评分方式相反：在 OpenSearch 中，评分越高表示结果越好。下表说明了 OpenSearch 如何将空间转换为评分：

<table>
  <thead style="text-align: center">
  <tr>
    <th>spaceType</th>
    <th>距离函数 (d)</th>
    <th>OpenSearch 评分</th>
  </tr>
  </thead>
  <tr>
    <td>l1</td>
    <td>\[ d(\mathbf{x}, \mathbf{y}) = \sum_{i=1}^n |x_i - y_i| \]</td>
    <td>\[ score = {1 \over 1 + d } \]</td>
  </tr>
  <tr>
    <td>l2</td>
    <td>\[ d(\mathbf{x}, \mathbf{y}) = \sum_{i=1}^n (x_i - y_i)^2 \]</td>
    <td>\[ score = {1 \over 1 + d } \]</td>
  </tr>
  <tr>
    <td>linf</td>
    <td>\[ d(\mathbf{x}, \mathbf{y}) = max(|x_i - y_i|) \]</td>
    <td>\[ score = {1 \over 1 + d } \]</td>
  </tr>
  <tr>
    <td>cosinesimil</td>
    <td>\[ d(\mathbf{x}, \mathbf{y}) = 1 - cos { \theta } = 1 - {\mathbf{x} &middot; \mathbf{y} \over \|\mathbf{x}\| &middot; \|\mathbf{y}\|}\]\[ = 1 - 
    {\sum_{i=1}^n x_i y_i \over \sqrt{\sum_{i=1}^n x_i^2} &middot; \sqrt{\sum_{i=1}^n y_i^2}}\]
    其中 \(\|\mathbf{x}\|\) 和 \(\|\mathbf{y}\|\) 分别表示向量 x 和 y 的范数。</td>
    <td>\[ score = 2 - d \]</td>
  </tr>
  <tr>
    <td>innerproduct（Lucene 不支持）</td>
    <td>\[ d(\mathbf{x}, \mathbf{y}) = - {\mathbf{x} &middot; \mathbf{y}} = - \sum_{i=1}^n x_i y_i \]</td>
    <td>\[ \text{If} d \ge 0, \] \[score = {1 \over 1 + d }\] \[\text{If} d < 0, score = &minus;d + 1\]</td>
  </tr>
  <tr>
    <td>hammingbit</td>
    <td>\[ d(\mathbf{x}, \mathbf{y}) = \text{countSetBits}(\mathbf{x} \oplus \mathbf{y})\]</td>
    <td>\[ score = {1 \over 1 + d } \]</td>
  </tr>
</table>

余弦相似度返回一个介于 -1 和 1 之间的数值，而由于 OpenSearch 的相关性评分（Relevance Score）不能低于 0，k-NN 插件会加上 1 来得到最终评分。
